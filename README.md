# API RESTful de Catálogo de Productos

API construida con NestJS, TypeScript, PostgreSQL y TypeORM para administrar un catálogo de productos con autenticación JWT.

## Requisitos

- Node.js 20 o superior
- pnpm
- Docker y Docker Compose

## Configuración

Instalar dependencias:

```bash
pnpm install
```

Crear el archivo `.env` desde el ejemplo:

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows (cmd)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Valores usados por defecto:

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=catalogo_productos

JWT_ACCESS_SECRET=change-me-access-secret
JWT_ACCESS_EXPIRES_IN=10m

JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

## Base de Datos

Levantar PostgreSQL con Docker:

```bash
docker compose up -d
```

Aplicar el script SQL:

```bash
docker exec -i catalogo_productos_db psql -U postgres -d catalogo_productos < scripts/schema.sql
```

> **PowerShell:** usa esta variante:
> ```powershell
> Get-Content scripts/schema.sql | docker exec -i catalogo_productos_db psql -U postgres -d catalogo_productos
> ```

## Ejecutar la API

```bash
pnpm run start:dev
```

La API queda disponible en:

```txt
http://localhost:3000
```

## Autenticación

> **Windows (cmd):** Reemplaza las comillas simples `'...'` por comillas dobles escapadas `\"...\"`.
> **PowerShell:** Las comillas simples `'...'` funcionan directamente en los ejemplos.

Registrar usuario:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

Iniciar sesión:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

Respuesta esperada:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": "10m",
  "user": {
    "id": "...",
    "username": "admin",
    "createdAt": "..."
  }
}
```

Refrescar token:

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

Cerrar sesión:

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

## Productos

Todos los endpoints de productos requieren:

```txt
Authorization: Bearer ACCESS_TOKEN
```

Crear producto:

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "Laptop para oficina",
    "unitPrice": 1200.50,
    "stock": 8,
    "category": "Tecnología"
  }'
```

Listar productos:

```bash
curl "http://localhost:3000/products?sort=name-ASC&limit=10&page=1&search_by_name=lap" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Buscar por ID:

```bash
curl http://localhost:3000/products/PRODUCT_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Actualizar producto:

```bash
curl -X PATCH http://localhost:3000/products/PRODUCT_ID \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock":15}'
```

Eliminar producto:

```bash
curl -X DELETE http://localhost:3000/products/PRODUCT_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Endpoint Extra

Se agregó:

```txt
GET /products/low-stock?threshold=10
```

Este endpoint devuelve productos cuyo stock es menor o igual al umbral indicado. Lo elegí porque es útil para un catálogo real: permite detectar productos que necesitan reposición.

Ejemplo:

```bash
curl "http://localhost:3000/products/low-stock?threshold=10" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Validaciones

La API valida los datos de entrada con DTOs y rechaza campos no permitidos.

Ejemplos:

- `username`: mínimo 3 caracteres.
- `password`: mínimo 8 caracteres.
- `unitPrice`: mayor a 0 y máximo 2 decimales.
- `stock`: entero mayor o igual a 0.
- `sort`: solo acepta `name`, `unit_price`, `stock`, `category` o `created_at` con `ASC` o `DESC`.

## Verificación

Compilar:

```bash
pnpm run build
```

Lint:

```bash
pnpm exec eslint "{src,apps,libs,test}/**/*.ts"
```

Tests:

```bash
pnpm run test
```


