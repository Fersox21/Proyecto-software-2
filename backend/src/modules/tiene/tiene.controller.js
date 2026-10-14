import { pool } from '../../config/db.js';

// Toda la lógica de acceso a datos vive en el controller consulta la DB directamente.

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tiene ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tiene WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { cantidad, precio, producto, venta } =
      req.body;
    const { rows } = await pool.query(
      `INSERT INTO tiene (cantidad, precio, producto, venta)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cantidad, precio, producto, venta]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { cantidad, precio } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE tiene
       SET cantidad = $1, precio = $2
       WHERE id = $3
       RETURNING *`,
      [cantidad, precio, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM tiene WHERE id = $1', [
      req.params.id,
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
