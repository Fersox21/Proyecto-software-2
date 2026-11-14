import { pool } from '../../config/db.js';

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
    `SELECT l.id, l.cantidad, l.fecha_arribo, l.fecha_vencimiento, l.activo,
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
  const { total, fecha, proveedor_id, lotes = [] } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO ordenes_compra (fecha, total, activo, proveedor_id)
       VALUES ($1, $2, true, $3)
       RETURNING *`,
      [fecha, total, proveedor_id]
    );

    const nuevaOrden = rows[0];

    for (const lote of lotes) {
      const prodId = lote.productoId ?? lote.producto;
      const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
      const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

      await client.query(
        `INSERT INTO lotes (cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [lote.cantidad, fArribo, fVenci, nuevaOrden.id, prodId]
      );
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
  const { total, fecha, proveedor_id, lotes } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (proveedor_id !== undefined) {
      await client.query(
        `UPDATE ordenes_compra
         SET total = $1, fecha = $2, proveedor_id = $3
         WHERE id = $4`,
        [total, fecha, proveedor_id, id]
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
      // Desactivamos los lotes anteriores de esta orden
      await client.query(
        `UPDATE lotes SET activo = false WHERE orden_compra_id = $1`,
        [id]
      );

      // Insertamos los lotes actualizados
      for (const lote of lotes) {
        const prodId = lote.productoId ?? lote.producto;
        const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
        const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

        await client.query(
          `INSERT INTO lotes (cantidad, fecha_arribo, fecha_vencimiento, orden_compra_id, producto_id, activo)
           VALUES ($1, $2, $3, $4, $5, true)`,
          [lote.cantidad, fArribo, fVenci, id, prodId]
        );
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
    const { rowCount } = await client.query('UPDATE ordenes_compra SET activo = false WHERE id = $1', [id]);
    await client.query('UPDATE lotes SET activo = false WHERE orden_compra_id = $1', [id]);
    await client.query('COMMIT');
    return rowCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
