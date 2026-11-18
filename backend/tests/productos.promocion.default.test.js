import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

const productosRepoMock = {
  findAll: mock.fn(),
  findHistorial: mock.fn(),
  findAllCatalogo: mock.fn(),
  findById: mock.fn(),
  create: mock.fn(async (data) => data),
  update: mock.fn(async (_id, data) => data),
  remove: mock.fn()
};

const categoriasRepoMock = {
  findById: mock.fn(async (id) => ({ id, nombre: 'Almacén', activo: true })),
  findByNombreInsensitive: mock.fn(async (nombre) => ({ id: 1, nombre, activo: true })),
  create: mock.fn(async (nombre) => ({ id: 1, nombre, activo: true }))
};

const tiposPromocionRepoMock = {
  findById: mock.fn(async (id) => {
    if (id === 1) return { id: 1, nombre: 'Descuento directo', activo: false };
    if (id === 4) return { id: 4, nombre: 'Descuento', activo: true };
    return null;
  }),
  findByNombreInsensitive: mock.fn(async (nombre) => {
    if (nombre.toLowerCase() === 'descuento') return { id: 4, nombre: 'Descuento', activo: true };
    if (nombre.toLowerCase() === 'descuento directo') return { id: 1, nombre: 'Descuento directo', activo: false };
    return null;
  }),
  create: mock.fn(async (nombre) => ({ id: 5, nombre, activo: true }))
};

const proveedoresRepoMock = {
  findById: mock.fn(async (id) => ({ id, nombre: 'Proveedor Test', activo: true })),
  findByNombreInsensitive: mock.fn(),
  create: mock.fn()
};

const ordenesCompraRepoMock = {
  findAll: mock.fn(),
  findHistorial: mock.fn(),
  findById: mock.fn(),
  create: mock.fn(async (data) => ({ id: 99, ...data })),
  update: mock.fn(),
  remove: mock.fn()
};

mock.module('../src/modules/productos/productos.repository.js', { exports: productosRepoMock });
mock.module('../src/modules/categorias/categorias.repository.js', { exports: categoriasRepoMock });
mock.module('../src/modules/tiposPromocion/tiposPromocion.repository.js', { exports: tiposPromocionRepoMock });
mock.module('../src/modules/proveedores/proveedores.repository.js', { exports: proveedoresRepoMock });
mock.module('../src/modules/ordenesCompra/ordenesCompra.repository.js', { exports: ordenesCompraRepoMock });

const { crearProducto, actualizarProducto } = await import('../src/modules/productos/productos.service.js');
const { crearOrdenCompra } = await import('../src/modules/ordenesCompra/ordenesCompra.service.js');

const productoBase = () => ({
  nombre: 'Yerba Mate',
  precioCosto: 500,
  precioVenta: 900,
  marca: 'Marca',
  enPromocion: true,
  precioPromo: 800,
  categoria: 'Almacén',
  destacado: false
});

