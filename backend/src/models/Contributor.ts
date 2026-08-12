import { Schema, model, Document, Types } from 'mongoose';

export type ContributorStatus = 'Pending Review' | 'Approved' | 'Rejected';
export const CONTRIBUTOR_STATUS_VALUES: ContributorStatus[] = ['Pending Review', 'Approved', 'Rejected'];

export interface IContributor extends Document {
  universityId: Types.ObjectId;
  name: string;
  type?: string;
  date: Date;
  status: ContributorStatus;
  courseOfStudy?: string;
  yearOfStudy?: string;
}

const contributorSchema = new Schema<IContributor>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    name: { type: String, required: true },
    type: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: CONTRIBUTOR_STATUS_VALUES, default: 'Pending Review' },
    courseOfStudy: String,
    yearOfStudy: String,
  },
  { timestamps: true }
);

export default model<IContributor>('Contributor', contributorSchema);
