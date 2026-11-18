import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPool = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
}));

vi.mock('../src/config/db.js', () => ({ pool: mockPool }));
vi.mock('../src/modules/productos/productos.repository.js', () => ({
  findById: vi.fn(),
  recalcularStock: vi.fn(),
  create: vi.fn(),
}));
vi.mock('../src/modules/ordenesCompra/ordenesCompra.repository.js', () => ({
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  findAll: vi.fn(),
  findHistorial: vi.fn(),
}));
vi.mock('../src/modules/proveedores/proveedores.repository.js', () => ({
  findById: vi.fn(),
  findByNombreInsensitive: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));
vi.mock('../src/modules/categorias/categorias.repository.js', () => ({
  findById: vi.fn(),
  findByNombreInsensitive: vi.fn(),
  create: vi.fn(),
}));
vi.mock('../src/modules/tiposPromocion/tiposPromocion.repository.js', () => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  findByNombreInsensitive: vi.fn(),
  create: vi.fn(),
}));
vi.mock('../src/modules/productos/productos.imagen.js', () => ({
  eliminarImagenFisica: vi.fn(),
}));

import * as lotesRepo from '../src/modules/lotes/lotes.repository.js';
import * as lotesService from '../src/modules/lotes/lotes.service.js';
import * as ordenesController from '../src/modules/ordenesCompra/ordenesCompra.controller.js';
import * as ordenesService from '../src/modules/ordenesCompra/ordenesCompra.service.js';
import * as ordenesRepo from '../src/modules/ordenesCompra/ordenesCompra.repository.js';
import * as productosRepo from '../src/modules/productos/productos.repository.js';
import * as productosService from '../src/modules/productos/productos.service.js';
import * as proveedoresRepo from '../src/modules/proveedores/proveedores.repository.js';
import * as proveedoresService from '../src/modules/proveedores/proveedores.service.js';
import * as categoriasRepo from '../src/modules/categorias/categorias.repository.js';
import * as tiposPromocionRepo from '../src/modules/tiposPromocion/tiposPromocion.repository.js';
import * as ventasRepo from '../src/modules/ventas/ventas.repository.js';
import * as pedidosRepo from '../src/modules/pedidos/pedidos.repository.js';
import * as tieneRepo from '../src/modules/tiene/tiene.repository.js';
import * as tieneService from '../src/modules/tiene/tiene.service.js';
import { eliminarImagenFisica } from '../src/modules/productos/productos.imagen.js';
import { precioVigente } from '../src/modules/productos/productos.precio.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

