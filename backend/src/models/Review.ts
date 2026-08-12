import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  universityId: Types.ObjectId;
  sourceHash?: string;
  reviewerName: string;
  text: string;
  date: Date;
  rating?: number;
  platform?: string;
  link?: string;
  reviewerMeta?: string;
  reviewerAvatar?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    sourceHash: { type: String, unique: true, sparse: true },
    reviewerName: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    rating: Number,
    platform: String,
    link: String,
    reviewerMeta: String,
    reviewerAvatar: String,
  },
  { timestamps: true }
);

export default model<IReview>('Review', reviewSchema);
