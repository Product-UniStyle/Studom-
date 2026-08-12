import { Router } from 'express';
import { Model } from 'mongoose';
import { requireEditorOrAdmin } from '../middleware/adminAuth';
import { escapeRegex } from '../lib/inclusions';

const LIST_FIELDS = 'title coverImage author source destination publishedDate type sourceLink updatedAt';

/**
 * NewsArticle and BlogPost are structurally identical (same schema shape,
 * kept as two separate collections per the schema design's explicit call —
 * see docs/schema.md) — one router factory covers CRUD for both instead of
 * duplicating the same routes twice.
 */
export function buildArticleAdminRouter<T>(model: Model<T>): Router {
  const router = Router();

  router.get('/', requireEditorOrAdmin, async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const filter: Record<string, unknown> = {};
    if (search) filter.title = new RegExp(escapeRegex(search), 'i');

    const [items, total] = await Promise.all([
      model
        .find(filter)
        .select(LIST_FIELDS)
        .sort({ publishedDate: -1, title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      model.countDocuments(filter),
    ]);

    res.json({ items, total, page, limit });
  });

  router.get('/:id', requireEditorOrAdmin, async (req, res) => {
    const doc = await model.findById(req.params.id).populate('universityIds', 'name').lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });

  router.patch('/:id', requireEditorOrAdmin, async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    const stringFields = ['title', 'content', 'coverImage', 'sourceLink', 'author', 'source', 'destination', 'type'];
    for (const field of stringFields) {
      if (typeof body[field] === 'string') update[field] = body[field];
    }
    if (typeof body.publishedDate === 'string' && body.publishedDate) {
      const d = new Date(body.publishedDate);
      if (!Number.isNaN(d.getTime())) update.publishedDate = d;
    }
    if (Array.isArray(body.universityIds)) {
      update.universityIds = body.universityIds.filter((v): v is string => typeof v === 'string');
    }
    if (Array.isArray(body.sections)) {
      update.sections = body.sections
        .filter((s): s is Record<string, unknown> => typeof s === 'object' && s !== null)
        .map((s, i) => ({
          order: typeof s.order === 'number' ? s.order : i + 1,
          title: typeof s.title === 'string' ? s.title : undefined,
          image: typeof s.image === 'string' ? s.image : undefined,
          content: typeof s.content === 'string' ? s.content : '',
        }));
    }

    const doc = await model
      .findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true })
      .populate('universityIds', 'name');
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });

  router.delete('/:id', requireEditorOrAdmin, async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });

  return router;
}
