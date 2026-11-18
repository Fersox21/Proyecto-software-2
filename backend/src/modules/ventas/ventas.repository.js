import { pool } from '../../config/db.js'; // Ajusta la ruta a tu conexión de pool
import * as productosRepo from '../productos/productos.repository.js';

const mapearVenta = (row) => {
  if (!row) return null;
  const totalModificado = row.total_modificado != null ? Number(row.total_modificado) : null;
  const motivoModificacion = row.motivo_modificacion ?? null;
  return {
    ...row,
    total: row.total != null ? Number(row.total) : row.total,
    total_modificado: totalModificado,
    motivo_modificacion: motivoModificacion,
    totalModificado,
    motivoModificacion,
    pedidoId: row.pedido_id
  };
};

const mapearItem = (row) => {
  const precio = Number(row.precio);
  const cantidad = Number(row.cantidad);
  return {
    producto_id: row.producto_id,
    nombre: row.nombre,
    marca: row.marca,
    cantidad,
    precio,
    subtotal: precio * cantidad
  };
};

const conTransaccion = async (accion) => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await accion(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    cliente.release();
  }
};

export const listar = async () => {
  const { rows } = await pool.query(
    `SELECT v.*,
            COALESCE(v.total_modificado, p.total_modificado) AS total_modificado,
            COALESCE(v.motivo_modificacion, p.motivo_modificacion) AS motivo_modificacion
     FROM ventas v
     INNER JOIN pedidos p ON p.id = v.pedido_id
     WHERE v.activo = true
       AND p.activo = true
       AND LOWER(p.estado) IN ('aprobado', 'aceptado', 'completado', 'entregado')
     ORDER BY v.fecha ASC`
  );
  return rows.map(mapearVenta);
};

export const listarHistorial = async () => {
  const { rows } = await pool.query(
    `SELECT v.*,
            p.comercio AS pedido_comercio,
            p.estado AS pedido_estado,
            COALESCE(v.total_modificado, p.total_modificado) AS total_modificado,
            COALESCE(v.motivo_modificacion, p.motivo_modificacion) AS motivo_modificacion
     FROM ventas v
     LEFT JOIN pedidos p ON p.id = v.pedido_id
     ORDER BY v.fecha DESC, v.id DESC`
  );
  return rows.map((row) => ({
    ...mapearVenta(row),
    comercio: row.pedido_comercio ?? null,
    estadoPedido: row.pedido_estado ?? null,
    eliminada: row.activo === false,
  }));
};

export const obtener = async (id) => {
  const { rows } = await pool.query(
    `SELECT v.*,
            COALESCE(v.total_modificado, p.total_modificado) AS total_modificado,
            COALESCE(v.motivo_modificacion, p.motivo_modificacion) AS motivo_modificacion
     FROM ventas v
     LEFT JOIN pedidos p ON p.id = v.pedido_id
     WHERE v.id = $1`,
    [id]
  );
  return rows.map(mapearVenta);
};

export const obtenerItemsPorPedidoId = async (pedidoId) => {
  const { rows } = await pool.query(
    `SELECT t.producto_id,
            pr.nombre,
            pr.marca,
            t.cantidad,
            t.precio
     FROM tiene t
     JOIN productos pr ON pr.id = t.producto_id
     WHERE t.pedido_id = $1 AND t.activo = true
     ORDER BY pr.nombre ASC`,
    [pedidoId]
  );

  const { rows: lotesRows } = await pool.query(
    `SELECT pl.producto_id, pl.lote_id, pl.cantidad, pl.consumido_entero,
            l.fecha_vencimiento
     FROM pedido_lotes pl
     JOIN lotes l ON l.id = pl.lote_id
     WHERE pl.pedido_id = $1
     ORDER BY pl.id ASC`,
    [pedidoId]
  );

  return rows.map((item) => {
    const itemMapeado = mapearItem(item);
    itemMapeado.lotesUsados = lotesRows
      .filter((l) => Number(l.producto_id) === Number(item.producto_id))
      .map((l) => ({
        loteId: l.lote_id,
        cantidad: Number(l.cantidad),
        consumidoEntero: Boolean(l.consumido_entero),
        fechaVencimiento: l.fecha_vencimiento
      }));
    return itemMapeado;
  });
};

