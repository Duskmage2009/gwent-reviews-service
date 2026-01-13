import { body, query, ValidationChain } from 'express-validator';

export const createReviewValidation: ValidationChain[] = [
    body('cardId')
        .isInt({ min: 1 })
        .withMessage('Card ID must be a positive integer'),

    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),

    body('comment')
        .isString()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Comment must be between 10 and 1000 characters'),

    body('author')
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Author name must be between 2 and 100 characters'),
];

export const getReviewsValidation: ValidationChain[] = [
    query('cardId')
        .isInt({ min: 1 })
        .withMessage('Card ID must be a positive integer'),

    query('size')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Size must be between 1 and 100'),

    query('from')
        .optional()
        .isInt({ min: 0 })
        .withMessage('From must be a non-negative integer'),
];

export const reviewCountsValidation: ValidationChain[] = [
    body('cardIds')
        .isArray({ min: 1, max: 100 })
        .withMessage('cardIds must be an array with 1 to 100 elements'),

    body('cardIds.*')
        .isInt({ min: 1 })
        .withMessage('Each card ID must be a positive integer'),
];