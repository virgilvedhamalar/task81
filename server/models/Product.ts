import mongoose from 'mongoose';
import { createModelWrapper } from '../config/modelWrapper';

// Define standard Mongoose Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Real Mongoose Model
export const RealProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const defaultProducts = [
  {
    _id: 'prod-001',
    id: 'prod-001',
    name: 'Secure-Gate Hardware Token',
    price: 49.99,
    description: 'A physical cryptographic key supporting WebAuthn and secure RBAC access controls.',
    category: 'Security Hardware',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-002',
    id: 'prod-002',
    name: 'Enterprise Firewall Subscription',
    price: 299.99,
    description: 'Yearly license for next-generation network shield and endpoint authorization control.',
    category: 'Software Licenses',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod-003',
    id: 'prod-003',
    name: 'RBAC Auditing Toolkit',
    price: 150.00,
    description: 'Automated policy validator ensuring absolute least privilege access compliance.',
    category: 'Developer Tools',
    createdAt: new Date().toISOString()
  }
];

/**
 * Wrapped Product Model with local JSON fallback.
 */
export const Product = createModelWrapper(RealProductModel, 'products', defaultProducts);

/**
 * Seed Mongoose Database with default products if connected to real MongoDB.
 */
export const seedMongooseProducts = async () => {
  try {
    const count = await RealProductModel.countDocuments();
    if (count === 0) {
      await RealProductModel.insertMany(defaultProducts.map(p => {
        const { id, _id, ...pData } = p;
        return {
          ...pData,
          createdAt: new Date(p.createdAt)
        };
      }) as any);
      console.log('✨ Seeded default products in MongoDB');
    }
  } catch (err) {
    console.error('⚠️ Could not seed products in real MongoDB:', err);
  }
};
