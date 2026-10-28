import * as service from './tiene.service.js';

export const listar = async (req, res, next) => {
  try {
    const tiene = await service.listarTiene();
    res.json(tiene);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const tiene = await service.obtenerTienePorId(req.params.id);
    res.json(tiene);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoTiene = await service.crearTiene(req.body);
    res.status(201).json(nuevoTiene);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const tieneActualizado = await service.actualizarTiene(req.params.id, req.body);
    res.json(tieneActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarTiene(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};