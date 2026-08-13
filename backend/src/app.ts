import express from 'express';
import cors from 'cors';
import adminRouter from './routes/admin';
import universitiesRouter from './routes/universities';
import uploadsRouter from './routes/uploads';
import importsRouter from './routes/imports';
import publicUniversitiesRouter from './routes/publicUniversities';
import { buildArticleAdminRouter } from './routes/articles';
import NewsArticle from './models/NewsArticle';
import BlogPost from './models/BlogPost';
import eventsRouter from './routes/events';
import studentRouter from './routes/student';
import institutionRouter from './routes/institution';

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
app.use('/api/student', studentRouter);
app.use('/api/institution', institutionRouter);

export default app;
