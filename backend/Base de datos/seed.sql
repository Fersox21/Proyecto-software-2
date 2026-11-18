-- Script generado automáticamente con las instancias actuales de la BD
-- Fecha de exportación: 2026-11-18T03:22:31.535Z

BEGIN;

TRUNCATE TABLE
  historial_precios_producto,
  pedido_lotes,
  tiene,
  ventas,
  lotes,
  pedidos,
  ordenes_compra,
  productos,
  tipos_promocion,
  categorias,
  usuarios,
  proveedores
RESTART IDENTITY CASCADE;

-- proveedores (1 registros)
INSERT INTO proveedores (id, nombre, activo, telefono) VALUES
  (1, 'Arcor', true, '266523452');
SELECT setval(pg_get_serial_sequence('proveedores', 'id'), COALESCE((SELECT MAX(id) FROM proveedores), 1), (SELECT COUNT(*) > 0 FROM proveedores));

-- usuarios (3 registros)
INSERT INTO usuarios (id, correo, rol, activo, password) VALUES
  (1, 'admin@lafedistribuidora.com', 'admin', true, '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm'),
  (2, 'cliente1@gmail.com', 'cliente', true, '$2b$10$e88z0s.4x5T3sH9f8g7h6e5d4c3b2a1o0p9q8r7s6t5u4v3w2x1y0'),
  (3, 'cliente2@gmail.com', 'cliente', true, '$2b$10$z99a1t.5y6U4tI0g9h8i7f6e5d4c3b2a1o0p9q8r7s6t5u4v3w2');
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), (SELECT COUNT(*) > 0 FROM usuarios));

-- categorias (2 registros)
INSERT INTO categorias (id, nombre, activo) VALUES
  (1, 'Cocina', true),
  (2, 'Almacen', true);
SELECT setval(pg_get_serial_sequence('categorias', 'id'), COALESCE((SELECT MAX(id) FROM categorias), 1), (SELECT COUNT(*) > 0 FROM categorias));

-- tipos_promocion (0 registros)
-- tipos_promocion: sin registros
SELECT setval(pg_get_serial_sequence('tipos_promocion', 'id'), COALESCE((SELECT MAX(id) FROM tipos_promocion), 1), (SELECT COUNT(*) > 0 FROM tipos_promocion));

-- productos (3 registros)
INSERT INTO productos (id, nombre, marca, descripcion, stock, precio_costo, precio_venta, en_promocion, precio_promo, categoria, categoria_id, tipo_promocion_id, imagen, destacado, visible_catalogo, activo) VALUES
  (1, 'Aceite', 'Cocinero', '900ml', 1, 1000, 1600, false, NULL, 'Cocina', 1, NULL, 'producto-nuevo-1794971098153-382802.jpg', true, true, true),
  (7, 'Alfajor', 'Rasta', '250gr', 7, 500, 1000, true, 900, 'Almacen', 2, NULL, 'producto-nuevo-1794971669111-909626.jpg', true, true, true),
  (8, 'Harina 000', 'Molino', '20Kg', 10, 20000, 25000, false, NULL, 'Almacen', 2, NULL, 'producto-nuevo-1794971669112-59498.jpg', true, true, true);
SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1), (SELECT COUNT(*) > 0 FROM productos));

-- ordenes_compra (2 registros)
INSERT INTO ordenes_compra (id, fecha, total, activo, proveedor_id) VALUES
  (1, '2026-11-10', 2000, true, 1),
  (7, '2026-11-12', 203500, true, 1);
SELECT setval(pg_get_serial_sequence('ordenes_compra', 'id'), COALESCE((SELECT MAX(id) FROM ordenes_compra), 1), (SELECT COUNT(*) > 0 FROM ordenes_compra));

-- pedidos (1 registros)
INSERT INTO pedidos (id, fecha, subtotal, envio, total, total_modificado, motivo_modificacion, metodo_pago, telefono, comercio, persona_contacto, modalidad_entrega, direccion, descripcion_direccion, observaciones, estado, motivo_rechazo, activo, usuario_id) VALUES
  (1, '2026-11-18', 1600, 0, 1600, 1400, 'Promocion', 'Efectivo', '254453345', 'Panaderia', 'Juan', 'Delivery', 'Rivadavia 145', 'Casa Azul', 'Entre 2 y 6 pm', 'aprobado', NULL, true, 2);
SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1), (SELECT COUNT(*) > 0 FROM pedidos));

-- lotes (3 registros)
INSERT INTO lotes (id, fecha_arribo, fecha_vencimiento, cantidad_inicial, cantidad, total, activo, orden_compra_id, producto_id) VALUES
  (1, '2026-11-10', '2026-11-18', 2, 1, 2000, true, 1, 1),
  (2, '2026-11-12', '2026-11-19', 7, 7, 3500, true, 7, 7),
  (3, '2026-11-12', '2026-11-21', 10, 10, 200000, true, 7, 8);
SELECT setval(pg_get_serial_sequence('lotes', 'id'), COALESCE((SELECT MAX(id) FROM lotes), 1), (SELECT COUNT(*) > 0 FROM lotes));

-- ventas (1 registros)
INSERT INTO ventas (id, fecha, total, total_modificado, motivo_modificacion, activo, pedido_id) VALUES
  (1, '2026-11-18', 1600, 1400, 'Promocion', true, 1);
SELECT setval(pg_get_serial_sequence('ventas', 'id'), COALESCE((SELECT MAX(id) FROM ventas), 1), (SELECT COUNT(*) > 0 FROM ventas));

-- tiene (1 registros)
INSERT INTO tiene (cantidad, precio, activo, producto_id, pedido_id) VALUES
  (1, 1600, true, 1, 1);

-- pedido_lotes (1 registros)
INSERT INTO pedido_lotes (id, pedido_id, producto_id, lote_id, cantidad, consumido_entero) VALUES
  (1, 1, 1, 1, 1, false);
SELECT setval(pg_get_serial_sequence('pedido_lotes', 'id'), COALESCE((SELECT MAX(id) FROM pedido_lotes), 1), (SELECT COUNT(*) > 0 FROM pedido_lotes));

-- historial_precios_producto (4 registros)
INSERT INTO historial_precios_producto (id, producto_id, lote_id, orden_compra_id, precio_costo_anterior, precio_costo_nuevo, precio_venta_anterior, precio_venta_nuevo, origen, fecha_registro, usuario_id) VALUES
  (1, 1, 1, 1, NULL, 900.00, NULL, 1500.00, 'ALTA_PRODUCTO', '2026-11-10 09:00:00', 1),
  (2, 1, 1, 1, 900.00, 1000.00, 1500.00, 1600.00, 'INGRESO_LOTE', '2026-11-10 10:30:00', 1),
  (3, 7, 2, 7, NULL, 500.00, NULL, 1000.00, 'ALTA_PRODUCTO', '2026-11-12 09:15:00', 1),
  (4, 8, 3, 7, NULL, 20000.00, NULL, 25000.00, 'ALTA_PRODUCTO', '2026-11-12 09:20:00', 1);
SELECT setval(pg_get_serial_sequence('historial_precios_producto', 'id'), COALESCE((SELECT MAX(id) FROM historial_precios_producto), 1), (SELECT COUNT(*) > 0 FROM historial_precios_producto));

COMMIT;
