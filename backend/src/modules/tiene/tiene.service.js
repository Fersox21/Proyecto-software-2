import * as defaultRepository from './tiene.repository.js';
import { calcularEnvio } from '../pedidos/pedidos.service.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

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

export const crearTieneService = (repository = defaultRepository) => {
  const listarTiene = async () => {
    return await repository.findAll();
  };

  const obtenerTienePorId = async (pedido_id) => {
    const pedidoId = validarIdEnteroPositivo(pedido_id, 'ID de pedido inválido');
    const rows = await repository.findByPedido(pedidoId);
    if (rows.length === 0) {
      throw crearError('Item no encontrado', 404);
    }
    return rows;
  };

  const crearTiene = async (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw crearError('Faltan datos obligatorios para crear item', 400);
    }

    const pedido_id = validarIdEnteroPositivo(data.pedido_id, 'ID de pedido inválido');
    const producto_id = validarIdEnteroPositivo(data.producto_id, 'ID de producto inválido');

    if (data.cantidad === undefined || data.cantidad === null || data.precio === undefined || data.precio === null) {
      throw crearError('Faltan datos obligatorios para crear item', 400);
    }

    const cantidad = validarIdEnteroPositivo(
      data.cantidad,
      'La cantidad de item debe ser un entero mayor a 0'
    );
    const precio = validarDecimalPositivo(
      data.precio,
      'El precio de item debe ser mayor a 0'
    );

    return await repository.crearItemConRecalculo(
      { pedido_id, producto_id, cantidad, precio },
      calcularEnvio
    );
  };

  const actualizarTiene = async (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw crearError('Se requieren pedido_id y producto_id para identificar el item', 400);
    }

    if (!data.pedido_id || !data.producto_id) {
      throw crearError('Se requieren pedido_id y producto_id para identificar el item', 400);
    }

    const pedido_id = validarIdEnteroPositivo(data.pedido_id, 'ID de pedido inválido');
    const producto_id = validarIdEnteroPositivo(data.producto_id, 'ID de producto inválido');

    const cantidad = data.cantidad !== undefined
      ? validarIdEnteroPositivo(data.cantidad, 'La cantidad de item debe ser un entero mayor a 0')
      : undefined;

    const precio = data.precio !== undefined
      ? validarDecimalPositivo(data.precio, 'El precio de item debe ser mayor a 0')
      : undefined;

    return await repository.actualizarItemConRecalculo(
      { pedido_id, producto_id, cantidad, precio },
      calcularEnvio
    );
  };

  const eliminarTiene = async (pedido_id, producto_id) => {
    if (!pedido_id || !producto_id) {
      throw crearError('Se requieren pedido_id y producto_id', 400);
    }

    const pedidoId = validarIdEnteroPositivo(pedido_id, 'ID de pedido inválido');
    const productoId = validarIdEnteroPositivo(producto_id, 'ID de producto inválido');

    await repository.eliminarItemConRecalculo(pedidoId, productoId, calcularEnvio);
    return true;
  };

  return {
    listarTiene,
    obtenerTienePorId,
    crearTiene,
    actualizarTiene,
    eliminarTiene
  };
};

const defaultService = crearTieneService();

export const listarTiene = defaultService.listarTiene;
export const obtenerTienePorId = defaultService.obtenerTienePorId;
export const crearTiene = defaultService.crearTiene;
export const actualizarTiene = defaultService.actualizarTiene;
export const eliminarTiene = defaultService.eliminarTiene;