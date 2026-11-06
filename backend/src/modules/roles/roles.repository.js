import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM roles ORDER BY activo DESC, rol ASC');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1 ORDER BY activo DESC, rol ASC', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { correo, password, rol } = data;
  const { rows } = await pool.query(
    `INSERT INTO roles (correo, password, rol)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [correo, password, rol]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { correo, password, rol } = data;
  const { rows } = await pool.query(
    `UPDATE roles
    SET correo = $1, password = $2, rol = $3
    WHERE id = $4
    RETURNING *`,
    [correo, password, rol, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE roles SET activo = false WHERE id = $1', [id]);
  return rowCount;
};