import { Router } from 'express';
import * as controller from './productos.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';
import { recibirImagen } from './productos.imagen.js';

const router = Router();

router.get('/', verificarToken, requerirAdmin, controller.listar);
router.get('/catalogo', controller.listarCatalogo);
router.get('/historial', verificarToken, requerirAdmin, controller.listarHistorial);
router.get('/:id/historial-precios', verificarToken, requerirAdmin, controller.obtenerHistorialPrecios);
router.get('/:id', verificarToken, requerirAdmin, controller.obtener);
router.post('/', verificarToken, requerirAdmin, recibirImagen, controller.crear);
router.put('/:id', verificarToken, requerirAdmin, recibirImagen, controller.actualizar);
router.post('/:id/imagen', verificarToken, requerirAdmin, recibirImagen, controller.subirImagen);
router.delete('/:id/imagen', verificarToken, requerirAdmin, controller.quitarImagen);
router.delete('/:id', verificarToken, requerirAdmin, controller.eliminar);

export default router;
