import * as repository from './proveedores.repository.js';

export const listarProveedores = async () => {
  return await repository.findAll();
};

export const obtenerProveedorPorId = async (id) => {
  const proveedor = await repository.findById(id);
  if (!proveedor) {
    const error = new Error('Proveedor no encontrado');
    error.status = 404;
    throw error;
  }
  return proveedor;
};

export const crearProveedor = async (data) => {
  if (!data.nombre || !data.telefono) {
    const error = new Error('Faltan datos obligatorios para crear el pedido');
    error.status = 400;
    throw error;
  }

  return await repository.create(data);
};

export const actualizarProveedor = async (id, data) => {
  const proveedorExistente = await repository.findById(id);
    if (!proveedorExistente) {
      const error = new Error('Proveedor no encontrado');
      error.status = 404;
      throw error;
    }

  const proveedorActualizado = await repository.update(id, data);
  return proveedorActualizado;
};

export const eliminarProveedor = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Proveedor no encontrado');
    error.status = 404;
    throw error;
  }
  return true;
};