import { Schema, model, Document, Types } from 'mongoose';

export interface IEssayQuestion extends Document {
  applicationId: Types.ObjectId;
  question: string;
  universities: Types.ObjectId[];
  answer?: string;
}

const essayQuestionSchema = new Schema<IEssayQuestion>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    question: { type: String, required: true },
    universities: [{ type: Schema.Types.ObjectId, ref: 'University' }],
    answer: String,
  },
  { timestamps: true }
);

export default model<IEssayQuestion>('EssayQuestion', essayQuestionSchema);
