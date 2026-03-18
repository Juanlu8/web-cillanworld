'use strict';

// @ts-nocheck  // evita conflictos de tipos entre ESM y CJS

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request.body || {};
    const payload = body.data ?? body;
    const {
      products,
      totalAmount,
      currency,
      customerEmail,
      customerName,
      customerPhone,
    } = payload; // [{ id, quantity? }]

    try {
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

      const productIds = products
        .map((product) => Number(product.id))
        .filter((id) => Number.isFinite(id) && id > 0);

      const catalogProducts = await strapi.entityService.findMany('api::product.product', {
        filters: { id: { $in: productIds } },
        fields: ['id', 'price'],
      });

      const priceById = new Map(
        (catalogProducts || []).map((product) => [Number(product.id), Number(product.price) || 0])
      );

      const computedTotal = products.reduce((sum, product) => {
        const price = priceById.get(Number(product.id)) || 0;
        const quantity = Number(product.quantity) || 1;
        return sum + price * quantity;
      }, 0);

      if (!Number.isFinite(computedTotal) || computedTotal <= 0) {
        ctx.response.status = 400;
        return { error: 'Unable to compute order total. Check product prices.' };
      }

      const created = await strapi.entityService.create('api::order.order', {
        data: {
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            size: p.size || 'N/A',
            color: p.color || 'N/A',
          })),
          totalAmount: computedTotal,
          currency: currency || 'EUR',
          customerEmail: customerEmail || null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          status: 'pending',
          orderedAt: new Date(),
        },
      });

      return { order: created };
    } catch (error) {
      ctx.response.status = ctx.response.status && ctx.response.status !== 200 ? ctx.response.status : 500;
      return { error: error.message };
    }
  },
}));
