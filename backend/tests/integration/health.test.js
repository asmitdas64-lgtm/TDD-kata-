import request from 'supertest';
import app from '../../src/app.js';

describe('GET /health Integration Probe', () => {
  it('should return 200 OK with UP status envelope', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: 'UP',
        timestamp: expect.any(String)
      },
      error: null
    });
  });

  it('should return 404 with standardized error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/unknown-endpoint not found',
        details: []
      }
    });
  });
});
