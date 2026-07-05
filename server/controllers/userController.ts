import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import { User, hashPassword } from '../models/User';

/**
 * GET /api/user/profile
 * Get authenticated user's profile details.
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Return profile data (exclude hashed password for security)
    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to retrieve profile.',
      error: error.message
    });
  }
};

/**
 * PUT /api/user/profile
 * Update authenticated user's own profile details.
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated.' });
      return;
    }

    const { name, email, password } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updates: any = {};

    if (name) updates.name = name;
    
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      // Ensure email isn't already taken
      const emailConflict = await User.findOne({ email: email.toLowerCase() });
      if (emailConflict) {
        res.status(400).json({
          success: false,
          message: 'Email Conflict: This email address is already in use by another user.'
        });
        return;
      }
      updates.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Input Validation Failed: New password must be at least 6 characters long.'
        });
        return;
      }
      updates.password = await hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to update profile.',
      error: error.message
    });
  }
};
