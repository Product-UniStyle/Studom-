import mongoose from 'mongoose';

let connectPromise: Promise<void> | null = null;

export function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectPromise) return connectPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI is not set'));
  }

  connectPromise = mongoose
    .connect(uri)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      connectPromise = null;
      throw err;
    });

  return connectPromise;
}
