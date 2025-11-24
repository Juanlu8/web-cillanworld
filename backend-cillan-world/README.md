# Backend - Cillan World (Strapi)

Instancia de Strapi responsable de gestionar el catalogo, colecciones y ordenes de compra del e-commerce.

## Requisitos previos

- Node.js 18+
- PostgreSQL (o la base de datos que definas en `DATABASE_CLIENT`)

## Configuracion

1. Copia el archivo de variables de entorno y rellena los valores obligatorios:

   ```bash
   cp .env.example .env
   ```

   Variables criticas:

   | Variable | Descripcion |
   | --- | --- |
   | `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Claves necesarias para arrancar Strapi con seguridad. Usa valores unicos por entorno. |
   | `DATABASE_*` | Credenciales de la base de datos. No se proporcionan valores por defecto para evitar exponer secretos. |

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Arranca Strapi en modo desarrollo:

   ```bash
   npm run develop
   ```

   El panel de administracion estara disponible en `http://localhost:1337/admin`.

## Notas de seguridad

- No dejes credenciales ni claves en el repositorio. Usa variables de entorno o gestores de secretos.
- El endpoint `api::order.order` espera que las peticiones incluyan un token de API (`Authorization: Bearer <token>`). Configura los roles o tokens necesarios en el panel de Strapi.
- Asegurate de rotar cualquier contrasena que se haya publicado previamente.

## Despliegue

Consulta la [documentacion oficial de Strapi](https://docs.strapi.io/dev-docs/deployment) para revisar las opciones de despliegue (Strapi Cloud, plataformas PaaS, contenedores, etc.). Durante el despliegue asegurate de suministrar todas las variables del archivo `.env.example`.
