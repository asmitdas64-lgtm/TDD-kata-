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
}

export const vehicleRepository = new VehicleRepository();
export default vehicleRepository;
