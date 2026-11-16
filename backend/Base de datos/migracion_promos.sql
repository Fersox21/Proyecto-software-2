-- Migración: normaliza las promociones existentes a un porcentaje entero.
--
-- Regla: el descuento se expresa como porcentaje entero (1% a 99%) y el precio
-- promocional se recalcula en centavos para que ambos concuerden.
-- Ejemplo: venta 900 y promo 800 => 11% => promo 801.
--
-- Ejecutar con: psql -U postgres -d distribuidora -f "Base de datos/migracion_promos.sql"

-- 1. Promociones que no se pueden representar (sin precio, precio <= 0 o
--    precio >= precio de venta) se desactivan para no mostrar descuentos falsos.
UPDATE productos
SET en_promocion = false
WHERE en_promocion = true
  AND (
    precio_promo IS NULL
    OR precio_promo <= 0
    OR precio_promo >= precio_venta
  );

-- 2. Promociones válidas: recalcular el precio con el porcentaje entero.
UPDATE productos
SET precio_promo = ROUND(
      precio_venta * (1 - ROUND((1 - precio_promo / precio_venta) * 100) / 100),
      2
    )
WHERE en_promocion = true
  AND precio_promo IS NOT NULL
  AND precio_promo > 0
  AND precio_promo < precio_venta
  AND ROUND((1 - precio_promo / precio_venta) * 100) BETWEEN 1 AND 99;

-- 3. Integridad a nivel de base de datos.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_promo_activa') THEN
    ALTER TABLE productos
      ADD CONSTRAINT chk_promo_activa CHECK (
        NOT en_promocion
        OR (precio_promo IS NOT NULL AND precio_promo > 0 AND precio_promo < precio_venta)
      );
  END IF;
END $$;
