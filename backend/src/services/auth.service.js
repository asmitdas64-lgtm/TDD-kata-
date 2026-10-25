import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/app-error.js';
import { userRepository as defaultUserRepo } from '../repositories/user.repository.js';

// Pre-computed dummy bcrypt hash (cost 12) for constant-time comparison when email is not found
const DUMMY_HASH = '$2a$12$e8h.7iVjGk1eWzB23tE0OuW1f.O1KkJ4HjK1O7v5K3aD7yS5x.Y6m';

export class AuthService {
  constructor(userRepo = defaultUserRepo) {
    this.userRepo = userRepo;
  }

  generateToken(user) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!secret) {
      throw new AppError('INTERNAL_SERVER_ERROR', 500, 'JWT secret is not configured');
    }

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      secret,
      { expiresIn }
    );
  }

  formatUserResponse(user) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async registerUser({ email, password, name }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('USER_ALREADY_EXISTS', 409, 'User with this email already exists');
    }

    // Hash password with bcryptjs (salt rounds 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (strictly CUSTOMER role)
    const newUser = await this.userRepo.createUser({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: 'CUSTOMER'
    });

    const token = this.generateToken(newUser);

    return {
      user: this.formatUserResponse(newUser),
      token
    };
  }

  async loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      // Timing attack mitigation: compare candidate password against precomputed dummy hash
      await bcrypt.compare(password, DUMMY_HASH);
      throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: this.formatUserResponse(user),
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User profile not found');
    }

    return this.formatUserResponse(user);
  }
}

export const authService = new AuthService();
export default authService;
