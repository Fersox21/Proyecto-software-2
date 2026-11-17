import { Router } from 'express';
import * as controller from './tiposPromocion.controller.js';
import { verificarToken, soloAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', verificarToken, soloAdmin, controller.crear);
router.put('/:id', verificarToken, soloAdmin, controller.actualizar);
router.delete('/:id', verificarToken, soloAdmin, controller.eliminar);

export default router;
