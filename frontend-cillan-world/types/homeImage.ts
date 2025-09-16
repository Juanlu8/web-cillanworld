export type HomeImageType = {
    id: number;
    homImageName: string;
    slug: string;
    active: boolean;
    order: number;
    image: {
        id: number;
        url: string;
    };
};