import { Router } from 'express';
import * as controller from './ventas.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken, requerirAdmin);

router.get('/', controller.listar);
router.get('/historial', controller.listarHistorial);
router.post('/', controller.crear);
router.get('/:id/productos', controller.obtenerProductos);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
 