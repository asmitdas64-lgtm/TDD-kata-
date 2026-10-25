import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  listVehicleSchema,
  searchVehicleSchema,
  getVehicleParamsSchema,
  purchaseVehicleSchema,
  restockVehicleSchema
} from '../schemas/vehicle.schema.js';

const router = Router();

// Public routes
router.get('/', validate(listVehicleSchema), vehicleController.list);

// Critical Precedence: /search must be declared BEFORE /:id
router.get('/search', validate(searchVehicleSchema), vehicleController.search);

router.get('/:id', validate(getVehicleParamsSchema), vehicleController.getById);

// Authenticated customer/admin operations
router.post('/:id/purchase', authenticate, validate(purchaseVehicleSchema), vehicleController.purchase);

// Admin-protected routes
router.post('/', authenticate, requireAdmin, validate(createVehicleSchema), vehicleController.create);
router.post('/:id/restock', authenticate, requireAdmin, validate(restockVehicleSchema), vehicleController.restock);
router.put('/:id', authenticate, requireAdmin, validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authenticate, requireAdmin, validate(getVehicleParamsSchema), vehicleController.delete);

export default router;
