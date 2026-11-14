import * as repository from './ordenesCompra.repository.js';
import * as repositoryProveedor from '../proveedores/proveedores.repository.js';

export const listarOrdenesCompra = async () => {
  return await repository.findAll();
};

export const obtenerOrdenCompraPorId = async (id) => {
  const ordenCompra = await repository.findById(id);
  if (!ordenCompra) {
    const error = new Error('Orden de compra no encontrada');
    error.status = 404;
    throw error;
  }
  return ordenCompra;
};

export const crearOrdenCompra = async (data) => {
  const proveedorId = data.proveedor_id ?? data.proveedorId ?? data.proveedor;
  const proveedorExistente = proveedorId ? await repositoryProveedor.findById(proveedorId) : null;

  if (!data.total || !data.fecha || !proveedorExistente) {
    const error = new Error('Faltan datos obligatorios para crear la orden de compra (total, fecha, proveedor)');
    error.status = 400;
    throw error;
  }

  if (data.total <= 0) {
    const error = new Error('El total de la orden de compra debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const lotes = Array.isArray(data.lotes) ? data.lotes : [];
  if (lotes.length === 0) {
    const error = new Error('La orden de compra debe tener al menos un lote');
    error.status = 400;
    throw error;
  }

  for (const lote of lotes) {
    const prodId = lote.productoId ?? lote.producto;
    const cantidad = Number(lote.cantidad);
    const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
    const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

    if (!prodId || !cantidad || cantidad <= 0 || !fArribo || !fVenci) {
      const error = new Error('Los datos de los lotes son obligatorios e inválidos');
      error.status = 400;
      throw error;
    }
  }

  return await repository.create({
    total: data.total,
    fecha: data.fecha,
    proveedor_id: proveedorId,
    lotes,
  });
};

export const actualizarOrdenCompra = async (id, data) => {
  const ordenCompraExistente = await repository.findById(id);
  if (!ordenCompraExistente) {
    const error = new Error('Orden de compra no encontrada');
    error.status = 404;
    throw error;
  }

  if (data.total !== undefined && data.total <= 0) {
    const error = new Error('El total de la orden de compra debe ser mayor a 0');
    error.status = 400;
    throw error;
  }

  const proveedorId = data.proveedor_id ?? data.proveedorId ?? data.proveedor;
  if (proveedorId !== undefined) {
    const proveedorExistente = await repositoryProveedor.findById(proveedorId);
    if (!proveedorExistente) {
      const error = new Error('Proveedor no encontrado');
      error.status = 404;
      throw error;
    }
  }

  if (data.lotes !== undefined) {
    if (!Array.isArray(data.lotes) || data.lotes.length === 0) {
      const error = new Error('La orden de compra debe tener al menos un lote');
      error.status = 400;
      throw error;
    }

    for (const lote of data.lotes) {
      const prodId = lote.productoId ?? lote.producto;
      const cantidad = Number(lote.cantidad);
      const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
      const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

      if (!prodId || !cantidad || cantidad <= 0 || !fArribo || !fVenci) {
        const error = new Error('Los datos de los lotes son obligatorios e inválidos');
        error.status = 400;
        throw error;
      }
    }
  }

  const datosActualizar = {
    total: data.total ?? ordenCompraExistente.total,
    fecha: data.fecha ?? ordenCompraExistente.fecha,
    ...(proveedorId !== undefined && { proveedor_id: proveedorId }),
    ...(data.lotes !== undefined && { lotes: data.lotes }),
  };

  const ordenCompraActualizado = await repository.update(id, datosActualizar);
  return ordenCompraActualizado;
};

export const eliminarOrdenCompra = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Orden de compra no encontrada');
    error.status = 404;
    throw error;
  }
  return true;
};
