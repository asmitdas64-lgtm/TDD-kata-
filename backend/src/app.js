import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';
import { AppError } from './errors/app-error.js';

import authRoutes from './routes/auth.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';

export const createApp = () => {
  const app = express();

  // Baseline Security & Transport Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    })
  );
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);

  // Healthcheck Probe
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'UP',
        timestamp: new Date().toISOString()
      },
      error: null
    });
  });

  // 404 Catch-all handler for undefined routes
  app.use((req, res, next) => {
    next(new AppError('NOT_FOUND', 404, `Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Middleware
  app.use(errorHandler);

  return app;
};

export default createApp();
