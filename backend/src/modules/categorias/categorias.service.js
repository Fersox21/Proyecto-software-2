import * as repository from './categorias.repository.js';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

export const listarCategorias = async () => {
  return await repository.findAll();
};

export const crearCategoria = async (data) => {
  const nombre = typeof data?.nombre === 'string' ? data.nombre.trim() : '';

  if (!nombre) {
    throw crearError('El nombre de la categoría es obligatorio', 400);
  }

  if (nombre.length > 100) {
    throw crearError('El nombre de la categoría no puede superar los 100 caracteres', 400);
  }

  const existente = await repository.findByNombreInsensitive(nombre);
  if (existente) {
    throw crearError('Ya existe una categoría con ese nombre', 409);
  }

  return await repository.create(nombre);
};
