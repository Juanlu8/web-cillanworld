// config/plugins.js
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer', // <-- este nombre mapea al paquete @strapi/provider-email-nodemailer
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env.int('SMTP_PORT', 587),
        secure: env.bool('SMTP_SECURE', false), // true si usas 465
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASS'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'no-reply@tudominio.com'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLYTO', 'soporte@tudominio.com'),
      },
    },
  },
});