import * as repository from './pedidos.repository.js';
import * as repositoryRol from '../roles/roles.repository.js';

export const listarPedidos = async () => {
  return await repository.findAll();
};

export const obtenerPedidoPorId = async (id) => {
  const pedido = await repository.findById(id);
  if (!pedido) {
    const error = new Error('Pedido no encontrado');
    error.status = 404;
    throw error;
  }
  return pedido;
};

export const crearPedido = async (data) => {
  const rolExistente = repositoryRol.findById(data.rol);

  if (!data.fecha || !data.total || !data.metodoPago || !data.comercio || !data.modalidadEntrega || !data.direccion || !data.estado || !rolExistente) {
    const error = new Error('Faltan datos obligatorios para crear el pedido');
    error.status = 400;
    throw error;
  }

  if (data.total <= 0) {
    const error = new Error('El total del pedido debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const estadosPermitidos = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'ENTREGADO'];
  if (data.estado && !estadosPermitidos.includes(data.estado.toUpperCase())) {
    const error = new Error('El estado del pedido no es válido');
    error.status = 400;
    throw error;
  }

  return await repository.create(data);
};

export const actualizarPedido = async (id, data) => {
  const pedidoExistente = await repository.findById(id);
  if (!pedidoExistente) {
    const error = new Error('Pedido no encontrado');
    error.status = 404;
    throw error;
  }

  if (data.total !== undefined && data.total <= 0) {
    const error = new Error('El total del pedido debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const pedidoActualizado = await repository.update(id, data);
  return pedidoActualizado;
};

export const eliminarPedido = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Pedido no encontrado');
    error.status = 404;
    throw error;
  }
  return true;
};