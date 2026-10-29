import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM tiene ORDER BY id');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM tiene WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { cantidad, precio, producto, venta } = data;
  const { rows } = await pool.query(
    `INSERT INTO tiene (cantidad, precio, producto_id, venta_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [cantidad, precio, producto, venta]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { cantidad, precio } = data;
  const { rows } = await pool.query(
    `UPDATE tiene
    SET cantidad = $1, precio = $2
    WHERE id = $3
    RETURNING *`,
    [cantidad, precio, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM tiene WHERE id = $1', [id]);
  return rowCount;
};