import { pool } from '../../config/db.js';

export const obtenerVenta = async (correo) => {
    const { rows } = await pool.query('SELECT * FROM roles WHERE correo = $1', [correo]);
    return rows;
}