export const obtenerDetalle = async (id) => {
  const { rows } = await pool.query(
    `SELECT v.id,
            v.fecha,
            v.total,
            v.pedido_id,
            COALESCE(v.total_modificado, p.total_modificado) AS total_modificado,
            COALESCE(v.motivo_modificacion, p.motivo_modificacion) AS motivo_modificacion,
            p.id AS p_id,
            p.fecha AS p_fecha,
            p.subtotal AS p_subtotal,
            p.envio AS p_envio,
            p.total AS p_total,
            p.total_modificado AS p_total_modificado,
            p.motivo_modificacion AS p_motivo_modificacion,
            p.estado AS p_estado,
            p.metodo_pago AS p_metodo_pago,
            p.telefono AS p_telefono,
            p.comercio AS p_comercio,
            p.persona_contacto AS p_persona_contacto,
            p.modalidad_entrega AS p_modalidad_entrega,
            p.direccion AS p_direccion,
            p.descripcion_direccion AS p_descripcion_direccion,
            p.observaciones AS p_observaciones
     FROM ventas v
     LEFT JOIN pedidos p ON p.id = v.pedido_id
     WHERE v.id = $1`,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const items = row.pedido_id ? await obtenerItemsPorPedidoId(row.pedido_id) : [];

  return {
    id: row.id,
    fecha: row.fecha,
    total: row.total != null ? Number(row.total) : null,
    totalModificado: row.total_modificado != null ? Number(row.total_modificado) : null,
    motivoModificacion: row.motivo_modificacion ?? null,
    pedido_id: row.pedido_id,
    pedidoId: row.pedido_id,
    pedido: row.p_id != null
      ? {
          id: row.p_id,
          fecha: row.p_fecha,
          subtotal: row.p_subtotal != null ? Number(row.p_subtotal) : null,
          envio: row.p_envio != null ? Number(row.p_envio) : null,
          total: row.p_total != null ? Number(row.p_total) : null,
          totalModificado: row.p_total_modificado != null ? Number(row.p_total_modificado) : null,
          motivoModificacion: row.p_motivo_modificacion ?? null,
          estado: row.p_estado,
          metodoPago: row.p_metodo_pago,
          telefono: row.p_telefono,
          comercio: row.p_comercio,
          personaContacto: row.p_persona_contacto,
          modalidadEntrega: row.p_modalidad_entrega,
          direccion: row.p_direccion,
          descripcionDireccion: row.p_descripcion_direccion,
          observaciones: row.p_observaciones
        }
      : null,
    items
  };
};

export const obtenerPorPedidoId = async (pedido_id) => {
  const { rows } = await pool.query(
    'SELECT id FROM ventas WHERE pedido_id = $1 AND activo = true LIMIT 1',
    [pedido_id]
  );
  return rows[0] ?? null;
};

export const create = async (data) => {
  const pedidoId = data.pedido_id ?? data.pedidoId;
  const { fecha, total } = data;
  const { rows } = await pool.query(`
    INSERT INTO ventas (pedido_id, fecha, total)
    VALUES ($1, $2, $3)
    RETURNING id, pedido_id, fecha, total;
  `, [pedidoId, fecha, total]);
  return rows[0];
};
 
export const remove = async (id) => {
  return await conTransaccion(async (cliente) => {
    const { rows: ventaRows } = await cliente.query(
      'SELECT id, pedido_id FROM ventas WHERE id = $1 AND activo = true FOR UPDATE',
      [id]
    );
    if (ventaRows.length === 0) {
      return 0;
    }

    const pedidoId = ventaRows[0].pedido_id;
    const { rowCount } = await cliente.query(
      'UPDATE ventas SET activo = false WHERE id = $1 AND activo = true',
      [id]
    );

    if (rowCount > 0 && pedidoId != null) {
      const { rows: asignaciones } = await cliente.query(
        `SELECT lote_id, producto_id, cantidad
         FROM pedido_lotes
         WHERE pedido_id = $1
         ORDER BY lote_id ASC
         FOR UPDATE`,
        [pedidoId]
      );

      const productosAfectados = new Set();
      for (const asig of asignaciones) {
        await cliente.query(
          `UPDATE lotes
           SET cantidad = LEAST(cantidad + $1, cantidad_inicial)
           WHERE id = $2`,
          [asig.cantidad, asig.lote_id]
        );
        productosAfectados.add(Number(asig.producto_id));
      }

      if (asignaciones.length > 0) {
        await cliente.query('DELETE FROM pedido_lotes WHERE pedido_id = $1', [pedidoId]);
      }

      for (const prodId of productosAfectados) {
        await productosRepo.recalcularStock(prodId, cliente);
      }

      await cliente.query(
        `UPDATE pedidos
         SET estado = 'rechazado',
             motivo_rechazo = COALESCE(motivo_rechazo, 'Venta eliminada')
         WHERE id = $1
           AND activo = true
           AND LOWER(estado) IN ('aprobado', 'aceptado', 'entregado', 'completado')`,
        [pedidoId]
      );
    }

    return rowCount;
  });
};


export const update = async (id, data) => {
  return conTransaccion(async (cliente) => {
    const { fecha, totalModificado, motivoModificacion } = data;

    const { rows } = await cliente.query(
      `UPDATE ventas
       SET fecha = $1,
           total_modificado = $2,
           motivo_modificacion = $3
       WHERE id = $4
       RETURNING id, fecha, total, total_modificado, motivo_modificacion, pedido_id;`,
      [fecha, totalModificado, motivoModificacion, id]
    );

    const ventaActualizada = rows[0];
    if (!ventaActualizada) return null;

    if (ventaActualizada.pedido_id != null) {
      await cliente.query(
        `UPDATE pedidos
         SET total_modificado = $1,
             motivo_modificacion = $2
         WHERE id = $3;`,
        [totalModificado, motivoModificacion, ventaActualizada.pedido_id]
      );
    }

    return mapearVenta(ventaActualizada);
  });
};

export const obtenerVentasMes = async () => {
  const query = `
    SELECT v.*,
           COALESCE(v.total_modificado, p.total_modificado) AS total_modificado,
           COALESCE(v.motivo_modificacion, p.motivo_modificacion) AS motivo_modificacion
    FROM ventas v
    LEFT JOIN pedidos p ON p.id = v.pedido_id
    WHERE v.activo = true
      AND v.fecha >= NOW() - INTERVAL '1 month'
    ORDER BY v.fecha DESC
  `;
  const { rows } = await pool.query(query);
  return rows.map(mapearVenta);
};