import { Schema, model, Document, Types } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export const REVIEW_STATUS_VALUES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

export interface IReview extends Document {
  universityId: Types.ObjectId;
  studentId?: Types.ObjectId;
  sourceHash?: string;
  reviewerName: string;
  text: string;
  date: Date;
  rating?: number;
  platform?: string;
  link?: string;
  reviewerMeta?: string;
  reviewerAvatar?: string;
  yearOfPassing?: string;
  idNumber?: string;
  status: ReviewStatus;
}

const reviewSchema = new Schema<IReview>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    sourceHash: { type: String, unique: true, sparse: true },
    reviewerName: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    rating: Number,
    platform: String,
    link: String,
    reviewerMeta: String,
    reviewerAvatar: String,
    yearOfPassing: String,
    idNumber: String,
    // Sheet-imported reviews never set this and are treated as already
    // vetted (see the $nin filter on the public reviews route); only
    // student-submitted reviews explicitly start out 'pending'.
    status: { type: String, enum: REVIEW_STATUS_VALUES, default: 'approved' },
  },
  { timestamps: true }
);

export default model<IReview>('Review', reviewSchema);
