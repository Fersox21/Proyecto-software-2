-- Migración: agrega la columna de imagen a los productos existentes.
--
-- La imagen se guarda como ruta pública:
--   /uploads/productos/<archivo>  (subida desde el admin)
--   harina.webp                   (nombre legacy servido por el frontend)
--   https://...                   (URL absoluta externa)
--
-- Ejecutar con: psql -U postgres -d distribuidora -f "Base de datos/migracion_imagenes.sql"

ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);

-- Asigna la imagen que ya existía en el frontend al producto de harina.
UPDATE productos
SET imagen = 'harina.webp'
WHERE nombre = 'Harina 0000 1kg' AND imagen IS NULL;
