import { Schema, model, Document, Types } from 'mongoose';
import { articleSectionSchema, IArticleSection } from './NewsArticle';

export interface IBlogPost extends Document {
  title: string;
  content: string;
  coverImage?: string;
  sourceLink?: string;
  author?: string;
  source?: string;
  publishedDate?: Date;
  destination?: string;
  universityIds: Types.ObjectId[];
  sections: IArticleSection[];
  type?: string;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: String,
    sourceLink: String,
    author: String,
    source: String,
    publishedDate: Date,
    destination: String,
    universityIds: [{ type: Schema.Types.ObjectId, ref: 'University' }],
    sections: [articleSectionSchema],
    type: String,
  },
  { timestamps: true }
);

export default model<IBlogPost>('BlogPost', blogPostSchema);
