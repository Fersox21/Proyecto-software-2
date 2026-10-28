import bcrypt from 'bcrypt';
import * as repository from './roles.repository.js';

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const listarRoles = async () => {
  return await repository.findAll();
};

export const obtenerRolPorId = async (id) => {
  const rol = await repository.findById(id);
  if (!rol) {
    const error = new Error('Rol no encontrado');
    error.status = 404;
    throw error;
  }
  return rol;
};

export const crearRol = async (data) => {
  const { correo, password } = data;

  if (!correo || !password) {
    const error = new Error('Faltan datos obligatorios para crear el rol');
    error.status = 400;
    throw error;
  }

  if (!regexEmail.test(correo)) {
    const error = new Error('El formato del correo electrónico no es válido');
    error.status = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('La contraseña debe tener al menos 8 caracteres');
    error.status = 400;
    throw error;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const datosParaGuardar = {
    correo,
    password: passwordHash
  };

  return await repository.create(datosParaGuardar);
};

export const actualizarRol = async (id, data) => {
  const rolExistente = await repository.findById(id);
  if (!rolExistente) {
    const error = new Error('Rol no encontrado');
    error.status = 404;
    throw error;
  }

  const datosAActualizar = { ...rolExistente };

  if (data.correo !== undefined) {
    if (!regexEmail.test(data.correo)) {
      const error = new Error('El formato del correo electrónico no es válido');
      error.status = 400;
      throw error;
    }
    datosAActualizar.correo = data.correo;
  }

  if (data.password !== undefined) {
    if (data.password.length < 8) {
      const error = new Error('La contraseña debe tener al menos 8 caracteres');
      error.status = 400;
      throw error;
    }
    const saltRounds = 10;
    datosAActualizar.password = await bcrypt.hash(data.password, saltRounds);
  }

  const rolActualizado = await repository.update(id, datosAActualizar);
  return rolActualizado;
};

export const eliminarRol = async (id) => {
  const rowCount = await repository.remove(id);
  if (rowCount === 0) {
    const error = new Error('Rol no encontrado');
    error.status = 404;
    throw error;
  }
  return true;
};