import { Router } from 'express';
import * as controller from './tiposPromocion.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', verificarToken, requerirAdmin, controller.crear);
router.put('/:id', verificarToken, requerirAdmin, controller.actualizar);
router.delete('/:id', verificarToken, controller.eliminar);

export default router;
