import { jest } from '@jest/globals';
import { OrderRepository } from '../../src/repositories/order.repository.js';

describe('OrderRepository Unit Tests', () => {
  let mockPrisma;
  let orderRepo;

  beforeEach(() => {
    mockPrisma = {
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn()
      }
    };
    orderRepo = new OrderRepository(mockPrisma);
  });

  it('should create an order with defaults', async () => {
    const orderData = {
      userId: 'user-123',
      vehicleId: 'vehicle-456',
      unitPrice: 25000.00,
      quantity: 1,
      status: 'COMPLETED'
    };

    const createdOrder = { id: 'order-789', ...orderData, createdAt: new Date() };
    mockPrisma.order.create.mockResolvedValue(createdOrder);

    const result = await orderRepo.createOrder(orderData);

    expect(mockPrisma.order.create).toHaveBeenCalledWith({
      data: orderData
    });
    expect(result).toEqual(createdOrder);
  });

  it('should find an order by id with user and vehicle relation', async () => {
    const mockOrder = {
      id: 'order-1',
      userId: 'user-1',
      vehicleId: 'vehicle-1',
      unitPrice: 15000,
      quantity: 1,
      status: 'COMPLETED',
      user: { id: 'user-1', email: 'test@example.com', role: 'CUSTOMER' },
      vehicle: { id: 'vehicle-1', make: 'Honda', model: 'Civic' }
    };
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

    const result = await orderRepo.findById('order-1');

    expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      include: {
        user: { select: { id: true, email: true, role: true } },
        vehicle: true
      }
    });
    expect(result).toEqual(mockOrder);
  });

  it('should find orders by userId in descending order', async () => {
    mockPrisma.order.findMany.mockResolvedValue([{ id: 'order-1' }]);

    const result = await orderRepo.findByUserId('user-1');

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' }
    });
    expect(result).toHaveLength(1);
  });
});
