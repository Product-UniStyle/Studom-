import { Schema, model, Document, Types } from 'mongoose';

export interface IEventRegistration extends Document {
  studentId: Types.ObjectId;
  eventId: Types.ObjectId;
  registeredAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  registeredAt: { type: Date, default: Date.now },
});

eventRegistrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

export default model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