describe('Promoción por defecto en productos', () => {
  beforeEach(() => {
    productosRepoMock.create.mock.resetCalls();
    productosRepoMock.update.mock.resetCalls();
    productosRepoMock.findById.mock.resetCalls();
  });

  it('asigna el tipo de promoción por defecto cuando enPromocion es true y no se envía tipoPromocionId', async () => {
    const res = await crearProducto(productoBase());
    assert.equal(res.enPromocion, true);
    assert.equal(res.precioPromo, 800);
    assert.equal(res.tipoPromocionId, 4);
  });

  it('acepta tipoPromocionId: 1 cuando se envía explícitamente', async () => {
    const res = await crearProducto({ ...productoBase(), tipoPromocionId: 1 });
    assert.equal(res.enPromocion, true);
    assert.equal(res.tipoPromocionId, 1);
  });

  it('mantiene tipoPromocionId = null y precioPromo = null cuando enPromocion es false', async () => {
    const res = await crearProducto({
      ...productoBase(),
      enPromocion: false,
      precioPromo: 800,
      tipoPromocionId: 1
    });
    assert.equal(res.enPromocion, false);
    assert.equal(res.precioPromo, null);
    assert.equal(res.tipoPromocionId, null);
  });

  it('asigna tipo por defecto al activar promoción en actualizarProducto y limpia al desactivar', async () => {
    productosRepoMock.findById.mock.mockImplementationOnce(async () => ({
      id: 10,
      nombre: 'Yerba Mate',
      precioCosto: 500,
      precioVenta: 900,
      marca: 'Marca',
      enPromocion: false,
      precioPromo: null,
      tipoPromocionId: null,
      stock: 5,
      categoria: 'Almacén',
      categoriaId: 1,
      destacado: false,
      visibleCatalogo: false,
      tieneLoteVigente: false
    }));

    const activado = await actualizarProducto(10, { enPromocion: true, precioPromo: 720 });
    assert.equal(activado.enPromocion, true);
    assert.equal(activado.precioPromo, 720);
    assert.equal(activado.tipoPromocionId, 4);

    productosRepoMock.findById.mock.mockImplementationOnce(async () => ({
      id: 10,
      nombre: 'Yerba Mate',
      precioCosto: 500,
      precioVenta: 900,
      marca: 'Marca',
      enPromocion: true,
      precioPromo: 720,
      tipoPromocionId: 4,
      stock: 5,
      categoria: 'Almacén',
      categoriaId: 1,
      destacado: false,
      visibleCatalogo: false,
      tieneLoteVigente: false
    }));

    const desactivado = await actualizarProducto(10, { enPromocion: false });
    assert.equal(desactivado.enPromocion, false);
    assert.equal(desactivado.precioPromo, null);
    assert.equal(desactivado.tipoPromocionId, null);
  });

  it('rechaza precioPromo >= precioVenta o descuento menor a 1% o >= 100%', async () => {
    await assert.rejects(
      () => crearProducto({ ...productoBase(), precioPromo: 900 }),
      { status: 400 }
    );
    await assert.rejects(
      () => crearProducto({ ...productoBase(), precioPromo: 899.99 }),
      { status: 400 }
    );
    await assert.rejects(
      () => crearProducto({ ...productoBase(), precioPromo: 0.01 }),
      { status: 400 }
    );
  });
});

describe('Promoción por defecto en órdenes de compra (productoNuevo)', () => {
  beforeEach(() => {
    ordenesCompraRepoMock.create.mock.resetCalls();
  });

  const payloadOrden = (productoNuevo) => ({
    fecha: '2026-11-18',
    proveedorId: 1,
    total: 4000,
    lotes: [
      {
        cantidad: 10,
        fechaArribo: '2026-11-18',
        fechaVencimiento: '2027-06-01',
        productoNuevo: {
          nombre: 'Azúcar',
          precioCosto: 400,
          precioVenta: 800,
          categoriaId: 1,
          ...productoNuevo
        }
      }
    ]
  });

  it('asigna tipoPromocionId por defecto cuando productoNuevo tiene enPromocion: true sin tipoPromocionId', async () => {
    const orden = await crearOrdenCompra(payloadOrden({ enPromocion: true, precioPromo: 640 }));
    const nuevo = orden.lotes[0].productoNuevo;
    assert.equal(nuevo.enPromocion, true);
    assert.equal(nuevo.precioPromo, 640);
    assert.equal(nuevo.tipoPromocionId, 4);
  });

  it('acepta tipoPromocionId: 1 en productoNuevo con enPromocion: true', async () => {
    const orden = await crearOrdenCompra(payloadOrden({ enPromocion: true, precioPromo: 640, tipoPromocionId: 1 }));
    const nuevo = orden.lotes[0].productoNuevo;
    assert.equal(nuevo.enPromocion, true);
    assert.equal(nuevo.tipoPromocionId, 1);
  });

  it('mantiene tipoPromocionId = null y precioPromo = null cuando enPromocion es false', async () => {
    const orden = await crearOrdenCompra(payloadOrden({ enPromocion: false, precioPromo: 640, tipoPromocionId: 1 }));
    const nuevo = orden.lotes[0].productoNuevo;
    assert.equal(nuevo.enPromocion, false);
    assert.equal(nuevo.precioPromo, null);
    assert.equal(nuevo.tipoPromocionId, null);
  });

  it('rechaza precioPromo inválido en productoNuevo con enPromocion: true', async () => {
    await assert.rejects(
      () => crearOrdenCompra(payloadOrden({ enPromocion: true, precioPromo: 800 })),
      { status: 400 }
    );
    await assert.rejects(
      () => crearOrdenCompra(payloadOrden({ enPromocion: true, precioPromo: 799.99 })),
      { status: 400 }
    );
  });
});
