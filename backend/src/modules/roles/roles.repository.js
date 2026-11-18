import { pool } from '../../config/db.js';

const COLUMNAS_SEGURAS = 'id, correo, rol, activo';

export const findAll = async () => {
  const { rows } = await pool.query(`SELECT ${COLUMNAS_SEGURAS} FROM usuarios ORDER BY activo DESC, rol ASC`);
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query(`SELECT ${COLUMNAS_SEGURAS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0];
};

export const create = async (data) => {
  const { correo, password, rol } = data;
  const { rows } = await pool.query(
    `INSERT INTO usuarios (correo, password, rol)
    VALUES ($1, $2, $3)
    RETURNING ${COLUMNAS_SEGURAS}`,
    [correo, password, rol]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { correo, password, rol } = data;
  const { rows } = await pool.query(
    `UPDATE usuarios
    SET correo = $1, password = $2, rol = $3
    WHERE id = $4
    RETURNING ${COLUMNAS_SEGURAS}`,
    [correo, password, rol, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);
  return rowCount;
};