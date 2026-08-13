import { Router } from 'express';
import { requireEditorOrAdmin } from '../middleware/adminAuth';
import { escapeRegex } from '../lib/inclusions';
import { uniqueSlug } from '../lib/slugify';
import Event, { EVENT_MODE_VALUES, EventMode } from '../models/Event';

const router = Router();

router.get('/', requireEditorOrAdmin, async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const filter: Record<string, unknown> = {};
  if (search) filter.title = new RegExp(escapeRegex(search), 'i');

  const [items, total] = await Promise.all([
    Event.find(filter)
      .select('title coverImage date mode category venue registrationDeadline updatedAt')
      .populate('universityId', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

router.get('/:id', requireEditorOrAdmin, async (req, res) => {
  const event = await Event.findById(req.params.id).populate('universityId', 'name').lean();
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.post('/', requireEditorOrAdmin, async (req, res) => {
  const body = req.body as Record<string, unknown>;

  if (!body.title || typeof body.title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!body.universityId || typeof body.universityId !== 'string') {
    return res.status(400).json({ error: 'Host university is required' });
  }
  if (!body.date) {
    return res.status(400).json({ error: 'Date is required' });
  }
  if (!body.mode || !(EVENT_MODE_VALUES as string[]).includes(body.mode as string)) {
    return res.status(400).json({ error: `Mode must be one of: ${EVENT_MODE_VALUES.join(', ')}` });
  }

  const takenSlugs = new Set((await Event.distinct('slug')).filter((s): s is string => Boolean(s)));
  const slug = uniqueSlug(body.title, takenSlugs);

  const event = await Event.create({ ...buildEventPayload(body), slug });
  await event.populate('universityId', 'name');
  res.status(201).json(event);
});

router.patch('/:id', requireEditorOrAdmin, async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const update = buildEventPayload(body);

  const event = await Event.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true })
    .populate('universityId', 'name');
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

router.delete('/:id', requireEditorOrAdmin, async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ success: true });
});

function buildEventPayload(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  const stringFields = [
    'title', 'coverImage', 'time', 'venue', 'venueAddress', 'category', 'language',
    'price', 'seatsInfo', 'aboutDescription', 'whoCanAttend', 'whatToBring',
    'registrationInfo', 'organiserContactEmail', 'organiserContactPhone',
  ];
  for (const field of stringFields) {
    if (typeof body[field] === 'string') update[field] = body[field];
  }

  const numberFields = ['latitude', 'longitude'];
  for (const field of numberFields) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      const n = Number(body[field]);
      if (Number.isFinite(n)) update[field] = n;
    }
  }

  if (typeof body.universityId === 'string' && body.universityId) update.universityId = body.universityId;
  if (typeof body.date === 'string' && body.date) {
    const d = new Date(body.date);
    if (!Number.isNaN(d.getTime())) update.date = d;
  }
  if (typeof body.registrationDeadline === 'string' && body.registrationDeadline) {
    const d = new Date(body.registrationDeadline);
    if (!Number.isNaN(d.getTime())) update.registrationDeadline = d;
  }
  if (typeof body.mode === 'string' && (EVENT_MODE_VALUES as string[]).includes(body.mode)) {
    update.mode = body.mode as EventMode;
  }
  if (Array.isArray(body.whatToExpect)) {
    update.whatToExpect = body.whatToExpect
      .filter((w): w is Record<string, unknown> => typeof w === 'object' && w !== null)
      .map((w) => ({
        text: typeof w.text === 'string' ? w.text : '',
        icon: typeof w.icon === 'string' ? w.icon : undefined,
      }))
      .filter((w) => w.text);
  }

  return update;
}

export default router;
