import { pool } from '../../config/db.js';
import { crearError } from '../../utils/validaciones.js';

const COLUMNAS_PUBLICAS = 'id, correo, rol, activo';

export const crearRolesRepository = (dbPool = pool) => {
  const findAll = async () => {
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY activo DESC, rol ASC`
    );
    return rows;
  };

  const findById = async (id) => {
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  };

  const create = async (data) => {
    const { correo, password, rol } = data;
    try {
      const { rows } = await dbPool.query(
        `INSERT INTO usuarios (correo, password, rol)
         VALUES ($1, $2, $3)
         RETURNING ${COLUMNAS_PUBLICAS}`,
        [correo, password, rol]
      );
      return rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw crearError('El correo ya se encuentra registrado', 409);
      }
      throw error;
    }
  };

  const update = async (id, data) => {
    const { correo, password, rol } = data;
    try {
      if (password !== undefined) {
        const { rows } = await dbPool.query(
          `UPDATE usuarios
           SET correo = $1, password = $2, rol = $3
           WHERE id = $4
           RETURNING ${COLUMNAS_PUBLICAS}`,
          [correo, password, rol, id]
        );
        return rows[0] ?? null;
      }

      const { rows } = await dbPool.query(
        `UPDATE usuarios
         SET correo = $1, rol = $2
         WHERE id = $3
         RETURNING ${COLUMNAS_PUBLICAS}`,
        [correo, rol, id]
      );
      return rows[0] ?? null;
    } catch (error) {
      if (error.code === '23505') {
        throw crearError('El correo ya se encuentra registrado', 409);
      }
      throw error;
    }
  };

  const remove = async (id) => {
    const { rowCount } = await dbPool.query(
      'UPDATE usuarios SET activo = false WHERE id = $1 AND activo = true',
      [id]
    );
    return rowCount;
  };

  return { findAll, findById, create, update, remove };
};

const defaultRepository = crearRolesRepository();

export const findAll = defaultRepository.findAll;
export const findById = defaultRepository.findById;
export const create = defaultRepository.create;
export const update = defaultRepository.update;
export const remove = defaultRepository.remove;