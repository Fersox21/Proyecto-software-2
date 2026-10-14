import { pool } from '../../config/db.js';

// Toda la lógica de acceso a datos vive en el controller consulta la DB directamente.

const mapearProducto = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    precioCosto: row.precio_costo,
    precioVenta: row.precio_venta,
    marca: row.marca,
    enPromocion: row.en_promocion,
    stock: row.stock,
    categoria: row.categoria,
    peso: row.peso
  };
};

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    const mapeados = rows.map(mapearProducto)
    res.json(mapeados);
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
    res.json(mapearProducto(rows[0]));
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso } =
      req.body;
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso]
    );
    res.status(201).json(mapearProducto(rows[0]));
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre = $1, precioCosto = $2, precioVenta = $3, marca = $4,
           enPromocion = $5, stock = $6, categoria = $7, peso = $8
       WHERE id = $9
       RETURNING *`,
      [nombre, precioCosto, precioVenta, marca, enPromocion, stock, categoria, peso, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(mapearProducto(rows[0]));
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
