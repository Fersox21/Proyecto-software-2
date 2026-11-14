import { pool } from '../../config/db.js';

const mapearPedido = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    subtotal: row.subtotal,
    envio: row.envio,
    total: row.total,
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
  const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY activo DESC, fecha ASC');
  return rows.map(mapearPedido);
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
  return mapearPedido(rows[0]);
};

export const findItemsByPedido = async (pedido_id) => {
  const { rows } = await pool.query(
    `SELECT t.pedido_id, t.producto_id, t.cantidad, t.precio, t.activo,
            p.nombre, p.marca
     FROM tiene t
     JOIN productos p ON p.id = t.producto_id
     WHERE t.pedido_id = $1 AND t.activo = true
     ORDER BY p.nombre ASC`,
    [pedido_id]
  );
  return rows.map(mapearItem);
};

export const findByIdConItems = async (id) => {
  const pedido = await findById(id);
  if (!pedido) return null;

  const items = await findItemsByPedido(id);
  return { ...pedido, items };
};

export const createConItems = async (pedido, items) => {
  return conTransaccion(async (cliente) => {
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

export const aprobarPedido = async (id) => {
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

    if (pedido.estado !== 'pendiente') {
      const error = new Error('Solo se puede aprobar un pedido pendiente');
      error.status = 409;
      throw error;
    }

    const { rows: items } = await cliente.query(
      `SELECT t.producto_id, t.cantidad, p.nombre
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

    for (const item of items) {
      const { rowCount } = await cliente.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.cantidad, item.producto_id]
      );

      if (rowCount === 0) {
        const error = new Error(`Stock insuficiente para "${item.nombre}"`);
        error.status = 409;
        throw error;
      }
    }

    const { rows: pedidoActualizado } = await cliente.query(
      "UPDATE pedidos SET estado = 'aprobado' WHERE id = $1 RETURNING *",
      [id]
    );

    await cliente.query(
      `INSERT INTO ventas (fecha, total, pedido_id)
       SELECT CURRENT_DATE, $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM ventas WHERE pedido_id = $2 AND activo = true
       )`,
      [pedido.total, id]
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
         metodo_pago = $5,
         telefono = $6,
         comercio = $7,
         persona_contacto = $8,
         modalidad_entrega = $9,
         direccion = $10,
         descripcion_direccion = $11,
         observaciones = $12,
         estado = $13,
         motivo_rechazo = $14
     WHERE id = $15
     RETURNING *`,
    [
      fecha ?? null,
      subtotal ?? 0,
      envio ?? 0,
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
      id
    ]
  );

  return mapearPedido(rows[0]);
};

export const remove = async (id) => {
  const { rowCount } = await pool.query('UPDATE pedidos SET activo = false WHERE id = $1', [id]);
  return rowCount;
};
