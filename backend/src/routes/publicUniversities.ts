import { Router } from 'express';
import University, { UNIVERSITY_TYPE_VALUES } from '../models/University';
import Review from '../models/Review';
import { escapeRegex } from '../lib/inclusions';
import { bySlugOrId } from '../lib/slugify';

const router = Router();

const LIST_FIELDS = 'slug name city country type image logo qsRank origin aggregateRating aggregateReviewCount';
const DETAIL_FIELDS =
  'slug name city country area type image logo origin course qsRank uaeRank uaeScore overallScore ' +
  'latitude longitude googleMapLink costOfLiving studentPopulation aggregateRating aggregateReviewCount ' +
  'fieldsOfStudy board grade subjects performance locality mode detail inclusions essayQuestions';

router.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
  const fieldOfStudy = typeof req.query.fieldOfStudy === 'string' ? req.query.fieldOfStudy.trim() : '';
  const grade = typeof req.query.grade === 'string' ? req.query.grade.trim() : '';
  const mode = typeof req.query.mode === 'string' ? req.query.mode.trim() : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 8));

  const filter: Record<string, unknown> = {};
  if (search) filter.name = new RegExp(escapeRegex(search), 'i');
  if (type && (UNIVERSITY_TYPE_VALUES as string[]).includes(type)) filter.type = type;
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (country) filter.country = new RegExp(`^${escapeRegex(country)}$`, 'i');
  if (fieldOfStudy) filter.fieldsOfStudy = new RegExp(`^${escapeRegex(fieldOfStudy)}$`, 'i');
  if (grade) filter.grade = new RegExp(`^${escapeRegex(grade)}$`, 'i');
  if (mode) filter.mode = new RegExp(`^${escapeRegex(mode)}$`, 'i');

  const [items, total] = await Promise.all([
    University.find(filter)
      .select(LIST_FIELDS)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    University.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit });
});

router.get('/facets', async (req, res) => {
  const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
  const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';

  const baseFilter: Record<string, unknown> = {};
  if (type && (UNIVERSITY_TYPE_VALUES as string[]).includes(type)) baseFilter.type = type;

  const cityFilter = { ...baseFilter };
  if (country) cityFilter.country = new RegExp(`^${escapeRegex(country)}$`, 'i');

  const [countries, cities, fieldsOfStudy, grades] = await Promise.all([
    University.distinct('country', baseFilter),
    University.distinct('city', cityFilter),
    University.distinct('fieldsOfStudy', baseFilter),
    University.distinct('grade', baseFilter),
  ]);

  res.json({
    countries: countries.filter(Boolean).sort(),
    cities: cities.filter(Boolean).sort(),
    fieldsOfStudy: fieldsOfStudy.filter(Boolean).sort(),
    grades: grades.filter(Boolean).sort(),
  });
});

router.get('/:id', async (req, res) => {
  // Every real detail-page load counts as one page view, tracked via an
  // atomic increment on the same lookup (rather than a separate call) so
  // the frontend doesn't need a second round-trip just to record a visit.
  const university = await University.findOneAndUpdate(
    bySlugOrId(req.params.id),
    { $inc: { pageViews: 1 } },
    { new: true }
  )
    .select(DETAIL_FIELDS)
    .populate('inclusions', 'label icon')
    .lean();
  if (!university) return res.status(404).json({ error: 'University not found' });
  res.json(university);
});

router.get('/:id/reviews', async (req, res) => {
  const university = await University.findOne(bySlugOrId(req.params.id)).select('_id').lean();
  if (!university) return res.status(404).json({ error: 'University not found' });

  const reviews = await Review.find({ universityId: university._id })
    .select('reviewerName text date rating platform reviewerMeta reviewerAvatar')
    .sort({ date: -1 })
    .limit(50)
    .lean();
  res.json({ items: reviews, total: reviews.length });
});

export default router;
