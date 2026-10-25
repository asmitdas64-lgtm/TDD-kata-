import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('POST /api/auth/register Integration Tests', () => {
  const app = createApp();
  const testEmail = `reg_test_${Date.now()}@dealership.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'reg_test_' } }
    });
    await prisma.$disconnect();
  });

  it('should successfully register a new user with CUSTOMER role and return token and profile without passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'ValidPass123!',
        name: 'Registration Test User'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.user.name).toBe('Registration Test User');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should return 409 USER_ALREADY_EXISTS when trying to register with the same email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'AnotherPass123!',
        name: 'Duplicate User'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
  });

  it('should return 400 VALIDATION_ERROR when required fields are missing or invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'weak',
        name: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('should not allow assigning ADMIN role from the registration payload', async () => {
    const adminAttemptEmail = `reg_test_admin_${Date.now()}@dealership.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: adminAttemptEmail,
        password: 'ValidPass123!',
        name: 'Malicious Actor',
        role: 'ADMIN'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('CUSTOMER');
  });
});
