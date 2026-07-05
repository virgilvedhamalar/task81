import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { getDBStatus } from '../config/db';

/**
 * GET /api/admin/dashboard
 * Retrieve system-wide stats and telemetry.
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    const products = await Product.find();

    const totalUsers = users.length;
    const adminCount = users.filter((u: any) => u.role === 'Admin').length;
    const normalUserCount = totalUsers - adminCount;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        normalUserCount,
        totalProducts: products.length,
        dbStatus: getDBStatus() ? 'MongoDB' : 'In-Memory JSON Fallback',
        systemTime: new Date().toISOString(),
        nodeVersion: process.version
      }
    });
  } catch (error: any) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to retrieve admin dashboard metrics.',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/users
 * Retrieve all users in the system (password omitted).
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    
    // Standardize return mapping to prevent ever leaking password strings
    const safeUsers = users.map((u: any) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));

    res.status(200).json({
      success: true,
      users: safeUsers
    });
  } catch (error: any) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to retrieve user lists.',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a specific user by ID. Prevents deleting your own currently logged-in account.
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentAdminId = req.user?.id;

    if (targetUserId === currentAdminId) {
      res.status(400).json({
        success: false,
        message: 'Security Constraint: You are forbidden from deleting your own active Admin account.'
      });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(targetUserId);
    if (!deletedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found. The user may have already been deleted.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User "${deletedUser.name}" (${deletedUser.email}) has been permanently deleted from the database.`
    });
  } catch (error: any) {
    console.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to delete user.',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/products
 * Create a new product.
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, price, description, category } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({
        success: false,
        message: 'Input Validation Failed: Product name and price are required fields.'
      });
      return;
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({
        success: false,
        message: 'Input Validation Failed: Price must be a positive number.'
      });
      return;
    }

    const newProduct = await Product.create({
      name,
      price: Number(price),
      description: description || '',
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      message: `Product "${newProduct.name}" created successfully.`,
      product: newProduct
    });
  } catch (error: any) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to create new product.',
      error: error.message
    });
  }
};

/**
 * PUT /api/admin/products/:id
 * Edit an existing product.
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const { name, price, description, category } = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
      return;
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        res.status(400).json({
          success: false,
          message: 'Input Validation Failed: Price must be a positive number.'
        });
        return;
      }
      updates.price = Number(price);
    }
    if (description !== undefined) updates.description = description;
    if (category) updates.category = category;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error: any) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to update product details.',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Delete a product.
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      res.status(404).json({
        success: false,
        message: 'Product not found. It may have already been deleted.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Product "${deletedProduct.name}" has been permanently deleted.`
    });
  } catch (error: any) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to delete product.',
      error: error.message
    });
  }
};
