
import * as ventasService from './ventas.service.js'

export const listar = async (req, res, next) => { 
  try {
    const ventas = await ventasService.listarVentas();
    return res.json(ventas);
  }catch (err){
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venta = await ventasService.obtenerVenta(id);

    res.json(venta);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoVenta = await service.crearVenta(req.body);
    res.status(201).json(nuevoVenta);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const ventaActualizada = await service.actualizarVenta(req.params.id, req.body);
    res.json(ventaActualizada);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await service.eliminarVenta(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};