import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('PUT /api/vehicles/:id Integration Tests', () => {
  const app = createApp();
  let adminToken;
  let customerToken;
  let targetVehicle;
  const uniqueSuffix = Date.now().toString().slice(-6);

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET || 'test_secret_key_at_least_32_characters_long';

    adminToken = jwt.sign(
      { sub: 'admin_user', email: 'admin@dealership.com', role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { sub: 'customer_user', email: 'cust@dealership.com', role: 'CUSTOMER' },
      secret,
      { expiresIn: '1h' }
    );

    targetVehicle = await prisma.vehicle.create({
      data: {
        vin: `PUTVIN${uniqueSuffix}123`,
        make: 'Mazda',
        model: 'Miata',
        year: 2022,
        price: 28500.0,
        mileage: 6500,
        color: 'Soul Red',
        quantity: 1,
        status: 'AVAILABLE'
      }
    });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { vin: { contains: uniqueSuffix } }
    });
    await prisma.$disconnect();
  });

  it('should update vehicle when called by ADMIN with valid data', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${targetVehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        price: 27900.0,
        mileage: 7000
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.vehicle.price)).toBe(27900.0);
    expect(res.body.data.vehicle.mileage).toBe(7000);
  });

  it('should return 403 FORBIDDEN when called by CUSTOMER role', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${targetVehicle.id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        price: 25000.0
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 404 RESOURCE_NOT_FOUND when updating non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/cuid_non_existent_id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        price: 25000.0
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});
