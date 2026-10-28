import { pool } from '../../config/db.js';

const mapearLote = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        fechaArribo: row.fecha_arribo,
        fechaVencimiento: row.fecha_vencimiento,
        ordenCompra: row.orden_compra,
        producto: row.producto
    };
};

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM lotes ORDER BY id');
  return rows.map(mapearLote);
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM lotes WHERE id = $1', [id]);
  return mapearLote(rows[0]);
};

export const create = async (data) => {
  const { fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id]
  );
  return mapearLote(rows[0]);
};

export const update = async (id, data) => {
  const { fecha_arribo, fecha_vencimiento } = data;
  const { rows } = await pool.query(
    `UPDATE lotes
    SET fecha_arribo = $1, fecha_vencimiento = $2
    WHERE id = $3
    RETURNING *`,
    [fecha_arribo, fecha_vencimiento, id]
  );
  return mapearLote(rows[0]);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM lotes WHERE id = $1', [id]);
  return rowCount;
};