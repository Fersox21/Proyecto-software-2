import * as defaultService from './roles.service.js';

export const crearRolesController = (service = defaultService) => {
  const listar = async (req, res, next) => {
    try {
      const roles = await service.listarRoles();
      res.json(roles);
    } catch (err) {
      next(err);
    }
  };

  const obtener = async (req, res, next) => {
    try {
      const rol = await service.obtenerRolPorId(req.params.id);
      res.json(rol);
    } catch (err) {
      next(err);
    }
  };

  const crear = async (req, res, next) => {
    try {
      const nuevoRol = await service.crearRol(req.body);
      res.status(201).json(nuevoRol);
    } catch (err) {
      next(err);
    }
  };

  const actualizar = async (req, res, next) => {
    try {
      const rolActualizado = await service.actualizarRol(req.params.id, req.body);
      res.json(rolActualizado);
    } catch (err) {
      next(err);
    }
  };

  const eliminar = async (req, res, next) => {
    try {
      await service.eliminarRol(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  return { listar, obtener, crear, actualizar, eliminar };
};

const defaultController = crearRolesController();

export const listar = defaultController.listar;
export const obtener = defaultController.obtener;
export const crear = defaultController.crear;
export const actualizar = defaultController.actualizar;
export const eliminar = defaultController.eliminar;