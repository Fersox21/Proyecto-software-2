import { pool } from '../../config/db.js';

// Toda la lógica de acceso a datos vive en el controller consulta la DB directamente.

const mapearProducto = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    total: row.total,
    metodoPago: row.metodo_pago,
    comercio: row.comercio,
    modalidadEntrega: row.modalidad_entrega,
    direccion: row.direccion,
    estado: row.estado,
    motivoRechazo: row.motivo_rechazo,
    rol: row.rol
  };
};

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id');
    const mapeados = rows.map(mapearProducto)
    res.json(mapeados);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [
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
    const { fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, rol } =
      req.body;
    const { rows } = await pool.query(
      `INSERT INTO pedidos (fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, rol)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, rol]
    );
    res.status(201).json(mapearProducto(rows[0]));
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE pedidos
       SET fecha = $1, total = $2, metodoPago = $3, comercio = $4,
           modalidadEntrega = $5, direccion = $6, estado = $7, motivoRechazo = $8
       WHERE id = $9
       RETURNING *`,
      [fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, req.params.id]
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
    const { rowCount } = await pool.query('DELETE FROM pedidos WHERE id = $1', [
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
