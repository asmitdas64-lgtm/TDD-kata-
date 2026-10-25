import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Curated performance fleet for the TDD Kata showroom.
 * Each make/model is mapped to studio imagery on the frontend via
 * `frontend/src/utils/vehicleImages.js`.
 * VINs are 17 characters and exclude I/O/Q to satisfy the VIN schema.
 */
const vehicles = [
  // Porsche
  { vin: 'WP0TDDKATA2024001', make: 'Porsche', model: '911 GT3', year: 2024, price: 228000, mileage: 1200, color: 'GT Silver Metallic', quantity: 1 },
  { vin: 'WP0TDDKATA2023002', make: 'Porsche', model: '911 Turbo S', year: 2023, price: 239500, mileage: 3400, color: 'Jet Black Metallic', quantity: 2 },
  { vin: 'WP1TDDKATA2024003', make: 'Porsche', model: 'Cayenne Turbo GT', year: 2024, price: 196300, mileage: 2100, color: 'Chalk', quantity: 1 },

  // BMW
  { vin: 'WBSTDDKATA2024004', make: 'BMW', model: 'M4 Competition', year: 2024, price: 84100, mileage: 4800, color: 'Isle of Man Green', quantity: 3 },
  { vin: 'WBSTDDKATA2023005', make: 'BMW', model: 'M3 Competition xDrive', year: 2023, price: 82900, mileage: 9200, color: 'Brooklyn Grey', quantity: 2 },
  { vin: '5YMTDDKATA2023006', make: 'BMW', model: 'X5 M Competition', year: 2023, price: 121000, mileage: 11500, color: 'Dravit Grey', quantity: 0 },

  // Mercedes-AMG
  { vin: 'WDDTDDKATA2024007', make: 'Mercedes-AMG', model: 'GT 63 Coupe', year: 2024, price: 178000, mileage: 2600, color: 'Obsidian Black', quantity: 1 },
  { vin: 'W1KTDDKATA2024008', make: 'Mercedes-AMG', model: 'C 63 S E Performance', year: 2024, price: 86500, mileage: 5100, color: 'Graphite Grey', quantity: 2 },
  { vin: 'W1NTDDKATA2023009', make: 'Mercedes-AMG', model: 'G 63', year: 2023, price: 179000, mileage: 7800, color: 'Night Black Magno', quantity: 1 },

  // Audi
  { vin: 'WUATDDKATA2024010', make: 'Audi', model: 'RS6 Avant Performance', year: 2024, price: 125800, mileage: 3900, color: 'Nardo Grey', quantity: 2 },
  { vin: 'WUATDDKATA2025011', make: 'Audi', model: 'RS6 Avant GT', year: 2025, price: 217000, mileage: 500, color: 'Arrow Grey', quantity: 1 },
  { vin: 'WU1TDDKATA2025012', make: 'Audi', model: 'RS Q8 Performance', year: 2025, price: 138900, mileage: 1800, color: 'Daytona Grey', quantity: 2 },

  // Ford
  { vin: '1FATDDKATA2024013', make: 'Ford', model: 'Mustang Dark Horse', year: 2024, price: 63900, mileage: 2300, color: 'Blue Ember', quantity: 3 },
  { vin: '1FATDDKATA2023014', make: 'Ford', model: 'Mustang GT Premium', year: 2023, price: 52400, mileage: 8900, color: 'Atlas Blue', quantity: 2 },

  // Chevrolet
  { vin: '1G1TDDKATA2024015', make: 'Chevrolet', model: 'Corvette Z06', year: 2024, price: 129900, mileage: 1500, color: 'Torch Red', quantity: 1 },
  { vin: '1G1TDDKATA2023016', make: 'Chevrolet', model: 'Corvette Stingray 3LT', year: 2023, price: 86300, mileage: 6700, color: 'Rapid Blue', quantity: 0 },

  // Tesla
  { vin: '5YJTDDKATA2024017', make: 'Tesla', model: 'Model S Plaid', year: 2024, price: 89990, mileage: 3200, color: 'Pearl White', quantity: 4 },
  { vin: '5YJTDDKATA2022018', make: 'Tesla', model: 'Model S Long Range', year: 2022, price: 64500, mileage: 21800, color: 'Midnight Silver', quantity: 1 },

  // Aston Martin
  { vin: 'SCFTDDKATA2025019', make: 'Aston Martin', model: 'Vantage', year: 2025, price: 191000, mileage: 900, color: 'Racing Green', quantity: 1 },
  { vin: 'SCFTDDKATA2023020', make: 'Aston Martin', model: 'DB11 V8', year: 2023, price: 176500, mileage: 5400, color: 'Magnetic Silver', quantity: 0 }
].map((v) => ({ ...v, status: v.quantity > 0 ? 'AVAILABLE' : 'SOLD' }));

async function main() {
  console.log('Seeding database...');

  // 1. Administrator user
  const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dealership.com' },
    update: {},
    create: {
      email: 'admin@dealership.com',
      name: 'System Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });
  console.log(`Seeded admin user: ${admin.email}`);

  // 2. Remove legacy catalog entries that are not part of the curated fleet.
  //    Vehicles referenced by orders are preserved (FK is ON DELETE RESTRICT).
  const curatedVins = vehicles.map((v) => v.vin);
  const removed = await prisma.vehicle.deleteMany({
    where: {
      vin: { notIn: curatedVins },
      orders: { none: {} }
    }
  });
  console.log(`Removed ${removed.count} legacy vehicles without order history.`);

  // 3. Upsert curated fleet
  for (const vehicleData of vehicles) {
    const { vin, ...rest } = vehicleData;
    const vehicle = await prisma.vehicle.upsert({
      where: { vin },
      update: rest,
      create: vehicleData
    });
    console.log(`Seeded vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} [${vehicle.status}]`);
  }

  console.log(`Seeding completed successfully (${vehicles.length} vehicles).`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
