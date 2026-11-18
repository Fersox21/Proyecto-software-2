import { pool } from '../../config/db.js';
import { normalizarProducto } from '../productos/productos.precio.js';
import * as productosRepo from '../productos/productos.repository.js';

// Consulta base: cada lote con su producto, su orden de compra y el proveedor
// de esa orden. Evita que el frontend tenga que pedir una orden por cada lote.
const SQL_DETALLE = `
  SELECT l.id, l.cantidad, l.cantidad_inicial, l.total, l.fecha_arribo, l.fecha_vencimiento, l.activo,
         (l.fecha_vencimiento < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires')::date) AS esta_vencido,
         (SELECT COUNT(*) FROM lotes l2 WHERE l2.orden_compra_id = l.orden_compra_id AND l2.activo = true)::int AS total_lotes_orden,
         p.id AS producto_id, p.nombre AS producto_nombre, p.marca AS producto_marca,
         p.activo AS producto_activo,
         p.categoria AS producto_categoria,
         COALESCE((
           SELECT SUM(lv.cantidad)
           FROM lotes lv
           WHERE lv.producto_id = p.id
             AND lv.activo = true
             AND lv.fecha_vencimiento >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
         ), 0)::int AS producto_stock,
         p.precio_costo AS producto_precio_costo, p.precio_venta AS producto_precio_venta,
         p.en_promocion AS producto_en_promocion, p.precio_promo AS producto_precio_promo,
         p.destacado AS producto_destacado,
         oc.id AS orden_id, oc.total AS orden_total,
         oc.fecha AS orden_fecha,
         pr.id AS proveedor_id, pr.nombre AS proveedor_nombre, pr.telefono AS proveedor_telefono
  FROM lotes l
  JOIN productos p ON p.id = l.producto_id
  JOIN ordenes_compra oc ON oc.id = l.orden_compra_id
  LEFT JOIN proveedores pr ON pr.id = oc.proveedor_id
`;

const mapearLoteConDetalle = (row) => {
  if (!row) return null;

  const ordenCompra = {
    id: row.orden_id,
    total: row.orden_total,
    fecha: row.orden_fecha,
    proveedor: null
  };

  if (row.proveedor_id != null) {
    ordenCompra.proveedor = {
      id: row.proveedor_id,
      nombre: row.proveedor_nombre,
      telefono: row.proveedor_telefono
    };
  }

  return {
    id: row.id,
    cantidad: row.cantidad,
    cantidadInicial: row.cantidad_inicial != null ? row.cantidad_inicial : row.cantidad,
    total: row.total != null ? Number(row.total) : null,
    fechaArribo: row.fecha_arribo,
    fechaVencimiento: row.fecha_vencimiento,
    activo: row.activo,
    totalLotesOrden: row.total_lotes_orden != null ? Number(row.total_lotes_orden) : null,
    producto: normalizarProducto({
      id: row.producto_id,
      nombre: row.producto_nombre,
      marca: row.producto_marca,
      categoria: row.producto_categoria,
      stock: row.producto_stock,
      precioCosto: row.producto_precio_costo,
      precioVenta: row.producto_precio_venta,
      enPromocion: row.producto_en_promocion,
      precioPromo: row.producto_precio_promo,
      destacado: row.producto_destacado,
      activo: row.producto_activo !== false
    }),
    ordenCompra
  };
};

export const findAll = async ({ soloVigentes = false } = {}) => {
  const filtroVigentes = soloVigentes ? 'AND l.fecha_vencimiento >= CURRENT_DATE' : '';
  const { rows } = await pool.query(
    `${SQL_DETALLE} WHERE l.activo = true AND l.cantidad > 0 AND p.activo = true ${filtroVigentes} ORDER BY l.fecha_vencimiento ASC, l.id ASC`
  );
  return rows.map(mapearLoteConDetalle);
};

export const findHistorial = async () => {
  const { rows } = await pool.query(
    `${SQL_DETALLE} ORDER BY l.id DESC`
  );

  const { rows: salidasRows } = await pool.query(`
    SELECT pl.lote_id, pl.pedido_id, pl.cantidad, pl.consumido_entero,
           ped.fecha AS pedido_fecha, ped.comercio AS pedido_comercio, ped.estado AS pedido_estado
    FROM pedido_lotes pl
    JOIN pedidos ped ON ped.id = pl.pedido_id
    ORDER BY pl.id ASC
  `);

  const salidasPorLote = new Map();
  for (const s of salidasRows) {
    const idLote = Number(s.lote_id);
    if (!salidasPorLote.has(idLote)) salidasPorLote.set(idLote, []);
    salidasPorLote.get(idLote).push({
      pedidoId: s.pedido_id,
      fecha: s.pedido_fecha,
      comercio: s.pedido_comercio,
      estado: s.pedido_estado,
      cantidad: Number(s.cantidad),
      consumidoEntero: Boolean(s.consumido_entero),
    });
  }

  return rows.map((row) => {
    const lote = mapearLoteConDetalle(row);
    let situacion = 'vigente';
    if (lote.activo === false) {
      situacion = 'eliminado';
    } else if (Number(lote.cantidad) === 0) {
      situacion = 'agotado';
    } else if (row.esta_vencido) {
      situacion = 'vencido';
    }

    return {
      ...lote,
      situacion,
      eliminado: lote.activo === false,
      salidas: salidasPorLote.get(Number(lote.id)) ?? [],
    };
  });
};

