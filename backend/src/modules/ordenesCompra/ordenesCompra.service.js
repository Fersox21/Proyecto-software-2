import * as repository from './ordenesCompra.repository.js';
import * as repositoryProveedor from '../proveedores/proveedores.repository.js';
import { validarNombreProveedor, validarTelefonoProveedor } from '../proveedores/proveedores.service.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import * as repositoryCategoria from '../categorias/categorias.repository.js';
import * as repositoryTipoPromocion from '../tiposPromocion/tiposPromocion.repository.js';
import { eliminarImagenFisica } from '../productos/productos.imagen.js';
import { porcentajeDescuento, precioConDescuento } from '../productos/productos.precio.js';

const FORMATO_FECHA = 'YYYY-MM-DD';
const DEFAULT_TIPO_PROMOCION_ID = 1;
const INT4_MAX = 2147483647;
const DECIMAL_10_2_MAX = 99999999.99;

const resolverTipoPromocionDefecto = async () => {
  if (typeof repositoryTipoPromocion.findByNombreInsensitive === 'function') {
    const descuento = await repositoryTipoPromocion.findByNombreInsensitive('Descuento');
    if (descuento?.activo) return descuento.id;

    const descuentoDirecto = await repositoryTipoPromocion.findByNombreInsensitive('Descuento directo');
    if (descuentoDirecto?.activo) return descuentoDirecto.id;
  }

  if (typeof repositoryTipoPromocion.findAll === 'function') {
    const todos = await repositoryTipoPromocion.findAll();
    const primeroActivo = todos.find((tp) => tp?.activo !== false);
    if (primeroActivo) return primeroActivo.id;
  }

  return null;
};

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const limpiarArchivos = (archivos = []) => {
  if (!Array.isArray(archivos)) return;
  for (const archivo of archivos) {
    if (archivo?.filename) {
      eliminarImagenFisica(archivo.filename);
    }
  }
};

const limpiarArchivosNoUsados = (archivos = [], nombresUsados = new Set()) => {
  if (!Array.isArray(archivos)) return;
  for (const archivo of archivos) {
    if (archivo?.filename && !nombresUsados.has(archivo.filename)) {
      eliminarImagenFisica(archivo.filename);
    }
  }
};

const mapearArchivosPorCampo = (archivos = []) => {
  const mapa = new Map();
  if (!Array.isArray(archivos)) return mapa;
  for (const archivo of archivos) {
    if (archivo?.fieldname && !mapa.has(archivo.fieldname)) {
      mapa.set(archivo.fieldname, archivo);
    }
  }
  return mapa;
};

const validarTexto = (valor, campo, { requerido = false, max = null } = {}) => {
  if (valor === undefined || valor === null) {
    if (requerido) throw crearError(`${campo} es obligatorio`, 400);
    return null;
  }
  if (typeof valor !== 'string') {
    throw crearError(`${campo} debe ser un texto válido`, 400);
  }
  if (valor.includes('\u0000')) {
    throw crearError(`${campo} contiene caracteres inválidos`, 400);
  }
  const limpio = valor.trim();
  if (!limpio) {
    if (requerido) throw crearError(`${campo} es obligatorio`, 400);
    return null;
  }
  if (max !== null && limpio.length > max) {
    throw crearError(`${campo} no puede superar los ${max} caracteres`, 400);
  }
  return limpio;
};

const validarEnteroPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor <= 0 || valor > INT4_MAX) {
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
    if (!Number.isSafeInteger(numero) || numero <= 0 || numero > INT4_MAX) {
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

const validarFecha = (valor, campo) => {
  const fecha = typeof valor === 'string' ? valor.trim() : '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw crearError(`${campo} debe tener el formato ${FORMATO_FECHA}`, 400);
  }

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    comprobacion.getUTCFullYear() !== anio ||
    comprobacion.getUTCMonth() !== mes - 1 ||
    comprobacion.getUTCDate() !== dia
  ) {
    throw crearError(`${campo} no es una fecha válida`, 400);
  }

  return fecha;
};

