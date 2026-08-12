import { Schema, model, Document } from 'mongoose';

export type InclusionScope = 'Global' | 'University';
export const INCLUSION_SCOPE_VALUES: InclusionScope[] = ['Global', 'University'];

export interface IInclusion extends Document {
  label: string;
  icon?: string;
  scope: InclusionScope;
}

const inclusionSchema = new Schema<IInclusion>(
  {
    label: { type: String, required: true },
    icon: String,
    scope: { type: String, enum: INCLUSION_SCOPE_VALUES, default: 'Global' },
  },
  { timestamps: true }
);

export default model<IInclusion>('Inclusion', inclusionSchema);
