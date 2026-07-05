import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware to restrict access based on User Role.
 * Accepts any number of allowed roles.
 * Example Usage: authorizeRole('Admin') or authorizeRole('Admin', 'User')
 */
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // If auth token wasn't verified or req.user is missing
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication is required.'
      });
      return;
    }

    const userRole = req.user.role;

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is: [${userRole}].`
      });
      return;
    }

    next();
  };
};
