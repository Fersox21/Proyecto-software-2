import * as repository from './lotes.repository.js';
import * as repositoryOrdenCompra from '../ordenesCompra/ordenesCompra.repository.js'
import * as repositoryProducto from '../productos/productos.repository.js'

export const listarLotes = async () => {
  return await repository.findAll();
};

export const obtenerLotePorId = async (id) => {
  const lote = await repository.findById(id);
  if (!lote) {
    const error = new Error('Lote no encontrado');
    error.status = 404;
    throw error;
  }
  return lote;
};

export const crearLote = async (data) => {
  const ordenCompraExistente = repositoryOrdenCompra.findById(data.ordenCompra)
  const productoExistente = repositoryProducto.findById(data.producto)

  if (!data.cantidad || !data.fechaVencimiento || !ordenCompraExistente || !productoExistente) {
    const error = new Error('Faltan datos obligatorios para crear el lote (cantidad, fechaVencimiento)');
    error.status = 400;
    throw error;
  }

  if (data.cantidad <= 0) {
    const error = new Error('La cantidad del lote debe ser mayor a 0');
    error.status = 400;
    throw error;
  }
  
  return await repository.create(data);
};

export const actualizarLote = async (id, data) => {
  const loteExistente = await repository.findById(id);
  if (!loteExistente) {
    const error = new Error('Lote no encontrado');
    error.status = 404;
    throw error;
  }

  if (data.cantidad !== undefined && data.cantidad <= 0) {
    const error = new Error('La cantidad del lote debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const loteActualizado = await repository.update(id, data);
  return loteActualizado;
};

export const eliminarLote = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Lote no encontrado');
    error.status = 404;
    throw error;
  }
  return true;
};