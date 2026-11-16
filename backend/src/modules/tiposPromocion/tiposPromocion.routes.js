import { Router } from 'express';
import * as controller from './tiposPromocion.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/', controller.listar);
router.post('/', verificarToken, controller.crear);

export default router;
