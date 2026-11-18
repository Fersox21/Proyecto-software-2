import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

const historialRegistros = [];
const productosMemoria = new Map();

const productosRepoMock = {
  findAll: mock.fn(),
  findHistorial: mock.fn(),
  findAllCatalogo: mock.fn(),
  findById: mock.fn(async (id) => productosMemoria.get(Number(id)) ?? null),
  create: mock.fn(async (data) => {
    const id = productosMemoria.size + 1;
    const prod = { id, ...data, activo: true };
    productosMemoria.set(id, prod);
    if (!data.omitirHistorialInicial) {
      historialRegistros.unshift({
        id: historialRegistros.length + 1,
        productoId: id,
        loteId: null,
        ordenCompraId: null,
        precioCostoAnterior: null,
        precioCostoNuevo: Number(data.precioCosto),
        precioVentaAnterior: null,
        precioVentaNuevo: Number(data.precioVenta),
        origen: 'ALTA_PRODUCTO',
        fechaRegistro: new Date().toISOString(),
        cantidadLote: null,
        proveedorNombre: null
      });
    }
    return prod;
  }),
  update: mock.fn(async (id, data) => {
    const numId = Number(id);
    const previo = productosMemoria.get(numId);
    if (
      previo &&
      (Number(previo.precioCosto) !== Number(data.precioCosto) ||
        Number(previo.precioVenta) !== Number(data.precioVenta))
    ) {
      historialRegistros.unshift({
        id: historialRegistros.length + 1,
        productoId: numId,
        loteId: null,
        ordenCompraId: null,
        precioCostoAnterior: Number(previo.precioCosto),
        precioCostoNuevo: Number(data.precioCosto),
        precioVentaAnterior: Number(previo.precioVenta),
        precioVentaNuevo: Number(data.precioVenta),
        origen: 'EDICION_MANUAL',
        fechaRegistro: new Date().toISOString(),
        cantidadLote: null,
        proveedorNombre: null
      });
    }
    const actualizado = { ...previo, ...data, id: numId };
    productosMemoria.set(numId, actualizado);
    return actualizado;
  }),
  remove: mock.fn(),
  recalcularStock: mock.fn(async (id) => ({ id, stock: 10 })),
  findHistorialPreciosByProductoId: mock.fn(async (productoId) =>
    historialRegistros.filter((r) => r.productoId === Number(productoId))
  )
};

const categoriasRepoMock = {
  findById: mock.fn(async (id) => ({ id, nombre: 'Almacén', activo: true })),
  findByNombreInsensitive: mock.fn(async (nombre) => ({ id: 1, nombre, activo: true })),
  create: mock.fn(async (nombre) => ({ id: 1, nombre, activo: true }))
};

const tiposPromocionRepoMock = {
  findById: mock.fn(async (id) => ({ id, nombre: 'Descuento', activo: true })),
  findByNombreInsensitive: mock.fn(async (nombre) => ({ id: 1, nombre, activo: true })),
  findAll: mock.fn(async () => [{ id: 1, nombre: 'Descuento', activo: true }]),
  create: mock.fn(async (nombre) => ({ id: 1, nombre, activo: true }))
};

const proveedoresRepoMock = {
  findById: mock.fn(async (id) => ({ id, nombre: 'Proveedor Mayorista', activo: true })),
  findByNombreInsensitive: mock.fn(),
  create: mock.fn()
};

