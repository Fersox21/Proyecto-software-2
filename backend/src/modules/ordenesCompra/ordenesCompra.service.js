import * as repository from './ordenesCompra.repository.js';
import * as repositoryProveedor from '../proveedores/proveedores.repository.js'

export const listarOrdenesCompra = async () => {
  return await repository.findAll();
};

export const obtenerOrdenCompraPorId = async (id) => {
  const ordenCompra = await repository.findById(id);
  if (!ordenCompra) {
    const error = new Error('Orden de compra no encontrada');
    error.status = 404;
    throw error;
  }
  return ordenCompra;
};

export const crearOrdenCompra = async (data) => {
  const proveedorExistente = repositoryProveedor.findById(data.proveedor);
  
    if (!data.id || !data.cantidad || !data.total || !data.fecha || !proveedorExistente) {
    const error = new Error('Faltan datos obligatorios para crear el lote (nroOrdenCompra, cantidad, total, fecha)');
    error.status = 400;
    throw error;
  }

  if (data.cantidad <= 0) {
    const error = new Error('La cantidad de la orden de compra debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.total <= 0) {
    const error = new Error('El total de la orden de compra debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await repository.create(data);
};

export const actualizarOrdenCompra = async (id, data) => {
  
  const ordenCompraExistente = await repository.findById(id);
  if (!ordenCompraExistente) {
    const error = new Error('Orden de compra no encontrada');
    error.status = 404;
    throw error;
  }

  if (data.cantidad !== undefined && data.cantidad <= 0) {
      const error = new Error('La cantidad de la orden de compra debe ser mayor a 0');
      error.status = 400;
      throw error;
    }

  if (data.total !== undefined && data.total <= 0) {
      const error = new Error('El total de la orden de compra debe ser mayor a 0');
      error.status = 400;
      throw error;
    }

  const ordenCompraActualizado = await repository.update(id, data);
  return ordenCompraActualizado;
};

export const eliminarOrdenCompra = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Orden de compra no encontrada');
    error.status = 404;
    throw error;
  }
  return true;
};