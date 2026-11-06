import { pool } from '../../config/db.js';

const mapearLote = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        fechaArribo: row.fecha_arribo,
        fechaVencimiento: row.fecha_vencimiento,
        activo: row.activo,
        cantidad: row.cantidad,
        ordenCompra: row.orden_compra,
        producto: row.producto
    };
};

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM lotes ORDER BY activo DESC, fecha_arribo ASC');
  return rows.map(mapearLote);
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM lotes WHERE id = $1', [id]);
  return mapearLote(rows[0]);
};

export const create = async (data) => {
  const { cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto } = data;
  const { rows } = await pool.query(
    `INSERT INTO lotes (cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto]
  );
  return mapearLote(rows[0]);
};

export const update = async (id, data) => {
  const { cantidad, fechaArribo, fechaVencimiento } = data;
  const { rows } = await pool.query(
    `UPDATE lotes
    SET cantidad = $1, fecha_arribo = $2, fecha_vencimiento = $3
    WHERE id = $4
    RETURNING *`,
    [cantidad, fechaArribo, fechaVencimiento, id]
  );
  return mapearLote(rows[0]);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE lotes SET activo = false WHERE id = $1', [id]);
  return rowCount;
};