const ordenesCompraRepoMock = {
  findAll: mock.fn(),
  findHistorial: mock.fn(),
  findById: mock.fn(async (id) => ({
    id,
    fecha: '2026-11-18',
    total: 10000,
    activo: true,
    proveedor: { id: 1, nombre: 'Proveedor Mayorista', telefono: '1234567' },
    lotes: []
  })),
  create: mock.fn(async (data) => {
    const ordenId = 50;
    for (const lote of data.lotes) {
      if (lote.productoId) {
        const prod = productosMemoria.get(Number(lote.productoId));
        if (prod) {
          const costoAnterior = Number(prod.precioCosto);
          const ventaAnterior = Number(prod.precioVenta);
          const costoNuevo = Number(lote.nuevoPrecioCostoProducto ?? costoAnterior);
          const ventaNueva = Number(lote.nuevoPrecioVentaProducto ?? ventaAnterior);
          const cambioCosto = Math.abs(costoNuevo - costoAnterior) > 0.009;
          const cambioVenta = Math.abs(ventaNueva - ventaAnterior) > 0.009;

          if (cambioCosto || cambioVenta) {
            historialRegistros.unshift({
              id: historialRegistros.length + 1,
              productoId: prod.id,
              loteId: 100,
              ordenCompraId: ordenId,
              precioCostoAnterior: costoAnterior,
              precioCostoNuevo: costoNuevo,
              precioVentaAnterior: ventaAnterior,
              precioVentaNuevo: ventaNueva,
              origen: 'INGRESO_LOTE',
              fechaRegistro: new Date().toISOString(),
              cantidadLote: Number(lote.cantidad),
              proveedorNombre: 'Proveedor Mayorista'
            });
            productosMemoria.set(prod.id, {
              ...prod,
              precioCosto: costoNuevo,
              precioVenta: ventaNueva
            });
          }
        }
      }
    }
    return { id: ordenId, ...data };
  }),
  update: mock.fn(async (id, data) => {
    for (const lote of data.lotes ?? []) {
      if (lote.productoId) {
        const prod = productosMemoria.get(Number(lote.productoId));
        if (prod) {
          const costoAnterior = Number(prod.precioCosto);
          const ventaAnterior = Number(prod.precioVenta);
          const costoNuevo = Number(lote.nuevoPrecioCostoProducto ?? costoAnterior);
          const ventaNueva = Number(lote.nuevoPrecioVentaProducto ?? ventaAnterior);
          if (Math.abs(costoNuevo - costoAnterior) > 0.009 || Math.abs(ventaNueva - ventaAnterior) > 0.009) {
            historialRegistros.unshift({
              id: historialRegistros.length + 1,
              productoId: prod.id,
              loteId: 101,
              ordenCompraId: id,
              precioCostoAnterior: costoAnterior,
              precioCostoNuevo: costoNuevo,
              precioVentaAnterior: ventaAnterior,
              precioVentaNuevo: ventaNueva,
              origen: 'INGRESO_LOTE',
              fechaRegistro: new Date().toISOString(),
              cantidadLote: Number(lote.cantidad),
              proveedorNombre: 'Proveedor Mayorista'
            });
            productosMemoria.set(prod.id, {
              ...prod,
              precioCosto: costoNuevo,
              precioVenta: ventaNueva
            });
          }
        }
      }
    }
    return { id, ...data };
  }),
  remove: mock.fn()
};

const queriesCapturadas = [];
const mockClient = {
  query: mock.fn(async (sql, params = []) => {
    const limpio = String(sql).replace(/\s+/g, ' ').trim();
    queriesCapturadas.push({ sql: limpio, params });
    if (limpio.includes('information_schema')) {
      return { rows: [{ tiene_historial_precios: true }] };
    }
    if (limpio.startsWith('INSERT INTO ordenes_compra')) {
      return { rows: [{ id: 77, fecha: params[0], total: params[1], activo: true, proveedor_id: params[2] }] };
    }
    if (limpio.startsWith('SELECT id, precio_costo, precio_venta FROM productos')) {
      const prod = productosMemoria.get(Number(params[0]));
      return {
        rows: prod ? [{ id: prod.id, precio_costo: prod.precioCosto, precio_venta: prod.precioVenta }] : []
      };
    }
    if (limpio.startsWith('INSERT INTO lotes')) {
      return { rows: [{ id: 88 }] };
    }
    if (limpio.startsWith('SELECT id, producto_id, cantidad, cantidad_inicial FROM lotes')) {
      return { rows: [{ id: 80, producto_id: 1, cantidad: 5, cantidad_inicial: 5 }] };
    }
    return { rows: [], rowCount: 1 };
  }),
  release: mock.fn()
};

const poolMock = {
  connect: mock.fn(async () => mockClient),
  query: mock.fn(async (sql) => {
    const limpio = String(sql).replace(/\s+/g, ' ').trim();
    if (limpio.includes('FROM ordenes_compra oc')) {
      return {
        rows: [
          {
            id: 77,
            fecha: '2026-11-18',
            total: 25000,
            activo: true,
            proveedor_id: 1,
            proveedor_nombre: 'Proveedor Mayorista',
            proveedor_telefono: '1234567'
          }
        ]
      };
    }
    if (limpio.includes('FROM lotes l')) {
      return {
        rows: [
          {
            id: 88,
            cantidad: 20,
            cantidad_inicial: 20,
            total: 25000,
            fecha_arribo: '2026-11-18',
            fecha_vencimiento: '2027-11-18',
            activo: true,
            producto_id: 1,
            producto_nombre: 'Aceite Girasol 1.5L',
            producto_marca: 'Cocinero',
            producto_activo: true
          }
        ]
      };
    }
    return { rows: [] };
  })
};

mock.module('../src/config/db.js', { exports: { pool: poolMock } });
mock.module('../src/modules/productos/productos.repository.js', { exports: productosRepoMock });
mock.module('../src/modules/categorias/categorias.repository.js', { exports: categoriasRepoMock });
mock.module('../src/modules/tiposPromocion/tiposPromocion.repository.js', { exports: tiposPromocionRepoMock });
mock.module('../src/modules/proveedores/proveedores.repository.js', { exports: proveedoresRepoMock });

