import * as service from './categorias.service.js';

export const listar = async (req, res, next) => {
  try {
    const categorias = await service.listarCategorias();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevaCategoria = await service.crearCategoria(req.body);
    res.status(201).json(nuevaCategoria);
  } catch (err) {
    next(err);
  }
};
