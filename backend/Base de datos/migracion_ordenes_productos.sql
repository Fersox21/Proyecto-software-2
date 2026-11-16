-- Migración idempotente: categorías, tipos de promoción, nuevos campos en productos y constraint en lotes.
-- Ejecutar con: psql -U postgres -d distribuidora -f "Base de datos/migracion_ordenes_productos.sql"

-- 1. Tabla categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabla tipos_promocion
CREATE TABLE IF NOT EXISTS tipos_promocion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true
);

-- 3. Nuevas columnas en productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipo_promocion_id INTEGER REFERENCES tipos_promocion(id);
ALTER TABLE productos ALTER COLUMN categoria TYPE VARCHAR(100);

-- 4. Migrar categorías distintas existentes en productos.categoria hacia categorias
INSERT INTO categorias (nombre)
SELECT DISTINCT ON (LOWER(TRIM(categoria))) TRIM(categoria)
FROM productos
WHERE categoria IS NOT NULL
  AND TRIM(categoria) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM categorias c
    WHERE LOWER(TRIM(c.nombre)) = LOWER(TRIM(productos.categoria))
  )
ORDER BY LOWER(TRIM(categoria)), TRIM(categoria)
ON CONFLICT (nombre) DO NOTHING;

-- 5. Poblar productos.categoria_id si corresponde
UPDATE productos p
SET categoria_id = c.id
FROM categorias c
WHERE p.categoria_id IS NULL
  AND p.categoria IS NOT NULL
  AND LOWER(TRIM(p.categoria)) = LOWER(TRIM(c.nombre));

-- 6. Constraint de fechas en lotes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_lotes_fechas') THEN
    ALTER TABLE lotes
      ADD CONSTRAINT chk_lotes_fechas CHECK (fecha_vencimiento >= fecha_arribo);
  END IF;
END $$;
