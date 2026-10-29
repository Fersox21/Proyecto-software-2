
import * as ventasService from './ventas.service.js'

export const listar = async (req, res, next) => { 
  try {
    const { periodo } = req.query;  

    if (periodo === 'ultimo-mes') {
      const ventas = await ventasService.ventasUltimoMes();
      return res.status(200).json(ventas);
    }

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

    res.status(200).json(venta);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const nuevoVenta = await ventasService.crearVenta(req.body);
    res.status(201).json(nuevoVenta);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const ventaActualizada = await ventasService.update(req.params.id, req.body);
    res.json(ventaActualizada);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await ventasService.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
