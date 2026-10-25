# AI Usage & Modification Log

This document tracks all AI-assisted prompt cycles, code generations, architectural interventions, and human overrides applied during the development of **TDD Kata: Car Dealership Inventory System**.

---

## Chronological AI Activity Matrix

| Date | Phase / Milestone | AI Engine | Prompt / Task Summary | Actions Taken | Modifications & Overrides Applied |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-10-25** | Baseline Setup | Gemini 3.8 Flash | Project foundation and docs scaffolding | Setup repo structure, guidelines, and context docs | Defined strict ESM and native JS constraints. |
| **2026-10-25** | DB Migration | Gemini 3.8 Flash | Full Postgres to MySQL migration | Migrated Prisma schema, database connection URLs, seeds, and documentation to MySQL 8.0 | Adjusted types from PostgreSQL-specific enums/UUIDs to MySQL utf8mb4 and native constraints. |
| **2026-10-25** | Phase 3: Auth | Gemini 3.8 Flash | Implement authentication domain (Tasks 3.1–3.7) | Built password hashing, JWT issue/verify, timing attack mitigation, and auth/RBAC middlewares | Tested timing-attack mitigation with dummy bcrypt comparisons. |
| **2026-10-25** | Phase 4: CRUD | Gemini 3.8 Flash | Vehicle inventory CRUD operations (Tasks 4.1–4.7) | Built Zod vehicle schemas, repository, service layer, admin-guarded routes, and Supertest integration suites | Ensured unique VIN checks return 409 Conflict. |
| **2026-10-25** | Phase 5: Search | Gemini 3.8 Flash | Search and filter logic with pagination (Tasks 5.1–5.3) | Built repository query builder, search service, registered `/search` before `/:id` | Enforced strict Express route precedence. |
| **2026-10-25** | Phase 6: Inventory | Gemini 3.8 Flash | Inventory operations: purchase & restock (Tasks 6.1–6.6) | Implemented transactional stock decrement, Order repository, restock endpoint, and race condition tests | Wrapped purchase inside interactive `prisma.$transaction`. |
| **2026-10-25** | Phase 7: Frontend | Gemini 3.8 Flash | Frontend app with sharp dark automotive theme (Tasks 7.1–7.6) | Scaffolding Vite + React + Tailwind v4 app, AuthContext, showroom, purchase modal, and admin controls | Enforced sharp square borders (`rounded-none` / 0px radius) across all components. |
| **2026-10-25** | Port Conflict Resolution | Gemini 3.8 Flash | Diagnose 403 Forbidden on `/api/vehicles` | Diagnosed PID 4 (Windows `HTTP.sys`) occupying port 5000 and rerouted backend & proxy to port 5001 | Updated `.env`, `server.js`, and `vite.config.js` to 5001; verified 200 OK. |
| **2026-10-25** | Visual & Catalog Polish | Claude Opus 5.5 & Gemini 3.8 Flash | Redesign UI with garage aesthetic, accurate imagery, and filter experience | Generated photorealistic studio assets, expanded curated fleet to 20 performance vehicles, tokenized search parser | Updated branding to "TDD Kata: Car Dealership Inventory System". |
| **2026-10-25** | Deliverables & Audit | Gemini 3.8 Flash | Generate comprehensive README, PROMPTS.md, and test reports | Extracted raw transcripts into `PROMPTS.md`, authored complete `README.md`, verified coverage and test suites | Full test suite passed (72 backend + 13 frontend). |

---

## Raw Chat Logs
For the complete, unedited, verbatim user prompts, refer to [`PROMPTS.md`](../PROMPTS.md) located at the root of this repository.
