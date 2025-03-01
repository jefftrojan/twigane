import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import lessonRoutes from './routes/lessons.js';
import profileRoutes from './routes/profile.js';
import progressRoutes from './routes/progress.js';
import analyticsRoutes from './routes/analytics.js';
import adaptiveRoutes from './routes/adaptive.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { securityMiddleware } from './middleware/security.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progress', progressRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/api/adaptive', adaptiveRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Security Middleware
app.use(securityMiddleware);

// Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;