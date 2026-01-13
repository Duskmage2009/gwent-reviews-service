import request from 'supertest';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import reviewRoutes from '../src/routes/reviewRoutes';
import { errorHandler } from '../src/middleware/errorHandler';
import Review from '../src/models/Review';
import cardService from '../src/services/cardService';
import './setup';

jest.mock('../src/services/cardService');

const app: Application = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);
app.use(errorHandler);

describe('Review API Integration Tests', () => {

    describe('POST /api/reviews', () => {

        it('should create a new review successfully', async () => {
            (cardService.validateCardExists as jest.Mock).mockResolvedValue(true);

            const reviewData = {
                cardId: 1,
                rating: 5,
                comment: 'Excellent card! Very powerful in current meta.',
                author: 'TestUser123',
            };

            const response = await request(app)
                .post('/api/reviews')
                .send(reviewData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                cardId: 1,
                rating: 5,
                comment: 'Excellent card! Very powerful in current meta.',
                author: 'TestUser123',
            });
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('createdAt');
            expect(response.body.data).toHaveProperty('updatedAt');
        });

        it('should return 400 for invalid rating', async () => {
            const reviewData = {
                cardId: 1,
                rating: 6,
                comment: 'Test comment that is long enough',
                author: 'TestUser',
            };

            const response = await request(app)
                .post('/api/reviews')
                .send(reviewData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should return 400 for short comment', async () => {
            const reviewData = {
                cardId: 1,
                rating: 5,
                comment: 'Short',
                author: 'TestUser',
            };

            const response = await request(app)
                .post('/api/reviews')
                .send(reviewData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 500 when card does not exist', async () => {
            (cardService.validateCardExists as jest.Mock).mockResolvedValue(false);

            const reviewData = {
                cardId: 999,
                rating: 5,
                comment: 'This card does not exist in Spring Boot',
                author: 'TestUser',
            };

            const response = await request(app)
                .post('/api/reviews')
                .send(reviewData)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .send({
                    cardId: 1,
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/reviews', () => {

        beforeEach(async () => {
            await Review.create([
                {
                    cardId: 1,
                    rating: 5,
                    comment: 'Great card! Very powerful.',
                    author: 'User1',
                },
                {
                    cardId: 1,
                    rating: 4,
                    comment: 'Good card but needs better synergy.',
                    author: 'User2',
                },
                {
                    cardId: 1,
                    rating: 3,
                    comment: 'Average card, not meta.',
                    author: 'User3',
                },
                {
                    cardId: 2,
                    rating: 5,
                    comment: 'Best card in the game!',
                    author: 'User4',
                },
            ]);
        });

        it('should get reviews for a specific card', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .query({ cardId: 1 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(3);
            expect(response.body.total).toBe(3);
            expect(response.body.cardId).toBe(1);

            const dates = response.body.data.map((r: any) => new Date(r.createdAt).getTime());
            for (let i = 0; i < dates.length - 1; i++) {
                expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
            }
        });

        it('should return empty array for card without reviews', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .query({ cardId: 999 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(0);
            expect(response.body.total).toBe(0);
        });

        it('should respect size parameter', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .query({ cardId: 1, size: 2 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.total).toBe(3);
            expect(response.body.size).toBe(2);
        });

        it('should respect from parameter for pagination', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .query({ cardId: 1, size: 2, from: 1 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.from).toBe(1);
        });

        it('should return 400 for invalid cardId', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .query({ cardId: 'invalid' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing cardId', async () => {
            const response = await request(app)
                .get('/api/reviews')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/reviews/_counts', () => {

        beforeEach(async () => {
            await Review.create([
                { cardId: 1, rating: 5, comment: 'Test review 1', author: 'User1' },
                { cardId: 1, rating: 4, comment: 'Test review 2', author: 'User2' },
                { cardId: 1, rating: 3, comment: 'Test review 3', author: 'User3' },
                { cardId: 2, rating: 5, comment: 'Test review 4', author: 'User4' },
                { cardId: 2, rating: 4, comment: 'Test review 5', author: 'User5' },
                { cardId: 3, rating: 5, comment: 'Test review 6', author: 'User6' },
            ]);
        });

        it('should return review counts for multiple cards', async () => {
            const response = await request(app)
                .post('/api/reviews/_counts')
                .send({ cardIds: [1, 2, 3, 4] })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual({
                '1': 3,
                '2': 2,
                '3': 1,
                '4': 0,
            });
        });

        it('should return 0 for cards without reviews', async () => {
            const response = await request(app)
                .post('/api/reviews/_counts')
                .send({ cardIds: [999, 1000] })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual({
                '999': 0,
                '1000': 0,
            });
        });

        it('should return 400 for invalid cardIds', async () => {
            const response = await request(app)
                .post('/api/reviews/_counts')
                .send({ cardIds: 'not-an-array' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for empty cardIds array', async () => {
            const response = await request(app)
                .post('/api/reviews/_counts')
                .send({ cardIds: [] })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for too many cardIds', async () => {
            const largeArray = Array.from({ length: 101 }, (_, i) => i + 1);

            const response = await request(app)
                .post('/api/reviews/_counts')
                .send({ cardIds: largeArray })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should use aggregation pipeline (not loading documents)', async () => {
            const aggregateSpy = jest.spyOn(Review, 'aggregate');

            await request(app)
                .post('/api/reviews/_counts')
                .send({ cardIds: [1, 2, 3] })
                .expect(200);

            expect(aggregateSpy).toHaveBeenCalled();
            aggregateSpy.mockRestore();
        });
    });
});