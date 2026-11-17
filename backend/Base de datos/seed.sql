BEGIN;

TRUNCATE TABLE
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

-- 3. Categorías
INSERT INTO categorias (nombre) VALUES
('Almacén'),
('Lácteos'),
('Frescos'),
('Enlatados');

-- 4. Tipos de Promoción
INSERT INTO tipos_promocion (nombre) VALUES
('Descuento directo'),
('Liquidación por vencimiento'),
('2x1');

-- 5. Productos (los 5 productos quedan vinculados a su lote en el paso 7)
INSERT INTO productos (nombre, descripcion, precio_costo, precio_venta, marca, en_promocion, precio_promo, stock, categoria, categoria_id, tipo_promocion_id, imagen, destacado, visible_catalogo, activo) VALUES
('Harina 0000 1kg', 'Harina de trigo refinada tipo 0000', 450.00, 750.00, 'Favorita', false, NULL, 120, 'Almacén', 1, NULL, NULL, true, false, true),
('Leche Entera 1L', 'Leche entera larga vida', 600.00, 950.00, 'La Serenísima', true, 845.50, 50, 'Lácteos', 2, 1, NULL, true, false, true),
('Aceite Girasol 1.5L', 'Aceite de girasol puro', 1200.00, 1850.00, 'Natura', false, NULL, 80, 'Almacén', 1, NULL, NULL, false, false, true),
('Mozzarella 500g', 'Queso mozzarella en barra', 2100.00, 3100.00, 'Barraza', true, 2790.00, 30, 'Frescos', 3, 1, NULL, true, false, true),
('Puré Tomate 520g', 'Puré de tomate en tetra brik', 350.00, 580.00, 'Noel', false, NULL, 200, 'Enlatados', 4, NULL, NULL, false, false, true);

-- Normalización de promociones a porcentaje entero (1% a 99%)
UPDATE productos
SET precio_promo = ROUND(
      precio_venta * (1 - ROUND((1 - precio_promo / precio_venta) * 100) / 100),
      2
    )
WHERE en_promocion = true
  AND precio_promo IS NOT NULL
  AND precio_promo > 0
  AND precio_promo < precio_venta
  AND ROUND((1 - precio_promo / precio_venta) * 100) BETWEEN 1 AND 99;

-- 6. Órdenes de Compra (cada una vinculada a su Proveedor y consistente con el total de sus lotes)
INSERT INTO ordenes_compra (fecha, total, activo, proveedor_id) VALUES
('2026-10-01', 205000.00, true, 1), -- Lote 1 ($135.000) + Lote 5 ($70.000)
('2026-10-10', 120000.00, true, 3), -- Lote 2 ($120.000)
('2026-10-15', 420000.00, true, 2), -- Lote 3 ($420.000)
('2026-11-01', 210000.00, true, 3); -- Lote 4 ($210.000)

-- 7. Lotes (cada Producto tiene al menos 1 Lote, y cada Lote pertenece a una OC con Proveedor)
INSERT INTO lotes (fecha_arribo, fecha_vencimiento, cantidad_inicial, cantidad, total, activo, orden_compra_id, producto_id) VALUES
('2026-10-03', '2027-04-03', 300, 300, 135000.00, true, 1, 1),
('2026-10-11', '2026-11-25', 200, 200, 120000.00, true, 2, 2),
('2026-10-17', '2027-10-17', 350, 350, 420000.00, true, 3, 3),
('2026-11-02', '2026-12-15', 100, 100, 210000.00, false, 4, 4),
('2026-10-03', '2027-06-15', 200, 200,  70000.00, true, 1, 5);

-- 8. Pedidos
INSERT INTO pedidos (fecha, subtotal, envio, total, metodo_pago, telefono, comercio, persona_contacto, modalidad_entrega, direccion, descripcion_direccion, observaciones, estado, motivo_rechazo, activo, usuario_id) VALUES
('2026-11-05', 2550.00, 0, 2550.00, 'Efectivo', '2664123456', 'La Fe Distribuidora', 'Pedro Álvarez', 'Delivery', 'Av. San Martín 1234', 'Portón negro', NULL, 'entregado', NULL, true, 2),
('2026-11-06', 5650.00, 0, 5650.00, 'Transferencia', '2664567890', 'La Fe Distribuidora', 'María Gómez', 'Retiro', NULL, NULL, 'Retira a las 10 hs', 'aprobado', NULL, true, 3),
('2026-11-07', 1850.00, 0, 1850.00, 'Mercado Pago', '2664987654', 'La Fe Distribuidora', 'Juan Pérez', 'Delivery', 'Calle Belgrano 456', NULL, 'Llamar antes de llegar', 'pendiente', NULL, true, 2),
('2026-11-08', 3100.00, 0, 3100.00, 'Efectivo', '2664112233', 'La Fe Distribuidora', 'Ana Ruiz', 'Delivery', 'Rivadavia 789', NULL, NULL, 'rechazado', 'Sin stock suficiente', true, 3);

-- 9. Tabla intermedia Tiene (Item)
INSERT INTO tiene (pedido_id, producto_id, cantidad, precio, activo) VALUES
(1, 2, 2, 850.00, true),
(1, 1, 1, 850.00, true),
(2, 4, 1, 2800.00, true),
(2, 5, 3, 580.00, true),
(2, 3, 1, 1110.00, true),
(3, 3, 1, 1850.00, true),
(4, 4, 1, 3100.00, true);

-- 10. Ventas (Consolidación 0..1 de Pedidos)
INSERT INTO ventas (fecha, total, activo, pedido_id) VALUES
('2026-11-05', 2550.00, true, 1),
('2026-11-06', 5650.00, true, 2);

COMMIT;