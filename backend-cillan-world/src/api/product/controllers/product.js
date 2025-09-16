// src/api/product/controllers/product.js
const { createCoreController } = require('@strapi/strapi').factories;

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

      // --- populate ---------------------------------------------------------
      const populate = { images: true };
      if (hasNewCategories) populate[NEW_CAT_FIELD] = true;

      if (hasRelatedField) {
        populate[REL_FIELD] = {
          populate: {
            images: true,
          },
        };
        if (hasNewCategories) {
          populate[REL_FIELD].populate[NEW_CAT_FIELD] = true;
        }
      }

      // --- query ------------------------------------------------------------
      const entities = await strapi.entityService.findMany(PRODUCT_UID, {
        ...query,
        populate,
        publicationState: 'preview', // quítalo si no usas Draft & Publish
      });

      // --- helpers ----------------------------------------------------------
      const shapeImages = (imgs) =>
        Array.isArray(imgs)
          ? imgs.map((img) => ({ id: img.id, attributes: { url: img.url } }))
          : [];

      const shapeCategories = (cats) =>
        Array.isArray(cats)
          ? cats.map((c) => ({
              attributes: {
                slug: c?.slug || '',
                categoryName: c?.categoryName || '',
              },
            }))
          : [];

      const shapeLightProduct = (p) => {
        const pa = /** @type {any} */ (p); // cast puntual para TS en .js
        return {
          id: pa.id,
          attributes: {
            productName: pa.productName,
            slug: pa.slug,
            color: pa.color,
            price: pa.price,
            order: pa.order,
            images: { data: shapeImages(pa.images) },
            categories: { data: shapeCategories(pa[NEW_CAT_FIELD]) },
          },
        };
      };

      // --- shape ------------------------------------------------------------
      const data = entities.map((product) => {
        const p = /** @type {any} */ (product); // cast puntual

        const {
          id,
          productName,
          slug,
          details,
          details_en,
          active,
          isFeatured,
          price,
          order,
          materials,
          materials_en,
          garmentCare,
          garmentCare_en,
          color,
        } = p;

        const imagesArr      = Array.isArray(p.images) ? p.images : [];
        const manyCategories = hasNewCategories ? p[NEW_CAT_FIELD] : [];

        const related =
          hasRelatedField && Array.isArray(p[REL_FIELD])
            ? p[REL_FIELD].map(shapeLightProduct)
            : [];

        return {
          id,
          attributes: {
            productName,
            slug,
            details,
            details_en,
            active,
            isFeatured,
            price,
            order,
            materials,
            materials_en,
            garmentCare,
            garmentCare_en,
            color,
            images: { data: shapeImages(imagesArr) },
            categories: { data: shapeCategories(manyCategories) },
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
}));