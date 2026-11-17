import { Router } from 'express';
import * as defaultController from './tiene.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';

export const crearTieneRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.get('/', middlewareToken, middlewareAdmin, controller.listar);
  router.get('/:id', middlewareToken, middlewareAdmin, controller.obtener);
  router.post('/', middlewareToken, middlewareAdmin, controller.crear);
  router.put('/', middlewareToken, middlewareAdmin, controller.actualizar);
  router.delete('/:pedido_id/:producto_id', middlewareToken, middlewareAdmin, controller.eliminar);

  return router;
};

export default crearTieneRoutes();
 