import * as repository from './productos.repository.js';
import { normalizarProducto, porcentajeDescuento } from './productos.precio.js';
import { URL_BASE_IMAGENES, eliminarImagenFisica } from './productos.imagen.js';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// Si el producto queda en promoción, el precio promocional debe representar un
// descuento entero de entre 1% y 99%. El precio guardado se normaliza a centavos
// para que el porcentaje mostrado y el precio cobrado concuerden.
const validarPromocion = (precioVenta, precioPromo, enPromocion) => {
  if (enPromocion !== true) return;

  if (porcentajeDescuento(precioVenta, precioPromo) === null) {
    throw crearError(
      'Si el producto está en promoción, el precio promocional debe ser mayor a 0, menor al precio de venta y representar un descuento de entre 1% y 99%',
      400
    );
  }
};

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
  if (!data.nombre || !data.precioCosto || !data.precioVenta || !data.marca || data.enPromocion === undefined || !data.stock || !data.categoria || !data.peso || data.destacado === undefined) {
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

  if (data.precioPromo !== undefined && data.precioPromo !== null && data.precioPromo !== '' && !(Number(data.precioPromo) > 0)) {
    const error = new Error('El precio del producto en promocion debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  validarPromocion(data.precioVenta, data.precioPromo, data.enPromocion);

  if (data.stock <= 0) {
    const error = new Error('El stock del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await repository.create(normalizarProducto(data));
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

  if (data.precioPromo !== undefined && data.precioPromo !== null && data.precioPromo !== '' && !(Number(data.precioPromo) > 0)) {
    const error = new Error('El precio del producto en promocion debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  // Se mergea con el estado actual para que una actualización parcial no
  // sobrescriba con NULL las columnas que no vinieron en el body ni pierda la
  // promoción vigente.
  const fusionado = { ...productoExistente, ...data };

  // Se valida la promo contra el estado final del producto, no solo contra el
  // body, porque la actualización puede ser parcial.
  validarPromocion(fusionado.precioVenta, fusionado.precioPromo, fusionado.enPromocion);

  if (data.stock !== undefined && data.stock <= 0) {
    const error = new Error('El stock del producto debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  // Se normaliza el precio promocional al porcentaje entero de descuento para
  // que el porcentaje mostrado y el precio cobrado concuerden.
  const productoActualizado = await repository.update(id, normalizarProducto(fusionado));
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

// Guarda la imagen subida y actualiza la ruta del producto. Si la persistencia
// falla, se elimina el archivo recién escrito para no dejar basura en disco.
export const subirImagenProducto = async (id, archivo) => {
  const productoExistente = await repository.findById(id);
  if (!productoExistente) {
    throw crearError('Producto no encontrado', 404);
  }

  if (!archivo) {
    throw crearError('No se recibió ninguna imagen', 400);
  }

  const imagenAnterior = productoExistente.imagen;
  const nuevaImagen = `${URL_BASE_IMAGENES}/${archivo.filename}`;

  let productoActualizado;
  try {
    productoActualizado = await repository.updateImagen(id, nuevaImagen);
  } catch (error) {
    eliminarImagenFisica(nuevaImagen);
    throw error;
  }

  // La imagen anterior solo se borra si era un archivo nuestro; si era una URL
  // externa o un nombre legacy, la base ya quedó actualizada y no hay nada que
  // eliminar del disco.
  try {
    eliminarImagenFisica(imagenAnterior);
  } catch {
    // No se interrumpe la subida por no poder borrar el archivo viejo.
  }

  return productoActualizado;
};

export const quitarImagenProducto = async (id) => {
  const productoExistente = await repository.findById(id);
  if (!productoExistente) {
    throw crearError('Producto no encontrado', 404);
  }

  const imagenAnterior = productoExistente.imagen;
  const productoActualizado = await repository.updateImagen(id, null);

  try {
    eliminarImagenFisica(imagenAnterior);
  } catch {
    // Idem: el cambio en la base ya se aplicó.
  }

  return productoActualizado;
};