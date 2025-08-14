import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in env');
    process.exit(1);
  }
  const opts = {};
  if (process.env.DB_NAME) opts.dbName = process.env.DB_NAME; // optional DB override

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, opts);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}