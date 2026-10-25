import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('GET /api/vehicles Integration Tests', () => {
  const app = createApp();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 200 with paginated vehicles and metadata structure', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .query({ page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
    expect(typeof res.body.meta.total).toBe('number');
    expect(typeof res.body.meta.totalPages).toBe('number');
  });

  it('should filter vehicles by make', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .query({ make: 'Porsche' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((vehicle) => {
      expect(vehicle.make.toLowerCase()).toContain('porsche');
    });
  });

  it('should filter vehicles by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .query({ minPrice: 30000, maxPrice: 40000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((vehicle) => {
      const price = Number(vehicle.price);
      expect(price).toBeGreaterThanOrEqual(30000);
      expect(price).toBeLessThanOrEqual(40000);
    });
  });
});
