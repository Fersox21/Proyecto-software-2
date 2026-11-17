// Middleware de errores: tiene 4 parámetros y se registra al final de app.js
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let mensaje = err.message || 'Error interno del servidor';

  if (err.type === 'entity.parse.failed') {
    status = 400;
    mensaje = 'El cuerpo de la solicitud no es un JSON válido';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    mensaje = 'El cuerpo de la solicitud supera el tamaño máximo permitido';
  } else if (status >= 500) {
    mensaje = 'Error interno del servidor';
  }

  res.status(status).json({
    success: false,
    error: mensaje,
    message: mensaje,
    statusCode: status
  });
};
 