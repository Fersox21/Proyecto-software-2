import { Router } from 'express';
import * as controller from './tiene.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken, requerirAdmin);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/', controller.actualizar);
router.delete('/:pedido_id/:producto_id', controller.eliminar);

export default router;
 