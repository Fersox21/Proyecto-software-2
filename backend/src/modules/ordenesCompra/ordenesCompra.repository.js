import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM ordenes_compra ORDER BY activo DESC, fecha ASC;');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM ordenes_compra WHERE id = $1', [id]);
  return rows[0];
};

export const create = async (data) => {
  const { total, fecha, proveedor_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO ordenes_compra (fecha, total, activo, proveedor_id)
    VALUES ($1, $2, true, $3)
    RETURNING *`,
    [fecha, total, proveedor_id]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const { total, fecha, proveedor_id } = data;
  if (proveedor_id !== undefined) {
    const { rows } = await pool.query(
      `UPDATE ordenes_compra
      SET total = $1, fecha = $2, proveedor_id = $3
      WHERE id = $4
      RETURNING *`,
      [total, fecha, proveedor_id, id]
    );
    return rows[0];
  }
  const { rows } = await pool.query(
    `UPDATE ordenes_compra
    SET total = $1, fecha = $2
    WHERE id = $3
    RETURNING *`,
    [total, fecha, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE ordenes_compra SET activo = false WHERE id = $1', [id]);
  return rowCount;
};
