import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { authorizeRole } from '../middleware/roleMiddleware';
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/adminController';

const router = Router();

// Secure Admin-Only Routes
// All routes inside require an Admin role.
router.use(verifyToken);
router.use(authorizeRole('Admin'));

// GET /api/admin/dashboard - Fetch system stats & telemetry
router.get('/dashboard', getDashboardStats);

// GET /api/admin/users - Retrieve list of all registered users
router.get('/users', getAllUsers);

// DELETE /api/admin/users/:id - Permanently delete a user
router.delete('/users/:id', deleteUser);

// POST /api/admin/products - Create a new product listing
router.post('/products', createProduct);

// PUT /api/admin/products/:id - Update product details (price, name, etc)
router.put('/products/:id', updateProduct);

// DELETE /api/admin/products/:id - Permanently delete a product listing
router.delete('/products/:id', deleteProduct);

export default router;
