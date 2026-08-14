import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin';
import universitiesRouter from './routes/universities';
import uploadsRouter from './routes/uploads';
import importsRouter from './routes/imports';
import publicUniversitiesRouter from './routes/publicUniversities';
import { buildArticleAdminRouter } from './routes/articles';
import { buildPublicArticleRouter } from './routes/publicArticles';
import NewsArticle from './models/NewsArticle';
import BlogPost from './models/BlogPost';
import eventsRouter from './routes/events';
import publicEventsRouter from './routes/publicEvents';
import studentRouter from './routes/student';
import institutionRouter from './routes/institution';
import publicContributorsRouter from './routes/publicContributors';

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(
  (origin): origin is string => Boolean(origin)
);

const app = express();
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/admin', adminRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/imports', importsRouter);
app.use('/api/public/universities', publicUniversitiesRouter);
app.use('/api/news', buildArticleAdminRouter(NewsArticle));
app.use('/api/blogs', buildArticleAdminRouter(BlogPost));
app.use('/api/events', eventsRouter);
app.use('/api/public/news', buildPublicArticleRouter(NewsArticle));
app.use('/api/public/blogs', buildPublicArticleRouter(BlogPost));
app.use('/api/public/events', publicEventsRouter);
app.use('/api/student', studentRouter);
app.use('/api/institution', institutionRouter);
app.use('/api/public/contributors', publicContributorsRouter);

// Without this, an unhandled error (e.g. Multer's file-too-large error from
// an upload route) falls through to Express's default HTML error page —
// every frontend `fetch(...).then(r => r.json())` call then breaks with
// "Unexpected token '<'" instead of surfacing the real error message.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const isFileTooLarge = message.includes('File too large') || (err as { code?: string })?.code === 'LIMIT_FILE_SIZE';
  res.status(isFileTooLarge ? 413 : 500).json({
    error: isFileTooLarge ? 'File is too large. Maximum size is 4MB.' : message,
  });
});

export default app;
