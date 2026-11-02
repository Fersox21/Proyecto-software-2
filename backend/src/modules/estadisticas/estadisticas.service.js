import * as repo from './estadisticas.repository.js';

export const obtenerGananciasMensuales = async () => {
  return await repo.gananciasMensuales();
};

export const obtenerProductosVencidos = async () => {
  return await repo.productosVencidos();
};

export const obtenerMasVendidos = async (mes) => {
  let mesConsulta = mes;

  if (!mesConsulta) {
    const ahora = new Date();
    // Mes anterior por defecto
    ahora.setMonth(ahora.getMonth() - 1);
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, '0');
    mesConsulta = `${yyyy}-${mm}`;
  }

  const regexMes = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!regexMes.test(mesConsulta)) {
    const error = new Error('El parámetro "mes" debe tener el formato YYYY-MM');
    error.status = 400;
    throw error;
  }

  const items = await repo.masVendidosPorMes(mesConsulta);
  return {
    mes: mesConsulta,
    items
  };
};

export const obtenerPromedioDiario = async () => {
  return await repo.promedioDiario();
};