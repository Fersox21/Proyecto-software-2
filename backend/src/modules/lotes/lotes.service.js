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

  const { cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto } = data;

  if (!cantidad || !fechaArribo || !fechaVencimiento || !ordenCompra || !producto) {
    const error = new Error('Faltan datos obligatorios para crear el lote (cantidad, fechaArribo, fechaVencimiento, ordenCompra, producto)');
    error.status = 400;
    throw error;
  }

  if (data.cantidad <= 0) {
    const error = new Error('La cantidad del lote debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const ordenCompraExistente = await repositoryOrdenCompra.findById(ordenCompra);
  const productoExistente = await repositoryProducto.findById(producto);

  if (!ordenCompraExistente) {
    const error = new Error('La orden de compra especificada no existe');
    error.status = 404;
    throw error;
  }

  if (!productoExistente) {
    const error = new Error('El producto especificado no existe');
    error.status = 404;
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