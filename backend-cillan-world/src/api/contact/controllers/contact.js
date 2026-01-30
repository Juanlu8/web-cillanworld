'use strict';

const nodemailer = require('nodemailer');

module.exports = {
  async sendEmail(ctx) {
    try {
      const { from, comments } = ctx.request.body;

      // Validación
      if (!from || !comments) {
        return ctx.badRequest('Email y comentarios son obligatorios');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(from)) {
        return ctx.badRequest('Formato de email inválido');
      }

      // Configurar transporter de nodemailer
      // IMPORTANTE: Configura estas variables de entorno en tu .env
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER || 'cillan.world@gmail.com',
          pass: process.env.EMAIL_PASSWORD // Contraseña de aplicación de Gmail
        },
        tls: {
          rejectUnauthorized: false // Ignora errores de certificados en desarrollo
        }
      });

      // Enviar email
      await transporter.sendMail({
        from: from,
        to: 'cillan.world@gmail.com',
        subject: `Nuevo mensaje desde el formulario de la web - ${from}`,
        text: comments,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Nuevo mensaje desde el formulario de la web</h2>
            <p><strong>De:</strong> ${from}</p>
            <p><strong>Mensaje:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${comments.replace(/\n/g, '<br>')}
            </div>
          </div>
        `,
        replyTo: from
      });

      ctx.send({ message: 'Email enviado correctamente' });
    } catch (error) {
      console.error('Error al enviar email:', error);
      ctx.internalServerError('Error al enviar el email');
    }
  }
};
