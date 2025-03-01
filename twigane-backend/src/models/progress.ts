import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  score: number;
  completedAt: Date;
  timeSpent: number;
  mistakes: number;
}

const progressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, required: true },
  mistakes: { type: Number, default: 0 }
});

export default mongoose.model<IProgress>('Progress', progressSchema);