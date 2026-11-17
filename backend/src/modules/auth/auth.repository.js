import { pool } from '../../config/db.js';
import { crearError } from '../../utils/validaciones.js';

export const crearAuthRepository = (dbPool = pool) => {
  const obtenerUsuario = async (correo) => {
    const { rows } = await dbPool.query(
      'SELECT id, correo, rol, activo, password FROM usuarios WHERE LOWER(TRIM(correo)) = $1 LIMIT 1',
      [correo]
    );
    return rows;
  };

  const obtenerUsuarioPorId = async (id) => {
    const { rows } = await dbPool.query(
      'SELECT id, correo, rol, activo FROM usuarios WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  };

  const registro = async (correo, passwordHash, rol = 'cliente') => {
    try {
      const { rows } = await dbPool.query(
        `INSERT INTO usuarios (correo, password, rol)
         VALUES ($1, $2, $3)
         RETURNING id, correo, rol, activo`,
        [correo, passwordHash, rol]
      );
      return rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw crearError('El correo ya se encuentra registrado.', 409);
      }
      if (error.code === '22001') {
        throw crearError('El correo no puede superar los 50 caracteres.', 400);
      }
      throw error;
    }
  };

  return { obtenerUsuario, obtenerUsuarioPorId, registro };
};

const defaultRepository = crearAuthRepository();

export const obtenerUsuario = defaultRepository.obtenerUsuario;
export const obtenerUsuarioPorId = defaultRepository.obtenerUsuarioPorId;
export const registro = defaultRepository.registro;