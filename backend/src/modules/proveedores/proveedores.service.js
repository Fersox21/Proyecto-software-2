import * as defaultRepository from './proveedores.repository.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

const REGEX_TELEFONO = /^\+?\d+$/;

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

export const crearProveedoresService = (repository = defaultRepository) => {
  const listarProveedores = async () => {
    return await repository.findAll();
  };

  const obtenerProveedorPorId = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de proveedor inválido');
    const proveedor = await repository.findById(idNum);
    if (!proveedor) {
      throw crearError('Proveedor no encontrado', 404);
    }
    return proveedor;
  };

  const crearProveedor = async (data) => {
    const nombre = validarNombreProveedor(data?.nombre);
    const telefono = validarTelefonoProveedor(data?.telefono);

    return await repository.create({ nombre, telefono });
  };

  const actualizarProveedor = async (id, data) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de proveedor inválido');
    const proveedorExistente = await repository.findById(idNum);
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

    return await repository.update(idNum, { nombre, telefono });
  };

  const eliminarProveedor = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de proveedor inválido');
    const rowCount = await repository.remove(idNum);
    if (rowCount === 0) {
      throw crearError('Proveedor no encontrado', 404);
    }
    return true;
  };

  return {
    listarProveedores,
    obtenerProveedorPorId,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor
  };
};

const defaultService = crearProveedoresService();

export const listarProveedores = defaultService.listarProveedores;
export const obtenerProveedorPorId = defaultService.obtenerProveedorPorId;
export const crearProveedor = defaultService.crearProveedor;
export const actualizarProveedor = defaultService.actualizarProveedor;
export const eliminarProveedor = defaultService.eliminarProveedor;
