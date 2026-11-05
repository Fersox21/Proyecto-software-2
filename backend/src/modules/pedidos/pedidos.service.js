import * as repository from './pedidos.repository.js';
import * as repositoryRol from '../roles/roles.repository.js';
import * as repositoryTiene from '../tiene/tiene.repository.js';

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

  const estadosPermitidos = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'ENTREGADO', 'ELIMINADO'];
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

export const eliminarItemDePedido = async (pedido_id, producto_id) => {
  // 1. Eliminación física del ítem
  const rowCount = await repositoryTiene.remove(pedido_id, producto_id);
  
  if (rowCount === 0) {
    const error = new Error('Ítem no encontrado en el pedido');
    error.status = 404;
    throw error;
  }

  // 2. Verificación de ítems restantes
  const itemsRestantes = await repositoryTiene.findByPedido(pedido_id);
  let pedidoEliminado = false;
  let nuevoTotal = 0;

  if (itemsRestantes.length > 0) {
    nuevoTotal = itemsRestantes.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0);
  }

  // 3. Actualizar el pedido
  const pedido = await repository.findById(pedido_id);
  if (pedido) {
    const dataActualizacion = { ...pedido };
    
    if (itemsRestantes.length === 0) {
      dataActualizacion.estado = 'ELIMINADO';
      pedidoEliminado = true;
    } else {
      dataActualizacion.total = nuevoTotal;
    }
    
    await repository.update(pedido_id, dataActualizacion);
  }

  return {
    success: true,
    message: pedidoEliminado 
      ? 'Ítem eliminado y pedido marcado como ELIMINADO' 
      : 'Ítem eliminado y total del pedido actualizado',
    pedido_id,
    producto_id,
    pedido_eliminado: pedidoEliminado,
    nuevo_total: nuevoTotal
  };
};