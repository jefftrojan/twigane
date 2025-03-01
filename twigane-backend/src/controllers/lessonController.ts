import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Lesson from '../models/lesson.js';
import Progress from '../models/progress.js';
import { AIService } from '../services/aiService.js';

const aiService = new AIService();

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { title, content, language, ageGroup, metadata } = req.body;
    const lesson = new Lesson({
      title,
      content,
      language,
      ageGroup,
      metadata
    });

    await lesson.save();
    await aiService.addLearningMaterial(content, metadata);
    
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
};

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { language, ageGroup } = req.query;
    const query = {
      ...(language && { language }),
      ...(ageGroup && { ageGroup })
    };
    
    const lessons = await Lesson.find(query);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};