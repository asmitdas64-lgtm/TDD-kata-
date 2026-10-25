import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('DELETE /api/vehicles/:id Integration Tests', () => {
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
        vin: `DELVIN${uniqueSuffix}123`,
        make: 'Subaru',
        model: 'BRZ',
        year: 2023,
        price: 31000.0,
        mileage: 3000,
        color: 'Ignition Red',
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

  it('should return 403 FORBIDDEN when DELETE is requested by CUSTOMER role', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${targetVehicle.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should delete vehicle and return 200 when requested by ADMIN', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${targetVehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const lookup = await request(app).get(`/api/vehicles/${targetVehicle.id}`);
    expect(lookup.status).toBe(404);
  });

  it('should return 404 RESOURCE_NOT_FOUND when deleting already deleted or non-existent vehicle', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${targetVehicle.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});
