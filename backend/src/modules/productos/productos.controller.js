import * as service from './productos.service.js';

export const listar = async (req, res, next) => {
  try {
    const productos = await service.listarProductos();
    res.json(productos);
  } catch (err) {
    next(err);
  }
};

export const listarCatalogo = async (req, res, next) => {
  try {
    const productos = await service.listarCatalogo();
    res.json(productos);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const producto = await service.obtenerProductoPorId(req.params.id);
    res.json(producto);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoProducto = await service.crearProducto(req.body, req.file);
    res.status(201).json(nuevoProducto);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const productoActualizado = await service.actualizarProducto(req.params.id, req.body, req.file);
    res.json(productoActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarProducto(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const subirImagen = async (req, res, next) => {
  try {
    const productoActualizado = await service.subirImagenProducto(req.params.id, req.file);
    res.json(productoActualizado);
  } catch (err) {
    next(err);
  }
};

export const quitarImagen = async (req, res, next) => {
  try {
    const productoActualizado = await service.quitarImagenProducto(req.params.id);
    res.json(productoActualizado);
  } catch (err) {
    next(err);
  }
};