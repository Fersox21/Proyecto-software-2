import { Router } from 'express';
import * as controller from './roles.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken, requerirAdmin);

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
