import * as ventasRepository from './ventas.repository.js';
import * as repositoryPedidos from '../pedidos/pedidos.repository.js';


const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
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

export const listarVentas = async (periodo) => {
  if (periodo === 'ultimo-mes') {
    return await ventasUltimoMes();
  }

  if (periodo) {
    const error = new Error(`El parámetro periodo '${periodo}' no es válido`);
    error.status = 400;
    throw error;
  }

  return await ventasRepository.listar();
};

export const listarHistorialVentas = async () => {
  return await ventasRepository.listarHistorial();
};

export const obtenerVenta = async (id) => {
  const venta = await ventasRepository.obtenerDetalle(id);

  if (!venta) {
    throw crearError(`La venta con ID ${id} no existe`, 404);
  }

  return venta;
};

export const obtenerProductosVenta = async (id) => {
  const rows = await ventasRepository.obtener(id);

  if (!rows || rows.length === 0) {
    throw crearError(`La venta con ID ${id} no existe`, 404);
  }

  const venta = rows[0];
  if (!venta.pedido_id) {
    return [];
  }

  return await ventasRepository.obtenerItemsPorPedidoId(venta.pedido_id);
};

export const crearVenta = async (data) => {
  const pedidoId = data.pedido_id ?? data.pedidoId;

  if (!pedidoId) {
    throw crearError('Faltan datos obligatorios para crear venta', 400);
  }

  const pedidoExistente = await repositoryPedidos.findById(pedidoId);
  if (!pedidoExistente) {
    throw crearError('No existe pedido con ese id', 404);
  }

  const ventaExistente = await ventasRepository.obtenerPorPedidoId(pedidoId);
  if (ventaExistente) {
    throw crearError('Ya existe una venta activa para este pedido', 409);
  }

  if (!data.fecha || data.total === undefined || data.total === null) {
    throw crearError('Faltan datos obligatorios para crear venta', 400);
  }

  const total = validarDecimalPositivo(data.total, 'El total de la venta debe ser mayor a 0');

  return await ventasRepository.create({ ...data, pedido_id: pedidoId, total });
};

export const update = async (id, data) => {
  const rows = await ventasRepository.obtener(id);

  if (!rows || rows.length === 0) {
    throw crearError('No existe venta con ese id', 404);
  }

  const ventaActual = rows[0];
  const fecha = data.fecha !== undefined && data.fecha !== null && data.fecha !== ''
    ? data.fecha
    : ventaActual.fecha;

  const rawTotalModificado = data.totalModificado !== undefined
    ? data.totalModificado
    : data.total_modificado;
  const rawMotivoModificacion = data.motivoModificacion !== undefined
    ? data.motivoModificacion
    : data.motivo_modificacion;

  let totalModificado = ventaActual.total_modificado ?? null;
  let motivoModificacion = ventaActual.motivo_modificacion ?? null;

  if (rawTotalModificado !== undefined && rawTotalModificado !== null && rawTotalModificado !== '') {
    totalModificado = validarDecimalPositivo(
      rawTotalModificado,
      'El total modificado de la venta debe ser mayor a 0'
    );

    if (typeof rawMotivoModificacion !== 'string' || rawMotivoModificacion.trim().length === 0) {
      throw crearError('El motivo de modificación es obligatorio cuando se modifica el total', 400);
    }

    motivoModificacion = rawMotivoModificacion.trim();
  } else if (rawTotalModificado === null || rawTotalModificado === '') {
    totalModificado = null;
    motivoModificacion = null;
  }

  return await ventasRepository.update(id, {
    fecha,
    totalModificado,
    motivoModificacion
  });
};

export const remove = async (id) => {
  const rowCount = await ventasRepository.remove(id);
  if (rowCount === 0) {
    throw crearError('Venta no encontrada', 404);
  }
  return true;
};

export const ventasUltimoMes = async () => {
  return await ventasRepository.obtenerVentasMes();
};