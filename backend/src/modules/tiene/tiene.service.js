import * as repository from './tiene.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import * as repositoryVenta from '../ventas/ventas.repository.js';
import * as repositoryPedido from '../pedidos/pedidos.repository.js'

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarEnteroPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor <= 0) {
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
    if (!Number.isSafeInteger(numero) || numero <= 0) {
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

export const listarTiene = async () => {
  return await repository.findAll();
};

export const obtenerTienePorId = async (pedido_id) => {
  const rows = await repository.findByPedido(pedido_id);
  if (rows.length === 0) {
    const error = new Error('Item no encontrado');
    error.status = 404;
    throw error;
  }
  return rows;
};
 
export const crearTiene = async (data) => {
  const [productoExistente, pedidoExistente, itemExistente] = await Promise.all([
    repositoryProducto.findById(data.producto_id),
    repositoryPedido.findById(data.pedido_id),
    repository.findByPedidoYProducto(data.pedido_id, data.producto_id)
  ]);

  if (itemExistente) {
    const error = new Error('El producto ya se encuentra agregado en este pedido');
    error.status = 409;
    throw error;
  }

  if (data.cantidad === undefined || data.cantidad === null || data.precio === undefined || data.precio === null || !productoExistente || !pedidoExistente) {
    throw crearError('Faltan datos obligatorios para crear item', 400);
  }

  const cantidad = validarEnteroPositivo(data.cantidad, 'La cantidad de item debe ser un entero mayor a 0');
  const precio = validarDecimalPositivo(data.precio, 'El precio de item debe ser mayor a 0');

  return await repository.create({ ...data, cantidad, precio });
};

export const actualizarTiene = async (data) => {

  const { pedido_id, producto_id, cantidad, precio } = data;

  if (!pedido_id || !producto_id) {
    const error = new Error('Se requieren pedido_id y producto_id para identificar el item');
    error.status = 400;
    throw error;
  }

  const tieneExistente = await repository.findByPedidoYProducto(pedido_id, producto_id);
    if (!tieneExistente) {
      const error = new Error('item no encontrado');
      error.status = 404;
      throw error;
    }
  
  const cantidadValidada = data.cantidad !== undefined
    ? validarEnteroPositivo(data.cantidad, 'La cantidad de item debe ser un entero mayor a 0')
    : undefined;

  const precioValidado = data.precio !== undefined
    ? validarDecimalPositivo(data.precio, 'El precio de item debe ser mayor a 0')
    : undefined;

  const tieneActualizado = await repository.update({
    ...data,
    ...(cantidadValidada !== undefined && { cantidad: cantidadValidada }),
    ...(precioValidado !== undefined && { precio: precioValidado })
  });
  return tieneActualizado;
};

export const eliminarTiene = async (pedido_id, producto_id) => {
  if (!pedido_id || !producto_id) {
    const error = new Error('Se requieren pedido_id y producto_id');
    error.status = 400;
    throw error;
  }

  const rowCount = await repository.remove(pedido_id, producto_id);

  if (rowCount === 0) {
    const error = new Error('El item no existe en este pedido');
    error.status = 404;
    throw error;
  }

  return true;
};