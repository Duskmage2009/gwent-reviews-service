import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import reviewService from '../services/reviewService';
import { CreateReviewDTO, GetReviewsQuery, ReviewCountsRequest } from '../types';

class ReviewController {
    async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }

            const data: CreateReviewDTO = req.body;
            const review = await reviewService.createReview(data);

            res.status(201).json({
                success: true,
                data: review,
            });
        } catch (error) {
            next(error);
        }
    }

    async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }

            const query: GetReviewsQuery = {
                cardId: parseInt(req.query.cardId as string),
                size: req.query.size ? parseInt(req.query.size as string) : undefined,
                from: req.query.from ? parseInt(req.query.from as string) : undefined,
            };

            const reviews = await reviewService.getReviews(query);
            const total = await reviewService.getReviewCount(query.cardId);

            res.status(200).json({
                success: true,
                data: reviews,
                total,
                cardId: query.cardId,
                size: query.size || 5,
                from: query.from || 0,
            });
        } catch (error) {
            next(error);
        }
    }

    async getReviewCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
                return;
            }

            const request: ReviewCountsRequest = req.body;
            const counts = await reviewService.getReviewCounts(request);

            res.status(200).json({
                success: true,
                data: counts,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ReviewController();