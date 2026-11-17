import { pool } from '../../config/db.js';
import * as productosRepo from '../productos/productos.repository.js';

const mapearPedido = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    subtotal: row.subtotal,
    envio: row.envio,
    total: row.total,
    totalModificado: row.total_modificado != null ? Number(row.total_modificado) : null,
    motivoModificacion: row.motivo_modificacion ?? null,
    metodoPago: row.metodo_pago,
    telefono: row.telefono,
    comercio: row.comercio,
    personaContacto: row.persona_contacto,
    modalidadEntrega: row.modalidad_entrega,
    direccion: row.direccion,
    descripcionDireccion: row.descripcion_direccion,
    observaciones: row.observaciones,
    estado: row.estado,
    motivoRechazo: row.motivo_rechazo,
    activo: row.activo,
    usuarioId: row.usuario_id
  };
};

const mapearItem = (row) => {
  if (!row) return null;
  const precio = Number(row.precio);
  return {
    pedido_id: row.pedido_id,
    producto_id: row.producto_id,
    nombre: row.nombre,
    marca: row.marca,
    precio,
    cantidad: row.cantidad,
    subtotal: precio * row.cantidad,
    activo: row.activo
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

export const findAll = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM pedidos WHERE activo = true AND LOWER(estado) IN ('pendiente', 'nuevo') ORDER BY fecha ASC"
  );
  return rows.map(mapearPedido);
};

export const findHistorial = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM pedidos ORDER BY fecha DESC, id DESC'
  );
  return rows.map((row) => {
    const pedido = mapearPedido(row);
    const estadoNorm = String(pedido.estado ?? '').trim().toLowerCase();
    return {
      ...pedido,
      eliminado: pedido.activo === false || estadoNorm === 'eliminado',
    };
  });
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
  return mapearPedido(rows[0]);
};

export const findItemsByPedido = async (pedido_id, incluirInactivos = false) => {
  const filtroActivo = incluirInactivos ? '' : 'AND t.activo = true';
  const { rows } = await pool.query(
    `SELECT t.pedido_id, t.producto_id, t.cantidad, t.precio, t.activo,
            p.nombre, p.marca, p.activo AS producto_activo
     FROM tiene t
     JOIN productos p ON p.id = t.producto_id
     WHERE t.pedido_id = $1 ${filtroActivo}
     ORDER BY p.nombre ASC`,
    [pedido_id]
  );

  const { rows: lotesRows } = await pool.query(
    `SELECT pl.producto_id, pl.lote_id, pl.cantidad, pl.consumido_entero,
            l.fecha_vencimiento
     FROM pedido_lotes pl
     JOIN lotes l ON l.id = pl.lote_id
     WHERE pl.pedido_id = $1
     ORDER BY pl.id ASC`,
    [pedido_id]
  );

  return rows.map((row) => {
    const item = mapearItem(row);
    return {
      ...item,
      productoActivo: row.producto_activo !== false,
      eliminado: row.activo === false,
      lotesUsados: lotesRows
        .filter((l) => Number(l.producto_id) === Number(row.producto_id))
        .map((l) => ({
          loteId: l.lote_id,
          cantidad: Number(l.cantidad),
          consumidoEntero: Boolean(l.consumido_entero),
          fechaVencimiento: l.fecha_vencimiento,
        })),
    };
  });
};

export const findByIdConItems = async (id, incluirInactivos = false) => {
  const pedido = await findById(id);
  if (!pedido) return null;

  const items = await findItemsByPedido(id, incluirInactivos);
  return { ...pedido, items };
};

