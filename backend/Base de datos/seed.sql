/*ESTO ES PARA BORRAR TODOS LOS DATOS DE LAS TABLAS*/
TRUNCATE TABLE tiene,
ventas,
lotes,
pedidos,
ordenes_compra,
productos,
roles,
proveedores RESTART IDENTITY CASCADE;
/*Inserciones*/
INSERT INTO proveedores (nombre, telefono)
VALUES ('Arcor S.A.', '123'),
    ('Molinos Río de la Plata', '123'),
    ('Diarco Mayorista', '123');
INSERT INTO roles (correo, password)
VALUES (
        'admin@lafedistribuidora.com',
        '$2b$10$iOHyUoB1PPs4CBhfwDVmhOcB.WdMn9PpcDfB.GTKbMJMzIQQg/jwm'
    );
INSERT INTO productos (
        nombre,
        precio_costo,
        precio_venta,
        marca,
        en_promocion,
        precio_promo,
        stock,
        categoria,
        peso,
        destacado
    )
VALUES (
        'Galletas Surtidas',
        800.00,
        1200.00,
        'Bagley',
        false,
        NULL,
        150,
        'Galletas',
        '400g',
        false
    ),
    (
        'Yerba Mate',
        1500.00,
        2200.00,
        'Taragüí',
        true,
        1950.00,
        80,
        'Infusiones',
        '1kg',
        true
    ),
    (
        'Aceite de Girasol',
        950.00,
        1400.00,
        'Cocinero',
        false,
        NULL,
        200,
        'Almacén',
        '900ml',
        false
    ),
    (
        'Fideos Tallarines',
        600.00,
        900.00,
        'Lucchetti',
        true,
        800.00,
        300,
        'Pastas',
        '500g',
        true
    );
-- ==========================================
-- 2. Tablas con 1 Nivel de Dependencia
-- ==========================================
-- Las ordenes dependen de proveedores (id 1 y 2 creados arriba)
INSERT INTO ordenes_compra (cantidad, total, fecha, proveedor_id)
VALUES (500, 400000, '2026-10-10', 1),
    (200, 300000, '2026-10-12', 2);
-- Los pedidos dependen de roles (id 3 creado arriba)
INSERT INTO pedidos (
        fecha,
        total,
        metodo_pago,
        comercio,
        modalidad_entrega,
        direccion,
        estado,
        motivo_rechazo,
        rol_id
    )
VALUES (
        '2026-10-13',
        14000.00,
        'Efectivo',
        'Kiosco El Sol',
        'Reparto',
        'Av. Illia 123',
        'Aprobado',
        NULL,
        1
    ),
    (
        '2026-10-14',
        4400.00,
        'Transferencia',
        'Despensa María',
        'Retiro',
        NULL,
        'Pendiente',
        NULL,
        1
    );
-- ==========================================
-- 3. Tablas con Múltiples Dependencias
-- ==========================================
-- Los lotes dependen de ordenes_compra y productos
INSERT INTO lotes (
        fecha_arribo,
        fecha_vencimiento,
        orden_compra_id,
        producto_id
    )
VALUES ('2026-10-11', '2027-05-10', 1, 1),
    ('2026-10-13', '2028-10-01', 2, 2);
-- Las ventas dependen de pedidos
INSERT INTO ventas (fecha, total, pedido_id)
VALUES ('2026-10-13', 14000.00, 1),
        ('2026-09-01', 10000.00, 2),
        ('2026-04-01', 20000.00, 2)
-- Detalle de la venta 1: Vendemos 10 Galletas y 1 Yerba Mate
INSERT INTO tiene (cantidad, precio, producto_id, pedido_id)
VALUES (10, 1200.00, 1, 1),
    (1, 2200.00, 2, 1);