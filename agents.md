# agents.md

Guía de contexto rápido para asistentes IA en este repo. Generada por análisis directo del código (no solo de la documentación existente en la raíz, que en varios puntos está desactualizada — ver sección 11).

## 1) Qué es este proyecto

E-commerce full-stack dividido en 2 apps independientes con sus propios `package.json`:

- `frontend-cillan-world/`: Next.js (App Router) + TypeScript + Tailwind. Web pública + checkout.
- `backend-cillan-world/`: Strapi 5 (CMS/API) + PostgreSQL. Catálogo, órdenes, pasarela de pago Redsys y envío de emails transaccionales.

Dominio: venta de ropa y calzado. Checkout con pago con tarjeta vía TPV Redsys (Santander) y cálculo de gastos de envío por zona geográfica.

## 2) Stack y versiones relevantes

Frontend:
- Next `15.4.10`, React `19.1.0`, TypeScript `^5`, Tailwind `^4.1.11`
- Estado carrito: `zustand ^5.0.7` (persistencia en `localStorage`)
- i18n: `i18next ^25.5.0`, `react-i18next ^15.7.3`, `next-i18next ^15.4.2`, `i18next-browser-languagedetector`
- Otros: `axios`, `sonner` (toasts), `lucide-react`, `embla-carousel-react`, `keen-slider`, `qs`

Backend:
- Strapi `5.31.2` (`@strapi/strapi`, `@strapi/admin`, `@strapi/plugin-cloud`, `@strapi/plugin-users-permissions`)
- Node requerido: `20.x` (`engines.node` en `package.json`; el `README.md` del backend dice "18+", está desactualizado)
- DB drivers: `pg` (Postgres, principal), `better-sqlite3`
- Pagos: `redsys-easy` (librería real usada para firmar/verificar TPV)
- Emails: llamadas REST directas a la API de Resend (sin SDK `resend`, sin `nodemailer` pese a estar en dependencias)

## 3) Estructura rápida

Raíz:

- `frontend-cillan-world/` → web pública
- `backend-cillan-world/` → CMS + APIs
- `backup_bd_web_cillan.backup` → backup BD
- `9999_TPV-Virtual Guía SIS V2.2.pdf`, `pdf_extracted.txt` → guía oficial Redsys (referencia)
- `CHECKOUT_TPV_USAGE.md`, `INTEGRATION_COMPLETE.md`, `TPV_INTEGRATION_GUIDE.md`, `TESTING_GUIDE.md` → notas de la integración TPV (parcialmente desactualizadas, ver sección 11)
- `.quality/` → utilidades/calidad del proyecto
- `test_*.ps1` → scripts sueltos de prueba manual de Redsys

Frontend (zonas más importantes):

- `app/` → rutas App Router (ver sección 6)
- `components/` → UI reutilizable, incluye `CheckoutTPV.tsx` y `CartModal.tsx`
- `api/*.tsx` → hooks cliente para leer Strapi (`useGetProducts`, `useGetCollections`, `useGetHomeImages`, `useGetFeaturedProducts`)
- `lib/` → utilidades fetch/media/i18n + `shipping-rates.ts` (cálculo de envío en cliente)
- `hooks/use-cart.tsx` → lógica carrito persistente (Zustand)
- `locales/es`, `locales/en` → traducciones (`common.json`, ~270 líneas cada uno)

Backend (zonas más importantes):

- `src/api/*` → content-types, controllers, routes, services por módulo
- `src/api/order/` → order, payment (TPV Redsys), utils de shipping
- `src/api/shipping-rate/` → content-type editable de tarifas de envío
- `src/index.js` → bootstrap; siembra `shipping-rate` con valores por defecto si la tabla está vacía
- `config/database.js` → conexión DB multi-cliente (mysql/postgres/sqlite)
- `config/server.js`, `config/middlewares.js` (CORS), `config/api.js` (paginación REST)

## 4) Comandos de trabajo

Backend:

```
cd backend-cillan-world
npm install
npm run develop     # dev con auto-reload
npm run build       # build del admin
npm run start        # producción
npm run console      # consola interactiva Strapi
npm run typecheck
npm run lint
```

Frontend:

