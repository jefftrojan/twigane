import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  sessionStart: Date;
  sessionEnd: Date;
  activitiesPerformed: Array<{
    type: 'lesson' | 'chat' | 'practice';
    itemId: mongoose.Types.ObjectId;
    duration: number;
    completionStatus: boolean;
  }>;
  deviceInfo: {
    platform: string;
    version: string;
  };
}

const analyticsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionStart: { type: Date, required: true },
  sessionEnd: { type: Date },
  activitiesPerformed: [{
    type: { type: String, required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    duration: { type: Number, required: true },
    completionStatus: { type: Boolean, default: false }
  }],
  deviceInfo: {
    platform: String,
    version: String
  }
});

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema);