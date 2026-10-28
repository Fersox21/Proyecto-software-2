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
    const error = new Error('Venta no encontrada');
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};