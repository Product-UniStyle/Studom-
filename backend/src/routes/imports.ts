import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware/adminAuth';
import { importAllSheets } from '../lib/combinedSheetImport';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/all-sheets', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });
  }

  const write = req.query.write === 'true';

  try {
    const report = await importAllSheets(req.file.buffer, { write });
    res.json({ write, ...report });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Import failed' });
  }
});

export default router;
