import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('GET /api/vehicles/search Integration Tests', () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should search vehicles matching make or model keyword via "q"', async () => {
    const res = await request(app)
      .get('/api/vehicles/search')
      .query({ q: 'Camry' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].model).toContain('Camry');
  });

  it('should filter vehicles by combined criteria (make, price bounds, year)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search')
      .query({
        make: 'Honda',
        minPrice: 20000,
        maxPrice: 35000,
        minYear: 2020
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((vehicle) => {
      expect(vehicle.make.toLowerCase()).toContain('honda');
      const price = Number(vehicle.price);
      expect(price).toBeGreaterThanOrEqual(20000);
      expect(price).toBeLessThanOrEqual(35000);
      expect(vehicle.year).toBeGreaterThanOrEqual(2020);
    });
  });

  it('should ensure /search does NOT trigger /:id route handler (verifying route precedence)', async () => {
    // If precedence was broken, GET /api/vehicles/search would evaluate :id = "search" and return 404
    const res = await request(app).get('/api/vehicles/search');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('page');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('should return 400 VALIDATION_ERROR on invalid query types', async () => {
    const res = await request(app)
      .get('/api/vehicles/search')
      .query({ minPrice: 'not-a-number' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
