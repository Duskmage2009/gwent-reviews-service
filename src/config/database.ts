import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gwent-reviews';

        await mongoose.connect(mongoUri);

        console.log('MongoDB connected successfully');
        console.log(`Database: ${mongoose.connection.name}`);

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn(' MongoDB disconnected');
        });

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;