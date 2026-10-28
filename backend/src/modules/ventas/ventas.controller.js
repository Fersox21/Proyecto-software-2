
import * as ventasService from './ventas.service.js'

export const listar = async (req, res, next) => { 
  try {
    const ventas = await ventasService.listarVentas();
    return res.json(ventas);
  }catch (err){
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venta = await ventasService.obtenerVenta(id);

    res.json(venta);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { fecha, total, pedido } =
      req.body;
    const { rows } = await pool.query(
      `INSERT INTO ventas (fecha, total, pedido)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [fecha, total, pedido]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { fecha, total, pedido } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE ventas
       SET fecha = $1, total = $2, pedido = $3
       WHERE id = $4
       RETURNING *`,
      [fecha, total, pedido, req.params.id]
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
    const { rowCount } = await pool.query('DELETE FROM ventas WHERE id = $1', [
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
