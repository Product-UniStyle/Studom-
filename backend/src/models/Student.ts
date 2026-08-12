import { Schema, model, Document } from 'mongoose';

export type CurrentStage = 'School Student' | 'Undergraduate' | 'Postgraduate' | 'Working Professional';
export const CURRENT_STAGE_VALUES: CurrentStage[] = [
  'School Student',
  'Undergraduate',
  'Postgraduate',
  'Working Professional',
];

export interface IActivity {
  name: string;
  role?: string;
  year?: string;
  description?: string;
}

export interface IAchievement {
  title: string;
  level?: string;
  year?: string;
  description?: string;
}

export interface IStudentProfile {
  personal: {
    mobile?: string;
    countryOfResidence?: string;
    schoolName?: string;
    currentGrade?: string;
    confirmed: boolean;
    gender?: string;
  };
  education: {
    curriculum?: string;
    gradYear?: string;
    subjects?: string[];
    latestGrades?: string;
    predictedGrades?: string;
    englishTest?: string;
    standardizedTest?: string;
    intendedCourse?: string;
  };
  activities: IActivity[];
  achievements: IAchievement[];
}

export interface IStudentPreferences {
  preferredIntake?: string;
  preferredCountry?: string;
  preferredCity?: string;
  notificationPreference?: string;
}

export interface IStudent extends Document {
  fullName: string;
  email: string;
  password: string;
  birthdate?: Date;
  currentStage: CurrentStage;
  avatar?: string;
  nationality?: string;
  currentLocation?: string;
  profile: IStudentProfile;
  preferences: IStudentPreferences;
}

const activitySchema = new Schema<IActivity>(
  {
    name: { type: String, required: true },
    role: String,
    year: String,
    description: String,
  },
  { _id: false }
);

const achievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    level: String,
    year: String,
    description: String,
  },
  { _id: false }
);

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    personal: {
      mobile: String,
      countryOfResidence: String,
      schoolName: String,
      currentGrade: String,
      confirmed: { type: Boolean, default: false },
      gender: String,
    },
    education: {
      curriculum: String,
      gradYear: String,
      subjects: [String],
      latestGrades: String,
      predictedGrades: String,
      englishTest: String,
      standardizedTest: String,
      intendedCourse: String,
    },
    activities: [activitySchema],
    achievements: [achievementSchema],
  },
  { _id: false }
);

const studentPreferencesSchema = new Schema<IStudentPreferences>(
  {
    preferredIntake: String,
    preferredCountry: String,
    preferredCity: String,
    notificationPreference: String,
  },
  { _id: false }
);

const studentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: Date,
    currentStage: { type: String, enum: CURRENT_STAGE_VALUES, required: true },
    avatar: String,
    nationality: String,
    currentLocation: String,
    profile: { type: studentProfileSchema, default: () => ({}) },
    preferences: { type: studentPreferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default model<IStudent>('Student', studentSchema);
