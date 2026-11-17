import { Router } from 'express';
import * as defaultController from './pedidos.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';

export const crearPedidosRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.post('/', controller.crear);

  router.get('/', middlewareToken, middlewareAdmin, controller.listar);
  router.get('/historial', middlewareToken, middlewareAdmin, controller.listarHistorial);
  router.get('/:id/lotes-disponibles', middlewareToken, middlewareAdmin, controller.obtenerLotesDisponibles);
  router.delete('/:pedido_id/items/:producto_id', middlewareToken, middlewareAdmin, controller.eliminarItem);
  router.get('/:id', middlewareToken, middlewareAdmin, controller.obtener);
  router.put('/:id', middlewareToken, middlewareAdmin, controller.actualizar);
  router.delete('/:id', middlewareToken, middlewareAdmin, controller.eliminar);

  return router;
};

export default crearPedidosRoutes();
