import { Request, Response } from 'express';
import { AIService } from '../services/aiService.js';
import Chat from '../models/chat.js';
import { AuthRequest } from '../middleware/auth.js';
import Achievement from '../models/achievement.js';
import mongoose from 'mongoose';
import QuizChallenge from '../models/quizChallenge.js';
import LearningGame from '../models/learningGame.js';
import { Readable } from 'stream';

const aiService = new AIService();

export const startChat = async (req: AuthRequest, res: Response) => {
  try {
    const chat = new Chat({
      userId: req.user.userId,
      messages: []
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start chat' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, message, type = 'text' } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message with _id
    chat.messages.push({
      _id: new mongoose.Types.ObjectId(),
      role: 'user',
      content: message,
      type,
      timestamp: new Date()
    });

    // Generate AI response with learning content
    const aiResponse = await aiService.generateResponse(message, type);
    
    // Add AI response with _id
    chat.messages.push({
      _id: new mongoose.Types.ObjectId(),
      role: 'assistant',
      content: aiResponse.content,
      type: aiResponse.type,
      metadata: aiResponse.metadata,
      timestamp: new Date()
    });

    // Update learning progress
    if (aiResponse.type === 'flipcard' || aiResponse.type === 'quiz') {
      chat.learningProgress.cardsReviewed += 1;
      chat.learningProgress.points += aiResponse.metadata?.points || 0;
      
      // Check for achievements
      await checkAndAwardAchievements(chat);
    }

    await chat.save();
    res.json({ 
      message: aiResponse,
      progress: chat.learningProgress
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process message' });
  }
};

export const updateDailyStreak = async (req: AuthRequest, res: Response) => {
  try {
    const chat = await Chat.findById(req.body.chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const lastActivity = chat.messages[chat.messages.length - 1]?.timestamp;
    const today = new Date();
    const isConsecutiveDay = lastActivity && 
      today.getDate() - lastActivity.getDate() === 1;

    if (isConsecutiveDay) {
      chat.learningProgress.streakDays += 1;
      await checkAndAwardAchievements(chat);
    } else if (!lastActivity || today.getDate() - lastActivity.getDate() > 1) {
      chat.learningProgress.streakDays = 1;
    }

    await chat.save();
    res.json({ streak: chat.learningProgress.streakDays });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update streak' });
  }
};

export const submitQuizAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, messageId, answer } = req.body;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const quizMessage = chat.messages.find(m => 
      m._id.toString() === messageId && m.type === 'quiz'
    );

    if (!quizMessage) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const isCorrect = answer === quizMessage.metadata?.correctAnswer;
    if (isCorrect) {
      chat.learningProgress.correctAnswers += 1;
      chat.learningProgress.points += 20;
    }

    await chat.save();
    res.json({
      correct: isCorrect,
      points: chat.learningProgress.points,
      progress: chat.learningProgress
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

// Add this interface at the top of the file with other imports
interface Achievement {
  type: string;
  title: string;
  description: string;
  points: number;
  category: 'learning' | 'streak' | 'quiz' | 'milestone';
  icon: string;
}

// Update the function with proper typing
async function checkAndAwardAchievements(chat: any) {
  const achievements: Achievement[] = [];

  // Check for streak achievements
  if (chat.learningProgress.streakDays >= 7) {
    achievements.push({
      type: 'WEEKLY_STREAK',
      title: 'Weekly Warrior',
      description: 'Maintained a 7-day learning streak!',
      points: 100,
      category: 'streak',
      icon: '🔥'
    });
  }

  // Check for cards reviewed achievements
  if (chat.learningProgress.cardsReviewed >= 50) {
    achievements.push({
      type: 'CARDS_MASTER',
      title: 'Flip Card Master',
      description: 'Reviewed 50 flip cards!',
      points: 200,
      category: 'learning',
      icon: '🎴'
    });
  }

  // Save new achievements
  for (const achievement of achievements) {
    const exists = await Achievement.findOne({
      userId: chat.userId,
      type: achievement.type
    });

    if (!exists) {
      await Achievement.create({
        ...achievement,
        userId: chat.userId
      });
      chat.learningProgress.achievements.push(achievement.type);
      chat.learningProgress.points += achievement.points;
    }
  }
}

export const getLearningStats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId });
    
    const stats: {
      totalCards: number;
      correctAnswers: number;
      totalPoints: number;
      achievements: string[];
      topCategories: Map<string, number>;
    } = {
      totalCards: 0,
      correctAnswers: 0,
      totalPoints: 0,
      achievements: [],
      topCategories: new Map<string, number>()
    };

    chats.forEach(chat => {
      stats.totalCards += chat.learningProgress.cardsReviewed;
      stats.correctAnswers += chat.learningProgress.correctAnswers;
      stats.totalPoints += chat.learningProgress.points;
      stats.achievements.push(...chat.learningProgress.achievements);

      chat.messages
        .filter(m => m.type === 'flipcard' || m.type === 'quiz')
        .forEach(m => {
          const category = m.metadata?.category;
          if (category) {
            stats.topCategories.set(
              category, 
              (stats.topCategories.get(category) || 0) + 1
            );
          }
        });
    });

    res.json({
      ...stats,
      topCategories: Array.from(stats.topCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning statistics' });
  }
};

// Add near the top with other interfaces
interface LearningGame {
  _id: mongoose.Types.ObjectId;
  type: 'wordchain' | 'memorymatch' | 'speedquiz';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  participants: {
    userId: mongoose.Types.ObjectId;
    score: number;
    completed: boolean;
  }[];
  status: 'active' | 'completed';
  expiresAt: Date;
}

// Add new game controller functions
export const startLearningGame = async (req: AuthRequest, res: Response) => {
  try {
    const { gameType, category, difficulty = 'beginner' } = req.body;
    
    const game = new LearningGame({
      type: gameType,
      category,
      difficulty,
      points: difficulty === 'beginner' ? 50 : 
              difficulty === 'intermediate' ? 100 : 150,
      participants: [{ userId: req.user.userId, score: 0, completed: false }],
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game' });
  }
};

export const submitGameScore = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId, score } = req.body;
    const game = await LearningGame.findById(gameId);

    if (!game || game.status !== 'active') {
      return res.status(404).json({ error: 'Game not found or inactive' });
    }

    const participant = game.participants.find(
      p => p.userId.toString() === req.user.userId
    );

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    participant.score = score;
    participant.completed = true;

    // Update user's learning progress
    const chat = await Chat.findOne({ userId: req.user.userId });
    if (chat) {
      chat.learningProgress.points += Math.floor(score * game.points / 100);
      await chat.save();
    }

    await game.save();
    res.json({
      score,
      totalPoints: chat?.learningProgress.points
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit game score' });
  }
};

export const getGameLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { gameType, timeFrame = 'weekly' } = req.body;
    const startDate = new Date();
    
    if (timeFrame === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeFrame === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const games = await LearningGame.find({
      type: gameType,
      status: 'completed',
      expiresAt: { $gte: startDate }
    }).populate('participants.userId', 'username');

    const leaderboard = games
      .flatMap(game => game.participants)
      .reduce((acc, participant) => {
        const userId = participant.userId.toString();
        acc.set(userId, (acc.get(userId) || 0) + participant.score);
        return acc;
      }, new Map<string, number>());

    const topPlayers = Array.from(leaderboard.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    res.json({
      gameType,
      timeFrame,
      leaderboard: topPlayers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Add these interfaces near the top with others
interface QuizChallenge {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  participants: {
    userId: mongoose.Types.ObjectId;
    score: number;
    completed: boolean;
  }[];
  questions: {
    messageId: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
  }[];
  status: 'active' | 'completed';
  expiresAt: Date;
}

// Add new controller functions
export const createQuizChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const { selectedQuizIds, challengeDuration = 24 } = req.body;
    
    const challenge = new QuizChallenge({
      creatorId: req.user.userId,
      participants: [{ userId: req.user.userId, score: 0, completed: false }],
      questions: selectedQuizIds.map((q: { messageId: string, chatId: string }) => ({
        messageId: new mongoose.Types.ObjectId(q.messageId),
        chatId: new mongoose.Types.ObjectId(q.chatId)
      })),
      status: 'active',
      expiresAt: new Date(Date.now() + challengeDuration * 60 * 60 * 1000)
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

export const joinQuizChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const { challengeId } = req.body;
    const challenge = await QuizChallenge.findById(challengeId);

    if (!challenge || challenge.status !== 'active') {
      return res.status(404).json({ error: 'Challenge not found or inactive' });
    }

    if (challenge.participants.some(p => p.userId.toString() === req.user.userId)) {
      return res.status(400).json({ error: 'Already joined this challenge' });
    }

    challenge.participants.push({
      userId: req.user.userId,
      score: 0,
      completed: false
    });

    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join challenge' });
  }
};

export const submitChallengeAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { challengeId, questionIndex, answer } = req.body;
    const challenge = await QuizChallenge.findById(challengeId);

    if (!challenge || challenge.status !== 'active') {
      return res.status(404).json({ error: 'Challenge not found or inactive' });
    }

    const participant = challenge.participants.find(
      p => p.userId.toString() === req.user.userId
    );

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const question = challenge.questions[questionIndex];
    const chat = await Chat.findById(question.chatId);
    const quizMessage = chat?.messages.find(
      m => m._id.toString() === question.messageId.toString()
    );

    if (!quizMessage) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = answer === quizMessage.metadata?.correctAnswer;
    if (isCorrect) {
      participant.score += 20;
    }

    if (questionIndex === challenge.questions.length - 1) {
      participant.completed = true;
      if (challenge.participants.every(p => p.completed)) {
        challenge.status = 'completed';
      }
    }

    await challenge.save();
    res.json({
      correct: isCorrect,
      score: participant.score,
      challengeStatus: challenge.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};