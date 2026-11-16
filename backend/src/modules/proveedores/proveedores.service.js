import * as repository from './proveedores.repository.js';

const REGEX_TELEFONO = /^\+?\d+$/;

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

export const validarNombreProveedor = (valor) => {
  const nombre = typeof valor === 'string' ? valor.trim() : '';
  if (!nombre) {
    throw crearError('El nombre del proveedor es obligatorio', 400);
  }
  if (nombre.length > 100) {
    throw crearError('El nombre del proveedor no puede superar los 100 caracteres', 400);
  }
  return nombre;
};

export const validarTelefonoProveedor = (valor) => {
  const telefono =
    typeof valor === 'string' || typeof valor === 'number'
      ? String(valor).trim()
      : '';

  if (!telefono) {
    throw crearError('El teléfono del proveedor es obligatorio', 400);
  }
  if (telefono.length > 40) {
    throw crearError('El teléfono del proveedor no puede superar los 40 caracteres', 400);
  }
  if (!REGEX_TELEFONO.test(telefono)) {
    throw crearError(
      'El teléfono del proveedor solo puede contener dígitos y un + opcional al inicio (sin espacios ni guiones)',
      400
    );
  }
  return telefono;
};

export const listarProveedores = async () => {
  return await repository.findAll();
};

export const obtenerProveedorPorId = async (id) => {
  const proveedor = await repository.findById(id);
  if (!proveedor) {
    throw crearError('Proveedor no encontrado', 404);
  }
  return proveedor;
};

export const crearProveedor = async (data) => {
  const nombre = validarNombreProveedor(data?.nombre);
  const telefono = validarTelefonoProveedor(data?.telefono);

  return await repository.create({ nombre, telefono });
};

export const actualizarProveedor = async (id, data) => {
  const proveedorExistente = await repository.findById(id);
  if (!proveedorExistente) {
    throw crearError('Proveedor no encontrado', 404);
  }

  const nombre =
    data?.nombre !== undefined
      ? validarNombreProveedor(data.nombre)
      : proveedorExistente.nombre;
  const telefono =
    data?.telefono !== undefined
      ? validarTelefonoProveedor(data.telefono)
      : proveedorExistente.telefono;

  return await repository.update(id, { nombre, telefono });
};

export const eliminarProveedor = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    throw crearError('Proveedor no encontrado', 404);
  }
  return true;
};
