import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authRepository from './auth.repository.js';
import { env } from '../../config/env.js';
import { crearError } from '../../utils/validaciones.js';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES_VALIDOS = ['admin', 'cliente'];
const MAX_BCRYPT_BYTES = 72;
const MAX_CORREO_LEN = 50;

export const crearAuthService = ({
  repository = authRepository,
  bcryptLib = bcrypt,
  jwtLib = jwt,
  obtenerJwtSecret = () => env.JWT_SECRET,
  obtenerJwtExpiresIn = () => env.JWT_EXPIRES_IN
} = {}) => {
  const registro = async (correo, password, rolSolicitado) => {
    if (correo === undefined || password === undefined) {
      throw crearError('Correo y contraseña obligatorios', 400);
    }

    if (typeof correo !== 'string' || typeof password !== 'string') {
      throw crearError('Correo y contraseña deben ser texto válido', 400);
    }

    if (correo.includes('\0') || password.includes('\0')) {
      throw crearError('El correo o la contraseña contienen caracteres inválidos', 400);
    }

    const correoNormalizado = correo.trim().toLowerCase();
    if (!correoNormalizado || password.length === 0) {
      throw crearError('Correo y contraseña obligatorios', 400);
    }

    if (correoNormalizado.length > MAX_CORREO_LEN) {
      throw crearError('El correo electrónico no puede superar los 50 caracteres', 400);
    }

    if (!REGEX_EMAIL.test(correoNormalizado)) {
      throw crearError('El formato del correo electrónico no es válido', 400);
    }

    if (password.length < 8) {
      throw crearError('La contraseña debe tener al menos 8 caracteres', 400);
    }

    if (Buffer.byteLength(password, 'utf8') > MAX_BCRYPT_BYTES) {
      throw crearError('La contraseña no puede superar los 72 bytes', 400);
    }

    let rol = 'cliente';
    if (rolSolicitado !== undefined) {
      if (typeof rolSolicitado !== 'string') {
        throw crearError('El rol indicado no es válido', 400);
      }
      const rolNormalizado = rolSolicitado.trim().toLowerCase();
      if (!ROLES_VALIDOS.includes(rolNormalizado)) {
        throw crearError('El rol debe ser "admin" o "cliente"', 400);
      }
      rol = rolNormalizado;
    }

    const saltRounds = 10;
    const passwordHash = await bcryptLib.hash(password, saltRounds);

    return await repository.registro(correoNormalizado, passwordHash, rol);
  };

  const login = async (correo, password) => {
    if (correo === undefined || password === undefined) {
      throw crearError('Correo y contraseña obligatorios', 400);
    }

    if (typeof correo !== 'string' || typeof password !== 'string') {
      throw crearError('Correo y contraseña deben ser texto válido', 400);
    }

    if (correo.includes('\0') || password.includes('\0')) {
      throw crearError('El correo o la contraseña contienen caracteres inválidos', 400);
    }

    const correoNormalizado = correo.trim().toLowerCase();
    if (!correoNormalizado || password.length === 0) {
      throw crearError('Correo y contraseña obligatorios', 400);
    }

    const rows = await repository.obtenerUsuario(correoNormalizado);
    const usuario = rows[0];

    if (!usuario) {
      throw crearError('Credenciales inválidas', 401);
    }

    if (usuario.activo !== true) {
      throw crearError('La cuenta de usuario se encuentra desactivada', 403);
    }

    if (
      Buffer.byteLength(password, 'utf8') > MAX_BCRYPT_BYTES ||
      typeof usuario.password !== 'string' ||
      !usuario.password.startsWith('$2')
    ) {
      throw crearError('Credenciales inválidas', 401);
    }

    const passwordOk = await bcryptLib.compare(password, usuario.password);
    if (!passwordOk) {
      throw crearError('Credenciales inválidas', 401);
    }

    const token = jwtLib.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      obtenerJwtSecret(),
      { expiresIn: obtenerJwtExpiresIn() }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol
      }
    };
  };

  return { registro, login };
};

const defaultService = crearAuthService();

export const registro = defaultService.registro;
export const login = defaultService.login;