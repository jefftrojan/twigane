import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  points: number;
  unlockedAt: Date;
  category: 'learning' | 'streak' | 'quiz' | 'milestone';
  icon: string;
}

const achievementSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  unlockedAt: { type: Date, default: Date.now },
  category: { type: String, required: true },
  icon: { type: String, required: true }
});

export default mongoose.model<IAchievement>('Achievement', achievementSchema);