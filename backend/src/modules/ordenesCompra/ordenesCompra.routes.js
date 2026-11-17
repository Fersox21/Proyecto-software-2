import { Router } from 'express';
import * as defaultController from './ordenesCompra.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';
import { recibirImagenesOrden } from '../productos/productos.imagen.js';

export const crearOrdenesCompraRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.get('/', middlewareToken, middlewareAdmin, controller.listar);
  router.get('/historial', middlewareToken, middlewareAdmin, controller.listarHistorial);
  router.get('/:id', middlewareToken, middlewareAdmin, controller.obtener);
  router.post('/', middlewareToken, middlewareAdmin, recibirImagenesOrden, controller.crear);
  router.put('/:id', middlewareToken, middlewareAdmin, recibirImagenesOrden, controller.actualizar);
  router.delete('/:id', middlewareToken, middlewareAdmin, controller.eliminar);

  return router;
};

export default crearOrdenesCompraRoutes();
