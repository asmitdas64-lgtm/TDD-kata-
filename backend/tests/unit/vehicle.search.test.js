import { VehicleRepository } from '../../src/repositories/vehicle.repository.js';

describe('VehicleRepository Search Query Builder Unit Tests', () => {
  let vehicleRepo;

  beforeEach(() => {
    vehicleRepo = new VehicleRepository({});
  });

  it('should construct empty where clause when no filters are passed', () => {
    const where = vehicleRepo.buildSearchWhereClause({});
    expect(where).toEqual({});
  });

  it('should construct OR condition across make and model for text search "q"', () => {
    const where = vehicleRepo.buildSearchWhereClause({ q: 'Civic' });
    expect(where).toHaveProperty('AND');
    expect(where.AND).toContainEqual({
      OR: [
        { make: { contains: 'Civic' } },
        { model: { contains: 'Civic' } }
      ]
    });
  });

  it('should combine make, status, price range, and year range with AND clauses', () => {
    const where = vehicleRepo.buildSearchWhereClause({
      make: 'Toyota',
      status: 'AVAILABLE',
      minPrice: 20000,
      maxPrice: 35000,
      minYear: 2020,
      maxYear: 2024
    });

    expect(where).toHaveProperty('AND');
    expect(where.AND).toContainEqual({ make: { contains: 'Toyota' } });
    expect(where.AND).toContainEqual({ status: 'AVAILABLE' });
    expect(where.AND).toContainEqual({ price: { gte: 20000, lte: 35000 } });
    expect(where.AND).toContainEqual({ year: { gte: 2020, lte: 2024 } });
  });
});
