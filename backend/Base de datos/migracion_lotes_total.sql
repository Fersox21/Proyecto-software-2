-- Migración idempotente: normaliza la columna total DECIMAL(10, 2) NOT NULL CHECK (total > 0) en lotes.
-- Ejecutar con: psql -U postgres -d distribuidora -f "Base de datos/migracion_lotes_total.sql"

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lotes' AND column_name = 'precio_total'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lotes' AND column_name = 'total'
  ) THEN
    ALTER TABLE lotes RENAME COLUMN precio_total TO total;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'lotes' AND column_name = 'total'
  ) THEN
    ALTER TABLE lotes ADD COLUMN total DECIMAL(10, 2);
  END IF;
END $$;

UPDATE lotes l
SET total = ROUND(p.precio_costo * l.cantidad, 2)
FROM productos p
WHERE l.producto_id = p.id
  AND l.total IS NULL;

ALTER TABLE lotes ALTER COLUMN total SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_lote_precio_total') THEN
    ALTER TABLE lotes DROP CONSTRAINT chk_lote_precio_total;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_lote_total') THEN
    ALTER TABLE lotes
      ADD CONSTRAINT chk_lote_total CHECK (total > 0);
  END IF;
END $$;
