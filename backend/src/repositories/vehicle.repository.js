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

  buildSearchWhereClause(filters = {}) {
    const where = {};
    const andClauses = [];

    // General text search (q or search) across make and model
    const searchTerm = filters.q || filters.search;
    if (searchTerm) {
      andClauses.push({
        OR: [
          { make: { contains: searchTerm } },
          { model: { contains: searchTerm } }
        ]
      });
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
