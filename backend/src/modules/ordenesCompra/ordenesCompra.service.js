import * as repository from './ordenesCompra.repository.js';
import * as repositoryProveedor from '../proveedores/proveedores.repository.js';
import { validarNombreProveedor, validarTelefonoProveedor } from '../proveedores/proveedores.service.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import * as repositoryCategoria from '../categorias/categorias.repository.js';
import * as repositoryTipoPromocion from '../tiposPromocion/tiposPromocion.repository.js';

const FORMATO_FECHA = 'YYYY-MM-DD';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
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

const validarProductoNuevo = async (productoNuevo) => {
  if (!productoNuevo || typeof productoNuevo !== 'object' || Array.isArray(productoNuevo)) {
    throw crearError('Los datos del producto nuevo no son válidos', 400);
  }

  const nombre = typeof productoNuevo.nombre === 'string' ? productoNuevo.nombre.trim() : '';
  if (!nombre) {
    throw crearError('El nombre del producto nuevo es obligatorio', 400);
  }

  const precioCosto = Number(productoNuevo.precioCosto);
  const precioVenta = Number(productoNuevo.precioVenta);

  if (!Number.isFinite(precioCosto) || precioCosto <= 0) {
    throw crearError('El precio de costo del producto nuevo debe ser mayor a 0', 400);
  }

  if (!Number.isFinite(precioVenta) || precioVenta <= 0) {
    throw crearError('El precio de venta del producto nuevo debe ser mayor a 0', 400);
  }

  const peso = productoNuevo.peso !== undefined && productoNuevo.peso !== null && productoNuevo.peso !== ''
    ? Number(productoNuevo.peso)
    : 1;

  if (!Number.isFinite(peso) || peso <= 0) {
    throw crearError('El peso del producto nuevo debe ser mayor a 0', 400);
  }

  let categoriaId = null;
  let categoriaNuevaNombre = null;

  const rawCatId = productoNuevo.categoriaId ?? productoNuevo.categoria_id;
  const rawCatNueva = typeof productoNuevo.categoriaNuevaNombre === 'string'
    ? productoNuevo.categoriaNuevaNombre.trim()
    : '';
  const rawCatTexto = typeof productoNuevo.categoria === 'string'
    ? productoNuevo.categoria.trim()
    : '';

  if (rawCatNueva) {
    if (rawCatNueva.length > 100) {
      throw crearError('El nombre de la nueva categoría no puede superar los 100 caracteres', 400);
    }
    categoriaNuevaNombre = rawCatNueva;
  } else if (rawCatId !== undefined && rawCatId !== null && rawCatId !== '') {
    const idCat = Number(rawCatId);
    if (!Number.isInteger(idCat) || idCat <= 0) {
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
    if (rawCatTexto.length > 100) {
      throw crearError('El nombre de la categoría no puede superar los 100 caracteres', 400);
    }
    categoriaNuevaNombre = rawCatTexto;
  } else {
    throw crearError('Debe indicar una categoría para el producto nuevo', 400);
  }

  let tipoPromocionId = null;
  let tipoPromocionNuevaNombre = null;

  const rawTipoId = productoNuevo.tipoPromocionId ?? productoNuevo.tipo_promocion_id;
  const rawTipoNuevo = typeof productoNuevo.tipoPromocionNuevaNombre === 'string'
    ? productoNuevo.tipoPromocionNuevaNombre.trim()
    : '';

  if (rawTipoNuevo) {
    if (rawTipoNuevo.length > 100) {
      throw crearError('El nombre del nuevo tipo de promoción no puede superar los 100 caracteres', 400);
    }
    tipoPromocionNuevaNombre = rawTipoNuevo;
  } else if (rawTipoId !== undefined && rawTipoId !== null && rawTipoId !== '') {
    const idTipo = Number(rawTipoId);
    if (!Number.isInteger(idTipo) || idTipo <= 0) {
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
  }

  const marca =
    productoNuevo.marca !== undefined && productoNuevo.marca !== null
      ? String(productoNuevo.marca).trim() || null
      : null;

  const descripcion =
    productoNuevo.descripcion !== undefined && productoNuevo.descripcion !== null
      ? String(productoNuevo.descripcion).trim() || null
      : null;

  return {
    nombre,
    marca,
    descripcion,
    precioCosto,
    precioVenta,
    peso,
    destacado: Boolean(productoNuevo.destacado),
    categoriaId,
    categoriaNuevaNombre,
    tipoPromocionId,
    tipoPromocionNuevaNombre
  };
};

const calcularYValidarTotalLote = (lote, precioCosto, cantidad) => {
  const calculado = Number((Number(precioCosto) * cantidad).toFixed(2));
  const rawTotal = lote.total ?? lote.precioTotal;

  if (rawTotal !== undefined && rawTotal !== null && rawTotal !== '') {
    const enviado = Number(rawTotal);
    if (!Number.isFinite(enviado) || Math.abs(enviado - calculado) > 0.01) {
      throw crearError('El total del lote no coincide con el precio de costo por cantidad', 400);
    }
  }

  return calculado;
};

const validarLote = async (lote) => {
  if (!lote || typeof lote !== 'object') {
    throw crearError('Los datos del lote no son válidos', 400);
  }

  const cantidadRaw = lote.cantidad;
  const cantidad = Number(cantidadRaw);
  if (
    cantidadRaw === undefined ||
    cantidadRaw === null ||
    cantidadRaw === '' ||
    !Number.isInteger(cantidad) ||
    cantidad <= 0
  ) {
    throw crearError('La cantidad del lote debe ser un entero mayor a 0', 400);
  }

  const fArriboRaw = lote.fechaArribo ?? lote.fecha_arribo;
  const fVenciRaw = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

  if (!fArriboRaw || !fVenciRaw) {
    throw crearError('Las fechas de arribo y vencimiento del lote son obligatorias', 400);
  }

  const fechaArribo = validarFecha(fArriboRaw, 'La fecha de arribo');
  const fechaVencimiento = validarFecha(fVenciRaw, 'La fecha de vencimiento');

  if (fechaVencimiento < fechaArribo) {
    throw crearError('La fecha de vencimiento no puede ser anterior a la fecha de arribo', 400);
  }

  if (lote.productoNuevo) {
    const productoNuevo = await validarProductoNuevo(lote.productoNuevo);
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
  if (rawProdId === undefined || rawProdId === null || rawProdId === '' || !Number.isInteger(prodId) || prodId <= 0) {
    throw crearError('Cada lote debe indicar un producto existente válido o un producto nuevo', 400);
  }

  const productoExistente = await repositoryProducto.findById(prodId);
  if (!productoExistente) {
    throw crearError('El producto indicado en el lote no existe', 400);
  }
  if (productoExistente.activo === false) {
    throw crearError('El producto indicado en el lote está inactivo', 400);
  }

  const totalLote = calcularYValidarTotalLote(lote, productoExistente.precioCosto, cantidad);

  return {
    cantidad,
    total: totalLote,
    fechaArribo,
    fechaVencimiento,
    productoId: prodId
  };
};

export const listarOrdenesCompra = async () => {
  return await repository.findAll();
};

export const obtenerOrdenCompraPorId = async (id) => {
  const ordenCompra = await repository.findById(id);
  if (!ordenCompra) {
    throw crearError('Orden de compra no encontrada', 404);
  }
  return ordenCompra;
};

export const crearOrdenCompra = async (data) => {
  let proveedorId = null;
  let proveedorNuevo = null;

  if (data?.proveedorNuevo) {
    if (typeof data.proveedorNuevo !== 'object' || Array.isArray(data.proveedorNuevo)) {
      throw crearError('Los datos del proveedor nuevo no son válidos', 400);
    }
    proveedorNuevo = {
      nombre: validarNombreProveedor(data.proveedorNuevo.nombre),
      telefono: validarTelefonoProveedor(data.proveedorNuevo.telefono)
    };
  } else {
    const proveedorIdRaw = data?.proveedor_id ?? data?.proveedorId ?? data?.proveedor;
    const parsedId = Number(proveedorIdRaw);

    if (!proveedorIdRaw || !Number.isInteger(parsedId) || parsedId <= 0) {
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

  const total = Number(data?.total);
  if (!Number.isFinite(total) || total <= 0) {
    throw crearError('El total de la orden de compra debe ser mayor a 0', 400);
  }

  if (!data?.fecha) {
    throw crearError('La fecha de la orden de compra es obligatoria', 400);
  }
  const fecha = validarFecha(data.fecha, 'La fecha de la orden de compra');

  const lotes = Array.isArray(data.lotes) ? data.lotes : [];
  if (lotes.length === 0) {
    throw crearError('La orden de compra debe tener al menos un lote', 400);
  }

  const lotesValidados = [];
  for (const lote of lotes) {
    lotesValidados.push(await validarLote(lote));
  }

  return await repository.create({
    total,
    fecha,
    ...(proveedorId !== null && { proveedor_id: proveedorId }),
    ...(proveedorNuevo !== null && { proveedorNuevo }),
    lotes: lotesValidados
  });
};

export const actualizarOrdenCompra = async (id, data) => {
  const ordenCompraExistente = await repository.findById(id);
  if (!ordenCompraExistente) {
    throw crearError('Orden de compra no encontrada', 404);
  }

  let total = ordenCompraExistente.total;
  if (data.total !== undefined) {
    total = Number(data.total);
    if (!Number.isFinite(total) || total <= 0) {
      throw crearError('El total de la orden de compra debe ser mayor a 0', 400);
    }
  }

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
    proveedorNuevo = {
      nombre: validarNombreProveedor(data.proveedorNuevo.nombre),
      telefono: validarTelefonoProveedor(data.proveedorNuevo.telefono)
    };
  } else if (proveedorIdRaw !== undefined) {
    proveedorId = Number(proveedorIdRaw);
    if (!Number.isInteger(proveedorId) || proveedorId <= 0) {
      throw crearError('El proveedor indicado no es válido', 400);
    }
    const proveedorExistente = await repositoryProveedor.findById(proveedorId);
    if (!proveedorExistente) {
      throw crearError('Proveedor no encontrado', 404);
    }
    if (proveedorExistente.activo === false) {
      throw crearError('El proveedor indicado está inactivo', 400);
    }
  }

  let lotesValidados;
  if (data.lotes !== undefined) {
    if (!Array.isArray(data.lotes) || data.lotes.length === 0) {
      throw crearError('La orden de compra debe tener al menos un lote', 400);
    }

    lotesValidados = [];
    for (const lote of data.lotes) {
      lotesValidados.push(await validarLote(lote));
    }
  }

  const datosActualizar = {
    total,
    fecha,
    ...(proveedorId !== undefined && { proveedor_id: proveedorId }),
    ...(proveedorNuevo !== undefined && { proveedorNuevo }),
    ...(lotesValidados !== undefined && { lotes: lotesValidados })
  };

  return await repository.update(id, datosActualizar);
};

export const eliminarOrdenCompra = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    throw crearError('Orden de compra no encontrada', 404);
  }
  return true;
};
