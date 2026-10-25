import { jest } from '@jest/globals';
import { VehicleService } from '../../src/services/vehicle.service.js';

describe('VehicleService Search Orchestrator Unit Tests', () => {
  let mockVehicleRepo;
  let vehicleService;

  beforeEach(() => {
    mockVehicleRepo = {
      searchVehicles: jest.fn().mockResolvedValue({
        items: [{ id: 'veh_1', make: 'Honda', model: 'Accord' }],
        total: 15
      })
    };
    vehicleService = new VehicleService(mockVehicleRepo);
  });

  it('should compute pagination math (totalPages, offsets) with default fallback values', async () => {
    const result = await vehicleService.searchVehicles({});

    expect(mockVehicleRepo.searchVehicles).toHaveBeenCalledWith({
      filters: {
        q: undefined,
        search: undefined,
        make: undefined,
        model: undefined,
        color: undefined,
        status: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        minYear: undefined,
        maxYear: undefined
      },
      pagination: { skip: 0, take: 10 },
      sort: { field: 'createdAt', order: 'desc' }
    });

    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2
    });
    expect(result.vehicles).toHaveLength(1);
  });

  it('should respect custom page, limit, and sort parameters', async () => {
    mockVehicleRepo.searchVehicles.mockResolvedValueOnce({
      items: [],
      total: 25
    });

    const result = await vehicleService.searchVehicles({
      page: 2,
      limit: 5,
      sortBy: 'price',
      sortOrder: 'asc',
      make: 'Ford'
    });

    expect(mockVehicleRepo.searchVehicles).toHaveBeenCalledWith({
      filters: expect.objectContaining({ make: 'Ford' }),
      pagination: { skip: 5, take: 5 },
      sort: { field: 'price', order: 'asc' }
    });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(5);
    expect(result.pagination.totalPages).toBe(5);
  });
});
