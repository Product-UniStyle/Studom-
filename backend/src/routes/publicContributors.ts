import { Router } from 'express';
import multer from 'multer';
import University from '../models/University';
import Contributor from '../models/Contributor';
import { uploadImageToS3, sanitizeFolderSegment } from '../lib/s3';

const router = Router();
// Kept under 4.5MB — Vercel's serverless request body limit.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const ALLOWED_PROOF_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

router.post('/', upload.single('proof'), async (req, res) => {
  const {
    universityId,
    name,
    email,
    courseOfStudy,
    yearOfStudy,
    expectedGraduationYear,
    reason,
  } = req.body as Record<string, string | undefined>;

  if (!universityId || !name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'University, name, and email are required' });
  }

  const university = await University.findById(universityId).select('name').lean();
  if (!university) {
    return res.status(400).json({ error: 'Selected university not found' });
  }

  let proofUrl: string | undefined;
  if (req.file) {
    if (!ALLOWED_PROOF_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Proof must be a JPG, PNG, or PDF file' });
    }
    const folder = `contributors/${sanitizeFolderSegment(university.name)}`;
    proofUrl = await uploadImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype, folder);
  }

  const contributor = await Contributor.create({
    universityId,
    name: name.trim(),
    email: email.trim(),
    courseOfStudy: courseOfStudy?.trim() || undefined,
    yearOfStudy: yearOfStudy?.trim() || undefined,
    expectedGraduationYear: expectedGraduationYear?.trim() || undefined,
    reason: reason?.trim() || undefined,
    proofUrl,
    status: 'Pending Review',
  });

  res.status(201).json({ item: contributor });
});

export default router;
