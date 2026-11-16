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

  const rows = await ventasRepository.listar();
  if (rows.length === 0) {
    const error = new Error(`No hay ventas cargadas`);
    error.status = 404;
    throw error;
  }
  return rows;
};

export const obtenerVenta = async (id) => {
  const rows = await ventasRepository.obtener(id);
  
  if (rows.length === 0) {
    const error = new Error(`La venta con ID ${id} no existe`);
    error.status = 404;
    throw error;
  }

  return rows[0];
};

export const crearVenta = async (data) => {
  const pedidoExistente = await repositoryPedidos.findById(data.pedido_id);
 
  if(!pedidoExistente){
    const error = new Error('No existe pedido con ese id');
    error.status = 404;
    throw error;
  }

  if (!data.fecha || data.total === undefined || data.total === null) {
    throw crearError('Faltan datos obligatorios para crear venta', 400);
  }

  const total = validarDecimalPositivo(data.total, 'El total de la venta debe ser mayor a 0');

  return await ventasRepository.create({ ...data, total });
};

export const update = async (id,data) => {
  const ventaExistente = await ventasRepository.obtener(id);

  if(!ventaExistente){
    const error = new Error('No existe venta con ese id');
    error.status = 404;
    throw error;
  }

  if (!data.fecha || data.total === undefined || data.total === null) {
    throw crearError('Faltan datos obligatorios para actualizar venta', 400);
  }

  const total = validarDecimalPositivo(data.total, 'El total de la venta debe ser mayor a 0');

  return await ventasRepository.update(id, { ...data, total });
};

export const remove = async (id) => {
  const rowCount = await ventasRepository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Venta no encontrada');
    error.status = 404;
    throw error;
  }
  return true;
};

export const ventasUltimoMes = async () => {
  const rows = await ventasRepository.obtenerVentasMes();
  if (rows.length === 0) {
    const error = new Error('Ventas no encontradas');
    error.status = 404;
    throw error;
  }
  return rows;
};