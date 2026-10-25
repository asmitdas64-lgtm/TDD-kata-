import { AppError } from '../errors/app-error.js';
import { vehicleRepository as defaultVehicleRepo } from '../repositories/vehicle.repository.js';

export class VehicleService {
  constructor(vehicleRepo = defaultVehicleRepo) {
    this.vehicleRepo = vehicleRepo;
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
}

export const vehicleService = new VehicleService();
export default vehicleService;
