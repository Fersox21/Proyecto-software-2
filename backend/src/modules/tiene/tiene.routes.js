import { Router } from 'express';
import * as controller from './tiene.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/',verificarToken, controller.listar);
router.get('/:id',verificarToken, controller.obtener);
router.post('/', verificarToken, controller.crear);
router.put('/', verificarToken, controller.actualizar)
router.delete('/:pedido_id/:producto_id', verificarToken, controller.eliminar);

export default router;
 