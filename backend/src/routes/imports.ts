import { Router } from 'express';
import multer from 'multer';
import { requireEditorOrAdmin } from '../middleware/adminAuth';
import { importMainSheet } from '../lib/mainSheetImport';
import { importPocSheet } from '../lib/pocSheetImport';
import { importReviewsSheet } from '../lib/reviewSheetImport';
import { importEssayQuestionsSheet } from '../lib/essayQuestionSheetImport';
import { importArticleSheet } from '../lib/articleSheetImport';
import NewsArticle from '../models/NewsArticle';
import BlogPost from '../models/BlogPost';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function importRoute(path: string, importFn: (buffer: Buffer, opts: { write: boolean }) => Promise<unknown>) {
  router.post(path, requireEditorOrAdmin, upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });
    }

    const write = req.query.write === 'true';

    try {
      const report = await importFn(req.file.buffer, { write });
      res.json({ write, ...(report as Record<string, unknown>) });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Import failed' });
    }
  });
}

importRoute('/main-sheet', importMainSheet);
importRoute('/poc-sheet', importPocSheet);
importRoute('/reviews-sheet', importReviewsSheet);
importRoute('/essay-questions-sheet', importEssayQuestionsSheet);
importRoute('/news-sheet', (buffer, opts) => importArticleSheet(NewsArticle, 'News', buffer, opts));
importRoute('/blog-sheet', (buffer, opts) => importArticleSheet(BlogPost, 'Blogs', buffer, opts));

export default router;
