import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';
import { getProfile, updateProfile } from '../controllers/userController';
import { Product } from '../models/Product';

const router = Router();

// Secure User-Specific Routes (requires JWT)

// GET /api/user/profile - Fetch authenticated user profile details
router.get('/profile', verifyToken, getProfile);

// PUT /api/user/profile - Update authenticated user details (name, email, password)
router.put('/profile', verifyToken, updateProfile);

// GET /api/user/products - Let any logged-in user (Admin or User) view the products catalog
router.get('/products', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      products
    });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: error.message
    });
  }
});

export default router;
