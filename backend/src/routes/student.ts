import { Router } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { randomInt } from 'crypto';
import Student, { CURRENT_STAGE_VALUES, CurrentStage } from '../models/Student';
import Application from '../models/Application';
import EssayQuestion from '../models/EssayQuestion';
import Task from '../models/Task';
import StudentDocument from '../models/Document';
import University from '../models/University';
import Review from '../models/Review';
import { requireStudent, StudentAuthedRequest } from '../middleware/studentAuth';
import { uploadImageToS3 } from '../lib/s3';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Mongoose's `minimize: true` default strips embedded objects that end up
// fully empty (e.g. a brand-new student's `preferences`), so restore them
// here to keep the response shape consistent for the frontend.
function serializeStudent(student: InstanceType<typeof Student>) {
  const { password: _password, __v: _v, ...studentObj } = student.toObject();
  studentObj.preferences = studentObj.preferences || {};
  studentObj.profile = studentObj.profile || {};
  studentObj.profile.personal = studentObj.profile.personal || {};
  studentObj.profile.education = studentObj.profile.education || {};
  studentObj.profile.activities = studentObj.profile.activities || [];
  studentObj.profile.achievements = studentObj.profile.achievements || [];
  return studentObj;
}

function computeProfileCompletion(student: InstanceType<typeof Student>): number {
  const fields = [
    student.birthdate,
    student.nationality,
    student.currentLocation,
    student.profile?.personal?.mobile,
    student.profile?.personal?.schoolName,
    student.profile?.personal?.currentGrade,
    student.profile?.education?.curriculum,
    student.profile?.education?.gradYear,
    student.profile?.education?.subjects?.length ? 'y' : undefined,
    student.profile?.education?.intendedCourse,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function generateApplicationRef(): string {
  return `STDM-${new Date().getFullYear()}-${randomInt(100000, 999999)}`;
}

router.post('/signup', async (req, res) => {
  const { fullName, email, password, birthdate, currentStage } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
    birthdate?: string;
    currentStage?: CurrentStage;
  };

  if (!fullName || !email || !password || !currentStage) {
    return res.status(400).json({ error: 'Full name, email, password, and current stage are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!(CURRENT_STAGE_VALUES as string[]).includes(currentStage)) {
    return res.status(400).json({ error: `Current stage must be one of: ${CURRENT_STAGE_VALUES.join(', ')}` });
  }

  const existing = await Student.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Student login is not configured' });

  const passwordHash = await bcrypt.hash(password, 10);
  const student = await Student.create({
    fullName,
    email: email.toLowerCase(),
    password: passwordHash,
    birthdate: birthdate ? new Date(birthdate) : undefined,
    currentStage,
  });

  const token = jwt.sign({ sub: student._id.toString(), email: student.email }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });

  res.status(201).json({ token, fullName: student.fullName, email: student.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Student login is not configured' });
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const student = await Student.findOne({ email: email.toLowerCase() });
  if (!student) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, student.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ sub: student._id.toString(), email: student.email }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });

  res.json({ token, fullName: student.fullName, email: student.email });
});

router.get('/me', requireStudent, async (req: StudentAuthedRequest, res) => {
  const student = await Student.findById(req.student!.id).select('-password -__v');
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const [applicationsCount, documentsCount] = await Promise.all([
    Application.countDocuments({ studentId: student._id }),
    StudentDocument.countDocuments({ ownerId: student._id }),
  ]);

  res.json({
    student: serializeStudent(student),
    stats: {
      applicationsCount,
      documentsCount,
      profileCompletion: computeProfileCompletion(student),
    },
  });
});

interface PersonalPatch {
  mobile?: string;
  countryOfResidence?: string;
  schoolName?: string;
  currentGrade?: string;
  confirmed?: boolean;
  gender?: string;
}

interface EducationPatch {
  curriculum?: string;
  gradYear?: string;
  subjects?: string[];
  latestGrades?: string;
  predictedGrades?: string;
  englishTest?: string;
  standardizedTest?: string;
  intendedCourse?: string;
}

interface ActivityPatch {
  name: string;
  role?: string;
  year?: string;
  description?: string;
}

interface AchievementPatch {
  title: string;
  level?: string;
  year?: string;
  description?: string;
}

router.patch('/me', requireStudent, async (req: StudentAuthedRequest, res) => {
  const { fullName, email, birthdate, nationality, currentLocation, personal, education, activities, achievements, preferences } =
    req.body as {
      fullName?: string;
      email?: string;
      birthdate?: string;
      nationality?: string;
      currentLocation?: string;
      personal?: PersonalPatch;
      education?: EducationPatch;
      activities?: ActivityPatch[];
      achievements?: AchievementPatch[];
      preferences?: {
        preferredIntake?: string;
        preferredCountry?: string;
        preferredCity?: string;
        notificationPreference?: string;
      };
    };

  const student = await Student.findById(req.student!.id).select('-password -__v');
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (fullName) student.fullName = fullName;
  if (email && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== student.email) {
      const existing = await Student.findOne({ email: normalizedEmail, _id: { $ne: student._id } }).select('_id');
      if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
      student.email = normalizedEmail;
    }
  }
  if (birthdate) student.birthdate = new Date(birthdate);
  if (nationality !== undefined) student.nationality = nationality;
  if (currentLocation !== undefined) student.currentLocation = currentLocation;

  if (personal) Object.assign(student.profile.personal, personal);
  if (education) Object.assign(student.profile.education, education);
  if (activities) student.profile.activities = activities;
  if (achievements) student.profile.achievements = achievements;
  if (preferences) Object.assign(student.preferences, preferences);

  await student.save();

  res.json({ student: serializeStudent(student) });
});

