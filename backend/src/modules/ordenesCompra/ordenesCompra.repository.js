import { pool } from '../../config/db.js';
import * as categoriasRepo from '../categorias/categorias.repository.js';
import * as tiposPromocionRepo from '../tiposPromocion/tiposPromocion.repository.js';
import * as productosRepo from '../productos/productos.repository.js';
import * as proveedoresRepo from '../proveedores/proveedores.repository.js';

const resolverProductoEnTransaccion = async (lote, client) => {
  if (!lote.productoNuevo) {
    return lote.productoId ?? lote.producto;
  }

  const nuevo = lote.productoNuevo;

  let categoria = null;
  if (nuevo.categoriaNuevaNombre) {
    categoria = await categoriasRepo.findByNombreInsensitive(nuevo.categoriaNuevaNombre, client);
    if (!categoria) {
      categoria = await categoriasRepo.create(nuevo.categoriaNuevaNombre, client);
    }
  } else if (nuevo.categoriaId) {
    categoria = await categoriasRepo.findById(nuevo.categoriaId, client);
  }

  if (!categoria) {
    const error = new Error('No se pudo resolver la categoría del producto nuevo');
    error.status = 400;
    throw error;
  }

  let tipoPromocionId = null;
  if (nuevo.tipoPromocionNuevaNombre) {
    let tipo = await tiposPromocionRepo.findByNombreInsensitive(nuevo.tipoPromocionNuevaNombre, client);
    if (!tipo) {
      tipo = await tiposPromocionRepo.create(nuevo.tipoPromocionNuevaNombre, client);
    }
    tipoPromocionId = tipo.id;
  } else if (nuevo.tipoPromocionId != null) {
    tipoPromocionId = nuevo.tipoPromocionId;
  }

  const productoCreado = await productosRepo.create(
    {
      nombre: nuevo.nombre,
      marca: nuevo.marca ?? null,
      descripcion: nuevo.descripcion ?? null,
      precioCosto: nuevo.precioCosto,
      precioVenta: nuevo.precioVenta,
      enPromocion: false,
      precioPromo: null,
      stock: 0,
      categoria: categoria.nombre,
      categoriaId: categoria.id,
      tipoPromocionId,
      destacado: Boolean(nuevo.destacado),
      visibleCatalogo: false,
      imagen: nuevo.imagen ?? null
    },
    client
  );

  return productoCreado.id;
};

export const findAll = async () => {
  const { rows } = await pool.query(`
    SELECT oc.id, oc.fecha, oc.total, oc.activo,
           p.id AS proveedor_id, p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono
    FROM ordenes_compra oc
    LEFT JOIN proveedores p ON p.id = oc.proveedor_id
    ORDER BY oc.activo DESC, oc.fecha ASC;
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

export const findById = async (id) => {
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

  const { rows: lotesRows } = await pool.query(
    `SELECT l.id, l.cantidad, l.total, l.fecha_arribo, l.fecha_vencimiento, l.activo,
            prod.id AS producto_id, prod.nombre AS producto_nombre, prod.marca AS producto_marca
     FROM lotes l
     LEFT JOIN productos prod ON prod.id = l.producto_id
     WHERE l.orden_compra_id = $1 AND l.activo = true
     ORDER BY l.id ASC`,
    [id]
  );

  const lotes = lotesRows.map((l) => ({
    id: l.id,
    cantidad: l.cantidad,
    total: l.total != null ? Number(l.total) : null,
    fechaArribo: l.fecha_arribo,
    fechaVencimiento: l.fecha_vencimiento,
    activo: l.activo,
    producto: {
      id: l.producto_id,
      nombre: l.producto_nombre,
      marca: l.producto_marca,
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
  const { total, fecha, proveedor_id, proveedorNuevo, lotes = [] } = data;
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
      const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
      const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

      await client.query(
        `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad, orden_compra_id, producto_id, activo, total)
         VALUES ($1, $2, $3, $4, $5, true, $6)`,
        [fArribo, fVenci, lote.cantidad, nuevaOrden.id, prodId, lote.total]
      );

      await productosRepo.ajustarStock(prodId, lote.cantidad, client);
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
  const { total, fecha, proveedor_id, proveedorNuevo, lotes } = data;
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
        `SELECT producto_id, cantidad FROM lotes WHERE orden_compra_id = $1 AND activo = true FOR UPDATE`,
        [id]
      );

      // Desactivamos los lotes anteriores de esta orden
      await client.query(
        `UPDATE lotes SET activo = false WHERE orden_compra_id = $1 AND activo = true`,
        [id]
      );

      for (const lotePrevio of lotesPrevios) {
        await productosRepo.ajustarStock(lotePrevio.producto_id, -lotePrevio.cantidad, client);
      }

      // Insertamos los lotes actualizados
      for (const lote of lotes) {
        const prodId = await resolverProductoEnTransaccion(lote, client);
        const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
        const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

        await client.query(
          `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad, orden_compra_id, producto_id, activo, total)
           VALUES ($1, $2, $3, $4, $5, true, $6)`,
          [fArribo, fVenci, lote.cantidad, id, prodId, lote.total]
        );

        await productosRepo.ajustarStock(prodId, lote.cantidad, client);
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

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: lotesActivos } = await client.query(
      `SELECT producto_id, cantidad FROM lotes WHERE orden_compra_id = $1 AND activo = true FOR UPDATE`,
      [id]
    );
    const { rowCount } = await client.query('UPDATE ordenes_compra SET activo = false WHERE id = $1', [id]);
    await client.query('UPDATE lotes SET activo = false WHERE orden_compra_id = $1 AND activo = true', [id]);
    for (const lote of lotesActivos) {
      await productosRepo.ajustarStock(lote.producto_id, -lote.cantidad, client);
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
