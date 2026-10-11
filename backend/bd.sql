-- 1. Tabla Proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono INTEGER NOT NULL
);

-- 2. Tabla Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(50) NOT NULL CHECK (correo LIKE '%@%'),
    contraseña VARCHAR(255) NOT NULL
);

-- 3. Tabla OrdenesCompra
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    total INTEGER NOT NULL,
    fecha DATE NOT NULL,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id)
);

-- 4. Tabla Lotes
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    fechaArribo DATE NOT NULL,
    fechaVencimiento DATE NOT NULL,
    ordenCompra_id INTEGER NOT NULL REFERENCES ordenes_compra(id),
    producto_id INTEGER NOT NULL REFERENCES lotes(id) -- Nota: Referencia interna según el diagrama
);

-- 5. Tabla Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precioCosto DECIMAL(10, 2) NOT NULL CHECK (precioCosto > 0),
    precioVenta DECIMAL(10, 2) NOT NULL CHECK (precioVenta > 0),
    marca VARCHAR(25),
    enPromocion BOOLEAN,
    precioPromo DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(20) NOT NULL,
    peso VARCHAR(20) NOT NULL
);

-- 6. Tabla Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    metodoPago VARCHAR(30) NOT NULL,
    comercio VARCHAR(40) NOT NULL,
    modalidadEntrega VARCHAR(10) NOT NULL,
    direccion VARCHAR(60),
    estado VARCHAR(15) NOT NULL,
    motivoRechazo VARCHAR(80),
    roles_id INTEGER NOT NULL REFERENCES roles(id)
);

-- 7. Tabla Ventas
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id)
);

-- 8. Tabla Tiene (Relación Ventas - Productos)
CREATE TABLE tiene (
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio DECIMAL(10, 2) NOT NULL,
    producto_id INTEGER NOT NULL UNIQUE REFERENCES productos(id),
    venta_id INTEGER NOT NULL REFERENCES ventas(id)
);