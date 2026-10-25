import { jest } from '@jest/globals';
import { VehicleService } from '../../src/services/vehicle.service.js';
import { AppError } from '../../src/errors/app-error.js';

describe('VehicleService restockVehicle Unit Tests', () => {
  let mockVehicleRepo;
  let vehicleService;

  beforeEach(() => {
    mockVehicleRepo = {
      findById: jest.fn(),
      incrementStock: jest.fn()
    };
    vehicleService = new VehicleService(mockVehicleRepo, {}, {});
  });

  it('should throw RESOURCE_NOT_FOUND (404) if vehicle does not exist', async () => {
    mockVehicleRepo.findById.mockResolvedValue(null);

    await expect(vehicleService.restockVehicle('v-none', 5)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
      statusCode: 404
    });
  });

  it('should increment vehicle quantity and return updated vehicle', async () => {
    mockVehicleRepo.findById.mockResolvedValue({
      id: 'v-1',
      quantity: 0,
      status: 'SOLD'
    });

    const updatedVehicle = {
      id: 'v-1',
      quantity: 5,
      status: 'AVAILABLE'
    };
    mockVehicleRepo.incrementStock.mockResolvedValue(updatedVehicle);

    const result = await vehicleService.restockVehicle('v-1', 5);

    expect(mockVehicleRepo.incrementStock).toHaveBeenCalledWith('v-1', 5);
    expect(result).toEqual(updatedVehicle);
    expect(result.status).toBe('AVAILABLE');
  });
});
