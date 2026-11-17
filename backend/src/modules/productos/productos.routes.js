import { Router } from 'express';
import * as controller from './productos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { recibirImagen } from './productos.imagen.js';

const router = Router();

router.get('/', controller.listar);
router.get('/catalogo', controller.listarCatalogo);
router.get('/historial', verificarToken, controller.listarHistorial);
router.get('/:id', controller.obtener);
router.post('/', verificarToken, recibirImagen, controller.crear);
router.put('/:id', verificarToken, recibirImagen, controller.actualizar);
router.post('/:id/imagen', verificarToken, recibirImagen, controller.subirImagen);
router.delete('/:id/imagen', verificarToken, controller.quitarImagen);
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
