import { Schema, model, Document, Types } from 'mongoose';

export interface IInstitutionAccount extends Document {
  universityId: Types.ObjectId;
  fullName: string;
  email: string;
  universityName: string;
  designation?: string;
  password: string;
}

const institutionAccountSchema = new Schema<IInstitutionAccount>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    universityName: { type: String, required: true },
    designation: String,
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IInstitutionAccount>('InstitutionAccount', institutionAccountSchema);
