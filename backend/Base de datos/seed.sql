-- ============================================================================
-- SEED DE DEMOSTRACIÓN (MUESTRA INTEGRAL DEL SISTEMA)
-- Incluye: Proveedores, Usuarios, Categorías, Tipos de Promoción, Productos
-- (con imágenes locales existentes), Órdenes de Compra, Lotes (vigentes,
-- próximos a vencer, vencidos y agotados), Historial de Costos/Precios,
-- Pedidos (pendientes, aprobados y rechazados), Trazabilidad FIFO y Ventas.
-- ============================================================================

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

-- ============================================================================
-- 1. PROVEEDORES
-- ============================================================================
INSERT INTO proveedores (id, nombre, activo, telefono) VALUES
  (1, 'Distribuidora Arcor S.A.', true, '+542664523410'),
  (2, 'Molinos Dimaflo S.R.L.', true, '+542664889120'),
  (3, 'Lácteos La Serenísima', true, '+541143219876'),
  (4, 'Aceitera General Deheza', true, '+543584701122'),
  (5, 'Insumos del Sur S.A.', false, '+542664112233');

SELECT setval(pg_get_serial_sequence('proveedores', 'id'), COALESCE((SELECT MAX(id) FROM proveedores), 1), true);

-- ============================================================================
-- 2. USUARIOS
-- Contraseña de admin@lafedistribuidora.com: admin123
-- ============================================================================
INSERT INTO usuarios (id, correo, rol, activo, password) VALUES
  (1, 'admin@lafedistribuidora.com', 'admin', true, '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm'),
  (2, 'cliente1@gmail.com', 'cliente', true, '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm'),
  (3, 'panaderiasol@gmail.com', 'cliente', true, '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm'),
  (4, 'autoserviciocentro@gmail.com', 'cliente', true, '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm');

SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);

-- ============================================================================
-- 3. CATEGORÍAS
-- ============================================================================
INSERT INTO categorias (id, nombre, activo) VALUES
  (1, 'Cocina y Aceites', true),
  (2, 'Harinas y Panificados', true),
  (3, 'Lácteos', true),
  (4, 'Golosinas y Alfajores', true),
  (5, 'Almacén General', true);

SELECT setval(pg_get_serial_sequence('categorias', 'id'), COALESCE((SELECT MAX(id) FROM categorias), 1), true);

-- ============================================================================
-- 4. TIPOS DE PROMOCIÓN
-- ============================================================================
INSERT INTO tipos_promocion (id, nombre, activo) VALUES
  (1, 'Descuento', true);

SELECT setval(pg_get_serial_sequence('tipos_promocion', 'id'), COALESCE((SELECT MAX(id) FROM tipos_promocion), 1), true);

-- ============================================================================
-- 5. PRODUCTOS
-- Los primeros 4 productos utilizan imágenes reales presentes en backend/uploads/productos
-- ============================================================================
INSERT INTO productos (
  id, nombre, marca, descripcion, stock, precio_costo, precio_venta,
  en_promocion, precio_promo, categoria, categoria_id, tipo_promocion_id,
  imagen, destacado, visible_catalogo, activo
) VALUES
  (1, 'Aceite de Girasol 1.5L', 'Cocinero', 'Aceite de girasol puro alto rendimiento x 1.5 litros', 45, 1800.00, 2600.00,
   true, 2340.00, 'Cocina y Aceites', 1, 1,
   'imagesw.jpg', true, true, true),

  (2, 'Harina de Trigo 0000 25kg', 'Molino Dimaflo', 'Bolsa industrial de harina 0000 La Clásica x 25 kg para panadería', 28, 17500.00, 24000.00,
   false, NULL, 'Harinas y Panificados', 2, NULL,
   'Harina000.jpg', true, true, true),

  (3, 'Leche Larga Vida Clásica 1L', 'La Serenísima', 'Leche entera UAT fortificada con vitaminas A y D tenor graso 3%', 60, 950.00, 1450.00,
   true, 1232.50, 'Lácteos', 3, 1,
   'serenisima-clasica-751-95fea92d1a27f8e9ab15710914346750-640-0.webp', true, true, true),

  (4, 'Alfajor Negro Dulce de Leche 50g', 'Classic', 'Alfajor relleno con dulce de leche y baño de repostería semiamargo', 80, 480.00, 800.00,
   true, 680.00, 'Golosinas y Alfajores', 4, 1,
   'images.jpg', true, true, true),

  (5, 'Puré de Tomate 520g', 'Arcor', 'Puré de tomates seleccionados en envase tetra brik sin TACC', 50, 620.00, 980.00,
   false, NULL, 'Almacén General', 5, NULL,
   NULL, false, false, true),

  (6, 'Azúcar Común Tipo A 1kg', 'Ledesma', 'Paquete de azúcar blanca refinada x 1 kg', 40, 780.00, 1200.00,
   false, NULL, 'Almacén General', 5, NULL,
   NULL, false, false, true),

  (7, 'Dulce de Leche Repostero 400g', 'La Serenísima', 'Dulce de leche repostero ideal para confitería y panadería', 0, 1400.00, 2100.00,
   false, NULL, 'Lácteos', 3, NULL,
   NULL, false, false, true),

  (8, 'Margarina Vegetal 500g (Discontinuado)', 'Dánica', 'Margarina de mesa en pan x 500 gramos', 0, 900.00, 1400.00,
   false, NULL, 'Cocina y Aceites', 1, NULL,
   NULL, false, false, false);

