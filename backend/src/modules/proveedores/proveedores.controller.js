import * as service from './proveedores.service.js';

export const listar = async (req, res, next) => {
  try {
    const proveedores = await service.listarProveedores();
    res.json(proveedores);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const proveedor = await service.obtenerProveedorPorId(req.params.id);
    res.json(proveedor);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoProveedor = await service.crearProveedor(req.body);
    res.status(201).json(nuevoProveedor);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const proveedorActualizado = await service.actualizarProveedor(req.params.id, req.body);
    res.json(proveedorActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarProveedor(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};