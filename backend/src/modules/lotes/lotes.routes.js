import { Router } from 'express';
import * as controller from './lotes.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', controller.listar);
router.get('/historial', verificarToken, controller.listarHistorial);
router.get('/:id', controller.obtener);
router.post('/', verificarToken, controller.crear);
router.put('/:id', verificarToken,controller.actualizar)
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
