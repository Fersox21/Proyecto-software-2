import { Router } from 'express';
import * as defaultController from './productos.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';
import { recibirImagen } from './productos.imagen.js';

export const crearProductosRoutes = ({
  controller = defaultController,
  middlewareToken = verificarToken,
  middlewareAdmin = soloAdmin
} = {}) => {
  const router = Router();

  router.get('/catalogo', controller.listarCatalogo);
  router.get('/historial', middlewareToken, middlewareAdmin, controller.listarHistorial);
  router.get('/', middlewareToken, middlewareAdmin, controller.listar);
  router.get('/:id', middlewareToken, middlewareAdmin, controller.obtener);
  router.post('/', middlewareToken, middlewareAdmin, recibirImagen, controller.crear);
  router.put('/:id', middlewareToken, middlewareAdmin, recibirImagen, controller.actualizar);
  router.post('/:id/imagen', middlewareToken, middlewareAdmin, recibirImagen, controller.subirImagen);
  router.delete('/:id/imagen', middlewareToken, middlewareAdmin, controller.quitarImagen);
  router.delete('/:id', middlewareToken, middlewareAdmin, controller.eliminar);

  return router;
};

export default crearProductosRoutes();
