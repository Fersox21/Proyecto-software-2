import { pool } from '../../config/db.js';
import { redondear2 } from '../productos/productos.precio.js';
import { crearError } from '../../utils/validaciones.js';

const COLUMNAS_TIENE = 'cantidad, precio, activo, producto_id, pedido_id';

export const crearTieneRepository = (dbPool = pool) => {
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
      `SELECT ${COLUMNAS_TIENE} FROM tiene WHERE activo = true ORDER BY pedido_id ASC`
    );
    return rows;
  };

  const findByPedido = async (pedido_id) => {
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_TIENE} FROM tiene WHERE pedido_id = $1 AND activo = true`,
      [pedido_id]
    );
    return rows;
  };

  const findByPedidoYProducto = async (pedido_id, producto_id) => {
    const { rows } = await dbPool.query(
      `SELECT ${COLUMNAS_TIENE} FROM tiene WHERE pedido_id = $1 AND producto_id = $2`,
      [pedido_id, producto_id]
    );
    return rows[0] ?? null;
  };

  const recalcularTotalesPedido = async (cliente, pedido, calcularEnvioFn) => {
    const { rows: itemsActivos } = await cliente.query(
      `SELECT cantidad, precio FROM tiene WHERE pedido_id = $1 AND activo = true`,
      [pedido.id]
    );

    if (itemsActivos.length === 0) {
      await cliente.query(
        `UPDATE pedidos SET estado = 'eliminado', activo = false, subtotal = 0 WHERE id = $1`,
        [pedido.id]
      );
      return;
    }

    const subtotal = redondear2(
      itemsActivos.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0)
    );
    const envio = calcularEnvioFn(pedido.modalidad_entrega, subtotal);
    const total = redondear2(subtotal + envio);

    await cliente.query(
      `UPDATE pedidos SET subtotal = $1, envio = $2, total = $3 WHERE id = $4`,
      [subtotal, envio, total, pedido.id]
    );
  };

  const obtenerPedidoPendienteBloqueado = async (cliente, pedido_id) => {
    const { rows } = await cliente.query(
      `SELECT id, estado, modalidad_entrega FROM pedidos WHERE id = $1 AND activo = true FOR UPDATE`,
      [pedido_id]
    );
    const pedido = rows[0];
    if (!pedido) {
      throw crearError('Pedido no encontrado', 404);
    }

    const estadoActual = String(pedido.estado ?? '').trim().toLowerCase();
    if (!['pendiente', 'nuevo'].includes(estadoActual)) {
      throw crearError('Solo se pueden modificar ítems de un pedido pendiente', 409);
    }

    return pedido;
  };

  const crearItemConRecalculo = async (data, calcularEnvioFn) => {
    const { cantidad, precio, producto_id, pedido_id } = data;
    return conTransaccion(async (cliente) => {
      const pedido = await obtenerPedidoPendienteBloqueado(cliente, pedido_id);

      const { rows: prodRows } = await cliente.query(
        `SELECT id FROM productos WHERE id = $1 AND activo = true`,
        [producto_id]
      );
      if (prodRows.length === 0) {
        throw crearError('Producto no encontrado o inactivo', 404);
      }

      const { rows: existentes } = await cliente.query(
        `SELECT activo FROM tiene WHERE pedido_id = $1 AND producto_id = $2 FOR UPDATE`,
        [pedido_id, producto_id]
      );

      let itemGuardado;
      if (existentes.length > 0) {
        if (existentes[0].activo === true) {
          throw crearError('El producto ya se encuentra agregado en este pedido', 409);
        }
        const { rows } = await cliente.query(
          `UPDATE tiene
           SET cantidad = $1, precio = $2, activo = true
           WHERE pedido_id = $3 AND producto_id = $4
           RETURNING ${COLUMNAS_TIENE}`,
          [cantidad, precio, pedido_id, producto_id]
        );
        itemGuardado = rows[0];
      } else {
        const { rows } = await cliente.query(
          `INSERT INTO tiene (cantidad, precio, producto_id, pedido_id, activo)
           VALUES ($1, $2, $3, $4, true)
           RETURNING ${COLUMNAS_TIENE}`,
          [cantidad, precio, producto_id, pedido_id]
        );
        itemGuardado = rows[0];
      }

      await recalcularTotalesPedido(cliente, pedido, calcularEnvioFn);
      return itemGuardado;
    });
  };

  const actualizarItemConRecalculo = async (data, calcularEnvioFn) => {
    const { cantidad, precio, pedido_id, producto_id } = data;
    return conTransaccion(async (cliente) => {
      const pedido = await obtenerPedidoPendienteBloqueado(cliente, pedido_id);

      const { rows } = await cliente.query(
        `UPDATE tiene
         SET cantidad = COALESCE($1, cantidad),
             precio = COALESCE($2, precio)
         WHERE pedido_id = $3 AND producto_id = $4 AND activo = true
         RETURNING ${COLUMNAS_TIENE}`,
        [cantidad ?? null, precio ?? null, pedido_id, producto_id]
      );
      if (rows.length === 0) {
        throw crearError('Item no encontrado', 404);
      }

      await recalcularTotalesPedido(cliente, pedido, calcularEnvioFn);
      return rows[0];
    });
  };

  const eliminarItemConRecalculo = async (pedido_id, producto_id, calcularEnvioFn) => {
    return conTransaccion(async (cliente) => {
      const pedido = await obtenerPedidoPendienteBloqueado(cliente, pedido_id);

      const { rowCount } = await cliente.query(
        `UPDATE tiene SET activo = false WHERE pedido_id = $1 AND producto_id = $2 AND activo = true`,
        [pedido_id, producto_id]
      );
      if (rowCount === 0) {
        throw crearError('El item no existe en este pedido', 404);
      }

      await recalcularTotalesPedido(cliente, pedido, calcularEnvioFn);
      return rowCount;
    });
  };

  const create = async (data) => {
    const { cantidad, precio, producto_id, pedido_id } = data;
    const { rows } = await dbPool.query(
      `INSERT INTO tiene (cantidad, precio, producto_id, pedido_id)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLUMNAS_TIENE}`,
      [cantidad, precio, producto_id, pedido_id]
    );
    return rows[0];
  };

  const update = async (data) => {
    const { cantidad, precio, pedido_id, producto_id } = data;
    const { rows } = await dbPool.query(
      `UPDATE tiene
       SET cantidad = $1, precio = $2
       WHERE pedido_id = $3 AND producto_id = $4 AND activo = true
       RETURNING ${COLUMNAS_TIENE}`,
      [cantidad, precio, pedido_id, producto_id]
    );
    return rows[0] ?? null;
  };

  const remove = async (pedido_id, producto_id) => {
    const { rowCount } = await dbPool.query(
      `UPDATE tiene
       SET activo = false
       WHERE pedido_id = $1 AND producto_id = $2 AND activo = true`,
      [pedido_id, producto_id]
    );
    return rowCount;
  };

  return {
    findAll,
    findByPedido,
    findByPedidoYProducto,
    crearItemConRecalculo,
    actualizarItemConRecalculo,
    eliminarItemConRecalculo,
    create,
    update,
    remove
  };
};

const defaultRepository = crearTieneRepository();

export const findAll = defaultRepository.findAll;
export const findByPedido = defaultRepository.findByPedido;
export const findByPedidoYProducto = defaultRepository.findByPedidoYProducto;
export const crearItemConRecalculo = defaultRepository.crearItemConRecalculo;
export const actualizarItemConRecalculo = defaultRepository.actualizarItemConRecalculo;
export const eliminarItemConRecalculo = defaultRepository.eliminarItemConRecalculo;
export const create = defaultRepository.create;
export const update = defaultRepository.update;
export const remove = defaultRepository.remove;
