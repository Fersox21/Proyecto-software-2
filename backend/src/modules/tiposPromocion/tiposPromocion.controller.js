import * as service from './tiposPromocion.service.js';

export const listar = async (req, res, next) => {
  try {
    const tipos = await service.listarTiposPromocion();
    res.json(tipos);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const tipo = await service.obtenerTipoPromocionPorId(req.params.id);
    res.json(tipo);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoTipo = await service.crearTipoPromocion(req.body);
    res.status(201).json(nuevoTipo);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const tipoActualizado = await service.actualizarTipoPromocion(req.params.id, req.body);
    res.json(tipoActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarTipoPromocion(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
