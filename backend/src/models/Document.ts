import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export type DocumentStatus = 'Uploaded' | 'Pending' | 'Requested';
export const DOCUMENT_STATUS_VALUES: DocumentStatus[] = ['Uploaded', 'Pending', 'Requested'];

export interface IDocument extends MongooseDocument {
  ownerId: Types.ObjectId;
  applicationId?: Types.ObjectId;
  name: string;
  fileUrl: string;
  category?: string;
  status?: DocumentStatus;
  date?: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    category: String,
    status: { type: String, enum: DOCUMENT_STATUS_VALUES },
    date: Date,
  },
  { timestamps: true }
);

export default model<IDocument>('Document', documentSchema);
