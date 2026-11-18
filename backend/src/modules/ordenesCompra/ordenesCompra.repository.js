import { pool } from '../../config/db.js';
import * as categoriasRepo from '../categorias/categorias.repository.js';
import * as tiposPromocionRepo from '../tiposPromocion/tiposPromocion.repository.js';
import * as productosRepo from '../productos/productos.repository.js';
import * as proveedoresRepo from '../proveedores/proveedores.repository.js';

const resolverOCrearCatalogo = async (repo, nombre, client, savepoint) => {
  let registro = await repo.findByNombreInsensitive(nombre, client);
  if (registro) {
    if (registro.activo === false && typeof repo.reactivar === 'function') {
      registro = await repo.reactivar(registro.id, nombre, client);
    }
    return registro;
  }

  await client.query(`SAVEPOINT ${savepoint}`);
  try {
    registro = await repo.create(nombre, client);
    await client.query(`RELEASE SAVEPOINT ${savepoint}`);
    return registro;
  } catch (err) {
    if (err.code === '23505') {
      await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      registro = await repo.findByNombreInsensitive(nombre, client);
      if (registro?.activo === false && typeof repo.reactivar === 'function') {
        registro = await repo.reactivar(registro.id, nombre, client);
      }
      return registro;
    }
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    throw err;
  }
};

const resolverProductoEnTransaccion = async (lote, client) => {
  if (!lote.productoNuevo) {
    return lote.productoId ?? lote.producto;
  }

  const nuevo = lote.productoNuevo;

  let categoria = null;
  if (nuevo.categoriaNuevaNombre) {
    categoria = await resolverOCrearCatalogo(
      categoriasRepo,
      nuevo.categoriaNuevaNombre,
      client,
      'sp_categoria_nueva'
    );
  } else if (nuevo.categoriaId) {
    categoria = await categoriasRepo.findById(nuevo.categoriaId, client);
  }

  if (!categoria) {
    const error = new Error('No se pudo resolver la categoría del producto nuevo');
    error.status = 400;
    throw error;
  }

  const enPromocion = Boolean(nuevo.enPromocion);
  const precioPromo = enPromocion ? (nuevo.precioPromo ?? null) : null;

  let tipoPromocionId = null;
  if (enPromocion) {
    if (nuevo.tipoPromocionNuevaNombre) {
      const tipo = await resolverOCrearCatalogo(
        tiposPromocionRepo,
        nuevo.tipoPromocionNuevaNombre,
        client,
        'sp_tipo_promo_nuevo'
      );
      tipoPromocionId = tipo.id;
    } else if (nuevo.tipoPromocionId != null) {
      tipoPromocionId = nuevo.tipoPromocionId;
    } else {
      tipoPromocionId = null;
    }
  }

  const productoCreado = await productosRepo.create(
    {
      nombre: nuevo.nombre,
      marca: nuevo.marca ?? null,
      descripcion: nuevo.descripcion ?? null,
      precioCosto: nuevo.precioCosto,
      precioVenta: nuevo.precioVenta,
      enPromocion,
      precioPromo,
      stock: 0,
      categoria: categoria.nombre,
      categoriaId: categoria.id,
      tipoPromocionId,
      destacado: Boolean(nuevo.destacado),
      visibleCatalogo: false,
      imagen: nuevo.imagen ?? null,
      omitirHistorialInicial: true
    },
    client
  );

  return productoCreado.id;
};

