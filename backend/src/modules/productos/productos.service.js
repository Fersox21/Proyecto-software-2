import * as repository from './productos.repository.js';
import * as categoriasRepository from '../categorias/categorias.repository.js';
import * as tiposPromocionRepository from '../tiposPromocion/tiposPromocion.repository.js';
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

const resolverCategoria = async (data, fallback = null) => {
  const rawCategoriaId = data.categoriaId ?? data.categoria_id;
  if (rawCategoriaId !== undefined && rawCategoriaId !== null && rawCategoriaId !== '') {
    const idNum = Number(rawCategoriaId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      throw crearError('La categoría indicada no es válida', 400);
    }
    const cat = await categoriasRepository.findById(idNum);
    if (!cat) {
      throw crearError('La categoría indicada no existe', 400);
    }
    return { categoriaId: cat.id, categoria: cat.nombre };
  }

  const nombreCategoria = typeof data.categoria === 'string' ? data.categoria.trim() : '';
  if (nombreCategoria) {
    let cat = await categoriasRepository.findByNombreInsensitive(nombreCategoria);
    if (!cat) {
      cat = await categoriasRepository.create(nombreCategoria);
    }
    return { categoriaId: cat.id, categoria: cat.nombre };
  }

  if (fallback) {
    return {
      categoriaId: fallback.categoriaId ?? null,
      categoria: fallback.categoria
    };
  }

  return null;
};

const resolverTipoPromocion = async (data, fallback = undefined) => {
  const rawId = data.tipoPromocionId ?? data.tipo_promocion_id;

  if (rawId === undefined) {
    return fallback !== undefined ? fallback : null;
  }

  if (rawId === null || rawId === '') {
    return null;
  }

  const idNum = Number(rawId);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    throw crearError('El tipo de promoción indicado no es válido', 400);
  }

  const tipo = await tiposPromocionRepository.findById(idNum);
  if (!tipo) {
    throw crearError('El tipo de promoción indicado no existe', 400);
  }

  return tipo.id;
};

export const listarProductos = async () => {
  return await repository.findAll();
};

export const obtenerProductoPorId = async (id) => {
  const producto = await repository.findById(id);
  if (!producto) {
    throw crearError('Producto no encontrado', 404);
  }
  return producto;
};

export const crearProducto = async (data) => {
  const nombre = typeof data?.nombre === 'string' ? data.nombre.trim() : '';
  const marca = typeof data?.marca === 'string' ? data.marca.trim() : null;
  const descripcion =
    data?.descripcion !== undefined && data?.descripcion !== null
      ? String(data.descripcion).trim() || null
      : null;

  if (!nombre || data.precioCosto === undefined || data.precioVenta === undefined) {
    throw crearError('Faltan datos obligatorios para crear el producto', 400);
  }

  const categoriaResuelta = await resolverCategoria(data);
  if (!categoriaResuelta) {
    throw crearError('La categoría del producto es obligatoria', 400);
  }

  const precioCosto = Number(data.precioCosto);
  const precioVenta = Number(data.precioVenta);
  const stock = data.stock !== undefined ? Number(data.stock) : 0;
  const peso = data.peso !== undefined ? Number(data.peso) : 1;

  if (!Number.isFinite(precioCosto) || precioCosto <= 0) {
    throw crearError('El precio al costo del producto debe ser mayor a 0', 400);
  }

  if (!Number.isFinite(precioVenta) || precioVenta <= 0) {
    throw crearError('El precio de venta del producto debe ser mayor a 0', 400);
  }

  if (data.enPromocion && (data.precioPromo === undefined || data.precioPromo === null || Number(data.precioPromo) <= 0)) {
    throw crearError('El precio del producto en promoción debe ser mayor a 0', 400);
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw crearError('El stock del producto no puede ser negativo', 400);
  }

  if (!Number.isFinite(peso) || peso <= 0) {
    throw crearError('El peso del producto debe ser mayor a 0', 400);
  }

  const tipoPromocionId = await resolverTipoPromocion(data, null);

  return await repository.create({
    nombre,
    descripcion,
    marca,
    enPromocion: Boolean(data.enPromocion),
    destacado: Boolean(data.destacado),
    precioPromo: data.enPromocion ? Number(data.precioPromo) : null,
    stock,
    precioCosto,
    precioVenta,
    peso,
    categoria: categoriaResuelta.categoria,
    categoriaId: categoriaResuelta.categoriaId,
    tipoPromocionId
  });
};

