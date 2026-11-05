import * as service from './estadisticas.service.js';

export const gananciasMensuales = async (req, res, next) => {
  try {
    const data = await service.obtenerGananciasMensuales();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const productosVencidos = async (req, res, next) => {
  try {
    const data = await service.obtenerProductosVencidos();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const masVendidos = async (req, res, next) => {
  try {
    const { mes } = req.query;
    const data = await service.obtenerMasVendidos(mes);
    res.json(data);
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({
        success: false,
        error: err.message,
        statusCode: 400
      });
    }
    next(err);
  }
};

export const promedioDiario = async (req, res, next) => {
  try {
    const data = await service.obtenerPromedioDiario();
    res.json(data);
  } catch (err) {
    next(err);
  }
};