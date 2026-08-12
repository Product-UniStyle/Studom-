import { Types } from 'mongoose';
import Inclusion from '../models/Inclusion';

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function resolveInclusionIds(labels: string[]): Promise<Types.ObjectId[]> {
  const ids: Types.ObjectId[] = [];
  for (const label of labels) {
    let doc = await Inclusion.findOne({ label: new RegExp(`^${escapeRegex(label)}$`, 'i') });
    if (!doc) {
      doc = await Inclusion.create({ label, scope: 'University' });
    }
    ids.push(doc._id as Types.ObjectId);
  }
  return ids;
}
