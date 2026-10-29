import { Router } from 'express';
import * as controller from './roles.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', verificarToken, controller.listar);
router.get('/:id', verificarToken, controller.obtener);
router.put('/:id', verificarToken, controller.actualizar)
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
