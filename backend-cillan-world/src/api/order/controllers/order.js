'use strict';

// @ts-nocheck  // evita conflictos de tipos entre ESM y CJS

const Stripe = require('stripe').default;  // ⚡ importa la clase real

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request.body || {};
    const payload = body.data ?? body;
    const { products } = payload; // [{ id, quantity? }]

    try {
      if (!process.env.STRIPE_KEY) {
        ctx.response.status = 500;
        return { error: 'Stripe key not configured' };
      }

      if (!process.env.CLIENT_URL) {
        ctx.response.status = 500;
        return { error: 'Client URL not configured' };
      }

      const stripe = new Stripe(process.env.STRIPE_KEY);
      const clientUrl = process.env.CLIENT_URL.replace(/\/$/, '');

      if (!Array.isArray(products) || products.length === 0) {
        ctx.response.status = 400;
        return { error: 'Order must include at least one product' };
      }

      const invalidProduct = products.find(
        (p) =>
          typeof p !== 'object' ||
          typeof p.id !== 'number' ||
          (p.quantity !== undefined && typeof p.quantity !== 'number')
      );

      if (invalidProduct) {
        ctx.response.status = 400;
        return { error: 'Each product must include a numeric id and quantity' };
      }

      const lineItems = await Promise.all(
        products.map(async (p) => {
          // Busca el producto en Strapi
          const item = await strapi.entityService.findOne('api::product.product', p.id);
          if (!item) {
            throw new Error(`Product ${p.id} not found`);
          }

          return {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `${item.productName} (${p.size || 'N/A'}, ${p.color || 'N/A'})`,
                metadata: {
                  size: p.size || 'N/A',
                  color: p.color || 'N/A',
                },
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: Math.max(1, p.quantity ?? 1),
          };
        })
      );

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ui_mode: 'hosted',
        billing_address_collection: 'required',          
        shipping_address_collection: {
          allowed_countries: [
            // UE (27)
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
            'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
            // EEE no UE
            'IS', 'LI', 'NO',
            // Extras habituales en Europa
            'GB', 'CH', 'AD', 'SM', 'VA', 'MC',
            // 🇺🇸 Norteamérica
            'US', 'CA',
            // Asia más relevante comercialmente
            'CN', 'JP', 'KR', 'HK', 'SG', 'TW', 'IN', 'TH', 'MY', 'VN', 'PH', 'ID', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM',
          ],
        },
        invoice_creation: { enabled: true },   // <- clave para la factura
        automatic_tax: { enabled: true },      // <- si usas Stripe Tax
        success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/`,
        line_items: lineItems,
        });

      // Guarda la orden en tu BD de Strapi
      await strapi.entityService.create('api::order.order', {
        data: {
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            size: p.size || 'N/A',
            color: p.color || 'N/A',
          })),
          stripeId: session.id, // referencia de Stripe
        },
      });

      return { stripeSession: { id: session.id, url: session.url } };

    } catch (error) {
      ctx.response.status = ctx.response.status && ctx.response.status !== 200 ? ctx.response.status : 500;
      return { error: error.message };
    }
  },
}));
