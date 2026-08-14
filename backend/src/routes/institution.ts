import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import InstitutionAccount from '../models/InstitutionAccount';
import University from '../models/University';
import Application, { APPLICATION_STATUS_VALUES } from '../models/Application';
import Contributor, { CONTRIBUTOR_STATUS_VALUES } from '../models/Contributor';
import Inquiry from '../models/Inquiry';
import Review from '../models/Review';
import EssayQuestion from '../models/EssayQuestion';
import StudentDocument from '../models/Document';
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
    'name city country logo image overallScore slug pageViews'
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
      pageViews: university?.pageViews || 0,
    },
  });
});

router.patch('/me', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const { fullName, universityName, designation, phone, email } = req.body as {
    fullName?: string;
    universityName?: string;
    designation?: string;
    phone?: string;
    email?: string;
  };

  const update: Record<string, unknown> = {};
  if (typeof fullName === 'string' && fullName.trim()) update.fullName = fullName.trim();
  if (typeof universityName === 'string' && universityName.trim()) update.universityName = universityName.trim();
  if (typeof designation === 'string') update.designation = designation.trim();
  if (typeof phone === 'string') update.phone = phone.trim();
  if (typeof email === 'string' && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await InstitutionAccount.findOne({
      email: normalizedEmail,
      _id: { $ne: req.institution!.id },
    }).select('_id');
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    update.email = normalizedEmail;
  }

  const account = await InstitutionAccount.findByIdAndUpdate(
    req.institution!.id,
    { $set: update },
    { new: true, runValidators: true }
  ).select('-password -__v');
  if (!account) return res.status(404).json({ error: 'Institution account not found' });

  res.json({ account });
});

router.patch('/me/password', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const account = await InstitutionAccount.findById(req.institution!.id);
  if (!account) return res.status(404).json({ error: 'Institution account not found' });

  const valid = await bcrypt.compare(currentPassword, account.password);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  account.password = await bcrypt.hash(newPassword, 10);
  await account.save();

  res.json({ success: true });
});

router.get('/applications', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const applications = await Application.find({ universityId: req.institution!.universityId })
    .populate('studentId', 'fullName email')
    .sort({ appliedOn: -1 })
    .lean();
  res.json({ items: applications, total: applications.length });
});

router.get('/applications/:id', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    universityId: req.institution!.universityId,
  })
    .populate(
      'studentId',
      'fullName email avatar nationality currentLocation currentStage profile'
    )
    .lean();
  if (!application) return res.status(404).json({ error: 'Application not found' });

  const studentId = (application.studentId as unknown as { _id: unknown })._id;
  const [essays, documents] = await Promise.all([
    EssayQuestion.find({ applicationId: application._id }).select('question answer').lean(),
    StudentDocument.find({ ownerId: studentId }).select('name fileUrl category status date').lean(),
  ]);

  res.json({ application, essays, documents });
});

router.patch('/applications/:id', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const { status } = req.body as { status?: string };
  if (!status || !(APPLICATION_STATUS_VALUES as string[]).includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, universityId: req.institution!.universityId },
    { $set: { status, lastViewed: new Date() } },
    { new: true }
  );
  if (!application) return res.status(404).json({ error: 'Application not found' });

  res.json({ item: application });
});

router.get('/contributors', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const contributors = await Contributor.find({ universityId: req.institution!.universityId })
    .sort({ date: -1 })
    .lean();
  res.json({ items: contributors, total: contributors.length });
});

router.patch('/contributors/:id', requireInstitution, async (req: InstitutionAuthedRequest, res) => {
  const { status } = req.body as { status?: string };
  if (!status || !(CONTRIBUTOR_STATUS_VALUES as string[]).includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const contributor = await Contributor.findOneAndUpdate(
    { _id: req.params.id, universityId: req.institution!.universityId },
    { $set: { status } },
    { new: true }
  );
  if (!contributor) return res.status(404).json({ error: 'Contributor application not found' });

  res.json({ item: contributor });
});

export default router;
