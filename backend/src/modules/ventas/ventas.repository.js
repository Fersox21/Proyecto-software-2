import { pool } from '../../config/db.js'; // Ajusta la ruta a tu conexión de pool

export const listar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};

export const obtener = async (id) => {
  const { rows } = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
  return rows;
};

export const crear = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};

export const actualizar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};

export const eliminar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};
