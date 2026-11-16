import { pool } from '../../config/db.js';
import { normalizarProducto } from '../productos/productos.precio.js';
import * as productosRepo from '../productos/productos.repository.js';

// Consulta base: cada lote con su producto, su orden de compra y el proveedor
// de esa orden. Evita que el frontend tenga que pedir una orden por cada lote.
const SQL_DETALLE = `
  SELECT l.id, l.cantidad, l.total, l.fecha_arribo, l.fecha_vencimiento, l.activo,
         p.id AS producto_id, p.nombre AS producto_nombre, p.marca AS producto_marca,
         p.categoria AS producto_categoria, p.stock AS producto_stock,
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
    total: row.total != null ? Number(row.total) : null,
    fechaArribo: row.fecha_arribo,
    fechaVencimiento: row.fecha_vencimiento,
    activo: row.activo,
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
      destacado: row.producto_destacado
    }),
    ordenCompra
  };
};

export const findAll = async () => {
  const { rows } = await pool.query(
    `${SQL_DETALLE} WHERE l.activo = true ORDER BY l.fecha_vencimiento ASC, l.id ASC`
  );
  return rows.map(mapearLoteConDetalle);
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
      `INSERT INTO lotes (cantidad, total, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id`,
      [cantidad, total, fechaArribo, fechaVencimiento, ordenCompra, producto]
    );
    await productosRepo.ajustarStock(producto, cantidad, client);
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
      'SELECT cantidad, producto_id FROM lotes WHERE id = $1 AND activo = true FOR UPDATE',
      [id]
    );
    if (loteRows.length === 0) {
      const error = new Error('Lote no encontrado');
      error.status = 404;
      throw error;
    }
    const { cantidad: cantidadAnterior, producto_id: productoId } = loteRows[0];

    await client.query(
      `UPDATE lotes
      SET cantidad = $1, total = $2, fecha_arribo = $3, fecha_vencimiento = $4
      WHERE id = $5`,
      [cantidad, total, fechaArribo, fechaVencimiento, id]
    );

    const diferencia = Number(cantidad) - Number(cantidadAnterior);
    if (diferencia !== 0) {
      await productosRepo.ajustarStock(productoId, diferencia, client);
    }

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
  const { rowCount } = await pool.query(
    'UPDATE lotes SET fecha_vencimiento = $1 WHERE id = $2',
    [fechaVencimiento, id]
  );
  return rowCount > 0;
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
      await productosRepo.ajustarStock(rows[0].producto_id, -rows[0].cantidad, client);
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
      await productosRepo.ajustarStock(rows[0].producto_id, -rows[0].cantidad, client);
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
