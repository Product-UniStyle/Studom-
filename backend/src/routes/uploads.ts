import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware/adminAuth';
import { uploadImageToS3, sanitizeFolderSegment } from '../lib/s3';

const router = Router();
// Kept under 4.5MB — Vercel's serverless request body limit. Larger
// uploads get rejected by the platform itself before reaching this code.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const IMAGE_TYPES = ['logo', 'image', 'gallery'];

router.post('/image', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });
  }
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'File must be an image' });
  }

  const universityName = typeof req.body.universityName === 'string' ? req.body.universityName : '';
  const type = IMAGE_TYPES.includes(req.body.type) ? req.body.type : 'misc';
  const folder = universityName
    ? `universities/${sanitizeFolderSegment(universityName)}/${type}`
    : 'universities/_unassigned';

  try {
    const url = await uploadImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype, folder);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Upload failed' });
  }
});

export default router;
