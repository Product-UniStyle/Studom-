import { Schema, model, Document, Types } from 'mongoose';

export interface IDocumentFolder extends Document {
  ownerId: Types.ObjectId;
  name: string;
}

const documentFolderSchema = new Schema<IDocumentFolder>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

documentFolderSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export default model<IDocumentFolder>('DocumentFolder', documentFolderSchema);
