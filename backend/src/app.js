import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { corsOptions } from './config/cors.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import defaultLotesRoutes from './modules/lotes/lotes.routes.js';
import defaultOrdenesCompraRoutes from './modules/ordenesCompra/ordenesCompra.routes.js';
import defaultPedidosRoutes from './modules/pedidos/pedidos.routes.js';
import defaultProductosRoutes from './modules/productos/productos.routes.js';
import defaultProveedoresRoutes from './modules/proveedores/proveedores.routes.js';
import defaultRolesRoutes from './modules/roles/roles.routes.js';
import defaultTieneRoutes from './modules/tiene/tiene.routes.js';
import defaultVentasRoutes from './modules/ventas/ventas.routes.js';
import defaultAuthRoutes from './modules/auth/auth.routes.js';
import defaultEstadisticasRoutes from './modules/estadisticas/estadisticas.routes.js';
import defaultCategoriasRoutes from './modules/categorias/categorias.routes.js';
import defaultTiposPromocionRoutes from './modules/tiposPromocion/tiposPromocion.routes.js';

const DIRECTORIO_APP = path.dirname(fileURLToPath(import.meta.url));

export const crearApp = ({
  authRoutes = defaultAuthRoutes,
  lotesRoutes = defaultLotesRoutes,
  ordenesCompraRoutes = defaultOrdenesCompraRoutes,
  pedidosRoutes = defaultPedidosRoutes,
  productosRoutes = defaultProductosRoutes,
  proveedoresRoutes = defaultProveedoresRoutes,
  rolesRoutes = defaultRolesRoutes,
  tieneRoutes = defaultTieneRoutes,
  ventasRoutes = defaultVentasRoutes,
  estadisticasRoutes = defaultEstadisticasRoutes,
  categoriasRoutes = defaultCategoriasRoutes,
  tiposPromocionRoutes = defaultTiposPromocionRoutes
} = {}) => {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());
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
  app.use('/api/categorias', categoriasRoutes);
  app.use('/api/tipos-promocion', tiposPromocionRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const app = crearApp();

export default app;
