# API Specification Contract

All endpoints adhere to the unified JSON API response envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```
Error envelope:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Vehicle with id '123' was not found",
    "details": []
  }
}
```

> **Routing Precedence Warning:** `/api/vehicles/search` **MUST** be mounted prior to `/api/vehicles/:id` in `src/routes/vehicle.routes.js` to prevent Express from capturing the literal string `"search"` as an `:id` parameter.

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth Required:** None (Public)
- **Role:** All newly registered users are assigned `CUSTOMER`. `ADMIN` creation via this endpoint is strictly blocked.
- **Request Body (Zod Schema in `src/schemas/auth.schema.js`):**
  ```javascript
  import { z } from 'zod';

  export const registerSchema = z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
      name: z.string().min(2).max(100)
    })
  });
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "cuid_user_1",
          "email": "customer@example.com",
          "name": "Jane Doe",
          "role": "CUSTOMER",
          "createdAt": "2026-10-24T00:00:00.000Z"
        },
        "token": "eyJhbGciOi..."
      },
      "error": null
    }
    ```
  - `400 Bad Request`: Validation failure (weak password, invalid email format).
  - `409 Conflict`: `USER_ALREADY_EXISTS` (email already in use).

### 1.2 Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth Required:** None (Public)
- **Request Body (Zod Schema):**
  ```javascript
  export const loginSchema = z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1)
    })
  });
  ```
- **Responses:**
  - `200 OK`: Returns authenticated user profile and token.
  - `400 Bad Request`: Payload validation errors.
  - `401 Unauthorized`: `INVALID_CREDENTIALS`.

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Auth Required:** Yes (`Bearer <token>` or HTTP-only Cookie)
- **Responses:**
  - `200 OK`: Returns active user data in `data.user`.
  - `401 Unauthorized`: Missing or invalid token.

---

## 2. Vehicle Management Endpoints

### 2.1 Search Vehicles (Mounted Before `:id`)
- **Method:** `GET`
- **Path:** `/api/vehicles/search`
- **Auth Required:** None (Public)
- **Query Parameters (Zod Schema in `src/schemas/vehicle.schema.js`):**
  ```javascript
  export const searchVehicleSchema = z.object({
    query: z.object({
      q: z.string().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
      minYear: z.coerce.number().int().min(1900).optional(),
      maxYear: z.coerce.number().int().max(2100).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      status: z.enum(["AVAILABLE", "SOLD"]).optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20)
    })
  });
  ```
- **Responses:**
  - `200 OK`: Paginated list of vehicles matching filters.
  - `400 Bad Request`: Invalid filter types.

### 2.2 List Vehicles
- **Method:** `GET`
- **Path:** `/api/vehicles`
- **Auth Required:** None (Public)
- **Query Parameters (Zod):**
  ```javascript
  export const listVehicleSchema = z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z.enum(["AVAILABLE", "SOLD"]).optional()
    })
  });
  ```
- **Responses:**
  - `200 OK`: Paginated vehicle list wrapped in standard envelope.

### 2.3 Get Vehicle by ID
- **Method:** `GET`
- **Path:** `/api/vehicles/:id`
- **Auth Required:** None (Public)
- **URL Parameters (Zod):**
  ```javascript
  export const getVehicleParamsSchema = z.object({
    params: z.object({
      id: z.string().min(1)
    })
  });
  ```
- **Responses:**
  - `200 OK`: Single vehicle record in `data`.
  - `404 Not Found`: `RESOURCE_NOT_FOUND`.

### 2.4 Create Vehicle
- **Method:** `POST`
- **Path:** `/api/vehicles`
- **Auth Required:** Yes
- **Role Required:** `ADMIN`
- **Request Body (Zod):**
  ```javascript
  export const createVehicleSchema = z.object({
    body: z.object({
      vin: z.string().length(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/),
      make: z.string().min(1).max(50),
      model: z.string().min(1).max(50),
      year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
      price: z.number().positive(),
      mileage: z.number().int().nonnegative(),
      color: z.string().min(1).max(30),
      quantity: z.number().int().nonnegative().default(1),
      status: z.enum(["AVAILABLE", "SOLD"]).default("AVAILABLE")
    })
  });
  ```
- **Responses:**
  - `201 Created`: Created vehicle object.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Missing or invalid credentials.
  - `403 Forbidden`: Non-admin access.
  - `409 Conflict`: `DUPLICATE_VIN`.

### 2.5 Update Vehicle
- **Method:** `PUT`
- **Path:** `/api/vehicles/:id`
- **Auth Required:** Yes
- **Role Required:** `ADMIN`
- **Responses:**
  - `200 OK`: Updated vehicle record.
  - `400 Bad Request`: Validation error.
  - `403 Forbidden`: Non-admin access.
  - `404 Not Found`: Target vehicle not found.

### 2.6 Delete Vehicle
- **Method:** `DELETE`
- **Path:** `/api/vehicles/:id`
- **Auth Required:** Yes
- **Role Required:** `ADMIN`
- **Responses:**
  - `200 OK`: Confirmation envelope.
  - `403 Forbidden`: Non-admin access.
  - `404 Not Found`: Vehicle not found.

---

## 3. Inventory Operations

### 3.1 Purchase Vehicle
- **Method:** `POST`
- **Path:** `/api/vehicles/:id/purchase`
- **Auth Required:** Yes
- **Role Required:** `CUSTOMER` or `ADMIN`
- **Responses:**
  - `200 OK`: `{ "success": true, "data": { "orderId": "...", "vehicle": { ... } }, "error": null }`
  - `400 Bad Request`: `OUT_OF_STOCK`.
  - `401 Unauthorized`: Unauthenticated.
  - `404 Not Found`: Vehicle does not exist.

### 3.2 Restock Vehicle
- **Method:** `POST`
- **Path:** `/api/vehicles/:id/restock`
- **Auth Required:** Yes
- **Role Required:** `ADMIN`
- **Request Body (Zod):**
  ```javascript
  export const restockVehicleSchema = z.object({
    body: z.object({
      amount: z.number().int().positive()
    }),
    params: z.object({
      id: z.string().min(1)
    })
  });
  ```
- **Responses:**
  - `200 OK`: Updated vehicle record with increased stock.
  - `400 Bad Request`: Invalid amount.
  - `403 Forbidden`: Non-admin access.
  - `404 Not Found`: Vehicle not found.
