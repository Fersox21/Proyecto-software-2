import * as service from './ventas.service.js';

export const listar = async (req, res, next) => {
  try {
    const venta = await service.listarVenta();
    res.json(venta);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const venta = await service.obtenerVentaPorId(req.params.id);
    res.json(venta);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoVenta = await service.crearVenta(req.body);
    res.status(201).json(nuevoVenta);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const ventaActualizada = await service.actualizarVenta(req.params.id, req.body);
    res.json(ventaActualizada);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarVenta(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};