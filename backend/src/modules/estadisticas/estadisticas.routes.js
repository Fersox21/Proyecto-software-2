import { Router } from 'express';
import * as controller from './estadisticas.controller.js';
import { verificarToken, requerirAdmin } from '../../middlewares/verificarToken.js';

const router = Router();

router.use(verificarToken, requerirAdmin);

router.get('/ganancias-mensuales', controller.gananciasMensuales);
router.get('/productos-vencidos', controller.productosVencidos);
router.get('/mas-vendidos', controller.masVendidos);
router.get('/promedio-diario', controller.promedioDiario);

export default router;