router.patch('/me/password', requireStudent, async (req: StudentAuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const student = await Student.findById(req.student!.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const valid = await bcrypt.compare(currentPassword, student.password);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  student.password = await bcrypt.hash(newPassword, 10);
  await student.save();

  res.json({ success: true });
});

router.post('/applications', requireStudent, async (req: StudentAuthedRequest, res) => {
  const { universityIds, course, essays } = req.body as {
    universityIds?: string[];
    course?: string;
    essays?: { universityId: string; question: string; answer: string }[];
  };
  if (!Array.isArray(universityIds) || universityIds.length === 0) {
    return res.status(400).json({ error: 'At least one university must be selected' });
  }

  const uniqueIds = [...new Set(universityIds.filter((id) => typeof id === 'string'))];
  const universities = await University.find({ _id: { $in: uniqueIds } }).select('_id').lean();
  const validIds = new Set(universities.map((u) => u._id.toString()));
  const targetIds = uniqueIds.filter((id) => validIds.has(id));
  if (targetIds.length === 0) {
    return res.status(400).json({ error: 'No valid universities selected' });
  }

  const existing = await Application.find({ studentId: req.student!.id, universityId: { $in: targetIds } })
    .select('universityId')
    .lean();
  const alreadyApplied = new Set(existing.map((a) => a.universityId.toString()));
  const newIds = targetIds.filter((id) => !alreadyApplied.has(id));

  let resolvedCourse = course;
  if (!resolvedCourse) {
    const student = await Student.findById(req.student!.id).select('profile.education.intendedCourse');
    resolvedCourse = student?.profile?.education?.intendedCourse;
  }

  const createdApplicationIds = new Map<string, Types.ObjectId>();
  for (const universityId of newIds) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const application = await Application.create({
          studentId: req.student!.id,
          universityId,
          applicationRef: generateApplicationRef(),
          course: resolvedCourse,
        });
        createdApplicationIds.set(universityId, application._id);
        break;
      } catch (err) {
        const isDuplicateRef = (err as { code?: number })?.code === 11000;
        if (isDuplicateRef && attempt < 4) continue;
        throw err;
      }
    }
  }

  if (Array.isArray(essays) && essays.length > 0) {
    const essayDocs = essays
      .filter(
        (e): e is { universityId: string; question: string; answer: string } =>
          e && typeof e.universityId === 'string' && typeof e.question === 'string' && typeof e.answer === 'string' && e.answer.trim().length > 0
      )
      .filter((e) => createdApplicationIds.has(e.universityId))
      .map((e) => ({
        applicationId: createdApplicationIds.get(e.universityId),
        question: e.question,
        answer: e.answer,
        universities: [e.universityId],
      }));
    if (essayDocs.length > 0) await EssayQuestion.insertMany(essayDocs);
  }

  const applications = await Application.find({ studentId: req.student!.id, universityId: { $in: targetIds } })
    .populate('universityId', 'name city country logo slug')
    .sort({ appliedOn: -1 })
    .lean();

  res.status(201).json({ items: applications, createdCount: newIds.length });
});

