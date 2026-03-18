module.exports = ({ env }) => [
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      origin: env.array("CORS_ORIGIN", [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://www.cillan.world",
        "https://cillan.world",
      ]),
      credentials: true,
      headers: ["Content-Type", "Authorization", "Origin", "Accept"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
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