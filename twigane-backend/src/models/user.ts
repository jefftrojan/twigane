import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  age: number;
  email: string;
  password: string;
  language: string;
  avatar?: string;
  interests?: string[];
  learningLevel?: string;
  lastActive: Date;
  createdAt: Date;
}

const userSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  language: { type: String, default: 'en' },
  avatar: { type: String },
  interests: [{ type: String }],
  learningLevel: { type: String },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);