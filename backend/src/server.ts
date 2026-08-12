import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import adminRouter from './routes/admin';
import universitiesRouter from './routes/universities';
import uploadsRouter from './routes/uploads';
import importsRouter from './routes/imports';
import publicUniversitiesRouter from './routes/publicUniversities';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/admin', adminRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/imports', importsRouter);
app.use('/api/public/universities', publicUniversitiesRouter);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
