# Cillan World

Proyecto full-stack para un e-commerce: frontend en Next.js y backend en Strapi.

## Estructura

```
frontend-cillan-world/   # Next.js + React + Tailwind
backend-cillan-world/    # Strapi 5 (CMS)
```

## Requisitos

- Node.js 18+ para el frontend
- Node.js 20.x para el backend (Strapi)
- PostgreSQL (u otra BD soportada por Strapi)

## Configuracion rapida

### 1) Backend (Strapi)

```bash
cd backend-cillan-world
cp .env.example .env
npm install
npm run develop
```

Admin disponible en `http://localhost:1337/admin`.

Variables principales:

| Variable | Descripcion |
| --- | --- |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Claves necesarias para arrancar Strapi con seguridad. |
| `DATABASE_*` | Credenciales de la base de datos. |
| `PUBLIC_URL` | URL publica del backend. |

### 2) Frontend (Next.js)

```bash
cd frontend-cillan-world
cp .env.example .env.local
npm install
npm run dev
```

App disponible en `http://localhost:3000`.

Variables principales:

| Variable | Descripcion |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | URL publica del CMS Strapi (para catalogo e imagenes). |
| `STRAPI_URL` | URL de Strapi accesible desde el servidor (opcional). |
| `STRAPI_API_TOKEN` | Token con permisos para crear ordenes (server-only). |

## Scripts utiles

Frontend:

- `npm run dev`: entorno de desarrollo
- `npm run build`: build de produccion
- `npm run start`: servidor en produccion

Backend:

- `npm run develop`: modo desarrollo
- `npm run build`: build de admin
- `npm run start`: modo produccion

## Notas

- El endpoint `api::order.order` requiere `Authorization: Bearer <token>`.
- No publiques credenciales ni claves en el repositorio.

## Despliegue

- Next.js: https://nextjs.org/docs/app/building-your-application/deploying
- Strapi: https://docs.strapi.io/dev-docs/deployment
