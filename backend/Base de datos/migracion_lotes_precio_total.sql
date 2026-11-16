-- Migración idempotente: agrega precio_total a lotes con backfill desde productos.precio_costo * cantidad.
-- Ejecutar con: psql -U postgres -d distribuidora -f "Base de datos/migracion_lotes_precio_total.sql"

ALTER TABLE lotes ADD COLUMN IF NOT EXISTS precio_total DECIMAL(10, 2);

UPDATE lotes l
SET precio_total = ROUND(p.precio_costo * l.cantidad, 2)
FROM productos p
WHERE l.producto_id = p.id
  AND l.precio_total IS NULL;

ALTER TABLE lotes ALTER COLUMN precio_total SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_lote_precio_total') THEN
    ALTER TABLE lotes
      ADD CONSTRAINT chk_lote_precio_total CHECK (precio_total > 0);
  END IF;
END $$;
