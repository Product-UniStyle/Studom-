import { Schema, model, Document, Types } from 'mongoose';

export interface IArticleSection {
  order: number;
  image?: string;
  title?: string;
  content: string;
}

export interface INewsArticle extends Document {
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

export const articleSectionSchema = new Schema<IArticleSection>(
  {
    order: { type: Number, required: true },
    image: String,
    title: String,
    content: { type: String, required: true },
  },
  { _id: false }
);

const newsArticleSchema = new Schema<INewsArticle>(
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

export default model<INewsArticle>('NewsArticle', newsArticleSchema);
