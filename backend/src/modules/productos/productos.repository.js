import { pool } from '../../config/db.js';

const mapearProducto = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    precioCosto: row.precio_costo,
    precioVenta: row.precio_venta,
    marca: row.marca,
    enPromocion: row.en_promocion,
    precioPromo: row.precio_promo,
    stock: row.stock,
    categoria: row.categoria,
    peso: row.peso,
    destacado: row.destacado
  };
};

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM productos ORDER BY activo DESC, nombre ASC');
  return rows.map(mapearProducto);
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
  return mapearProducto(rows[0]);
};

export const create = async (data) => {
  const { nombre, precioCosto, precioVenta, marca, enPromocion, precioPromo, stock, categoria, peso, destacado } = data;
  const { rows } = await pool.query(
    `INSERT INTO productos (nombre, precio_costo, precio_venta, marca, en_promocion, precio_promo, stock, categoria, peso, destacado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [nombre, precioCosto, precioVenta, marca, enPromocion, precioPromo, stock, categoria, peso, destacado]
  );
  return mapearProducto(rows[0]);
};

export const update = async (id, data) => {
  const { nombre, precioCosto, precioVenta, marca, enPromocion, precioPromo, stock, categoria, peso, destacado } = data;
  const { rows } = await pool.query(
    `UPDATE productos
     SET nombre = $1, precio_costo = $2, precio_venta = $3, marca = $4,
         en_promocion = $5, precio_promo = $6, stock = $7, categoria = $8, peso = $9, destacado = $10
     WHERE id = $11
     RETURNING *`,
    [nombre, precioCosto, precioVenta, marca, enPromocion, precioPromo, stock, categoria, peso, destacado, id]
  );
  return mapearProducto(rows[0]);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
  return rowCount;
};