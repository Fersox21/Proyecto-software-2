import { Router } from 'express';
import * as controller from './pedidos.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

// El checkout es público: cualquier cliente puede registrar su pedido.
router.post('/', controller.crear);

// La gestión de pedidos es exclusiva del panel administrador.
router.use(verificarToken, requerirAdmin);
router.get('/', controller.listar);
router.get('/historial', controller.listarHistorial);
router.get('/:id/lotes-disponibles', controller.obtenerLotesDisponibles);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
