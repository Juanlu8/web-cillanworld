'use strict';

module.exports = {
  async sendEmail(ctx) {
    try {
      const { from, comments } = ctx.request.body;

      // Validacion
      if (!from || !comments) {
        return ctx.badRequest('Email y comentarios son obligatorios');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(from)) {
        return ctx.badRequest('Formato de email invalido');
      }

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.error('Falta RESEND_API_KEY en el entorno');
        return ctx.internalServerError('Servicio de email no configurado');
      }

      const toEmail = process.env.CONTACT_TO_EMAIL || 'cillan.world@gmail.com';
      const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

      const subject = `Nuevo mensaje desde el formulario de la web - ${from}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Nuevo mensaje desde el formulario de la web</h2>
          <p><strong>De:</strong> ${from}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${comments.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject,
          html,
          text: comments,
          replyTo: from
        })
      });

      if (!response.ok) {
        const body = await response.text();
        console.error('Error al enviar email:', response.status, body);
        return ctx.internalServerError('Error al enviar el email');
      }

      ctx.send({ message: 'Email enviado correctamente' });
    } catch (error) {
      console.error('Error al enviar email:', error);
      ctx.internalServerError('Error al enviar el email');
    }
  }
};
