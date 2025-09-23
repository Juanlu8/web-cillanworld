module.exports = ({ env }) => [
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      origin: env.array("CORS_ORIGINS", ["http://localhost:3000"]),
      headers: ["Content-Type", "Authorization", "Origin", "Accept"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      // credentials: env.bool("CORS_CREDENTIALS", false),
    },
  },
  "strapi::security",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  'strapi::session',
  "strapi::favicon",
  "strapi::public",
];