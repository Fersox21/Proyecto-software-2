import * as repository from './productos.repository.js';
import * as categoriasRepository from '../categorias/categorias.repository.js';
import * as tiposPromocionRepository from '../tiposPromocion/tiposPromocion.repository.js';
import { URL_BASE_IMAGENES, eliminarImagenFisica } from './productos.imagen.js';
import { porcentajeDescuento, precioConDescuento } from './productos.precio.js';

const DEFAULT_TIPO_PROMOCION_ID = 1;
const INT4_MAX = 2147483647;
const DECIMAL_10_2_MAX = 99999999.99;

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const normalizarBooleano = (valor) => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const limpio = valor.trim().toLowerCase();
    if (limpio === 'true' || limpio === '1') return true;
    if (limpio === 'false' || limpio === '0' || limpio === '') return false;
  }
  return Boolean(valor);
};

const normalizarTextoOpcional = (valor, campo = 'El campo') => {
  if (valor === undefined) return undefined;
  if (valor === null) return null;
  if (typeof valor !== 'string') {
    throw crearError(`${campo} debe ser un texto válido`, 400);
  }
  if (valor.includes('\u0000')) {
    throw crearError(`${campo} contiene caracteres inválidos`, 400);
  }
  const limpio = valor.trim();
  if (!limpio || limpio === 'null' || limpio === 'undefined') return null;
  return limpio;
};

const esVacio = (valor) =>
  valor === undefined ||
  valor === null ||
  (typeof valor === 'string' && ['','null','undefined'].includes(valor.trim()));

const validarEnteroNoNegativo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor < 0 || valor > INT4_MAX) {
      throw crearError(mensaje, 400);
    }
    return valor;
  }

  if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (!/^\d+$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    const numero = Number(limpio);
    if (!Number.isSafeInteger(numero) || numero < 0 || numero > INT4_MAX) {
      throw crearError(mensaje, 400);
    }
    return numero;
  }

  throw crearError(mensaje, 400);
};

const validarDecimalPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    const redondeado = Number(valor.toFixed(2));
    if (!Number.isFinite(redondeado) || redondeado <= 0 || redondeado > DECIMAL_10_2_MAX) {
      throw crearError(mensaje, 400);
    }
    return redondeado;
  }

  if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (!/^\d+(\.\d+)?$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    const numero = Number(limpio);
    const redondeado = Number(numero.toFixed(2));
    if (!Number.isFinite(redondeado) || redondeado <= 0 || redondeado > DECIMAL_10_2_MAX) {
      throw crearError(mensaje, 400);
    }
    return redondeado;
  }

  throw crearError(mensaje, 400);
};

const resolverPrecioPromo = (rawPromo, precioVenta) => {
  if (esVacio(rawPromo)) return null;

  const precioPromo = validarDecimalPositivo(
    rawPromo,
    'El precio del producto en promoción debe ser mayor a 0'
  );

  if (precioPromo >= precioVenta) {
    throw crearError('El precio promocional debe ser menor al precio de venta', 400);
  }

  const porcentaje = porcentajeDescuento(precioVenta, precioPromo);
  if (porcentaje === null) {
    throw crearError('El descuento promocional debe ser un porcentaje entero entre 1% y 99%', 400);
  }

  return precioConDescuento(precioVenta, porcentaje);
};

