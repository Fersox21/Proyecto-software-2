import { pool } from '../../config/db.js';
import { normalizarProducto } from './productos.precio.js';

const SQL_BASE = `
  SELECT p.*,
         COALESCE((
           SELECT SUM(l.cantidad)
           FROM lotes l
           WHERE l.producto_id = p.id
             AND l.activo = true
             AND l.fecha_vencimiento >= CURRENT_DATE
         ), 0) AS stock_calculado,
         c.nombre AS categoria_nombre,
         tp.nombre AS tipo_promocion_nombre,
         EXISTS (SELECT 1 FROM lotes l WHERE l.producto_id = p.id AND l.activo = true AND l.cantidad > 0 AND l.fecha_vencimiento >= CURRENT_DATE) AS tiene_lote_vigente
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN tipos_promocion tp ON tp.id = p.tipo_promocion_id
`;

const mapearProducto = (row) => {
  if (!row) return null;
  const stockFinal = row.stock_calculado !== undefined ? Number(row.stock_calculado) : Number(row.stock);
  return normalizarProducto({
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    precioCosto: row.precio_costo,
    precioVenta: row.precio_venta,
    marca: row.marca,
    enPromocion: row.en_promocion,
    precioPromo: row.precio_promo,
    stock: stockFinal,
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

export const findHistorial = async (client = pool) => {
  const { rows } = await client.query(`${SQL_BASE} ORDER BY p.activo DESC, p.nombre ASC`);
  return rows.map((row) => ({
    ...mapearProducto(row),
    eliminado: row.activo === false,
  }));
};

export const findAllCatalogo = async (client = pool) => {
  const { rows } = await client.query(
    `${SQL_BASE} WHERE p.activo = true AND p.visible_catalogo = true AND EXISTS (SELECT 1 FROM lotes l WHERE l.producto_id = p.id AND l.activo = true AND l.cantidad > 0 AND l.fecha_vencimiento >= CURRENT_DATE) ORDER BY p.nombre ASC`
  );
  return rows.map(mapearProducto);
};

export const findById = async (id, client = pool, incluirInactivos = false) => {
  const filtroActivo = incluirInactivos ? '' : ' AND p.activo = true';
  const { rows } = await client.query(`${SQL_BASE} WHERE p.id = $1${filtroActivo}`, [id]);
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

  const promoActiva = Boolean(enPromocion);
  const precioPromoFinal = promoActiva ? precioPromo : null;
  const tipoPromocionIdFinal = promoActiva ? tipoPromocionId : null;

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
      promoActiva,
      precioPromoFinal,
      stock,
      categoria,
      categoriaId,
      tipoPromocionIdFinal,
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
    categoria,
    categoriaId = null,
    tipoPromocionId = null,
    destacado,
    visibleCatalogo = false,
    imagen = null
  } = data;

  const promoActiva = Boolean(enPromocion);
  const precioPromoFinal = promoActiva ? precioPromo : null;
  const tipoPromocionIdFinal = promoActiva ? tipoPromocionId : null;

  const { rowCount } = await client.query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, precio_costo = $3, precio_venta = $4, marca = $5,
         en_promocion = $6, precio_promo = $7, categoria = $8, categoria_id = $9,
         tipo_promocion_id = $10, destacado = $11, visible_catalogo = $12, imagen = $13
     WHERE id = $14 AND activo = true`,
    [
      nombre,
      descripcion,
      precioCosto,
      precioVenta,
      marca,
      promoActiva,
      precioPromoFinal,
      categoria,
      categoriaId,
      tipoPromocionIdFinal,
      destacado,
      visibleCatalogo,
      imagen,
      id
    ]
  );

  if (rowCount === 0) return null;
  return await findById(id, client);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query(
    'UPDATE productos SET activo = false WHERE id = $1 AND activo = true',
    [id]
  );
  return rowCount;
};

// Actualiza únicamente la ruta de la imagen del producto.
export const updateImagen = async (id, imagen, visibleCatalogo) => {
  const query =
    visibleCatalogo === undefined
      ? 'UPDATE productos SET imagen = $1 WHERE id = $2 AND activo = true RETURNING id'
      : 'UPDATE productos SET imagen = $1, visible_catalogo = $2 WHERE id = $3 AND activo = true RETURNING id';
  const params =
    visibleCatalogo === undefined ? [imagen, id] : [imagen, visibleCatalogo, id];
  const { rows } = await pool.query(query, params);
  if (rows.length === 0) return null;
  return await findById(rows[0].id);
};

export const recalcularStock = async (id, client = pool) => {
  const { rows } = await client.query(
    `UPDATE productos
     SET stock = COALESCE((
       SELECT SUM(cantidad)
       FROM lotes
       WHERE producto_id = $1
         AND activo = true
         AND fecha_vencimiento >= CURRENT_DATE
     ), 0)
     WHERE id = $1
     RETURNING id, stock`,
    [id]
  );
  return rows[0] ?? null;
};
