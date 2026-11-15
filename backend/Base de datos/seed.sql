/*ESTO ES PARA BORRAR TODOS LOS DATOS DE LAS TABLAS*/
TRUNCATE TABLE tiene,
ventas,
lotes,
pedidos,
ordenes_compra,
productos,
usuarios,
proveedores RESTART IDENTITY CASCADE;
/*Inserciones*/
-- 1. Instancias para Proveedores
-- 1. Proveedores
-- 1. Proveedores
-- 1. Proveedores
INSERT INTO proveedores (nombre, activo, telefono) VALUES
('Molinos del Sur S.A.', true, '+541145550101'),
('Distribuidora Arcor', true, '+541145550102'),
('Lácteos La Serenísima', true, '+541145550103'),
('Insumos El Campo', false, '+541145550104');

-- 2. Usuarios
INSERT INTO usuarios (correo, rol, activo, password) VALUES
('admin@lafedistribuidora.com', 'admin', true, '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm'),
('cliente1@gmail.com', 'cliente', true, '$2b$10$e88z0s.4x5T3sH9f8g7h6e5d4c3b2a1o0p9q8r7s6t5u4v3w2x1y0'),
('cliente2@gmail.com', 'cliente', true, '$2b$10$z99a1t.5y6U4tI0g9h8i7f6e5d4c3b2a1o0p9q8r7s6t5u4v3w2');

-- 3. Productos (peso en gramos / mililitros como INTEGER)
INSERT INTO productos (nombre, precio_costo, precio_venta, marca, en_promocion, precio_promo, stock, categoria, peso, destacado, activo) VALUES
('Harina 0000 1kg', 450.00, 750.00, 'Favorita', false, NULL, 120, 'Almacén', 1000, true, true),
('Leche Entera 1L', 600.00, 950.00, 'La Serenísima', true, 850.00, 50, 'Lácteos', 1000, true, true),
('Aceite Girasol 1.5L', 1200.00, 1850.00, 'Natura', false, NULL, 80, 'Almacén', 1500, false, true),
('Mozzarella 500g', 2100.00, 3100.00, 'Barraza', true, 2800.00, 30, 'Frescos', 500, true, true),
('Puré Tomate 520g', 350.00, 580.00, 'Noel', false, NULL, 200, 'Enlatados', 520, false, true);

-- 4. Órdenes de Compra (Asociadas al Proveedor)
INSERT INTO ordenes_compra (fecha, total, activo, proveedor_id) VALUES
('2026-10-01', 225000.00, true, 1),
('2026-10-10', 120000.00, true, 3),
('2026-10-15', 420000.00, true, 2),
('2026-11-01', 210000.00, true, 3);

-- 5. Lotes (Vincular la OC con el Producto correspondientes)
INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad, activo, orden_compra_id, producto_id) VALUES
('2026-10-03', '2027-04-03', 300, true, 1, 1),
('2026-10-11', '2026-11-25', 200, true, 2, 2),
('2026-10-17', '2027-10-17', 350, true, 3, 3),
('2026-11-02', '2026-12-15', 100, false, 4, 4);

-- 6. Pedidos (Asociados al Usuario / usuario_id)
INSERT INTO pedidos (fecha, subtotal, envio, total, metodo_pago, telefono, comercio, persona_contacto, modalidad_entrega, direccion, descripcion_direccion, observaciones, estado, motivo_rechazo, activo, usuario_id) VALUES
('2026-11-05', 2550.00, 0, 2550.00, 'Efectivo', '2664123456', 'La Fe Distribuidora', 'Pedro Álvarez', 'Delivery', 'Av. San Martín 1234', 'Portón negro', NULL, 'entregado', NULL, true, 2),
('2026-11-06', 5650.00, 0, 5650.00, 'Transferencia', '2664567890', 'La Fe Distribuidora', 'María Gómez', 'Retiro', NULL, NULL, 'Retira a las 10 hs', 'aprobado', NULL, true, 3),
('2026-11-07', 1850.00, 0, 1850.00, 'Mercado Pago', '2664987654', 'La Fe Distribuidora', 'Juan Pérez', 'Delivery', 'Calle Belgrano 456', NULL, 'Llamar antes de llegar', 'pendiente', NULL, true, 2),
('2026-11-08', 3100.00, 0, 3100.00, 'Efectivo', '2664112233', 'La Fe Distribuidora', 'Ana Ruiz', 'Delivery', 'Rivadavia 789', NULL, NULL, 'rechazado', 'Sin stock suficiente', true, 3);

-- 7. Tabla intermedia Tiene
INSERT INTO tiene (pedido_id, producto_id, cantidad, precio, activo) VALUES
(1, 2, 2, 850.00, true),
(1, 1, 1, 850.00, true),
(2, 4, 1, 2800.00, true),
(2, 5, 3, 580.00, true),
(2, 3, 1, 1110.00, true),
(3, 3, 1, 1850.00, true),
(4, 4, 1, 3100.00, true);

-- 8. Ventas (Consolidación de Pedidos)
INSERT INTO ventas (fecha, total, activo, pedido_id) VALUES
('2026-11-05', 2550.00, true, 1),
('2026-11-06', 5650.00, true, 2);
