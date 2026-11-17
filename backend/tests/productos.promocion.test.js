import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  porcentajeDescuento,
  precioConDescuento,
  precioVigente
} from '../src/modules/productos/productos.precio.js';
import { crearProductosService } from '../src/modules/productos/productos.service.js';

const productoBase = () => ({
  nombre: 'Producto de prueba',
  precioCosto: 500,
  precioVenta: 900,
  marca: 'Marca',
  enPromocion: true,
  precioPromo: 800,
  stock: 10,
  categoria: 'Almacén',
  destacado: false
});

const categoriasMock = {
  findByNombreInsensitive: async (nombre) => ({ id: 1, nombre, activo: true }),
  findById: async (id) => ({ id, nombre: 'Almacén', activo: true }),
  create: async (nombre) => ({ id: 1, nombre, activo: true })
};

describe('regla de promoción', () => {
  it('convierte venta 900 y promo 800 en un 11% exacto (801)', () => {
    assert.equal(porcentajeDescuento(900, 800), 11);
    assert.equal(precioConDescuento(900, 11), 801);
    assert.equal(precioVigente({ precioVenta: 900, precioPromo: 800, enPromocion: true }), 801);
  });

  it('normaliza otras promociones sin perder el porcentaje entero', () => {
    assert.equal(precioVigente({ precioVenta: 950, precioPromo: 850, enPromocion: true }), 845.5);
    assert.equal(precioVigente({ precioVenta: 3100, precioPromo: 2800, enPromocion: true }), 2790);
  });

  it('ignora la promoción cuando el flag está apagado', () => {
    assert.equal(precioVigente({ precioVenta: 900, precioPromo: 800, enPromocion: false }), 900);
  });

  it('rechaza descuentos que no se pueden representar como entero >= 1% y < 100%', () => {
    assert.equal(porcentajeDescuento(900, 900), null);
    assert.equal(porcentajeDescuento(900, 899.99), null);
    assert.equal(porcentajeDescuento(900, 1000), null);
    assert.equal(porcentajeDescuento(900, 0), null);
  });
});

describe('crearProducto', () => {
  it('guarda el precio promocional normalizado al porcentaje entero y unifica ruta de imagen', async () => {
    let guardado = null;
    const service = crearProductosService({
      repository: {
        create: async (data) => {
          guardado = data;
          return data;
        }
      },
      categoriasRepository: categoriasMock
    });

    await service.crearProducto(productoBase(), { filename: 'foto-test.jpg' });

    assert.equal(guardado.precioVenta, 900);
    assert.equal(guardado.precioPromo, 801);
    assert.equal(guardado.descuento, 11);
    assert.equal(guardado.stock, 0);
    assert.equal(guardado.imagen, '/uploads/productos/foto-test.jpg');
  });

  it('rechaza una promoción igual o mayor al precio de venta', async () => {
    let creado = false;
    const service = crearProductosService({
      repository: {
        create: async () => {
          creado = true;
        }
      },
      categoriasRepository: categoriasMock
    });

    await assert.rejects(
      () => service.crearProducto({ ...productoBase(), precioPromo: 900 }),
      (err) => err.status === 400
    );
    assert.equal(creado, false);
  });

  it('rechaza una promo con menos de 1% de descuento', async () => {
    const service = crearProductosService({
      repository: { create: async (data) => data },
      categoriasRepository: categoriasMock
    });

    await assert.rejects(
      () => service.crearProducto({ ...productoBase(), precioPromo: 899.99 }),
      (err) => err.status === 400
    );
  });
});

describe('actualizarProducto', () => {
  const existente = {
    id: 1,
    nombre: 'Producto de prueba',
    precioCosto: 500,
    precioVenta: 900,
    marca: 'Marca',
    enPromocion: true,
    precioPromo: 801,
    descuento: 11,
    stock: 10,
    categoria: 'Almacén',
    categoriaId: 1,
    destacado: false,
    visibleCatalogo: false,
    tieneLoteVigente: false
  };

  it('recalcula la promo al cambiar el precio de venta e ignora alteración manual de stock', async () => {
    let actualizado = null;
    const service = crearProductosService({
      repository: {
        findById: async () => ({ ...existente }),
        update: async (id, data) => {
          actualizado = { id, data };
          return data;
        }
      },
      categoriasRepository: categoriasMock
    });

    await service.actualizarProducto(1, { precioVenta: 1000, stock: 9999 });

    assert.equal(actualizado.id, 1);
    assert.equal(actualizado.data.precioVenta, 1000);
    assert.equal(actualizado.data.precioPromo, 800);
    assert.equal(actualizado.data.descuento, 20);
    assert.equal(actualizado.data.stock, 10);
  });

  it('rechaza una actualización que deja la promo inválida', async () => {
    let llamadoUpdate = false;
    const service = crearProductosService({
      repository: {
        findById: async () => ({ ...existente }),
        update: async () => {
          llamadoUpdate = true;
        }
      },
      categoriasRepository: categoriasMock
    });

    await assert.rejects(
      () => service.actualizarProducto(1, { precioVenta: 800 }),
      (err) => err.status === 400
    );
    assert.equal(llamadoUpdate, false);
  });
});
