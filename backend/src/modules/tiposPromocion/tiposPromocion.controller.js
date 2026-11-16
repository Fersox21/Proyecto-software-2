import * as service from './tiposPromocion.service.js';

export const listar = async (req, res, next) => {
  try {
    const tipos = await service.listarTiposPromocion();
    res.json(tipos);
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
