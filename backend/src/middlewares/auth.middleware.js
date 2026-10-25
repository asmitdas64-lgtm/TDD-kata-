import jwt from 'jsonwebtoken';
import { AppError } from '../errors/app-error.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('UNAUTHORIZED', 401, 'Authentication token required'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError('INTERNAL_SERVER_ERROR', 500, 'JWT secret is not configured'));
    }

    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err) {
    return next(new AppError('INVALID_TOKEN', 401, 'Session expired or token invalid'));
  }
};

export const requireAuth = authenticate;

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 403, 'Access denied: insufficient permissions'));
    }

    next();
  };
};

export const authorize = requireRole;
export const requireAdmin = requireRole('ADMIN');
