import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { resolveInclusionIds, escapeRegex } from '../lib/inclusions';
import University, { UNIVERSITY_TYPE_VALUES, UniversityType } from '../models/University';
import Review from '../models/Review';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const filter: Record<string, unknown> = {};
  if (search) filter.name = new RegExp(escapeRegex(search), 'i');
  if (type && (UNIVERSITY_TYPE_VALUES as string[]).includes(type)) filter.type = type;

  const [items, total] = await Promise.all([
    University.find(filter)
      .select('name city country type qsRank aggregateRating aggregateReviewCount logo sourceId updatedAt')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    University.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

router.get('/:id', requireAdmin, async (req, res) => {
  const university = await University.findById(req.params.id).populate('inclusions', 'label').lean();
  if (!university) return res.status(404).json({ error: 'University not found' });
  res.json(university);
});

router.get('/:id/reviews', requireAdmin, async (req, res) => {
  const reviews = await Review.find({ universityId: req.params.id })
    .select('reviewerName text date rating platform link reviewerMeta')
    .sort({ date: -1 })
    .limit(100)
    .lean();
  res.json({ items: reviews, total: reviews.length });
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const body = req.body as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  const stringFields = [
    'name', 'city', 'country', 'area', 'image', 'logo', 'origin', 'course',
    'board', 'grade', 'performance', 'locality', 'mode', 'googleMapLink',
  ];
  const numberFields = [
    'qsRank', 'uaeRank', 'uaeScore', 'overallScore', 'latitude', 'longitude',
    'costOfLiving', 'studentPopulation', 'aggregateRating', 'aggregateReviewCount',
  ];

  for (const field of stringFields) {
    if (typeof body[field] === 'string') update[field] = body[field];
  }
  for (const field of numberFields) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      const n = Number(body[field]);
      if (Number.isFinite(n)) update[field] = n;
    }
  }
  if (typeof body.type === 'string' && (UNIVERSITY_TYPE_VALUES as string[]).includes(body.type)) {
    update.type = body.type as UniversityType;
  }
  if (Array.isArray(body.fieldsOfStudy)) {
    update.fieldsOfStudy = body.fieldsOfStudy.filter((v): v is string => typeof v === 'string');
  }
  if (Array.isArray(body.subjects)) {
    update.subjects = body.subjects.filter((v): v is string => typeof v === 'string');
  }
  if (body.detail && typeof body.detail === 'object') {
    const detail = body.detail as Record<string, unknown>;
    const detailUpdate: Record<string, unknown> = {};
    if (Array.isArray(detail.gallery)) detailUpdate.gallery = detail.gallery.filter((v): v is string => typeof v === 'string');
    if (Array.isArray(detail.about)) detailUpdate.about = detail.about.filter((v): v is string => typeof v === 'string');
    if (typeof detail.website === 'string') detailUpdate.website = detail.website;
    if (detail.poc && typeof detail.poc === 'object') {
      const poc = detail.poc as Record<string, unknown>;
      const pocUpdate: Record<string, unknown> = {};
      if (typeof poc.name === 'string') pocUpdate.name = poc.name;
      if (typeof poc.address === 'string') pocUpdate.address = poc.address;
      if (typeof poc.email === 'string') pocUpdate.email = poc.email;
      if (typeof poc.phone === 'string') pocUpdate.phone = poc.phone;
      if (typeof poc.fax === 'string') pocUpdate.fax = poc.fax;
      detailUpdate.poc = pocUpdate;
    }
    update.detail = detailUpdate;
  }
  if (Array.isArray(body.inclusionLabels)) {
    const labels = body.inclusionLabels.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    update.inclusions = await resolveInclusionIds(labels);
  }

  const university = await University.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true, runValidators: true }
  ).populate('inclusions', 'label');

  if (!university) return res.status(404).json({ error: 'University not found' });
  res.json(university);
});

export default router;
