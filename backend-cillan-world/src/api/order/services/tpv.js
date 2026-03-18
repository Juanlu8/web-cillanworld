'use strict';

const crypto = require('crypto');

function normalizeBase64(value) {
  const raw = String(value || '').replace(/-/g, '+').replace(/_/g, '/').trim();
  const padLength = (4 - (raw.length % 4)) % 4;
  return raw + '='.repeat(padLength);
}

function toBase64UrlFromBase64(value) {
  return String(value || '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function toBase64UrlFromUtf8(value) {
  return toBase64UrlFromBase64(Buffer.from(String(value || ''), 'utf8').toString('base64'));
}

function logError(message, error) {
  if (global.strapi && global.strapi.log) {
    global.strapi.log.error(message, error);
    return;
  }
  console.error(message, error);
}

function appendQueryParam(baseUrl, key, value) {
  const url = new URL(baseUrl);
  url.searchParams.set(key, value);
  return url.toString();
}

/**
 * Servicio para gestionar la integración con TPV-Virtual Redsys
 * Guía: RS.TE.CEL.MAN.0036 v2.2
 */
module.exports = {
  buildOrderReference(orderId, attemptNumber = 1) {
    const baseId = String(orderId || '').replace(/\D/g, '');
    if (!baseId) {
      throw new Error('Invalid order id for TPV reference');
    }

    const attempt = Number(attemptNumber);
    if (!Number.isFinite(attempt) || attempt < 1 || attempt > 99) {
      throw new Error('Invalid TPV attempt number');
    }

    const orderPart = baseId.padStart(10, '0').slice(-10);
    const attemptPart = String(Math.trunc(attempt)).padStart(2, '0');

    return `${orderPart}${attemptPart}`;
  },

  buildReturnUrl(baseUrl, orderId) {
    if (!baseUrl) {
      throw new Error('Missing Redsys return URL configuration');
    }

    return appendQueryParam(baseUrl, 'orderId', String(orderId));
  },

  buildNotificationUrl() {
    const explicitUrl = process.env.REDSYS_MERCHANT_URL_NOTIFY || process.env.REDSYS_MERCHANT_URL_NOTIFICATION;
    if (explicitUrl) {
      return explicitUrl;
    }

    const publicUrl = process.env.PUBLIC_URL;
    if (!publicUrl) {
      return null;
    }

    return new URL('/api/payment/notification', publicUrl).toString();
  },

  getOrderIdFromReference(orderReference) {
    const numeric = String(orderReference || '').replace(/\D/g, '');
    if (!numeric) {
      return null;
    }

    if (numeric.length === 12) {
      return Number.parseInt(numeric.slice(0, 10), 10);
    }

    return Number.parseInt(numeric, 10);
  },

  _getSecretKey() {
    const secretKey = process.env.REDSYS_SECRET_KEY;
    if (!secretKey) {
      throw new Error('REDSYS_SECRET_KEY not configured');
    }

    const keyBuffer = Buffer.from(normalizeBase64(secretKey), 'base64');
    if (![16, 24].includes(keyBuffer.length)) {
      throw new Error('REDSYS_SECRET_KEY is invalid. Expected Base64 key of 16 or 24 bytes');
    }

    return keyBuffer.length === 16
      ? Buffer.concat([keyBuffer, keyBuffer.slice(0, 8)])
      : keyBuffer;
  },

  _deriveOrderKey(orderReference) {
    const key = this._getSecretKey();
    const iv = Buffer.alloc(8, 0);
    const normalizedOrder = String(orderReference || '');

    const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
    cipher.setAutoPadding(true);

    return Buffer.concat([
      cipher.update(normalizedOrder, 'utf8'),
      cipher.final(),
    ]);
  },

  encodeMerchantParameters(params) {
    return toBase64UrlFromUtf8(JSON.stringify(params));
  },

  generateSignature(paramsOrBase64, orderReferenceArg) {
    const paramBase64 =
      typeof paramsOrBase64 === 'string'
        ? paramsOrBase64
        : this.encodeMerchantParameters(paramsOrBase64);

    const orderReference =
      orderReferenceArg ||
      (typeof paramsOrBase64 === 'object' ? paramsOrBase64.DS_MERCHANT_ORDER : null);

    if (!orderReference) {
      throw new Error('Missing DS_MERCHANT_ORDER to generate Redsys signature');
    }

    const orderKey = this._deriveOrderKey(orderReference);

    const signature = crypto
      .createHmac('sha256', orderKey)
      .update(paramBase64)
      .digest('base64');

    return toBase64UrlFromBase64(signature);
  },

  validateSignature(paramBase64, signature) {
    try {
      const params = this.decodeParams(paramBase64);
      const orderReference =
        params?.Ds_Order ||
        params?.DS_ORDER ||
        params?.DS_MERCHANT_ORDER;

      if (!orderReference) {
        return false;
      }

      const expectedSignature = this.generateSignature(paramBase64, orderReference);

      return normalizeBase64(signature) === normalizeBase64(expectedSignature);
    } catch (error) {
      logError('Signature validation error:', error);
      return false;
    }
  },

  decodeParams(paramBase64) {
    try {
      const json = Buffer.from(normalizeBase64(paramBase64), 'base64').toString('utf8');
      return JSON.parse(json);
    } catch (error) {
      logError('Param decode error:', error);
      return null;
    }
  },

  buildTransactionParams(order, customer, orderReferenceArg) {
    const merchantCode = process.env.REDSYS_MERCHANT_CODE;
    const terminal = process.env.REDSYS_TERMINAL;

    if (!merchantCode || !terminal) {
      throw new Error('REDSYS_MERCHANT_CODE or REDSYS_TERMINAL not configured');
    }

    const orderReference = orderReferenceArg || this.buildOrderReference(order.id, 1);
    const amountInCents = Math.round(Number(order.totalAmount || 0) * 100);

    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
       throw new Error(`Invalid order amount for TPV: ${amountInCents}`);
    }

    // CRITICAL FIX: Include mandatory redirect URLs
    // SIS0042 error was caused by missing DS_MERCHANT_URLOK/URLKO
    const urlOk = this.buildReturnUrl(process.env.REDSYS_MERCHANT_URL_OK, order.id);
    const urlKo = this.buildReturnUrl(process.env.REDSYS_MERCHANT_URL_KO, order.id);
    const merchantUrl = this.buildNotificationUrl();

    const params = {
      DS_MERCHANT_AMOUNT: String(amountInCents),
      DS_MERCHANT_ORDER: orderReference,
      DS_MERCHANT_MERCHANTCODE: merchantCode,
      DS_MERCHANT_CURRENCY: '978',
      DS_MERCHANT_TRANSACTIONTYPE: '0',
      DS_MERCHANT_TERMINAL: terminal,
      DS_MERCHANT_URLOK: urlOk,
      DS_MERCHANT_URLKO: urlKo,
      DS_MERCHANT_MERCHANTURL: merchantUrl || urlOk,
    };

    return params;
  },

  getTPVEndpoint() {
    const isSandbox = process.env.REDSYS_SANDBOX_MODE === 'true';
    return isSandbox
      ? 'https://sis-t.redsys.es:25443/sis/realizarPago'
      : 'https://sis.redsys.es/sis/realizarPago';
  },

  buildRedirectURL(paramBase64, signature) {
    const baseURL = this.getTPVEndpoint();

    const params = new URLSearchParams({
      Ds_SignatureVersion: 'HMAC_SHA256_V1',
      Ds_MerchantParameters: paramBase64,
      Ds_Signature: signature,
    });

        return `${baseURL}?${params.toString()}`;
  },

  recordTPVTransaction(order, tpvData) {
    if (!order.metadata) {
      order.metadata = {};
    }

    if (!order.metadata.tpv_transactions) {
      order.metadata.tpv_transactions = [];
    }

    order.metadata.tpv_transactions.push({
      timestamp: new Date().toISOString(),
      ...tpvData,
    });
  },
};
