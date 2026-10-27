import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';


export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token' });
  }

 
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verificar firma y vencimiento. Si algo falla, lanza un error
    const payload = jwt.verify(token, env.JWT_SECRET);

    // 4. Guardar los datos del usuario para que los use el controller
    req.usuario = { id: payload.id, nombre: payload.nombre, email: payload.email };
    next(); 
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return res.status(401).json({ error: mensaje });
  }
};