describe('Fixes 1, 3, 4 y 5 en lotes y órdenes de compra', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Fix 1: lotes.repository.update preserva cantidad_inicial cuando el lote ya tuvo salidas', async () => {
    const client = {
      query: vi.fn(async (sql) => {
        if (sql.includes('FOR UPDATE')) {
          return { rows: [{ cantidad: 60, cantidad_inicial: 100, producto_id: 1 }] };
        }
        return { rows: [] };
      }),
      release: vi.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(client);
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, cantidad: 60, cantidad_inicial: 100 }] });

    await lotesRepo.update(1, {
      cantidad: 60,
      total: 500,
      fechaArribo: '2026-11-18',
      fechaVencimiento: '2027-01-01',
    });

    const updateCall = client.query.mock.calls.find(([sql]) => sql.includes('UPDATE lotes'));
    expect(updateCall[0]).toContain('CASE WHEN cantidad = cantidad_inicial THEN $1 ELSE cantidad_inicial END');
    expect(updateCall[0]).toContain('WHERE id = $5 AND activo = true');
  });

  it('Fix 3: crearLote rechaza orden o producto inactivo con 400', async () => {
    ordenesRepo.findById.mockResolvedValueOnce({ id: 1, activo: false, fecha: '2026-11-01' });
    productosRepo.findById.mockResolvedValueOnce({ id: 2, activo: true, precioCosto: 10 });

    await expect(
      lotesService.crearLote({
        cantidad: 5,
        fechaArribo: '2026-11-18',
        fechaVencimiento: '2027-01-01',
        ordenCompra: 1,
        producto: 2,
      })
    ).rejects.toMatchObject({ status: 400 });

    ordenesRepo.findById.mockResolvedValueOnce({ id: 1, activo: true, fecha: '2026-11-01' });
    productosRepo.findById.mockResolvedValueOnce({ id: 2, activo: false, precioCosto: 10 });

    await expect(
      lotesService.crearLote({
        cantidad: 5,
        fechaArribo: '2026-11-18',
        fechaVencimiento: '2027-01-01',
        ordenCompra: 1,
        producto: 2,
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('Fix 3: actualizarOrdenCompra rechaza orden dada de baja (activo: false) con 404', async () => {
    ordenesRepo.findById.mockResolvedValueOnce({ id: 1, activo: false, total: 100, fecha: '2026-11-18' });

    await expect(ordenesService.actualizarOrdenCompra(1, { total: 200 })).rejects.toMatchObject({ status: 404 });
  });

  it('Fix 4: ordenesCompra.controller.actualizar rechaza body undefined, null, array o datos duplicado con 400', async () => {
    for (const body of [undefined, null, [], 'texto', { datos: ['{}', '{}'] }]) {
      const next = vi.fn();
      await ordenesController.actualizar({ params: { id: '1' }, body }, { json: vi.fn() }, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toMatchObject({ status: 400 });
    }
  });

  it('Fix 5: rechaza strings masivos, null bytes, tipos no string y overflow INT4 / DECIMAL(10,2) con 400', async () => {
    await expect(lotesService.obtenerLotePorId('9999999999')).rejects.toMatchObject({ status: 400 });

    ordenesRepo.findById.mockResolvedValue({ id: 1, activo: true, fecha: '2026-11-01' });
    productosRepo.findById.mockResolvedValue({ id: 2, activo: true, precioCosto: 10 });

    await expect(
      lotesService.crearLote({
        cantidad: 2147483648,
        fechaArribo: '2026-11-18',
        fechaVencimiento: '2027-01-01',
        ordenCompra: 1,
        producto: 2,
      })
    ).rejects.toMatchObject({ status: 400 });

    proveedoresRepo.findById.mockResolvedValue({ id: 1, activo: true });
    categoriasRepo.findById.mockResolvedValue({ id: 1, activo: true });

    await expect(
      ordenesService.crearOrdenCompra({
        proveedorId: 1,
        fecha: '2026-11-18',
        lotes: [
          {
            cantidad: 1,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoNuevo: {
              nombre: 'A'.repeat(101),
              precioCosto: 10,
              precioVenta: 20,
              categoriaId: 1,
            },
          },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      ordenesService.crearOrdenCompra({
        proveedorId: 1,
        fecha: '2026-11-18',
        lotes: [
          {
            cantidad: 1,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoNuevo: {
              nombre: 'Prod\u0000Mal',
              precioCosto: 10,
              precioVenta: 20,
              categoriaId: 1,
            },
          },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      ordenesService.crearOrdenCompra({
        proveedorId: 1,
        fecha: '2026-11-18',
        lotes: [
          {
            cantidad: 1,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoNuevo: {
              nombre: 'Prod OK',
              marca: { objeto: true },
              precioCosto: 10,
              precioVenta: 20,
              categoriaId: 1,
            },
          },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      ordenesService.crearOrdenCompra({
        proveedorId: 1,
        fecha: '2026-11-18',
        lotes: [
          {
            cantidad: 1,
            total: 1e20,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoId: 2,
          },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('Fix 5: errorHandler oculta mensajes internos en errores 500', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    errorHandler(new Error('value too long for type character varying(25)'), {}, { status }, vi.fn());

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: 'Error interno del servidor',
      message: 'Error interno del servidor',
      statusCode: 500,
    });
    consoleSpy.mockRestore();
  });

  it('Fix 7: rechaza montos positivos menores a 0.005 que redondearían a 0', async () => {
    ordenesRepo.findById.mockResolvedValue({ id: 1, activo: true, total: 100, fecha: '2026-11-18' });
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          cantidad: 5,
          total: 100,
          fecha_arribo: '2026-11-18',
          fecha_vencimiento: '2027-01-01',
          orden_fecha: '2026-11-18',
        },
      ],
    });

    await expect(lotesService.actualizarLote(1, { total: 0.001 })).rejects.toMatchObject({ status: 400 });
    productosRepo.findById.mockResolvedValue({ id: 2, activo: true, precioCosto: 10 });
    await expect(
      ordenesService.actualizarOrdenCompra(1, {
        lotes: [
          {
            cantidad: 1,
            total: 0.001,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoId: 2,
          },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('Fix 10: rechaza tipoPromocionId inactivo aunque sea el id por defecto', async () => {
    proveedoresRepo.findById.mockResolvedValue({ id: 1, activo: true });
    categoriasRepo.findById.mockResolvedValue({ id: 1, activo: true });
    tiposPromocionRepo.findById.mockResolvedValue({ id: 1, activo: false });

    await expect(
      ordenesService.crearOrdenCompra({
        proveedorId: 1,
        fecha: '2026-11-18',
        lotes: [
          {
            cantidad: 1,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoNuevo: {
              nombre: 'Promo Test',
              precioCosto: 10,
              precioVenta: 100,
              enPromocion: true,
              precioPromo: 80,
              tipoPromocionId: 1,
              categoriaId: 1,
            },
          },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('Fix 11: crearOrdenCompra limpia archivos subidos que no corresponden a ningún productoNuevo', async () => {
    proveedoresRepo.findById.mockResolvedValue({ id: 1, activo: true });
    productosRepo.findById.mockResolvedValue({ id: 2, activo: true, precioCosto: 10 });
    ordenesRepo.create.mockResolvedValue({ id: 99, total: 10 });

    const archivos = [
      { fieldname: 'basura_1', filename: 'basura1.png' },
      { fieldname: 'imagenProducto_0', filename: 'no_usada.png' },
    ];

    await ordenesService.crearOrdenCompra(
      {
        proveedorId: 1,
        fecha: '2026-11-18',
        lotes: [
          {
            cantidad: 1,
            fechaArribo: '2026-11-18',
            fechaVencimiento: '2027-01-01',
            productoId: 2,
          },
        ],
      },
      archivos
    );

    expect(eliminarImagenFisica).toHaveBeenCalledWith('basura1.png');
    expect(eliminarImagenFisica).toHaveBeenCalledWith('no_usada.png');
  });

  it('Fix 13: actualizarOrdenCompra permite conservar el proveedor viejo aunque esté inactivo', async () => {
    ordenesRepo.findById.mockResolvedValue({
      id: 1,
      activo: true,
      total: 100,
      fecha: '2026-11-18',
      proveedor: { id: 7, nombre: 'Viejo', activo: false },
    });
    proveedoresRepo.findById.mockResolvedValue({ id: 7, nombre: 'Viejo', activo: false });
    ordenesRepo.update.mockResolvedValue({ id: 1, total: 100, proveedor: { id: 7 } });

    await expect(
      ordenesService.actualizarOrdenCompra(1, { proveedorId: 7, fecha: '2026-11-18' })
    ).resolves.toMatchObject({ id: 1 });

    // Pero sí rechaza cambiar a OTRO proveedor inactivo
    proveedoresRepo.findById.mockResolvedValue({ id: 8, nombre: 'Otro Inactivo', activo: false });
    await expect(
      ordenesService.actualizarOrdenCompra(1, { proveedorId: 8, fecha: '2026-11-18' })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('Proveedores: rechaza crear o renombrar a un nombre duplicado con 409 (y en proveedorNuevo de orden)', async () => {
    proveedoresRepo.findByNombreInsensitive.mockResolvedValueOnce({ id: 3, nombre: 'Central', activo: true });
    await expect(
      proveedoresService.crearProveedor({ nombre: '  central ', telefono: '+5491122334455' })
    ).rejects.toMatchObject({ status: 409 });

    proveedoresRepo.findById.mockResolvedValueOnce({ id: 4, nombre: 'Otro', telefono: '1234567' });
    proveedoresRepo.findByNombreInsensitive.mockResolvedValueOnce({ id: 3, nombre: 'Central', activo: true });
    await expect(
      proveedoresService.actualizarProveedor(4, { nombre: 'Central' })
    ).rejects.toMatchObject({ status: 409 });

    proveedoresRepo.findByNombreInsensitive.mockResolvedValueOnce({ id: 3, nombre: 'Central', activo: true });
    await expect(
      ordenesService.crearOrdenCompra({
        proveedorNuevo: { nombre: 'Central', telefono: '1234567' },
        fecha: '2026-11-18',
        lotes: [{ cantidad: 1, fechaArribo: '2026-11-18', fechaVencimiento: '2027-01-01', productoId: 2 }],
      })
    ).rejects.toMatchObject({ status: 409 });
  });

  it('Audit Fix 1: eliminar venta o pedido restaura stock en lotes desde pedido_lotes', async () => {
    const client = {
      query: vi.fn(async (sql) => {
        if (sql.includes('FROM ventas WHERE id = $1')) {
          return { rows: [{ id: 10, pedido_id: 20 }] };
        }
        if (sql.includes('UPDATE ventas SET activo = false')) {
          return { rowCount: 1 };
        }
        if (sql.includes('FROM pedido_lotes')) {
          return { rows: [{ lote_id: 5, producto_id: 2, cantidad: 4 }] };
        }
        return { rows: [], rowCount: 1 };
      }),
      release: vi.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(client);

    const borrada = await ventasRepo.remove(10);
    expect(borrada).toBe(1);
    expect(client.query.mock.calls.some(([sql]) => sql.includes('LEAST(cantidad + $1, cantidad_inicial)'))).toBe(true);
    expect(client.query.mock.calls.some(([sql]) => sql.includes('DELETE FROM pedido_lotes WHERE pedido_id = $1'))).toBe(true);
    expect(productosRepo.recalcularStock).toHaveBeenCalledWith(2, client);

    const clientPedido = {
      query: vi.fn(async (sql) => {
        if (sql.includes('FROM pedidos WHERE id = $1')) {
          return { rows: [{ id: 20 }] };
        }
        if (sql.includes('UPDATE pedidos SET activo = false')) {
          return { rowCount: 1 };
        }
        if (sql.includes('FROM pedido_lotes')) {
          return { rows: [{ lote_id: 5, producto_id: 2, cantidad: 4 }] };
        }
        return { rows: [], rowCount: 1 };
      }),
      release: vi.fn(),
    };
    mockPool.connect.mockResolvedValueOnce(clientPedido);

    const pedidoBorrado = await pedidosRepo.remove(20);
    expect(pedidoBorrado).toBe(1);
    expect(clientPedido.query.mock.calls.some(([sql]) => sql.includes('UPDATE ventas SET activo = false WHERE pedido_id = $1'))).toBe(true);
    expect(productosRepo.recalcularStock).toHaveBeenCalledWith(2, clientPedido);
  });

  it('Audit Fix 2: tiene.service usa precioVigente, valida stock y rechaza productos inactivos', async () => {
    vi.spyOn(pedidosRepo, 'findById').mockResolvedValue({
      id: 1,
      activo: true,
      estado: 'pendiente',
      envio: 0,
    });
    vi.spyOn(pedidosRepo, 'update').mockResolvedValue({});
    vi.spyOn(tieneRepo, 'findByPedido').mockResolvedValue([{ precio: 801, cantidad: 2, activo: true }]);
    vi.spyOn(tieneRepo, 'findByPedidoYProducto').mockResolvedValue({
      pedido_id: 1,
      producto_id: 2,
      cantidad: 2,
      precio: 801,
      activo: true,
    });
    const updateSpy = vi.spyOn(tieneRepo, 'update').mockResolvedValue({ pedido_id: 1, producto_id: 2, cantidad: 3, precio: 801 });

    productosRepo.findById.mockResolvedValue({
      id: 2,
      activo: true,
      stock: 5,
      precioVenta: 900,
      precioPromo: 800,
      enPromocion: true,
    });

    await tieneService.actualizarTiene({ pedido_id: 1, producto_id: 2, cantidad: 3 });
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ cantidad: 3, precio: 801 }));

    await expect(
      tieneService.actualizarTiene({ pedido_id: 1, producto_id: 2, cantidad: 10 })
    ).rejects.toMatchObject({ status: 409 });
  });

  it('Audit Fix 4: actualizarOrdenCompra sin lotes conserva total existente; lotes.repository recalcula total de la orden', async () => {
    ordenesRepo.findById.mockResolvedValue({ id: 1, activo: true, total: 1500, fecha: '2026-11-18' });
    ordenesRepo.update.mockResolvedValue({ id: 1, total: 1500 });

    await ordenesService.actualizarOrdenCompra(1, { total: 0.01, fecha: '2026-11-18' });
    expect(ordenesRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ total: 1500 }));
  });

  it('Audit Fix 5 y 6: precioVigente normaliza promo igual que frontend y productos.service valida ID/longitudes en PUT e imagen', async () => {
    expect(precioVigente({ precioVenta: 900, precioPromo: 800, enPromocion: true })).toBe(801);

    await expect(productosService.subirImagenProducto('abc', { filename: 'x.jpg' })).rejects.toMatchObject({ status: 400 });
    expect(eliminarImagenFisica).toHaveBeenCalledWith('x.jpg');

    productosRepo.findById.mockResolvedValueOnce({ id: 1, activo: true, nombre: 'Ok', precioCosto: 10, precioVenta: 20 });
    await expect(productosService.actualizarProducto(1, { nombre: 'A'.repeat(101) })).rejects.toMatchObject({ status: 400 });

    productosRepo.findById.mockResolvedValueOnce({ id: 1, activo: true, nombre: 'Ok', precioCosto: 10, precioVenta: 20 });
    await expect(productosService.actualizarProducto(1, { marca: 'B'.repeat(26) })).rejects.toMatchObject({ status: 400 });
  });

  it('Audit Fix 8: crearPedido rechaza suma de ítems duplicados que excede MAX_INT4', async () => {
    productosRepo.findById.mockResolvedValue({ id: 2, activo: true, precioVenta: 10, enPromocion: false });
    vi.doMock('../src/modules/roles/roles.repository.js', () => ({
      findById: vi.fn(async () => ({ id: 2 })),
    }));
    const { crearPedido } = await import('../src/modules/pedidos/pedidos.service.js');

    await expect(
      crearPedido({
        nombreComercio: 'Comercio',
        telefono: '1234567',
        modalidadEntrega: 'retiro',
        items: [
          { productoId: 2, cantidad: 2147483647 },
          { productoId: 2, cantidad: 1 },
        ],
      })
    ).rejects.toMatchObject({ status: 400 });
  });
});
