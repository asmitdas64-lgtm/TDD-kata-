# Data Model & Schema Specification

## 1. Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  CUSTOMER
}

enum VehicleStatus {
  AVAILABLE
  SOLD
}

enum OrderStatus {
  COMPLETED
  CANCELLED
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         Role      @default(CUSTOMER)
  orders       Order[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([email])
}

model Vehicle {
  id        String        @id @default(cuid())
  vin       String        @unique
  make      String
  model     String
  year      Int
  price     Decimal       @db.Decimal(10, 2)
  mileage   Int
  color     String
  status    VehicleStatus @default(AVAILABLE)
  quantity  Int           @default(1)
  orders    Order[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([vin])
  @@index([make, model])
  @@index([price])
  @@index([status])
  @@index([year])
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id], onDelete: Restrict)
  vehicleId  String
  vehicle    Vehicle     @relation(fields: [vehicleId], references: [id], onDelete: Restrict)
  unitPrice  Decimal     @db.Decimal(10, 2)
  status     OrderStatus @default(COMPLETED)
  createdAt  DateTime    @default(now())

  @@index([userId])
  @@index([vehicleId])
}
```

---

## 2. Integrity Constraints & Invariants

### 2.1 Database-Level Constraints
- **Unique Constraints:** `User.email` and `Vehicle.vin` enforce natural unique constraints.
- **Check Constraints (PostgreSQL Migration DDL):**
  Prisma does not natively support check constraints in schema syntax; a raw SQL migration establishes strict database invariants:
  ```sql
  ALTER TABLE "Vehicle" ADD CONSTRAINT "vehicle_quantity_non_negative" CHECK ("quantity" >= 0);
  ALTER TABLE "Vehicle" ADD CONSTRAINT "vehicle_price_positive" CHECK ("price" > 0);
  ALTER TABLE "Vehicle" ADD CONSTRAINT "vehicle_mileage_non_negative" CHECK ("mileage" >= 0);
  ```

### 2.2 Application-Level Invariants
- **Atomic Stock Decrement:** Purchases issue conditional update queries:
  ```sql
  UPDATE "Vehicle"
  SET "quantity" = "quantity" - 1,
      "status" = CASE WHEN "quantity" - 1 = 0 THEN 'SOLD'::"VehicleStatus" ELSE "status" END,
      "updatedAt" = NOW()
  WHERE "id" = $1 AND "quantity" > 0;
  ```
  If zero rows are affected, the service throws an `AppError('OUT_OF_STOCK', 400)`.
- **Restock Invariant:** Restocking increments `quantity` and automatically resets `status` to `AVAILABLE`.

---

## 3. Seed Data Specification (`prisma/seed.js` - Native ES Modules)

The seed script is executed via `node prisma/seed.js` or `npx prisma db seed`:

```javascript
// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('AdminSecure2026!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@dealership.com' },
    update: {},
    create: {
      email: 'admin@dealership.com',
      name: 'System Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  const vehicles = [
    { vin: '1HGCR2F83HA100001', make: 'Honda', model: 'Accord EX-L', year: 2022, price: 27999.00, mileage: 22400, color: 'Platinum White', status: 'AVAILABLE', quantity: 3 },
    { vin: '4T1B11HK5JU200002', make: 'Toyota', model: 'Camry SE', year: 2023, price: 29450.00, mileage: 11200, color: 'Midnight Black', status: 'AVAILABLE', quantity: 2 },
    { vin: '1FA6P8CF5H5300003', make: 'Ford', model: 'Mustang GT', year: 2021, price: 38500.00, mileage: 18900, color: 'Race Red', status: 'AVAILABLE', quantity: 1 },
    { vin: 'WAUZZZF45KA400004', make: 'Audi', model: 'A4 Premium Plus', year: 2022, price: 35200.00, mileage: 26100, color: 'Ibis White', status: 'AVAILABLE', quantity: 2 },
    { vin: 'WBA33AY05N5500005', make: 'BMW', model: '330i xDrive', year: 2023, price: 42900.00, mileage: 9800, color: 'Portimao Blue', status: 'AVAILABLE', quantity: 4 },
    { vin: '5YJ3E1EB2MF600006', make: 'Tesla', model: 'Model 3 Long Range', year: 2021, price: 33500.00, mileage: 34200, color: 'Pearl White', status: 'AVAILABLE', quantity: 1 },
    { vin: 'JM1BPAPL6K1700007', make: 'Mazda', model: 'CX-5 Grand Touring', year: 2020, price: 23800.00, mileage: 45600, color: 'Soul Red Crystal', status: 'AVAILABLE', quantity: 2 },
    { vin: 'KM8K12AA9NU800008', make: 'Hyundai', model: 'Tucson SEL', year: 2022, price: 26400.00, mileage: 19300, color: 'Amazon Gray', status: 'AVAILABLE', quantity: 3 },
    { vin: '1G1YY2D78L5900009', make: 'Chevrolet', model: 'Corvette Stingray', year: 2020, price: 68900.00, mileage: 12000, color: 'Torch Red', status: 'SOLD', quantity: 0 },
    { vin: 'JN1AZ4EH9KM100010', make: 'Nissan', model: 'Rogue SV', year: 2021, price: 22950.00, mileage: 38700, color: 'Gun Metallic', status: 'AVAILABLE', quantity: 2 }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { vin: v.vin },
      update: {},
      create: v
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
