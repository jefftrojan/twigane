import mongoose, { Schema, Document } from 'mongoose';

interface MessageMetadata {
  cardFront?: string;
  cardBack?: string;
  category?: string;
  points?: number;
  achievementType?: string;
  correctAnswer?: string;
  reviewCount?: number;
  lastReviewed?: Date;
}

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'flipcard' | 'quiz' | 'achievement';
  metadata?: MessageMetadata;
  timestamp: Date;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  learningProgress: {
    cardsReviewed: number;
    correctAnswers: number;
    streakDays: number;
    points: number;
    achievements: string[];
  };
  createdAt: Date;
}

// Update the messageSchema
const messageSchema = new Schema({
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  content: { type: String, required: true },
  type: { type: String, required: true, default: 'text' },
  metadata: {
    cardFront: String,
    cardBack: String,
    category: String,
    points: Number,
    achievementType: String,
    correctAnswer: String,
    reviewCount: { type: Number, default: 0 },
    lastReviewed: Date
  },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  learningProgress: {
    cardsReviewed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    achievements: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChat>('Chat', chatSchema);