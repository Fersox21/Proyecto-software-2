import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { validarIdEnteroPositivo } from '../src/utils/validaciones.js';
import { obtenerProductoPorId } from '../src/modules/productos/productos.service.js';
import { obtenerProveedorPorId } from '../src/modules/proveedores/proveedores.service.js';
import { obtenerOrdenCompraPorId } from '../src/modules/ordenesCompra/ordenesCompra.service.js';
import { obtenerPedidoPorId, obtenerLotesDisponibles } from '../src/modules/pedidos/pedidos.service.js';
import { obtenerVenta } from '../src/modules/ventas/ventas.service.js';
import { obtenerRolPorId } from '../src/modules/roles/roles.service.js';
import { obtenerTienePorId } from '../src/modules/tiene/tiene.service.js';
import { obtenerCategoriaPorId } from '../src/modules/categorias/categorias.service.js';
import { obtenerTipoPromocionPorId } from '../src/modules/tiposPromocion/tiposPromocion.service.js';
import { obtenerLotePorId } from '../src/modules/lotes/lotes.service.js';

describe('validarIdEnteroPositivo', () => {
  it('acepta enteros positivos válidos', () => {
    assert.equal(validarIdEnteroPositivo(1), 1);
    assert.equal(validarIdEnteroPositivo('42'), 42);
    assert.equal(validarIdEnteroPositivo(' 7 '), 7);
  });

  for (const invalido of ['abc', '0', 0, '-5', -1, '1.5', 1.5, '1e2', '999999999999', '', null, undefined, {}, []]) {
    it(`rechaza ${JSON.stringify(invalido)} con status 400`, () => {
      assert.throws(() => validarIdEnteroPositivo(invalido), (err) => err.status === 400);
    });
  }
});

describe('Todos los módulos rechazan :id inválido con 400 antes de consultar PostgreSQL', () => {
  const operaciones = [
    ['productos', () => obtenerProductoPorId('abc')],
    ['proveedores', () => obtenerProveedorPorId('0')],
    ['ordenesCompra', () => obtenerOrdenCompraPorId('-3')],
    ['pedidos (obtener)', () => obtenerPedidoPorId('1.5')],
    ['pedidos (lotes-disponibles)', () => obtenerLotesDisponibles('abc')],
    ['ventas', () => obtenerVenta('abc')],
    ['roles', () => obtenerRolPorId('-1')],
    ['tiene', () => obtenerTienePorId('abc')],
    ['categorias', () => obtenerCategoriaPorId('0')],
    ['tiposPromocion', () => obtenerTipoPromocionPorId('abc')],
    ['lotes', () => obtenerLotePorId('999999999999')]
  ];

  for (const [nombre, fn] of operaciones) {
    it(`${nombre} responde 400 para :id inválido`, async () => {
      await assert.rejects(fn, (err) => err.status === 400);
    });
  }
});
