import * as repository from './categorias.repository.js';

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarId = (id) => {
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    throw crearError('ID de categoría inválido', 400);
  }
  return idNum;
};

const validarNombreCategoria = (valor) => {
  const nombre = typeof valor === 'string' ? valor.trim() : '';

  if (!nombre) {
    throw crearError('El nombre de la categoría es obligatorio', 400);
  }

  if (nombre.length > 100) {
    throw crearError('El nombre de la categoría no puede superar los 100 caracteres', 400);
  }

  return nombre;
};

export const listarCategorias = async () => {
  return await repository.findAll();
};

export const obtenerCategoriaPorId = async (id) => {
  const idNum = validarId(id);
  const categoria = await repository.findById(idNum);
  if (!categoria || !categoria.activo) {
    throw crearError('Categoría no encontrada', 404);
  }
  return categoria;
};

export const crearCategoria = async (data) => {
  const nombre = validarNombreCategoria(data?.nombre);

  const existente = await repository.findByNombreInsensitive(nombre);
  if (existente) {
    if (!existente.activo) {
      return await repository.reactivar(existente.id, nombre);
    }
    throw crearError('Ya existe una categoría con ese nombre', 409);
  }

  try {
    return await repository.create(nombre);
  } catch (err) {
    if (err.code === '23505') {
      throw crearError('Ya existe una categoría con ese nombre', 409);
    }
    throw err;
  }
};

export const actualizarCategoria = async (id, data) => {
  const idNum = validarId(id);
  const existente = await repository.findById(idNum);
  if (!existente || !existente.activo) {
    throw crearError('Categoría no encontrada', 404);
  }

  const nombre = validarNombreCategoria(data?.nombre);
  const duplicado = await repository.findByNombreInsensitive(nombre);
  if (duplicado && duplicado.id !== idNum) {
    throw crearError('Ya existe una categoría con ese nombre', 409);
  }

  try {
    return await repository.update(idNum, nombre);
  } catch (err) {
    if (err.code === '23505') {
      throw crearError('Ya existe una categoría con ese nombre', 409);
    }
    throw err;
  }
};

export const eliminarCategoria = async (id) => {
  const idNum = validarId(id);
  const rowCount = await repository.remove(idNum);
  if (rowCount === 0) {
    throw crearError('Categoría no encontrada', 404);
  }
  return true;
};
