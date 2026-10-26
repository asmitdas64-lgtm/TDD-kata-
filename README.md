# TDD Kata: Car Dealership Inventory System

[![Test Suite](https://img.shields.io/badge/tests-85%20passed%20%7C%200%20failed-brightgreen.svg)]()
[![Backend Coverage](https://img.shields.io/badge/backend%20coverage-95.46%25-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Express%20%7C%20MySQL%20%7C%20Prisma%20%7C%20React%20%7C%20Vite%20%7C%20Tailwind-red.svg)]()
[![TDD](https://img.shields.io/badge/methodology-Test--Driven%20Development%20(Red%E2%86%92Green%E2%86%92Refactor)-crimson.svg)]()

> A full-stack, enterprise-grade automotive dealership platform engineered strictly using **Test-Driven Development (TDD)**. Features atomic inventory transactions, concurrency control, strict role-based access control (RBAC), multi-token catalog search, and a sharp industrial dark-garage user interface.

---

## 1. Project Overview

The **Car Dealership Inventory System** is an end-to-end web application built following disciplined **Red-Green-Refactor** TDD cycles. It manages automotive inventory with transactional guarantees, preventing overselling via database transactions and atomic decrement guards.

### Core Architectural Capabilities
- **Strict TDD Methodology**: Every repository, service, controller, and route was driven by unit and integration tests written *before* implementation code.
- **Transactional Stock Decrement & Concurrency Safety**: Purchases execute within Prisma interactive transactions (`prisma.$transaction`). Stock quantities decrement atomically, and vehicle status transitions to `SOLD` when quantity reaches zero, mitigating race conditions under concurrent checkouts.
- **Role-Based Access Control (RBAC)**: Fine-grained middleware distinguishes between unauthenticated visitors, authenticated `CUSTOMER` collectors, and `ADMIN` inventory managers.
- **Timing Attack Mitigation**: Constant-time dummy bcrypt comparisons prevent username enumeration during failed login attempts.
- **Multi-Token Fleet Search Engine**: Full-text and multi-word tokenized query parser filtering simultaneously across `make`, `model`, and `VIN`, complemented by price boundaries, model year, and inventory status segments.
- **High-End Automotive Editorial UI**: Built with React 19, Tailwind CSS v4, Lucide React, and sharp square-corner styling (`rounded-none` / 0px radius) set against a dark industrial garage backdrop with high-contrast crimson accents.

---

## 2. Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js (ESM, Native `"type": "module"`), Express.js 5 |
| **Database & ORM** | MySQL 8.0 / 8.4, Prisma ORM Client Singleton |
| **Authentication & Security** | JWT (jsonwebtoken), bcryptjs, Helmet, CORS |
| **Validation** | Zod (strict schema parsing on body, params, and query strings) |
| **Testing (Backend)** | Jest, Supertest, Vitest runner support |
| **Frontend Framework** | React 19, Vite 8, React Router DOM v7 |
| **Styling & Icons** | Tailwind CSS v4, Lucide React, Custom Dark Industrial Theme |
| **Testing (Frontend)** | Vitest, React Testing Library, jsdom, jest-dom |

---

## 3. Screenshots of the Application in Action

### 3.1 Showroom Fleet Overview & Integrated Sticky Filter Bar
The showroom displays the curated vehicle fleet over an atmospheric dark industrial garage canvas. The sticky filter bar features microcopy search, status segments, make selector, price sliders, and a reset counter.
![Showroom Fleet Overview](docs/screenshots/showroom_overview.jpg?v=2)

### 3.2 Vehicle Technical Inspection & Spec Matrix
Inspecting a vehicle reveals high-resolution photography, provenance badges, mileage, transmission spec, exterior paint, and stock level.
![Vehicle Detail View](docs/screenshots/vehicle_detail.jpg?v=2)

### 3.3 Transactional Vehicle Acquisition Modal
Authenticated customers trigger the purchase modal. Quantity is constrained to available stock, total consideration recalculates dynamically, and an atomic order is created in MySQL.
![Vehicle Purchase Modal](docs/screenshots/vehicle_purchase.jpg?v=2)

### 3.4 Admin Inventory & Restock Management
Admin managers access a real-time data table displaying VIN, Make, Model, Unit Price, and live stock counts, with inline restock controls and vehicle specification forms.
![Admin Inventory Management](docs/screenshots/admin_inventory.jpg?v=2)

---

## 4. Local Setup & Execution Guide

### 4.1 Prerequisites
- **Node.js**: `v20.x` or `v22.x` or `v24.x`
- **npm**: `v10.x` or higher
- **MySQL Server**: `8.0` or higher running locally on port `3306`
- **Git**

---

### 4.2 Database Configuration (MySQL)

Create the MySQL database if not already present:
```sql
CREATE DATABASE IF NOT EXISTS cardealership CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 4.3 Backend Setup & Execution

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5001
   DATABASE_URL="mysql://root:root@localhost:3306/cardealership"
   JWT_SECRET="replace_with_a_secure_random_at_least_32_char_secret_key"
   JWT_EXPIRES_IN="24h"
   CORS_ORIGIN="http://localhost:5173"
   ```
   *(Adjust username/password in `DATABASE_URL` to match your local MySQL configuration).*

4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
   *(Or `npx prisma migrate dev --name init_mysql_schema`)*

5. Seed the database with the curated 20-vehicle performance fleet and default Administrator account:
   ```bash
   node prisma/seed.js
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be live on `http://localhost:5001`.

---

### 4.4 Frontend Setup & Execution

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be live on `http://localhost:5173`.

---

### 4.5 Seeded Credentials for Testing

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@dealership.com` | `AdminSecure2026!` | Full Admin rights (`/admin/inventory`, restock, vehicle creation) |
| **Customer (Register)** | Self-registered via `/register` | Self-selected | Customer rights (Vehicle purchase, showroom browsing) |

---

## 5. Test Suite & Coverage Report

All test suites were built following strict TDD cycles (test first, fail red, code green, refactor).

### 5.1 Backend Test Results (72 Tests / 20 Test Suites)

```text
PASS tests/unit/auth.middleware.test.js
PASS tests/unit/vehicle.decrement.test.js
PASS tests/unit/vehicle.restock.test.js
PASS tests/unit/order.repository.test.js
PASS tests/unit/vehicle.search.test.js
PASS tests/unit/vehicle.service.search.test.js
PASS tests/unit/vehicle.purchase.test.js
PASS tests/unit/errors.test.js
PASS tests/integration/vehicle.delete.test.js
PASS tests/integration/vehicle.update.test.js
PASS tests/integration/vehicle.create.test.js
PASS tests/integration/vehicle.restock.test.js
PASS tests/integration/health.test.js
PASS tests/integration/vehicle.purchase.test.js
PASS tests/integration/vehicle.get-id.test.js
PASS tests/integration/vehicle.list.test.js
PASS tests/integration/vehicle.search.test.js
PASS tests/integration/auth.me.test.js
PASS tests/integration/auth.register.test.js
PASS tests/integration/auth.login.test.js

Test Suites: 20 passed, 20 total
Tests:       72 passed, 72 total
Snapshots:   0 total
Time:        10.055 s
```

### 5.2 Backend Statement & Branch Coverage

```text
-------------------------|---------|----------|---------|---------|-------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------|---------|----------|---------|---------|-------------------
All files                |   95.46 |    72.19 |     100 |   95.46 |                   
 src                     |     100 |       50 |     100 |     100 |                   
  app.js                 |     100 |       50 |     100 |     100 | 18                
 src/config              |     100 |    66.66 |     100 |     100 |                   
  prisma.js              |     100 |    66.66 |     100 |     100 | 8-11              
 src/controllers         |   95.58 |    63.63 |     100 |   95.58 |                   
  auth.controller.js     |   94.73 |      100 |     100 |   94.73 | 48                
  vehicle.controller.js  |   95.91 |       60 |     100 |   95.91 | 32,47             
 src/errors              |     100 |      100 |     100 |     100 |                   
  app-error.js           |     100 |      100 |     100 |     100 |                   
 src/middlewares         |   97.56 |       95 |     100 |   97.56 |                   
  auth.middleware.js     |   95.83 |    91.66 |     100 |   95.83 | 19                
  error.middleware.js    |     100 |      100 |     100 |     100 |                   
  validate.middleware.js |     100 |      100 |     100 |     100 |                   
 src/repositories        |   95.94 |    67.81 |     100 |   95.94 |                   
  order.repository.js    |     100 |    83.33 |     100 |     100 | 8                 
  user.repository.js     |     100 |    66.66 |     100 |     100 | 26                
  vehicle.repository.js  |   95.08 |    65.27 |     100 |   95.08 | 91,131,135        
 src/routes              |     100 |      100 |     100 |     100 |                   
  auth.routes.js         |     100 |      100 |     100 |     100 |                   
  vehicle.routes.js      |     100 |      100 |     100 |     100 |                   
 src/schemas             |     100 |      100 |     100 |     100 |                   
  auth.schema.js         |     100 |      100 |     100 |     100 |                   
  vehicle.schema.js      |     100 |      100 |     100 |     100 |                   
 src/services            |      92 |    72.36 |     100 |      92 |                   
  auth.service.js        |   93.75 |    76.92 |     100 |   93.75 | 19,92             
  vehicle.service.js     |   91.17 |    71.42 |     100 |   91.17 | 34,38,84-86,161   
-------------------------|---------|----------|---------|---------|-------------------
```

### 5.3 Frontend Test Results (13 Tests / 5 Test Suites)

```text
✓ src/tests/AuthContext.test.jsx (4 tests)
✓ src/tests/VehicleDetail.test.jsx (2 tests)
✓ src/tests/AdminInventory.test.jsx (2 tests)
✓ src/tests/Login.test.jsx (3 tests)
✓ src/tests/VehicleList.test.jsx (2 tests)

Test Files  5 passed (5)
     Tests  13 passed (13)
  Duration  5.14s
```

---

## 6. Mandatory "My AI Usage" Disclosure

In accordance with academic and engineering submission guidelines, this section outlines how artificial intelligence was leveraged during the development lifecycle:

1. **AI Assistants Used**:
   - **Google Antigravity IDE (Gemini 3.8 Flash & Claude Opus 3.5/5.5)**: Used as a pair programmer for generating scaffolding, writing Red-phase test suites, identifying regression edge cases, and designing UI components.

2. **Work Done by AI vs. Developer**:
   - **Test Specification Formulation**: Developer authored the functional requirements and architectural constraints in `docs/TASKS.md` and `docs/API_SPEC.md`. AI synthesized unit test assertions and integration Supertest scenarios.
   - **TDD Enforcement (Red-Green-Refactor)**: Tests were written and verified to fail prior to generating corresponding service, controller, and repository code.
   - **Port Conflict Diagnostic & Resolution**: When the Windows kernel service (`HTTP.sys` / `Microsoft-HTTPAPI/2.0`) intercepted port 5000 with `403 Forbidden`, the AI diagnosed PID 4 via `netstat` and re-routed the backend and Vite proxy configuration cleanly to port 5001.
   - **Asset & UI Direction**: Developer guided the visual requirements toward an industrial dark-garage theme with sharp square corners and vehicle-specific studio imagery. AI generated photorealistic studio assets and implemented Tailwind v4 styles.

3. **Human Auditing & Overrides**:
   - Every file edit and schema modification was reviewed and verified through running test suites (`npm test` in both `backend` and `frontend`).
   - Overrode generic mock vehicle datasets with realistic curated performance cars and verified MySQL foreign key constraints.

4. **Raw Interaction Logs**:
   - Complete, unedited prompt transcripts are documented in [`PROMPTS.md`](./PROMPTS.md).

---

## 7. Project Documentation Index

- [`PROMPTS.md`](./PROMPTS.md) — Raw, unedited user prompts and instructions.
- [`docs/TASKS.md`](./docs/TASKS.md) — Complete breakdown of Phase 1 through Phase 8 deliverables.
- [`docs/API_SPEC.md`](./docs/API_SPEC.md) — REST API specification with Zod payload schemas.
- [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md) — MySQL database schema and relation specifications.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Architectural layers, transactions, and RBAC diagrams.
- [`docs/DECISIONS.md`](./docs/DECISIONS.md) — Architecture Decision Records (ADRs).
- [`docs/TDD_WORKFLOW.md`](./docs/TDD_WORKFLOW.md) — TDD protocols and verification procedures.

---

## 8. License

This project is licensed under the MIT License.
