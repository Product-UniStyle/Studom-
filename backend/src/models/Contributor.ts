import { Schema, model, Document, Types } from 'mongoose';

export type ContributorStatus = 'Pending Review' | 'Approved' | 'Rejected';
export const CONTRIBUTOR_STATUS_VALUES: ContributorStatus[] = ['Pending Review', 'Approved', 'Rejected'];

export interface IContributor extends Document {
  universityId: Types.ObjectId;
  name: string;
  email?: string;
  type?: string;
  date: Date;
  status: ContributorStatus;
  courseOfStudy?: string;
  yearOfStudy?: string;
  expectedGraduationYear?: string;
  reason?: string;
  proofUrl?: string;
}

const contributorSchema = new Schema<IContributor>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    name: { type: String, required: true },
    email: String,
    type: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: CONTRIBUTOR_STATUS_VALUES, default: 'Pending Review' },
    courseOfStudy: String,
    yearOfStudy: String,
    expectedGraduationYear: String,
    reason: String,
    proofUrl: String,
  },
  { timestamps: true }
);

export default model<IContributor>('Contributor', contributorSchema);
