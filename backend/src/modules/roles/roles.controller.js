import * as service from './roles.service.js';

export const listar = async (req, res, next) => {
  try {
    const roles = await service.listarRoles();
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const rol = await service.obtenerRolPorId(req.params.id);
    res.json(rol);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoRol = await service.crearRol(req.body);
    res.status(201).json(nuevoRol);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const rolActualizado = await service.actualizarRol(req.params.id, req.body);
    res.json(rolActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarRol(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};