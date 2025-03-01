import Analytics from '../models/analytics.js';
import { Types } from 'mongoose';
import Progress from '../models/progress.js';
import User from '../models/user.js';

export class AnalyticsService {
  async generateUserInsights(userId: Types.ObjectId) {
    const weeklyActivity = await Analytics.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: '$activitiesPerformed' },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: '%Y-%m-%d', 
              date: '$sessionStart' 
            }
          },
          totalTime: { $sum: '$activitiesPerformed.duration' },
          activities: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    return {
      weeklyActivity,
      totalTimeSpent: weeklyActivity.reduce((acc, day) => acc + day.totalTime, 0),
      averageActivitiesPerDay: weeklyActivity.reduce((acc, day) => acc + day.activities, 0) / 7
    };
  }

  async calculateEngagementScore(userId: Types.ObjectId) {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [analytics, progress] = await Promise.all([
      Analytics.find({ userId, sessionStart: { $gte: lastWeek } }),
      Progress.find({ userId, completedAt: { $gte: lastWeek } })
    ]);

    const averageSessionDuration = this.calculateAverageSessionTime(analytics);
    const completedLessons = progress.length;
    const weakAreas = this.identifyWeakAreas(progress);

    return {
      averageSessionDuration,
      completedLessons,
      weakAreas,
      totalSessions: analytics.length,
      averageScore: this.calculateAverageScore(progress)
    };
  }

  private calculateAverageSessionTime(analytics: any[]) {
    if (!analytics.length) return 0;
    const durations = analytics.map(a => 
      (a.sessionEnd?.getTime() - a.sessionStart.getTime()) / 1000 / 60
    );
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  private calculateAverageScore(progress: any[]) {
    if (!progress.length) return 0;
    return progress.reduce((sum, p) => sum + p.score, 0) / progress.length;
  }

  private identifyWeakAreas(progress: any[]) {
    return progress
      .filter(p => p.score < 70)
      .map(p => p.lessonId)
      .slice(0, 3);
  }
}