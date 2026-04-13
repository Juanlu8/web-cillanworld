'use strict';

const { SHIPPING_ZONES } = require('./api/order/utils/shipping-rates');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      const existing = await strapi.entityService.findMany('api::shipping-rate.shipping-rate', {
        fields: ['id'],
        limit: 1,
      });

      if (Array.isArray(existing) && existing.length > 0) {
        return;
      }

      const entries = Object.entries(SHIPPING_ZONES);

      for (const [zoneKey, zone] of entries) {
        await strapi.entityService.create('api::shipping-rate.shipping-rate', {
          data: {
            zoneKey,
            zoneLabel: zone.label,
            method: zone.method,
            amount: zone.amount,
            currency: 'EUR',
            active: true,
          },
        });
      }

      strapi.log.info(`Seeded ${entries.length} shipping rates in Strapi.`);
    } catch (error) {
      strapi.log.warn(`Unable to seed shipping rates: ${error.message}`);
    }
  },
};
