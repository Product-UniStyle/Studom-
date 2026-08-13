import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import InstitutionAccount from '../models/InstitutionAccount';
import University from '../models/University';
import Application from '../models/Application';
import Contributor from '../models/Contributor';
import Inquiry from '../models/Inquiry';
import Review from '../models/Review';
import { requireInstitution, InstitutionAuthedRequest } from '../middleware/institutionAuth';

const router = Router();

router.post('/signup', async (req, res) => {
  const { fullName, email, universityId, universityName, designation, password } = req.body as {
    fullName?: string;
    email?: string;
    universityId?: string;
    universityName?: string;
    designation?: string;
    password?: string;
  };

  if (!fullName || !email || !universityId || !universityName || !password) {
    return res
      .status(400)
      .json({ error: 'Full name, email, university, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const university = await University.findById(universityId).select('_id');
  if (!university) return res.status(400).json({ error: 'Selected university was not found' });

  const existing = await InstitutionAccount.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Institution login is not configured' });

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await InstitutionAccount.create({
    fullName,
    email: email.toLowerCase(),
    universityId,
    universityName,
    designation,
    password: passwordHash,
  });

  const token = jwt.sign(
    { sub: account._id.toString(), email: account.email, universityId: account.universityId.toString() },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  res.status(201).json({ token, fullName: account.fullName, universityName: account.universityName });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Institution login is not configured' });
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const account = await InstitutionAccount.findOne({ email: email.toLowerCase() });
  if (!account) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, account.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { sub: account._id.toString(), email: account.email, universityId: account.universityId.toString() },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  res.json({ token, fullName: account.fullName, universityName: account.universityName });
});

router.get('/me', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const account = await InstitutionAccount.findById(req.institution!.id).select('-password -__v');
  if (!account) return res.status(404).json({ error: 'Institution account not found' });

  const university = await University.findById(req.institution!.universityId).select(
    'name city country logo image overallScore slug'
  );

  const universityId = req.institution!.universityId;
  const [
    totalApplications,
    pendingApplications,
    offerApplications,
    rejectedApplications,
    totalContributors,
    pendingContributors,
    approvedContributors,
    rejectedContributors,
    contactEnquiries,
    totalReviews,
  ] = await Promise.all([
    Application.countDocuments({ universityId }),
    Application.countDocuments({ universityId, status: { $in: ['Submitted', 'Under Review', 'Shortlisted'] } }),
    Application.countDocuments({ universityId, status: 'Offer Received' }),
    Application.countDocuments({ universityId, status: 'Rejected' }),
    Contributor.countDocuments({ universityId }),
    Contributor.countDocuments({ universityId, status: 'Pending Review' }),
    Contributor.countDocuments({ universityId, status: 'Approved' }),
    Contributor.countDocuments({ universityId, status: 'Rejected' }),
    Inquiry.countDocuments({ universityId }),
    Review.countDocuments({ universityId }),
  ]);

  res.json({
    account,
    university,
    stats: {
      totalApplications,
      pendingApplications,
      offerApplications,
      rejectedApplications,
      totalContributors,
      pendingContributors,
      approvedContributors,
      rejectedContributors,
      contactEnquiries,
      totalReviews,
    },
  });
});

router.get('/applications', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const applications = await Application.find({ universityId: req.institution!.universityId })
    .populate('studentId', 'fullName email')
    .sort({ appliedOn: -1 })
    .lean();
  res.json({ items: applications, total: applications.length });
});

router.get('/contributors', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const contributors = await Contributor.find({ universityId: req.institution!.universityId })
    .sort({ date: -1 })
    .lean();
  res.json({ items: contributors, total: contributors.length });
});

export default router;