const validarProductoNuevo = async (productoNuevo, imagen) => {
  if (!productoNuevo || typeof productoNuevo !== 'object' || Array.isArray(productoNuevo)) {
    throw crearError('Los datos del producto nuevo no son válidos', 400);
  }

  const nombre = validarTexto(productoNuevo.nombre, 'El nombre del producto nuevo', {
    requerido: true,
    max: 100
  });

  const precioCosto = validarDecimalPositivo(
    productoNuevo.precioCosto,
    'El precio de costo del producto nuevo debe ser mayor a 0'
  );
  const precioVenta = validarDecimalPositivo(
    productoNuevo.precioVenta,
    'El precio de venta del producto nuevo debe ser mayor a 0'
  );

  let categoriaId = null;
  let categoriaNuevaNombre = null;

  const rawCatId = productoNuevo.categoriaId ?? productoNuevo.categoria_id;
  const rawCatNueva = validarTexto(productoNuevo.categoriaNuevaNombre, 'El nombre de la nueva categoría', {
    requerido: false,
    max: 100
  });
  const rawCatTexto = validarTexto(productoNuevo.categoria, 'El nombre de la categoría', {
    requerido: false,
    max: 100
  });

  if (rawCatNueva) {
    categoriaNuevaNombre = rawCatNueva;
  } else if (rawCatId !== undefined && rawCatId !== null && rawCatId !== '') {
    const idCat = Number(rawCatId);
    if (!Number.isInteger(idCat) || idCat <= 0 || idCat > INT4_MAX) {
      throw crearError('La categoría indicada para el producto nuevo no es válida', 400);
    }
    const catExistente = await repositoryCategoria.findById(idCat);
    if (!catExistente) {
      throw crearError('La categoría indicada para el producto nuevo no existe', 400);
    }
    if (catExistente.activo === false) {
      throw crearError('La categoría indicada para el producto nuevo está inactiva', 400);
    }
    categoriaId = catExistente.id;
  } else if (rawCatTexto) {
    categoriaNuevaNombre = rawCatTexto;
  } else {
    throw crearError('Debe indicar una categoría para el producto nuevo', 400);
  }

  const enPromocion =
    productoNuevo.enPromocion === true ||
    ['true', '1'].includes(String(productoNuevo.enPromocion ?? '').trim().toLowerCase());

  let precioPromo = null;
  let tipoPromocionId = null;
  let tipoPromocionNuevaNombre = null;

  if (enPromocion) {
    const rawPrecioPromo = productoNuevo.precioPromo ?? productoNuevo.precio_promo;
    precioPromo = validarDecimalPositivo(
      rawPrecioPromo,
      'El precio del producto en promoción debe ser mayor a 0'
    );
    if (precioPromo >= precioVenta) {
      throw crearError('El precio promocional debe ser menor al precio de venta', 400);
    }
    const pct = porcentajeDescuento(precioVenta, precioPromo);
    if (pct === null) {
      throw crearError('El descuento promocional debe ser un porcentaje entero entre 1% y 99%', 400);
    }
    precioPromo = precioConDescuento(precioVenta, pct);

    const rawTipoId = productoNuevo.tipoPromocionId ?? productoNuevo.tipo_promocion_id;
    const rawTipoNuevo = validarTexto(
      productoNuevo.tipoPromocionNuevaNombre ?? productoNuevo.tipoPromocionNombre,
      'El nombre del nuevo tipo de promoción',
      { requerido: false, max: 100 }
    );

    if (rawTipoNuevo) {
      tipoPromocionNuevaNombre = rawTipoNuevo;
    } else if (rawTipoId !== undefined && rawTipoId !== null && rawTipoId !== '') {
      const idTipo = Number(rawTipoId);
      if (!Number.isInteger(idTipo) || idTipo <= 0 || idTipo > INT4_MAX) {
        throw crearError('El tipo de promoción indicado para el producto nuevo no es válido', 400);
      }
      const tipoExistente = await repositoryTipoPromocion.findById(idTipo);
      if (!tipoExistente) {
        throw crearError('El tipo de promoción indicado para el producto nuevo no existe', 400);
      }
      if (tipoExistente.activo === false) {
        throw crearError('El tipo de promoción indicado para el producto nuevo está inactivo', 400);
      }
      tipoPromocionId = tipoExistente.id;
    } else {
      tipoPromocionId = await resolverTipoPromocionDefecto();
    }
  }

  const marca = validarTexto(productoNuevo.marca, 'La marca del producto nuevo', {
    requerido: false,
    max: 25
  });

  const descripcion = validarTexto(productoNuevo.descripcion, 'La descripción del producto nuevo', {
    requerido: false,
    max: 2000
  });

  return {
    nombre,
    marca,
    descripcion,
    precioCosto,
    precioVenta,
    enPromocion,
    precioPromo,
    destacado: Boolean(productoNuevo.destacado),
    categoriaId,
    categoriaNuevaNombre,
    tipoPromocionId,
    tipoPromocionNuevaNombre,
    imagen
  };
};

