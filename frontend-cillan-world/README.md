# Frontend - Cillan World

Aplicacion web construida con **Next.js 14**, **TypeScript** y **TailwindCSS**. Consume contenido editorial y de catalogo desde Strapi.

## Requisitos previos

- Node.js 18+
- Acceso a una instancia de Strapi con el content-type `order` publicado y permisos para crear pedidos mediante un token de API

## Configuracion

1. Copia el archivo de ejemplo `.env.example` y rellena con tus valores reales:

   ```bash
   cp .env.example .env.local
   ```

   Variables principales:

   | Variable | Descripcion |
   | --- | --- |
   | `NEXT_PUBLIC_BACKEND_URL` | URL publica del CMS Strapi desde la que se sirven productos e imagenes. |
   | `STRAPI_URL` | URL de Strapi accesible desde el servidor (puede coincidir con la publica). |
   | `STRAPI_API_TOKEN` | Token de API de Strapi con permiso para crear ordenes. No debe marcarse como `NEXT_PUBLIC`. |

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La aplicacion estara disponible en `http://localhost:3000`.

## Scripts disponibles

- `npm run dev`: arranca el entorno de desarrollo.
- `npm run build`: genera el build para produccion.
- `npm run start`: ejecuta el servidor en modo produccion (requiere `npm run build` previo).

## Despliegue

Consulta la [documentacion oficial de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para detalles sobre despliegue en plataformas como Vercel. Recuerda suministrar las variables de entorno anteriores tanto en tiempo de build como en tiempo de ejecucion.
