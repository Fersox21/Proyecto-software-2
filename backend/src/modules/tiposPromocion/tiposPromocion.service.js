import * as repository from './tiposPromocion.repository.js';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

export const listarTiposPromocion = async () => {
  return await repository.findAll();
};

export const crearTipoPromocion = async (data) => {
  const nombre = typeof data?.nombre === 'string' ? data.nombre.trim() : '';

  if (!nombre) {
    throw crearError('El nombre del tipo de promoción es obligatorio', 400);
  }

  if (nombre.length > 100) {
    throw crearError('El nombre del tipo de promoción no puede superar los 100 caracteres', 400);
  }

  const existente = await repository.findByNombreInsensitive(nombre);
  if (existente) {
    throw crearError('Ya existe un tipo de promoción con ese nombre', 409);
  }

  return await repository.create(nombre);
};
