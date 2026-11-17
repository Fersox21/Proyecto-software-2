import { Router } from 'express';
import * as defaultController from './estadisticas.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';

export const crearEstadisticasRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.get('/ganancias-mensuales', middlewareToken, middlewareAdmin, controller.gananciasMensuales);
  router.get('/productos-vencidos', middlewareToken, middlewareAdmin, controller.productosVencidos);
  router.get('/mas-vendidos', middlewareToken, middlewareAdmin, controller.masVendidos);
  router.get('/promedio-diario', middlewareToken, middlewareAdmin, controller.promedioDiario);

  return router;
};

export default crearEstadisticasRoutes();