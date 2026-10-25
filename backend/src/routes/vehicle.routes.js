import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  listVehicleSchema,
  getVehicleParamsSchema
} from '../schemas/vehicle.schema.js';

const router = Router();

// Public routes
router.get('/', validate(listVehicleSchema), vehicleController.list);
router.get('/:id', validate(getVehicleParamsSchema), vehicleController.getById);

// Admin-protected routes
router.post('/', authenticate, requireAdmin, validate(createVehicleSchema), vehicleController.create);
router.put('/:id', authenticate, requireAdmin, validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authenticate, requireAdmin, validate(getVehicleParamsSchema), vehicleController.delete);

export default router;
