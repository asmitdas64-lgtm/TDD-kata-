import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Administrator User
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

  // 2. Seed 10 Realistic Vehicles (Diverse makes, models, prices, quantities > 0)
  const vehicles = [
    {
      vin: '1HGCR2F83HA100001',
      make: 'Honda',
      model: 'Accord EX-L',
      year: 2022,
      price: 27999.00,
      mileage: 22400,
      color: 'Platinum White',
      status: 'AVAILABLE',
      quantity: 3
    },
    {
      vin: '4T1B11HK5JU200002',
      make: 'Toyota',
      model: 'Camry SE',
      year: 2023,
      price: 29450.00,
      mileage: 11200,
      color: 'Midnight Black',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '1FA6P8CF5H5300003',
      make: 'Ford',
      model: 'Mustang GT',
      year: 2021,
      price: 38500.00,
      mileage: 18900,
      color: 'Race Red',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: 'WAUZZZF45KA400004',
      make: 'Audi',
      model: 'A4 Premium Plus',
      year: 2022,
      price: 35200.00,
      mileage: 26100,
      color: 'Ibis White',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: 'WBA33AY05N5500005',
      make: 'BMW',
      model: '330i xDrive',
      year: 2023,
      price: 42900.00,
      mileage: 9800,
      color: 'Portimao Blue',
      status: 'AVAILABLE',
      quantity: 4
    },
    {
      vin: '5YJ3E1EB2MF600006',
      make: 'Tesla',
      model: 'Model 3 Long Range',
      year: 2021,
      price: 33500.00,
      mileage: 34200,
      color: 'Pearl White',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: 'JM1BPAPL6K1700007',
      make: 'Mazda',
      model: 'CX-5 Grand Touring',
      year: 2020,
      price: 23800.00,
      mileage: 45600,
      color: 'Soul Red Crystal',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: 'KM8K12AA9NU800008',
      make: 'Hyundai',
      model: 'Tucson SEL',
      year: 2022,
      price: 26400.00,
      mileage: 19300,
      color: 'Amazon Gray',
      status: 'AVAILABLE',
      quantity: 3
    },
    {
      vin: '1G1YY2D78L5900009',
      make: 'Chevrolet',
      model: 'Corvette Stingray',
      year: 2020,
      price: 68900.00,
      mileage: 12000,
      color: 'Torch Red',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: 'JN1AZ4EH9KM100010',
      make: 'Nissan',
      model: 'Rogue SV',
      year: 2021,
      price: 22950.00,
      mileage: 38700,
      color: 'Gun Metallic',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '1G1YY2D78L5900011',
      make: 'Porsche',
      model: '911 Carrera',
      year: 2023,
      price: 114500.00,
      mileage: 5300,
      color: 'Gentian Blue Metallic',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: '2T2BZMCA4NC100012',
      make: 'Lexus',
      model: 'RX 350 F Sport',
      year: 2022,
      price: 46800.00,
      mileage: 21500,
      color: 'Eminent White Pearl',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: 'SALWR2V45MA100013',
      make: 'Land Rover',
      model: 'Defender 110',
      year: 2022,
      price: 58900.00,
      mileage: 28400,
      color: 'Pangea Green',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: '1C4HJXDG5MW100014',
      make: 'Jeep',
      model: 'Wrangler Rubicon',
      year: 2021,
      price: 43200.00,
      mileage: 31000,
      color: 'Firecracker Red',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '5UXCR6C05N9100015',
      make: 'BMW',
      model: 'X5 xDrive40i',
      year: 2023,
      price: 64500.00,
      mileage: 14200,
      color: 'Carbon Black',
      status: 'AVAILABLE',
      quantity: 3
    },
    {
      vin: 'WDDZF4KB5LA100016',
      make: 'Mercedes-Benz',
      model: 'C 300 4MATIC',
      year: 2022,
      price: 39800.00,
      mileage: 23100,
      color: 'Obsidian Black',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '1FTFW1ED4N1100017',
      make: 'Ford',
      model: 'F-150 Lightning Lariat',
      year: 2023,
      price: 69900.00,
      mileage: 8700,
      color: 'Antimatter Blue',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '4S4BRBNC5N3100018',
      make: 'Subaru',
      model: 'Outback Touring XT',
      year: 2022,
      price: 34500.00,
      mileage: 27800,
      color: 'Autumn Green',
      status: 'AVAILABLE',
      quantity: 3
    },
    {
      vin: '5NMS24AL5PH100019',
      make: 'Hyundai',
      model: 'Ioniq 5 Limited',
      year: 2023,
      price: 44200.00,
      mileage: 12500,
      color: 'Digital Teal',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '3VW517AU4PM100020',
      make: 'Volkswagen',
      model: 'Golf GTI SE',
      year: 2022,
      price: 31400.00,
      mileage: 19800,
      color: 'Kings Red Metallic',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: 'WP0AB2A95NS100021',
      make: 'Porsche',
      model: 'Macan GTS',
      year: 2023,
      price: 82500.00,
      mileage: 9400,
      color: 'Volcano Grey Metallic',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: 'YV4ED3UK5N1100022',
      make: 'Volvo',
      model: 'XC90 Recharge Ultimate',
      year: 2023,
      price: 68900.00,
      mileage: 15600,
      color: 'Crystal White',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: 'KNDCC3LG5P5100023',
      make: 'Kia',
      model: 'EV6 GT-Line',
      year: 2023,
      price: 45700.00,
      mileage: 16200,
      color: 'Steel Matte Gray',
      status: 'AVAILABLE',
      quantity: 2
    },
    {
      vin: '1G1FX6S05N4100024',
      make: 'Chevrolet',
      model: 'Tahoe Premier',
      year: 2022,
      price: 62400.00,
      mileage: 33500,
      color: 'Summit White',
      status: 'AVAILABLE',
      quantity: 1
    },
    {
      vin: '3N1AB8CV5NY100025',
      make: 'Nissan',
      model: 'Sentra SR',
      year: 2021,
      price: 19800.00,
      mileage: 41200,
      color: 'Electric Blue',
      status: 'AVAILABLE',
      quantity: 3
    }
  ];

  for (const vehicleData of vehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { vin: vehicleData.vin },
      update: {
        price: vehicleData.price,
        mileage: vehicleData.mileage,
        quantity: vehicleData.quantity,
        status: vehicleData.status
      },
      create: vehicleData
    });
    console.log(`Seeded vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
