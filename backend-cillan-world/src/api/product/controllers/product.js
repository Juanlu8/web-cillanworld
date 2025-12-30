// src/api/product/controllers/product.js
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

/** URL relativa -> absoluta usando server.url o PUBLIC_URL */
const makeToAbsUrl = (strapi) => {
  const base =
    strapi.config.get('server.url') ||
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:1337';

  return (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    try {
      return new URL(url, base).toString();
    } catch {
      const baseClean = (base || '').replace(/\/$/, '');
      const u = url.startsWith('/') ? url : `/${url}`;
      return `${baseClean}${u}`;
    }
  };
};

/** Helpers de shape */
const shapeImageUrl = (value, toAbs) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((url) => toAbs(url)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/\s+/)
      .map((url) => toAbs(url))
      .filter(Boolean);
  }
  return [];
};

const shapeCategories = (cats) =>
  Array.isArray(cats)
    ? cats.map((c) => ({
        attributes: {
          slug: c?.slug || '',
          categoryName: c?.categoryName || '',
        },
      }))
    : [];

const shapeLightProduct = (p, toAbs, NEW_CAT_FIELD) => {
  /** @type {any} */
  const pa = p;
  return {
    id: pa.id,
    attributes: {
      productName: pa.productName,
      slug: pa.slug,
      color: pa.color,
      price: pa.price,
      order: pa.order,
      imageUrl: shapeImageUrl(pa.imageUrl, toAbs),
      categories: { data: shapeCategories(pa[NEW_CAT_FIELD]) },
    },
  };
};

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    try {
      const { query } = ctx;

      const PRODUCT_UID   = 'api::product.product';
      const REL_FIELD     = 'relatedColors';
      const NEW_CAT_FIELD = 'categories';

      const model = strapi.getModel(PRODUCT_UID);
      const hasRelatedField  = Boolean(model?.attributes?.[REL_FIELD]);
      const hasNewCategories = Boolean(model?.attributes?.[NEW_CAT_FIELD]);

      // populate consistente
      const populate = {};
      if (hasNewCategories) populate[NEW_CAT_FIELD] = true;
      if (hasRelatedField) {
        populate[REL_FIELD] = { populate: {} };
        if (hasNewCategories) {
          populate[REL_FIELD].populate[NEW_CAT_FIELD] = true;
        }
      }

      const entities = await strapi.entityService.findMany(PRODUCT_UID, {
        ...query,
        populate,
        // publicationState: 'preview', // quítalo si no usas Draft & Publish
      });

      const toAbs = makeToAbsUrl(strapi);

      const data = entities.map((product) => {
        /** @type {any} */
        const p = product;

        const manyCategories = hasNewCategories ? p[NEW_CAT_FIELD] : [];

        const related =
          hasRelatedField && Array.isArray(p[REL_FIELD])
            ? p[REL_FIELD].map((rp) => shapeLightProduct(rp, toAbs, NEW_CAT_FIELD))
            : [];

        return {
          id: p.id,
          attributes: {
            productName: p.productName,
            slug:        p.slug,
            details:     p.details,
            details_en:  p.details_en,
            active:      p.active,
            isFeatured:  p.isFeatured,
            price:       p.price,
            order:       p.order,
            materials:   p.materials,
            materials_en:p.materials_en,
            garmentCare: p.garmentCare,
            garmentCare_en: p.garmentCare_en,
            color:       p.color,
            imageUrl:    shapeImageUrl(p.imageUrl, toAbs),
            categories:  { data: shapeCategories(manyCategories) },
            [REL_FIELD]: { data: related },
          },
        };
      });

      return { data };
    } catch (err) {
      strapi.log.error('Error en product.find:', err);
      return ctx.throw(500, err.message);
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const { query } = ctx;

      const PRODUCT_UID   = 'api::product.product';
      const REL_FIELD     = 'relatedColors';
      const NEW_CAT_FIELD = 'categories';

      const model = strapi.getModel(PRODUCT_UID);
      const hasRelatedField  = Boolean(model?.attributes?.[REL_FIELD]);
      const hasNewCategories = Boolean(model?.attributes?.[NEW_CAT_FIELD]);

      const populate = {};
      if (hasNewCategories) populate[NEW_CAT_FIELD] = true;
      if (hasRelatedField) {
        populate[REL_FIELD] = { populate: {} };
        if (hasNewCategories) {
          populate[REL_FIELD].populate[NEW_CAT_FIELD] = true;
        }
      }

      const row = await strapi.entityService.findOne(PRODUCT_UID, id, {
        ...query,
        populate,
        // publicationState: 'preview',
      });
      if (!row) return { data: null };

      /** @type {any} */
      const r = row;
      const toAbs = makeToAbsUrl(strapi);

      const result = {
        id: r.id,
        attributes: {
          productName:   r.productName,
          slug:          r.slug,
          details:       r.details,
          details_en:    r.details_en,
          active:        r.active,
          isFeatured:    r.isFeatured,
          price:         r.price,
          order:         r.order,
          materials:     r.materials,
          materials_en:  r.materials_en,
          garmentCare:   r.garmentCare,
          garmentCare_en:r.garmentCare_en,
          color:         r.color,
          imageUrl:    shapeImageUrl(r.imageUrl, toAbs),
          categories:  { data: shapeCategories(hasNewCategories ? r[NEW_CAT_FIELD] : []) },
          [REL_FIELD]: {
            data:
              hasRelatedField && Array.isArray(r[REL_FIELD])
                ? r[REL_FIELD].map((rp) => shapeLightProduct(rp, toAbs, NEW_CAT_FIELD))
                : [],
          },
        },
      };

      return { data: result };
    } catch (err) {
      strapi.log.error('Error en product.findOne:', err);
      return ctx.throw(500, err.message);
    }
  },
}));