router.get('/applications', requireStudent, async (req: StudentAuthedRequest, res) => {
  const applications = await Application.find({ studentId: req.student!.id })
    .populate('universityId', 'name city country logo slug')
    .sort({ appliedOn: -1 })
    .lean();
  res.json({ items: applications, total: applications.length });
});

router.get('/applications/:id', requireStudent, async (req: StudentAuthedRequest, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    studentId: req.student!.id,
  })
    .populate('universityId', 'name city country logo slug')
    .lean();
  if (!application) return res.status(404).json({ error: 'Application not found' });

  const [essays, documents] = await Promise.all([
    EssayQuestion.find({ applicationId: application._id }).select('question answer').lean(),
    StudentDocument.find({ ownerId: req.student!.id }).select('name fileUrl category status date').lean(),
  ]);

  res.json({ application, essays, documents });
});

router.get('/tasks', requireStudent, async (req: StudentAuthedRequest, res) => {
  const applications = await Application.find({ studentId: req.student!.id }).select('_id universityId').lean();
  const applicationIds = applications.map((a) => a._id);
  const applicationMap = new Map(applications.map((a) => [a._id.toString(), a.universityId]));

  const universityIds = [...new Set(applications.map((a) => a.universityId.toString()))];
  const universities = await University.find({ _id: { $in: universityIds } }).select('name').lean();
  const universityNameMap = new Map(universities.map((u) => [u._id.toString(), u.name]));

  const tasks = await Task.find({ applicationId: { $in: applicationIds } })
    .sort({ due: 1 })
    .lean();

  const items = tasks.map((t) => {
    const universityId = applicationMap.get(t.applicationId.toString());
    return {
      _id: t._id,
      title: t.title,
      due: t.due,
      applicationId: t.applicationId,
      university: universityId ? universityNameMap.get(universityId.toString()) : undefined,
    };
  });

  res.json({ items, total: items.length });
});

router.get('/documents', requireStudent, async (req: StudentAuthedRequest, res) => {
  const documents = await StudentDocument.find({ ownerId: req.student!.id }).sort({ createdAt: -1 }).lean();
  res.json({ items: documents, total: documents.length });
});

router.post('/documents', requireStudent, upload.single('file'), async (req: StudentAuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });

  const { name, category } = req.body as { name?: string; category?: string };
  if (!name) return res.status(400).json({ error: 'Document name is required' });

  try {
    const fileUrl = await uploadImageToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `students/${req.student!.id}/documents`
    );
    const document = await StudentDocument.create({
      ownerId: req.student!.id,
      name,
      category,
      fileUrl,
      status: 'Uploaded',
      date: new Date(),
    });
    res.status(201).json({ document });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Upload failed' });
  }
});

router.post('/reviews', requireStudent, async (req: StudentAuthedRequest, res) => {
  const { universityId, rating, text } = req.body as {
    universityId?: string;
    rating?: number;
    text?: string;
  };

  if (!universityId || !text?.trim()) {
    return res.status(400).json({ error: 'University and review text are required' });
  }
  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const [student, university] = await Promise.all([
    Student.findById(req.student!.id).select('fullName avatar'),
    University.findById(universityId).select('aggregateRating aggregateReviewCount'),
  ]);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (!university) return res.status(400).json({ error: 'Selected university not found' });

  const review = await Review.create({
    universityId,
    reviewerName: student.fullName,
    reviewerAvatar: student.avatar,
    text: text.trim(),
    rating: numericRating,
    date: new Date(),
    platform: 'Studom',
  });

  // Sheet-imported universities already carry a precomputed aggregateRating
  // / aggregateReviewCount, so a new review has to fold into that weighted
  // average rather than just recounting from the Review collection (the
  // detail page prefers these precomputed fields over reviews.length).
  const previousCount = university.aggregateReviewCount || 0;
  const previousAvg = university.aggregateRating || 0;
  const newCount = previousCount + 1;
  const newAvg = Math.round(((previousAvg * previousCount + numericRating) / newCount) * 10) / 10;
  university.aggregateReviewCount = newCount;
  university.aggregateRating = newAvg;
  await university.save();

  res.status(201).json({ review });
});

export default router;
