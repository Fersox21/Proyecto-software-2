import { Router } from 'express';
import * as controller from './ordenesCompra.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';
import { recibirImagenesOrden } from '../productos/productos.imagen.js';

const router = Router();

router.use(verificarToken, requerirAdmin);

router.get('/', controller.listar);
router.get('/historial', controller.listarHistorial);
router.get('/:id', controller.obtener);
router.post('/', recibirImagenesOrden, controller.crear);
router.put('/:id', recibirImagenesOrden, controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
