import { pool } from '../../config/db.js';

export const obtenerUsuario = async (correo) => {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    return rows;
}

export const registro = async (correo, passwordHash) => {
   try{
    const { rows } = await pool.query(
      `INSERT INTO usuarios (correo, password)
       VALUES ($1, $2)
       RETURNING id, correo`,
      [correo, passwordHash]
    );
    return rows[0];
    }catch (error) {
    if (error.code === '23505') {
      const err = new Error('El correo ya se encuentra registrado.');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}