```
cd frontend-cillan-world
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## 5) Variables de entorno

### Frontend (`frontend-cillan-world/.env.local`)

Documentadas en `.env.example`:
- `NEXT_PUBLIC_BACKEND_URL` → URL pública de Strapi (cliente)
- `STRAPI_URL` → URL de Strapi para server-side (opcional)
- `STRAPI_API_TOKEN` → token server-only para operaciones sensibles

Usadas en código pero **no documentadas** en `.env.example` (comprobar antes de asumir que existen en un entorno nuevo):
- `STRAPI_SERVER_API_TOKEN` / `STRAPI_READ_API_TOKEN` / `STRAPI_SERVER_TOKEN` (alternativas leídas en `lib/strapi-server.ts`)
- `NEXT_PUBLIC_SITE_URL` (usada en `ProductPageClient.tsx`)

### Backend (`backend-cillan-world/.env`)

Documentadas en `.env.example`:
- Seguridad Strapi: `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`
- DB: `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SCHEMA`, `DATABASE_SSL`
- Server: `HOST`, `PORT`, `PUBLIC_URL`, `FRONTEND_URL`, `FRONTEND_LOGO_URL`
- `EMAIL_USER`, `EMAIL_PASSWORD` → **no se usan en ningún código actual**, son vestigios

Usadas en código pero **faltantes en `.env.example`** (importante al desplegar un entorno nuevo):
- TPV Redsys: `REDSYS_MERCHANT_CODE`, `REDSYS_TERMINAL`, `REDSYS_SECRET_KEY`, `REDSYS_MERCHANT_URL_OK`, `REDSYS_MERCHANT_URL_KO`, `REDSYS_MERCHANT_URL_NOTIFY`, `REDSYS_SANDBOX_MODE`
- Email: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
- Otros: `CORS_ORIGIN`, `DATABASE_URL` (alternativa a las `DATABASE_*` sueltas)

## 6) Content-types Strapi

- `product`: `productName`, `slug`, `images`, `active`, `order`, `isFeatured`, `price`, `color`, `details`/`details_en`, `materials`/`materials_en`, `garmentCare`/`garmentCare_en`, relación con `category`, `imageUrl` (json). **Nuevo (último commit)**: `sizeType` (enum `alpha`/`numeric`, default `alpha`) y `sizeOptions` (json) para soportar tallas numéricas de calzado además de las alfa de ropa.
- `category`: `categoryName`, `slug`, relación manyToMany con `product`.
- `collection`: `collectionName`, `slug`, `description`/`description_en`, `images`, `order`, `imageUrl`.
- `home-image`: `homeImageName`, `slug`, `image`, `order`, `productSlug`, `imageUrl`.
- `order`: `products` (json), `status` (enum `pending`/`processing`/`paid`/`failed`/`refunded`), `totalAmount`, `currency`, `customerEmail`/`customerName`/`customerPhone`, `billingAddress`/`shippingAddress` (json), `notes`, `metadata` (json), `orderedAt`, `paymentMethod` (enum `card`/`wallet`/`bizum`/`transfer`), `tpvTransactionId`, `tpvAuthCode`.
- `shipping-rate` (**nuevo**, editable desde admin): `zoneKey` (enum único de 11 zonas: España peninsula/Baleares/Canarias, Europa cercana/central/norte-este, Norteamérica, Latinoamérica, Asia tier1/tier2, resto mundo), `zoneLabel`, `method`, `amount` (decimal ≥0), `currency` (default EUR), `active` (boolean).
- `contact` y `health`: sin schema propio, solo controller + ruta custom.

## 7) Rutas custom del backend

- `POST /api/payment/create-transaction` (sin auth) → crea transacción TPV
- `POST /api/payment/notification` (sin auth) → webhook Redsys, actualiza estado de la orden y dispara emails
- `GET /api/payment/check-order/:orderId` (sin auth) → estado del pedido
- `POST /api/contact/send-email` (sin auth) → envía correo vía Resend
- `GET /api/health` (sin auth) → healthcheck
- Resto de content-types (`product`, `category`, `collection`, `home-image`, `order`, `shipping-rate`) usan el router estándar de Strapi (`createCoreRouter`), sin rutas custom adicionales.

## 8) Flujo de pago TPV Redsys

Archivos clave: `src/api/order/controllers/payment.js`, `src/api/order/services/tpv.js`, `src/api/order/utils/shipping-rates.js`.

1. Frontend (`CartModal.tsx`): usuario acepta política de privacidad → `POST /api/orders` crea la orden (`status: pending`) → obtiene `orderId`.
2. Frontend (`CheckoutTPV.tsx`): captura nombre/email/teléfono + dirección de envío, calcula una **cotización estimada de envío en cliente** (`lib/shipping-rates.ts`, reactiva a país/provincia/ciudad/CP) solo a modo informativo, y hace `POST /api/payment/create-transaction` con `orderId`, datos de cliente y `shippingAddress` (no envía el importe de envío calculado).
3. Backend (`payment.js` → `createTransaction`): recalcula el subtotal desde los precios reales de los productos en catálogo (no confía en el precio del cliente), calcula el importe de envío server-side vía `getShippingQuote()` (usa `shipping-rate` de Strapi, con fallback a tabla hardcoded `SHIPPING_ZONES`), firma la transacción con la librería **`redsys-easy`** (`serializeAndSignJSONRequest`) y devuelve datos de redirección al TPV.
4. Frontend redirige (form POST oculto o `redirectURL`) a la pasarela Redsys.
5. Redsys llama de vuelta:
   - Usuario → `app/checkout/success` (redirige a `/success?orderId=...`) o `app/checkout/error`.
   - Webhook asíncrono → `POST /api/payment/notification`, valida firma con `deserializeAndVerifyJSONResponse` (`redsys-easy`), actualiza `status` a `paid`/`failed` y **envía emails transaccionales** (cliente + admin) vía Resend, con flags en `metadata` para evitar reenvíos duplicados.
6. `app/success/page.tsx` consulta `GET /api/payment/check-order/:orderId` y muestra el resultado final, limpiando el carrito (`removeAll()`) si el estado es `paid`/`processing`.

**Nota importante**: `tpv.js` expone funciones propias de firmado (`generateSignature`/`validateSignature`/`decodeParams`, cripto DES-EDE3+HMAC manual) que **no se usan** en el flujo real — la firma/verificación efectiva la hace `redsys-easy`. No asumir que esas funciones propias son la fuente de verdad; los documentos `TPV_INTEGRATION_GUIDE.md` de la raíz describen ese código legado como si fuera el vigente.

## 9) Cálculo de tarifas de envío

- Backend (fuente de verdad): `src/api/order/utils/shipping-rates.js`. Resuelve zona por país/provincia/ciudad/CP (detecta Baleares por CP `07xxx`, Canarias por `35xxx`/`38xxx` o nombre de isla). Tabla `SHIPPING_ZONES` hardcoded como fallback; `loadShippingRatesFromStrapi()` sobreescribe con los valores editables del content-type `shipping-rate`. `src/index.js` (bootstrap) siembra la tabla la primera vez que arranca si está vacía.
- Frontend (solo estimación visual): `lib/shipping-rates.ts`, misma lógica de zonas replicada en TS, consumida por `CheckoutTPV.tsx`. El importe final y vinculante siempre lo calcula el backend en `createTransaction`.
- Para cambiar precios de envío sin tocar código: editar el content-type `shipping-rate` desde el admin de Strapi.
- Si se añade una zona nueva, actualizar en ambos sitios (`utils/shipping-rates.js` y `lib/shipping-rates.ts`) para mantener la estimación del frontend coherente con el backend.

## 10) Rutas frontend relevantes (`app/`)

- `app/page.tsx` → home
- `app/catalog/[category]/page.tsx` + `CatalogClient.tsx` → catálogo por categoría
- `app/collection/[collection]/page.tsx` + `CollectionPageClient.tsx` → colecciones
- `app/product/[slug]/page.tsx` + `ProductPageClient.tsx` → ficha de producto (aquí vive la lógica de selección de talla: `sizeType`/`sizeOptions` del producto, con fallback a `36–46` para calzado o `S/M/L/XL` para ropa)
- `app/checkout/success/page.tsx` → solo redirige a `/success?...`
- `app/checkout/error/page.tsx` → pago cancelado/fallido
- `app/success/page.tsx` + `head.tsx` → resultado real del pago
- No existe `app/checkout/page.tsx`: el checkout se monta como modal (`CheckoutTPV` dentro de `CartModal`), no como ruta dedicada.
- Páginas legales: `app/about`, `app/cookiesPolicy`, `app/legalNotice`, `app/privacyPolicy`, `app/termsConditions`
- `app/layout.tsx`, `app/i18nProvider.tsx`, `app/robots.ts`, `app/sitemap.ts`

`next.config.ts`: `eslint.ignoreDuringBuilds: true` (errores de lint no bloquean build); `images.remotePatterns` incluye `localhost:1337`, `res.cloudinary.com`, `web-cillanworld.onrender.com`, `web-cillanworld.vercel.app`; `redirects()` normaliza URLs legales y `/catalog`; `headers()` añade `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.

