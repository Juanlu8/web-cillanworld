# Backend – Cillan World (Strapi)

Instancia de Strapi responsable de gestionar el catálogo, colecciones y órdenes de compra del e-commerce. Incluye la lógica para crear sesiones de Stripe Checkout y registrar las órdenes en la base de datos.

## Requisitos previos

- Node.js 18+
- PostgreSQL (o la base de datos que definas en `DATABASE_CLIENT`)
- Claves de Stripe con permisos de Checkout

## Configuración

1. Copia el archivo de variables de entorno y rellena los valores obligatorios:

   ```bash
   cp .env.example .env
   ```

   Variables críticas:

   | Variable | Descripción |
   | --- | --- |
   | `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Claves necesarias para arrancar Strapi con seguridad. Usa valores únicos por entorno. |
   | `STRIPE_KEY` | Clave secreta de Stripe utilizada para crear sesiones de checkout. |
   | `CLIENT_URL` | URL pública del frontend (usada para redirecciones de éxito/cancelación). |
   | `DATABASE_*` | Credenciales de la base de datos. No se proporcionan valores por defecto para evitar exponer secretos. |

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Arranca Strapi en modo desarrollo:

   ```bash
   npm run develop
   ```

   El panel de administración estará disponible en `http://localhost:1337/admin`.

## Notas de seguridad

- No dejes credenciales ni claves en el repositorio. Usa variables de entorno o gestores de secretos.
- El endpoint `api::order.order` espera que las peticiones incluyan un token de API (`Authorization: Bearer <token>`). Configura los roles o tokens necesarios en el panel de Strapi.
- Asegúrate de rotar cualquier contraseña que se haya publicado previamente.

## Despliegue

Consulta la [documentación oficial de Strapi](https://docs.strapi.io/dev-docs/deployment) para revisar las opciones de despliegue (Strapi Cloud, plataformas PaaS, contenedores, etc.). Durante el despliegue asegúrate de suministrar todas las variables del archivo `.env.example`.
