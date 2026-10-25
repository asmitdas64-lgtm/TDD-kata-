import { prisma as defaultPrisma } from '../config/prisma.js';

export class VehicleRepository {
  constructor(prismaClient = defaultPrisma) {
    this.prisma = prismaClient;
  }

  async create(data) {
    return this.prisma.vehicle.create({
      data: {
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year,
        price: data.price,
        mileage: data.mileage,
        color: data.color,
        quantity: data.quantity ?? 1,
        status: data.status ?? 'AVAILABLE'
      }
    });
  }

  async findById(id) {
    return this.prisma.vehicle.findUnique({
      where: { id }
    });
  }

  async findByVin(vin) {
    return this.prisma.vehicle.findUnique({
      where: { vin }
    });
  }

  async findMany({ skip = 0, take = 10, where = {}, orderBy = { createdAt: 'desc' } } = {}) {
    return this.prisma.vehicle.findMany({
      skip,
      take,
      where,
      orderBy
    });
  }

  async count(where = {}) {
    return this.prisma.vehicle.count({ where });
  }

  async update(id, data) {
    return this.prisma.vehicle.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return this.prisma.vehicle.delete({
      where: { id }
    });
  }

  async decrementStock(id, quantity = 1, tx = null) {
    const client = tx || this.prisma;
    const vehicle = await client.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle || vehicle.quantity < quantity) {
      return null;
    }

    const newQuantity = vehicle.quantity - quantity;
    const newStatus = newQuantity === 0 ? 'SOLD' : vehicle.status;

    return client.vehicle.update({
      where: { id },
      data: {
        quantity: newQuantity,
        status: newStatus
      }
    });
  }

  async incrementStock(id, quantity = 1, tx = null) {
    const client = tx || this.prisma;
    const vehicle = await client.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      return null;
    }

    const newQuantity = vehicle.quantity + quantity;
    const newStatus = newQuantity > 0 ? 'AVAILABLE' : vehicle.status;

    return client.vehicle.update({
      where: { id },
      data: {
        quantity: newQuantity,
        status: newStatus
      }
    });
  }

  buildSearchWhereClause(filters = {}) {
    const where = {};
    const andClauses = [];

    // General text search (q or search): every whitespace-separated token must
    // match make, model, or VIN (e.g. "Porsche 911 GT3" or a partial VIN).
    const searchTerm = filters.q || filters.search;
    if (searchTerm) {
      const tokens = String(searchTerm).trim().split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        andClauses.push({
          OR: [
            { make: { contains: token } },
            { model: { contains: token } },
            { vin: { contains: token } }
          ]
        });
      }
    }

    if (filters.make) {
      andClauses.push({ make: { contains: filters.make } });
    }

    if (filters.model) {
      andClauses.push({ model: { contains: filters.model } });
    }

    if (filters.color) {
      andClauses.push({ color: { contains: filters.color } });
    }

    if (filters.status) {
      andClauses.push({ status: filters.status });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceFilter = {};
      if (filters.minPrice !== undefined) {
        priceFilter.gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        priceFilter.lte = Number(filters.maxPrice);
      }
      andClauses.push({ price: priceFilter });
    }

    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      const yearFilter = {};
      if (filters.minYear !== undefined) {
        yearFilter.gte = parseInt(filters.minYear, 10);
      }
      if (filters.maxYear !== undefined) {
        yearFilter.lte = parseInt(filters.maxYear, 10);
      }
      andClauses.push({ year: yearFilter });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    return where;
  }

  async searchVehicles({ filters = {}, pagination = {}, sort = {} } = {}) {
    const where = this.buildSearchWhereClause(filters);
    const skip = pagination.skip ?? 0;
    const take = pagination.take ?? 10;
    const orderBy = sort.field ? { [sort.field]: sort.order || 'desc' } : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy
      }),
      this.prisma.vehicle.count({ where })
    ]);

    return { items, total, where };
  }
}

export const vehicleRepository = new VehicleRepository();
export default vehicleRepository;
