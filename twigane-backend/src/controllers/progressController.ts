import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Progress from '../models/progress.js';
import Achievement from '../models/achievement.js';

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, score, timeSpent, mistakes } = req.body;
    
    const progress = new Progress({
      userId: req.user.userId,
      lessonId,
      score,
      timeSpent,
      mistakes
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const progress = await Progress.find({ userId: req.user.userId })
      .populate('lessonId', 'title')
      .sort({ completedAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};