SELECT setval(pg_get_serial_sequence('productos', 'id'), COALESCE((SELECT MAX(id) FROM productos), 1), true);

-- ============================================================================
-- 6. ÓRDENES DE COMPRA
-- ============================================================================
INSERT INTO ordenes_compra (id, fecha, total, activo, proveedor_id) VALUES
  (1, (CURRENT_DATE - INTERVAL '45 days')::date, 422000.00, true, 4),
  (2, (CURRENT_DATE - INTERVAL '35 days')::date, 525000.00, true, 2),
  (3, (CURRENT_DATE - INTERVAL '25 days')::date, 108500.00, true, 3),
  (4, (CURRENT_DATE - INTERVAL '15 days')::date, 92200.00, true, 1),
  (5, (CURRENT_DATE - INTERVAL '5 days')::date, 99200.00, true, 4),
  (6, (CURRENT_DATE - INTERVAL '20 days')::date, 31200.00, false, 1);

SELECT setval(pg_get_serial_sequence('ordenes_compra', 'id'), COALESCE((SELECT MAX(id) FROM ordenes_compra), 1), true);

-- ============================================================================
-- 7. LOTES
-- Incluye:
-- - Lotes agotados (consumidos por ventas previas)
-- - Lotes vigentes con vencimiento holgado
-- - Lotes próximos a vencer (en 4 y 9 días) para alertas de vencimiento
-- - Lote vencido (hace 3 días) con stock remanente para panel de vencidos
-- ============================================================================
INSERT INTO lotes (
  id, fecha_arribo, fecha_vencimiento, cantidad_inicial, cantidad, total,
  activo, orden_compra_id, producto_id
) VALUES
  -- OC 1 (Proveedor 4 - Aceitera)
  (1, (CURRENT_DATE - INTERVAL '45 days')::date, (CURRENT_DATE + INTERVAL '60 days')::date, 20, 0, 32000.00, true, 1, 1),
  (2, (CURRENT_DATE - INTERVAL '45 days')::date, (CURRENT_DATE + INTERVAL '90 days')::date, 25, 15, 42500.00, true, 1, 1),
  (3, (CURRENT_DATE - INTERVAL '45 days')::date, (CURRENT_DATE + INTERVAL '150 days')::date, 20, 10, 347500.00, true, 1, 2),

  -- OC 2 (Proveedor 2 - Molinos)
  (4, (CURRENT_DATE - INTERVAL '35 days')::date, (CURRENT_DATE + INTERVAL '180 days')::date, 30, 18, 525000.00, true, 2, 2),

  -- OC 3 (Proveedor 3 - La Serenísima): incluye lote próximo a vencer y lote vencido
  (5, (CURRENT_DATE - INTERVAL '25 days')::date, (CURRENT_DATE + INTERVAL '5 days')::date, 40, 20, 36000.00, true, 3, 3),
  (6, (CURRENT_DATE - INTERVAL '25 days')::date, (CURRENT_DATE + INTERVAL '45 days')::date, 50, 40, 47500.00, true, 3, 3),
  (7, (CURRENT_DATE - INTERVAL '25 days')::date, (CURRENT_DATE - INTERVAL '3 days')::date, 18, 8, 25000.00, true, 3, 7),

  -- OC 4 (Proveedor 1 - Arcor): incluye lote próximo a vencer
  (8, (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '9 days')::date, 100, 80, 48000.00, true, 4, 4),
  (9, (CURRENT_DATE - INTERVAL '15 days')::date, (CURRENT_DATE + INTERVAL '120 days')::date, 70, 50, 44200.00, true, 4, 5),

  -- OC 5 (Proveedor 4 - Aceitera)
  (10, (CURRENT_DATE - INTERVAL '5 days')::date, (CURRENT_DATE + INTERVAL '210 days')::date, 30, 30, 54000.00, true, 5, 1),
  (11, (CURRENT_DATE - INTERVAL '5 days')::date, (CURRENT_DATE + INTERVAL '240 days')::date, 58, 40, 45200.00, true, 5, 6),

  -- OC 6 (Anulada)
  (12, (CURRENT_DATE - INTERVAL '20 days')::date, (CURRENT_DATE + INTERVAL '60 days')::date, 40, 40, 31200.00, false, 6, 6);

