import { pool } from '../../config/db.js';
import { normalizarProducto } from '../productos/productos.precio.js';
import * as productosRepo from '../productos/productos.repository.js';
import { crearError } from '../../utils/validaciones.js';

const construirSqlDetalle = (tieneCantidadInicial) => `
  SELECT l.id, l.cantidad, ${tieneCantidadInicial ? 'l.cantidad_inicial' : 'l.cantidad AS cantidad_inicial'}, l.total, l.fecha_arribo, l.fecha_vencimiento, l.activo,
         (SELECT COUNT(*) FROM lotes l2 WHERE l2.orden_compra_id = l.orden_compra_id AND l2.activo = true)::int AS total_lotes_orden,
         p.id AS producto_id, p.nombre AS producto_nombre, p.marca AS producto_marca,
         p.activo AS producto_activo,
         p.categoria AS producto_categoria,
         COALESCE((
           SELECT SUM(lv.cantidad)
           FROM lotes lv
           WHERE lv.producto_id = p.id
             AND lv.activo = true
             AND lv.fecha_vencimiento >= CURRENT_DATE
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

const normalizarFechaISO = (valor) => {
  if (valor == null) return '';
  if (valor instanceof Date) {
    const anio = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
  return String(valor).slice(0, 10);
};

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

export const crearLotesRepository = (dbPool = pool, productosRepository = productosRepo) => {
  let capacidadesCache = null;

  const obtenerCapacidades = async (executor = dbPool) => {
    if (capacidadesCache) return capacidadesCache;
    const { rows } = await executor.query(`
      SELECT
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'lotes' AND column_name = 'cantidad_inicial'
        ) AS tiene_cantidad_inicial,
        to_regclass('public.pedido_lotes') IS NOT NULL AS tiene_pedido_lotes
    `);
    capacidadesCache = {
      tieneCantidadInicial: Boolean(rows[0]?.tiene_cantidad_inicial),
      tienePedidoLotes: Boolean(rows[0]?.tiene_pedido_lotes)
    };
    return capacidadesCache;
  };

  const findAll = async () => {
    const { tieneCantidadInicial } = await obtenerCapacidades();
    const { rows } = await dbPool.query(
      `${construirSqlDetalle(tieneCantidadInicial)} WHERE l.activo = true AND l.cantidad > 0 AND p.activo = true ORDER BY l.fecha_vencimiento ASC, l.id ASC`
    );
    return rows.map(mapearLoteConDetalle);
  };

  const findHistorial = async () => {
    const { tieneCantidadInicial, tienePedidoLotes } = await obtenerCapacidades();
    const { rows } = await dbPool.query(`${construirSqlDetalle(tieneCantidadInicial)} ORDER BY l.id DESC`);

    let salidasRows = [];
    if (tienePedidoLotes) {
      const resultadoSalidas = await dbPool.query(`
        SELECT pl.lote_id, pl.pedido_id, pl.cantidad, pl.consumido_entero,
               ped.fecha AS pedido_fecha, ped.comercio AS pedido_comercio, ped.estado AS pedido_estado
        FROM pedido_lotes pl
        JOIN pedidos ped ON ped.id = pl.pedido_id
        ORDER BY pl.id ASC
      `);
      salidasRows = resultadoSalidas.rows;
    }

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

    const hoyISO = normalizarFechaISO(new Date());

    return rows.map((row) => {
      const lote = mapearLoteConDetalle(row);
      const fVenci = normalizarFechaISO(lote.fechaVencimiento);
      let situacion = 'vigente';
      if (lote.activo === false) {
        situacion = 'eliminado';
      } else if (Number(lote.cantidad) === 0) {
        situacion = 'agotado';
      } else if (fVenci && fVenci < hoyISO) {
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

  const findById = async (id) => {
    const { tieneCantidadInicial } = await obtenerCapacidades();
    const { rows } = await dbPool.query(
      `${construirSqlDetalle(tieneCantidadInicial)} WHERE l.id = $1 AND l.activo = true`,
      [id]
    );
    return mapearLoteConDetalle(rows[0]);
  };

  const create = async (data) => {
    const { cantidad, total, fechaArribo, fechaVencimiento, ordenCompra, producto } = data;
    const { tieneCantidadInicial } = await obtenerCapacidades();
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = tieneCantidadInicial
        ? await client.query(
            `INSERT INTO lotes (cantidad_inicial, cantidad, total, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
            VALUES ($1, $1, $2, $3, $4, $5, $6, true)
            RETURNING id`,
            [cantidad, total, fechaArribo, fechaVencimiento, ordenCompra, producto]
          )
        : await client.query(
            `INSERT INTO lotes (cantidad, total, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id`,
            [cantidad, total, fechaArribo, fechaVencimiento, ordenCompra, producto]
          );
      await productosRepository.recalcularStock(producto, client);
      await client.query('COMMIT');
      return await findById(rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const update = async (id, data) => {
    const { cantidad, total, fechaArribo, fechaVencimiento } = data;
    const { tieneCantidadInicial } = await obtenerCapacidades();
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');
      const selectCols = tieneCantidadInicial
        ? 'cantidad, cantidad_inicial, producto_id'
        : 'cantidad, producto_id';
      const { rows: loteRows } = await client.query(
        `SELECT ${selectCols} FROM lotes WHERE id = $1 AND activo = true FOR UPDATE`,
        [id]
      );
      if (loteRows.length === 0) {
        throw crearError('Lote no encontrado', 404);
      }
      const { cantidad: cantidadAnterior, cantidad_inicial: cantidadInicial, producto_id: productoId } = loteRows[0];

      if (tieneCantidadInicial && cantidad !== undefined && Number(cantidad) !== Number(cantidadAnterior)) {
        if (Number(cantidadAnterior) < Number(cantidadInicial)) {
          throw crearError('No se puede modificar la cantidad de un lote que ya registró ventas o salidas', 409);
        }
      }

      if (tieneCantidadInicial) {
        await client.query(
          `UPDATE lotes
          SET cantidad = $1, cantidad_inicial = $1, total = $2, fecha_arribo = $3, fecha_vencimiento = $4
          WHERE id = $5 AND activo = true`,
          [cantidad, total, fechaArribo, fechaVencimiento, id]
        );
      } else {
        await client.query(
          `UPDATE lotes
          SET cantidad = $1, total = $2, fecha_arribo = $3, fecha_vencimiento = $4
          WHERE id = $5 AND activo = true`,
          [cantidad, total, fechaArribo, fechaVencimiento, id]
        );
      }

      await productosRepository.recalcularStock(productoId, client);

      await client.query('COMMIT');
      return await findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const updateFechaVencimiento = async (id, fechaVencimiento) => {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'SELECT producto_id FROM lotes WHERE id = $1 AND activo = true FOR UPDATE',
        [id]
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const { rowCount } = await client.query(
        'UPDATE lotes SET fecha_vencimiento = $1 WHERE id = $2 AND activo = true',
        [fechaVencimiento, id]
      );
      await productosRepository.recalcularStock(rows[0].producto_id, client);
      await client.query('COMMIT');
      return rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const remove = async (id) => {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');
      const { rows, rowCount } = await client.query(
        'UPDATE lotes SET activo = false WHERE id = $1 AND activo = true RETURNING producto_id, cantidad',
        [id]
      );
      if (rowCount > 0) {
        await productosRepository.recalcularStock(rows[0].producto_id, client);
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

  const removeSiNoEsElUltimoLote = async (id) => {
    const client = await dbPool.connect();
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
        await productosRepository.recalcularStock(rows[0].producto_id, client);
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

  return {
    findAll,
    findHistorial,
    findById,
    create,
    update,
    updateFechaVencimiento,
    remove,
    removeSiNoEsElUltimoLote
  };
};

const defaultRepository = crearLotesRepository();

export const findAll = defaultRepository.findAll;
export const findHistorial = defaultRepository.findHistorial;
export const findById = defaultRepository.findById;
export const create = defaultRepository.create;
export const update = defaultRepository.update;
export const updateFechaVencimiento = defaultRepository.updateFechaVencimiento;
export const remove = defaultRepository.remove;
export const removeSiNoEsElUltimoLote = defaultRepository.removeSiNoEsElUltimoLote;
