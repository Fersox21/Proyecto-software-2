import { pool } from '../../config/db.js';

// Consulta base: cada lote con su producto, su orden de compra y el proveedor
// de esa orden. Evita que el frontend tenga que pedir una orden por cada lote.
const SQL_DETALLE = `
  SELECT l.id, l.cantidad, l.fecha_arribo, l.fecha_vencimiento, l.activo,
         p.id AS producto_id, p.nombre AS producto_nombre, p.marca AS producto_marca,
         p.categoria AS producto_categoria, p.peso AS producto_peso, p.stock AS producto_stock,
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
    fechaArribo: row.fecha_arribo,
    fechaVencimiento: row.fecha_vencimiento,
    activo: row.activo,
    producto: {
      id: row.producto_id,
      nombre: row.producto_nombre,
      marca: row.producto_marca,
      categoria: row.producto_categoria,
      peso: row.peso ?? row.producto_peso,
      stock: row.producto_stock,
      precioCosto: row.producto_precio_costo,
      precioVenta: row.producto_precio_venta,
      enPromocion: row.producto_en_promocion,
      precioPromo: row.producto_precio_promo,
      destacado: row.producto_destacado
    },
    ordenCompra
  };
};

export const findAll = async () => {
  const { rows } = await pool.query(`${SQL_DETALLE} ORDER BY l.fecha_vencimiento ASC, l.id ASC`);
  return rows.map(mapearLoteConDetalle);
};

export const findById = async (id) => {
  const { rows } = await pool.query(`${SQL_DETALLE} WHERE l.id = $1`, [id]);
  return mapearLoteConDetalle(rows[0]);
};

export const create = async (data) => {
  const { cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto } = data;
  const { rows } = await pool.query(
    `INSERT INTO lotes (cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING id`,
    [cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto]
  );
  return await findById(rows[0].id);
};

export const update = async (id, data) => {
  const { cantidad, fechaArribo, fechaVencimiento } = data;
  await pool.query(
    `UPDATE lotes
    SET cantidad = $1, fecha_arribo = $2, fecha_vencimiento = $3
    WHERE id = $4`,
    [cantidad, fechaArribo, fechaVencimiento, id]
  );
  return await findById(id);
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
  const { rowCount } = await pool.query('UPDATE lotes SET activo = false WHERE id = $1', [id]);
  return rowCount;
};
