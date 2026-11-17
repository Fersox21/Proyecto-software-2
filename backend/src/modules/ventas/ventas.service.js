import * as defaultVentasRepository from './ventas.repository.js';
import * as defaultRepositoryPedidos from '../pedidos/pedidos.repository.js';
import {
  crearError,
  normalizarFecha,
  validarFecha,
  validarIdEnteroPositivo
} from '../../utils/validaciones.js';

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

export const crearVentasService = ({
  ventasRepository = defaultVentasRepository,
  repositoryPedidos = defaultRepositoryPedidos
} = {}) => {
  const ventasUltimoMes = async () => {
    return await ventasRepository.obtenerVentasMes();
  };

  const listarVentas = async (periodo) => {
    if (periodo === 'ultimo-mes') {
      return await ventasUltimoMes();
    }

    if (periodo) {
      throw crearError(`El parámetro periodo '${periodo}' no es válido`, 400);
    }

    return await ventasRepository.listar();
  };

  const listarHistorialVentas = async () => {
    return await ventasRepository.listarHistorial();
  };

  const obtenerVenta = async (id, incluirInactivos = false) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de venta inválido');
    const venta = await ventasRepository.obtenerDetalle(idNum, incluirInactivos);

    if (!venta) {
      throw crearError('Venta no encontrada', 404);
    }

    return venta;
  };

  const obtenerProductosVenta = async (id, incluirInactivos = false) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de venta inválido');
    const rows = await ventasRepository.obtener(idNum, incluirInactivos);

    if (!rows || rows.length === 0) {
      throw crearError('Venta no encontrada', 404);
    }

    const venta = rows[0];
    if (!venta.pedido_id) {
      return [];
    }

    return await ventasRepository.obtenerItemsPorPedidoId(venta.pedido_id);
  };

  const crearVenta = async (data) => {
    const rawPedidoId = data?.pedido_id ?? data?.pedidoId;

    if (!rawPedidoId) {
      throw crearError('Faltan datos obligatorios para crear venta', 400);
    }

    const pedidoId = validarIdEnteroPositivo(rawPedidoId, 'ID de pedido inválido');

    if (!data?.fecha || data?.total === undefined || data?.total === null) {
      throw crearError('Faltan datos obligatorios para crear venta', 400);
    }

    const fecha = validarFecha(data.fecha, 'La fecha de la venta');
    const total = validarDecimalPositivo(data.total, 'El total de la venta debe ser mayor a 0');

    const pedidoExistente = await repositoryPedidos.findById(pedidoId);
    if (!pedidoExistente) {
      throw crearError('No existe pedido con ese id', 404);
    }

    const ventaExistente = await ventasRepository.obtenerPorPedidoId(pedidoId);
    if (ventaExistente) {
      throw crearError('Ya existe una venta activa para este pedido', 409);
    }

    return await ventasRepository.create({ ...data, fecha, pedido_id: pedidoId, total });
  };

  const update = async (id, data) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de venta inválido');

    const fechaValidada = data?.fecha !== undefined
      ? validarFecha(data.fecha, 'La fecha de la venta')
      : undefined;

    const rows = await ventasRepository.obtener(idNum);

    if (!rows || rows.length === 0) {
      throw crearError('Venta no encontrada', 404);
    }

    const ventaActual = rows[0];
    const fecha = fechaValidada ?? normalizarFecha(ventaActual.fecha);

    const rawTotalModificado = data?.totalModificado !== undefined
      ? data.totalModificado
      : data?.total_modificado;
    const rawMotivoModificacion = data?.motivoModificacion !== undefined
      ? data.motivoModificacion
      : data?.motivo_modificacion;

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

    return await ventasRepository.update(idNum, {
      fecha,
      totalModificado,
      motivoModificacion
    });
  };

  const remove = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de venta inválido');
    const rowCount = await ventasRepository.remove(idNum);
    if (rowCount === 0) {
      throw crearError('Venta no encontrada', 404);
    }
    return true;
  };

  return {
    listarVentas,
    listarHistorialVentas,
    obtenerVenta,
    obtenerProductosVenta,
    crearVenta,
    update,
    remove,
    ventasUltimoMes
  };
};

const defaultService = crearVentasService();

export const listarVentas = defaultService.listarVentas;
export const listarHistorialVentas = defaultService.listarHistorialVentas;
export const obtenerVenta = defaultService.obtenerVenta;
export const obtenerProductosVenta = defaultService.obtenerProductosVenta;
export const crearVenta = defaultService.crearVenta;
export const update = defaultService.update;
export const remove = defaultService.remove;
export const ventasUltimoMes = defaultService.ventasUltimoMes;
