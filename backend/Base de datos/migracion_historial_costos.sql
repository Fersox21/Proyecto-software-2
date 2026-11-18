ALTER TABLE lotes DROP COLUMN IF EXISTS precio_costo_unitario;

CREATE TABLE IF NOT EXISTS historial_precios_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    lote_id INTEGER REFERENCES lotes(id) ON DELETE SET NULL,
    orden_compra_id INTEGER REFERENCES ordenes_compra(id) ON DELETE SET NULL,
    precio_costo_anterior DECIMAL(10, 2) CHECK (precio_costo_anterior IS NULL OR precio_costo_anterior > 0),
    precio_costo_nuevo DECIMAL(10, 2) NOT NULL CHECK (precio_costo_nuevo > 0),
    precio_venta_anterior DECIMAL(10, 2) CHECK (precio_venta_anterior IS NULL OR precio_venta_anterior > 0),
    precio_venta_nuevo DECIMAL(10, 2) NOT NULL CHECK (precio_venta_nuevo > 0),
    origen VARCHAR(30) NOT NULL CHECK (origen IN ('ALTA_PRODUCTO', 'INGRESO_LOTE', 'EDICION_MANUAL', 'EDICION_ORDEN')),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_historial_precios_producto_fecha
ON historial_precios_producto (producto_id, fecha_registro DESC, id DESC);

INSERT INTO historial_precios_producto (
    producto_id,
    lote_id,
    orden_compra_id,
    precio_costo_anterior,
    precio_costo_nuevo,
    precio_venta_anterior,
    precio_venta_nuevo,
    origen
)
SELECT
    p.id,
    NULL,
    NULL,
    NULL,
    p.precio_costo,
    NULL,
    p.precio_venta,
    'ALTA_PRODUCTO'
FROM productos p
WHERE NOT EXISTS (
    SELECT 1
    FROM historial_precios_producto hp
    WHERE hp.producto_id = p.id
);
