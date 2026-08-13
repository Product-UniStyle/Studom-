import 'dotenv/config';
import { Model } from 'mongoose';
import { connectDB } from './config/db';
import University from './models/University';
import Event from './models/Event';
import NewsArticle from './models/NewsArticle';
import BlogPost from './models/BlogPost';
import { uniqueSlug } from './lib/slugify';

async function backfill(model: Model<any>, nameField: string, label: string) {
  const existing = await model.find({ slug: { $exists: true, $ne: null } }).select('slug').lean();
  const taken = new Set(existing.map((d: any) => d.slug as string));

  const missing = await model
    .find({ $or: [{ slug: { $exists: false } }, { slug: null }] })
    .select(`_id ${nameField}`)
    .lean();

  const ops = missing.map((doc: any) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { slug: uniqueSlug(doc[nameField] || 'item', taken) } },
    },
  }));

  if (ops.length > 0) {
    await model.bulkWrite(ops, { ordered: false });
  }
  console.log(`${label}: ${missing.length} missing, ${ops.length} backfilled`);
}

connectDB()
  .then(async () => {
    await backfill(University, 'name', 'University');
    await backfill(Event, 'title', 'Event');
    await backfill(NewsArticle, 'title', 'NewsArticle');
    await backfill(BlogPost, 'title', 'BlogPost');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
