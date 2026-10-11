import { pool } from '../config/db.js';

// Toda la lógica de acceso a datos vive en el controller consulta la DB directamente.

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [
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
    const { nombre, precio, categoria, talles, stock, destacado, imagen, descripcion } =
      req.body;
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, precio, categoria, talles, stock, destacado, imagen, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nombre, precio, categoria, talles, stock, destacado, imagen, descripcion]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { nombre, precio, categoria, talles, stock, destacado, imagen, descripcion } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre = $1, precio = $2, categoria = $3, talles = $4,
           stock = $5, destacado = $6, imagen = $7, descripcion = $8
       WHERE id = $9
       RETURNING *`,
      [nombre, precio, categoria, talles, stock, destacado, imagen, descripcion, req.params.id]
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
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [
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
