import * as repository from './tiene.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import * as repositoryVenta from '../ventas/ventas.repository.js';
import * as repositoryPedido from '../pedidos/pedidos.repository.js';
import { precioVigente } from '../productos/productos.precio.js';

const MAX_INT4 = 2147483647;
const DECIMAL_10_2_MAX = 99999999.99;

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarEnteroPositivo = (valor, mensaje) => {
  if (typeof valor === 'number') {
    if (!Number.isInteger(valor) || valor <= 0 || valor > MAX_INT4) {
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
    if (!Number.isSafeInteger(numero) || numero <= 0 || numero > MAX_INT4) {
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

const validarId = (id, mensaje = 'El ID indicado no es válido') => {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0 || num > 2147483647) {
    throw crearError(mensaje, 400);
  }
  return num;
};

const asegurarPedidoModificable = async (pedidoId) => {
  const pedido = await repositoryPedido.findById(pedidoId);
  if (!pedido) {
    throw crearError('Pedido no encontrado', 404);
  }
  if (pedido.activo === false) {
    throw crearError('No se pueden modificar ítems de un pedido eliminado', 409);
  }
  const estado = String(pedido.estado ?? '').trim().toLowerCase();
  if (!['pendiente', 'nuevo'].includes(estado)) {
    throw crearError('Solo se pueden modificar ítems de pedidos pendientes', 409);
  }
  return pedido;
};

const recalcularTotalPedido = async (pedido) => {
  const items = (await repository.findByPedido(pedido.id)).filter((i) => i.activo !== false);
  const subtotal = Number(
    items.reduce((acc, i) => acc + Number(i.precio) * Number(i.cantidad), 0).toFixed(2)
  );
  const total = Number((subtotal + Number(pedido.envio ?? 0)).toFixed(2));
  await repositoryPedido.update(pedido.id, {
    ...pedido,
    subtotal,
    total,
    totalModificado: null,
    motivoModificacion: null
  });
};

export const listarTiene = async () => {
  return await repository.findAll();
};

export const obtenerTienePorId = async (pedido_id) => {
  const idValido = validarId(pedido_id, 'El ID del pedido no es válido');
  const rows = await repository.findByPedido(idValido);
  if (rows.length === 0) {
    const error = new Error('Item no encontrado');
    error.status = 404;
    throw error;
  }
  return rows;
};
 
export const crearTiene = async (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw crearError('Los datos del ítem no son válidos', 400);
  }
  const productoId = validarId(data.producto_id, 'El ID del producto no es válido');
  const pedidoId = validarId(data.pedido_id, 'El ID del pedido no es válido');

  const pedidoExistente = await asegurarPedidoModificable(pedidoId);
  const [productoExistente, itemExistente] = await Promise.all([
    repositoryProducto.findById(productoId),
    repository.findByPedidoYProducto(pedidoId, productoId)
  ]);

  if (itemExistente && itemExistente.activo !== false) {
    const error = new Error('El producto ya se encuentra agregado en este pedido');
    error.status = 409;
    throw error;
  }

  if (data.cantidad === undefined || data.cantidad === null) {
    throw crearError('Faltan datos obligatorios para crear item', 400);
  }

  if (!productoExistente || productoExistente.activo === false) {
    throw crearError('El producto indicado no existe o está inactivo', 404);
  }

  const cantidad = validarEnteroPositivo(data.cantidad, 'La cantidad de item debe ser un entero mayor a 0');
  if (Number(productoExistente.stock ?? 0) < cantidad) {
    throw crearError('Stock insuficiente para agregar este producto al pedido', 409);
  }

  const precioCalculado = precioVigente(productoExistente);
  if (!Number.isFinite(precioCalculado) || precioCalculado <= 0) {
    throw crearError('El producto indicado no tiene un precio vigente válido', 400);
  }

  const creado = await repository.create({
    ...data,
    producto_id: productoId,
    pedido_id: pedidoId,
    cantidad,
    precio: precioCalculado
  });
  await recalcularTotalPedido(pedidoExistente);
  return creado;
};

export const actualizarTiene = async (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw crearError('Los datos del ítem no son válidos', 400);
  }

  if (!data.pedido_id || !data.producto_id) {
    const error = new Error('Se requieren pedido_id y producto_id para identificar el item');
    error.status = 400;
    throw error;
  }

  const pedidoId = validarId(data.pedido_id, 'El ID del pedido no es válido');
  const productoId = validarId(data.producto_id, 'El ID del producto no es válido');

  const pedidoExistente = await asegurarPedidoModificable(pedidoId);
  const [tieneExistente, productoExistente] = await Promise.all([
    repository.findByPedidoYProducto(pedidoId, productoId),
    repositoryProducto.findById(productoId)
  ]);

  if (!tieneExistente || tieneExistente.activo === false) {
    const error = new Error('item no encontrado');
    error.status = 404;
    throw error;
  }

  if (!productoExistente || productoExistente.activo === false) {
    throw crearError('El producto indicado no existe o está inactivo', 404);
  }

  const cantidadValidada = data.cantidad !== undefined
    ? validarEnteroPositivo(data.cantidad, 'La cantidad de item debe ser un entero mayor a 0')
    : validarEnteroPositivo(tieneExistente.cantidad, 'La cantidad de item debe ser un entero mayor a 0');

  if (Number(productoExistente.stock ?? 0) < cantidadValidada) {
    throw crearError('Stock insuficiente para actualizar este ítem', 409);
  }

  const precioValidado = precioVigente(productoExistente);
  if (!Number.isFinite(precioValidado) || precioValidado <= 0) {
    throw crearError('El producto indicado no tiene un precio vigente válido', 400);
  }

  const tieneActualizado = await repository.update({
    ...data,
    pedido_id: pedidoId,
    producto_id: productoId,
    cantidad: cantidadValidada,
    precio: precioValidado
  });
  await recalcularTotalPedido(pedidoExistente);
  return tieneActualizado;
};

export const eliminarTiene = async (pedido_id, producto_id) => {
  if (!pedido_id || !producto_id) {
    const error = new Error('Se requieren pedido_id y producto_id');
    error.status = 400;
    throw error;
  }

  const pedidoId = validarId(pedido_id, 'El ID del pedido no es válido');
  const productoId = validarId(producto_id, 'El ID del producto no es válido');
  const pedidoExistente = await asegurarPedidoModificable(pedidoId);

  const rowCount = await repository.remove(pedidoId, productoId);

  if (rowCount === 0) {
    const error = new Error('El item no existe en este pedido');
    error.status = 404;
    throw error;
  }

  await recalcularTotalPedido(pedidoExistente);
  return true;
};