import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

// El checkout es público: cualquier cliente puede registrar su pedido.
router.post('/', controller.crear);

// La gestión de pedidos es exclusiva del panel administrador.
router.get('/', verificarToken, controller.listar);
router.delete('/:pedido_id/items/:producto_id', verificarToken, controller.eliminarItem);
router.get('/:id', verificarToken, controller.obtener);
router.put('/:id', verificarToken, controller.actualizar)
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