## 11) Discrepancias documentación vs código (verificar antes de confiar en docs de raíz)

- `README.md` (raíz y backend) dice Next.js 14 y Node 18+; el código real usa Next `15.4.10` y `engines.node: "20.x"`.
- `TPV_INTEGRATION_GUIDE.md` describe el firmado con `tpv.js` (`generateSignature`/`validateSignature`); en realidad `payment.js` usa `redsys-easy`. Esas funciones propias existen pero están muertas.
- La guía menciona `REDSYS_MERCHANT_NAME` y `REDSYS_METHOD` como variables requeridas; no se referencian en ningún archivo del backend actual.
- `.env.example` de ambos proyectos está incompleto respecto a las variables realmente consumidas (ver sección 5): faltan todas las `REDSYS_*`, `RESEND_API_KEY`, `CONTACT_*`, `CORS_ORIGIN` en backend; y `STRAPI_SERVER_API_TOKEN`/`NEXT_PUBLIC_SITE_URL` en frontend.
- Los documentos de raíz (`CHECKOUT_TPV_USAGE.md`, `INTEGRATION_COMPLETE.md`, `TESTING_GUIDE.md`) describen una versión anterior del checkout (sin dirección de envío ni cálculo de tarifas); el flujo actual ya incluye `shippingAddress` y `shipping-rate`. Tratar esos documentos como historial, no como referencia vigente.
- `config/server.js` del backend contiene un `console.log('TRANSFER DEBUG'...)` de depuración que conviene revisar/eliminar si se toca ese archivo.