const calcularYValidarTotalLote = (lote, precioCosto, cantidad) => {
  const rawTotal = lote.total ?? lote.precioTotal;

  if (rawTotal !== undefined && rawTotal !== null && rawTotal !== '') {
    const enviado = validarDecimalPositivo(
      rawTotal,
      'El total del lote debe ser un número mayor a 0'
    );
    return Number(enviado.toFixed(2));
  }

  const calculado = Number((Number(precioCosto) * cantidad).toFixed(2));
  if (!Number.isFinite(calculado) || calculado <= 0 || calculado > DECIMAL_10_2_MAX) {
    throw crearError('El total calculado del lote supera el límite permitido', 400);
  }
  return calculado;
};

const validarLote = async (lote, indice, archivosPorCampo, fechaOrden = null) => {
  if (!lote || typeof lote !== 'object') {
    throw crearError('Los datos del lote no son válidos', 400);
  }

  const cantidad = validarEnteroPositivo(
    lote.cantidad,
    'La cantidad del lote debe ser un entero mayor a 0'
  );

  const fArriboRaw = lote.fechaArribo ?? lote.fecha_arribo;
  const fVenciRaw = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

  if (!fArriboRaw || !fVenciRaw) {
    throw crearError('Las fechas de arribo y vencimiento del lote son obligatorias', 400);
  }

  const fechaArribo = validarFecha(fArriboRaw, 'La fecha de arribo');
  const fechaVencimiento = validarFecha(fVenciRaw, 'La fecha de vencimiento');

const obtenerHoyLocalISO = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());

  if (fechaOrden && fechaArribo < fechaOrden) {
    throw crearError('La fecha de arribo no puede ser menor a la fecha de pedido de la orden', 400);
  }

  if (fechaVencimiento < fechaArribo) {
    throw crearError('La fecha de vencimiento no puede ser anterior a la fecha de arribo', 400);
  }

  if (fechaVencimiento < obtenerHoyLocalISO()) {
    throw crearError('No se puede registrar ni editar un lote con fecha de vencimiento ya vencida', 400);
  }

  if (lote.productoNuevo) {
    const archivoImagen = archivosPorCampo.get(`imagenProducto_${indice}`);
    const productoNuevo = await validarProductoNuevo(
      lote.productoNuevo,
      archivoImagen?.filename ?? null
    );
    const totalLote = calcularYValidarTotalLote(lote, productoNuevo.precioCosto, cantidad);
    return {
      cantidad,
      total: totalLote,
      fechaArribo,
      fechaVencimiento,
      productoNuevo
    };
  }

  const rawProdId = lote.productoId ?? lote.producto;
  const prodId = Number(rawProdId);
  if (
    rawProdId === undefined ||
    rawProdId === null ||
    rawProdId === '' ||
    !Number.isInteger(prodId) ||
    prodId <= 0 ||
    prodId > INT4_MAX
  ) {
    throw crearError('Cada lote debe indicar un producto existente válido o un producto nuevo', 400);
  }

  const productoExistente = await repositoryProducto.findById(prodId);
  if (!productoExistente) {
    throw crearError('El producto indicado en el lote no existe', 400);
  }
  if (productoExistente.activo === false) {
    throw crearError('El producto indicado en el lote está inactivo', 400);
  }

  const rawCosto =
    lote.nuevoPrecioCostoProducto ??
    lote.precioCostoUnitario ??
    lote.precioCosto ??
    lote.precio_costo_unitario;
  const nuevoPrecioCostoProducto =
    rawCosto !== undefined && rawCosto !== null && String(rawCosto).trim() !== ''
      ? validarDecimalPositivo(rawCosto, 'El nuevo precio de costo para el catálogo debe ser mayor a 0')
      : Number(productoExistente.precioCosto);

  const rawVenta =
    lote.nuevoPrecioVentaProducto ??
    lote.precioVenta ??
    lote.precio_venta;
  const nuevoPrecioVentaProducto =
    rawVenta !== undefined && rawVenta !== null && String(rawVenta).trim() !== ''
      ? validarDecimalPositivo(rawVenta, 'El nuevo precio de venta para el catálogo debe ser mayor a 0')
      : Number(productoExistente.precioVenta);

  if (
    productoExistente.enPromocion === true &&
    productoExistente.precioPromo !== null &&
    productoExistente.precioPromo !== undefined &&
    nuevoPrecioVentaProducto <= Number(productoExistente.precioPromo)
  ) {
    throw crearError(
      `El nuevo precio de venta debe ser mayor al precio promocional activo ($${Number(productoExistente.precioPromo).toFixed(2)})`,
      400
    );
  }

  const totalLote = calcularYValidarTotalLote(lote, nuevoPrecioCostoProducto, cantidad);

  return {
    cantidad,
    nuevoPrecioCostoProducto,
    nuevoPrecioVentaProducto,
    total: totalLote,
    fechaArribo,
    fechaVencimiento,
    productoId: prodId
  };
};

