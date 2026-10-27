import { pool } from '../../config/db.js';

// Toda la lógica de acceso a datos vive en el controller consulta la DB directamente.

const mapearLote = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fechaArribo: row.fecha_arribo,
    fechaVencimiento: row.fecha_vencimiento,
    ordenCompra: row.orden_compra,
    producto: row.producto
  };
};

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM lotes ORDER BY id');
    const mapeados = rows.map(mapearLote)
    res.json(mapeados);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM lotes WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(mapearLote(rows[0]));
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { fechaArribo, fechaVencimiento, ordenCompra, producto } =
      req.body;
    const { rows } = await pool.query(
      `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fechaArribo, fechaVencimiento, ordenCompra, producto]
    );
    res.status(201).json(mapearLote(rows[0]));
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { fechaArribo, fechaVencimiento } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE lotes
       SET fecha_arribo = $1, fecha_vencimiento = $2
       WHERE id = $3
       RETURNING *`,
      [fechaArribo, fechaVencimiento, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(mapearLote(rows[0]));
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM lotes WHERE id = $1', [
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
