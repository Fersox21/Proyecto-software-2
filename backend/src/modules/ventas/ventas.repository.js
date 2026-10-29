import { pool } from '../../config/db.js'; // Ajusta la ruta a tu conexión de pool

export const listar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};

export const obtener = async (id) => {
  const { rows } = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
  return rows;
};

export const create = async ({ pedido_id, fecha, total }) => {
  const { rows } = await pool.query(`
    INSERT INTO ventas (pedido_id, fecha, total)
    VALUES ($1, $2, $3)
    RETURNING id, pedido_id, fecha, total;
  `, [pedido_id, fecha, total]);
  return rows[0];
};
 
export const remove = async (id) => {
  const { rowCount } = await pool.query(`
    DELETE FROM ventas
    WHERE id = $1;
  `, [id]);
  return rowCount;
};

export const actualizar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};

export const eliminar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas');
  return rows;
};
