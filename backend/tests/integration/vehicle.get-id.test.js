import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('GET /api/vehicles/:id Integration Tests', () => {
  const app = createApp();
  let existingVehicleId;

  beforeAll(async () => {
    const existing = await prisma.vehicle.findFirst();
    existingVehicleId = existing ? existing.id : 'fallback-id';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 200 and vehicle record for existing ID', async () => {
    const res = await request(app).get(`/api/vehicles/${existingVehicleId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.id).toBe(existingVehicleId);
  });

  it('should return 404 RESOURCE_NOT_FOUND for non-existent vehicle ID', async () => {
    const res = await request(app).get('/api/vehicles/cuid_non_existent_id');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});