const resolverCategoria = async (data, fallback = null) => {
  const rawCategoriaId = data.categoriaId ?? data.categoria_id;
  if (!esVacio(rawCategoriaId)) {
    const idNum = validarEnteroNoNegativo(rawCategoriaId, 'La categoría indicada no es válida');
    if (idNum <= 0) {
      throw crearError('La categoría indicada no es válida', 400);
    }
    const cat = await categoriasRepository.findById(idNum);
    if (!cat) {
      throw crearError('La categoría indicada no existe', 400);
    }
    if (cat.activo === false) {
      throw crearError('La categoría indicada está inactiva', 400);
    }
    return { categoriaId: cat.id, categoria: cat.nombre };
  }

  const nombreCategoria = normalizarTextoOpcional(data.categoria, 'La categoría') ?? '';
  if (nombreCategoria) {
    if (nombreCategoria.length > 100) {
      throw crearError('El nombre de la categoría no puede superar los 100 caracteres', 400);
    }
    let cat = await categoriasRepository.findByNombreInsensitive(nombreCategoria);
    if (!cat) {
      cat = await categoriasRepository.create(nombreCategoria);
    } else if (cat.activo === false && typeof categoriasRepository.reactivar === 'function') {
      cat = await categoriasRepository.reactivar(cat.id, nombreCategoria);
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

const resolverTipoPromocionDefecto = async () => {
  if (typeof tiposPromocionRepository.findByNombreInsensitive === 'function') {
    const descuento = await tiposPromocionRepository.findByNombreInsensitive('Descuento');
    if (descuento?.activo) return descuento.id;

    const descuentoDirecto = await tiposPromocionRepository.findByNombreInsensitive('Descuento directo');
    if (descuentoDirecto?.activo) return descuentoDirecto.id;
  }

  if (typeof tiposPromocionRepository.findAll === 'function') {
    const tipos = await tiposPromocionRepository.findAll();
    const activo = tipos.find((t) => t.activo !== false);
    if (activo) return activo.id;
  }

  return null;
};

const resolverTipoPromocion = async (data, fallback = undefined) => {
  const rawId = data.tipoPromocionId ?? data.tipo_promocion_id;

  if (!esVacio(rawId)) {
    const idNum = validarEnteroNoNegativo(rawId, 'El tipo de promoción indicado no es válido');
    if (idNum <= 0) {
      throw crearError('El tipo de promoción indicado no es válido', 400);
    }

    const tipo = await tiposPromocionRepository.findById(idNum);
    if (!tipo) {
      throw crearError('El tipo de promoción indicado no existe', 400);
    }
    if (tipo.activo === false) {
      throw crearError('El tipo de promoción indicado está inactivo', 400);
    }

    return tipo.id;
  }

  const nombreTipo = normalizarTextoOpcional(
    data.tipoPromocionNombre ?? data.tipo_promocion_nombre,
    'El tipo de promoción'
  );
  if (nombreTipo && typeof tiposPromocionRepository.findByNombreInsensitive === 'function') {
    if (nombreTipo.length > 100) {
      throw crearError('El nombre del tipo de promoción no puede superar los 100 caracteres', 400);
    }
    let tipo = await tiposPromocionRepository.findByNombreInsensitive(nombreTipo);
    if (!tipo && typeof tiposPromocionRepository.create === 'function') {
      tipo = await tiposPromocionRepository.create(nombreTipo);
    } else if (tipo?.activo === false && typeof tiposPromocionRepository.reactivar === 'function') {
      tipo = await tiposPromocionRepository.reactivar(tipo.id, nombreTipo);
    }
    if (tipo) return tipo.id;
  }

  if (fallback !== undefined && fallback !== null) {
    return fallback;
  }

  return await resolverTipoPromocionDefecto();
};

export const listarProductos = async () => {
  return await repository.findAll();
};

export const listarHistorialProductos = async () => {
  return await repository.findHistorial();
};

export const listarCatalogo = async () => await repository.findAllCatalogo();

const validarId = (id, mensaje = 'El ID del producto no es válido') => {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0 || num > INT4_MAX) {
    throw crearError(mensaje, 400);
  }
  return num;
};

export const obtenerProductoPorId = async (id) => {
  const idValido = validarId(id);
  const producto = await repository.findById(idValido);
  if (!producto) {
    throw crearError('Producto no encontrado', 404);
  }
  return producto;
};

export const crearProducto = async (data, archivo) => {
  try {
    const nombre = normalizarTextoOpcional(data?.nombre, 'El nombre del producto') ?? '';
    const marca = normalizarTextoOpcional(data?.marca, 'La marca del producto') ?? null;
    const descripcion = normalizarTextoOpcional(data?.descripcion, 'La descripción del producto') ?? null;

    if (!nombre || esVacio(data?.precioCosto) || esVacio(data?.precioVenta)) {
      throw crearError('Faltan datos obligatorios para crear el producto', 400);
    }

    if (nombre.length > 100) {
      throw crearError('El nombre del producto no puede superar los 100 caracteres', 400);
    }

    if (marca && marca.length > 25) {
      throw crearError('La marca del producto no puede superar los 25 caracteres', 400);
    }

    if (descripcion && descripcion.length > 2000) {
      throw crearError('La descripción del producto no puede superar los 2000 caracteres', 400);
    }

    const rawVisibleCatalogo = data?.visibleCatalogo ?? data?.visible_catalogo;
    const visibleCatalogo =
      rawVisibleCatalogo !== undefined ? normalizarBooleano(rawVisibleCatalogo) : false;
    const imagen = archivo?.filename ? archivo.filename : null;

    if (visibleCatalogo) {
      throw crearError('No hay lotes vigentes para publicar el producto en el catálogo', 400);
    }

    if (visibleCatalogo && (!imagen || !String(imagen).trim())) {
      throw crearError('Debe cargar una imagen para publicar el producto en el catálogo', 400);
    }

    const categoriaResuelta = await resolverCategoria(data);
    if (!categoriaResuelta) {
      throw crearError('La categoría del producto es obligatoria', 400);
    }

    const precioCosto = validarDecimalPositivo(
      data.precioCosto,
      'El precio al costo del producto debe ser mayor a 0'
    );
    const precioVenta = validarDecimalPositivo(
      data.precioVenta,
      'El precio de venta del producto debe ser mayor a 0'
    );
    const stock = 0; // El stock se calcula automáticamente como la suma de sus lotes activos y no vencidos

    const enPromocion = normalizarBooleano(data.enPromocion);
    const destacado = normalizarBooleano(data.destacado);
    const rawPrecioPromo = data.precioPromo !== undefined ? data.precioPromo : data.precio_promo;
    const precioPromo = enPromocion ? resolverPrecioPromo(rawPrecioPromo, precioVenta) : null;
    const tipoPromocionId = enPromocion ? await resolverTipoPromocion(data, null) : null;

    return await repository.create({
      nombre,
      descripcion,
      marca,
      enPromocion,
      destacado,
      visibleCatalogo,
      precioPromo,
      stock,
      precioCosto,
      precioVenta,
      categoria: categoriaResuelta.categoria,
      categoriaId: categoriaResuelta.categoriaId,
      tipoPromocionId,
      imagen
    });
  } catch (err) {
    if (archivo?.filename) {
      eliminarImagenFisica(archivo.filename);
    }
    throw err;
  }
};

export const actualizarProducto = async (id, data, archivo) => {
  try {
    const idValido = validarId(id);
    const productoExistente = await repository.findById(idValido);
    if (!productoExistente || productoExistente.activo === false) {
      throw crearError('Producto no encontrado', 404);
    }

    const precioCosto =
      data.precioCosto !== undefined
        ? validarDecimalPositivo(
            data.precioCosto,
            'El precio al costo del producto debe ser mayor a 0'
          )
        : productoExistente.precioCosto;

    const precioVenta =
      data.precioVenta !== undefined
        ? validarDecimalPositivo(
            data.precioVenta,
            'El precio de venta del producto debe ser mayor a 0'
          )
        : productoExistente.precioVenta;

    const stock = productoExistente.stock; // El stock se administra automáticamente a través de los lotes

    const enPromocion =
      data.enPromocion !== undefined
        ? normalizarBooleano(data.enPromocion)
        : productoExistente.enPromocion;

    let precioPromo = null;
    if (enPromocion) {
      const hasPrecioPromo = data.precioPromo !== undefined || data.precio_promo !== undefined;
      const rawPromo = hasPrecioPromo
        ? (data.precioPromo !== undefined ? data.precioPromo : data.precio_promo)
        : productoExistente.precioPromo;
      precioPromo = resolverPrecioPromo(rawPromo, precioVenta);
    }

    const categoriaResuelta = await resolverCategoria(data, productoExistente);
    const tipoPromocionId = enPromocion
      ? await resolverTipoPromocion(data, productoExistente.tipoPromocionId ?? null)
      : null;

    const nombre =
      data.nombre !== undefined
        ? (normalizarTextoOpcional(data.nombre, 'El nombre del producto') ?? '')
        : productoExistente.nombre;
    if (!nombre) {
      throw crearError('El nombre del producto es obligatorio', 400);
    }
    if (nombre.length > 100) {
      throw crearError('El nombre del producto no puede superar los 100 caracteres', 400);
    }

    const descripcion =
      data.descripcion !== undefined
        ? normalizarTextoOpcional(data.descripcion, 'La descripción del producto')
        : (productoExistente.descripcion ?? null);
    if (descripcion && descripcion.length > 2000) {
      throw crearError('La descripción del producto no puede superar los 2000 caracteres', 400);
    }

    const marca =
      data.marca !== undefined
        ? normalizarTextoOpcional(data.marca, 'La marca del producto')
        : productoExistente.marca;
    if (marca && marca.length > 25) {
      throw crearError('La marca del producto no puede superar los 25 caracteres', 400);
    }

    const destacado =
      data.destacado !== undefined
        ? normalizarBooleano(data.destacado)
        : productoExistente.destacado;

    const rawVisibleCatalogo = data.visibleCatalogo ?? data.visible_catalogo;
    const visibleCatalogo =
      rawVisibleCatalogo !== undefined
        ? normalizarBooleano(rawVisibleCatalogo)
        : Boolean(productoExistente.visibleCatalogo);

    if (visibleCatalogo && !productoExistente.tieneLoteVigente) {
      throw crearError('No hay lotes vigentes para publicar el producto en el catálogo', 400);
    }

    const imagen = archivo?.filename ? archivo.filename : (productoExistente.imagen ?? null);

    if (visibleCatalogo && (!imagen || !String(imagen).trim())) {
      throw crearError('Debe cargar una imagen para publicar el producto en el catálogo', 400);
    }

    const actualizado = await repository.update(idValido, {
      nombre,
      descripcion,
      precioCosto,
      precioVenta,
      marca,
      enPromocion,
      precioPromo,
      stock,
      categoria: categoriaResuelta.categoria,
      categoriaId: categoriaResuelta.categoriaId,
      tipoPromocionId,
      destacado,
      visibleCatalogo,
      imagen
    });

    if (archivo && productoExistente.imagen && productoExistente.imagen !== archivo.filename) {
      eliminarImagenFisica(productoExistente.imagen);
    }

    return actualizado;
  } catch (err) {
    if (archivo?.filename) {
      eliminarImagenFisica(archivo.filename);
    }
    throw err;
  }
};

export const eliminarProducto = async (id) => {
  const idValido = validarId(id);
  const rowCount = await repository.remove(idValido);
  if (rowCount === 0) {
    throw crearError('Producto no encontrado', 404);
  }
  return true;
};

export const subirImagenProducto = async (id, archivo) => {
  if (!archivo) {
    throw crearError('Debe adjuntar una imagen', 400);
  }

  let idValido;
  try {
    idValido = validarId(id);
  } catch (err) {
    await eliminarImagenFisica(archivo.filename);
    throw err;
  }

  const productoExistente = await repository.findById(idValido);
  if (!productoExistente || productoExistente.activo === false) {
    await eliminarImagenFisica(archivo.filename);
    throw crearError('Producto no encontrado', 404);
  }

  const rutaNueva = archivo.filename;
  const actualizado = await repository.updateImagen(idValido, rutaNueva);

  if (productoExistente.imagen && productoExistente.imagen !== rutaNueva) {
    await eliminarImagenFisica(productoExistente.imagen);
  }

  return actualizado;
};

export const quitarImagenProducto = async (id) => {
  const idValido = validarId(id);
  const productoExistente = await repository.findById(idValido);
  if (!productoExistente || productoExistente.activo === false) {
    throw crearError('Producto no encontrado', 404);
  }

  const actualizado = await repository.updateImagen(idValido, null, false);

  if (productoExistente.imagen) {
    await eliminarImagenFisica(productoExistente.imagen);
  }

  return actualizado;
};
