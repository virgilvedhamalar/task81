import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB using Mongoose.
 * If MONGO_URI is missing or fails to connect, the system falls back
 * to a local file-based JSON database for seamless AI Studio previewing.
 */
export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('\n⚠️  [DATABASE] No MONGO_URI found in environment variables.');
    console.log('🔌 [DATABASE] Running in secure Local JSON Database mode for the preview.\n');
    return false;
  }
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('\n🟢 [DATABASE] MongoDB connected successfully using Mongoose.\n');
    return true;
  } catch (error) {
    console.error('\n🔴 [DATABASE] MongoDB connection failed:', error);
    console.log('🔌 [DATABASE] Falling back to Local JSON Database mode for the preview.\n');
    return false;
  }
};

/**
 * Get current database status.
 * True if connected to MongoDB, false if running in JSON fallback mode.
 */
export const getDBStatus = (): boolean => isConnected;
