import { Schema, model, Document, Types } from 'mongoose';

export type EventMode = 'In-person' | 'Online';
export const EVENT_MODE_VALUES: EventMode[] = ['In-person', 'Online'];

export interface IEventExpectation {
  icon?: string;
  text: string;
}

export interface IEvent extends Document {
  universityId: Types.ObjectId;
  title: string;
  coverImage?: string;
  date: Date;
  time?: string;
  venue?: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  mode: EventMode;
  category?: string;
  language?: string;
  price?: string;
  seatsInfo?: string;
  registrationDeadline?: Date;
  aboutDescription?: string;
  whatToExpect: IEventExpectation[];
  whoCanAttend?: string;
  whatToBring?: string;
  registrationInfo?: string;
  organiserContactEmail?: string;
  organiserContactPhone?: string;
}

const eventExpectationSchema = new Schema<IEventExpectation>(
  {
    icon: String,
    text: { type: String, required: true },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    title: { type: String, required: true },
    coverImage: String,
    date: { type: Date, required: true },
    time: String,
    venue: String,
    venueAddress: String,
    latitude: Number,
    longitude: Number,
    mode: { type: String, enum: EVENT_MODE_VALUES, required: true },
    category: String,
    language: String,
    price: String,
    seatsInfo: String,
    registrationDeadline: Date,
    aboutDescription: String,
    whatToExpect: [eventExpectationSchema],
    whoCanAttend: String,
    whatToBring: String,
    registrationInfo: String,
    organiserContactEmail: String,
    organiserContactPhone: String,
  },
  { timestamps: true }
);

export default model<IEvent>('Event', eventSchema);
