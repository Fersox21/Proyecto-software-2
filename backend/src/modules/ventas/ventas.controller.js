import * as defaultVentasService from './ventas.service.js';

export const crearVentasController = (ventasService = defaultVentasService) => {
  const listar = async (req, res, next) => {
    try {
      const { periodo } = req.query;

      if (periodo === 'ultimo-mes') {
        const ventas = await ventasService.ventasUltimoMes();
        return res.status(200).json(ventas);
      }

      const ventas = await ventasService.listarVentas();
      return res.json(ventas);
    } catch (err) {
      next(err);
    }
  };

  const listarHistorial = async (req, res, next) => {
    try {
      const ventas = await ventasService.listarHistorialVentas();
      return res.json(ventas);
    } catch (err) {
      next(err);
    }
  };

  const obtener = async (req, res, next) => {
    try {
      const { id } = req.params;
      const incluirInactivos = req.query.historial === 'true';
      const venta = await ventasService.obtenerVenta(id, incluirInactivos);

      res.status(200).json(venta);
    } catch (err) {
      next(err);
    }
  };

  const obtenerProductos = async (req, res, next) => {
    try {
      const { id } = req.params;
      const incluirInactivos = req.query.historial === 'true';
      const items = await ventasService.obtenerProductosVenta(id, incluirInactivos);

      res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  };

  const crear = async (req, res, next) => {
    try {
      const nuevoVenta = await ventasService.crearVenta(req.body);
      res.status(201).json(nuevoVenta);
    } catch (err) {
      next(err);
    }
  };

  const actualizar = async (req, res, next) => {
    try {
      const ventaActualizada = await ventasService.update(req.params.id, req.body);
      res.json(ventaActualizada);
    } catch (err) {
      next(err);
    }
  };

  const eliminar = async (req, res, next) => {
    try {
      await ventasService.remove(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  return {
    listar,
    listarHistorial,
    obtener,
    obtenerProductos,
    crear,
    actualizar,
    eliminar
  };
};

const defaultController = crearVentasController();

export const listar = defaultController.listar;
export const listarHistorial = defaultController.listarHistorial;
export const obtener = defaultController.obtener;
export const obtenerProductos = defaultController.obtenerProductos;
export const crear = defaultController.crear;
export const actualizar = defaultController.actualizar;
export const eliminar = defaultController.eliminar;
