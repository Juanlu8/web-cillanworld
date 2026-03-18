# agents.md

Guia de contexto rapido para asistentes IA en este repo.

## 1) Que es este proyecto

- E-commerce full-stack dividido en 2 apps:
  - `frontend-cillan-world`: Next.js (App Router) + TypeScript + Tailwind.
  - `backend-cillan-world`: Strapi 5 (CMS/API) + PostgreSQL (principal).

## 2) Stack y versiones relevantes

- Frontend:
  - Next `15.4.10`
  - React `19.1.0`
  - TypeScript `^5`
  - Tailwind `^4.1.11`
  - i18n: `i18next`, `react-i18next`, `next-i18next`
  - Estado carrito: `zustand`
- Backend:
  - Strapi `5.31.2`
  - Node requerido: `20.x` (en `backend-cillan-world/package.json`)
  - DB drivers: `pg`, `better-sqlite3`

## 3) Estructura rapida

Raiz:

- `frontend-cillan-world/` -> web publica
- `backend-cillan-world/` -> CMS + APIs
- `backup_bd_web_cillan.backup` -> backup BD
- `.quality/` -> utilidades/calidad del proyecto

Frontend (zonas mas importantes):

- `app/` -> rutas App Router
- `components/` -> UI reutilizable
- `api/` -> hooks cliente para leer Strapi
- `lib/` -> utilidades fetch/media/i18n
- `hooks/use-cart.tsx` -> logica carrito persistente
- `locales/es`, `locales/en` -> traducciones

Backend (zonas mas importantes):

- `src/api/*` -> content-types, controllers, routes, services
- `config/database.js` -> conexion DB multi-cliente
- `config/server.js`, `config/middlewares.js`, `config/api.js` -> runtime

## 4) Comandos de trabajo

Backend:

- `cd backend-cillan-world`
- `npm install`
- `npm run develop`
- `npm run build`
- `npm run start`

Frontend:

- `cd frontend-cillan-world`
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`

Checks utiles:

- Front: `npm run lint`, `npm run typecheck`
- Back: `npm run lint`, `npm run typecheck`

## 5) Variables de entorno clave

Frontend (`frontend-cillan-world/.env.local`):

- `NEXT_PUBLIC_BACKEND_URL` -> URL publica de Strapi (cliente)
- `STRAPI_URL` -> URL de Strapi para server-side (opcional)
- `STRAPI_API_TOKEN` -> token server-only para operaciones sensibles

Backend (`backend-cillan-world/.env`):

- Seguridad Strapi: `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`
- DB: `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SCHEMA`, `DATABASE_SSL`
- Server: `HOST`, `PORT`, `PUBLIC_URL`
- Email contacto: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`

## 6) APIs y dominio funcional actual

Content-types Strapi detectados:

- `product`
- `category`
- `collection`
- `home-image`
- `order`

Rutas custom detectadas en backend:

- `POST /api/contact/send-email` (sin auth) -> envia correo via Resend
- `GET /api/health` (sin auth) -> healthcheck

Ordenes:

- Existe controller custom en `src/api/order/controllers/order.js`.
- Valida `products[]` y crea orden con estado inicial `pending`.
- Schema de `order` incluye `products`, `status`, `totalAmount`, `currency`, datos cliente, `metadata`, `orderedAt`.

## 7) Flujo frontend <-> backend

Lectura de catalogo:

- Hooks cliente en `frontend-cillan-world/api/*.tsx` usan `fetchFromApi` (`lib/api.ts`)
- Pegan directo contra `NEXT_PUBLIC_BACKEND_URL + /api/...`
- Endpoints usados: `/api/products`, `/api/collections`, `/api/home-images`

SSR/Server fetch:

- `frontend-cillan-world/lib/strapi-server.ts` hace fetch server-side con `qs` y token opcional.
- Util para paginas que quieran revalidate/tags.

Checkout/pago (estado actual):

- El modal de carrito muestra aviso temporal: compra directa deshabilitada.
- Hay pagina `app/success/page.tsx` que intenta verificar con `GET /api/orders/session?session_id=...`.
- No se detectaron rutas Next `app/**/route.ts` en este repo, por lo que ese endpoint no existe aqui salvo que se implemente en otro servicio.

## 8) Convenciones practicas para cambios

- Mantener `@/` imports en frontend.
- Preservar i18n ES/EN al tocar textos UI (`locales/es/common.json` y `locales/en/common.json`).
- Evitar hardcodear URLs; usar variables de entorno y helpers existentes (`lib/api.ts`, `lib/media.ts`, `lib/strapi-server.ts`).
- En backend, seguir patron Strapi por modulo: `content-types`, `controllers`, `routes`, `services`.
- No editar artefactos generados (`.next/`, `types/generated/`) salvo tarea explicita.

## 9) Donde tocar segun objetivo

- Nuevo campo de producto/coleccion:
  - Backend schema en `backend-cillan-world/src/api/.../content-types/.../schema.json`
  - Ajustar consultas frontend en `frontend-cillan-world/api/*.tsx` y/o `frontend-cillan-world/lib/strapi-server.ts`
- Nuevo endpoint backend:
  - `backend-cillan-world/src/api/<modulo>/routes`
  - `backend-cillan-world/src/api/<modulo>/controllers`
- Nueva pagina frontend:
  - `frontend-cillan-world/app/<ruta>/page.tsx`
- Logica carrito:
  - `frontend-cillan-world/hooks/use-cart.tsx`

## 10) Riesgos y notas rapidas

- `frontend-cillan-world/next.config.ts` tiene `eslint.ignoreDuringBuilds = true`; errores de lint no bloquean build.
- Hay texto temporal de checkout en UI, coherente con flujo de pago incompleto en frontend.
- Si se activa checkout real, implementar/validar endpoint de verificacion de sesion (`/api/orders/session`) antes de depender de `app/success/page.tsx`.

## 11) Checklist de validacion tras cambios

- Frontend: `npm run typecheck` y `npm run lint`
- Backend: `npm run typecheck` y `npm run lint`
- Probar rutas criticas:
  - Home/catalog/producto
  - Contacto (`/api/contact/send-email`)
  - Health (`/api/health`)
  - Carrito y pagina success
