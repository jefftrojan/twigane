import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizChallenge extends Document {
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

const quizChallengeSchema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
  questions: [{
    messageId: { type: Schema.Types.ObjectId, required: true },
    chatId: { type: Schema.Types.ObjectId, required: true }
  }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model<IQuizChallenge>('QuizChallenge', quizChallengeSchema);