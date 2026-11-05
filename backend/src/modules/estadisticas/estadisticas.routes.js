import { Router } from 'express';
import * as controller from './estadisticas.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

const router = Router();

router.get('/ganancias-mensuales', verificarToken, controller.gananciasMensuales);
router.get('/productos-vencidos', verificarToken, controller.productosVencidos);
router.get('/mas-vendidos', verificarToken, controller.masVendidos);
router.get('/promedio-diario', verificarToken, controller.promedioDiario);

export default router;