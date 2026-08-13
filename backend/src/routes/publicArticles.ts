import { Router } from 'express';
import { Model } from 'mongoose';
import { escapeRegex } from '../lib/inclusions';

const LIST_FIELDS = 'title coverImage author source destination publishedDate type content';
const WORDS_PER_MINUTE = 200;

/**
 * Public read-only counterpart to buildArticleAdminRouter — same
 * NewsArticle/BlogPost structural-identity reasoning applies here.
 */
export function buildPublicArticleRouter<T>(model: Model<T>): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
    const sort = req.query.sort === 'oldest' ? 1 : -1;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const filter: Record<string, unknown> = {};
    if (search) filter.title = new RegExp(escapeRegex(search), 'i');
    if (type) filter.type = type;

    const [rawItems, total] = await Promise.all([
      model
        .find(filter)
        .select(LIST_FIELDS)
        .sort({ publishedDate: sort })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      model.countDocuments(filter),
    ]);

    // Reading time is derived from the real content length (not sent to the
    // client) rather than a fixed placeholder — content itself stays out of
    // the list payload since detail pages fetch it separately.
    const items = (rawItems as { content?: string }[]).map(({ content, ...rest }) => {
      const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
      return { ...rest, readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
    });

    res.json({ items, total, page, limit });
  });

  router.get('/categories', async (_req, res) => {
    const types = await model.distinct('type');
    res.json({ categories: (types as unknown[]).filter(Boolean).sort() });
  });

  router.get('/:id', async (req, res) => {
    const doc = await model.findById(req.params.id).populate('universityIds', 'name').lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });

  return router;
}
