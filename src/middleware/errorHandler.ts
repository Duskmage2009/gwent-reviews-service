import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
    stack?: string;
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    const response: ErrorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
    };

    if (process.env.NODE_ENV === 'development') {
        response.error = err.name;
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};