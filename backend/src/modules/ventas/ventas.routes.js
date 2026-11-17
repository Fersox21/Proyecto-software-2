import { Router } from 'express';
import * as defaultController from './ventas.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';

export const crearVentasRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.get('/', middlewareToken, middlewareAdmin, controller.listar);
  router.get('/historial', middlewareToken, middlewareAdmin, controller.listarHistorial);
  router.post('/', middlewareToken, middlewareAdmin, controller.crear);
  router.get('/:id/productos', middlewareToken, middlewareAdmin, controller.obtenerProductos);
  router.get('/:id', middlewareToken, middlewareAdmin, controller.obtener);
  router.put('/:id', middlewareToken, middlewareAdmin, controller.actualizar);
  router.delete('/:id', middlewareToken, middlewareAdmin, controller.eliminar);

  return router;
};

export default crearVentasRoutes();
 