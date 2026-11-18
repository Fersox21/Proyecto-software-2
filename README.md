# Proyecto-software-2

Sistema de gestión de stock, lotes, órdenes de compra, pedidos y ventas para una distribuidora.

---

## 1. Requisitos previos

En una computadora nueva, instalá primero:

- **Git**
- **Node.js** (versión LTS 22 o superior, incluye `npm`)
- **PostgreSQL** (servidor de base de datos + `psql` o pgAdmin)

---

## 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Proyecto-software-2
```

---

## 3. Instalar dependencias

Desde la carpeta raíz del proyecto, instalá las dependencias de la raíz, del backend y del frontend:

```bash
# 1. Raíz (incluye jsonwebtoken usado por el backend y Vitest para tests)
npm install

# 2. Backend
cd backend
npm install

# 3. Frontend
cd ../frontend
npm install

# Volver a la raíz
cd ..
```

---

## 4. Crear la base de datos en PostgreSQL

1. Creá una base de datos vacía en PostgreSQL (desde pgAdmin o `psql`).
2. Ejecutá primero el esquema y luego los datos iniciales (`seed.sql` incluye el hash de contraseña del administrador):
   - `backend/Base de datos/schema.sql`
   - `backend/Base de datos/seed.sql`

Ejemplo con `psql`:

```bash
psql -U <tu_usuario_postgres> -d <nombre_de_tu_bd> -f "backend/Base de datos/schema.sql"
psql -U <tu_usuario_postgres> -d <nombre_de_tu_bd> -f "backend/Base de datos/seed.sql"
```

---

## 5. Configurar variables de entorno

1. **Backend:** copiá `backend/.env.example` a `backend/.env` y completá las variables:
   - `PORT`
   - `CORS_ORIGIN`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `PGSSL` (dejar en `false` para PostgreSQL local sin SSL)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`

2. **Frontend:** copiá `frontend/.env.example` a `frontend/.env` y configurá:
   - `VITE_API_URL` (URL `/api` donde corre el backend)

---

## 6. Ejecutar el proyecto en local

Abrí **dos terminales** en paralelo:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Luego abrí en el navegador la URL que indique Vite (por defecto `http://localhost:5173`).

---

## 7. Ejecutar tests (opcional)

Desde la carpeta raíz:

```bash
npm test
```

---

## 8. Acceso de administrador y consideraciones locales

- **Usuario administrador de prueba (`seed.sql`):**
  - **Mail:** `admin@lafedistribuidora.com`
  - **Contraseña:** `admin123`

- **Consideraciones de ejecución local:**
  - Las imágenes precargadas en despliegue no se encuentran de manera local; para probar pedidos en local podés cargar cualquier imagen desde **Panel admin > Productos > Editar > Cargar imagen** y marcar **Mostrar en catálogo**.
  - Precio envío `0`, por ahora.
  - Tipo Promoción Escalable.

