import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';


const responderNoAutorizado = (res, mensaje) =>
  res.status(401).json({
    success: false,
    error: mensaje,
    message: mensaje,
    statusCode: 401
  });

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return responderNoAutorizado(res, 'Falta el token');
  }

 
  const token = authHeader.split(' ')[1];

  try {
    
    const payload = jwt.verify(token, env.JWT_SECRET);

    
    req.usuario = { id: payload.id, correo: payload.correo, rol: payload.rol };
    next(); 
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return responderNoAutorizado(res, mensaje);
  }
};

export const requerirAdmin = (req, res, next) => {
  if (String(req.usuario?.rol || '').toLowerCase() !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: se requiere rol administrador',
      statusCode: 403
    });
  }
  next();
};