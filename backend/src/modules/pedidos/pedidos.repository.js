import { pool } from '../../config/db.js';

const mapearPedido = (row) => {
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

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id');
  return rows.map(mapearPedido);
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
  return mapearPedido(rows[0]);
};

export const create = async (data) => {
  const { fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, rol } = data;
  const { rows } = await pool.query(
    `INSERT INTO pedidos (fecha, total, metodo_pago, comercio, modalidad_entrega, direccion, estado, motivo_rechazo, rol_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, rol]
  );
  return mapearPedido(rows[0]);
};

export const update = async (id, data) => {
  const { fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo } = data;
  const { rows } = await pool.query(
    `UPDATE pedidos
    SET fecha = $1, total = $2, metodo_pago = $3, comercio = $4,
    modalidad_entrega = $5, direccion = $6, estado = $7, motivo_rechazo = $8
    WHERE id = $9
    RETURNING *`,
    [fecha, total, metodoPago, comercio, modalidadEntrega, direccion, estado, motivoRechazo, id]
  );
  return mapearPedido(rows[0]);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
  return rowCount;
};