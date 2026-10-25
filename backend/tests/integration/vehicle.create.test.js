import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('POST /api/vehicles Integration Tests', () => {
  const app = createApp();
  let adminToken;
  let customerToken;
  const uniqueSuffix = Date.now().toString().slice(-6);

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET || 'test_secret_key_at_least_32_characters_long';

    // Generate valid tokens
    adminToken = jwt.sign(
      { sub: 'admin_test_user', email: 'admin@dealership.com', role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { sub: 'cust_test_user', email: 'cust@dealership.com', role: 'CUSTOMER' },
      secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { vin: { contains: uniqueSuffix } }
    });
    await prisma.$disconnect();
  });

  it('should create vehicle when requested by ADMIN with valid payload', async () => {
    const vin = `1HGCR2F83HA${uniqueSuffix}`;
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vin,
        make: 'Acura',
        model: 'TLX Type S',
        year: 2023,
        price: 54990.0,
        mileage: 4200,
        color: 'Apex Blue Pearl',
        quantity: 2,
        status: 'AVAILABLE'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.vin).toBe(vin);
    expect(res.body.data.vehicle.make).toBe('Acura');
    expect(res.body.data.vehicle.quantity).toBe(2);
  });

  it('should return 403 FORBIDDEN when requested by CUSTOMER role', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vin: `2HGCR2F83HA${uniqueSuffix}`,
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        price: 24000.0,
        mileage: 12000,
        color: 'Black'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 401 UNAUTHORIZED when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send({
        vin: `3HGCR2F83HA${uniqueSuffix}`,
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        price: 24000.0,
        mileage: 12000,
        color: 'Black'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 409 DUPLICATE_VIN when creating vehicle with identical VIN', async () => {
    const vin = `4HGCR2F83HA${uniqueSuffix}`;

    // First creation
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vin,
        make: 'Subaru',
        model: 'WRX',
        year: 2022,
        price: 32000.0,
        mileage: 8000,
        color: 'WR Blue',
        quantity: 1
      });

    // Duplicate creation
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vin,
        make: 'Subaru',
        model: 'WRX',
        year: 2022,
        price: 32000.0,
        mileage: 8000,
        color: 'WR Blue',
        quantity: 1
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_VIN');
  });
});
