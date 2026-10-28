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

export const obtenerVentasMes = async () => {
  const { rows } = await pool.query('SELECT id, fecha, total, pedido_id FROM ventas WHERE fecha >= DATE_TRUNC(\'month\', CURRENT_DATE - INTERVAL \'1 month\') AND fecha < DATE_TRUNC(\'month\', CURRENT_DATE) ORDER BY fecha DESC;')
  return rows;
}