-- ==========================================
-- 1. Tablas Independientes (Sin Foreign Keys)
-- ==========================================

-- Aseguramos que el teléfono pueda soportar números grandes (VARCHAR)
ALTER TABLE proveedores ALTER COLUMN telefono TYPE VARCHAR(20);

INSERT INTO proveedores (nombre, telefono) VALUES
('Arcor S.A.', '123'),
('Molinos Río de la Plata', '123'),
('Diarco Mayorista', '123');

INSERT INTO roles (correo, contraseña) VALUES
('admin@lafedistribuidora.com', 'admin123'),
('vendedor1@lafedistribuidora.com', 'ventas2026'),
('cliente_kiosco@gmail.com', 'kiosco22');

INSERT INTO productos (nombre, preciocosto, precioventa, marca, enpromocion, preciopromo, stock, categoria, peso) VALUES
('Galletas Surtidas', 800.00, 1200.00, 'Bagley', false, NULL, 150, 'Galletas', '400g'),
('Yerba Mate', 1500.00, 2200.00, 'Taragüí', true, 1950.00, 80, 'Infusiones', '1kg'),
('Aceite de Girasol', 950.00, 1400.00, 'Cocinero', false, NULL, 200, 'Almacén', '900ml'),
('Fideos Tallarines', 600.00, 900.00, 'Lucchetti', true, 800.00, 300, 'Pastas', '500g');


-- ==========================================
-- 2. Tablas con 1 Nivel de Dependencia
-- ==========================================

-- Las ordenes dependen de proveedores (id 1 y 2 creados arriba)
INSERT INTO ordenes_compra (cantidad, total, fecha, proveedor_id) VALUES
(500, 400000, '2026-10-10', 1), 
(200, 300000, '2026-10-12', 2); 

-- Los pedidos dependen de roles (id 3 creado arriba)
INSERT INTO pedidos (fecha, total, metodopago, comercio, modalidadentrega, direccion, estado, motivorechazo, roles_id) VALUES
('2026-10-13', 14000.00, 'Efectivo', 'Kiosco El Sol', 'Reparto', 'Av. Illia 123', 'Aprobado', NULL, 3),
('2026-10-14', 4400.00, 'Transferencia', 'Despensa María', 'Retiro', NULL, 'Pendiente', NULL, 3);


-- ==========================================
-- 3. Tablas con Múltiples Dependencias
-- ==========================================

-- Los lotes dependen de ordenes_compra y productos
INSERT INTO lotes (fechaarribo, fechavencimiento, ordencompra_id, producto_id) VALUES
('2026-10-11', '2027-05-10', 1, 1), 
('2026-10-13', '2028-10-01', 2, 2); 

-- Las ventas dependen de pedidos
INSERT INTO ventas (fecha, total, pedido_id) VALUES
('2026-10-13', 14000.00, 1);


-- Detalle de la venta 1: Vendemos 10 Galletas y 1 Yerba Mate
INSERT INTO tiene (cantidad, precio, producto_id, venta_id) VALUES
(10, 1200.00, 1, 1),
(1, 2200.00, 2, 1);