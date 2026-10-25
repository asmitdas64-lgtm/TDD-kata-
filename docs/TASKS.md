# Granular TDD Backlog

Legend:
- `[ ]` Not started
- `[x]` Completed
- Each checkbox corresponds to an atomic Red-Green-Refactor cycle.
- Native ES Modules (`.js`, `.jsx`, `"type": "module"`).

---

## Phase 1: Tooling & Infrastructure Setup
- [x] Task 1.1: Backend environment & ESM configuration (`backend/package.json`, `backend/.env.example`)
- [x] Task 1.2: Prisma configuration & database connection setup (`backend/prisma/schema.prisma`, `backend/src/config/prisma.js`)
- [x] Task 1.3: Central error handling & AppError hierarchy (`backend/src/errors/app-error.js`, `backend/src/middlewares/error.middleware.js`, `backend/tests/unit/errors.test.js`)
- [x] Task 1.4: Base Express application bootstrapping with security headers & logger (`backend/src/app.js`, `backend/src/server.js`, `backend/tests/integration/health.test.js`)

---

## Phase 2: Database Schema & Migration
- [x] Task 2.1: Implement User, Vehicle, and Order models in Prisma (`backend/prisma/schema.prisma`)
- [ ] Task 2.2: Apply initial migration with check constraints (`backend/prisma/migrations/`)
- [ ] Task 2.3: Implement database seed script in ESM with admin user and 10 vehicles (`backend/prisma/seed.js`)

---

## Phase 3: Authentication Domain
- [ ] Task 3.1: User registration schema & repository (`backend/src/schemas/auth.schema.js`, `backend/src/repositories/user.repository.js`, `backend/tests/unit/user.repository.test.js`)
- [ ] Task 3.2: User registration service with password hashing (`backend/src/services/auth.service.js`, `backend/tests/unit/auth.service.test.js`)
- [ ] Task 3.3: User registration route & controller (`backend/src/controllers/auth.controller.js`, `backend/src/routes/auth.routes.js`, `backend/tests/integration/auth.register.test.js`)
- [ ] Task 3.4: User login logic & timing attack mitigation (`backend/src/services/auth.service.js`, `backend/tests/unit/auth.login.test.js`)
- [ ] Task 3.5: User login route & JWT issuance (`backend/src/controllers/auth.controller.js`, `backend/tests/integration/auth.login.test.js`)
- [ ] Task 3.6: Current user `/api/auth/me` endpoint (`backend/src/controllers/auth.controller.js`, `backend/tests/integration/auth.me.test.js`)
- [ ] Task 3.7: Authentication & RBAC middlewares (`backend/src/middlewares/auth.middleware.js`, `backend/tests/unit/auth.middleware.test.js`)

---

## Phase 4: Vehicle Inventory CRUD
- [ ] Task 4.1: Vehicle repository find & create operations (`backend/src/repositories/vehicle.repository.js`, `backend/tests/unit/vehicle.repository.test.js`)
- [ ] Task 4.2: Vehicle creation service with VIN uniqueness check (`backend/src/services/vehicle.service.js`, `backend/tests/unit/vehicle.service.create.test.js`)
- [ ] Task 4.3: POST `/api/vehicles` endpoint with admin authorization guard (`backend/src/controllers/vehicle.controller.js`, `backend/src/routes/vehicle.routes.js`, `backend/tests/integration/vehicle.create.test.js`)
- [ ] Task 4.4: GET `/api/vehicles` paginated listing (`backend/src/services/vehicle.service.js`, `backend/src/controllers/vehicle.controller.js`, `backend/tests/integration/vehicle.list.test.js`)
- [ ] Task 4.5: GET `/api/vehicles/:id` retrieve by ID (`backend/src/controllers/vehicle.controller.js`, `backend/tests/integration/vehicle.get-id.test.js`)
- [ ] Task 4.6: PUT `/api/vehicles/:id` update vehicle with admin authorization (`backend/src/services/vehicle.service.js`, `backend/tests/integration/vehicle.update.test.js`)
- [ ] Task 4.7: DELETE `/api/vehicles/:id` delete vehicle with admin authorization (`backend/src/services/vehicle.service.js`, `backend/tests/integration/vehicle.delete.test.js`)

---

## Phase 5: Search & Filter Logic
- [ ] Task 5.1: Search query builder repository implementation (`backend/src/repositories/vehicle.repository.js`, `backend/tests/unit/vehicle.search.test.js`)
- [ ] Task 5.2: Search vehicle service orchestrator (`backend/src/services/vehicle.service.js`, `backend/tests/unit/vehicle.service.search.test.js`)
- [ ] Task 5.3: GET `/api/vehicles/search` route registered prior to `:id` route (`backend/src/routes/vehicle.routes.js`, `backend/tests/integration/vehicle.search.test.js`)

---

## Phase 6: Inventory Operations (Purchase & Restock)
- [ ] Task 6.1: Atomic stock decrement repository method (`backend/src/repositories/vehicle.repository.js`, `backend/tests/unit/vehicle.decrement.test.js`)
- [ ] Task 6.2: Order repository creation method (`backend/src/repositories/order.repository.js`, `backend/tests/unit/order.repository.test.js`)
- [ ] Task 6.3: Purchase vehicle transaction service with out-of-stock guard (`backend/src/services/vehicle.service.js`, `backend/tests/unit/vehicle.purchase.test.js`)
- [ ] Task 6.4: POST `/api/vehicles/:id/purchase` route & integration test (`backend/src/controllers/vehicle.controller.ts`, `backend/tests/integration/vehicle.purchase.test.js`)
- [ ] Task 6.5: Restock vehicle service logic (`backend/src/services/vehicle.service.js`, `backend/tests/unit/vehicle.restock.test.js`)
- [ ] Task 6.6: POST `/api/vehicles/:id/restock` route with admin guard (`backend/src/controllers/vehicle.controller.js`, `backend/tests/integration/vehicle.restock.test.js`)

---

## Phase 7: Frontend Application & State Management
- [ ] Task 7.1: Vite + React + Tailwind setup & API client configuration (`frontend/vite.config.js`, `frontend/src/api/client.js`)
- [ ] Task 7.2: Auth context & token storage (`frontend/src/context/AuthContext.jsx`, `frontend/src/hooks/useAuth.js`, `frontend/src/tests/AuthContext.test.jsx`)
- [ ] Task 7.3: Login & Register pages with validation (`frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/tests/Login.test.jsx`)
- [ ] Task 7.4: Vehicle catalog listing & filter components (`frontend/src/pages/VehicleListPage.jsx`, `frontend/src/components/vehicles/VehicleCard.jsx`, `frontend/src/tests/VehicleList.test.jsx`)
- [ ] Task 7.5: Vehicle detail view & purchase modal action (`frontend/src/pages/VehicleDetailPage.jsx`, `frontend/src/tests/VehicleDetail.test.jsx`)
- [ ] Task 7.6: Admin inventory management dashboard & restock controls (`frontend/src/pages/AdminInventoryPage.jsx`, `frontend/src/tests/AdminInventory.test.jsx`)

---

## Phase 8: Final Auditing, Documentation & Verification
- [ ] Task 8.1: Full system integration test suite execution (`backend/tests/integration/full-flow.test.js`)
- [ ] Task 8.2: Service coverage verification to ensure >= 90% threshold (`backend/package.json`)
- [ ] Task 8.3: Final update to `docs/DECISIONS.md` and `docs/TASKS.md`
