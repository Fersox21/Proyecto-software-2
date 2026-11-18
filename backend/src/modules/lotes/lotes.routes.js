import { Router } from 'express';
import * as controller from './lotes.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken, requerirAdmin);

router.get('/', controller.listar);
router.get('/historial', controller.listarHistorial);
router.get('/:id', controller.obtener);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
