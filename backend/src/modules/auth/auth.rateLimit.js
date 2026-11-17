export const crearRateLimiterLogin = ({
  maxIntentos = 15,
  ventanaMs = 15 * 60 * 1000
} = {}) => {
  const registros = new Map();

  const middleware = (req, res, next) => {
    const clave = req.ip || req.socket?.remoteAddress || 'desconocido';
    const ahora = Date.now();
    const entrada = registros.get(clave);

    if (entrada && ahora - entrada.inicio < ventanaMs) {
      if (entrada.intentos >= maxIntentos) {
        return res.status(429).json({
          success: false,
          error: 'Demasiados intentos fallidos de inicio de sesión. Intentá más tarde.',
          message: 'Demasiados intentos fallidos de inicio de sesión. Intentá más tarde.',
          statusCode: 429
        });
      }
    } else if (entrada) {
      registros.delete(clave);
    }

    res.on('finish', () => {
      if (res.statusCode === 200) {
        registros.delete(clave);
        return;
      }

      if (res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 429) {
        const t = Date.now();
        const actual = registros.get(clave);
        if (!actual || t - actual.inicio >= ventanaMs) {
          registros.set(clave, { intentos: 1, inicio: t });
        } else {
          actual.intentos += 1;
        }
      }
    });

    return next();
  };

  middleware.reiniciar = () => {
    registros.clear();
  };

  return middleware;
};

export const loginRateLimiter = crearRateLimiterLogin();
