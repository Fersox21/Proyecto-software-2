import * as ventasRepository from './ventas.repository.js';

export const listarVentas = async () => {
  const rows = await ventasRepository.listar();
    if (rows.length === 0) {
      return null;
    }
  return rows;
};

export const obtenerVenta = async (id) => {
  const rows = await ventasRepository.obtener(id);
  
  if (!rows) {
    const error = new Error(`La venta con ID ${id} no existe`);
    error.status = 404;
    throw error;
  }

  return rows[0];
};

export const ventasUltimoMes = async () => {
  const rows = await ventasRepository.obtenerVentasMes();
  return rows;
}