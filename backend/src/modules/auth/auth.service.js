import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepository from './auth.repository.js';
import { env } from '../../config/env.js'


export const registro = async (correo, password) => {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);


    return await authRepository.registro(correo, passwordHash);
    
}

export const login = async (correo, password) => {
    if (!correo || !password) {
    throw new Error('Mail y correo son obligatorios');
  }

  
    const rows = await authRepository.obtenerUsuario(correo);
    const usuario = rows[0];


    if (!usuario) {
    const error = new Error('Credenciales inválidas');
    error.status = 401; 
    throw error;
  }


    const passwordOk = usuario && (await bcrypt.compare(password, usuario.password));


    if (!passwordOk) {
    const error = new Error('Credenciales inválidas');
    error.status = 401; 
    throw error;
  }


    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo }, // payload
      env.JWT_SECRET, // clave secreta del servidor
      { expiresIn: env.JWT_EXPIRES_IN } // vencimiento
    );
    return token;
}