export const actualizarProducto = async (id, data) => {
  const productoExistente = await repository.findById(id);
  if (!productoExistente) {
    throw crearError('Producto no encontrado', 404);
  }

  if (data.precioCosto !== undefined && Number(data.precioCosto) <= 0) {
    throw crearError('El precio al costo del producto debe ser mayor a 0', 400);
  }

  if (data.precioVenta !== undefined && Number(data.precioVenta) <= 0) {
    throw crearError('El precio de venta del producto debe ser mayor a 0', 400);
  }

  if (data.enPromocion && (data.precioPromo === undefined || data.precioPromo === null || Number(data.precioPromo) <= 0)) {
    throw crearError('El precio del producto en promoción debe ser mayor a 0', 400);
  }

  if (data.stock !== undefined && Number(data.stock) < 0) {
    throw crearError('El stock del producto no puede ser negativo', 400);
  }

  if (data.peso !== undefined && Number(data.peso) <= 0) {
    throw crearError('El peso del producto debe ser mayor a 0', 400);
  }

  const categoriaResuelta = await resolverCategoria(data, productoExistente);
  const tipoPromocionId = await resolverTipoPromocion(data, productoExistente.tipoPromocionId ?? null);

  const enPromocion = data.enPromocion !== undefined ? Boolean(data.enPromocion) : productoExistente.enPromocion;

  const datosActualizar = {
    nombre: data.nombre !== undefined ? String(data.nombre).trim() : productoExistente.nombre,
    descripcion:
      data.descripcion !== undefined
        ? (data.descripcion === null ? null : String(data.descripcion).trim() || null)
        : (productoExistente.descripcion ?? null),
    precioCosto: data.precioCosto !== undefined ? Number(data.precioCosto) : productoExistente.precioCosto,
    precioVenta: data.precioVenta !== undefined ? Number(data.precioVenta) : productoExistente.precioVenta,
    marca: data.marca !== undefined ? (data.marca === null ? null : String(data.marca).trim()) : productoExistente.marca,
    enPromocion,
    precioPromo: enPromocion
      ? (data.precioPromo !== undefined ? Number(data.precioPromo) : productoExistente.precioPromo)
      : null,
    stock: data.stock !== undefined ? Number(data.stock) : productoExistente.stock,
    categoria: categoriaResuelta.categoria,
    categoriaId: categoriaResuelta.categoriaId,
    tipoPromocionId,
    peso: data.peso !== undefined ? Number(data.peso) : productoExistente.peso,
    destacado: data.destacado !== undefined ? Boolean(data.destacado) : productoExistente.destacado
  };

  return await repository.update(id, datosActualizar);
};

export const eliminarProducto = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    throw crearError('Producto no encontrado', 404);
  }
  return true;
};

export const subirImagenProducto = async (id, archivo) => {
  if (!archivo) {
    throw crearError('Debe adjuntar una imagen', 400);
  }

  const productoExistente = await repository.findById(id);
  if (!productoExistente) {
    await eliminarImagenFisica(`${URL_BASE_IMAGENES}/${archivo.filename}`);
    throw crearError('Producto no encontrado', 404);
  }

  const rutaNueva = `${URL_BASE_IMAGENES}/${archivo.filename}`;
  const actualizado = await repository.updateImagen(id, rutaNueva);

  if (productoExistente.imagen && productoExistente.imagen !== rutaNueva) {
    await eliminarImagenFisica(productoExistente.imagen);
  }

  return actualizado;
};

export const quitarImagenProducto = async (id) => {
  const productoExistente = await repository.findById(id);
  if (!productoExistente) {
    throw crearError('Producto no encontrado', 404);
  }

  const actualizado = await repository.updateImagen(id, null);

  if (productoExistente.imagen) {
    await eliminarImagenFisica(productoExistente.imagen);
  }

  return actualizado;
};
