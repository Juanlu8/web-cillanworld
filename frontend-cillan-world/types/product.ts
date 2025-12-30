export type ProductType = {
  id: number;
  attributes: {
    productName: string;
    slug: string;
    details: string;
    details_en: string;
    active: boolean;
    isFeatured: boolean;
    price: number;
    order?: number;
    materials: string;
    materials_en: string;
    color: string;
    garmentCare: string;
    garmentCare_en: string;
    imageUrl?: string[] | string;

    // NUEVO: lista de categorías (many-to-many)
    categories: {
      data: {
        attributes: {
          slug: string;
          categoryName: string;
        };
      }[];
    };
  };
};
