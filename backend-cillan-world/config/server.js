console.log('TRANSFER DEBUG', {
  enableTransfers: process.env.STRAPI_ENABLE_TRANSFERS,
  enableRemote: process.env.STRAPI_ENABLE_REMOTE_DATA_TRANSFER,
  salt: process.env.TRANSFER_TOKEN_SALT,
  saltStrapi: process.env.STRAPI_TRANSFER_TOKEN_SALT,
});

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://web-cillanworld.onrender.com'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  transfer: {
  token: { salt: env('TRANSFER_TOKEN_SALT', env('STRAPI_TRANSFER_TOKEN_SALT')) },
  enabled: true,
  },
});
