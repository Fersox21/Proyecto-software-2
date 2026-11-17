import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as authRepository from '../modules/auth/auth.repository.js';

const responderError = (res, statusCode, mensaje) =>
  res.status(statusCode).json({
    success: false,
    error: mensaje,
    message: mensaje,
    statusCode
  });

export const crearVerificarToken = ({
  buscarUsuarioPorId = authRepository.obtenerUsuarioPorId,
  verificarJwt = jwt.verify,
  obtenerSecreto = () => env.JWT_SECRET
} = {}) => {
  return async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    const match = typeof authHeader === 'string' ? authHeader.match(/^Bearer\s+(\S+)$/i) : null;

    if (!match) {
      return responderError(res, 401, 'Falta el token');
    }

    const token = match[1];
    let payload;

    try {
      payload = verificarJwt(token, obtenerSecreto(), {
        algorithms: ['HS256', 'HS384', 'HS512']
      });
    } catch (err) {
      const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
      return responderError(res, 401, mensaje);
    }

    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      !Number.isInteger(payload.id) ||
      payload.id <= 0 ||
      payload.id > 2147483647
    ) {
      return responderError(res, 401, 'Token inválido');
    }

    try {
      const usuario = await buscarUsuarioPorId(payload.id);
      if (!usuario) {
        return responderError(res, 401, 'Token inválido');
      }
      if (usuario.activo !== true) {
        return responderError(res, 403, 'Usuario inactivo');
      }

      req.usuario = {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol
      };
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export const verificarToken = crearVerificarToken();

export const soloAdmin = (req, res, next) => {
  if (!req.usuario) {
    return responderError(res, 401, 'Falta el token');
  }
  if (req.usuario.rol !== 'admin') {
    return responderError(res, 403, 'Acceso denegado: se requieren permisos de administrador');
  }
  return next();
};

export const requerirAdmin = soloAdmin;