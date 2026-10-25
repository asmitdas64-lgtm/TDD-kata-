import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('POST /api/auth/login Integration Tests', () => {
  const app = createApp();
  const testEmail = `login_test_${Date.now()}@dealership.com`;
  const validPassword = 'SecurePassword2026!';

  beforeAll(async () => {
    // Register the user to test login
    await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: validPassword,
        name: 'Login Test User'
      });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'login_test_' } }
    });
    await prisma.$disconnect();
  });

  it('should authenticate user with valid credentials and return JWT token and user profile without passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: validPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('should return 401 INVALID_CREDENTIALS for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return 401 INVALID_CREDENTIALS for non-existent user email (timing attack protected)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'does_not_exist_user@dealership.com',
        password: 'SomePassword123!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return 400 VALIDATION_ERROR when email or password is empty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email-format',
        password: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
