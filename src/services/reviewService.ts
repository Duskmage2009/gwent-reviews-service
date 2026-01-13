import Review, { IReviewDocument } from '../models/Review';
import cardService from './cardService';
import { CreateReviewDTO, GetReviewsQuery, ReviewCountsRequest, ReviewCountsResponse } from '../types';

class ReviewService {
    async createReview(data: CreateReviewDTO): Promise<IReviewDocument> {
        const cardExists = await cardService.validateCardExists(data.cardId);
        if (!cardExists) {
            throw new Error(`Card with ID ${data.cardId} not found`);
        }

        const review = new Review(data);
        await review.save();
        return review;
    }

    async getReviews(query: GetReviewsQuery): Promise<IReviewDocument[]> {
        const { cardId, size = 5, from = 0 } = query;

        const reviews = await Review.find({ cardId })
            .sort({ createdAt: -1 })
            .skip(from)
            .limit(size)
            .exec();

        return reviews;
    }

    async getReviewCounts(request: ReviewCountsRequest): Promise<ReviewCountsResponse> {
        const { cardIds } = request;

        const counts = await Review.aggregate([
            { $match: { cardId: { $in: cardIds } } },
            { $group: { _id: '$cardId', count: { $sum: 1 } } },
        ]);

        const result: ReviewCountsResponse = {};

        cardIds.forEach(id => {
            result[id.toString()] = 0;
        });

        counts.forEach(item => {
            result[item._id.toString()] = item.count;
        });

        return result;
    }

    async getReviewCount(cardId: number): Promise<number> {
        return await Review.countDocuments({ cardId });
    }
}

export default new ReviewService();