const validarId = (id, mensaje = 'El ID de la orden de compra no es válido') => {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0 || num > INT4_MAX) {
    throw crearError(mensaje, 400);
  }
  return num;
};

export const listarOrdenesCompra = async () => {
  return await repository.findAll();
};

export const listarHistorialOrdenesCompra = async () => {
  return await repository.findHistorial();
};

export const obtenerOrdenCompraPorId = async (id, incluirInactivos = false) => {
  const idValido = validarId(id);
  const ordenCompra = await repository.findById(idValido, incluirInactivos);
  if (!ordenCompra) {
    throw crearError('Orden de compra no encontrada', 404);
  }
  return ordenCompra;
};

const normalizarUsuarioId = (data) => {
  const usuarioIdRaw = data?.usuarioId ?? data?.usuario_id;
  return usuarioIdRaw !== undefined &&
    usuarioIdRaw !== null &&
    Number.isInteger(Number(usuarioIdRaw)) &&
    Number(usuarioIdRaw) > 0
    ? Number(usuarioIdRaw)
    : null;
};

export const crearOrdenCompra = async (data, archivos = []) => {
  try {
    let proveedorId = null;
    let proveedorNuevo = null;

    if (data?.proveedorNuevo) {
      if (typeof data.proveedorNuevo !== 'object' || Array.isArray(data.proveedorNuevo)) {
        throw crearError('Los datos del proveedor nuevo no son válidos', 400);
      }
      const nombreProveedor = validarNombreProveedor(data.proveedorNuevo.nombre);
      const telefonoProveedor = validarTelefonoProveedor(data.proveedorNuevo.telefono);
      const proveedorDuplicado = await repositoryProveedor.findByNombreInsensitive(nombreProveedor);
      if (proveedorDuplicado) {
        throw crearError('Ya existe un proveedor con ese nombre', 409);
      }
      proveedorNuevo = {
        nombre: nombreProveedor,
        telefono: telefonoProveedor
      };
    } else {
      const proveedorIdRaw = data?.proveedor_id ?? data?.proveedorId ?? data?.proveedor;
      const parsedId = Number(proveedorIdRaw);

      if (!proveedorIdRaw || !Number.isInteger(parsedId) || parsedId <= 0 || parsedId > INT4_MAX) {
        throw crearError('Debe indicar un proveedor válido para la orden de compra', 400);
      }

      const proveedorExistente = await repositoryProveedor.findById(parsedId);
      if (!proveedorExistente) {
        throw crearError('Proveedor no encontrado', 404);
      }
      if (proveedorExistente.activo === false) {
        throw crearError('El proveedor indicado está inactivo', 400);
      }
      proveedorId = parsedId;
    }

    if (!data?.fecha) {
      throw crearError('La fecha de la orden de compra es obligatoria', 400);
    }
    const fecha = validarFecha(data.fecha, 'La fecha de la orden de compra');

    const lotes = Array.isArray(data.lotes) ? data.lotes : [];
    if (lotes.length === 0) {
      throw crearError('La orden de compra debe tener al menos un lote', 400);
    }

    const archivosPorCampo = mapearArchivosPorCampo(archivos);
    const lotesValidados = [];
    for (let i = 0; i < lotes.length; i += 1) {
      lotesValidados.push(await validarLote(lotes[i], i, archivosPorCampo, fecha));
    }

    const total = Number(
      lotesValidados.reduce((acc, l) => acc + Number(l.total), 0).toFixed(2)
    );
    if (!Number.isFinite(total) || total <= 0 || total > DECIMAL_10_2_MAX) {
      throw crearError('El total de la orden de compra supera el límite permitido', 400);
    }

    const usuarioId = normalizarUsuarioId(data);

    const resultado = await repository.create({
      total,
      fecha,
      ...(proveedorId !== null && { proveedor_id: proveedorId }),
      ...(proveedorNuevo !== null && { proveedorNuevo }),
      ...(usuarioId !== null && { usuarioId }),
      lotes: lotesValidados
    });
    const nombresUsados = new Set(
      lotesValidados.map((l) => l.productoNuevo?.imagen).filter(Boolean)
    );
    limpiarArchivosNoUsados(archivos, nombresUsados);
    return resultado;
  } catch (err) {
    limpiarArchivos(archivos);
    throw err;
  }
};

