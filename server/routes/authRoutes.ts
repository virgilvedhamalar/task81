import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Public Authentication Routes
// POST /api/auth/register - Create a new user account
router.post('/register', register);

// POST /api/auth/login - Authenticate credentials and return JWT
router.post('/login', login);

export default router;
