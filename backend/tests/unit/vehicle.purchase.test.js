import { jest } from '@jest/globals';
import { VehicleService } from '../../src/services/vehicle.service.js';
import { AppError } from '../../src/errors/app-error.js';

describe('VehicleService purchaseVehicle Unit Tests', () => {
  let mockVehicleRepo;
  let mockOrderRepo;
  let mockPrisma;
  let vehicleService;

  beforeEach(() => {
    mockVehicleRepo = {
      findById: jest.fn(),
      decrementStock: jest.fn()
    };
    mockOrderRepo = {
      createOrder: jest.fn()
    };
    // Mock prisma.$transaction to immediately execute callback with mock tx
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      vehicle: {
        findUnique: jest.fn(),
        update: jest.fn()
      }
    };
    vehicleService = new VehicleService(mockVehicleRepo, mockOrderRepo, mockPrisma);
  });

  it('should throw RESOURCE_NOT_FOUND (404) if vehicle does not exist', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue(null);

    await expect(vehicleService.purchaseVehicle('v-none', 'u-1', 1)).rejects.toThrow(AppError);
    await expect(vehicleService.purchaseVehicle('v-none', 'u-1', 1)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
      statusCode: 404
    });
  });

  it('should throw OUT_OF_STOCK (400) if requested quantity exceeds available quantity', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
      id: 'v-1',
      quantity: 1,
      status: 'AVAILABLE',
      price: 20000
    });

    await expect(vehicleService.purchaseVehicle('v-1', 'u-1', 2)).rejects.toMatchObject({
      code: 'OUT_OF_STOCK',
      statusCode: 400
    });
  });

  it('should throw OUT_OF_STOCK (400) if vehicle status is SOLD', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
      id: 'v-1',
      quantity: 0,
      status: 'SOLD',
      price: 20000
    });

    await expect(vehicleService.purchaseVehicle('v-1', 'u-1', 1)).rejects.toMatchObject({
      code: 'OUT_OF_STOCK',
      statusCode: 400
    });
  });

  it('should execute transaction, decrement stock, and create order successfully', async () => {
    const mockVehicle = {
      id: 'v-1',
      quantity: 3,
      status: 'AVAILABLE',
      price: 25000.00
    };
    const updatedVehicle = {
      id: 'v-1',
      quantity: 2,
      status: 'AVAILABLE',
      price: 25000.00
    };
    const mockOrder = {
      id: 'order-123',
      userId: 'u-1',
      vehicleId: 'v-1',
      unitPrice: 25000.00,
      quantity: 1,
      status: 'COMPLETED'
    };

    mockPrisma.vehicle.findUnique.mockResolvedValue(mockVehicle);
    mockVehicleRepo.decrementStock.mockResolvedValue(updatedVehicle);
    mockOrderRepo.createOrder.mockResolvedValue(mockOrder);

    const result = await vehicleService.purchaseVehicle('v-1', 'u-1', 1);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockVehicleRepo.decrementStock).toHaveBeenCalledWith('v-1', 1, mockPrisma);
    expect(mockOrderRepo.createOrder).toHaveBeenCalledWith(
      {
        userId: 'u-1',
        vehicleId: 'v-1',
        unitPrice: 25000.00,
        quantity: 1,
        status: 'COMPLETED'
      },
      mockPrisma
    );
    expect(result).toEqual({
      orderId: 'order-123',
      order: mockOrder,
      vehicle: updatedVehicle
    });
  });
});
