import { Router } from 'express';
import * as defaultController from './lotes.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';

export const crearLotesRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.get('/', middlewareToken, middlewareAdmin, controller.listar);
  router.get('/historial', middlewareToken, middlewareAdmin, controller.listarHistorial);
  router.get('/:id', middlewareToken, middlewareAdmin, controller.obtener);
  router.post('/', middlewareToken, middlewareAdmin, controller.crear);
  router.put('/:id', middlewareToken, middlewareAdmin, controller.actualizar);
  router.delete('/:id', middlewareToken, middlewareAdmin, controller.eliminar);

  return router;
};

export default crearLotesRoutes();
