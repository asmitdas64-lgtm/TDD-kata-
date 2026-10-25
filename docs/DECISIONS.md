# Architectural Decision Records (ADRs)

## ADR 001: Adoption of Native ES Modules (JavaScript) Across Full Stack
- **Date:** 2026-10-24
- **Status:** Accepted (Supercedes TypeScript decision)
- **Decision:** Standardize on modern JavaScript using native ECMAScript Modules (`"type": "module"`, `import`/`export`, `.js` and `.jsx` extensions) across backend and frontend. Remove all TypeScript compilers, `ts-node`, and `@types/*` dependencies.
- **Context & Drivers:** The user directed a pivot to pure modern JavaScript to eliminate compilation layers and overhead while retaining runtime guarantees.
- **Consequences:** Eliminates transpile/build steps on the backend; all runtime boundary assertions rely on Zod schemas and comprehensive TDD coverage. Explicit file extensions (`.js`) are mandatory in all relative imports.
- **Alternatives Considered:** TypeScript (originally planned, deprecated per architectural direction), CommonJS (rejected for legacy semantics).

---

## ADR 002: Backend Web Framework - Express 5
- **Date:** 2026-10-24
- **Status:** Accepted
- **Decision:** Utilize Express 5 as the core HTTP routing framework.
- **Context & Drivers:** Express 5 natively handles rejected promises and async route handler exceptions without requiring manual `asyncHandler` wrappers, while preserving the mature ecosystem of middleware (`helmet`, `cors`, `rate-limit`).
- **Consequences:** Native async error propagation to centralized error middleware.
- **Alternatives Considered:** Fastify, NestJS.

---

## ADR 003: Persistence & ORM - Prisma with MySQL
- **Date:** 2026-10-24
- **Status:** Accepted
- **Decision:** Use MySQL as the relational database and Prisma (`@prisma/client`) as the query abstraction.
- **Context & Drivers:** Need strict relational integrity, transactional guarantees for inventory decrements, and clean schema definitions via `schema.prisma`.
- **Consequences:** Clean schema modeling and migrations; seed scripts authored in ESM (`prisma/seed.js`); raw SQL migrations used for DB-level check constraints (`CHECK (quantity >= 0)`).
- **Alternatives Considered:** Drizzle, Sequelize.

---

## ADR 004: Relational Database - MySQL
- **Date:** 2026-10-24
- **Status:** Accepted
- **Decision:** Use MySQL for relational storage.
- **Context & Drivers:** Transactional safety (ACID), support for row-level locking, check constraints (MySQL 8.0.16+), and high concurrent read/write stability.
- **Consequences:** Requires running MySQL instance (default port 3306) or Docker container for integration tests.
- **Alternatives Considered:** PostgreSQL, SQLite, MongoDB.

---

## ADR 005: Frontend Architecture - React with Vite and Tailwind CSS
- **Date:** 2026-10-24
- **Status:** Accepted
- **Decision:** Build the client single-page application using React with JSX (`.jsx`), bundled via Vite (`vite.config.js`), styled with Tailwind CSS.
- **Context & Drivers:** Vite natively handles ESM and JSX with instant Hot Module Replacement (HMR).
- **Consequences:** Rapid UI development and clean component encapsulation with zero TypeScript overhead.
- **Alternatives Considered:** Next.js, Create React App.

---

## ADR 006: Testing Strategy - Jest/Supertest (Backend ESM) & Vitest/RTL (Frontend ESM)
- **Date:** 2026-10-24
- **Status:** Accepted
- **Decision:** Use Jest (with `NODE_OPTIONS=--experimental-vm-modules`) and Supertest for backend unit/integration tests; use Vitest with React Testing Library for frontend component tests.
- **Context & Drivers:** Vitest is natively ESM-first for Vite applications. Jest provides a rock-solid mock and integration environment with Supertest.
- **Consequences:** Both test runners run natively with ES module syntax.
- **Alternatives Considered:** Node test runner (`node:test`).
