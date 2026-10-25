import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('POST /api/vehicles/:id/purchase Integration Tests', () => {
  const app = createApp();
  let adminToken;
  let customerToken;
  let testUser;
  let availableVehicle;
  let outOfStockVehicle;
  const uniqueSuffix = Date.now().toString().slice(-6);

  beforeAll(async () => {
    const secret = process.env.JWT_SECRET || 'test_secret_key_at_least_32_characters_long';

    // Create real user in DB for foreign key constraint on Order
    testUser = await prisma.user.create({
      data: {
        name: 'Test Buyer',
        email: `buyer_${uniqueSuffix}@example.com`,
        passwordHash: 'hashed_password_dummy',
        role: 'CUSTOMER'
      }
    });

    customerToken = jwt.sign(
      { sub: testUser.id, email: testUser.email, role: testUser.role },
      secret,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { sub: testUser.id, email: testUser.email, role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );

    // Create test vehicles
    availableVehicle = await prisma.vehicle.create({
      data: {
        vin: `PUR1${uniqueSuffix}12345`,
        make: 'Mazda',
        model: 'CX-50',
        year: 2023,
        price: 38000.00,
        mileage: 5000,
        color: 'Zircon Sand',
        quantity: 2,
        status: 'AVAILABLE'
      }
    });

    outOfStockVehicle = await prisma.vehicle.create({
      data: {
        vin: `PUR2${uniqueSuffix}67890`,
        make: 'Nissan',
        model: 'Z Performance',
        year: 2024,
        price: 52000.00,
        mileage: 100,
        color: 'Ikazuchi Yellow',
        quantity: 0,
        status: 'SOLD'
      }
    });
  });

  afterAll(async () => {
    // Cleanup orders, vehicles, and user
    await prisma.order.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.vehicle.deleteMany({
      where: { vin: { contains: uniqueSuffix } }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    await prisma.$disconnect();
  });

  it('should return 401 UNAUTHORIZED when no token is provided', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${availableVehicle.id}/purchase`)
      .send({ quantity: 1 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 OUT_OF_STOCK when vehicle is already SOLD / out of stock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${outOfStockVehicle.id}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('OUT_OF_STOCK');
  });

  it('should return 400 OUT_OF_STOCK when requested quantity exceeds available stock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${availableVehicle.id}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('OUT_OF_STOCK');
  });

  it('should return 404 RESOURCE_NOT_FOUND when vehicle does not exist', async () => {
    const res = await request(app)
      .post('/api/vehicles/non-existent-id-9999/purchase')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should successfully purchase a vehicle, decrement stock, and create an order record', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${availableVehicle.id}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('orderId');
    expect(res.body.data.vehicle.quantity).toBe(1);
    expect(res.body.data.vehicle.status).toBe('AVAILABLE');

    // Verify order was created in DB
    const orderInDb = await prisma.order.findUnique({
      where: { id: res.body.data.orderId }
    });
    expect(orderInDb).not.toBeNull();
    expect(orderInDb.userId).toBe(testUser.id);
    expect(orderInDb.vehicleId).toBe(availableVehicle.id);
    expect(orderInDb.quantity).toBe(1);

    // Purchase remaining 1 quantity: should transition vehicle status to SOLD
    const res2 = await request(app)
      .post(`/api/vehicles/${availableVehicle.id}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });

    expect(res2.status).toBe(200);
    expect(res2.body.data.vehicle.quantity).toBe(0);
    expect(res2.body.data.vehicle.status).toBe('SOLD');

    // Verify DB vehicle status is now SOLD and quantity is 0
    const vehicleInDb = await prisma.vehicle.findUnique({
      where: { id: availableVehicle.id }
    });
    expect(vehicleInDb.quantity).toBe(0);
    expect(vehicleInDb.status).toBe('SOLD');
  });
});