SELECT setval(pg_get_serial_sequence('lotes', 'id'), COALESCE((SELECT MAX(id) FROM lotes), 1), true);

-- ============================================================================
-- 8. HISTORIAL DE PRECIOS POR PRODUCTO
-- Muestra la trazabilidad de costos y precios de venta por alta, ingreso de lote
-- y ediciones manuales.
-- ============================================================================
INSERT INTO historial_precios_producto (
  id, producto_id, lote_id, orden_compra_id,
  precio_costo_anterior, precio_costo_nuevo,
  precio_venta_anterior, precio_venta_nuevo,
  origen, fecha_registro, usuario_id
) VALUES
  -- Producto 1: Aceite Cocinero (evolución en 3 etapas)
  (1, 1, 1, 1, NULL, 1600.00, NULL, 2300.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '45 days')::timestamp + INTERVAL '09:00:00', 1),
  (2, 1, 2, 1, 1600.00, 1700.00, 2300.00, 2450.00, 'INGRESO_LOTE', (CURRENT_DATE - INTERVAL '30 days')::timestamp + INTERVAL '11:15:00', 1),
  (3, 1, 10, 5, 1700.00, 1800.00, 2450.00, 2600.00, 'INGRESO_LOTE', (CURRENT_DATE - INTERVAL '5 days')::timestamp + INTERVAL '10:30:00', 1),

  -- Producto 2: Harina 0000 25kg (evolución en 2 etapas)
  (4, 2, 3, 1, NULL, 16500.00, NULL, 22500.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '45 days')::timestamp + INTERVAL '09:30:00', 1),
  (5, 2, 4, 2, 16500.00, 17500.00, 22500.00, 24000.00, 'INGRESO_LOTE', (CURRENT_DATE - INTERVAL '35 days')::timestamp + INTERVAL '14:20:00', 1),

  -- Producto 3: Leche La Serenísima 1L (alta + ajuste por lote + edición manual)
  (6, 3, 5, 3, NULL, 900.00, NULL, 1350.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '25 days')::timestamp + INTERVAL '08:45:00', 1),
  (7, 3, 6, 3, 900.00, 950.00, 1350.00, 1400.00, 'INGRESO_LOTE', (CURRENT_DATE - INTERVAL '20 days')::timestamp + INTERVAL '16:00:00', 1),
  (8, 3, NULL, NULL, 950.00, 950.00, 1400.00, 1450.00, 'EDICION_MANUAL', (CURRENT_DATE - INTERVAL '10 days')::timestamp + INTERVAL '12:10:00', 1),

  -- Resto de productos
  (9, 4, 8, 4, NULL, 480.00, NULL, 800.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '15 days')::timestamp + INTERVAL '10:00:00', 1),
  (10, 5, 9, 4, NULL, 620.00, NULL, 980.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '15 days')::timestamp + INTERVAL '10:05:00', 1),
  (11, 6, 11, 5, NULL, 780.00, NULL, 1200.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '5 days')::timestamp + INTERVAL '11:00:00', 1),
  (12, 7, 7, 3, NULL, 1400.00, NULL, 2100.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '25 days')::timestamp + INTERVAL '09:10:00', 1),
  (13, 8, NULL, NULL, NULL, 900.00, NULL, 1400.00, 'ALTA_PRODUCTO', (CURRENT_DATE - INTERVAL '50 days')::timestamp + INTERVAL '08:00:00', 1);

