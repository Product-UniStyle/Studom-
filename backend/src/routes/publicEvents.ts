import { Router } from 'express';
import { escapeRegex } from '../lib/inclusions';
import Event from '../models/Event';

const router = Router();

const LIST_FIELDS = 'title coverImage date time mode category venue registrationDeadline';

router.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const status = req.query.status === 'past' ? 'past' : req.query.status === 'all' ? 'all' : 'upcoming';
  const sort = req.query.sort === 'oldest' ? -1 : 1;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  const filter: Record<string, unknown> = {};
  if (search) filter.title = new RegExp(escapeRegex(search), 'i');
  if (category) filter.category = category;

  const now = new Date();
  if (status === 'upcoming') filter.date = { $gte: now };
  else if (status === 'past') filter.date = { $lt: now };

  const [items, total] = await Promise.all([
    Event.find(filter)
      .select(LIST_FIELDS)
      .populate('universityId', 'name')
      .sort({ date: status === 'past' ? -1 : sort })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

router.get('/categories', async (_req, res) => {
  const categories = await Event.distinct('category');
  res.json({ categories: (categories as unknown[]).filter(Boolean).sort() });
});

router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id).populate('universityId', 'name city country').lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

export default router;
