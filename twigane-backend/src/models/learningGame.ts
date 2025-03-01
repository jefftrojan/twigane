import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningGame extends Document {
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

const learningGameSchema = new Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['wordchain', 'memorymatch', 'speedquiz'] 
  },
  category: { type: String, required: true },
  difficulty: { 
    type: String, 
    required: true, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  points: { type: Number, required: true },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  }],
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model<ILearningGame>('LearningGame', learningGameSchema);