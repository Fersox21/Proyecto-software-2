import * as service from './categorias.service.js';

export const listar = async (req, res, next) => {
  try {
    const categorias = await service.listarCategorias();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const categoria = await service.obtenerCategoriaPorId(req.params.id);
    res.json(categoria);
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

export const actualizar = async (req, res, next) => {
  try {
    const categoriaActualizada = await service.actualizarCategoria(req.params.id, req.body);
    res.json(categoriaActualizada);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarCategoria(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
