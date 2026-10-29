import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepository from './auth.repository.js';
import { env } from '../../config/env.js';a

export const login = async (correo, password) => {
    if (!correo || !password) {
    throw new Error('Mail y correo son obligatorios');
  }

  
    const rows = await authRepository.obtenerUsuario(correo);
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
