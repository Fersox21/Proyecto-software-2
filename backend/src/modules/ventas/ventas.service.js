import * as repository from './ventas.repository.js';
import * as pedidoRepository from '../pedidos/pedidos.repository.js'

export const listarVenta = async () => {
  return await repository.findAll();
};

export const obtenerVentaPorId = async (id) => {
  const venta = await repository.findById(id);
  if (!venta) {
    const error = new Error('Venta no encontrada');
    error.status = 404;
    throw error;
  }
  return venta;
};

export const crearVenta = async (data) => {
  const pedidoExistente = pedidoRepository.findById(data.pedido);
  if (!data.fecha || !data.total || !pedidoExistente) {
    const error = new Error('Faltan datos obligatorios para crear la venta');
    error.status = 400;
    throw error;
  }

  if (data.total <= 0) {
    const error = new Error('El total de la venta debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.pedido <= 0) {
    const error = new Error('El pedido de la venta debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await repository.create(data);
};

export const actualizarVenta = async (id, data) => {
  const ventaExistente = await repository.findById(id);
    if (!ventaExistente) {
      const error = new Error('Venta no encontrada');
      error.status = 404;
      throw error;
    }

  if (data.total !== undefined && data.total <= 0) {
    const error = new Error('El total de la venta debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const ventaActualizada = await repository.update(id, data);
  return ventaActualizada;
};

export const eliminarVenta = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Venta no encontrada');
    error.status = 404;
    throw error;
  }
  return true;
};