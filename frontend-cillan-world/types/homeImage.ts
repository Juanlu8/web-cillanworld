export type HomeImageType = {
    id: number;
    homeImageName: string;
    slug: string;
    active: boolean;
    order: number;
    productSlug: string;
    imageUrl?: string[] | string;
};
