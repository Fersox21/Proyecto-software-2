import * as repository from './proveedores.repository.js';

const REGEX_TELEFONO = /^\+?\d{7,22}$/;

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

export const validarNombreProveedor = (valor) => {
  if (typeof valor !== 'string') {
    throw crearError('El nombre del proveedor es obligatorio', 400);
  }
  if (valor.includes('\u0000')) {
    throw crearError('El nombre del proveedor contiene caracteres inválidos', 400);
  }
  const nombre = valor.trim();
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
      'El teléfono del proveedor debe tener entre 7 y 22 números (puede incluir + al inicio, sin espacios ni guiones)',
      400
    );
  }
  return telefono;
};

const validarId = (id) => {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) {
    throw crearError('El ID del proveedor no es válido', 400);
  }
  return num;
};

export const listarProveedores = async () => {
  return await repository.findAll();
};

export const obtenerProveedorPorId = async (id) => {
  const idValido = validarId(id);
  const proveedor = await repository.findById(idValido);
  if (!proveedor) {
    throw crearError('Proveedor no encontrado', 404);
  }
  return proveedor;
};

export const crearProveedor = async (data) => {
  const nombre = validarNombreProveedor(data?.nombre);
  const telefono = validarTelefonoProveedor(data?.telefono);

  const existente = await repository.findByNombreInsensitive(nombre);
  if (existente) {
    throw crearError('Ya existe un proveedor con ese nombre', 409);
  }

  return await repository.create({ nombre, telefono });
};

export const actualizarProveedor = async (id, data) => {
  const idValido = validarId(id);
  const proveedorExistente = await repository.findById(idValido);
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

  if (data?.nombre !== undefined) {
    const duplicado = await repository.findByNombreInsensitive(nombre);
    if (duplicado && duplicado.id !== idValido) {
      throw crearError('Ya existe un proveedor con ese nombre', 409);
    }
  }

  return await repository.update(idValido, { nombre, telefono });
};

export const eliminarProveedor = async (id) => {
  const idValido = validarId(id);
  const rowCount = await repository.remove(idValido);
  if (rowCount === 0) {
    throw crearError('Proveedor no encontrado', 404);
  }
  return true;
};
