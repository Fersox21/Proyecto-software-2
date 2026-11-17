import * as defaultService from './productos.service.js';

export const crearProductosController = (service = defaultService) => {
  const listar = async (req, res, next) => {
    try {
      const productos = await service.listarProductos();
      res.json(productos);
    } catch (err) {
      next(err);
    }
  };

  const listarHistorial = async (req, res, next) => {
    try {
      const productos = await service.listarHistorialProductos();
      res.json(productos);
    } catch (err) {
      next(err);
    }
  };

  const listarCatalogo = async (req, res, next) => {
    try {
      const productos = await service.listarCatalogo();
      res.json(productos);
    } catch (err) {
      next(err);
    }
  };

  const obtener = async (req, res, next) => {
    try {
      const producto = await service.obtenerProductoPorId(req.params.id);
      res.json(producto);
    } catch (err) {
      next(err);
    }
  };

  const crear = async (req, res, next) => {
    try {
      const nuevoProducto = await service.crearProducto(req.body, req.file);
      res.status(201).json(nuevoProducto);
    } catch (err) {
      next(err);
    }
  };

  const actualizar = async (req, res, next) => {
    try {
      const productoActualizado = await service.actualizarProducto(req.params.id, req.body, req.file);
      res.json(productoActualizado);
    } catch (err) {
      next(err);
    }
  };

  const eliminar = async (req, res, next) => {
    try {
      await service.eliminarProducto(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  const subirImagen = async (req, res, next) => {
    try {
      const productoActualizado = await service.subirImagenProducto(req.params.id, req.file);
      res.json(productoActualizado);
    } catch (err) {
      next(err);
    }
  };

  const quitarImagen = async (req, res, next) => {
    try {
      const productoActualizado = await service.quitarImagenProducto(req.params.id);
      res.json(productoActualizado);
    } catch (err) {
      next(err);
    }
  };

  return {
    listar,
    listarHistorial,
    listarCatalogo,
    obtener,
    crear,
    actualizar,
    eliminar,
    subirImagen,
    quitarImagen
  };
};

const defaultController = crearProductosController();

export const listar = defaultController.listar;
export const listarHistorial = defaultController.listarHistorial;
export const listarCatalogo = defaultController.listarCatalogo;
export const obtener = defaultController.obtener;
export const crear = defaultController.crear;
export const actualizar = defaultController.actualizar;
export const eliminar = defaultController.eliminar;
export const subirImagen = defaultController.subirImagen;
export const quitarImagen = defaultController.quitarImagen;