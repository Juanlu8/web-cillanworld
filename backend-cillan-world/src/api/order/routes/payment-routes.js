'use strict';

/**
 * payment routes
 * Rutas personalizadas para el controller de pagos TPV-Virtual
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/payment/create-transaction',
      handler: 'payment.createTransaction',
      config: {
        auth: false, // Público, sin autenticación
      },
    },
    {
      method: 'POST',
      path: '/payment/notification',
      handler: 'payment.notification',
      config: {
        auth: false, // Webhook del TPV, sin autenticación
      },
    },
    {
      method: 'GET',
      path: '/payment/check-order/:orderId',
      handler: 'payment.checkOrder',
      config: {
        auth: false, // Público para que el cliente pueda revisar estado
      },
    },
  ],
};
