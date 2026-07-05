import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, hashPassword } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_123';

/**
 * POST /api/auth/register
 * Register a new user in the system.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Input validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Input Validation Failed: Please provide name, email, and password.'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Input Validation Failed: Password must be at least 6 characters long.'
      });
      return;
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email Conflict: An account with this email address already exists.'
      });
      return;
    }

    // 3. Hash the user's password
    const hashedPassword = await hashPassword(password);

    // 4. Force default role 'User' if invalid or unauthorized role requested
    const targetRole = role === 'Admin' || role === 'User' ? role : 'User';

    // 5. Create new user doc
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: targetRole
    });

    res.status(211).json({
      success: true,
      message: `Registration successful! Account created for ${newUser.name} with role [${newUser.role}].`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to complete user registration.',
      error: error.message
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a secure JWT token.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
      return;
    }

    // 2. Fetch user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication Failed: Invalid email or password.'
      });
      return;
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Authentication Failed: Invalid email or password.'
      });
      return;
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: `Authentication successful! Welcome back, ${user.name}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to log in user.',
      error: error.message
    });
  }
};
