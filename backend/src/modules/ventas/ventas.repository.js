import { pool } from '../../config/db.js'; // Ajusta la ruta a tu conexión de pool

export const listar = async () => {
  const { rows } = await pool.query('SELECT * FROM ventas ORDER BY activo DESC, fecha ASC');
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
    UPDATE ventas
    SET activo = false
    WHERE id = $1;
  `, [id]);
  return rowCount;
};


export const update = async (id, { fecha, total, pedido_id }) => {
  const { rows } = await pool.query(`
    UPDATE ventas
    SET fecha = $1,
        total = $2,
        pedido_id = $3
    WHERE id = $4
    RETURNING id, fecha, total, pedido_id;
  `, [fecha, total, pedido_id, id]);
  return rows[0];
};

export const obtenerVentasMes = async () => {
  const query = `
    SELECT *
    FROM ventas
    WHERE fecha >= NOW() - INTERVAL '1 month'
    ORDER BY fecha DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};