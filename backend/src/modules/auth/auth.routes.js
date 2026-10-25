import { Router } from 'express';
import * as controller from './auth.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.post('/login', controller.login);
router.get('/administrador', verificarToken, controller.administrador);


export default router;
