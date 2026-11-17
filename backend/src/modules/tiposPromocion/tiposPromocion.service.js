import * as repository from './tiposPromocion.repository.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

const validarNombreTipoPromocion = (valor) => {
  const nombre = typeof valor === 'string' ? valor.trim() : '';

  if (!nombre) {
    throw crearError('El nombre del tipo de promoción es obligatorio', 400);
  }

  if (nombre.length > 100) {
    throw crearError('El nombre del tipo de promoción no puede superar los 100 caracteres', 400);
  }

  return nombre;
};

export const listarTiposPromocion = async () => {
  return await repository.findAll();
};

export const obtenerTipoPromocionPorId = async (id) => {
  const idNum = validarIdEnteroPositivo(id, 'ID de tipo de promoción inválido');
  const tipo = await repository.findById(idNum);
  if (!tipo || !tipo.activo) {
    throw crearError('Tipo de promoción no encontrado', 404);
  }
  return tipo;
};

export const crearTipoPromocion = async (data) => {
  const nombre = validarNombreTipoPromocion(data?.nombre);

  const existente = await repository.findByNombreInsensitive(nombre);
  if (existente) {
    if (!existente.activo) {
      return await repository.reactivar(existente.id, nombre);
    }
    throw crearError('Ya existe un tipo de promoción con ese nombre', 409);
  }

  try {
    return await repository.create(nombre);
  } catch (err) {
    if (err.code === '23505') {
      throw crearError('Ya existe un tipo de promoción con ese nombre', 409);
    }
    throw err;
  }
};

export const actualizarTipoPromocion = async (id, data) => {
  const idNum = validarIdEnteroPositivo(id, 'ID de tipo de promoción inválido');
  const existente = await repository.findById(idNum);
  if (!existente || !existente.activo) {
    throw crearError('Tipo de promoción no encontrado', 404);
  }

  const nombre = validarNombreTipoPromocion(data?.nombre);
  const duplicado = await repository.findByNombreInsensitive(nombre);
  if (duplicado && duplicado.id !== idNum) {
    throw crearError('Ya existe un tipo de promoción con ese nombre', 409);
  }

  try {
    return await repository.update(idNum, nombre);
  } catch (err) {
    if (err.code === '23505') {
      throw crearError('Ya existe un tipo de promoción con ese nombre', 409);
    }
    throw err;
  }
};

export const eliminarTipoPromocion = async (id) => {
  const idNum = validarIdEnteroPositivo(id, 'ID de tipo de promoción inválido');
  const rowCount = await repository.remove(idNum);
  if (rowCount === 0) {
    throw crearError('Tipo de promoción no encontrado', 404);
  }
  return true;
};
