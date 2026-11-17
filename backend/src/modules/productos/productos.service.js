import * as defaultRepository from './productos.repository.js';
import * as defaultCategoriasRepository from '../categorias/categorias.repository.js';
import * as defaultTiposPromocionRepository from '../tiposPromocion/tiposPromocion.repository.js';
import { URL_BASE_IMAGENES, eliminarImagenFisica } from './productos.imagen.js';
import { porcentajeDescuento, precioConDescuento } from './productos.precio.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

const normalizarBooleano = (valor) => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const limpio = valor.trim().toLowerCase();
    if (limpio === 'true' || limpio === '1') return true;
    if (limpio === 'false' || limpio === '0' || limpio === '') return false;
  }
  return Boolean(valor);
};

const normalizarTextoOpcional = (valor) => {
  if (valor === undefined) return undefined;
  if (valor === null) return null;
  const limpio = String(valor).trim();
  if (!limpio || limpio === 'null' || limpio === 'undefined') return null;
  return limpio;
};

const esVacio = (valor) =>
  valor === undefined ||
  valor === null ||
  (typeof valor === 'string' && ['', 'null', 'undefined'].includes(valor.trim()));

const validarEnteroNoNegativo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor < 0) {
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
    if (!Number.isSafeInteger(numero) || numero < 0) {
      throw crearError(mensaje, 400);
    }
    return numero;
  }

  throw crearError(mensaje, 400);
};

const validarDecimalPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw crearError(mensaje, 400);
    }
    return valor;
  }

  if (typeof valor === 'string') {
    const limpio = valor.trim();
    if (!/^\d+(\.\d+)?$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    const numero = Number(limpio);
    if (!Number.isFinite(numero) || numero <= 0) {
      throw crearError(mensaje, 400);
    }
    return numero;
  }

  throw crearError(mensaje, 400);
};

const resolverPrecioPromo = (rawPromo, precioVenta) => {
  if (esVacio(rawPromo)) {
    throw crearError('El precio promocional es obligatorio cuando el producto está en promoción', 400);
  }

  const precioPromo = validarDecimalPositivo(
    rawPromo,
    'El precio del producto en promoción debe ser mayor a 0'
  );

  if (precioPromo >= precioVenta) {
    throw crearError('El precio promocional debe ser menor al precio de venta', 400);
  }

  const descuento = porcentajeDescuento(precioVenta, precioPromo);
  if (descuento === null) {
    throw crearError('El descuento de la promoción debe ser de al menos 1% y menor al 100%', 400);
  }

  return {
    precioPromo: precioConDescuento(precioVenta, descuento),
    descuento
  };
};

