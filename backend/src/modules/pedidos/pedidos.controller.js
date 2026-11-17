import * as defaultService from './pedidos.service.js';

export const crearPedidosController = (service = defaultService) => {
  const listar = async (req, res, next) => {
    try {
      const pedidos = await service.listarPedidos();
      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  };

  const listarHistorial = async (req, res, next) => {
    try {
      const pedidos = await service.listarHistorialPedidos();
      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  };

  const obtener = async (req, res, next) => {
    try {
      const incluirInactivos = req.query.historial === 'true';
      const pedido = await service.obtenerPedidoPorId(req.params.id, incluirInactivos);
      res.json(pedido);
    } catch (err) {
      next(err);
    }
  };

  const obtenerLotesDisponibles = async (req, res, next) => {
    try {
      const lotes = await service.obtenerLotesDisponibles(req.params.id);
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  };

  const crear = async (req, res, next) => {
    try {
      const nuevoPedido = await service.crearPedido(req.body);
      res.status(201).json(nuevoPedido);
    } catch (err) {
      next(err);
    }
  };

  const actualizar = async (req, res, next) => {
    try {
      const pedidoActualizado = await service.actualizarPedido(req.params.id, req.body);
      res.json(pedidoActualizado);
    } catch (err) {
      next(err);
    }
  };

  const eliminar = async (req, res, next) => {
    try {
      await service.eliminarPedido(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  const eliminarItem = async (req, res, next) => {
    try {
      const { pedido_id, producto_id } = req.params;
      if (!pedido_id || !producto_id) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren pedido_id y producto_id',
          statusCode: 400
        });
      }
      const resultado = await service.eliminarItemDePedido(pedido_id, producto_id);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  };

  return {
    listar,
    listarHistorial,
    obtener,
    obtenerLotesDisponibles,
    crear,
    actualizar,
    eliminar,
    eliminarItem
  };
};

const defaultController = crearPedidosController();

export const listar = defaultController.listar;
export const listarHistorial = defaultController.listarHistorial;
export const obtener = defaultController.obtener;
export const obtenerLotesDisponibles = defaultController.obtenerLotesDisponibles;
export const crear = defaultController.crear;
export const actualizar = defaultController.actualizar;
export const eliminar = defaultController.eliminar;
export const eliminarItem = defaultController.eliminarItem;