'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { serializeAndSignJSONRequest, deserializeAndVerifyJSONResponse } = require('redsys-easy');
const { getShippingQuote, loadShippingRatesFromStrapi } = require('../utils/shipping-rates');

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_ADMIN_EMAIL = 'cillan-world@gmail.com';
const DEFAULT_FROM_EMAIL = 'Cillan <cillan.world@gmail.com>';
const DEFAULT_LOGO_PATH = '/images/logo-top.webp';

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));

const formatMoney = (amount, currency) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return 'N/A';
  }
  return `${numericAmount.toFixed(2)} ${currency || 'EUR'}`;
};

const buildLogoUrl = () => {
  const explicitUrl = String(process.env.FRONTEND_LOGO_URL || '').trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const baseUrl = String(process.env.FRONTEND_URL || '').trim();
  if (!baseUrl) {
    return null;
  }

  try {
    return new URL(DEFAULT_LOGO_PATH, baseUrl).toString();
  } catch (error) {
    return null;
  }
};

const formatAddressLines = (address) => {
  if (!address || typeof address !== 'object') {
    return [];
  }

  const preferredKeys = [
    'name',
    'fullName',
    'line1',
    'line2',
    'address',
    'street',
    'address1',
    'address2',
    'city',
    'state',
    'province',
    'postalCode',
    'zip',
    'country',
    'phone',
  ];

  const lines = [];
  const seen = new Set();

  preferredKeys.forEach((key) => {
    const rawValue = address[key];
    if (rawValue === undefined || rawValue === null) {
      return;
    }
    const value = String(rawValue).trim();
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    lines.push(value);
  });

  if (lines.length === 0) {
    Object.entries(address).forEach(([key, rawValue]) => {
      if (rawValue === undefined || rawValue === null) {
        return;
      }
      const value = String(rawValue).trim();
      if (!value || seen.has(value)) {
        return;
      }
      seen.add(value);
      lines.push(`${key}: ${value}`);
    });
  }

  return lines;
};

const formatProducts = (products) => {
  const items = Array.isArray(products) ? products : [];

  const htmlRows = items.map((item) => {
    const name = escapeHtml(item?.name || `Producto ${item?.id || ''}`.trim() || 'Producto');
    const quantity = Number(item?.quantity) || 1;
    const size = item?.size ? ` - Talla: ${escapeHtml(item.size)}` : '';
    const color = item?.color ? ` - Color: ${escapeHtml(item.color)}` : '';
    return `
      <tr>
        <td style="padding: 6px 0;">${name}${size}${color}</td>
        <td style="padding: 6px 0; text-align: right;">x${quantity}</td>
      </tr>
    `;
  }).join('');

  const textLines = items.map((item) => {
    const name = item?.name || `Producto ${item?.id || ''}`.trim() || 'Producto';
    const quantity = Number(item?.quantity) || 1;
    const size = item?.size ? ` - Talla: ${item.size}` : '';
    const color = item?.color ? ` - Color: ${item.color}` : '';
    return `- ${name}${size}${color} x${quantity}`;
  });

  return { htmlRows, textLines };
};

const buildEmailContent = (order, options) => {
  const logoUrl = options?.logoUrl;
  const logoMarkup = logoUrl
    ? `<img src="${logoUrl}" alt="Cillan World" style="max-width: 160px; height: auto; margin-bottom: 16px; display: block; background-color: #ffffff;" />`
    : '';

  const products = formatProducts(order.products);
  const pricing = (order.metadata && order.metadata.pricing) || {};
  const subtotalLabel = formatMoney(pricing.subtotalAmount, order.currency || 'EUR');
  const shippingLabel = formatMoney(pricing.shippingAmount, order.currency || 'EUR');
  const totalLabel = formatMoney(order.totalAmount, order.currency || 'EUR');

  const shippingLines = formatAddressLines(order.shippingAddress);
  const billingLines = formatAddressLines(order.billingAddress);

  return {
    logoMarkup,
    products,
    subtotalLabel,
    shippingLabel,
    totalLabel,
    shippingLines,
    billingLines,
  };
};

