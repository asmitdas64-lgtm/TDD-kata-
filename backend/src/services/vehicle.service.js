import { AppError } from '../errors/app-error.js';
import { prisma as defaultPrisma } from '../config/prisma.js';
import { vehicleRepository as defaultVehicleRepo } from '../repositories/vehicle.repository.js';
import { orderRepository as defaultOrderRepo } from '../repositories/order.repository.js';

export class VehicleService {
  constructor(vehicleRepo = defaultVehicleRepo, orderRepo = defaultOrderRepo, prismaClient = defaultPrisma) {
    this.vehicleRepo = vehicleRepo;
    this.orderRepo = orderRepo;
    this.prisma = prismaClient;
  }

  async createVehicle(data) {
    const existing = await this.vehicleRepo.findByVin(data.vin);
    if (existing) {
      throw new AppError('DUPLICATE_VIN', 409, `Vehicle with VIN '${data.vin}' already exists`);
    }

    return this.vehicleRepo.create(data);
  }

  async getVehicles(queryParams = {}) {
    const page = Math.max(1, Number(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryParams.limit) || 10));
    const skip = (page - 1) * limit;

    const where = {};

    if (queryParams.make) {
      where.make = { contains: queryParams.make };
    }

    if (queryParams.model) {
      where.model = { contains: queryParams.model };
    }

    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) {
      where.price = {};
      if (queryParams.minPrice !== undefined) {
        where.price.gte = queryParams.minPrice;
      }
      if (queryParams.maxPrice !== undefined) {
        where.price.lte = queryParams.maxPrice;
      }
    }

    const [items, total] = await Promise.all([
      this.vehicleRepo.findMany({ skip, take: limit, where }),
      this.vehicleRepo.count(where)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      vehicles: items,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async getVehicleById(id) {
    const vehicle = await this.vehicleRepo.findById(id);
    if (!vehicle) {
      throw new AppError('RESOURCE_NOT_FOUND', 404, `Vehicle with id '${id}' was not found`);
    }
    return vehicle;
  }

  async updateVehicle(id, updateData) {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) {
      throw new AppError('RESOURCE_NOT_FOUND', 404, `Vehicle with id '${id}' was not found`);
    }

    if (updateData.vin && updateData.vin !== existing.vin) {
      const vinConflict = await this.vehicleRepo.findByVin(updateData.vin);
      if (vinConflict && vinConflict.id !== id) {
        throw new AppError('DUPLICATE_VIN', 409, `Vehicle with VIN '${updateData.vin}' already exists`);
      }
    }

    return this.vehicleRepo.update(id, updateData);
  }

  async deleteVehicle(id) {
    const existing = await this.vehicleRepo.findById(id);
    if (!existing) {
      throw new AppError('RESOURCE_NOT_FOUND', 404, `Vehicle with id '${id}' was not found`);
    }

    await this.vehicleRepo.delete(id);
    return { id, deleted: true };
  }

  async searchVehicles(queryParams = {}) {
    const page = Math.max(1, Number(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(queryParams.limit) || 10));
    const skip = (page - 1) * limit;

    const filters = {
      q: queryParams.q,
      search: queryParams.search,
      make: queryParams.make,
      model: queryParams.model,
      color: queryParams.color,
      status: queryParams.status,
      minPrice: queryParams.minPrice,
      maxPrice: queryParams.maxPrice,
      minYear: queryParams.minYear,
      maxYear: queryParams.maxYear
    };

    const sort = {
      field: queryParams.sortBy || 'createdAt',
      order: queryParams.sortOrder || 'desc'
    };

    const { items, total } = await this.vehicleRepo.searchVehicles({
      filters,
      pagination: { skip, take: limit },
      sort
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      vehicles: items,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async purchaseVehicle(vehicleId, userId, quantity = 1) {
    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId }
      });

      if (!vehicle) {
        throw new AppError('RESOURCE_NOT_FOUND', 404, `Vehicle with id '${vehicleId}' was not found`);
      }

      if (vehicle.quantity < quantity || vehicle.status === 'SOLD') {
        throw new AppError('OUT_OF_STOCK', 400, 'Vehicle is out of stock');
      }

      const updatedVehicle = await this.vehicleRepo.decrementStock(vehicleId, quantity, tx);
      if (!updatedVehicle) {
        throw new AppError('OUT_OF_STOCK', 400, 'Vehicle is out of stock');
      }

      const order = await this.orderRepo.createOrder(
        {
          userId,
          vehicleId,
          unitPrice: vehicle.price,
          quantity,
          status: 'COMPLETED'
        },
        tx
      );

      return {
        orderId: order.id,
        order,
        vehicle: updatedVehicle
      };
    });
  }

  async restockVehicle(vehicleId, quantity = 1) {
    const existing = await this.vehicleRepo.findById(vehicleId);
    if (!existing) {
      throw new AppError('RESOURCE_NOT_FOUND', 404, `Vehicle with id '${vehicleId}' was not found`);
    }

    const updatedVehicle = await this.vehicleRepo.incrementStock(vehicleId, quantity);
    return updatedVehicle;
  }
}

export const vehicleService = new VehicleService();
export default vehicleService;
