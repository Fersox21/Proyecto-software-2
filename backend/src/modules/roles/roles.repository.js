import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM roles ORDER BY id');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { correo, password } = data;
  const { rows } = await pool.query(
    `INSERT INTO roles (correo, password)
    VALUES ($1, $2)
    RETURNING *`,
    [correo, password]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { correo, password } = data;
  const { rows } = await pool.query(
    `UPDATE roles
    SET correo = $1, password = $2
    WHERE id = $3
    RETURNING *`,
    [correo, password, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM roles WHERE id = $1', [id]);
  return rowCount;
};