const buildCustomerEmail = (order, logoUrl) => {
  const content = buildEmailContent(order, { logoUrl });
  const subject = `Pedido confirmado - #${order.id}`;
  const customerName = escapeHtml(order.customerName || 'Cliente');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.4;">
      ${content.logoMarkup}
      <h2 style="margin: 0 0 12px;">Gracias por tu pedido</h2>
      <p>Hola ${customerName},</p>
      <p>Hemos recibido tu pedido y el pago se ha completado correctamente.</p>
      <p>Muchas gracias por tu compra. Esperamos que disfrutes de tu prenda.</p>
      <p><strong>Numero de pedido:</strong> #${escapeHtml(order.id)}</p>
      <h3 style="margin: 20px 0 8px;">Productos</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${content.products.htmlRows || '<tr><td>No hay productos en el pedido.</td></tr>'}
          <tr>
            <td style="padding-top: 10px; border-top: 1px solid #eee;">Subtotal</td>
            <td style="padding-top: 10px; border-top: 1px solid #eee; text-align: right;">${escapeHtml(content.subtotalLabel)}</td>
          </tr>
          <tr>
            <td>Envio</td>
            <td style="text-align: right;">${escapeHtml(content.shippingLabel)}</td>
          </tr>
          <tr>
            <td style="padding-top: 10px; border-top: 1px solid #eee;"><strong>Total</strong></td>
            <td style="padding-top: 10px; border-top: 1px solid #eee; text-align: right;"><strong>${escapeHtml(content.totalLabel)}</strong></td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 20px;">Si tienes alguna duda, responde a este correo.</p>
    </div>
  `;

  const text = `
Gracias por tu pedido

Hola ${order.customerName || 'Cliente'},
Hemos recibido tu pedido y el pago se ha completado correctamente.

Muchas gracias por tu compra!. Esperamos que disfrutes de tu prenda.

Numero de pedido: #${order.id}

Productos:
${content.products.textLines.join('\n') || '- (sin productos)'}

Subtotal: ${content.subtotalLabel}
Envio: ${content.shippingLabel}
Total: ${content.totalLabel}

Si tienes alguna duda, responde a este correo.
  `.trim();

  return { subject, html, text };
};

const buildAdminEmail = (order, logoUrl) => {
  const content = buildEmailContent(order, { logoUrl });
  const subject = `Nuevo pedido pagado - #${order.id}`;

  const shippingHtml = content.shippingLines.length
    ? content.shippingLines.map((line) => escapeHtml(line)).join('<br />')
    : 'N/A';
  const billingHtml = content.billingLines.length
    ? content.billingLines.map((line) => escapeHtml(line)).join('<br />')
    : 'N/A';

  const shippingText = content.shippingLines.length ? content.shippingLines.join('\n') : 'N/A';
  const billingText = content.billingLines.length ? content.billingLines.join('\n') : 'N/A';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.4;">
      ${content.logoMarkup}
      <h2 style="margin: 0 0 12px;">Nuevo pedido pagado</h2>
      <p><strong>Numero de pedido:</strong> #${escapeHtml(order.id)}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(order.customerName || 'N/A')}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customerEmail || 'N/A')}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(order.customerPhone || 'N/A')}</p>
      <h3 style="margin: 20px 0 8px;">Productos</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${content.products.htmlRows || '<tr><td>No hay productos en el pedido.</td></tr>'}
          <tr>
            <td style="padding-top: 10px; border-top: 1px solid #eee;">Subtotal</td>
            <td style="padding-top: 10px; border-top: 1px solid #eee; text-align: right;">${escapeHtml(content.subtotalLabel)}</td>
          </tr>
          <tr>
            <td>Envio</td>
            <td style="text-align: right;">${escapeHtml(content.shippingLabel)}</td>
          </tr>
          <tr>
            <td style="padding-top: 10px; border-top: 1px solid #eee;"><strong>Total</strong></td>
            <td style="padding-top: 10px; border-top: 1px solid #eee; text-align: right;"><strong>${escapeHtml(content.totalLabel)}</strong></td>
          </tr>
        </tbody>
      </table>
      <h3 style="margin: 20px 0 8px;">Direccion de envio</h3>
      <p>${shippingHtml}</p>
      <h3 style="margin: 20px 0 8px;">Direccion de facturacion</h3>
      <p>${billingHtml}</p>
    </div>
  `;

  const text = `
Nuevo pedido pagado

Numero de pedido: #${order.id}
Cliente: ${order.customerName || 'N/A'}
Email: ${order.customerEmail || 'N/A'}
Telefono: ${order.customerPhone || 'N/A'}

Productos:
${content.products.textLines.join('\n') || '- (sin productos)'}

Subtotal: ${content.subtotalLabel}
Envio: ${content.shippingLabel}
Total: ${content.totalLabel}

Direccion de envio:
${shippingText}

Direccion de facturacion:
${billingText}
  `.trim();

  return { subject, html, text };
};

const sendTransactionalEmail = async ({ to, subject, html, text, replyTo }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const fromEmail = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
      text,
      replyTo: replyTo || undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, error: `Resend error ${response.status}: ${body}` };
  }

  return { ok: true };
};

/**
 * Payment Controller para gestionar pagos con TPV-Virtual Redsys
 */
module.exports = {
  /**
   * POST /api/payment/create-transaction
   * Crea una transacción TPV y retorna los parámetros para redirigir
   *
   * Request body:
   * {
   *   orderId: number,
   *   customerName: string,
   *   customerEmail: string,
   *   customerPhone: string,
   *   totalAmount: number
   * }
   */
  async createTransaction(ctx) {
    try {
      const {
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        totalAmount,
        shippingAddress,
        billingAddress,
      } = ctx.request.body;

      // Validar datos
      if (!orderId || !customerEmail) {
        ctx.response.status = 400;
        return { error: 'Missing required fields: orderId, customerEmail' };
      }

      const normalizeAddress = (address) => {
        if (!address || typeof address !== 'object') {
          return null;
        }

        const normalized = {
          fullName: String(address.fullName || address.name || '').trim(),
          line1: String(address.line1 || address.address1 || address.address || '').trim(),
          line2: String(address.line2 || address.address2 || '').trim(),
          city: String(address.city || '').trim(),
          province: String(address.province || address.state || '').trim(),
          postalCode: String(address.postalCode || address.zip || '').trim(),
          country: String(address.country || '').trim(),
          phone: String(address.phone || '').trim(),
        };

        return normalized;
      };

      const normalizedShipping = normalizeAddress(shippingAddress);
      if (
        !normalizedShipping ||
        !normalizedShipping.line1 ||
        !normalizedShipping.city ||
        !normalizedShipping.province ||
        !normalizedShipping.postalCode ||
        !normalizedShipping.country
      ) {
        ctx.response.status = 400;
        return { error: 'Missing required shipping address fields' };
      }

      const normalizedBilling = normalizeAddress(billingAddress) || null;

      // Obtener la order de Strapi
      const order = await strapi.entityService.findOne('api::order.order', orderId);
      if (!order) {
        ctx.response.status = 404;
        return { error: `Order ${orderId} not found` };
      }

      // Verificar que la order no ha sido ya pagada
      if (order.status === 'paid') {
        ctx.response.status = 400;
        return { error: 'Order already paid' };
      }

      const resolveOrderTotal = async (orderData) => {
        const orderProducts = Array.isArray(orderData?.products) ? orderData.products : [];
        const productIds = orderProducts
          .map((item) => Number(item?.id))
          .filter((id) => Number.isFinite(id) && id > 0);

        if (productIds.length === 0) {
          return null;
        }

        const products = await strapi.entityService.findMany('api::product.product', {
          filters: { id: { $in: productIds } },
          fields: ['id', 'price'],
        });

        const priceById = new Map(
          (products || []).map((product) => [Number(product.id), Number(product.price) || 0])
        );

        return orderProducts.reduce((sum, item) => {
          const id = Number(item?.id);
          const quantity = Number(item?.quantity) || 1;
          const price = priceById.get(id) || 0;
          return sum + price * quantity;
        }, 0);
      };

      // Obtener el servicio TPV
      const tpvService = strapi.service('api::order.tpv');

      const existingMetadata = /** @type {any} */ (
        (order.metadata && typeof order.metadata === 'object') ? order.metadata : {}
      );
      const previousAttempts = Number(existingMetadata?.tpv_attempts || 0);
      const nextAttempt = previousAttempts + 1;
      const orderReference = tpvService.buildOrderReference(order.id, nextAttempt);

      // Construir parámetros de transacción
      const customer = {
        name: customerName || 'Customer',
        email: customerEmail,
        phone: customerPhone || '',
      };

      const computedSubtotal = await resolveOrderTotal(order);
      const normalizedSubtotalAmount = Number.isFinite(computedSubtotal) && computedSubtotal !== null
        ? computedSubtotal
        : Number(totalAmount);

      if (!Number.isFinite(normalizedSubtotalAmount) || normalizedSubtotalAmount <= 0) {
        ctx.response.status = 400;
        return { error: 'Order total is zero. Please check product prices.' };
      }

      const configuredRatesByZone = await loadShippingRatesFromStrapi(strapi);

      const shippingQuote = getShippingQuote({
        country: normalizedShipping.country,
        province: normalizedShipping.province,
        city: normalizedShipping.city,
        postalCode: normalizedShipping.postalCode,
      }, {
        ratesByZone: configuredRatesByZone,
      });

      const normalizedTotalAmount = Number((normalizedSubtotalAmount + Number(shippingQuote.amount || 0)).toFixed(2));

      const orderForPayment = {
        ...order,
        totalAmount: normalizedTotalAmount,
      };

      const transactionParams = tpvService.buildTransactionParams(orderForPayment, customer, orderReference);

      // DEBUG: Log transactionParams antes de firma
      console.log('[TPV-DEBUG] Transaction params being signed:', JSON.stringify(transactionParams, null, 2));

      // Firmar payload con implementación oficial de redsys-easy
      const signedPayload = serializeAndSignJSONRequest(
        process.env.REDSYS_SECRET_KEY,
        transactionParams
      );
      const paramBase64 = signedPayload.Ds_MerchantParameters;
      const signature = signedPayload.Ds_Signature;

      // DEBUG: Decodificar y mostrar exactamente qué se está enviando a Redsys
      try {
        const decodedParams = Buffer.from(paramBase64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        console.log('[TPV-DEBUG] Base64URL decoded merchant params:', decodedParams);
        console.log('[TPV-DEBUG] Signature generated:', signature);
        console.log('[TPV-DEBUG] Signature length:', signature.length );
      } catch (e) {
        console.log('[TPV-DEBUG] Could not decode params:', e.message);
      }

      // Registrar la transacción en metadata
      await strapi.entityService.update('api::order.order', orderId, {
        data: {
          totalAmount: normalizedTotalAmount,
          currency: order.currency || 'EUR',
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: normalizedShipping,
          billingAddress: normalizedBilling || order.billingAddress || null,
          tpvTransactionId: orderReference,
          metadata: {
            ...existingMetadata,
            pricing: {
              subtotalAmount: Number(normalizedSubtotalAmount.toFixed(2)),
              shippingAmount: Number(shippingQuote.amount || 0),
              totalAmount: normalizedTotalAmount,
              shippingZone: shippingQuote.zoneKey,
              shippingZoneLabel: shippingQuote.zoneLabel,
              shippingMethod: shippingQuote.method,
              shippingCurrency: shippingQuote.currency,
            },
            tpv_attempts: nextAttempt,
            last_tpv_transaction: {
              timestamp: new Date().toISOString(),
              orderReference,
              attempt: nextAttempt,
              paramBase64,
              status: 'created',
            },
          },
          status: 'processing',
        },
      });

      // Construir URL de redirección
      const tpvEndpoint = tpvService.getTPVEndpoint();
      const redirectURL = tpvService.buildRedirectURL(paramBase64, signature);

      ctx.body = {
        success: true,
        tpvEndpoint,
        tpvParams: signedPayload,
        redirectURL,
        orderId,
        subtotalAmount: Number(normalizedSubtotalAmount.toFixed(2)),
        shippingAmount: Number(shippingQuote.amount || 0),
        totalAmount: normalizedTotalAmount,
        shipping: shippingQuote,
        paramBase64,
        signature,
      };
    } catch (error) {
      strapi.log.error('Error creating transaction:', error);
      ctx.response.status = 500;
      ctx.body = { error: error.message };
    }
  },

  /**
   * POST /api/payment/notification
   * Webhook asíncrono que recibe la notificación del resultado de pago del TPV
   * Se dispara tanto si el pago fue exitoso como si falló
   *
   * Request body (formulario):
   * - Ds_SignVersion: string (versión de firma)
   * - Ds_MerchantParameters: string (params en Base64)
   * - Ds_Signature: string (firma)
   */
  async notification(ctx) {
    try {
      const {
        Ds_SignVersion,
        Ds_SignatureVersion,
        Ds_MerchantParameters,
        Ds_Signature,
      } = ctx.request.body;

      if (!Ds_MerchantParameters || !Ds_Signature) {
        ctx.response.status = 400;
        return { error: 'Missing signature parameters' };
      }

      // Validación/parseo robusto de firma y merchant parameters
      let params;
      try {
        params = /** @type {any} */ (deserializeAndVerifyJSONResponse(process.env.REDSYS_SECRET_KEY, {
          Ds_SignatureVersion: Ds_SignatureVersion || Ds_SignVersion || 'HMAC_SHA256_V1',
          Ds_MerchantParameters,
          Ds_Signature,
        }));
      } catch (parseError) {
        strapi.log.warn('Invalid TPV signature received');
        ctx.response.status = 400;
        return { error: 'Invalid signature' };
      }

      // Extraer datos relevantes
      const dsOrder = params.Ds_Order || params.DS_ORDER || params.DS_MERCHANT_ORDER;
      const dsAuthCode =
        params.Ds_AuthorisationCode ||
        params.DS_AUTHORISATIONCODE ||
        params.DS_MERCHANT_AUTHCODE;
      const dsResponseCode = params.Ds_Response || params.DS_RESPONSE || params.DS_MERCHANT_RESPONSE;
      const dsTransactionType =
        params.Ds_TransactionType ||
        params.DS_TRANSACTIONTYPE ||
        params.DS_MERCHANT_TRANSACTIONTYPE;
      const dsAmount = params.Ds_Amount || params.DS_AMOUNT || params.DS_MERCHANT_AMOUNT;
      const dsCurrency = params.Ds_Currency || params.DS_CURRENCY || params.DS_MERCHANT_CURRENCY;
      const dsSecurePayment =
        params.Ds_SecurePayment ||
        params.DS_SECUREPAYMENT ||
        params.DS_MERCHANT_SECUREPAYMENT;
      const dsCrc = params.Ds_Control_00000000 || params.DS_CONTROL_00000000 || params.DS_MERCHANT_CRC;

      if (!dsOrder) {
        ctx.response.status = 400;
        return { error: 'Order reference missing in TPV response' };
      }

      const tpvService = strapi.service('api::order.tpv');
      const matchingOrders = await strapi.entityService.findMany('api::order.order', {
        filters: { tpvTransactionId: dsOrder },
        limit: 1,
      });
      let order = matchingOrders && matchingOrders.length ? matchingOrders[0] : null;

      if (!order) {
        const orderId = tpvService.getOrderIdFromReference(dsOrder);
        if (!orderId) {
          ctx.response.status = 400;
          return { error: 'Order reference missing in TPV response' };
        }
        order = await strapi.entityService.findOne('api::order.order', orderId);
      }

      if (!order) {
        strapi.log.warn(`Order not found for TPV reference ${dsOrder}`);
        ctx.response.status = 404;
        return { error: `Order not found for TPV reference ${dsOrder}` };
      }

      // Códigos de respuesta TPV (0 = OK, cualquier otro = error)
      const numericResponseCode = Number(dsResponseCode);
      const isSuccessful = Number.isFinite(numericResponseCode)
        ? numericResponseCode >= 0 && numericResponseCode <= 99
        : dsResponseCode === '0000';

      // Actualizar estado de la order
      // @ts-ignore - newStatus es un string válido del enum
      let newStatus = isSuccessful ? 'paid' : 'failed';
      let errorMessage = null;

      if (!isSuccessful) {
        // Mapear códigos de error TPV
        errorMessage = `TPV Response Code: ${dsResponseCode}`;
      }

      // Actualizar order con la respuesta del TPV
      const existingMetadata = /** @type {any} */ (
        (order.metadata && typeof order.metadata === 'object') ? order.metadata : {}
      );
      const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
        data: {
          // @ts-ignore - newStatus se calcula desde códigos Redsys y es válido para el enum
          status: newStatus,
          tpvTransactionId: dsOrder,
          tpvAuthCode: dsAuthCode || null,
          metadata: {
            ...existingMetadata,
            tpv_response: {
              timestamp: new Date().toISOString(),
              authCode: dsAuthCode,
              responseCode: dsResponseCode,
              transactionType: dsTransactionType,
              amount: dsAmount,
              currency: dsCurrency,
              securepayment: dsSecurePayment,
              crc: dsCrc,
              isSuccessful,
              errorMessage,
            },
          },
        },
      });

      if (isSuccessful) {
        const metadataAfterUpdate = /** @type {any} */ (
          (updatedOrder?.metadata && typeof updatedOrder.metadata === 'object')
            ? updatedOrder.metadata
            : existingMetadata
        );
        const emailFlags = /** @type {any} */ (metadataAfterUpdate.email_notifications || {});
        const logoUrl = buildLogoUrl();
        const adminEmail = process.env.CONTACT_TO_EMAIL || DEFAULT_ADMIN_EMAIL;
        const orderForEmail = updatedOrder || order;

        let customerSent = Boolean(emailFlags.customerSent);
        let adminSent = Boolean(emailFlags.adminSent);

        try {
          if (!customerSent && isValidEmail(orderForEmail.customerEmail)) {
            const customerEmailContent = buildCustomerEmail(orderForEmail, logoUrl);
            const customerResult = await sendTransactionalEmail({
              to: orderForEmail.customerEmail,
              subject: customerEmailContent.subject,
              html: customerEmailContent.html,
              text: customerEmailContent.text,
              replyTo: adminEmail,
            });
            customerSent = customerResult.ok;
            if (!customerResult.ok) {
              strapi.log.warn(`Customer email failed for order ${order.id}: ${customerResult.error}`);
            }
          }

          if (!adminSent && isValidEmail(adminEmail)) {
            const adminEmailContent = buildAdminEmail(orderForEmail, logoUrl);
            const adminResult = await sendTransactionalEmail({
              to: adminEmail,
              subject: adminEmailContent.subject,
              html: adminEmailContent.html,
              text: adminEmailContent.text,
              replyTo: orderForEmail.customerEmail || undefined,
            });
            adminSent = adminResult.ok;
            if (!adminResult.ok) {
              strapi.log.warn(`Admin email failed for order ${order.id}: ${adminResult.error}`);
            }
          }
        } catch (emailError) {
          strapi.log.error('Unexpected error sending payment emails:', emailError);
        }

        if (customerSent || adminSent) {
          await strapi.entityService.update('api::order.order', order.id, {
            data: {
              metadata: {
                ...metadataAfterUpdate,
                email_notifications: {
                  ...emailFlags,
                  customerSent: customerSent || emailFlags.customerSent,
                  adminSent: adminSent || emailFlags.adminSent,
                  sentAt: new Date().toISOString(),
                },
              },
            },
          });
        }
      }

      strapi.log.info(
        `TPV Notification processed: Order ${order.id} - Status: ${newStatus} (Response: ${dsResponseCode})`
      );

      ctx.body = { success: true, orderId: order.id, newStatus };
    } catch (error) {
      strapi.log.error('Error processing TPV notification:', error);
      ctx.response.status = 500;
      ctx.body = { error: error.message };
    }
  },

  /**
   * GET /api/payment/check-order/:orderId
   * Consulta el estado actual de una order (para validación en página success)
   */
  async checkOrder(ctx) {
    try {
      const { orderId } = ctx.params;

      const order = await strapi.entityService.findOne('api::order.order', orderId);

      if (!order) {
        ctx.response.status = 404;
        return { error: `Order ${orderId} not found` };
      }

      const metadata = /** @type {any} */ (
        (order.metadata && typeof order.metadata === 'object') ? order.metadata : {}
      );

      ctx.body = {
        success: true,
        orderId,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        pricing: metadata.pricing || null,
        customerEmail: order.customerEmail,
        metadata: order.metadata,
      };
    } catch (error) {
      strapi.log.error('Error checking order:', error);
      ctx.response.status = 500;
      ctx.body = { error: error.message };
    }
  },
};
