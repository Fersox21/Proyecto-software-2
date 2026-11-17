import { Router } from 'express';
import * as controller from './ordenesCompra.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { recibirImagenesOrden } from '../productos/productos.imagen.js';

const router = Router();

router.get('/', controller.listar);
router.get('/historial', verificarToken, controller.listarHistorial);
router.get('/:id', controller.obtener);
router.post('/', verificarToken, recibirImagenesOrden, controller.crear);
router.put('/:id', verificarToken, recibirImagenesOrden, controller.actualizar);
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