SELECT setval(pg_get_serial_sequence('historial_precios_producto', 'id'), COALESCE((SELECT MAX(id) FROM historial_precios_producto), 1), true);

-- ============================================================================
-- 9. PEDIDOS
-- Incluye:
-- - 4 pedidos APROBADOS (consolidan ventas en el mes anterior y mes actual)
-- - 3 pedidos PENDIENTES (listos para aprobar o rechazar en vivo durante la demo)
-- - 1 pedido RECHAZADO (con motivo de rechazo para mostrar en el historial)
-- ============================================================================
INSERT INTO pedidos (
  id, fecha, subtotal, envio, total, total_modificado, motivo_modificacion,
  metodo_pago, telefono, comercio, persona_contacto, modalidad_entrega,
  direccion, descripcion_direccion, observaciones, estado, motivo_rechazo,
  activo, usuario_id
) VALUES
  -- Pedidos Aprobados (generan Ventas)
  (1, (CURRENT_DATE - INTERVAL '38 days')::date, 290400.00, 0.00, 290400.00, NULL, NULL,
   'Transferencia', '+542664334455', 'Panadería El Sol', 'Carlos Méndez', 'Delivery',
   'Av. Illia 452', 'Local esquina con toldo amarillo', 'Entregar por portón lateral antes de las 11 hs', 'aprobado', NULL, true, 3),

  (2, (CURRENT_DATE - INTERVAL '18 days')::date, 296575.00, 0.00, 296575.00, 285000.00, 'Bonificación por pago contado efectivo',
   'Efectivo', '+542664778899', 'Autoservicio Centro', 'Lucía Fernández', 'Delivery',
   'Rivadavia 845', 'Frente a la plaza principal', 'Llamar al llegar', 'aprobado', NULL, true, 4),

  (3, (CURRENT_DATE - INTERVAL '7 days')::date, 57700.00, 0.00, 57700.00, NULL, NULL,
   'Transferencia', '+542664119988', 'Despensa San Martín', 'Roberto Gómez', 'Retiro',
   NULL, NULL, 'Retira por depósito con flete propio', 'aprobado', NULL, true, 2),

  (4, (CURRENT_DATE - INTERVAL '2 days')::date, 64800.00, 0.00, 64800.00, NULL, NULL,
   'Efectivo', '+542664334455', 'Panadería El Sol', 'Carlos Méndez', 'Delivery',
   'Av. Illia 452', 'Local esquina con toldo amarillo', 'Pedido semanal habitual', 'aprobado', NULL, true, 3),

  -- Pedido Rechazado (para historial)
  (5, (CURRENT_DATE - INTERVAL '10 days')::date, 21000.00, 0.00, 21000.00, NULL, NULL,
   'Efectivo', '+542664990011', 'Kiosco La Terminal', 'Mariano Díaz', 'Delivery',
   'Ruta 7 Km 780', 'Puesto azul junto a parada', 'Entrega urgente a medianoche', 'rechazado',
   'Fuera del radio y horario de reparto habilitado por la distribuidora', true, 2),

  -- Pedidos Pendientes (para gestionar en vivo en el Panel Admin > Pedidos)
  (6, CURRENT_DATE, 46800.00, 0.00, 46800.00, NULL, NULL,
   'Transferencia', '+542664778899', 'Autoservicio Centro', 'Lucía Fernández', 'Delivery',
   'Rivadavia 845', 'Frente a la plaza principal', 'Recibir entre las 14 y 17 hs', 'pendiente', NULL, true, 4),

  (7, CURRENT_DATE, 60325.00, 0.00, 60325.00, NULL, NULL,
   'Efectivo', '+542664334455', 'Panadería El Sol', 'Carlos Méndez', 'Retiro',
   NULL, NULL, 'Pasa a retirar a las 16:00 hs', 'pendiente', NULL, true, 3),

  (8, CURRENT_DATE, 23200.00, 0.00, 23200.00, NULL, NULL,
   'Efectivo', '+542664556677', 'Minimercado Los Andes', 'Sofía Peralta', 'Delivery',
   'Pringles 1120', 'Puerta de rejas blanca', 'Avisar por WhatsApp 15 min antes', 'pendiente', NULL, true, 2);

