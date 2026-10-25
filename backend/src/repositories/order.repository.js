import { prisma as defaultPrisma } from '../config/prisma.js';

export class OrderRepository {
  constructor(prismaClient = defaultPrisma) {
    this.prisma = prismaClient;
  }

  async createOrder({ userId, vehicleId, unitPrice, quantity = 1, status = 'COMPLETED' }, tx = null) {
    const client = tx || this.prisma;
    return client.order.create({
      data: {
        userId,
        vehicleId,
        unitPrice,
        quantity,
        status
      }
    });
  }

  async findById(id, tx = null) {
    const client = tx || this.prisma;
    return client.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        vehicle: true
      }
    });
  }

  async findByUserId(userId, tx = null) {
    const client = tx || this.prisma;
    return client.order.findMany({
      where: { userId },
      include: {
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const orderRepository = new OrderRepository();
export default orderRepository;
