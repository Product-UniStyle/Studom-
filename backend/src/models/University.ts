import { Schema, model, Document, Types } from 'mongoose';

export type UniversityType = 'School' | 'College' | 'University' | 'Tuition';
export const UNIVERSITY_TYPE_VALUES: UniversityType[] = ['School', 'College', 'University', 'Tuition'];

export interface IUniversity extends Document {
  sourceId?: string;
  slug?: string;
  name: string;
  city: string;
  country: string;
  area?: string;
  image?: string;
  logo?: string;
  origin?: string;
  course?: string;
  type: UniversityType;
  qsRank?: number;
  uaeRank?: number;
  uaeScore?: number;
  overallScore?: number;
  latitude?: number;
  longitude?: number;
  googleMapLink?: string;
  costOfLiving?: number;
  studentPopulation?: number;
  aggregateRating?: number;
  aggregateReviewCount?: number;
  detail: {
    gallery: string[];
    about: string[];
    website?: string;
    poc?: {
      name?: string;
      address?: string;
      email?: string;
      phone?: string;
      fax?: string;
    };
  };
  // University | College only
  fieldsOfStudy?: string[];
  // School | Tuition only
  board?: string;
  grade?: string;
  subjects?: string[];
  performance?: string;
  locality?: string;
  mode?: string;
  inclusions: Types.ObjectId[];
  essayQuestions?: { question: string }[];
  pageViews: number;
}

const universitySchema = new Schema<IUniversity>(
  {
    sourceId: { type: String, unique: true, sparse: true },
    slug: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    area: String,
    image: String,
    logo: String,
    origin: String,
    course: String,
    type: { type: String, enum: UNIVERSITY_TYPE_VALUES, required: true },
    qsRank: Number,
    uaeRank: Number,
    uaeScore: Number,
    overallScore: Number,
    latitude: Number,
    longitude: Number,
    googleMapLink: String,
    costOfLiving: Number,
    studentPopulation: Number,
    aggregateRating: Number,
    aggregateReviewCount: Number,
    detail: {
      gallery: { type: [String], default: [] },
      about: { type: [String], default: [] },
      website: String,
      poc: {
        name: String,
        address: String,
        email: String,
        phone: String,
        fax: String,
      },
    },
    fieldsOfStudy: [String],
    board: String,
    grade: String,
    subjects: [String],
    performance: String,
    locality: String,
    mode: String,
    inclusions: [{ type: Schema.Types.ObjectId, ref: 'Inclusion' }],
    essayQuestions: {
      type: [{ question: { type: String, required: true } }],
      default: [],
    },
    pageViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IUniversity>('University', universitySchema);