export const findLotesDisponiblesParaPedido = async (pedidoId) => {
  const items = await findItemsByPedido(pedidoId);
  const resultado = [];

  for (const item of items) {
    const { rows: lotes } = await pool.query(
      `SELECT l.id, l.cantidad, l.cantidad_inicial, l.fecha_arribo, l.fecha_vencimiento, l.orden_compra_id
       FROM lotes l
       WHERE l.producto_id = $1
         AND l.activo = true
         AND l.cantidad > 0
         AND l.fecha_vencimiento >= CURRENT_DATE
       ORDER BY l.fecha_vencimiento ASC, l.id ASC`,
      [item.producto_id]
    );

    resultado.push({
      productoId: item.producto_id,
      nombre: item.nombre,
      marca: item.marca,
      productoActivo: item.productoActivo !== false,
      cantidadRequerida: item.cantidad,
      lotes: lotes.map((l) => ({
        id: l.id,
        cantidad: Number(l.cantidad),
        cantidadInicial: Number(l.cantidad_inicial ?? l.cantidad),
        fechaArribo: l.fecha_arribo,
        fechaVencimiento: l.fecha_vencimiento,
        ordenCompraId: l.orden_compra_id
      }))
    });
  }

  return resultado;
};

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarDisponibilidadItem = async (cliente, item) => {
  const { rows: productoRows } = await cliente.query(
    `SELECT id, nombre, stock, activo, visible_catalogo
     FROM productos
     WHERE id = $1
     FOR UPDATE`,
    [item.productoId]
  );

  const producto = productoRows[0];
  const nombreProducto = producto?.nombre ?? `#${item.productoId}`;

  if (
    !producto ||
    producto.activo !== true ||
    producto.visible_catalogo !== true ||
    Number(producto.stock ?? 0) < item.cantidad
  ) {
    throw crearError(
      `El producto ${nombreProducto} ya no se encuentra disponible o no tiene stock suficiente.`,
      400
    );
  }

  const { rows: loteRows } = await cliente.query(
    `SELECT COALESCE(SUM(cantidad), 0) AS stock_vigente
     FROM lotes
     WHERE producto_id = $1
       AND activo = true
       AND cantidad > 0
       AND fecha_vencimiento >= CURRENT_DATE`,
    [item.productoId]
  );

  const stockVigente = Number(loteRows[0]?.stock_vigente ?? 0);
  if (!Number.isFinite(stockVigente) || stockVigente < item.cantidad) {
    throw crearError(
      `El producto ${nombreProducto} ya no se encuentra disponible o no tiene stock suficiente.`,
      400
    );
  }
};

