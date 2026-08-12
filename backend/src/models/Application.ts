import { Schema, model, Document, Types } from 'mongoose';

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Offer Received' | 'Rejected';
export const APPLICATION_STATUS_VALUES: ApplicationStatus[] = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Offer Received',
  'Rejected',
];

export interface IApplication extends Document {
  studentId: Types.ObjectId;
  universityId: Types.ObjectId;
  applicationRef: string;
  appliedOn: Date;
  status: ApplicationStatus;
  course?: string;
  lastViewed?: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    applicationRef: { type: String, required: true, unique: true },
    appliedOn: { type: Date, default: Date.now },
    status: { type: String, enum: APPLICATION_STATUS_VALUES, default: 'Submitted' },
    course: String,
    lastViewed: Date,
  },
  { timestamps: true }
);

export default model<IApplication>('Application', applicationSchema);
