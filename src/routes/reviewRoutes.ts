import { Router } from 'express';
import reviewController from '../controllers/reviewController';
import {
    createReviewValidation,
    getReviewsValidation,
    reviewCountsValidation,
} from '../validators/reviewValidator';

const router = Router();

router.post(
    '/',
    createReviewValidation,
    reviewController.createReview
);

router.get(
    '/',
    getReviewsValidation,
    reviewController.getReviews
);

router.post(
    '/_counts',
    reviewCountsValidation,
    reviewController.getReviewCounts
);

export default router;