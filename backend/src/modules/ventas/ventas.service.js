import * as ventasRepository from './ventas.repository.js';

export const listarVentas = async () => {
  const ventas = await ventasRepository.listar();
    if (rows.length === 0) {
      return null;
    }
  return ventas;
};

export const obtenerVenta = async (id) => {
  const rows = await ventasRepository.obtener(id);
  
  if (rows.length === 0) {
    const error = new Error(`La venta con ID ${id} no existe`);
    error.status = 404;
    throw error;
  }

  return rows[0];
};


export const crearVenta = async (data) => {
  const pedidoExistente = await repositoryPedidos.findById(data.pedido_id);
 
  if(!pedidoExistente){
    const error = new Error('No existe pedido con ese id');
    error.status = 404;
    throw error;
  }

  if (!data.fecha || !data.total) {
    const error = new Error('Faltan datos obligatorios para crear venta');
    error.status = 400;
    throw error;
  }


  if (data.total <= 0) {
    const error = new Error('El total de tiene debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await ventasRepository.create(data);
};

export const update = async (id,data) => {
  const ventaExistente = await ventasRepository.obtener(id);

  if(!ventaExistente){
    const error = new Error('No existe venta con ese id');
    error.status = 404;
    throw error;
  }

  if (!data.fecha || !data.total) {
    const error = new Error('Faltan datos obligatorios para actualizar venta');
    error.status = 400;
    throw error;
  }


  if (data.total <= 0) {
    const error = new Error('El total de tiene debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  return await ventasRepository.update(id,data);
};

export const remove = async (id) => {
  const rowCount = await ventasRepository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Venta no encontrada');
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};