import { Types } from 'mongoose';
import Analytics from '../models/analytics.js';
import Progress from '../models/progress.js';
import Feedback from '../models/feedback.js';

export class EngagementService {
  async calculateEngagementScore(userId: Types.ObjectId) {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [analytics, progress, feedback] = await Promise.all([
      Analytics.find({ userId, sessionStart: { $gte: lastWeek } }),
      Progress.find({ userId, completedAt: { $gte: lastWeek } }),
      Feedback.find({ userId, createdAt: { $gte: lastWeek } })
    ]);

    const metrics = {
      sessionsCount: analytics.length,
      averageSessionDuration: this.calculateAverageSessionTime(analytics),
      completedLessons: progress.length,
      averageScore: this.calculateAverageScore(progress),
      feedbackCount: feedback.length,
      lastActive: this.getLastActiveTime(analytics)
    };

    return {
      ...metrics,
      engagementScore: this.computeEngagementScore(metrics)
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

  private getLastActiveTime(analytics: any[]) {
    if (!analytics.length) return null;
    return analytics.sort((a, b) => 
      b.sessionEnd?.getTime() - a.sessionEnd?.getTime()
    )[0].sessionEnd;
  }

  private computeEngagementScore(metrics: any) {
    const weights = {
      sessionsCount: 0.3,
      averageSessionDuration: 0.2,
      completedLessons: 0.3,
      averageScore: 0.1,
      feedbackCount: 0.1
    };

    return Object.keys(weights).reduce((score, key) => {
      const normalizedValue = this.normalizeMetric(key, metrics[key]);
      return score + normalizedValue * weights[key as keyof typeof weights];
    }, 0);
  }

  private normalizeMetric(metric: string, value: number) {
    const ranges = {
      sessionsCount: { min: 0, max: 14 },
      averageSessionDuration: { min: 0, max: 60 },
      completedLessons: { min: 0, max: 10 },
      averageScore: { min: 0, max: 100 },
      feedbackCount: { min: 0, max: 5 }
    };

    const range = ranges[metric as keyof typeof ranges];
    return Math.min(1, Math.max(0, (value - range.min) / (range.max - range.min)));
  }
}