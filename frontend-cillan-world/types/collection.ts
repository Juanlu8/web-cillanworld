export type CollectionType = {
    id: number;
    collectionName: string;
    slug: string;
    description:string;
    description_en:string;
    order: number;
    images: {
        data: {
            id: number;
            url: string;
        }[]
    };
};