const realOrdenesCompraRepo = await import('../src/modules/ordenesCompra/ordenesCompra.repository.js');

mock.module('../src/modules/ordenesCompra/ordenesCompra.repository.js', { exports: ordenesCompraRepoMock });

const { crearProducto, actualizarProducto, obtenerHistorialPrecios } = await import(
  '../src/modules/productos/productos.service.js'
);
const { crearOrdenCompra, actualizarOrdenCompra } = await import(
  '../src/modules/ordenesCompra/ordenesCompra.service.js'
);
const productosController = await import('../src/modules/productos/productos.controller.js');

describe('Actualización de costo y venta de catálogo por ingreso de lote e historial de precios', () => {
  beforeEach(() => {
    historialRegistros.length = 0;
    productosMemoria.clear();
    queriesCapturadas.length = 0;
  });

  it('actualiza simultáneamente precioCosto y precioVenta del producto existente e inserta en historial_precios_producto', async () => {
    const prod = await crearProducto({
      nombre: 'Aceite Girasol 1.5L',
      precioCosto: 1000,
      precioVenta: 1500,
      categoriaId: 1
    });

    const orden = await crearOrdenCompra({
      fecha: '2026-11-18',
      proveedorId: 1,
      lotes: [
        {
          productoId: prod.id,
          cantidad: 20,
          nuevoPrecioCostoProducto: 1250,
          nuevoPrecioVentaProducto: 1850,
          fechaArribo: '2026-11-18',
          fechaVencimiento: '2027-11-18'
        }
      ]
    });

    assert.equal(orden.lotes[0].nuevoPrecioCostoProducto, 1250);
    assert.equal(orden.lotes[0].nuevoPrecioVentaProducto, 1850);
    assert.equal(orden.lotes[0].total, 25000);
    assert.equal(orden.total, 25000);
    assert.equal(productosMemoria.get(prod.id).precioCosto, 1250);
    assert.equal(productosMemoria.get(prod.id).precioVenta, 1850);

    const historial = await obtenerHistorialPrecios(prod.id);
    assert.equal(historial.length, 2);
    assert.equal(historial[0].origen, 'INGRESO_LOTE');
    assert.equal(historial[0].precioCostoAnterior, 1000);
    assert.equal(historial[0].precioCostoNuevo, 1250);
    assert.equal(historial[0].precioVentaAnterior, 1500);
    assert.equal(historial[0].precioVentaNuevo, 1850);
    assert.equal(historial[0].cantidadLote, 20);
    assert.equal(historial[0].proveedorNombre, 'Proveedor Mayorista');
    assert.equal(historial[1].origen, 'ALTA_PRODUCTO');
  });

  it('actualiza solo precioVenta cuando nuevoPrecioCostoProducto no varía y también soporta actualizarOrdenCompra', async () => {
    const prod = await crearProducto({
      nombre: 'Yerba Mate 1Kg',
      precioCosto: 1200,
      precioVenta: 2000,
      categoriaId: 1
    });

    await crearOrdenCompra({
      fecha: '2026-11-18',
      proveedorId: 1,
      lotes: [
        {
          productoId: prod.id,
          cantidad: 10,
          nuevoPrecioVentaProducto: 2300,
          fechaArribo: '2026-11-18',
          fechaVencimiento: '2027-11-18'
        }
      ]
    });

    assert.equal(productosMemoria.get(prod.id).precioCosto, 1200);
    assert.equal(productosMemoria.get(prod.id).precioVenta, 2300);

    await actualizarOrdenCompra(50, {
      fecha: '2026-11-18',
      proveedorId: 1,
      lotes: [
        {
          productoId: prod.id,
          cantidad: 10,
          nuevoPrecioCostoProducto: 1350,
          nuevoPrecioVentaProducto: 2500,
          fechaArribo: '2026-11-18',
          fechaVencimiento: '2027-11-18'
        }
      ]
    });

    assert.equal(productosMemoria.get(prod.id).precioCosto, 1350);
    assert.equal(productosMemoria.get(prod.id).precioVenta, 2500);
    const historial = await obtenerHistorialPrecios(prod.id);
    assert.equal(historial.length, 3);
    assert.equal(historial[0].precioCostoNuevo, 1350);
    assert.equal(historial[0].precioVentaNuevo, 2500);
  });

  it('ejecuta UPDATE productos SET precio_costo = $1, precio_venta = $2 WHERE id = $3 e INSERT INTO historial_precios_producto en ordenesCompra.repository', async () => {
    productosMemoria.set(1, {
      id: 1,
      nombre: 'Aceite Girasol 1.5L',
      precioCosto: 1000,
      precioVenta: 1500,
      activo: true
    });

    await realOrdenesCompraRepo.create({
      total: 25000,
      fecha: '2026-11-18',
      proveedor_id: 1,
      usuarioId: 1,
      lotes: [
        {
          productoId: 1,
          cantidad: 20,
          total: 25000,
          nuevoPrecioCostoProducto: 1250,
          nuevoPrecioVentaProducto: 1900,
          fechaArribo: '2026-11-18',
          fechaVencimiento: '2027-11-18'
        }
      ]
    });

    const queryUpdate = queriesCapturadas.find((q) =>
      q.sql.includes('UPDATE productos SET precio_costo = $1, precio_venta = $2 WHERE id = $3')
    );
    assert.ok(queryUpdate, 'Debe ejecutar UPDATE productos SET precio_costo = $1, precio_venta = $2 WHERE id = $3');
    assert.deepEqual(queryUpdate.params, [1250, 1900, 1]);

    const queryHist = queriesCapturadas.find((q) =>
      q.sql.startsWith('INSERT INTO historial_precios_producto')
    );
    assert.ok(queryHist, 'Debe insertar en historial_precios_producto');
    assert.deepEqual(queryHist.params, [1, 88, 77, 1000, 1250, 1500, 1900, 'INGRESO_LOTE', 1]);
  });

  it('usa precioCosto y precioVenta actuales cuando no se informan y rechaza valores <= 0 o <= precioPromo activo', async () => {
    const prod = await crearProducto({
      nombre: 'Alfajor Triple',
      precioCosto: 600,
      precioVenta: 1000,
      enPromocion: true,
      precioPromo: 800,
      categoriaId: 1
    });

    const orden = await crearOrdenCompra({
      fecha: '2026-11-18',
      proveedorId: 1,
      lotes: [
        {
          productoId: prod.id,
          cantidad: 10,
          fechaArribo: '2026-11-18',
          fechaVencimiento: '2027-08-01'
        }
      ]
    });

    assert.equal(orden.lotes[0].nuevoPrecioCostoProducto, 600);
    assert.equal(orden.lotes[0].nuevoPrecioVentaProducto, 1000);
    assert.equal(orden.lotes[0].total, 6000);

    await assert.rejects(
      () =>
        crearOrdenCompra({
          fecha: '2026-11-18',
          proveedorId: 1,
          lotes: [
            {
              productoId: prod.id,
              cantidad: 10,
              nuevoPrecioVentaProducto: 0,
              fechaArribo: '2026-11-18',
              fechaVencimiento: '2027-08-01'
            }
          ]
        }),
      { status: 400 }
    );

    await assert.rejects(
      () =>
        crearOrdenCompra({
          fecha: '2026-11-18',
          proveedorId: 1,
          lotes: [
            {
              productoId: prod.id,
              cantidad: 10,
              nuevoPrecioVentaProducto: 800,
              fechaArribo: '2026-11-18',
              fechaVencimiento: '2027-08-01'
            }
          ]
        }),
      { status: 400 }
    );
  });

  it('registra EDICION_MANUAL al editar costo o venta de un producto y responde en el controlador obtenerHistorialPrecios', async () => {
    const prod = await crearProducto({
      nombre: 'Fideos Tallarín',
      precioCosto: 500,
      precioVenta: 850,
      categoriaId: 1
    });

    await actualizarProducto(prod.id, {
      precioCosto: 550,
      precioVenta: 920
    });

    let jsonRespondido = null;
    const req = { params: { id: String(prod.id) } };
    const res = {
      json: (payload) => {
        jsonRespondido = payload;
      }
    };

    await productosController.obtenerHistorialPrecios(req, res, (err) => {
      throw err;
    });

    assert.ok(Array.isArray(jsonRespondido));
    assert.equal(jsonRespondido.length, 2);
    assert.equal(jsonRespondido[0].origen, 'EDICION_MANUAL');
    assert.equal(jsonRespondido[0].precioCostoAnterior, 500);
    assert.equal(jsonRespondido[0].precioCostoNuevo, 550);
    assert.equal(jsonRespondido[0].precioVentaAnterior, 850);
    assert.equal(jsonRespondido[0].precioVentaNuevo, 920);
  });

  it('devuelve 400 con ID inválido y 404 cuando el producto no existe en obtenerHistorialPrecios', async () => {
    await assert.rejects(() => obtenerHistorialPrecios('abc'), { status: 400 });
    await assert.rejects(() => obtenerHistorialPrecios(9999), { status: 404 });
  });
});
