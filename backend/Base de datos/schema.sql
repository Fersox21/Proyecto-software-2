CREATE DATABASE distribuidora;
\c distribuidora

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- ============================================================================
-- 1. DEFINICIÓN DE TABLAS (SCHEMA CONSOLIDADO)
-- ============================================================================

-- 1. Proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    telefono VARCHAR(40) NOT NULL
);

-- 2. Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(50) NOT NULL UNIQUE CHECK (correo LIKE '%@%'),
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
    activo BOOLEAN NOT NULL DEFAULT true,
    password VARCHAR(255) NOT NULL
);

-- 3. Categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tipos de Promoción
CREATE TABLE tipos_promocion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true
);

-- 5. Productos (incluye imágenes, descripción, categorías y validación de promos)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(25),
    descripcion TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    precio_costo DECIMAL(10, 2) NOT NULL CHECK (precio_costo > 0),
    precio_venta DECIMAL(10, 2) NOT NULL CHECK (precio_venta > 0),
    en_promocion BOOLEAN NOT NULL DEFAULT false,
    precio_promo DECIMAL(10, 2) CHECK (precio_promo IS NULL OR precio_promo > 0),
    categoria VARCHAR(100) NOT NULL,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    tipo_promocion_id INTEGER REFERENCES tipos_promocion(id),
    imagen VARCHAR(255),
    destacado BOOLEAN NOT NULL DEFAULT false,
    visible_catalogo BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT chk_promo_activa CHECK (
        NOT en_promocion
        OR (precio_promo IS NOT NULL AND precio_promo > 0 AND precio_promo < precio_venta)
    )
);

-- 6. Órdenes de Compra (1 Proveedor -> 1..* Órdenes de Compra)
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id)
);

-- 7. Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    envio DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (envio >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    total_modificado DECIMAL(10, 2) DEFAULT NULL CHECK (total_modificado IS NULL OR total_modificado > 0),
    motivo_modificacion TEXT DEFAULT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    telefono VARCHAR(40) NOT NULL CHECK (telefono ~ '^\+?[0-9]{7,15}$'),
    comercio VARCHAR(100) NOT NULL,
    persona_contacto VARCHAR(100),
    modalidad_entrega VARCHAR(20) NOT NULL,
    direccion VARCHAR(150),
    descripcion_direccion VARCHAR(255),
    observaciones TEXT,
    estado VARCHAR(15) NOT NULL,
    motivo_rechazo VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT true,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

-- 8. Lotes (1 Producto -> 1..* Lotes; 1 Orden de Compra -> 1..* Lotes -> 1 Proveedor)
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    fecha_arribo DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INTEGER NOT NULL CHECK (cantidad_inicial > 0),
    cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    orden_compra_id INTEGER NOT NULL REFERENCES ordenes_compra(id),
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    CONSTRAINT chk_lotes_fechas CHECK (fecha_vencimiento >= fecha_arribo),
    CONSTRAINT chk_lotes_cantidad_max CHECK (cantidad <= cantidad_inicial)
);

-- 9. Ventas (1 Pedido -> 0..1 Venta)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    total_modificado DECIMAL(10, 2) DEFAULT NULL CHECK (total_modificado IS NULL OR total_modificado > 0),
    motivo_modificacion TEXT DEFAULT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    pedido_id INTEGER NOT NULL UNIQUE REFERENCES pedidos(id)
);

-- 10. Tiene / Item (Relación N:M entre Pedidos y Productos)
CREATE TABLE tiene (
    cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    PRIMARY KEY (pedido_id, producto_id)
);

-- 11. Trazabilidad de Lotes por Pedido
CREATE TABLE pedido_lotes (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    lote_id INTEGER NOT NULL REFERENCES lotes(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    consumido_entero BOOLEAN NOT NULL DEFAULT false
);