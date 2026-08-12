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

/**
 * Resolves every distinct label across a whole import batch in a handful of
 * queries instead of one round-trip per row — keyed by lowercase label so
 * callers can look up each row's own labels from the returned map.
 */
export async function resolveInclusionIdsMap(allLabels: string[]): Promise<Map<string, Types.ObjectId>> {
  const uniqueLabels = [...new Set(allLabels.map((l) => l.trim()).filter(Boolean))];
  const map = new Map<string, Types.ObjectId>();
  if (uniqueLabels.length === 0) return map;

  const existing = await Inclusion.find({
    label: { $in: uniqueLabels.map((l) => new RegExp(`^${escapeRegex(l)}$`, 'i')) },
  }).lean();
  for (const doc of existing) {
    map.set(doc.label.toLowerCase(), doc._id as Types.ObjectId);
  }

  const toCreate = uniqueLabels.filter((l) => !map.has(l.toLowerCase()));
  if (toCreate.length > 0) {
    const created = await Inclusion.insertMany(
      toCreate.map((label) => ({ label, scope: 'University' })),
      { ordered: false }
    );
    for (const doc of created) {
      map.set(doc.label.toLowerCase(), doc._id as Types.ObjectId);
    }
  }

  return map;
}
