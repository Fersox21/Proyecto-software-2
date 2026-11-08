// Middleware de errores: tiene 4 parámetros y se registra al final de app.js
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const mensaje = err.message || 'Error interno del servidor';

  // `message` se mantiene por compatibilidad con los servicios del frontend
  // que ya leían ese campo; `error` y `statusCode` siguen el contrato de AGENTS.md.
  res.status(status).json({
    success: false,
    error: mensaje,
    message: mensaje,
    statusCode: status
  });
};
 