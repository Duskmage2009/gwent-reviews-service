import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../types';

export interface IReviewDocument extends IReview, Document {}

const ReviewSchema: Schema = new Schema(
    {
        cardId: {
            type: Number,
            required: [true, 'Card ID is required'],
            index: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            required: [true, 'Comment is required'],
            minlength: [10, 'Comment must be at least 10 characters'],
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
            trim: true,
        },
        author: {
            type: String,
            required: [true, 'Author is required'],
            minlength: [2, 'Author name must be at least 2 characters'],
            maxlength: [100, 'Author name cannot exceed 100 characters'],
            trim: true,
        },
    },
    {
        timestamps: true, // Автоматично додає createdAt і updatedAt
        collection: 'reviews',
    }
);

// Індекси для оптимізації
ReviewSchema.index({ cardId: 1, createdAt: -1 });

// Віртуальне поле для ID
ReviewSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete (ret as any).__v;
        return ret;
    },
});

export default mongoose.model<IReviewDocument>('Review', ReviewSchema);