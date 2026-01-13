import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import reviewRoutes from './routes/reviewRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['http://localhost:3050', 'http://localhost:8080'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Gwent Reviews Service is running',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/reviews', reviewRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Reviews API: http://localhost:${PORT}/api/reviews`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;