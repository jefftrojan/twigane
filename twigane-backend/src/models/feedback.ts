import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  rating: number;
  difficulty: 'too_easy' | 'just_right' | 'too_hard';
  comments: string;
  createdAt: Date;
}

const feedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  difficulty: { type: String, required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);