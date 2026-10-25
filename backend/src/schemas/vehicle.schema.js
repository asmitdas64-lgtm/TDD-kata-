import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    vin: z
      .string()
      .trim()
      .length(17, 'VIN must be exactly 17 characters')
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format'),
    make: z.string().trim().min(1, 'Make is required').max(50),
    model: z.string().trim().min(1, 'Model is required').max(50),
    year: z
      .number()
      .int()
      .min(1900, 'Year must be 1900 or later')
      .max(new Date().getFullYear() + 1, 'Year cannot be in the far future'),
    price: z.coerce.number().positive('Price must be greater than zero'),
    mileage: z.coerce.number().int().nonnegative('Mileage cannot be negative'),
    color: z.string().trim().min(1, 'Color is required').max(30),
    quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative').default(1),
    status: z.enum(['AVAILABLE', 'SOLD']).default('AVAILABLE')
  })
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required')
  }),
  body: z
    .object({
      vin: z
        .string()
        .trim()
        .length(17, 'VIN must be exactly 17 characters')
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format')
        .optional(),
      make: z.string().trim().min(1).max(50).optional(),
      model: z.string().trim().min(1).max(50).optional(),
      year: z
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
      price: z.coerce.number().positive().optional(),
      mileage: z.coerce.number().int().nonnegative().optional(),
      color: z.string().trim().min(1).max(30).optional(),
      quantity: z.coerce.number().int().nonnegative().optional(),
      status: z.enum(['AVAILABLE', 'SOLD']).optional()
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field must be provided for update'
    })
});

export const listVehicleSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    make: z.string().trim().optional(),
    model: z.string().trim().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    status: z.enum(['AVAILABLE', 'SOLD']).optional()
  })
});

export const getVehicleParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Vehicle ID is required')
  })
});
