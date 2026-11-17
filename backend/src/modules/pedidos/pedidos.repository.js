import { pool } from '../../config/db.js';
import * as productosRepo from '../productos/productos.repository.js';
import { redondear2 } from '../productos/productos.precio.js';
import { crearError, validarIdEnteroPositivo } from '../../utils/validaciones.js';

const COLUMNAS_PEDIDO = `
  id, fecha, subtotal, envio, total, total_modificado, motivo_modificacion,
  metodo_pago, telefono, comercio, persona_contacto, modalidad_entrega,
  direccion, descripcion_direccion, observaciones, estado, motivo_rechazo,
  activo, usuario_id
`;

const normalizarFechaISO = (valor) => {
  if (valor == null) return '';
  if (valor instanceof Date) {
    const anio = valor.getFullYear();
    const mes = String(valor.getMonth() + 1).padStart(2, '0');
    const dia = String(valor.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
  return String(valor).slice(0, 10);
};

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

export const crearPedidosRepository = ({
  dbPool = pool,
  productosRepository = productosRepo
} = {}) => {
  let capacidadesCache = null;

  const obtenerCapacidades = async (executor = dbPool) => {
    if (capacidadesCache) return capacidadesCache;
    if (typeof executor?.query !== 'function') {
      return { tieneCantidadInicial: true, tienePedidoLotes: true };
    }
    const { rows } = await executor.query(`
      SELECT
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'lotes' AND column_name = 'cantidad_inicial'
        ) AS tiene_cantidad_inicial,
        to_regclass('public.pedido_lotes') IS NOT NULL AS tiene_pedido_lotes
    `);
    if (!rows || rows.length === 0) {
      return { tieneCantidadInicial: true, tienePedidoLotes: true };
    }
    capacidadesCache = {
      tieneCantidadInicial: Boolean(rows[0].tiene_cantidad_inicial),
      tienePedidoLotes: Boolean(rows[0].tiene_pedido_lotes)
    };
    return capacidadesCache;
  };

  const conTransaccion = async (accion) => {
    const cliente = await dbPool.connect();
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

  const findAll = async () => {
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_PEDIDO} FROM pedidos WHERE activo = true AND LOWER(estado) IN ('pendiente', 'nuevo') ORDER BY fecha ASC, id ASC`
    );
    return rows.map(mapearPedido);
  };

  const findHistorial = async () => {
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_PEDIDO} FROM pedidos ORDER BY fecha DESC, id DESC`
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

  const findById = async (id, incluirInactivos = false) => {
    const filtroActivo = incluirInactivos ? '' : ' AND activo = true';
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_PEDIDO} FROM pedidos WHERE id = $1${filtroActivo}`,
      [id]
    );
    return mapearPedido(rows[0]);
  };

  const findItemsByPedido = async (pedido_id, incluirInactivos = false) => {
    const filtroActivo = incluirInactivos ? '' : 'AND t.activo = true';
    const { rows } = await dbPool.query(
      `SELECT t.pedido_id, t.producto_id, t.cantidad, t.precio, t.activo,
              p.nombre, p.marca, p.activo AS producto_activo
       FROM tiene t
       JOIN productos p ON p.id = t.producto_id
       WHERE t.pedido_id = $1 ${filtroActivo}
       ORDER BY p.nombre ASC`,
      [pedido_id]
    );

    const { tienePedidoLotes } = await obtenerCapacidades();
    let lotesRows = [];
    if (tienePedidoLotes) {
      const resultadoLotes = await dbPool.query(
        `SELECT pl.producto_id, pl.lote_id, pl.cantidad, pl.consumido_entero,
                l.fecha_vencimiento
         FROM pedido_lotes pl
         JOIN lotes l ON l.id = pl.lote_id
         WHERE pl.pedido_id = $1
         ORDER BY pl.id ASC`,
        [pedido_id]
      );
      lotesRows = resultadoLotes.rows;
    }

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

  const findByIdConItems = async (id, incluirInactivos = false) => {
    const pedido = await findById(id, incluirInactivos);
    if (!pedido) return null;

    const items = await findItemsByPedido(id, incluirInactivos);
    return { ...pedido, items };
  };

  const findLotesDisponiblesParaPedido = async (pedidoId) => {
    const { tieneCantidadInicial } = await obtenerCapacidades();
    const columnaCantidadInicial = tieneCantidadInicial
      ? 'l.cantidad_inicial'
      : 'l.cantidad AS cantidad_inicial';
    const items = await findItemsByPedido(pedidoId);
    const resultado = [];

    for (const item of items) {
      const { rows: lotes } = await dbPool.query(
        `SELECT l.id, l.cantidad, ${columnaCantidadInicial}, l.fecha_arribo, l.fecha_vencimiento, l.orden_compra_id
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

  const createConItems = async (pedido, items) => {
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
         RETURNING ${COLUMNAS_PEDIDO}`,
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

  const aprobarPedido = async (id, modificacion = {}, asignacionesLotes = null) => {
    return conTransaccion(async (cliente) => {
      const { rows: pedidoRows } = await cliente.query(
        `SELECT ${COLUMNAS_PEDIDO} FROM pedidos WHERE id = $1 AND activo = true FOR UPDATE`,
        [id]
      );
      const pedido = mapearPedido(pedidoRows[0]);

      if (!pedido) {
        throw crearError('Pedido no encontrado', 404);
      }

      const estadoActual = String(pedido.estado ?? '').trim().toLowerCase();
      if (!['pendiente', 'nuevo'].includes(estadoActual)) {
        throw crearError('Solo se puede aprobar un pedido pendiente', 409);
      }

      const { rows: items } = await cliente.query(
        `SELECT t.producto_id, t.cantidad, p.nombre, p.activo AS producto_activo
         FROM tiene t
         JOIN productos p ON p.id = t.producto_id
         WHERE t.pedido_id = $1 AND t.activo = true`,
        [id]
      );

      if (items.length === 0) {
        throw crearError('El pedido no tiene productos para aprobar', 409);
      }

      const productoEliminado = items.find((item) => item.producto_activo === false);
      if (productoEliminado) {
        throw crearError(
          `El producto "${productoEliminado.nombre}" fue eliminado y no puede aprobarse. Recordá llamar al cliente para coordinar el pedido.`,
          409
        );
      }

      const mapaAsignaciones = new Map();
      if (Array.isArray(asignacionesLotes)) {
        for (const asig of asignacionesLotes) {
          if (asig && asig.productoId != null) {
            mapaAsignaciones.set(Number(asig.productoId), asig);
          }
        }
      }

      const { tieneCantidadInicial, tienePedidoLotes } = await obtenerCapacidades(cliente);
      const columnaCantidadInicial = tieneCantidadInicial
        ? 'cantidad_inicial'
        : 'cantidad AS cantidad_inicial';
      const productosAfectados = new Set();
      const hoyISO = normalizarFechaISO(new Date());

      for (const item of items) {
        const prodId = Number(item.producto_id);
        productosAfectados.add(prodId);
        let restante = Number(item.cantidad);

        const asig = mapaAsignaciones.get(prodId);
        const esManual = asig && asig.modo === 'manual';

        let lotesParaConsumir = [];

        if (esManual) {
          if (!Array.isArray(asig.lotes) || asig.lotes.length === 0) {
            throw crearError(`Debe seleccionar al menos un lote para "${item.nombre}"`, 400);
          }

          const lotesIds = [];
          const lotesVistos = new Set();
          for (const loteRaw of asig.lotes) {
            const loteId = validarIdEnteroPositivo(
              loteRaw?.id ?? loteRaw?.loteId ?? loteRaw,
              `El lote indicado para "${item.nombre}" no es válido`
            );
            if (lotesVistos.has(loteId)) {
              throw crearError(
                `Uno de los lotes seleccionados para "${item.nombre}" está repetido en la asignación manual`,
                400
              );
            }
            lotesVistos.add(loteId);
            lotesIds.push(loteId);
          }

          for (const loteId of lotesIds) {
            const { rows: loteRows } = await cliente.query(
              `SELECT id, cantidad, ${columnaCantidadInicial}, fecha_vencimiento,
                      (fecha_vencimiento < CURRENT_DATE) AS vencido
               FROM lotes
               WHERE id = $1 AND producto_id = $2 AND activo = true
               FOR UPDATE`,
              [loteId, prodId]
            );

            if (loteRows.length === 0) {
              throw crearError(
                `Uno de los lotes seleccionados no pertenece al producto "${item.nombre}" o está inactivo`,
                409
              );
            }

            const l = loteRows[0];
            const estaVencido = l.vencido !== undefined
              ? Boolean(l.vencido)
              : normalizarFechaISO(l.fecha_vencimiento) < hoyISO;

            if (estaVencido) {
              throw crearError(`El lote seleccionado de "${item.nombre}" se encuentra vencido`, 409);
            }

            if (Number(l.cantidad) <= 0) {
              throw crearError(
                `El lote seleccionado de "${item.nombre}" no tiene stock disponible`,
                409
              );
            }

            lotesParaConsumir.push(l);
          }
        } else {
          const { rows: lotesAuto } = await cliente.query(
            `SELECT id, cantidad, ${columnaCantidadInicial}, fecha_vencimiento
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
          const consumidoEntero = nuevaCantidad === 0;

          await cliente.query(
            `UPDATE lotes
             SET cantidad = $1
             WHERE id = $2`,
            [nuevaCantidad, lote.id]
          );

          if (tienePedidoLotes) {
            await cliente.query(
              `INSERT INTO pedido_lotes (pedido_id, producto_id, lote_id, cantidad, consumido_entero)
               VALUES ($1, $2, $3, $4, $5)`,
              [id, prodId, lote.id, descontar, consumidoEntero]
            );
          }

          restante -= descontar;
        }

        if (restante > 0) {
          throw crearError(
            esManual
              ? `Los lotes seleccionados para "${item.nombre}" son insuficientes para cubrir la cantidad requerida`
              : `Lotes vigentes insuficientes para "${item.nombre}"`,
            409
          );
        }
      }

      for (const prodId of productosAfectados) {
        await productosRepository.recalcularStock(prodId, cliente);
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
         RETURNING ${COLUMNAS_PEDIDO}`,
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

  const eliminarItemConRecalculo = async (pedidoId, productoId, calcularEnvioFn) => {
    return conTransaccion(async (cliente) => {
      const { rows: pedidoRows } = await cliente.query(
        `SELECT ${COLUMNAS_PEDIDO} FROM pedidos WHERE id = $1 AND activo = true FOR UPDATE`,
        [pedidoId]
      );
      const pedido = mapearPedido(pedidoRows[0]);
      if (!pedido) {
        throw crearError('Pedido no encontrado', 404);
      }

      const estadoActual = String(pedido.estado ?? '').trim().toLowerCase();
      if (!['pendiente', 'nuevo'].includes(estadoActual)) {
        throw crearError('Solo se pueden modificar ítems de un pedido pendiente', 409);
      }

      const { rowCount } = await cliente.query(
        `UPDATE tiene SET activo = false WHERE pedido_id = $1 AND producto_id = $2 AND activo = true`,
        [pedidoId, productoId]
      );
      if (rowCount === 0) {
        throw crearError('Ítem no encontrado en el pedido', 404);
      }

      const { rows: itemsRestantes } = await cliente.query(
        `SELECT cantidad, precio FROM tiene WHERE pedido_id = $1 AND activo = true`,
        [pedidoId]
      );

      if (itemsRestantes.length === 0) {
        await cliente.query(
          `UPDATE pedidos SET estado = 'eliminado', activo = false, subtotal = 0 WHERE id = $1`,
          [pedidoId]
        );
        return {
          success: true,
          message: 'Ítem eliminado y pedido marcado como eliminado',
          pedido_id: pedidoId,
          producto_id: productoId,
          pedido_eliminado: true,
          nuevo_subtotal: 0,
          nuevo_envio: 0,
          nuevo_total: 0
        };
      }

      const nuevoSubtotal = redondear2(
        itemsRestantes.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
      );
      const nuevoEnvio = calcularEnvioFn(pedido.modalidadEntrega, nuevoSubtotal);
      const nuevoTotal = redondear2(nuevoSubtotal + nuevoEnvio);

      await cliente.query(
        `UPDATE pedidos SET subtotal = $1, envio = $2, total = $3 WHERE id = $4`,
        [nuevoSubtotal, nuevoEnvio, nuevoTotal, pedidoId]
      );

      return {
        success: true,
        message: 'Ítem eliminado y total del pedido actualizado',
        pedido_id: pedidoId,
        producto_id: productoId,
        pedido_eliminado: false,
        nuevo_subtotal: nuevoSubtotal,
        nuevo_envio: nuevoEnvio,
        nuevo_total: nuevoTotal
      };
    });
  };

  const update = async (id, data) => {
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

    const { rows } = await dbPool.query(
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
       WHERE id = $17 AND activo = true
       RETURNING ${COLUMNAS_PEDIDO}`,
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

  const remove = async (id) => {
    const { rowCount } = await dbPool.query(
      'UPDATE pedidos SET activo = false WHERE id = $1 AND activo = true',
      [id]
    );
    return rowCount;
  };

  return {
    findAll,
    findHistorial,
    findById,
    findItemsByPedido,
    findByIdConItems,
    findLotesDisponiblesParaPedido,
    createConItems,
    aprobarPedido,
    eliminarItemConRecalculo,
    update,
    remove
  };
};

const defaultRepository = crearPedidosRepository();

export const findAll = defaultRepository.findAll;
export const findHistorial = defaultRepository.findHistorial;
export const findById = defaultRepository.findById;
export const findItemsByPedido = defaultRepository.findItemsByPedido;
export const findByIdConItems = defaultRepository.findByIdConItems;
export const findLotesDisponiblesParaPedido = defaultRepository.findLotesDisponiblesParaPedido;
export const createConItems = defaultRepository.createConItems;
export const aprobarPedido = defaultRepository.aprobarPedido;
export const eliminarItemConRecalculo = defaultRepository.eliminarItemConRecalculo;
export const update = defaultRepository.update;
export const remove = defaultRepository.remove;
