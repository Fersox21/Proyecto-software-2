import * as service from './pedidos.service.js';

export const listar = async (req, res, next) => {
  try {
    const pedidos = await service.listarPedidos();
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const pedido = await service.obtenerPedidoPorId(req.params.id);
    res.json(pedido);
  } catch (err) {
    next(err);
  }
};

export const obtenerLotesDisponibles = async (req, res, next) => {
  try {
    const lotes = await service.obtenerLotesDisponibles(req.params.id);
    res.json(lotes);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoPedido = await service.crearPedido(req.body);
    res.status(201).json(nuevoPedido);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const pedidoActualizado = await service.actualizarPedido(req.params.id, req.body);
    res.json(pedidoActualizado);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarPedido(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const eliminarItem = async (req, res, next) => {
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