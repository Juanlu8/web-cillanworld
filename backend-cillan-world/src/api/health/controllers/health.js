'use strict';

module.exports = {
  health: async (ctx) => {
    ctx.body = {
      ok: true,
      ts: new Date().toISOString(),
    };
  },
};
