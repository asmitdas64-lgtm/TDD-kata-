import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole, requireAdmin } from '../../src/middlewares/auth.middleware.js';
import { AppError } from '../../src/errors/app-error.js';

describe('Auth Middleware Unit Tests', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_key_at_least_32_characters_long';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  describe('authenticate', () => {
    it('should return 401 UNAUTHORIZED if authorization header is missing', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 UNAUTHORIZED if authorization format is invalid', () => {
      const req = { headers: { authorization: 'Basic 12345' } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 INVALID_TOKEN if token is malformed or expired', () => {
      const req = { headers: { authorization: 'Bearer invalid.token.value' } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe('INVALID_TOKEN');
      expect(err.statusCode).toBe(401);
    });

    it('should decode valid token and attach user to req.user', () => {
      const payload = { sub: 'user_123', email: 'test@example.com', role: 'CUSTOMER' };
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        role: 'CUSTOMER'
      });
    });
  });

  describe('requireRole', () => {
    it('should return 401 UNAUTHORIZED if req.user is absent', () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      const middleware = requireRole('ADMIN');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 FORBIDDEN if user role is not permitted', () => {
      const req = { user: { id: 'u1', role: 'CUSTOMER' } };
      const res = {};
      const next = jest.fn();

      const middleware = requireRole('ADMIN');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err.code).toBe('FORBIDDEN');
      expect(err.statusCode).toBe(403);
    });

    it('should proceed when user role is included in allowedRoles', () => {
      const req = { user: { id: 'u1', role: 'ADMIN' } };
      const res = {};
      const next = jest.fn();

      const middleware = requireAdmin;
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
