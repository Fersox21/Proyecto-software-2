import { pool } from '../../config/db.js';
import * as categoriasRepo from '../categorias/categorias.repository.js';
import * as tiposPromocionRepo from '../tiposPromocion/tiposPromocion.repository.js';
import * as productosRepo from '../productos/productos.repository.js';
import * as proveedoresRepo from '../proveedores/proveedores.repository.js';
import { crearError } from '../../utils/validaciones.js';

export const crearOrdenesCompraRepository = ({
  dbPool = pool,
  categoriasRepository = categoriasRepo,
  tiposPromocionRepository = tiposPromocionRepo,
  productosRepository = productosRepo,
  proveedoresRepository = proveedoresRepo
} = {}) => {
  let capacidadesCache = null;

  const obtenerCapacidades = async (executor = dbPool) => {
    if (capacidadesCache) return capacidadesCache;
    if (typeof executor?.query !== 'function') {
      return { tieneCantidadInicial: true };
    }
    const { rows } = await executor.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'lotes' AND column_name = 'cantidad_inicial'
      ) AS tiene_cantidad_inicial
    `);
    if (!rows || rows.length === 0) {
      return { tieneCantidadInicial: true };
    }
    capacidadesCache = {
      tieneCantidadInicial: Boolean(rows[0].tiene_cantidad_inicial)
    };
    return capacidadesCache;
  };

  const resolverProductoEnTransaccion = async (lote, client) => {
    if (!lote.productoNuevo) {
      return lote.productoId ?? lote.producto;
    }

    const nuevo = lote.productoNuevo;

    let categoria = null;
    if (nuevo.categoriaNuevaNombre) {
      categoria = await categoriasRepository.findByNombreInsensitive(nuevo.categoriaNuevaNombre, client);
      if (!categoria) {
        categoria = await categoriasRepository.create(nuevo.categoriaNuevaNombre, client);
      } else if (categoria.activo === false && categoriasRepository.reactivar) {
        categoria = await categoriasRepository.reactivar(categoria.id, nuevo.categoriaNuevaNombre, client);
      }
    } else if (nuevo.categoriaId) {
      categoria = await categoriasRepository.findById(nuevo.categoriaId, client);
    }

    if (!categoria) {
      throw crearError('No se pudo resolver la categoría del producto nuevo', 400);
    }

    let tipoPromocionId = null;
    if (nuevo.tipoPromocionNuevaNombre) {
      let tipo = await tiposPromocionRepository.findByNombreInsensitive(nuevo.tipoPromocionNuevaNombre, client);
      if (!tipo) {
        tipo = await tiposPromocionRepository.create(nuevo.tipoPromocionNuevaNombre, client);
      } else if (tipo.activo === false && tiposPromocionRepository.reactivar) {
        tipo = await tiposPromocionRepository.reactivar(tipo.id, nuevo.tipoPromocionNuevaNombre, client);
      }
      tipoPromocionId = tipo.id;
    } else if (nuevo.tipoPromocionId != null) {
      tipoPromocionId = nuevo.tipoPromocionId;
    }

    const productoCreado = await productosRepository.create(
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

  const findAll = async () => {
    const { rows } = await dbPool.query(`
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

  const findHistorial = async () => {
    const { rows } = await dbPool.query(`
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

  const findById = async (id, incluirInactivos = false) => {
    const filtroOrden = incluirInactivos ? '' : ' AND oc.activo = true';
    const { rows: ordenRows } = await dbPool.query(
      `SELECT oc.id, oc.fecha, oc.total, oc.activo,
              p.id AS proveedor_id, p.nombre AS proveedor_nombre, p.telefono AS proveedor_telefono
       FROM ordenes_compra oc
       LEFT JOIN proveedores p ON p.id = oc.proveedor_id
       WHERE oc.id = $1${filtroOrden}`,
      [id]
    );

    if (ordenRows.length === 0) return null;

    const row = ordenRows[0];
    const filtroLotes = incluirInactivos ? '' : 'AND l.activo = true';
    const { tieneCantidadInicial } = await obtenerCapacidades();
    const columnaCantidadInicial = tieneCantidadInicial
      ? 'l.cantidad_inicial'
      : 'l.cantidad AS cantidad_inicial';

    const { rows: lotesRows } = await dbPool.query(
      `SELECT l.id, l.cantidad, ${columnaCantidadInicial}, l.total, l.fecha_arribo, l.fecha_vencimiento, l.activo,
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
      cantidadInicial: l.cantidad_inicial != null ? l.cantidad_inicial : l.cantidad,
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

  const create = async (data) => {
    const { total, fecha, proveedor_id, proveedorNuevo, lotes = [] } = data;
    const client = await dbPool.connect();

    try {
      await client.query('BEGIN');

      let proveedorIdFinal = proveedor_id;
      if (proveedorNuevo) {
        const nuevoProveedor = await proveedoresRepository.create(proveedorNuevo, client);
        proveedorIdFinal = nuevoProveedor.id;
      }

      const { rows } = await client.query(
        `INSERT INTO ordenes_compra (fecha, total, activo, proveedor_id)
         VALUES ($1, $2, true, $3)
         RETURNING id, fecha, total, activo, proveedor_id`,
        [fecha, total, proveedorIdFinal]
      );

      const nuevaOrden = rows[0];
      const { tieneCantidadInicial } = await obtenerCapacidades(client);

      for (const lote of lotes) {
        const prodId = await resolverProductoEnTransaccion(lote, client);
        const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
        const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

        if (tieneCantidadInicial) {
          await client.query(
            `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad_inicial, cantidad, orden_compra_id, producto_id, activo, total)
             VALUES ($1, $2, $3, $3, $4, $5, true, $6)`,
            [fArribo, fVenci, lote.cantidad, nuevaOrden.id, prodId, lote.total]
          );
        } else {
          await client.query(
            `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad, orden_compra_id, producto_id, activo, total)
             VALUES ($1, $2, $3, $4, $5, true, $6)`,
            [fArribo, fVenci, lote.cantidad, nuevaOrden.id, prodId, lote.total]
          );
        }

        await productosRepository.recalcularStock(prodId, client);
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

  const update = async (id, data) => {
    const { total, fecha, proveedor_id, proveedorNuevo, lotes } = data;
    const client = await dbPool.connect();

    try {
      await client.query('BEGIN');

      const { rows: ordenLock } = await client.query(
        'SELECT id FROM ordenes_compra WHERE id = $1 AND activo = true FOR UPDATE',
        [id]
      );
      if (ordenLock.length === 0) {
        throw crearError('Orden de compra no encontrada', 404);
      }

      let proveedorIdFinal = proveedor_id;
      if (proveedorNuevo) {
        const nuevoProveedor = await proveedoresRepository.create(proveedorNuevo, client);
        proveedorIdFinal = nuevoProveedor.id;
      }

      if (proveedorIdFinal !== undefined) {
        await client.query(
          `UPDATE ordenes_compra
           SET total = $1, fecha = $2, proveedor_id = $3
           WHERE id = $4 AND activo = true`,
          [total, fecha, proveedorIdFinal, id]
        );
      } else {
        await client.query(
          `UPDATE ordenes_compra
           SET total = $1, fecha = $2
           WHERE id = $3 AND activo = true`,
          [total, fecha, id]
        );
      }

      if (Array.isArray(lotes)) {
        const { tieneCantidadInicial } = await obtenerCapacidades(client);
        const columnaCantidadInicial = tieneCantidadInicial
          ? 'cantidad_inicial'
          : 'cantidad AS cantidad_inicial';

        const { rows: lotesPrevios } = await client.query(
          `SELECT id, producto_id, cantidad, ${columnaCantidadInicial} FROM lotes WHERE orden_compra_id = $1 AND activo = true FOR UPDATE`,
          [id]
        );

        const loteConsumido = lotesPrevios.find((l) => Number(l.cantidad) < Number(l.cantidad_inicial));
        if (loteConsumido) {
          throw crearError(
            'No se pueden modificar los lotes de esta orden porque algunos ya registraron salidas o ventas',
            409
          );
        }

        await client.query(
          `UPDATE lotes SET activo = false WHERE orden_compra_id = $1 AND activo = true`,
          [id]
        );

        const productosAfectados = new Set(lotesPrevios.map((l) => l.producto_id));

        for (const lote of lotes) {
          const prodId = await resolverProductoEnTransaccion(lote, client);
          productosAfectados.add(prodId);
          const fArribo = lote.fechaArribo ?? lote.fecha_arribo;
          const fVenci = lote.fechaVencimiento ?? lote.fecha_vencimiento ?? lote.fechaVenci;

          if (tieneCantidadInicial) {
            await client.query(
              `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad_inicial, cantidad, orden_compra_id, producto_id, activo, total)
               VALUES ($1, $2, $3, $3, $4, $5, true, $6)`,
              [fArribo, fVenci, lote.cantidad, id, prodId, lote.total]
            );
          } else {
            await client.query(
              `INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad, orden_compra_id, producto_id, activo, total)
               VALUES ($1, $2, $3, $4, $5, true, $6)`,
              [fArribo, fVenci, lote.cantidad, id, prodId, lote.total]
            );
          }
        }

        for (const prodId of productosAfectados) {
          await productosRepository.recalcularStock(prodId, client);
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

  const remove = async (id) => {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');
      const { rows: ordenRows } = await client.query(
        'SELECT id FROM ordenes_compra WHERE id = $1 AND activo = true FOR UPDATE',
        [id]
      );
      if (ordenRows.length === 0) {
        await client.query('ROLLBACK');
        return 0;
      }

      const { tieneCantidadInicial } = await obtenerCapacidades(client);
      const columnaCantidadInicial = tieneCantidadInicial
        ? 'cantidad_inicial'
        : 'cantidad AS cantidad_inicial';

      const { rows: lotesActivos } = await client.query(
        `SELECT id, producto_id, cantidad, ${columnaCantidadInicial} FROM lotes WHERE orden_compra_id = $1 AND activo = true FOR UPDATE`,
        [id]
      );

      const loteConsumido = lotesActivos.find((l) => Number(l.cantidad) < Number(l.cantidad_inicial));
      if (loteConsumido) {
        throw crearError(
          'No se puede eliminar la orden de compra porque algunos de sus lotes ya registraron salidas o ventas',
          409
        );
      }

      const { rowCount } = await client.query(
        'UPDATE ordenes_compra SET activo = false WHERE id = $1 AND activo = true',
        [id]
      );
      await client.query('UPDATE lotes SET activo = false WHERE orden_compra_id = $1 AND activo = true', [id]);

      const productosAfectados = new Set(lotesActivos.map((l) => l.producto_id));
      for (const prodId of productosAfectados) {
        await productosRepository.recalcularStock(prodId, client);
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

  return { findAll, findHistorial, findById, create, update, remove };
};

const defaultRepository = crearOrdenesCompraRepository();

export const findAll = defaultRepository.findAll;
export const findHistorial = defaultRepository.findHistorial;
export const findById = defaultRepository.findById;
export const create = defaultRepository.create;
export const update = defaultRepository.update;
export const remove = defaultRepository.remove;
