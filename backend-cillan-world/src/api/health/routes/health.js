'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.health',
      config: {
        auth: false,
      },
    },
  ],
};
