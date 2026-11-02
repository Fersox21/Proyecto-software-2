# Instructions for OpenCode Agent

## 1. Contexto y Arquitectura del Proyecto
Este repositorio es un sistema de gestión de stock y ventas para una distribuidora. Su arquitectura está dividida explícitamente en dos directorios principales:
- **`frontend/`**: Aplicación React estructurada por **Features** y elementos **Shared**[cite: 2].
- **`backend/`**: Servidor Node.js con Express estructurado por **Módulos de Dominio** (`src/modules`)[cite: 3].

---

## 2. Estructura Exacta del Repositorio

### Frontend (`frontend/src/`)[cite: 2]
- **`features/`**: Módulos funcionales (`administrador`, `auth`, `carrito`, `catalogo`, `formulario`, `home`, `pedido`, `preguntasFrecuentes`)[cite: 2]. Cada feature encapsula su lógica específica.
- **`shared/`**: Recursos globales y reutilizables (`components`, `hooks`, `layout`, `pages`, `utils`)[cite: 2].
- **`styles/`**: Estilos CSS organizados por vista/componente (`home`, `panelAdmin`, `carrito.css`, `catalogo.css`, etc.) y `variables.css`[cite: 2].
- **Enrutamiento y Entrada**: `router.jsx`, `App.jsx`, `main.jsx`[cite: 2].

### Backend (`backend/src/`)[cite: 3]
- **`config/`**: Configuración global (`cors.js`, `db.js`, `env.js`)[cite: 3].
- **`middlewares/`**: Middlewares globales (`errorHandler.js`, `notFound.js`, `verificarToken.js`)[cite: 3].
- **`modules/`**: Módulos de dominio (`auth`, `lotes`, `ordenesCompra`, `pedidos`, `productos`, `proveedores`, `roles`, `tiene`, `ventas`)[cite: 3]. Cada módulo contiene sus propias rutas, controladores y servicios/modelos.
- **Entrada del servidor**: `app.js` (configuración de Express) y `server.js` (arranque del puerto)[cite: 3].

---

## 3. Modelo de Dominio y Entidades (UML)
Las operaciones de backend y los estados del frontend deben reflejar las siguientes entidades del dominio[cite: 1, 3]:

- **`productos`**: `nombre`, `marca`, `stock`, `precioCosto`, `precioVenta`, `enPromocion`, `precioPromo`, `peso`[cite: 1, 3].
- **`lotes`**: `cantidad`, `fechaArribo`, `fechaVenci`. Vinculado a `productos`[cite: 1, 3].
- **`proveedores`**: `nombre`, `telefono`[cite: 1, 3].
- **`ordenesCompra`**: `cantidad`, `total`, `fecha`. Asocia `proveedores` y `lotes`[cite: 1, 3].
- **`pedidos`**: `comercio`, `modalidadEntrega`, `direccion`, `estado`, `motivoRechazo`, `metodoPago`[cite: 1, 3].
- **`tiene` / `item`**: Relación de productos e ítems dentro de un pedido (`cantidad`, `precio`)[cite: 1, 3].
- **`ventas`**: `fecha`, `total`. Se consolida al aprobar un pedido[cite: 1, 3].
- **`auth` / `roles`**: Gestión de autenticación, sesión y permisos de usuarios[cite: 3].

---

## 4. Reglas de Desarrollo y Convenciones

### Para el Frontend (React):
1. **Ubicación del código**: Si una vista o componente pertenece a un flujo específico (ej. el flujo de pago o catálogo), agrégalo dentro de su respectiva carpeta en `src/features/`[cite: 2]. Reserva `src/shared/` únicamente para código 100% reutilizable en múltiples features[cite: 2].
2. **Estilos**: Mantén los estilos centralizados en `src/styles/` respetando los nombres de archivo existentes o usando variables declaradas en `variables.css`[cite: 2].
3. **Peticiones HTTP**: Los llamados a la API deben ser manejados a través de hooks personalizados en `src/shared/hooks/` o dentro del módulo de la feature.

### Para el Backend (Node.js):
1. **Enfoque Modular**: No crees carpetas globales de `controllers` o `routes`. Modifica o añade archivos dentro de la carpeta del módulo correspondiente en `src/modules/<modulo>/` (ej. `src/modules/lotes/`, `src/modules/pedidos/`)[cite: 3].
2. **Seguridad y Middlewares**: Protege las rutas administrativas o de modificación de stock utilizando `verificarToken.js` desde `src/middlewares/`[cite: 3].
3. **Manejo de Errores y Códigos HTTP**: 
   - Toda respuesta de error debe responder con el **código de estado HTTP adecuado** (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`).
   - El cuerpo JSON de la respuesta debe incluir un mensaje descriptivo y estructurado:
     ```json
     {
       "success": false,
       "error": "Mensaje explicativo del error",
       "statusCode": 400
     }
     ```
   - Delegar los errores no capturados al middleware global `errorHandler.js` (`src/middlewares/errorHandler.js`)[cite: 3].

---

## 5. Directivas de Ejecución para OpenCode
- Al crear una nueva funcionalidad full-stack, genera o edita primero el módulo correspondiente en `backend/src/modules/`[cite: 3] y luego la feature asociada en `frontend/src/features/`[cite: 2].
- Respeta siempre la convención de nombres en camelCase para archivos `.js` y `.jsx`.
- Asegúrate de que los controladores devuelvan el código HTTP correcto (`res.status(4xx/5xx).json(...)`) junto con el objeto de error detallado.

## 6. Seguridad y Manejo de Credenciales
- **PROHIBIDO** leer, mostrar, editar o volcar en respuestas el contenido de archivos `.env`, claves de API, secretos de JWT o credenciales de base de datos (`db.js`, `env.js`).
- Si una tarea requiere configurar una variable de entorno, indica únicamente el nombre de la variable (ej. `PROCESS.ENV.DB_PASSWORD`) y nunca un valor real.