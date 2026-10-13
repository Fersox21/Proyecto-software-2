import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import productosRoutes from './modules/productos/productos.routes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
