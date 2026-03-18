'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { serializeAndSignJSONRequest, deserializeAndVerifyJSONResponse } = require('redsys-easy');

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
      const { orderId, customerName, customerEmail, customerPhone, totalAmount } = ctx.request.body;

      // Validar datos
      if (!orderId || !customerEmail) {
        ctx.response.status = 400;
        return { error: 'Missing required fields: orderId, customerEmail' };
      }

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

      const computedTotal = await resolveOrderTotal(order);
      const normalizedTotalAmount = Number.isFinite(computedTotal) && computedTotal !== null
        ? computedTotal
        : Number(totalAmount);

      if (!Number.isFinite(normalizedTotalAmount) || normalizedTotalAmount <= 0) {
        ctx.response.status = 400;
        return { error: 'Order total is zero. Please check product prices.' };
      }

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
          tpvTransactionId: orderReference,
          metadata: {
            ...existingMetadata,
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

      ctx.body = {
        success: true,
        orderId,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
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
