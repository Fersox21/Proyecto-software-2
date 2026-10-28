import * as repository from './productos.repository.js';

export const listarProductos = async () => {
  return await repository.findAll();
};

export const obtenerProductoPorId = async (id) => {
  const producto = await repository.findById(id);
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return producto;
};

export const crearProducto = async (data) => {
  if (!data.nombre || !data.precioCosto || !data.precioVenta || !data.marca || !data.enPromocion || !data.stock || !data.categoria || !data.peso || !data.destacado) {
    const error = new Error('Faltan datos obligatorios para crear el producto');
    error.status = 400;
    throw error;
  }

  if (data.precioCosto <= 0) {
    const error = new Error('El precio al costo del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precioVenta <= 0) {
    const error = new Error('El precio de venta del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precioPromo !== undefined && data.precioPromo <= 0) {
    const error = new Error('El precio del producto en promocion debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.stock <= 0) {
    const error = new Error('El stock del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await repository.create(data);
};

export const actualizarProducto = async (id, data) => {
  const productoExistente = await repository.findById(id);
    if (!productoExistente) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      throw error;
    }

  if (data.precioCosto !== undefined && data.precioCosto <= 0) {
    const error = new Error('El precio al costo del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precioVenta !== undefined && data.precioVenta <= 0) {
    const error = new Error('El precio de venta del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precioPromo = undefined && data.precioPromo <= 0) {
    const error = new Error('El precio del producto en promocion debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.stock !== undefined && data.stock <= 0) {
    const error = new Error('El stock del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const productoActualizado = await repository.update(id, data);
  return productoActualizado;
};

export const eliminarProducto = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return true;
};