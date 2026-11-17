import * as defaultRepo from './estadisticas.repository.js';
import { crearError } from '../../utils/validaciones.js';

export const crearEstadisticasService = (repo = defaultRepo) => {
  const obtenerGananciasMensuales = async () => {
    return await repo.gananciasMensuales();
  };

  const obtenerProductosVencidos = async () => {
    return await repo.productosVencidos();
  };

  const obtenerMasVendidos = async (mes) => {
    let mesConsulta = mes;

    if (!mesConsulta) {
      const ahora = new Date();
      ahora.setMonth(ahora.getMonth() - 1);
      const yyyy = ahora.getFullYear();
      const mm = String(ahora.getMonth() + 1).padStart(2, '0');
      mesConsulta = `${yyyy}-${mm}`;
    }

    const regexMes = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regexMes.test(mesConsulta)) {
      throw crearError('El parámetro "mes" debe tener el formato YYYY-MM', 400);
    }

    const items = await repo.masVendidosPorMes(mesConsulta);
    return {
      mes: mesConsulta,
      items
    };
  };

  const obtenerPromedioDiario = async () => {
    return await repo.promedioDiario();
  };

  return {
    obtenerGananciasMensuales,
    obtenerProductosVencidos,
    obtenerMasVendidos,
    obtenerPromedioDiario
  };
};

const defaultService = crearEstadisticasService();

export const obtenerGananciasMensuales = defaultService.obtenerGananciasMensuales;
export const obtenerProductosVencidos = defaultService.obtenerProductosVencidos;
export const obtenerMasVendidos = defaultService.obtenerMasVendidos;
export const obtenerPromedioDiario = defaultService.obtenerPromedioDiario;