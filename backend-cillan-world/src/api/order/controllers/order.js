'use strict';

// @ts-nocheck  // evita conflictos de tipos entre ESM y CJS

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request.body || {};
    const payload = body.data ?? body;
    const { products } = payload; // [{ id, quantity? }]

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

      const created = await strapi.entityService.create('api::order.order', {
        data: {
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            size: p.size || 'N/A',
            color: p.color || 'N/A',
          })),
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
