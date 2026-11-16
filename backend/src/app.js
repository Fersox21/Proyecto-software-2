import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { corsOptions } from './config/cors.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import lotesRoutes from './modules/lotes/lotes.routes.js';
import ordenesCompraRoutes from './modules/ordenesCompra/ordenesCompra.routes.js';
import pedidosRoutes from './modules/pedidos/pedidos.routes.js';
import productosRoutes from './modules/productos/productos.routes.js';
import proveedoresRoutes from './modules/proveedores/proveedores.routes.js';
import rolesRoutes from './modules/roles/roles.routes.js';
import tieneRoutes from './modules/tiene/tiene.routes.js';
import ventasRoutes from './modules/ventas/ventas.routes.js';
import authRoutes from './modules/auth/auth.routes.js'
import estadisticasRoutes from './modules/estadisticas/estadisticas.routes.js'

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// Imágenes subidas desde el panel de administración. Se sirven como archivos
// estáticos, sin autenticación, porque las consume el catálogo público.
const DIRECTORIO_APP = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.resolve(DIRECTORIO_APP, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/ordenesCompra', ordenesCompraRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/items', tieneRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
