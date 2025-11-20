# Frontend – Cillan World

Aplicación web construida con **Next.js 14**, **TypeScript** y **TailwindCSS**. Consume el contenido editorial y de catálogo publicado en Strapi y delega el checkout en Stripe a través de un endpoint interno.

## Requisitos previos

- Node.js 18+
- Acceso a una instancia de Strapi con el content-type `order` publicado y permisos para crear pedidos mediante un token de API
- Claves de Stripe (publishable + secret)

## Configuración

1. Copia el archivo de ejemplo `.env.example` y rellénalo con tus valores reales:

   ```bash
   cp .env.example .env.local
   ```

   Variables principales:

   | Variable | Descripción |
   | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | URL pública del CMS Strapi desde la que se sirven productos e imágenes. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe usada por Stripe.js en el navegador. |
| `STRAPI_URL` | URL de Strapi accesible desde el servidor (puede coincidir con la pública). |
| `STRAPI_API_TOKEN` | Token de API de Strapi con permiso para crear órdenes. No debe marcarse como `NEXT_PUBLIC`. |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe usada por el endpoint `/api/orders/session` para comprobar el estado real de un checkout. |

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`.

## Flujo de pagos

El componente `CartModal` llama a `/api/orders`, un handler de Next.js que reenvía la orden al endpoint de Strapi usando `STRAPI_API_TOKEN`. Esta capa evita exponer la clave secreta en el bundle público.

Asegúrate de que tu token de Strapi incluya permisos de creación sobre `api::order.order` y que el backend tenga configurado `STRIPE_KEY` y `CLIENT_URL`.

## Scripts disponibles

- `npm run dev`: arranca el entorno de desarrollo.
- `npm run build`: genera el build para producción.
- `npm run start`: ejecuta el servidor en modo producción (requiere `npm run build` previo).

## Despliegue

Consulta la [documentación oficial de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para detalles sobre despliegue en plataformas como Vercel. No olvides proporcionar las variables de entorno anteriores tanto en tiempo de build como en tiempo de ejecución.
