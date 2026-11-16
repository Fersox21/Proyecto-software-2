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
  if (
    !data.nombre ||
    data.precioCosto === undefined ||
    data.precioVenta === undefined ||
    !data.marca ||
    data.stock === undefined ||
    !data.categoria ||
    data.peso === undefined
  ) {
    const error = new Error('Faltan datos obligatorios para crear el producto');
    error.status = 400;
    throw error;
  }

  if (Number(data.precioCosto) <= 0) {
    const error = new Error('El precio al costo del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (Number(data.precioVenta) <= 0) {
    const error = new Error('El precio de venta del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.enPromocion && (data.precioPromo === undefined || data.precioPromo === null || Number(data.precioPromo) <= 0)) {
    const error = new Error('El precio del producto en promoción debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (Number(data.stock) < 0) {
    const error = new Error('El stock del producto no puede ser negativo');
    error.status = 400;
    throw error;
  }

  if (Number(data.peso) <= 0) {
    const error = new Error('El peso del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await repository.create({
    ...data,
    enPromocion: Boolean(data.enPromocion),
    destacado: Boolean(data.destacado),
    precioPromo: data.enPromocion ? Number(data.precioPromo) : null,
    stock: Number(data.stock),
    precioCosto: Number(data.precioCosto),
    precioVenta: Number(data.precioVenta),
    peso: Number(data.peso)
  });
};

export const actualizarProducto = async (id, data) => {
  const productoExistente = await repository.findById(id);
  if (!productoExistente) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  if (data.precioCosto !== undefined && Number(data.precioCosto) <= 0) {
    const error = new Error('El precio al costo del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precioVenta !== undefined && Number(data.precioVenta) <= 0) {
    const error = new Error('El precio de venta del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.enPromocion && (data.precioPromo === undefined || data.precioPromo === null || Number(data.precioPromo) <= 0)) {
    const error = new Error('El precio del producto en promoción debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.stock !== undefined && Number(data.stock) < 0) {
    const error = new Error('El stock del producto no puede ser negativo');
    error.status = 400;
    throw error;
  }

  if (data.peso !== undefined && Number(data.peso) <= 0) {
    const error = new Error('El peso del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const datosActualizar = {
    nombre: data.nombre ?? productoExistente.nombre,
    precioCosto: data.precioCosto !== undefined ? Number(data.precioCosto) : productoExistente.precioCosto,
    precioVenta: data.precioVenta !== undefined ? Number(data.precioVenta) : productoExistente.precioVenta,
    marca: data.marca ?? productoExistente.marca,
    enPromocion: data.enPromocion !== undefined ? Boolean(data.enPromocion) : productoExistente.enPromocion,
    precioPromo: data.enPromocion ? (data.precioPromo !== undefined ? Number(data.precioPromo) : productoExistente.precioPromo) : null,
    stock: data.stock !== undefined ? Number(data.stock) : productoExistente.stock,
    categoria: data.categoria ?? productoExistente.categoria,
    peso: data.peso !== undefined ? Number(data.peso) : productoExistente.peso,
    destacado: data.destacado !== undefined ? Boolean(data.destacado) : productoExistente.destacado
  };

  const productoActualizado = await repository.update(id, datosActualizar);
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
