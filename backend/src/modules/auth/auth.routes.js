import { Router } from 'express';
import * as defaultController from './auth.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';
import { loginRateLimiter } from './auth.rateLimit.js';

export const crearAuthRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin,
  rateLimiter = loginRateLimiter
} = {}) => {
  const router = Router();

  router.post('/login', rateLimiter, controller.login);
  router.get('/usuario', middlewareToken, controller.usuario);
  router.post('/registro', middlewareToken, middlewareAdmin, controller.registrar);

  return router;
};

export default crearAuthRoutes();