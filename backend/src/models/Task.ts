import { Schema, model, Document, Types } from 'mongoose';

export interface ITask extends Document {
  applicationId: Types.ObjectId;
  title: string;
  due?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    title: { type: String, required: true },
    due: Date,
  },
  { timestamps: true }
);

export default model<ITask>('Task', taskSchema);
