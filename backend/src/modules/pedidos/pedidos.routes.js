import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', verificarToken, controller.listar);
router.delete('/:pedido_id/items/:producto_id', verificarToken, controller.eliminarItem);
router.get('/:id', verificarToken, controller.obtener);
router.post('/', verificarToken, controller.crear);
router.put('/:id', verificarToken, controller.actualizar)
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
