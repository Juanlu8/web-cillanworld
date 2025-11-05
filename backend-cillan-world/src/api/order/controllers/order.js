'use strict';

// @ts-nocheck  // evita conflictos de tipos entre ESM y CJS

const Stripe = require('stripe').default;  // ⚡ importa la clase real
const stripe = new Stripe(process.env.STRIPE_KEY);

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const { products } = ctx.request.body; // [{ id, quantity? }]

    try {
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
                // ajusta el campo si tu colección usa otro nombre
                name: item.productName,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: p.quantity ?? 1,
          };
        })
      );

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ui_mode: 'hosted',
        billing_address_collection: 'required',          
        shipping_address_collection: { allowed_countries: [
            // UE (27)
            'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
            // EEE no UE
            'IS','LI','NO',
            // Extras habituales en Europa
            'GB','CH','AD','SM','VA','MC',  
            // 🇺🇸 Norteamérica
            'US','CA',
            // Asia más relevante comercialmente
            'CN','JP','KR','HK','SG','TW','IN','TH','MY','VN','PH','ID','AE','SA','QA','KW','BH','OM'
        ] },
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/successError`,
        line_items: lineItems,
        });

      // Guarda la orden en tu BD de Strapi
      await strapi.entityService.create('api::order.order', {
        data: {
          products,             // lo que envió el cliente (id/qty, etc.)
          stripeId: session.id, // referencia de Stripe
        },
      });

      return { stripeSession: { id: session.id, url: session.url } };

    } catch (error) {
      ctx.response.status = 500;
      return { error: error.message };
    }
  },
}));
