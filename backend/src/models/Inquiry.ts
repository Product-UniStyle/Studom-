import { Schema, model, Document, Types } from 'mongoose';

export interface IInquiry extends Document {
  universityId: Types.ObjectId;
  fullName: string;
  email: string;
  message: string;
  submittedAt: Date;
}

const inquirySchema = new Schema<IInquiry>({
  universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default model<IInquiry>('Inquiry', inquirySchema);
