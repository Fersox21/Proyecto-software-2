import * as repository from './lotes.repository.js';
import * as repositoryOrdenCompra from '../ordenesCompra/ordenesCompra.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';

const FORMATO_FECHA = 'YYYY-MM-DD';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarId = (id) => {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError('El id del lote no es válido', 400);
  }
  return numero;
};

const validarCantidad = (cantidad) => {
  const mensaje = 'La cantidad del lote debe ser un entero mayor a 0';

  if (typeof cantidad === 'number') {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw crearError(mensaje, 400);
    }
    return cantidad;
  }

  if (typeof cantidad === 'string') {
    const limpio = cantidad.trim();
    if (!/^\d+$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    const numero = Number(limpio);
    if (!Number.isSafeInteger(numero) || numero <= 0) {
      throw crearError(mensaje, 400);
    }
    return numero;
  }

  throw crearError(mensaje, 400);
};

const validarTotal = (total) => {
  const mensaje = 'El total del lote debe ser un número mayor a 0';

  if (typeof total === 'number') {
    if (!Number.isFinite(total) || total <= 0) {
      throw crearError(mensaje, 400);
    }
    return Number(total.toFixed(2));
  }

  if (typeof total === 'string') {
    const limpio = total.trim();
    if (!/^\d+(\.\d+)?$/.test(limpio)) {
      throw crearError(mensaje, 400);
    }
    const numero = Number(limpio);
    if (!Number.isFinite(numero) || numero <= 0) {
      throw crearError(mensaje, 400);
    }
    return Number(numero.toFixed(2));
  }

  throw crearError(mensaje, 400);
};

// Valida string YYYY-MM-DD y que la fecha exista (rechaza 2026-02-31).
const validarFecha = (valor, campo) => {
  const fecha = typeof valor === 'string' ? valor.trim() : '';

  if (!new RegExp(`^\\d{4}-\\d{2}-\\d{2}$`).test(fecha)) {
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

// pg devuelve las columnas DATE como Date en hora local; se normaliza a
// YYYY-MM-DD para comparar sin arrastrar zona horaria.
const normalizarFecha = (valor) => {
  if (valor == null) return null;

  if (valor instanceof Date) {
    const anio = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  return String(valor).slice(0, 10);
};

const validarOrdenDeFechas = (fechaArribo, fechaVencimiento) => {
  if (fechaArribo && fechaVencimiento && fechaVencimiento < fechaArribo) {
    throw crearError('La fecha de vencimiento no puede ser anterior a la fecha de arribo', 400);
  }
};

export const listarLotes = async () => {
  return await repository.findAll();
};

export const listarHistorialLotes = async () => {
  return await repository.findHistorial();
};

export const obtenerLotePorId = async (id) => {
  const lote = await repository.findById(validarId(id));
  if (!lote) {
    throw crearError('Lote no encontrado', 404);
  }
  return lote;
};

export const crearLote = async (data) => {
  if (
    data?.cantidad == null ||
    !data?.fechaArribo ||
    !data?.fechaVencimiento ||
    data?.ordenCompra == null ||
    data?.producto == null
  ) {
    throw crearError(
      'Faltan datos obligatorios para crear el lote (cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto)',
      400
    );
  }

  const ordenCompraId = Number(data.ordenCompra);
  const productoId = Number(data.producto);

  if (!Number.isInteger(ordenCompraId) || ordenCompraId <= 0) {
    throw crearError('La orden de compra indicada no es válida', 400);
  }

  if (!Number.isInteger(productoId) || productoId <= 0) {
    throw crearError('El producto indicado no es válido', 400);
  }

  const ordenCompraExistente = await repositoryOrdenCompra.findById(ordenCompraId);
  const productoExistente = await repositoryProducto.findById(productoId);

  if (!ordenCompraExistente) {
    throw crearError('La orden de compra indicada no existe', 400);
  }

  if (!productoExistente) {
    throw crearError('El producto indicado no existe', 400);
  }

  const cantidad = validarCantidad(data.cantidad);
  const fechaArribo = validarFecha(data.fechaArribo, 'La fecha de arribo');
  const fechaVencimiento = validarFecha(data.fechaVencimiento, 'La fecha de vencimiento');

  validarOrdenDeFechas(fechaArribo, fechaVencimiento);

  const total = Number((Number(productoExistente.precioCosto) * cantidad).toFixed(2));

  return await repository.create({
    cantidad,
    total,
    fechaArribo,
    fechaVencimiento,
    ordenCompra: ordenCompraId,
    producto: productoId
  });
};

// Edita solo la fecha de vencimiento, conservando el id y el resto del lote.
export const actualizarVencimiento = async (id, data) => {
  const idLote = validarId(id);
  const fechaVencimiento = validarFecha(data?.fechaVencimiento, 'La fecha de vencimiento');

  const loteExistente = await repository.findById(idLote);
  if (!loteExistente) {
    throw crearError('Lote no encontrado', 404);
  }

  const fechaArribo = normalizarFecha(loteExistente.fechaArribo);
  validarOrdenDeFechas(fechaArribo, fechaVencimiento);

  const actualizado = await repository.updateFechaVencimiento(idLote, fechaVencimiento);
  if (!actualizado) {
    throw crearError('Lote no encontrado', 404);
  }

  return await repository.findById(idLote);
};

export const actualizarLote = async (id, data) => {
  const idLote = validarId(id);

  const loteExistente = await repository.findById(idLote);
  if (!loteExistente) {
    throw crearError('Lote no encontrado', 404);
  }

  const cantidad =
    data?.cantidad !== undefined ? validarCantidad(data.cantidad) : loteExistente.cantidad;
  const fechaArribo =
    data?.fechaArribo !== undefined
      ? validarFecha(data.fechaArribo, 'La fecha de arribo')
      : normalizarFecha(loteExistente.fechaArribo);
  const fechaVencimiento =
    data?.fechaVencimiento !== undefined
      ? validarFecha(data.fechaVencimiento, 'La fecha de vencimiento')
      : normalizarFecha(loteExistente.fechaVencimiento);

  validarOrdenDeFechas(fechaArribo, fechaVencimiento);

  const total =
    data?.total !== undefined
      ? validarTotal(data.total)
      : data?.cantidad !== undefined && loteExistente.producto?.precioCosto != null
        ? Number((Number(loteExistente.producto.precioCosto) * cantidad).toFixed(2))
        : loteExistente.total;

  return await repository.update(idLote, { cantidad, total, fechaArribo, fechaVencimiento });
};

export const eliminarLote = async (id) => {
  const idLote = validarId(id);

  const loteExistente = await repository.findById(idLote);
  if (!loteExistente) {
    throw crearError('Lote no encontrado', 404);
  }

  const rowCount = await repository.removeSiNoEsElUltimoLote(idLote);
  if (rowCount === 0) {
    throw crearError('No se puede eliminar el único lote de la orden de compra', 409);
  }

  return true;
};