export const createConItems = async (pedido, items) => {
  return conTransaccion(async (cliente) => {
    for (const item of items) {
      await validarDisponibilidadItem(cliente, item);
    }

    const {
      fecha,
      subtotal,
      envio,
      total,
      metodoPago,
      telefono,
      comercio,
      personaContacto,
      modalidadEntrega,
      direccion,
      descripcionDireccion,
      observaciones,
      estado,
      motivoRechazo,
      usuarioId
    } = pedido;

    const { rows } = await cliente.query(
      `INSERT INTO pedidos
        (fecha, subtotal, envio, total, metodo_pago, telefono, comercio, persona_contacto,
         modalidad_entrega, direccion, descripcion_direccion, observaciones, estado, motivo_rechazo, usuario_id)
       VALUES (COALESCE($1, CURRENT_DATE), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        fecha ?? null,
        subtotal,
        envio,
        total,
        metodoPago,
        telefono,
        comercio,
        personaContacto ?? null,
        modalidadEntrega,
        direccion,
        descripcionDireccion ?? null,
        observaciones ?? null,
        estado,
        motivoRechazo ?? null,
        usuarioId
      ]
    );

    const pedidoCreado = mapearPedido(rows[0]);

    for (const item of items) {
      await cliente.query(
        `INSERT INTO tiene (cantidad, precio, producto_id, pedido_id)
         VALUES ($1, $2, $3, $4)`,
        [item.cantidad, item.precio, item.productoId, pedidoCreado.id]
      );
    }

    return {
      ...pedidoCreado,
      items: items.map((item) => ({
        pedido_id: pedidoCreado.id,
        producto_id: item.productoId,
        precio: item.precio,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad
      }))
    };
  });
};

export const aprobarPedido = async (id, modificacion = {}, asignacionesLotes = null) => {
  return conTransaccion(async (cliente) => {
    const { rows: pedidoRows } = await cliente.query(
      'SELECT * FROM pedidos WHERE id = $1 FOR UPDATE',
      [id]
    );
    const pedido = mapearPedido(pedidoRows[0]);

    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.status = 404;
      throw error;
    }

    const estadoActual = String(pedido.estado ?? '').trim().toLowerCase();
    if (!['pendiente', 'nuevo'].includes(estadoActual)) {
      const error = new Error('Solo se puede aprobar un pedido pendiente');
      error.status = 409;
      throw error;
    }

    const { rows: items } = await cliente.query(
      `SELECT t.producto_id, t.cantidad, p.nombre, p.activo AS producto_activo
       FROM tiene t
       JOIN productos p ON p.id = t.producto_id
       WHERE t.pedido_id = $1 AND t.activo`,
      [id]
    );

    if (items.length === 0) {
      const error = new Error('El pedido no tiene productos para aprobar');
      error.status = 409;
      throw error;
    }

    const productoEliminado = items.find((item) => item.producto_activo === false);
    if (productoEliminado) {
      const error = new Error(
        `El producto "${productoEliminado.nombre}" fue eliminado y no puede aprobarse. Recordá llamar al cliente para coordinar el pedido.`
      );
      error.status = 409;
      throw error;
    }

    // Mapa de asignaciones enviadas desde el frontend si existen
    const mapaAsignaciones = new Map();
    if (Array.isArray(asignacionesLotes)) {
      for (const asig of asignacionesLotes) {
        if (asig && asig.productoId) {
          mapaAsignaciones.set(Number(asig.productoId), asig);
        }
      }
    }

    const productosAfectados = new Set();

    for (const item of items) {
      const prodId = Number(item.producto_id);
      productosAfectados.add(prodId);
      let restante = Number(item.cantidad);

      const asig = mapaAsignaciones.get(prodId);
      const modoManual = asig && asig.modo === 'manual' && Array.isArray(asig.lotes) && asig.lotes.length > 0;

      let lotesParaConsumir = [];

      if (modoManual) {
        // En modo manual, el admin seleccionó una lista ordenada de IDs de lotes
        for (const loteIdRaw of asig.lotes) {
          const loteId = Number(loteIdRaw);
          const { rows: loteRows } = await cliente.query(
            `SELECT id, cantidad, cantidad_inicial, fecha_vencimiento
             FROM lotes
             WHERE id = $1 AND producto_id = $2 AND activo = true
             FOR UPDATE`,
            [loteId, prodId]
          );

          if (loteRows.length === 0) {
            const error = new Error(`El lote #${loteId} no pertenece al producto "${item.nombre}" o está inactivo`);
            error.status = 409;
            throw error;
          }

          const l = loteRows[0];
          const hoyISO = new Date().toISOString().slice(0, 10);
          const fVenci = String(l.fecha_vencimiento).slice(0, 10);
          if (fVenci < hoyISO) {
            const error = new Error(`El lote #${loteId} de "${item.nombre}" se encuentra vencido`);
            error.status = 409;
            throw error;
          }

          if (Number(l.cantidad) <= 0) {
            const error = new Error(`El lote #${loteId} de "${item.nombre}" no tiene stock disponible`);
            error.status = 409;
            throw error;
          }

          lotesParaConsumir.push(l);
        }
      } else {
        // Modo automático: lotes activos vigentes ordenados por fecha_vencimiento ASC, id ASC
        const { rows: lotesAuto } = await cliente.query(
          `SELECT id, cantidad, cantidad_inicial, fecha_vencimiento
           FROM lotes
           WHERE producto_id = $1
             AND activo = true
             AND cantidad > 0
             AND fecha_vencimiento >= CURRENT_DATE
           ORDER BY fecha_vencimiento ASC, id ASC
           FOR UPDATE`,
          [prodId]
        );
        lotesParaConsumir = lotesAuto;
      }

      for (const lote of lotesParaConsumir) {
        if (restante <= 0) break;

        const cantidadLote = Number(lote.cantidad);
        const descontar = Math.min(restante, cantidadLote);
        const nuevaCantidad = cantidadLote - descontar;
        const consumidoEntero = (nuevaCantidad === 0);

        // Se descuenta la cantidad sin cambiar activo a false (preserva registro histórico si llega a 0)
        await cliente.query(
          `UPDATE lotes
           SET cantidad = $1
           WHERE id = $2`,
          [nuevaCantidad, lote.id]
        );

        await cliente.query(
          `INSERT INTO pedido_lotes (pedido_id, producto_id, lote_id, cantidad, consumido_entero)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, prodId, lote.id, descontar, consumidoEntero]
        );

        restante -= descontar;
      }

      if (restante > 0) {
        const error = new Error(
          modoManual
            ? `Los lotes seleccionados para "${item.nombre}" son insuficientes para cubrir la cantidad requerida`
            : `Lotes vigentes insuficientes para "${item.nombre}"`
        );
        error.status = 409;
        throw error;
      }
    }

    // Sincronizar stock calculado en tabla productos para cada producto afectado
    for (const prodId of productosAfectados) {
      await productosRepo.recalcularStock(prodId, cliente);
    }

    const tieneModificacionNueva = modificacion.totalModificado !== undefined;
    const totalModificadoFinal = tieneModificacionNueva
      ? modificacion.totalModificado
      : pedido.totalModificado;
    const motivoModificacionFinal = tieneModificacionNueva
      ? modificacion.motivoModificacion
      : pedido.motivoModificacion;

    const { rows: pedidoActualizado } = await cliente.query(
      `UPDATE pedidos
       SET estado = 'aprobado',
           total_modificado = $1,
           motivo_modificacion = $2
       WHERE id = $3
       RETURNING *`,
      [totalModificadoFinal ?? null, motivoModificacionFinal ?? null, id]
    );

    await cliente.query(
      `INSERT INTO ventas (fecha, total, total_modificado, motivo_modificacion, pedido_id)
       SELECT CURRENT_DATE, $1, $2, $3, $4
       WHERE NOT EXISTS (
         SELECT 1 FROM ventas WHERE pedido_id = $4 AND activo = true
       )`,
      [pedido.total, totalModificadoFinal ?? null, motivoModificacionFinal ?? null, id]
    );

    return mapearPedido(pedidoActualizado[0]);
  });
};

export const update = async (id, data) => {
  const {
    fecha,
    subtotal,
    envio,
    total,
    totalModificado,
    motivoModificacion,
    metodoPago,
    telefono,
    comercio,
    personaContacto,
    modalidadEntrega,
    direccion,
    descripcionDireccion,
    observaciones,
    estado,
    motivoRechazo
  } = data;

  const { rows } = await pool.query(
    `UPDATE pedidos
     SET fecha = COALESCE($1, fecha),
         subtotal = $2,
         envio = $3,
         total = $4,
         total_modificado = $5,
         motivo_modificacion = $6,
         metodo_pago = $7,
         telefono = $8,
         comercio = $9,
         persona_contacto = $10,
         modalidad_entrega = $11,
         direccion = $12,
         descripcion_direccion = $13,
         observaciones = $14,
         estado = $15,
         motivo_rechazo = $16
     WHERE id = $17
     RETURNING *`,
    [
      fecha ?? null,
      subtotal ?? 0,
      envio ?? 0,
      total,
      totalModificado ?? null,
      motivoModificacion ?? null,
      metodoPago,
      telefono,
      comercio,
      personaContacto ?? null,
      modalidadEntrega,
      direccion,
      descripcionDireccion ?? null,
      observaciones ?? null,
      estado,
      motivoRechazo ?? null,
      id
    ]
  );

  return mapearPedido(rows[0]);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE pedidos SET activo = false WHERE id = $1', [id]);
  return rowCount;
};
