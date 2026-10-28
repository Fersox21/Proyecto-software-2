import * as repository from './tiene.repository.js';
import * as repositoryProducto from '../productos/productos.repository.js';
import * as repositoryVenta from '../ventas/ventas.repository.js';

export const listarTiene = async () => {
  return await repository.findAll();
};

export const obtenerTienePorId = async (id) => {
  const tiene = await repository.findById(id);
  if (!tiene) {
    const error = new Error('Tiene no encontrado');
    error.status = 404;
    throw error;
  }
  return tiene;
};

export const crearTiene = async (data) => {
  const productoExistente = repositoryProducto.findById(data.producto)
  const ventaExistente = repositoryVenta.findById(data.venta)

  if (!data.cantidad || !data.precio || !productoExistente || !ventaExistente) {
    const error = new Error('Faltan datos obligatorios para crear tiene');
    error.status = 400;
    throw error;
  }

  if (data.cantidad <= 0) {
    const error = new Error('La cantidad de tiene debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  if (data.precio <= 0) {
    const error = new Error('El precio de tiene debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await repository.create(data);
};

export const actualizarTiene = async (id, data) => {
  const tieneExistente = await repository.findById(id);
    if (!tieneExistente) {
      const error = new Error('Tiene no encontrado');
      error.status = 404;
      throw error;
    }
  
  if (data.cantidad !== undefined && data.cantidad <= 0) {
      const error = new Error('La cantidad de tiene debe ser mayor a 0');
      error.status = 400;
      throw error;
    }

  if (data.precio !== undefined && data.precio <= 0) {
      const error = new Error('El precio de tiene debe ser mayor a 0');
      error.status = 400;
      throw error;
    }

  const tieneActualizado = await repository.update(id, data);
  return tieneActualizado;
};

export const eliminarTiene = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Tiene no encontrado');
    error.status = 404;
    throw error;
  }
  return true;
};