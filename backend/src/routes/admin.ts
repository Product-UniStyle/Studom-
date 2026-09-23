import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import StaffUser, { STAFF_ROLE_VALUES, StaffRole } from '../models/StaffUser';
import Review, { REVIEW_STATUS_VALUES, ReviewStatus } from '../models/Review';
import University from '../models/University';
import { requireAdmin, requireEditorOrAdmin, StaffAuthedRequest } from '../middleware/adminAuth';
import { sendStaffCredentials } from '../lib/mailer';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Admin login is not configured' });
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await StaffUser.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  res.json({ token, role: user.role, email: user.email });
});

router.get('/users', requireAdmin, async (_req, res) => {
  const users = await StaffUser.find().select('-passwordHash -__v').sort({ createdAt: -1 }).lean();
  res.json({ users });
});

router.post('/users', requireAdmin, async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body as {
    email?: string;
    password?: string;
    role?: StaffRole;
    firstName?: string;
    lastName?: string;
  };

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!(STAFF_ROLE_VALUES as string[]).includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${STAFF_ROLE_VALUES.join(', ')}` });
  }

  const existing = await StaffUser.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'A staff account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await StaffUser.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    firstName,
    lastName,
  });

  sendStaffCredentials({ to: user.email, firstName: user.firstName, role: user.role, password }).catch((err) =>
    console.error('[mailer] failed to send staff credentials email:', err instanceof Error ? err.message : err)
  );

  const { passwordHash: _unused, ...userObj } = user.toObject();
  res.status(201).json({ user: userObj });
});

router.patch('/users/:id/role', requireAdmin, async (req: StaffAuthedRequest, res) => {
  const { role } = req.body as { role?: StaffRole };
  if (!role || !(STAFF_ROLE_VALUES as string[]).includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${STAFF_ROLE_VALUES.join(', ')}` });
  }
  if (req.staffUser?.id === req.params.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  const user = await StaffUser.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.delete('/users/:id', requireAdmin, async (req: StaffAuthedRequest, res) => {
  if (req.staffUser?.id === req.params.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const user = await StaffUser.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'Staff user not found' });
  res.status(204).end();
});

router.get('/reviews', requireEditorOrAdmin, async (req, res) => {
  const status = req.query.status as string | undefined;
  const filter: Record<string, unknown> = {};
  if (status && (REVIEW_STATUS_VALUES as string[]).includes(status)) {
    filter.status = status;
  } else {
    filter.status = 'pending';
  }

  const reviews = await Review.find(filter)
    .populate('universityId', 'name city country')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ items: reviews, total: reviews.length });
});

router.patch('/reviews/:id/status', requireEditorOrAdmin, async (req, res) => {
  const { status } = req.body as { status?: ReviewStatus };
  if (!status || !(REVIEW_STATUS_VALUES as string[]).includes(status) || status === 'pending') {
    return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
  }

  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const wasApproved = review.status === 'approved';
  if (status === 'approved' && !wasApproved) {
    // Sheet-imported universities already carry a precomputed aggregateRating
    // / aggregateReviewCount, so an approved review has to fold into that
    // weighted average rather than just recounting from the Review collection.
    if (typeof review.rating === 'number') {
      const university = await University.findById(review.universityId).select('aggregateRating aggregateReviewCount');
      if (university) {
        const previousCount = university.aggregateReviewCount || 0;
        const previousAvg = university.aggregateRating || 0;
        const newCount = previousCount + 1;
        const newAvg = Math.round(((previousAvg * previousCount + review.rating) / newCount) * 10) / 10;
        university.aggregateReviewCount = newCount;
        university.aggregateRating = newAvg;
        await university.save();
      }
    }
  } else if (status === 'rejected' && wasApproved && typeof review.rating === 'number') {
    // Reverses the fold-in above for an approved review that's being undone.
    const university = await University.findById(review.universityId).select('aggregateRating aggregateReviewCount');
    if (university) {
      const previousCount = university.aggregateReviewCount || 0;
      const previousAvg = university.aggregateRating || 0;
      const newCount = Math.max(previousCount - 1, 0);
      const newAvg = newCount > 0 ? Math.round(((previousAvg * previousCount - review.rating) / newCount) * 10) / 10 : 0;
      university.aggregateReviewCount = newCount;
      university.aggregateRating = newAvg;
      await university.save();
    }
  }

  review.status = status;
  await review.save();

  res.json({ review });
});

export default router;
