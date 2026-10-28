import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas ORDER BY id');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { fecha, total, pedido } = data;
  const { rows } = await pool.query(
    `INSERT INTO ventas (fecha, total, pedido_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [fecha, total, pedido]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { fecha, total } = data;
  const { rows } = await pool.query(
    `UPDATE ventas
    SET fecha = $1, total = $2
    WHERE id = $3
    RETURNING *`,
    [fecha, total, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM ventas WHERE id = $1', [id]);
  return rowCount;
};