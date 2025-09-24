export type HomeImageType = {
    id: number;
    homeImageName: string;
    slug: string;
    active: boolean;
    order: number;
    productSlug: string;
    image: {
        id: number;
        url: string;
    };
};