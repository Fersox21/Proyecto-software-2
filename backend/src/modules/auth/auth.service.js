import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (correo, password) => {
    if (!correo || !password) {
    throw new Error('Mail y correo son obligatorios');
  }

  
    const { rows } = await pool.query('SELECT * FROM roles WHERE correo = $1', [correo]);
    const usuario = rows[0];

    if (!usuario || !usuario.password) {
    throw new Error('Credenciales invalidas');
  }

    const passwordOk = usuario && (await bcrypt.compare(password, usuario.password));


    if (!passwordOk) {
      return new Error('Credenciales invalidas');
    }


    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo }, // payload
      env.JWT_SECRET, // clave secreta del servidor
      { expiresIn: env.JWT_EXPIRES_IN } // vencimiento
    );
    return token;
}
