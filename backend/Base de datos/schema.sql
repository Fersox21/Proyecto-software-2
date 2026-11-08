-- Crea la base y la tabla de productos.
-- Ejecutar con: psql -U postgres -f database/schema.sql
CREATE DATABASE distribuidora;
\ c "distribuidora" --
-- 1. Tabla Proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    telefono VARCHAR(40) NOT NULL
);
-- Tabla 2: Roles (Usuarios)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(50) NOT NULL UNIQUE CHECK (correo LIKE '%@%'),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'cliente')),
    activo BOOLEAN NOT NULL DEFAULT true,
    password VARCHAR(255) NOT NULL
);
-- 5. Tabla Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio_costo DECIMAL(10, 2) NOT NULL CHECK (precio_costo > 0),
    precio_venta DECIMAL(10, 2) NOT NULL CHECK (precio_venta > 0),
    marca VARCHAR(25),
    en_promocion BOOLEAN,
    precio_promo DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(20) NOT NULL,
    peso VARCHAR(20) NOT NULL,
    destacado BOOLEAN,
    activo BOOLEAN NOT NULL DEFAULT true
);
-- Tabla 4: Órdenes de Compra (Depende de Proveedores)
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    cantidad INTEGER NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id)
);
-- Tabla 5: Pedidos (Depende de Roles)
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    metodo_pago VARCHAR(30) NOT NULL,
    comercio VARCHAR(40) NOT NULL,
    modalidad_entrega VARCHAR(10) NOT NULL,
    direccion VARCHAR(60),
    estado VARCHAR(15) NOT NULL,
    motivo_rechazo VARCHAR(80),
    activo BOOLEAN NOT NULL DEFAULT true,
    rol_id INTEGER NOT NULL REFERENCES roles(id)
);
-- Tabla 6: Lotes (Depende de OrdenesCompra y Productos)
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    fecha_arribo DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    orden_compra_id INTEGER NOT NULL REFERENCES ordenes_compra(id),
    producto_id INTEGER NOT NULL REFERENCES productos(id)
);
-- Tabla 7: Ventas (Depende de Pedidos)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id)
);
-- Tabla 8: Tiene (Relación N:M entre Pedidos y Productos)
CREATE TABLE tiene (
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    PRIMARY KEY (pedido_id, producto_id)
);