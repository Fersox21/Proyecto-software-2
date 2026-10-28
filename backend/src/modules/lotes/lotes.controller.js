import * as service from './lotes.service.js';

export const listar = async (req, res, next) => {
  try {
    const lotes = await service.listarlotes();
    res.json(lotes);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const lote = await service.obtenerLotePorId(req.params.id);
    res.json(lote);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoLote = await service.crearLote(req.body);
    res.status(201).json(nuevoLote);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const loteActualizado = await service.actualizarLote(req.params.id, req.body);
    res.json(loteActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarLote(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};