import * as service from './ordenesCompra.service.js';
import { eliminarImagenFisica } from '../productos/productos.imagen.js';

const parsearPayloadOrden = (req) => {
  if (typeof req.body?.datos === 'string') {
    let parsed;
    try {
      parsed = JSON.parse(req.body.datos);
    } catch {
      const error = new Error('El campo datos debe contener un JSON válido');
      error.status = 400;
      throw error;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      const error = new Error('El campo datos debe ser un objeto JSON válido');
      error.status = 400;
      throw error;
    }
    return parsed;
  }
  return req.body;
};

const limpiarImagenesSubidas = (archivos = []) => {
  if (!Array.isArray(archivos)) return;
  for (const archivo of archivos) {
    if (archivo?.filename) {
      eliminarImagenFisica(archivo.filename);
    }
  }
};

export const listar = async (req, res, next) => {
  try {
    const ordenesCompra = await service.listarOrdenesCompra();
    res.json(ordenesCompra);
  } catch (err) {
    next(err);
  }
};

export const listarHistorial = async (req, res, next) => {
  try {
    const ordenesCompra = await service.listarHistorialOrdenesCompra();
    res.json(ordenesCompra);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const incluirInactivos = req.query.historial === 'true';
    const ordenCompra = await service.obtenerOrdenCompraPorId(req.params.id, incluirInactivos);
    res.json(ordenCompra);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const datos = parsearPayloadOrden(req);
    const usuarioId = req.usuario?.id ?? req.user?.id ?? datos?.usuarioId ?? null;
    const nuevaOrdenCompra = await service.crearOrdenCompra(
      usuarioId != null ? { ...datos, usuarioId } : datos,
      req.files
    );
    res.status(201).json(nuevaOrdenCompra);
  } catch (err) {
    limpiarImagenesSubidas(req.files);
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const datos = parsearPayloadOrden(req);
    const usuarioId = req.usuario?.id ?? req.user?.id ?? datos?.usuarioId ?? null;
    const ordenCompraActualizada = await service.actualizarOrdenCompra(
      req.params.id,
      usuarioId != null ? { ...datos, usuarioId } : datos,
      req.files
    );
    res.json(ordenCompraActualizada);
  } catch (err) {
    limpiarImagenesSubidas(req.files);
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarOrdenCompra(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};