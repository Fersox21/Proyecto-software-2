import { pool } from '../../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM tiene');
  return rows;
};

export const findByPedido = async (pedido_id) => {
  const { rows } = await pool.query('SELECT * FROM tiene WHERE pedido_id = $1', [pedido_id]);
  return rows;
};

export const findByPedidoYProducto = async (pedido_id, producto_id) => {
  const { rows } = await pool.query(`
    SELECT pedido_id, producto_id 
    FROM tiene 
    WHERE pedido_id = $1 AND producto_id = $2;
  `, [pedido_id, producto_id]);
  return rows[0];
};
 

export const create = async (data) => {
  const { cantidad, precio, producto_id, pedido_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO tiene (cantidad, precio, producto_id, pedido_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [cantidad, precio, producto_id, pedido_id]
  );
  return rows[0];
};

export const update = async (data) => {
  const { cantidad, precio, pedido_id, producto_id } = data;

  const { rows } = await pool.query(
    `UPDATE tiene
     SET cantidad = $1, precio = $2
     WHERE pedido_id = $3 AND producto_id = $4
     RETURNING *`,
    [cantidad, precio, pedido_id, producto_id]
  );

  return rows[0];
};

export const remove = async (pedido_id, producto_id) => {
  const { rowCount } = await pool.query(`
    DELETE FROM tiene
    WHERE pedido_id = $1 AND producto_id = $2;
  `, [pedido_id, producto_id]);
  return rowCount;
};