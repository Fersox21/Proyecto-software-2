import bcrypt from 'bcrypt';
import * as defaultRepository from './roles.repository.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES_VALIDOS = ['admin', 'cliente'];
const MAX_BCRYPT_BYTES = 72;
const MAX_CORREO_LEN = 50;

const validarCorreo = (valor) => {
  if (typeof valor !== 'string' || valor.includes('\0')) {
    throw crearError('El correo electrónico debe ser texto válido', 400);
  }
  const correo = valor.trim().toLowerCase();
  if (!correo) {
    throw crearError('El correo electrónico es obligatorio', 400);
  }
  if (correo.length > MAX_CORREO_LEN) {
    throw crearError('El correo electrónico no puede superar los 50 caracteres', 400);
  }
  if (!regexEmail.test(correo)) {
    throw crearError('El formato del correo electrónico no es válido', 400);
  }
  return correo;
};

const validarPassword = (valor) => {
  if (typeof valor !== 'string' || valor.includes('\0')) {
    throw crearError('La contraseña debe ser texto válido', 400);
  }
  if (valor.length < 8) {
    throw crearError('La contraseña debe tener al menos 8 caracteres', 400);
  }
  if (Buffer.byteLength(valor, 'utf8') > MAX_BCRYPT_BYTES) {
    throw crearError('La contraseña no puede superar los 72 bytes', 400);
  }
  return valor;
};

const validarRol = (valor) => {
  if (typeof valor !== 'string') {
    throw crearError('El rol es obligatorio y debe ser "admin" o "cliente"', 400);
  }
  const rol = valor.trim().toLowerCase();
  if (!ROLES_VALIDOS.includes(rol)) {
    throw crearError('El rol debe ser "admin" o "cliente"', 400);
  }
  return rol;
};

export const crearRolesService = (repository = defaultRepository, bcryptLib = bcrypt) => {
  const listarRoles = async () => {
    return await repository.findAll();
  };

  const obtenerRolPorId = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de usuario inválido');
    const rol = await repository.findById(idNum);
    if (!rol) {
      throw crearError('Rol no encontrado', 404);
    }
    return rol;
  };

  const crearRol = async (data) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw crearError('Faltan datos obligatorios para crear el rol', 400);
    }

    if (data.correo === undefined || data.password === undefined || data.rol === undefined) {
      throw crearError('Faltan datos obligatorios para crear el rol (correo, password, rol)', 400);
    }

    const correo = validarCorreo(data.correo);
    const password = validarPassword(data.password);
    const rol = validarRol(data.rol);

    const passwordHash = await bcryptLib.hash(password, 10);

    try {
      return await repository.create({
        correo,
        password: passwordHash,
        rol
      });
    } catch (error) {
      if (error.code === '23505') {
        throw crearError('El correo ya se encuentra registrado', 409);
      }
      throw error;
    }
  };

  const actualizarRol = async (id, data) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de usuario inválido');
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw crearError('Los datos para actualizar no son válidos', 400);
    }

    const rolExistente = await repository.findById(idNum);
    if (!rolExistente) {
      throw crearError('Rol no encontrado', 404);
    }

    const datosAActualizar = {
      correo: data.correo !== undefined ? validarCorreo(data.correo) : rolExistente.correo,
      rol: data.rol !== undefined ? validarRol(data.rol) : rolExistente.rol
    };

    if (data.password !== undefined) {
      const passwordValidado = validarPassword(data.password);
      datosAActualizar.password = await bcryptLib.hash(passwordValidado, 10);
    }

    try {
      return await repository.update(idNum, datosAActualizar);
    } catch (error) {
      if (error.code === '23505') {
        throw crearError('El correo ya se encuentra registrado', 409);
      }
      throw error;
    }
  };

  const eliminarRol = async (id) => {
    const idNum = validarIdEnteroPositivo(id, 'ID de usuario inválido');
    const rowCount = await repository.remove(idNum);
    if (rowCount === 0) {
      throw crearError('Rol no encontrado', 404);
    }
    return true;
  };

  return { listarRoles, obtenerRolPorId, crearRol, actualizarRol, eliminarRol };
};

const defaultService = crearRolesService();

export const listarRoles = defaultService.listarRoles;
export const obtenerRolPorId = defaultService.obtenerRolPorId;
export const crearRol = defaultService.crearRol;
export const actualizarRol = defaultService.actualizarRol;
export const eliminarRol = defaultService.eliminarRol;