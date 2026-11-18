import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepository from './auth.repository.js';
import { env } from '../../config/env.js'


const crearError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
};

export const registro = async (correo, password) => {
    if (typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) || correo.trim().length > 50) {
        throw crearError('El correo electrónico no es válido o supera los 50 caracteres', 400);
    }
    if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
        throw crearError('La contraseña debe tener entre 6 y 100 caracteres', 400);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return await authRepository.registro(correo.trim(), passwordHash);
}

export const login = async (correo, password) => {
    if (typeof correo !== 'string' || !correo.trim() || typeof password !== 'string' || !password) {
        throw crearError('Correo y contraseña son obligatorios', 400);
    }

  
    const rows = await authRepository.obtenerUsuario(correo.trim());
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
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol }, // payload
      env.JWT_SECRET, // clave secreta del servidor
      { expiresIn: env.JWT_EXPIRES_IN } // vencimiento
    );
    return token;
}