const insertarLoteEnTransaccion = async ({ lote, ordenId, prodId, origenExistente = 'INGRESO_LOTE', usuarioId = null, client }) => {
  const { tieneHistorialPrecios } = await obtenerCapacidades(client);
  const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
  const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

  let productoPrevio = null;
  if (!lote.productoNuevo) {
    const { rows: prodRows } = await client.query(
      'SELECT id, precio_costo, precio_venta FROM productos WHERE id = $1 FOR UPDATE',
      [prodId]
    );
    productoPrevio = prodRows[0] ?? null;
  }

  const { rows } = await client.query(
    `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad_inicial, cantidad, orden_compra_id, producto_id, activo, total)
     VALUES ($1, $2, $3, $3, $4, $5, true, $6)
     RETURNING id`,
    [fArribo, fVenci, lote.cantidad, ordenId, prodId, lote.total]
  );
  const loteId = rows[0].id;

  if (lote.productoNuevo) {
    if (tieneHistorialPrecios) {
      await client.query(
        `INSERT INTO historial_precios_producto (
           producto_id, lote_id, orden_compra_id,
           precio_costo_anterior, precio_costo_nuevo,
           precio_venta_anterior, precio_venta_nuevo, origen, usuario_id
         )
         VALUES ($1, $2, $3, NULL, $4, NULL, $5, 'ALTA_PRODUCTO', $6)`,
        [prodId, loteId, ordenId, lote.productoNuevo.precioCosto, lote.productoNuevo.precioVenta, usuarioId]
      );
    }
  } else if (productoPrevio) {
    const precioCostoAnterior = Number(productoPrevio.precio_costo);
    const precioVentaAnterior = Number(productoPrevio.precio_venta);

    const nuevoCostoRaw =
      lote.nuevoPrecioCostoProducto ??
      lote.precioCostoUnitario ??
      lote.precioCosto ??
      precioCostoAnterior;
    const nuevoPrecioCostoProducto = Number(Number(nuevoCostoRaw).toFixed(2));

    const nuevaVentaRaw =
      lote.nuevoPrecioVentaProducto ??
      lote.precioVenta ??
      lote.precio_venta ??
      precioVentaAnterior;
    const nuevoPrecioVentaProducto = Number(Number(nuevaVentaRaw).toFixed(2));

    const cambioCosto =
      nuevoPrecioCostoProducto > 0 && Math.abs(nuevoPrecioCostoProducto - precioCostoAnterior) > 0.009;
    const cambioVenta =
      nuevoPrecioVentaProducto > 0 && Math.abs(nuevoPrecioVentaProducto - precioVentaAnterior) > 0.009;

    if (cambioCosto || cambioVenta) {
      const costoFinal = cambioCosto ? nuevoPrecioCostoProducto : precioCostoAnterior;
      const ventaFinal = cambioVenta ? nuevoPrecioVentaProducto : precioVentaAnterior;

      await client.query(
        'UPDATE productos SET precio_costo = $1, precio_venta = $2 WHERE id = $3',
        [costoFinal, ventaFinal, prodId]
      );

      if (tieneHistorialPrecios) {
        await client.query(
          `INSERT INTO historial_precios_producto (
             producto_id, lote_id, orden_compra_id,
             precio_costo_anterior, precio_costo_nuevo,
             precio_venta_anterior, precio_venta_nuevo, origen, usuario_id
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            prodId,
            loteId,
            ordenId,
            precioCostoAnterior,
            costoFinal,
            precioVentaAnterior,
            ventaFinal,
            origenExistente,
            usuarioId
          ]
        );
      }
    }
  }

  return loteId;
};

export const findAll = async () => {
  const { rows } = await pool.query(`
    SELECT oc.id, oc.fecha, oc.total, oc.activo,
           p.id AS proveedor_id, p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono
    FROM ordenes_compra oc
    LEFT JOIN proveedores p ON p.id = oc.proveedor_id
    WHERE oc.activo = true
    ORDER BY oc.fecha ASC, oc.id ASC;
  `);

  return rows.map((row) => ({
    id: row.id,
    fecha: row.fecha,
    total: Number(row.total),
    activo: row.activo,
    proveedor: row.proveedor_id
      ? {
          id: row.proveedor_id,
          nombre: row.proveedor_nombre,
          telefono: row.proveedor_telefono,
        }
      : null,
  }));
};

export const findHistorial = async () => {
  const { rows } = await pool.query(`
    SELECT oc.id, oc.fecha, oc.total, oc.activo,
           p.id AS proveedor_id, p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono,
           (SELECT COUNT(*) FROM lotes l WHERE l.orden_compra_id = oc.id)::int AS cantidad_lotes
    FROM ordenes_compra oc
    LEFT JOIN proveedores p ON p.id = oc.proveedor_id
    ORDER BY oc.fecha DESC, oc.id DESC;
  `);

  return rows.map((row) => ({
    id: row.id,
    fecha: row.fecha,
    total: Number(row.total),
    activo: row.activo,
    eliminada: row.activo === false,
    cantidadLotes: Number(row.cantidad_lotes ?? 0),
    proveedor: row.proveedor_id
      ? {
          id: row.proveedor_id,
          nombre: row.proveedor_nombre,
          telefono: row.proveedor_telefono,
        }
      : null,
  }));
};

export const findById = async (id, incluirInactivos = false) => {
  const { rows: ordenRows } = await pool.query(
    `SELECT oc.id, oc.fecha, oc.total, oc.activo,
            p.id AS proveedor_id, p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono
     FROM ordenes_compra oc
     LEFT JOIN proveedores p ON p.id = oc.proveedor_id
     WHERE oc.id = $1`,
    [id]
  );

  if (ordenRows.length === 0) return null;

  const row = ordenRows[0];
  const filtroLotes = incluirInactivos ? '' : 'AND l.activo = true';

  const { rows: lotesRows } = await pool.query(
    `SELECT l.id, l.cantidad, l.cantidad_inicial, l.total, l.fecha_arribo, l.fecha_vencimiento, l.activo,
            prod.id AS producto_id, prod.nombre AS producto_nombre, prod.marca AS producto_marca,
            prod.activo AS producto_activo
     FROM lotes l
     LEFT JOIN productos prod ON prod.id = l.producto_id
     WHERE l.orden_compra_id = $1 ${filtroLotes}
     ORDER BY l.id ASC`,
    [id]
  );

  const lotes = lotesRows.map((l) => ({
    id: l.id,
    cantidad: l.cantidad,
    cantidadInicial: l.cantidad_inicial,
    total: l.total != null ? Number(l.total) : null,
    fechaArribo: l.fecha_arribo,
    fechaVencimiento: l.fecha_vencimiento,
    activo: l.activo,
    producto: {
      id: l.producto_id,
      nombre: l.producto_nombre,
      marca: l.producto_marca,
      activo: l.producto_activo !== false,
    },
  }));

  return {
    id: row.id,
    fecha: row.fecha,
    total: Number(row.total),
    activo: row.activo,
    proveedor: row.proveedor_id
      ? {
          id: row.proveedor_id,
          nombre: row.proveedor_nombre,
          telefono: row.proveedor_telefono,
        }
      : null,
    lotes,
  };
};

export const create = async (data) => {
  const { total, fecha, proveedor_id, proveedorNuevo, usuarioId = null, lotes = [] } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let proveedorIdFinal = proveedor_id;
    if (proveedorNuevo) {
      const nuevoProveedor = await proveedoresRepo.create(proveedorNuevo, client);
      proveedorIdFinal = nuevoProveedor.id;
    }

    const { rows } = await client.query(
      `INSERT INTO ordenes_compra (fecha, total, activo, proveedor_id)
       VALUES ($1, $2, true, $3)
       RETURNING *`,
      [fecha, total, proveedorIdFinal]
    );

    const nuevaOrden = rows[0];

    for (const lote of lotes) {
      const prodId = await resolverProductoEnTransaccion(lote, client);
      await insertarLoteEnTransaccion({
        lote,
        ordenId: nuevaOrden.id,
        prodId,
        origenExistente: 'INGRESO_LOTE',
        usuarioId: lote.usuarioId ?? usuarioId ?? null,
        client
      });
      await productosRepo.recalcularStock(prodId, client);
    }

    await client.query('COMMIT');
    return await findById(nuevaOrden.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const update = async (id, data) => {
  const { total, fecha, proveedor_id, proveedorNuevo, usuarioId = null, lotes } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let proveedorIdFinal = proveedor_id;
    if (proveedorNuevo) {
      const nuevoProveedor = await proveedoresRepo.create(proveedorNuevo, client);
      proveedorIdFinal = nuevoProveedor.id;
    }

    if (proveedorIdFinal !== undefined) {
      await client.query(
        `UPDATE ordenes_compra
         SET total = $1, fecha = $2, proveedor_id = $3
         WHERE id = $4`,
        [total, fecha, proveedorIdFinal, id]
      );
    } else {
      await client.query(
        `UPDATE ordenes_compra
         SET total = $1, fecha = $2
         WHERE id = $3`,
        [total, fecha, id]
      );
    }

    if (Array.isArray(lotes)) {
      const { rows: lotesPrevios } = await client.query(
        `SELECT id, producto_id, cantidad, cantidad_inicial FROM lotes WHERE orden_compra_id = $1 AND activo = true FOR UPDATE`,
        [id]
      );

      const loteConsumido = lotesPrevios.find((l) => Number(l.cantidad) < Number(l.cantidad_inicial));
      if (loteConsumido) {
        const error = new Error('No se pueden modificar los lotes de esta orden porque algunos ya registraron salidas o ventas');
        error.status = 409;
        throw error;
      }

      await client.query(
        `UPDATE lotes SET activo = false WHERE orden_compra_id = $1 AND activo = true`,
        [id]
      );

      const productosAfectados = new Set(lotesPrevios.map((l) => l.producto_id));

      for (const lote of lotes) {
        const prodId = await resolverProductoEnTransaccion(lote, client);
        productosAfectados.add(prodId);
        await insertarLoteEnTransaccion({
          lote,
          ordenId: id,
          prodId,
          origenExistente: 'INGRESO_LOTE',
          usuarioId: lote.usuarioId ?? usuarioId ?? null,
          client
        });
      }

      for (const prodId of productosAfectados) {
        await productosRepo.recalcularStock(prodId, client);
      }
    }

    await client.query('COMMIT');
    return await findById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const crearOrdenCompraConLotes = create;
export const actualizarOrdenCompraConLotes = update;

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: lotesActivos } = await client.query(
      `SELECT producto_id, cantidad, cantidad_inicial FROM lotes WHERE orden_compra_id = $1 AND activo = true FOR UPDATE`,
      [id]
    );
    const loteConsumido = lotesActivos.find((l) => Number(l.cantidad) < Number(l.cantidad_inicial));
    if (loteConsumido) {
      const error = new Error('No se puede dar de baja la orden de compra porque uno o más lotes ya registraron salidas o ventas');
      error.status = 409;
      throw error;
    }

    const { rowCount } = await client.query(
      'UPDATE ordenes_compra SET activo = false WHERE id = $1 AND activo = true',
      [id]
    );
    if (rowCount > 0) {
      await client.query('UPDATE lotes SET activo = false WHERE orden_compra_id = $1 AND activo = true', [id]);
      for (const lote of lotesActivos) {
        await productosRepo.recalcularStock(lote.producto_id, client);
      }
    }
    await client.query('COMMIT');
    return rowCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
