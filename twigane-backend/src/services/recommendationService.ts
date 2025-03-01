import { Types } from 'mongoose';
import Progress from '../models/progress.js';
import Lesson from '../models/lesson.js';
import AdaptiveLearning from '../models/adaptiveLearning.js';

export class RecommendationService {
  async generateRecommendations(userId: Types.ObjectId) {
    const userProgress = await Progress.find({ userId });
    const adaptiveLearning = await AdaptiveLearning.findOne({ userId });
    
    // Get completed lessons
    const completedLessonIds = userProgress.map(p => p.lessonId);
    
    // Find lessons based on user's current level and preferences
    const recommendedLessons = await Lesson.find({
      _id: { $nin: completedLessonIds },
      ageGroup: { $lte: adaptiveLearning?.currentLevel || 1 },
      language: adaptiveLearning?.preferences?.topicPreferences || ['en']
    }).limit(5);

    // Calculate areas needing improvement
    const lowScoreLessons = userProgress
      .filter(p => p.score < 70)
      .map(p => p.lessonId);
    
    return {
      nextLessons: recommendedLessons,
      reviewLessons: lowScoreLessons,
      suggestedTopics: adaptiveLearning?.weaknesses || []
    };
  }

  async updateUserStrengths(userId: Types.ObjectId) {
    const progress = await Progress.find({ userId }).populate('lessonId');
    
    const strengths = progress
      .filter(p => p.score >= 85)
      .map(p => (p.lessonId as any).category);
      
    const weaknesses = progress
      .filter(p => p.score < 60)
      .map(p => (p.lessonId as any).category);

    await AdaptiveLearning.findOneAndUpdate(
      { userId },
      { 
        $set: { strengths: [...new Set(strengths)] },
        $addToSet: { weaknesses: { $each: weaknesses } }
      },
      { upsert: true }
    );
  }
}