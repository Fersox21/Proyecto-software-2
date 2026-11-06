import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM ordenes_compra ORDER BY activo DESC, fecha ASC;');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM ordenes_compra WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { cantidad, total, fecha, proveedor } = data;
  const { rows } = await pool.query(
    `INSERT INTO ordenes_compra (cantidad, total, fecha, proveedor)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [cantidad, total, fecha, proveedor]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { cantidad, total, fecha } = data;
  const { rows } = await pool.query(
    `UPDATE ordenes_compra
    SET cantidad = $1, total = $2, fecha = $3
    WHERE id = $4
    RETURNING *`,
    [cantidad, total, fecha, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE ordenes_compra SET activo = false WHERE id = $1', [id]);
  return rowCount;
};