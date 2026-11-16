// Almacenamiento de las imágenes de productos.
//
// Los archivos se guardan en backend/uploads/productos y se sirven de forma
// estática bajo /uploads. La base de datos solo guarda la ruta pública
// (/uploads/productos/<archivo>), nunca el archivo en sí.

import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIRECTORIO_MODULO = path.dirname(fileURLToPath(import.meta.url));

// backend/src/modules/productos -> backend/uploads/productos
export const CARPETA_UPLOADS = path.resolve(
  DIRECTORIO_MODULO,
  '../../../uploads/productos'
);

export const URL_BASE_IMAGENES = '/uploads/productos';

// Se crea la carpeta al importar el módulo para que multer siempre tenga dónde
// escribir, incluso en un clon recién descargado.
fs.mkdirSync(CARPETA_UPLOADS, { recursive: true });

// Extensión de archivo según el tipo MIME aceptado.
const EXTENSIONES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif'
};

const crearError = (mensaje) => {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
};

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CARPETA_UPLOADS),
  filename: (req, file, cb) => {
    const extension = EXTENSIONES[file.mimetype] || '.jpg';
    cb(null, `producto-${req.params.id}-${Date.now()}${extension}`);
  }
});

const upload = multer({
  storage: almacenamiento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!EXTENSIONES[file.mimetype]) {
      return cb(crearError('Formato de imagen no permitido. Usá JPG, PNG, WEBP o AVIF'));
    }
    cb(null, true);
  }
});

// Envuelve multer.single para normalizar sus errores al contrato de la API
// (siempre con status 400 y un mensaje claro).
export const recibirImagen = (req, res, next) => {
  upload.single('imagen')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.status = 400;
        err.message = 'La imagen no puede superar los 5 MB';
      } else {
        err.status = 400;
      }
      return next(err);
    }

    if (!err.status) err.status = 400;
    return next(err);
  });
};

// Elimina el archivo físico asociado a una ruta pública. Solo actúa sobre rutas
// que pertenecen a nuestra carpeta de uploads y usa basename para evitar que
// una ruta maliciosa intente salir del directorio. Si el archivo no existe, no
// hace nada.
export const eliminarImagenFisica = (url) => {
  if (typeof url !== 'string' || !url.startsWith(`${URL_BASE_IMAGENES}/`)) {
    return;
  }

  const nombreArchivo = path.basename(url);
  const ruta = path.join(CARPETA_UPLOADS, nombreArchivo);

  try {
    fs.unlinkSync(ruta);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};
