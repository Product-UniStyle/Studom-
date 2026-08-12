import { Schema, model, Document, Types } from 'mongoose';

export interface ISavedEvent extends Document {
  studentId: Types.ObjectId;
  eventId: Types.ObjectId;
  savedAt: Date;
}

const savedEventSchema = new Schema<ISavedEvent>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  savedAt: { type: Date, default: Date.now },
});

savedEventSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

export default model<ISavedEvent>('SavedEvent', savedEventSchema);
