import { Schema, model, Document } from 'mongoose';

export type StaffRole = 'admin' | 'editor';
export const STAFF_ROLE_VALUES: StaffRole[] = ['admin', 'editor'];

export interface IStaffUser extends Document {
  email: string;
  passwordHash: string;
  role: StaffRole;
  firstName?: string;
  lastName?: string;
}

const staffUserSchema = new Schema<IStaffUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: STAFF_ROLE_VALUES, required: true },
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
);

export default model<IStaffUser>('StaffUser', staffUserSchema);
