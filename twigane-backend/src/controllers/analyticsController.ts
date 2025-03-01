import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { AnalyticsService } from '../services/analyticsService.js';
import Progress from '../models/progress.js';

const analyticsService = new AnalyticsService();

export const trackSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionStart, activities, deviceInfo } = req.body;
    const analytics = new Analytics({
      userId: req.user.userId,
      sessionStart,
      sessionEnd: new Date(),
      activitiesPerformed: activities,
      deviceInfo
    });
    await analytics.save();
    res.status(201).json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track session' });
  }
};

export const getUserEngagement = async (req: AuthRequest, res: Response) => {
  try {
    const insights = await analyticsService.generateUserInsights(req.user.userId);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
};

export const getPersonalizedInsights = async (req: AuthRequest, res: Response) => {
  try {
    const weeklyActivity = await analyticsService.generateUserInsights(req.user.userId);
    const progress = await analyticsService.calculateEngagementScore(req.user.userId);
    
    res.json({
      weeklyActivity,
      progress,
      recommendations: {
        suggestedStudyTime: progress.averageSessionDuration + 5,
        focusAreas: progress.weakAreas || [],
        nextMilestone: Math.ceil(progress.completedLessons / 5) * 5
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate personalized insights' });
  }
};