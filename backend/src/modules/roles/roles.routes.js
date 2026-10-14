import { Router } from 'express';
import * as controller from './roles.controller.js';

const router = Router();

router.post('/login', controller.login);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar)
router.delete('/:id', controller.eliminar);

export default router;
