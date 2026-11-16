-- Migración: agrega la columna de imagen a los productos existentes.
--
-- La imagen se guarda como nombre de archivo o ruta pública:
--   <archivo>                     (subida desde el admin en /uploads/productos)
--   /uploads/productos/<archivo>  (ruta pública relativa)
--   https://...                   (URL absoluta externa)
--
-- Ejecutar con: psql -U postgres -d distribuidora -f "Base de datos/migracion_imagenes.sql"

ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen VARCHAR(255);
