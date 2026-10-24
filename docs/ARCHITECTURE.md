# System Architecture

## 1. Architectural Style & Layered Decoupling

The backend follows a strictly layered, decoupled architecture with unidirectional data flow written in modern JavaScript (ES Modules):
```
HTTP Request
     │
     ▼
[ Routes / Transport ]        ──> Express Routers, Route-level middleware, Zod validation
     │
     ▼
[ Controllers ]              ──> HTTP transport abstraction, parse params, format response envelope
     │
     ▼
[ Services / Domain ]        ──> Pure business logic, domain invariants, orchestration, transactions
     │
     ▼
[ Repositories ]             ──> Data access layer, query isolation, persistence operations
     │
     ▼
[ Data Access / Prisma ]     ──> Prisma client (@prisma/client), connection pool, PostgreSQL
```

### Layer Responsibilities
- **Routes (`src/routes/`):** Define endpoints, associate HTTP methods, mount authentication/authorization middleware, and execute request validation schemas before handing off to controllers.
- **Controllers (`src/controllers/`):** Purely handle HTTP transport concerns. Extract headers, params, query strings, and validated body data; delegate to services; determine HTTP status codes; and serialize responses via the standard API envelope. No domain rules or database queries exist here.
- **Services (`src/services/`):** Core enterprise business logic. Enforce domain invariants (e.g., verifying stock availability, state transitions between `AVAILABLE` and `SOLD`, transaction coordination). Independent of Express or HTTP primitives.
- **Repositories (`src/repositories/`):** Encapsulate persistence logic. All Prisma interactions, raw queries, or transaction clients run exclusively within this layer to allow mocking and isolation in unit tests.
- **Data Access (`src/config/prisma.js`):** Manages database connection pooling, lifecycle hooks, and client configuration.

---

## 2. SOLID Principles Across Layers (ES Modules)

- **Single Responsibility Principle (SRP):**
  - Route files strictly map paths to handlers.
  - Controllers only translate HTTP to domain arguments and back.
  - Services only execute business logic.
  - Repositories only communicate with the persistence engine.
- **Open/Closed Principle (OCP):**
  - Business operations and validation pipelines are extensible via middleware composition without modifying core handler code.
  - New filter criteria in inventory search can be introduced through repository query builder extensions.
- **Liskov Substitution Principle (LSP):**
  - Service classes rely on repository contracts/abstractions, allowing test doubles, in-memory repositories, or alternative database adapters to substitute seamlessly.
- **Interface Segregation Principle (ISP):**
  - Repositories and services expose focused, cohesive method interfaces without forcing consumers to depend on unused operations.
- **Dependency Inversion Principle (DIP):**
  - High-level modules (Services) depend on abstractions, and dependencies (like repositories) are injected via constructor arguments rather than hardcoded global singletons.

---

## 3. Project Directory Structure

```
CarDealership/
├── .claude/
│   └── commands/
│       ├── commit.md
│       └── next-task.md
├── docs/
│   ├── AI_USAGE_LOG.md
│   ├── API_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── AUTH.md
│   ├── CODING_STANDARDS.md
│   ├── DATA_MODEL.md
│   ├── DECISIONS.md
│   ├── TASKS.md
│   └── TDD_WORKFLOW.md
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   └── prisma.js
│   │   ├── constants/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── vehicle.controller.js
│   │   ├── errors/
│   │   │   ├── app-error.js
│   │   │   └── error-codes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── rate-limiter.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── repositories/
│   │   │   ├── order.repository.js
│   │   │   ├── user.repository.js
│   │   │   └── vehicle.repository.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── index.js
│   │   │   └── vehicle.routes.js
│   │   ├── schemas/
│   │   │   ├── auth.schema.js
│   │   │   └── vehicle.schema.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── order.service.js
│   │   │   └── vehicle.service.js
│   │   ├── utils/
│   │   │   ├── api-response.js
│   │   │   ├── logger.js
│   │   │   └── token.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.api.js
│   │   │   ├── client.js
│   │   │   └── vehicle.api.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── vehicles/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useVehicles.js
│   │   ├── pages/
│   │   │   ├── AdminInventoryPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── VehicleDetailPage.jsx
│   │   │   └── VehicleListPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vitest.config.js
├── .env.example
├── .gitignore
└── CLAUDE.md
```

---

## 4. End-to-End Request Lifecycle: Purchase Operation

Below is the execution flow for `POST /api/vehicles/:id/purchase`:

```
Client (Customer)
      │
      │ 1. POST /api/vehicles/c123/purchase (Bearer Token)
      ▼
[ Express Router (src/routes/vehicle.routes.js) ]
      │
      │ 2. Pipeline: authenticate -> validate(purchaseVehicleSchema)
      ▼
[ Authentication Middleware (src/middlewares/auth.middleware.js) ]
      │ 3. Verifies JWT signature, decodes payload (sub=user_id, role=CUSTOMER)
      │ 4. Attaches req.user = { id, email, role }
      ▼
[ Request Validation Middleware (src/middlewares/validate.middleware.js) ]
      │ 5. Validates id in params via Zod
      ▼
[ Vehicle Controller (src/controllers/vehicle.controller.js) ]
      │ 6. Extracts vehicleId = req.params.id, userId = req.user.id
      │ 7. Calls vehicleService.purchaseVehicle(vehicleId, userId)
      ▼
[ Vehicle Service (src/services/vehicle.service.js) ]
      │ 8. Enforces business rules:
      │    - Check stock availability (quantity > 0)
      │    - Executes inside a database transaction:
      │       a. Calls vehicleRepository.decrementStock(id, tx)
      │       b. If remaining quantity == 0, updates status to SOLD
      │       c. Calls orderRepository.createOrder({ vehicleId, userId, price }, tx)
      ▼
[ Repositories (src/repositories/vehicle.repository.js & order.repository.js) ]
      │ 9. Executes parameterized SQL through Prisma Client:
      │    UPDATE "Vehicle" SET quantity = quantity - 1 WHERE id = $1 AND quantity > 0
      │    INSERT INTO "Order" (...) VALUES (...)
      ▼
[ PostgreSQL Database ]
      │ 10. Commits row-level transaction atomically
      ▲
[ Response Unwinding ]
      │ 11. Repositories return updated vehicle & created order record
      │ 12. Service constructs domain result object
      │ 13. Controller maps domain model into standardized API envelope:
      │     { "success": true, "data": { ... }, "error": null }
      │ 14. Controller sends HTTP 200 OK
      ▼
Client receives confirmation
```