SELECT setval(pg_get_serial_sequence('pedidos', 'id'), COALESCE((SELECT MAX(id) FROM pedidos), 1), true);

-- ============================================================================
-- 10. TIENE (ÍTEMS POR PEDIDO)
-- ============================================================================
INSERT INTO tiene (pedido_id, producto_id, cantidad, precio, activo) VALUES
  -- Pedido 1 (Aprobado: 20 Aceites a $2340 + 10 Harinas a $24000 + 2 Dulce de Leche a $1800 = $290400)
  (1, 1, 20, 2340.00, true),
  (1, 2, 10, 24000.00, true),
  (1, 7, 2, 1800.00, true),

  -- Pedido 2 (Aprobado: 10 Harinas a $24000 + 30 Leches a $1232.50 + 20 Puré de Tomate a $980 = $296575)
  (2, 2, 10, 24000.00, true),
  (2, 3, 30, 1232.50, true),
  (2, 5, 20, 980.00, true),

  -- Pedido 3 (Aprobado: 10 Aceites a $2340 + 20 Alfajores a $680 + 18 Azúcar a $1150 = $57700)
  (3, 1, 10, 2340.00, true),
  (3, 4, 20, 680.00, true),
  (3, 6, 18, 1150.00, true),

  -- Pedido 4 (Aprobado: 2 Harinas a $24000 + 8 Dulce de Leche a $2100 = $64800)
  (4, 2, 2, 24000.00, true),
  (4, 7, 8, 2100.00, true),

  -- Pedido 5 (Rechazado)
  (5, 7, 10, 2100.00, true),

  -- Pedido 6 (Pendiente: 20 Aceites a $2340 = $46800)
  (6, 1, 20, 2340.00, true),

  -- Pedido 7 (Pendiente: 2 Harinas a $24000 + 10 Leches a $1232.50 = $60325)
  (7, 2, 2, 24000.00, true),
  (7, 3, 10, 1232.50, true),

  -- Pedido 8 (Pendiente: 20 Alfajores a $680 + 8 Azúcar a $1200 = $23200)
  (8, 4, 20, 680.00, true),
  (8, 6, 8, 1200.00, true);

-- ============================================================================
-- 11. TRAZABILIDAD DE LOTES POR PEDIDO (pedido_lotes)
-- Registra de qué lote salieron las unidades de los pedidos aprobados
-- ============================================================================
INSERT INTO pedido_lotes (id, pedido_id, producto_id, lote_id, cantidad, consumido_entero) VALUES
  (1, 1, 1, 1, 20, true),
  (2, 1, 2, 3, 10, false),
  (3, 1, 7, 7, 2, false),
  (4, 2, 2, 4, 10, false),
  (5, 2, 3, 5, 20, false),
  (6, 2, 3, 6, 10, false),
  (7, 2, 5, 9, 20, false),
  (8, 3, 1, 2, 10, false),
  (9, 3, 4, 8, 20, false),
  (10, 3, 6, 11, 18, false),
  (11, 4, 2, 4, 2, false),
  (12, 4, 7, 7, 8, false);

SELECT setval(pg_get_serial_sequence('pedido_lotes', 'id'), COALESCE((SELECT MAX(id) FROM pedido_lotes), 1), true);

-- ============================================================================
-- 12. VENTAS CONSOLIDADAS
-- ============================================================================
INSERT INTO ventas (id, fecha, total, total_modificado, motivo_modificacion, activo, pedido_id) VALUES
  (1, (CURRENT_DATE - INTERVAL '38 days')::date, 290400.00, NULL, NULL, true, 1),
  (2, (CURRENT_DATE - INTERVAL '18 days')::date, 296575.00, 285000.00, 'Bonificación por pago contado efectivo', true, 2),
  (3, (CURRENT_DATE - INTERVAL '7 days')::date, 57700.00, NULL, NULL, true, 3),
  (4, (CURRENT_DATE - INTERVAL '2 days')::date, 64800.00, NULL, NULL, true, 4);

SELECT setval(pg_get_serial_sequence('ventas', 'id'), COALESCE((SELECT MAX(id) FROM ventas), 1), true);

COMMIT;
