import { pool } from '../../config/db.js';

export const obtenerUsuario = async (correo) => {
    const { rows } = await pool.query('SELECT * FROM roles WHERE correo = $1', [correo]);
    return rows;
}