export const actualizarOrdenCompra = async (id, data, archivos = []) => {
  try {
    const idValido = validarId(id);
    const ordenCompraExistente = await repository.findById(idValido);
    if (!ordenCompraExistente || ordenCompraExistente.activo === false) {
      throw crearError('Orden de compra no encontrada', 404);
    }

    let total = ordenCompraExistente.total;

    let fecha = ordenCompraExistente.fecha;
    if (data.fecha !== undefined) {
      fecha = validarFecha(data.fecha, 'La fecha de la orden de compra');
    }

    const proveedorIdRaw = data.proveedor_id ?? data.proveedorId ?? data.proveedor;
    let proveedorId;
    let proveedorNuevo;

    if (data?.proveedorNuevo) {
      if (typeof data.proveedorNuevo !== 'object' || Array.isArray(data.proveedorNuevo)) {
        throw crearError('Los datos del proveedor nuevo no son válidos', 400);
      }
      const nombreProveedor = validarNombreProveedor(data.proveedorNuevo.nombre);
      const telefonoProveedor = validarTelefonoProveedor(data.proveedorNuevo.telefono);
      const proveedorDuplicado = await repositoryProveedor.findByNombreInsensitive(nombreProveedor);
      if (proveedorDuplicado) {
        throw crearError('Ya existe un proveedor con ese nombre', 409);
      }
      proveedorNuevo = {
        nombre: nombreProveedor,
        telefono: telefonoProveedor
      };
    } else if (proveedorIdRaw !== undefined) {
      proveedorId = Number(proveedorIdRaw);
      if (!Number.isInteger(proveedorId) || proveedorId <= 0 || proveedorId > INT4_MAX) {
        throw crearError('El proveedor indicado no es válido', 400);
      }
      const proveedorExistente = await repositoryProveedor.findById(proveedorId);
      if (!proveedorExistente) {
        throw crearError('Proveedor no encontrado', 404);
      }
      if (proveedorExistente.activo === false && proveedorId !== ordenCompraExistente.proveedor?.id) {
        throw crearError('El proveedor indicado está inactivo', 400);
      }
    }

    let lotesValidados;
    if (data.lotes !== undefined) {
      if (!Array.isArray(data.lotes) || data.lotes.length === 0) {
        throw crearError('La orden de compra debe tener al menos un lote', 400);
      }

      const archivosPorCampo = mapearArchivosPorCampo(archivos);
      lotesValidados = [];
      for (let i = 0; i < data.lotes.length; i += 1) {
        lotesValidados.push(await validarLote(data.lotes[i], i, archivosPorCampo, fecha));
      }
      total = Number(
        lotesValidados.reduce((acc, l) => acc + Number(l.total), 0).toFixed(2)
      );
      if (!Number.isFinite(total) || total <= 0 || total > DECIMAL_10_2_MAX) {
        throw crearError('El total de la orden de compra supera el límite permitido', 400);
      }
    }

    const usuarioId = normalizarUsuarioId(data);

    const datosActualizar = {
      total,
      fecha,
      ...(proveedorId !== undefined && { proveedor_id: proveedorId }),
      ...(proveedorNuevo !== undefined && { proveedorNuevo }),
      ...(usuarioId !== null && { usuarioId }),
      ...(lotesValidados !== undefined && { lotes: lotesValidados })
    };

    const resultado = await repository.update(idValido, datosActualizar);
    const nombresUsados = new Set(
      (lotesValidados || []).map((l) => l.productoNuevo?.imagen).filter(Boolean)
    );
    limpiarArchivosNoUsados(archivos, nombresUsados);
    return resultado;
  } catch (err) {
    limpiarArchivos(archivos);
    throw err;
  }
};

export const eliminarOrdenCompra = async (id) => {
  const idValido = validarId(id);
  const rowCount = await repository.remove(idValido);
  if (rowCount === 0) {
    throw crearError('Orden de compra no encontrada', 404);
  }
  return true;
};
