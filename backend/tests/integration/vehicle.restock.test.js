import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('POST /api/vehicles/:id/restock Integration Tests', () => {
  const app = createApp();
  let adminToken;
  let customerToken;
  let soldVehicle;
  const uniqueSuffix = Date.now().toString().slice(-6);

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET || 'test_secret_key_at_least_32_characters_long';

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

    soldVehicle = await prisma.vehicle.create({
      data: {
        vin: `RSTK${uniqueSuffix}98765`,
        make: 'Subaru',
        model: 'WRX',
        year: 2024,
        price: 34000.00,
        mileage: 50,
        color: 'World Rally Blue',
        quantity: 0,
        status: 'SOLD'
      }
    });
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { vin: { contains: uniqueSuffix } }
    });
    await prisma.$disconnect();
  });

  it('should return 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${soldVehicle.id}/restock`)
      .send({ quantity: 5 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 FORBIDDEN when requested by non-admin CUSTOMER', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${soldVehicle.id}/restock`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 RESOURCE_NOT_FOUND when vehicle does not exist', async () => {
    const res = await request(app)
      .post('/api/vehicles/non-existent-id-9999/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should successfully restock vehicle and reset status to AVAILABLE using quantity', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${soldVehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(4);
    expect(res.body.data.vehicle.status).toBe('AVAILABLE');

    // Verify DB
    const vehicleInDb = await prisma.vehicle.findUnique({
      where: { id: soldVehicle.id }
    });
    expect(vehicleInDb.quantity).toBe(4);
    expect(vehicleInDb.status).toBe('AVAILABLE');
  });

  it('should also accept "amount" in restock payload per API spec', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${soldVehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(6);
    expect(res.body.data.vehicle.status).toBe('AVAILABLE');
  });
});
