-- ============================================================================
-- Migración: Gestión de Stock por Lotes y Trazabilidad de Salidas
-- ============================================================================

-- 1. Agregar cantidad_inicial en lotes si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lotes' AND column_name = 'cantidad_inicial'
    ) THEN
        ALTER TABLE lotes ADD COLUMN cantidad_inicial INTEGER DEFAULT NULL;
        UPDATE lotes SET cantidad_inicial = cantidad WHERE cantidad_inicial IS NULL;
        ALTER TABLE lotes ALTER COLUMN cantidad_inicial SET NOT NULL;
        ALTER TABLE lotes ADD CONSTRAINT chk_lotes_cantidad_inicial CHECK (cantidad_inicial > 0);
        ALTER TABLE lotes ADD CONSTRAINT chk_lotes_cantidad_max CHECK (cantidad <= cantidad_inicial);
    END IF;
END $$;

-- 2. Asegurar que lotes agotados (cantidad = 0) mantengan activo = true si se desea historial
UPDATE lotes SET activo = true WHERE cantidad = 0;

-- 3. Tabla de trazabilidad de lotes consumidos por pedido
CREATE TABLE IF NOT EXISTS pedido_lotes (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    lote_id INTEGER NOT NULL REFERENCES lotes(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    consumido_entero BOOLEAN NOT NULL DEFAULT false
);

-- 4. Sincronizar columna stock en productos con la suma de lotes activos y no vencidos
UPDATE productos p
SET stock = COALESCE((
    SELECT SUM(l.cantidad)
    FROM lotes l
    WHERE l.producto_id = p.id
      AND l.activo = true
      AND l.fecha_vencimiento >= CURRENT_DATE
), 0);
