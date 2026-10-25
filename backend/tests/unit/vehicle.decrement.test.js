import { jest } from '@jest/globals';
import { VehicleRepository } from '../../src/repositories/vehicle.repository.js';

describe('VehicleRepository decrementStock & incrementStock Unit Tests', () => {
  let mockPrisma;
  let vehicleRepo;

  beforeEach(() => {
    mockPrisma = {
      vehicle: {
        findUnique: jest.fn(),
        update: jest.fn()
      }
    };
    vehicleRepo = new VehicleRepository(mockPrisma);
  });

  it('should return null when vehicle is not found during decrement', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue(null);

    const result = await vehicleRepo.decrementStock('v1', 1);

    expect(result).toBeNull();
    expect(mockPrisma.vehicle.update).not.toHaveBeenCalled();
  });

  it('should return null when requested quantity exceeds available stock', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
      id: 'v1',
      quantity: 1,
      status: 'AVAILABLE'
    });

    const result = await vehicleRepo.decrementStock('v1', 2);

    expect(result).toBeNull();
    expect(mockPrisma.vehicle.update).not.toHaveBeenCalled();
  });

  it('should decrement quantity and preserve status if stock remains > 0', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
      id: 'v1',
      quantity: 5,
      status: 'AVAILABLE'
    });
    mockPrisma.vehicle.update.mockResolvedValue({
      id: 'v1',
      quantity: 4,
      status: 'AVAILABLE'
    });

    const result = await vehicleRepo.decrementStock('v1', 1);

    expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: {
        quantity: 4,
        status: 'AVAILABLE'
      }
    });
    expect(result.quantity).toBe(4);
    expect(result.status).toBe('AVAILABLE');
  });

  it('should update status to SOLD when quantity reaches 0', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
      id: 'v1',
      quantity: 1,
      status: 'AVAILABLE'
    });
    mockPrisma.vehicle.update.mockResolvedValue({
      id: 'v1',
      quantity: 0,
      status: 'SOLD'
    });

    const result = await vehicleRepo.decrementStock('v1', 1);

    expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: {
        quantity: 0,
        status: 'SOLD'
      }
    });
    expect(result.quantity).toBe(0);
    expect(result.status).toBe('SOLD');
  });

  it('should increment quantity and reset status to AVAILABLE when restocking', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({
      id: 'v1',
      quantity: 0,
      status: 'SOLD'
    });
    mockPrisma.vehicle.update.mockResolvedValue({
      id: 'v1',
      quantity: 3,
      status: 'AVAILABLE'
    });

    const result = await vehicleRepo.incrementStock('v1', 3);

    expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: {
        quantity: 3,
        status: 'AVAILABLE'
      }
    });
    expect(result.quantity).toBe(3);
    expect(result.status).toBe('AVAILABLE');
  });
});
