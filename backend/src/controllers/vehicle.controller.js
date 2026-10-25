import { vehicleService as defaultVehicleService } from '../services/vehicle.service.js';

export class VehicleController {
  constructor(vehicleService = defaultVehicleService) {
    this.vehicleService = vehicleService;
  }

  create = async (req, res, next) => {
    try {
      const vehicle = await this.vehicleService.createVehicle(req.body);
      return res.status(201).json({
        success: true,
        data: { vehicle },
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const queryParams = req.validatedQuery || req.query;
      const result = await this.vehicleService.getVehicles(queryParams);
      return res.status(200).json({
        success: true,
        data: result.vehicles,
        error: null,
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req, res, next) => {
    try {
      const queryParams = req.validatedQuery || req.query;
      const result = await this.vehicleService.searchVehicles(queryParams);
      return res.status(200).json({
        success: true,
        data: result.vehicles,
        error: null,
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const vehicle = await this.vehicleService.getVehicleById(req.params.id);
      return res.status(200).json({
        success: true,
        data: { vehicle },
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const vehicle = await this.vehicleService.updateVehicle(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: { vehicle },
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const result = await this.vehicleService.deleteVehicle(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  purchase = async (req, res, next) => {
    try {
      const vehicleId = req.params.id;
      const userId = req.user.id;
      const quantity = req.body?.quantity !== undefined ? req.body.quantity : 1;
      const result = await this.vehicleService.purchaseVehicle(vehicleId, userId, quantity);
      return res.status(200).json({
        success: true,
        data: {
          orderId: result.orderId,
          vehicle: result.vehicle
        },
        error: null
      });
    } catch (error) {
      next(error);
    }
  };

  restock = async (req, res, next) => {
    try {
      const vehicleId = req.params.id;
      const quantity = req.body?.quantity ?? req.body?.amount ?? 1;
      const vehicle = await this.vehicleService.restockVehicle(vehicleId, quantity);
      return res.status(200).json({
        success: true,
        data: { vehicle },
        error: null
      });
    } catch (error) {
      next(error);
    }
  };
}

export const vehicleController = new VehicleController();
export default vehicleController;
