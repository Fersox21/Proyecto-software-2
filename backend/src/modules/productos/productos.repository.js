import { pool } from '../../config/db.js';
import { normalizarProducto } from './productos.precio.js';

const SQL_BASE = `
  SELECT p.*,
         c.nombre AS categoria_nombre,
         tp.nombre AS tipo_promocion_nombre,
         EXISTS (SELECT 1 FROM lotes l WHERE l.producto_id = p.id AND l.activo = true AND l.cantidad > 0 AND l.fecha_vencimiento >= CURRENT_DATE) AS tiene_lote_vigente
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN tipos_promocion tp ON tp.id = p.tipo_promocion_id
`;

const mapearProducto = (row) => {
  if (!row) return null;
  return normalizarProducto({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    precioCosto: row.precio_costo,
    precioVenta: row.precio_venta,
    marca: row.marca,
    enPromocion: row.en_promocion,
    precioPromo: row.precio_promo,
    stock: row.stock,
    categoria: row.categoria_nombre ?? row.categoria,
    categoriaId: row.categoria_id ?? null,
    tipoPromocionId: row.tipo_promocion_id ?? null,
    tipoPromocion: row.tipo_promocion_nombre ?? null,
    destacado: row.destacado,
    visibleCatalogo: Boolean(row.visible_catalogo),
    tieneLoteVigente: Boolean(row.tiene_lote_vigente),
    imagen: row.imagen,
    activo: row.activo
  });
};

export const findAll = async (client = pool) => {
  const { rows } = await client.query(`${SQL_BASE} WHERE p.activo = true ORDER BY p.nombre ASC`);
  return rows.map(mapearProducto);
};

export const findAllCatalogo = async (client = pool) => {
  const { rows } = await client.query(
    `${SQL_BASE} WHERE p.activo = true AND p.visible_catalogo = true AND EXISTS (SELECT 1 FROM lotes l WHERE l.producto_id = p.id AND l.activo = true AND l.cantidad > 0 AND l.fecha_vencimiento >= CURRENT_DATE) ORDER BY p.nombre ASC`
  );
  return rows.map(mapearProducto);
};

export const findById = async (id, client = pool) => {
  const { rows } = await client.query(`${SQL_BASE} WHERE p.id = $1`, [id]);
  return mapearProducto(rows[0]);
};

export const create = async (data, client = pool) => {
  const {
    nombre,
    descripcion = null,
    precioCosto,
    precioVenta,
    marca = null,
    enPromocion = false,
    precioPromo = null,
    stock = 0,
    categoria,
    categoriaId = null,
    tipoPromocionId = null,
    destacado = false,
    visibleCatalogo = false,
    imagen = null
  } = data;

  const { rows } = await client.query(
    `INSERT INTO productos (
       nombre, descripcion, precio_costo, precio_venta, marca,
       en_promocion, precio_promo, stock, categoria, categoria_id,
       tipo_promocion_id, destacado, visible_catalogo, imagen
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      nombre,
      descripcion,
      precioCosto,
      precioVenta,
      marca,
      enPromocion,
      precioPromo,
      stock,
      categoria,
      categoriaId,
      tipoPromocionId,
      destacado,
      visibleCatalogo,
      imagen
    ]
  );

  return await findById(rows[0].id, client);
};

export const update = async (id, data, client = pool) => {
  const {
    nombre,
    descripcion = null,
    precioCosto,
    precioVenta,
    marca = null,
    enPromocion,
    precioPromo,
    stock,
    categoria,
    categoriaId = null,
    tipoPromocionId = null,
    destacado,
    visibleCatalogo = false,
    imagen = null
  } = data;

  await client.query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, precio_costo = $3, precio_venta = $4, marca = $5,
         en_promocion = $6, precio_promo = $7, stock = $8, categoria = $9, categoria_id = $10,
         tipo_promocion_id = $11, destacado = $12, visible_catalogo = $13, imagen = $14
     WHERE id = $15`,
    [
      nombre,
      descripcion,
      precioCosto,
      precioVenta,
      marca,
      enPromocion,
      precioPromo,
      stock,
      categoria,
      categoriaId,
      tipoPromocionId,
      destacado,
      visibleCatalogo,
      imagen,
      id
    ]
  );

  return await findById(id, client);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
  return rowCount;
};

// Actualiza únicamente la ruta de la imagen del producto.
export const updateImagen = async (id, imagen, visibleCatalogo) => {
  const query =
    visibleCatalogo === undefined
      ? 'UPDATE productos SET imagen = $1 WHERE id = $2 RETURNING id'
      : 'UPDATE productos SET imagen = $1, visible_catalogo = $2 WHERE id = $3 RETURNING id';
  const params =
    visibleCatalogo === undefined ? [imagen, id] : [imagen, visibleCatalogo, id];
  const { rows } = await pool.query(query, params);
  if (rows.length === 0) return null;
  return await findById(rows[0].id);
};

export const ajustarStock = async (id, delta, client = pool) => {
  const { rows } = await client.query(
    `UPDATE productos
     SET stock = stock + $1
     WHERE id = $2 AND stock + $1 >= 0
     RETURNING id, stock`,
    [delta, id]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  const { rows: existeRows } = await client.query('SELECT id FROM productos WHERE id = $1', [id]);
  if (existeRows.length === 0) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  const error = new Error('Stock insuficiente para realizar la operación');
  error.status = 409;
  throw error;
};
