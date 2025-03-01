import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import AdaptiveLearning from '../models/adaptiveLearning.js';
import Progress from '../models/progress.js';
import Feedback from '../models/feedback.js';
import { RecommendationService } from '../services/recommendationService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { EngagementService } from '../services/engagementService.js';

const engagementService = new EngagementService();

// Add these new methods to the existing controller
export const getEngagementMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await engagementService.calculateEngagementScore(req.user.userId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate engagement metrics' });
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, rating, difficulty, comments } = req.body;
    
    const feedback = new Feedback({
      userId: req.user.userId,
      lessonId,
      rating,
      difficulty,
      comments
    });

    await feedback.save();
    await recommendationService.updateUserStrengths(req.user.userId);
    
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

const recommendationService = new RecommendationService();
const analyticsService = new AnalyticsService();

export const getPersonalizedContent = async (req: AuthRequest, res: Response) => {
  try {
    const recommendations = await recommendationService.generateRecommendations(req.user.userId);
    const insights = await analyticsService.generateUserInsights(req.user.userId);
    
    res.json({
      recommendations,
      insights,
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate personalized content' });
  }
};

export const updateLearningPath = async (req: AuthRequest, res: Response) => {
  try {
    const { currentLevel, strengths, weaknesses, preferences } = req.body;
    
    let adaptiveLearning = await AdaptiveLearning.findOne({ userId: req.user.userId });
    
    if (!adaptiveLearning) {
      adaptiveLearning = new AdaptiveLearning({
        userId: req.user.userId,
        currentLevel,
        strengths,
        weaknesses,
        preferences
      });
    } else {
      adaptiveLearning.currentLevel = currentLevel;
      adaptiveLearning.strengths = strengths;
      adaptiveLearning.weaknesses = weaknesses;
      adaptiveLearning.preferences = preferences;
    }

    await adaptiveLearning.save();
    res.json(adaptiveLearning);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update learning path' });
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const adaptiveLearning = await AdaptiveLearning.findOne({ userId: req.user.userId });
    const progress = await Progress.find({ userId: req.user.userId });
    
    // Implement recommendation logic based on user's progress and adaptive learning data
    // This is a placeholder for the actual recommendation algorithm
    const recommendations = {
      nextLessons: [],
      practiceAreas: adaptiveLearning?.weaknesses || [],
      suggestedLevel: adaptiveLearning?.currentLevel || 1
    };

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};