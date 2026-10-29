import * as repository from './tiene.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import * as repositoryVenta from '../ventas/ventas.repository.js';
import * as repositoryPedido from '../pedidos/pedidos.repository.js'

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

  if (!data.cantidad || !data.precio || !productoExistente || !pedidoExistente) {
    const error = new Error('Faltan datos obligatorios para crear item');
    error.status = 400;
    throw error;
  }

  if (data.cantidad <= 0) {
    const error = new Error('La cantidad de item debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precio <= 0) {
    const error = new Error('El precio de item debe ser mayor a 0');
    error.status = 400;
    throw error;
  }


  return await repository.create(data);
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
  
  if (data.cantidad !== undefined && data.cantidad <= 0) {
      const error = new Error('La cantidad de item debe ser mayor a 0');
      error.status = 400;
      throw error;
    }

  if (data.precio !== undefined && data.precio <= 0) {
      const error = new Error('El precio de item debe ser mayor a 0');
      error.status = 400;
      throw error;
    }

  const tieneActualizado = await repository.update(data);
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