import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createModelWrapper } from '../config/modelWrapper';

// Define standard Mongoose User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Real Mongoose Model
export const RealUserModel = mongoose.models.User || mongoose.model('User', UserSchema);

// Password helper: hashes a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed admin user credentials
const SEED_ADMIN_EMAIL = 'admin@example.com';
const SEED_ADMIN_PASSWORD_PLAIN = 'adminpassword';

// Pre-hashed password for the seed admin (hashed using bcrypt)
// Hashed value for "adminpassword"
const SEED_ADMIN_HASHED_PASSWORD = bcrypt.hashSync(SEED_ADMIN_PASSWORD_PLAIN, 10);

const defaultUsers = [
  {
    _id: 'admin-seed-id-0001',
    id: 'admin-seed-id-0001',
    name: 'System Administrator',
    email: SEED_ADMIN_EMAIL,
    password: SEED_ADMIN_HASHED_PASSWORD,
    role: 'Admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'user-seed-id-0002',
    id: 'user-seed-id-0002',
    name: 'Jane Doe',
    email: 'user@example.com',
    password: bcrypt.hashSync('userpassword', 10),
    role: 'User',
    createdAt: new Date().toISOString()
  }
];

/**
 * Wrapped User Model with local JSON fallback.
 */
export const User = createModelWrapper(RealUserModel, 'users', defaultUsers);

/**
 * Seed Mongoose Database with Admin user if connected to real MongoDB.
 */
export const seedMongooseAdmin = async () => {
  try {
    const existingAdmin = await (RealUserModel as any).findOne({ email: SEED_ADMIN_EMAIL });
    if (!existingAdmin) {
      await RealUserModel.create({
        name: 'System Administrator',
        email: SEED_ADMIN_EMAIL,
        password: SEED_ADMIN_HASHED_PASSWORD,
        role: 'Admin'
      });
      console.log('✨ Seeded Admin account in MongoDB: admin@example.com');
    }
  } catch (err) {
    console.error('⚠️ Could not seed admin in real MongoDB:', err);
  }
};