export const findById = async (id) => {
  const { rows } = await pool.query(`${SQL_DETALLE} WHERE l.id = $1 AND l.activo = true`, [id]);
  return mapearLoteConDetalle(rows[0]);
};

export const create = async (data) => {
  const { cantidad, total, fechaArribo, fechaVencimiento, ordenCompra, producto } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO lotes (cantidad_inicial, cantidad, total, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
      VALUES ($1, $1, $2, $3, $4, $5, $6, true)
      RETURNING id`,
      [cantidad, total, fechaArribo, fechaVencimiento, ordenCompra, producto]
    );
    await productosRepo.recalcularStock(producto, client);
    await client.query('COMMIT');
    return await findById(rows[0].id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const update = async (id, data) => {
  const { cantidad, total, fechaArribo, fechaVencimiento } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: loteRows } = await client.query(
      'SELECT cantidad, cantidad_inicial, producto_id FROM lotes WHERE id = $1 AND activo = true FOR UPDATE',
      [id]
    );
    if (loteRows.length === 0) {
      const error = new Error('Lote no encontrado');
      error.status = 404;
      throw error;
    }
    const { cantidad: cantidadAnterior, cantidad_inicial: cantidadInicial, producto_id: productoId } = loteRows[0];

    if (cantidad !== undefined && Number(cantidad) !== Number(cantidadAnterior)) {
      if (Number(cantidadAnterior) < Number(cantidadInicial)) {
        const error = new Error('No se puede modificar la cantidad de un lote que ya registró ventas o salidas');
        error.status = 409;
        throw error;
      }
    }

    await client.query(
      `UPDATE lotes
      SET cantidad = $1,
          cantidad_inicial = CASE WHEN cantidad = cantidad_inicial THEN $1 ELSE cantidad_inicial END,
          total = $2,
          fecha_arribo = $3,
          fecha_vencimiento = $4
      WHERE id = $5 AND activo = true`,
      [cantidad, total, fechaArribo, fechaVencimiento, id]
    );

    await productosRepo.recalcularStock(productoId, client);

    await client.query('COMMIT');
    return await findById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Actualiza únicamente la fecha de vencimiento, sin reemplazar el lote ni
// tocar sus demás columnas.
export const updateFechaVencimiento = async (id, fechaVencimiento) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows, rowCount } = await client.query(
      'UPDATE lotes SET fecha_vencimiento = $1 WHERE id = $2 RETURNING producto_id',
      [fechaVencimiento, id]
    );
    if (rowCount > 0) {
      await productosRepo.recalcularStock(rows[0].producto_id, client);
    }
    await client.query('COMMIT');
    return rowCount > 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows, rowCount } = await client.query(
      'UPDATE lotes SET activo = false WHERE id = $1 AND activo = true RETURNING producto_id, cantidad',
      [id]
    );
    if (rowCount > 0) {
      await productosRepo.recalcularStock(rows[0].producto_id, client);
    }
    await client.query('COMMIT');
    return rowCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const removeSiNoEsElUltimoLote = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: checkRows } = await client.query(
      'SELECT cantidad, cantidad_inicial FROM lotes WHERE id = $1 AND activo = true FOR UPDATE',
      [id]
    );
    if (checkRows.length > 0 && Number(checkRows[0].cantidad) < Number(checkRows[0].cantidad_inicial)) {
      const error = new Error('No se puede dar de baja un lote que ya registró ventas o salidas');
      error.status = 409;
      throw error;
    }

    const { rows, rowCount } = await client.query(
      `UPDATE lotes
      SET activo = false
      WHERE id = $1
        AND activo = true
        AND (
          orden_compra_id IS NULL
          OR (
            SELECT COUNT(*) FROM lotes l2
            WHERE l2.orden_compra_id = lotes.orden_compra_id AND l2.activo = true
          ) > 1
        )
      RETURNING producto_id, cantidad`,
      [id]
    );
    if (rowCount > 0) {
      await productosRepo.recalcularStock(rows[0].producto_id, client);
    }
    await client.query('COMMIT');
    return rowCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
