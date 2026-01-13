export interface IReview {
    cardId: number;
    rating: number;
    comment: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {
    _id: string;
}

export interface CreateReviewDTO {
    cardId: number;
    rating: number;
    comment: string;
    author: string;
}

export interface GetReviewsQuery {
    cardId: number;
    size?: number;
    from?: number;
}

export interface ReviewCountsRequest {
    cardIds: number[];
}

export interface ReviewCountsResponse {
    [cardId: string]: number;
}

export interface CardResponse {
    id: number;
    name: string;
    deck: {
        id: number;
        name: string;
    };
    provision: number;
    power: number;
    type: string;
    faction: string;
}