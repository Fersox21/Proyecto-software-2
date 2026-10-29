// Middleware de errores: tiene 4 parámetros y se registra al final de app.js
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
};
