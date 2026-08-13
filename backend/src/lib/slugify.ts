import { Types } from 'mongoose';

const MAX_SLUG_LENGTH = 80;

export function slugify(text: string): string {
  const base = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (base.length <= MAX_SLUG_LENGTH) return base || 'item';

  // Cut at the last word boundary within the limit instead of mid-word.
  const truncated = base.slice(0, MAX_SLUG_LENGTH);
  const lastHyphen = truncated.lastIndexOf('-');
  return (lastHyphen > 20 ? truncated.slice(0, lastHyphen) : truncated) || 'item';
}

/**
 * A unique slug within a given set of already-taken slugs, appending
 * `-2`, `-3`, ... on collision. Mutates `taken` with the chosen slug so
 * callers can dedupe across a whole batch by reusing the same set.
 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base);
  let candidate = root;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  taken.add(candidate);
  return candidate;
}

/** Filter matching a document by its slug, or by _id if idOrSlug looks like a valid ObjectId. */
export function bySlugOrId(idOrSlug: string): Record<string, unknown> {
  if (Types.ObjectId.isValid(idOrSlug)) {
    return { $or: [{ slug: idOrSlug }, { _id: idOrSlug }] };
  }
  return { slug: idOrSlug };
}
