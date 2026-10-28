import * as service from './ordenesCompra.service.js';

export const listar = async (req, res, next) => {
  try {
    const ordenesCompra = await service.listarOrdenesCompra();
    res.json(ordenesCompra);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const ordenCompra = await service.obtenerOrdenCompraPorId(req.params.id);
    res.json(ordenCompra);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevaOrdenCompra = await service.crearOrdenCompra(req.body);
    res.status(201).json(nuevaOrdenCompra);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const ordenCompraActualizada = await service.actualizarOrdenCompra(req.params.id, req.body);
    res.json(ordenCompraActualizada);
  } catch (err) {
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