import { pool } from '../../config/db.js';

const COLUMNAS = 'id, nombre, activo, telefono';

export const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM proveedores WHERE activo = true ORDER BY nombre ASC`
  );
  return rows;
};

export const findById = async (id, client = pool) => {
  const { rows } = await client.query(
    `SELECT ${COLUMNAS} FROM proveedores WHERE id = $1 AND activo = true`,
    [id]
  );
  return rows[0] ?? null;
};

export const create = async (data, client = pool) => {
  const { nombre, telefono } = data;
  const { rows } = await client.query(
    `INSERT INTO proveedores (nombre, telefono)
     VALUES ($1, $2)
     RETURNING ${COLUMNAS}`,
    [nombre, telefono]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { nombre, telefono } = data;
  const { rows } = await pool.query(
    `UPDATE proveedores
     SET nombre = $1, telefono = $2
     WHERE id = $3 AND activo = true
     RETURNING ${COLUMNAS}`,
    [nombre, telefono, id]
  );
  return rows[0] ?? null;
};

export const remove = async (id) => {
  const { rowCount } = await pool.query(
    'UPDATE proveedores SET activo = false WHERE id = $1 AND activo = true',
    [id]
  );
  return rowCount;
};