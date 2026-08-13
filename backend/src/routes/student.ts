import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import Student, { CURRENT_STAGE_VALUES, CurrentStage } from '../models/Student';
import Application from '../models/Application';
import Task from '../models/Task';
import StudentDocument from '../models/Document';
import University from '../models/University';
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
  const { fullName, birthdate, nationality, currentLocation, personal, education, activities, achievements, preferences } =
    req.body as {
      fullName?: string;
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

router.get('/applications', requireStudent, async (req: StudentAuthedRequest, res) => {
  const applications = await Application.find({ studentId: req.student!.id })
    .populate('universityId', 'name city country logo')
    .sort({ appliedOn: -1 })
    .lean();
  res.json({ items: applications, total: applications.length });
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

export default router;
