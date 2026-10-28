import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM proveedores ORDER BY id');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { nombre, telefono } = data;
  const { rows } = await pool.query(
    `INSERT INTO proveedores (nombre, telefono)
    VALUES ($1, $2)
    RETURNING *`,
    [nombre, telefono]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { nombre, telefono } = data;
  const { rows } = await pool.query(
    `UPDATE proveedores
    SET nombre = $1, telefono = $2
    WHERE id = $3
    RETURNING *`,
    [nombre, telefono, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM proveedores WHERE id = $1', [id]);
  return rowCount;
};