export const crearProductosService = ({
  repository = defaultRepository,
  categoriasRepository = defaultCategoriasRepository,
  tiposPromocionRepository = defaultTiposPromocionRepository
} = {}) => {
  const resolverCategoria = async (data, fallback = null) => {
    const rawCategoriaId = data.categoriaId ?? data.categoria_id;
    if (!esVacio(rawCategoriaId)) {
      const idNum = validarEnteroNoNegativo(rawCategoriaId, 'La categoría indicada no es válida');
      if (idNum <= 0) {
        throw crearError('La categoría indicada no es válida', 400);
      }
      const cat = await categoriasRepository.findById(idNum);
      if (!cat || cat.activo === false) {
        throw crearError('La categoría indicada no existe', 400);
      }
      return { categoriaId: cat.id, categoria: cat.nombre };
    }

    const nombreCategoria = normalizarTextoOpcional(data.categoria) ?? '';
    if (nombreCategoria) {
      let cat = await categoriasRepository.findByNombreInsensitive(nombreCategoria);
      if (!cat) {
        cat = await categoriasRepository.create(nombreCategoria);
      } else if (cat.activo === false && categoriasRepository.reactivar) {
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

  const resolverTipoPromocion = async (data, fallback = undefined) => {
    const rawId = data.tipoPromocionId ?? data.tipo_promocion_id;

    if (rawId === undefined) {
      return fallback !== undefined ? fallback : null;
    }

    if (esVacio(rawId)) {
      return null;
    }

    const idNum = validarEnteroNoNegativo(rawId, 'El tipo de promoción indicado no es válido');
    if (idNum <= 0) {
      throw crearError('El tipo de promoción indicado no es válido', 400);
    }

    const tipo = await tiposPromocionRepository.findById(idNum);
    if (!tipo || tipo.activo === false) {
      throw crearError('El tipo de promoción indicado no existe', 400);
    }

    return tipo.id;
  };

  const listarProductos = async () => {
    return await repository.findAll();
  };

  const listarHistorialProductos = async () => {
    return await repository.findHistorial();
  };

  const listarCatalogo = async () => await repository.findAllCatalogo();

  const obtenerProductoPorId = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de producto inválido');
    const producto = await repository.findById(idNum);
    if (!producto) {
      throw crearError('Producto no encontrado', 404);
    }
    return producto;
  };

  const crearProducto = async (data, archivo) => {
    try {
      const nombre = normalizarTextoOpcional(data?.nombre) ?? '';
      const marca = normalizarTextoOpcional(data?.marca) ?? null;
      const descripcion = normalizarTextoOpcional(data?.descripcion) ?? null;

      if (!nombre || esVacio(data?.precioCosto) || esVacio(data?.precioVenta)) {
        throw crearError('Faltan datos obligatorios para crear el producto', 400);
      }

      const rawVisibleCatalogo = data?.visibleCatalogo ?? data?.visible_catalogo;
      const visibleCatalogo =
        rawVisibleCatalogo !== undefined ? normalizarBooleano(rawVisibleCatalogo) : false;
      const imagen = archivo?.filename ? `${URL_BASE_IMAGENES}/${archivo.filename}` : null;

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
      const stock = 0;

      const enPromocion = normalizarBooleano(data.enPromocion);
      const destacado = normalizarBooleano(data.destacado);
      const rawPrecioPromo = data.precioPromo !== undefined ? data.precioPromo : data.precio_promo;
      const promoResuelta = enPromocion ? resolverPrecioPromo(rawPrecioPromo, precioVenta) : null;
      const precioPromo = promoResuelta ? promoResuelta.precioPromo : null;
      const descuento = promoResuelta ? promoResuelta.descuento : null;
      const tipoPromocionId = enPromocion ? await resolverTipoPromocion(data, null) : null;

      return await repository.create({
        nombre,
        descripcion,
        marca,
        enPromocion,
        destacado,
        visibleCatalogo,
        precioPromo,
        descuento,
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

  const actualizarProducto = async (id, data, archivo) => {
    try {
      const idNum = validarIdEnteroPositivo(id, 'ID de producto inválido');
      const productoExistente = await repository.findById(idNum);
      if (!productoExistente) {
        throw crearError('Producto no encontrado', 404);
      }

      const precioCosto =
        data?.precioCosto !== undefined
          ? validarDecimalPositivo(
              data.precioCosto,
              'El precio al costo del producto debe ser mayor a 0'
            )
          : productoExistente.precioCosto;

      const precioVenta =
        data?.precioVenta !== undefined
          ? validarDecimalPositivo(
              data.precioVenta,
              'El precio de venta del producto debe ser mayor a 0'
            )
          : productoExistente.precioVenta;

      const stock = productoExistente.stock;

      const enPromocion =
        data?.enPromocion !== undefined
          ? normalizarBooleano(data.enPromocion)
          : productoExistente.enPromocion;

      let precioPromo = null;
      let descuento = null;
      if (enPromocion) {
        const hasPrecioPromo = data?.precioPromo !== undefined || data?.precio_promo !== undefined;
        const rawPromo = hasPrecioPromo
          ? (data.precioPromo !== undefined ? data.precioPromo : data.precio_promo)
          : productoExistente.precioPromo;
        const promoResuelta = resolverPrecioPromo(rawPromo, precioVenta);
        precioPromo = promoResuelta.precioPromo;
        descuento = promoResuelta.descuento;
      }

      const categoriaResuelta = await resolverCategoria(data ?? {}, productoExistente);
      const tipoPromocionId = enPromocion
        ? await resolverTipoPromocion(data ?? {}, productoExistente.tipoPromocionId ?? null)
        : null;

      const nombre =
        data?.nombre !== undefined
          ? (normalizarTextoOpcional(data.nombre) ?? '')
          : productoExistente.nombre;
      if (!nombre) {
        throw crearError('El nombre del producto es obligatorio', 400);
      }

      const descripcion =
        data?.descripcion !== undefined
          ? normalizarTextoOpcional(data.descripcion)
          : (productoExistente.descripcion ?? null);

      const marca =
        data?.marca !== undefined
          ? normalizarTextoOpcional(data.marca)
          : productoExistente.marca;

      const destacado =
        data?.destacado !== undefined
          ? normalizarBooleano(data.destacado)
          : productoExistente.destacado;

      const rawVisibleCatalogo = data?.visibleCatalogo ?? data?.visible_catalogo;
      const visibleCatalogo =
        rawVisibleCatalogo !== undefined
          ? normalizarBooleano(rawVisibleCatalogo)
          : Boolean(productoExistente.visibleCatalogo);

      if (visibleCatalogo && !productoExistente.tieneLoteVigente) {
        throw crearError('No hay lotes vigentes para publicar el producto en el catálogo', 400);
      }

      const imagen = archivo?.filename
        ? `${URL_BASE_IMAGENES}/${archivo.filename}`
        : (productoExistente.imagen ?? null);

      if (visibleCatalogo && (!imagen || !String(imagen).trim())) {
        throw crearError('Debe cargar una imagen para publicar el producto en el catálogo', 400);
      }

      const actualizado = await repository.update(idNum, {
        nombre,
        descripcion,
        precioCosto,
        precioVenta,
        marca,
        enPromocion,
        precioPromo,
        descuento,
        stock,
        categoria: categoriaResuelta.categoria,
        categoriaId: categoriaResuelta.categoriaId,
        tipoPromocionId,
        destacado,
        visibleCatalogo,
        imagen
      });

      if (archivo && productoExistente.imagen && productoExistente.imagen !== imagen) {
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

  const eliminarProducto = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de producto inválido');
    const rowCount = await repository.remove(idNum);
    if (rowCount === 0) {
      throw crearError('Producto no encontrado', 404);
    }
    return true;
  };

  const subirImagenProducto = async (id, archivo) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de producto inválido');
    if (!archivo) {
      throw crearError('Debe adjuntar una imagen', 400);
    }

    const productoExistente = await repository.findById(idNum);
    if (!productoExistente) {
      eliminarImagenFisica(`${URL_BASE_IMAGENES}/${archivo.filename}`);
      throw crearError('Producto no encontrado', 404);
    }

    const rutaNueva = `${URL_BASE_IMAGENES}/${archivo.filename}`;
    const actualizado = await repository.updateImagen(idNum, rutaNueva);

    if (productoExistente.imagen && productoExistente.imagen !== rutaNueva) {
      eliminarImagenFisica(productoExistente.imagen);
    }

    return actualizado;
  };

  const quitarImagenProducto = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de producto inválido');
    const productoExistente = await repository.findById(idNum);
    if (!productoExistente) {
      throw crearError('Producto no encontrado', 404);
    }

    const actualizado = await repository.updateImagen(idNum, null, false);

    if (productoExistente.imagen) {
      eliminarImagenFisica(productoExistente.imagen);
    }

    return actualizado;
  };

  return {
    listarProductos,
    listarHistorialProductos,
    listarCatalogo,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    subirImagenProducto,
    quitarImagenProducto
  };
};

const defaultService = crearProductosService();

export const listarProductos = defaultService.listarProductos;
export const listarHistorialProductos = defaultService.listarHistorialProductos;
export const listarCatalogo = defaultService.listarCatalogo;
export const obtenerProductoPorId = defaultService.obtenerProductoPorId;
export const crearProducto = defaultService.crearProducto;
export const actualizarProducto = defaultService.actualizarProducto;
export const eliminarProducto = defaultService.eliminarProducto;
export const subirImagenProducto = defaultService.subirImagenProducto;
export const quitarImagenProducto = defaultService.quitarImagenProducto;
