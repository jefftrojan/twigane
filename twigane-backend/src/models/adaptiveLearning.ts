import mongoose, { Schema, Document } from 'mongoose';

export interface IAdaptiveLearning extends Document {
  userId: mongoose.Types.ObjectId;
  currentLevel: number;
  strengths: string[];
  weaknesses: string[];
  learningPath: Array<{
    lessonId: mongoose.Types.ObjectId;
    status: 'pending' | 'completed' | 'skipped';
    recommendedDate: Date;
  }>;
  preferences: {
    preferredTime: string;
    dailyGoal: number;
    topicPreferences: string[];
  };
}

const adaptiveLearningSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentLevel: { type: Number, default: 1 },
  strengths: [String],
  weaknesses: [String],
  learningPath: [{
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    status: { type: String, default: 'pending' },
    recommendedDate: { type: Date }
  }],
  preferences: {
    preferredTime: String,
    dailyGoal: { type: Number, default: 30 },
    topicPreferences: [String]
  }
});

export default mongoose.model<IAdaptiveLearning>('AdaptiveLearning', adaptiveLearningSchema);