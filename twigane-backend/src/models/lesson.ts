import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  content: string;
  language: string;
  ageGroup: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const lessonSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  language: { type: String, required: true },
  ageGroup: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILesson>('Lesson', lessonSchema);