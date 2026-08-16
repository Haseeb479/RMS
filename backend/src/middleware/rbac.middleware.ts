import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role || 'recruiter';
    
    // Admin has full access to all endpoints
    if (userRole === 'admin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: User role '${userRole}' is not authorized to perform this action.`,
      });
    }

    next();
  };
};