## 12) Convenciones prácticas para cambios

- Mantener imports `@/` en frontend.
- Preservar i18n ES/EN al tocar textos UI (`locales/es/common.json` y `locales/en/common.json`, namespaces: `general`, `navbar`, `common`, `checkout`, `bag`, `collection`, `footer`, `product`, `about`, `legal_notice`, `cookies_notice`, `terms_conditions`, `privacy_policy`).
- Evitar hardcodear URLs; usar variables de entorno y helpers existentes (`lib/api.ts`, `lib/media.ts`, `lib/strapi-server.ts`).
- En backend, seguir patrón Strapi por módulo: `content-types`, `controllers`, `routes`, `services`/`utils`.
- El importe de envío y el total de la orden **siempre se recalculan server-side** en `createTransaction`; no confiar en valores enviados desde el cliente para nada relacionado con dinero.
- Nunca exponer `REDSYS_SECRET_KEY` ni `RESEND_API_KEY` al frontend.
- No editar artefactos generados (`.next/`, `types/generated/`, `.strapi/`) salvo tarea explícita.

## 13) Dónde tocar según objetivo

- Nuevo campo de producto/colección: schema en `backend-cillan-world/src/api/.../content-types/.../schema.json`; ajustar consultas en `frontend-cillan-world/api/*.tsx` y/o `lib/strapi-server.ts`.
- Tallas de calzado/ropa: `product.sizeType`/`product.sizeOptions` (backend) + lógica de fallback en `app/product/[slug]/ProductPageClient.tsx` (frontend).
- Tarifas de envío: content-type `shipping-rate` (admin Strapi) para precios; `src/api/order/utils/shipping-rates.js` (backend, fuente de verdad) y `lib/shipping-rates.ts` (frontend, solo estimación) para lógica de zonas.
- Pago/TPV: `src/api/order/controllers/payment.js`, `src/api/order/services/tpv.js` (backend); `components/CheckoutTPV.tsx` (frontend).
- Emails transaccionales: `sendTransactionalEmail` en `payment.js` (pago) y `src/api/contact/controllers/contact.js` (contacto), ambos vía REST a Resend.
- Nuevo endpoint backend: `backend-cillan-world/src/api/<modulo>/routes` + `controllers`.
- Nueva página frontend: `frontend-cillan-world/app/<ruta>/page.tsx`.
- Lógica carrito: `frontend-cillan-world/hooks/use-cart.tsx` (Zustand + `persist` en `localStorage`, key `cart-storage`).

## 14) Checklist de validación tras cambios

- Frontend: `npm run typecheck` y `npm run lint`
- Backend: `npm run typecheck` y `npm run lint`
- Probar rutas críticas:
  - Home / catálogo / producto (incluyendo selección de talla para calzado y ropa)
  - Carrito → checkout → cotización de envío → redirección a Redsys sandbox (tarjeta test `4548812049400004`)
  - Webhook `/api/payment/notification` actualiza estado y dispara emails
  - Página `/success` y `/checkout/error`
  - Contacto (`/api/contact/send-email`)
  - Health (`/api/health`)
