import { pool } from '../../config/db.js';

export const findAll = async (client = pool) => {
  const { rows } = await client.query(
    'SELECT id, nombre, activo FROM tipos_promocion WHERE activo = true ORDER BY nombre ASC'
  );
  return rows;
};

export const findById = async (id, client = pool) => {
  const { rows } = await client.query(
    'SELECT id, nombre, activo FROM tipos_promocion WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const findByNombreInsensitive = async (nombre, client = pool) => {
  const { rows } = await client.query(
    'SELECT id, nombre, activo FROM tipos_promocion WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1)) LIMIT 1',
    [nombre]
  );
  return rows[0] || null;
};

export const create = async (nombre, client = pool) => {
  const { rows } = await client.query(
    'INSERT INTO tipos_promocion (nombre, activo) VALUES ($1, true) RETURNING id, nombre, activo',
    [nombre]
  );
  return rows[0];
};
