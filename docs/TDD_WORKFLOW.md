# Test-Driven Development (TDD) Workflow

## 1. The Red-Green-Refactor Loop

Development follows a strict TDD rhythm where code is never authored without a pre-existing failing test, utilizing modern JavaScript (native ES Modules).

```
       ┌────────────────┐
       │   Write Test   │  ──> Define desired behavior & assertions
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │  Execute: RED  │  ──> Confirm test fails for the right reason
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Execute: GREEN │  ──> Write minimal implementation to pass
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │    REFACTOR    │  ──> Remove duplication, improve architecture
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Commit (Atomic)│  ──> Record separate git commits per phase
       └────────────────┘
```

### Git Commit Conventions
Every stage must be committed as an atomic unit with standardized prefixes:
- `test: <description>` (Red stage)
- `feat: <description>` or `fix: <description>` (Green stage)
- `refactor: <description>` (Refactor stage)
- `chore: <description>` (Tooling, configuration, dependencies)

Every AI-assisted commit **MUST** conclude with a blank line and the co-author trailer:
```
Co-authored-by: Claude <noreply@anthropic.com>
```

---

## 2. Worked Example: "Purchase Decreases Quantity by 1" (ESM JavaScript)

### Step 1: Red Phase (Failing Test)
**File:** `backend/tests/unit/services/vehicle.service.test.js`
```javascript
import { jest } from '@jest/globals';
import { VehicleService } from '../../../src/services/vehicle.service.js';

describe('VehicleService', () => {
  let vehicleService;
  let mockVehicleRepo;
  let mockOrderRepo;

  beforeEach(() => {
    mockVehicleRepo = {
      findById: jest.fn(),
      decrementStock: jest.fn(),
      updateStatus: jest.fn()
    };

    mockOrderRepo = {
      createOrder: jest.fn()
    };

    vehicleService = new VehicleService(mockVehicleRepo, mockOrderRepo);
  });

  describe('purchaseVehicle', () => {
    it('should decrease quantity by 1 and record order when vehicle is available', async () => {
      // Arrange
      const vehicleId = 'veh-123';
      const userId = 'usr-456';
      const existingVehicle = {
        id: vehicleId,
        vin: '1HGCR2F83HA100001',
        make: 'Honda',
        model: 'Accord',
        year: 2022,
        price: '28000.00',
        mileage: 15000,
        color: 'White',
        quantity: 2,
        status: 'AVAILABLE'
      };

      mockVehicleRepo.findById.mockResolvedValue(existingVehicle);
      mockVehicleRepo.decrementStock.mockResolvedValue({
        ...existingVehicle,
        quantity: 1
      });
      mockOrderRepo.createOrder.mockResolvedValue({
        id: 'ord-789',
        userId,
        vehicleId,
        unitPrice: '28000.00'
      });

      // Act
      const result = await vehicleService.purchaseVehicle(vehicleId, userId);

      // Assert
      expect(mockVehicleRepo.decrementStock).toHaveBeenCalledWith(vehicleId);
      expect(result.vehicle.quantity).toBe(1);
      expect(result.orderId).toBe('ord-789');
    });
  });
});
```
- **Run:** `npm test` -> **Fails** (`TypeError: vehicleService.purchaseVehicle is not a function`).
- **Commit:**
  ```bash
  git commit -m "test(vehicle): add unit test for purchasing available vehicle

  Co-authored-by: Claude <noreply@anthropic.com>"
  ```

---

### Step 2: Green Phase (Minimal Code to Pass)
**File:** `backend/src/services/vehicle.service.js`
```javascript
import { AppError } from '../errors/app-error.js';

export class VehicleService {
  constructor(vehicleRepo, orderRepo) {
    this.vehicleRepo = vehicleRepo;
    this.orderRepo = orderRepo;
  }

  async purchaseVehicle(vehicleId, userId) {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) {
      throw new AppError('RESOURCE_NOT_FOUND', 404, 'Vehicle not found');
    }
    if (vehicle.quantity <= 0) {
      throw new AppError('OUT_OF_STOCK', 400, 'Vehicle is out of stock');
    }

    const updatedVehicle = await this.vehicleRepo.decrementStock(vehicleId);
    const order = await this.orderRepo.createOrder({
      userId,
      vehicleId,
      unitPrice: vehicle.price
    });

    return {
      orderId: order.id,
      vehicle: updatedVehicle
    };
  }
}
```
- **Run:** `npm test` -> **Passes (All green)**.
- **Commit:**
  ```bash
  git commit -m "feat(vehicle): implement purchaseVehicle stock decrement and order creation

  Co-authored-by: Claude <noreply@anthropic.com>"
  ```

---

### Step 3: Refactor Phase (Clean Up & Domain Invariants)
- Extract transaction handling, status updates to `SOLD` when quantity reaches 0.
- **Run:** `npm test` -> **Passes**.
- **Commit:**
  ```bash
  git commit -m "refactor(vehicle): extract status transition rule on zero inventory

  Co-authored-by: Claude <noreply@anthropic.com>"
  ```

---

## 3. Test Standards & Naming Conventions

All tests must follow the standard naming structure:
```javascript
describe('<TargetServiceOrComponent>', () => {
  describe('<methodName>', () => {
    it('should <expected outcome> when <given condition>', async () => {
      // Arrange - Act - Assert
    });
  });
});
```

## 4. Coverage Thresholds
- **Domain Services & Use Cases:** Minimum **90% branch and statement coverage**.
- Enforced automatically in CI and via `npm run test:coverage`.
