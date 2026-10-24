# Car Dealership Inventory System

Enterprise full-stack car dealership inventory and purchase management system developed under strict Test-Driven Development (TDD) using modern JavaScript (ES Modules).

## Stack
- **Backend:** Node.js (ESM `"type": "module"`), Express 5, JavaScript, PostgreSQL, Prisma ORM, JWT, bcryptjs, Zod
- **Testing (Backend):** Jest (Node ESM mode) or Node test runner, Supertest
- **Frontend:** React, Vite, JavaScript (JSX), Tailwind CSS
- **Testing (Frontend):** Vitest (native ESM), React Testing Library

## Directory Structure
```
CarDealership/
├── .claude/commands/      # Custom assistant workflows
├── docs/                  # Architecture, specifications, ADRs, tasks
├── backend/               # Express + Prisma + Jest/Supertest (ESM)
│   ├── prisma/            # Schema, migrations, seeds (seed.js)
│   └── src/               # routes, controllers, services, repositories (.js)
└── frontend/              # Vite + React (ESM .jsx/.js) + Vitest + Tailwind
    └── src/               # components, pages, hooks, services (.jsx/.js)
```

## Standard Commands

### Backend (`cd backend`)
- Run Dev: `npm run dev`
- Test: `npm test`
- Test Watch: `npm run test:watch`
- Test Coverage: `npm run test:coverage`
- Lint: `npm run lint`
- DB Migrate: `npx prisma migrate dev`
- DB Seed: `npx prisma db seed`

### Frontend (`cd frontend`)
- Run Dev: `npm run dev`
- Test: `npm test`
- Test Watch: `npm run test:watch`
- Test Coverage: `npm run test:coverage`
- Lint: `npm run lint`

## Non-Negotiable Rules
1. **Strict TDD:** Failing test first (`Red`), minimal code to pass (`Green`), clean up (`Refactor`). Each phase must be a separate git commit.
2. **ES Modules Only:** All files must use native ESM (`import`/`export`, explicit file extensions like `.js` / `.jsx`, `"type": "module"`). Never use `require()` or CommonJS.
3. **Commit Trailer:** Every commit created with AI assistance must conclude with a blank line and:
   `Co-authored-by: Claude <noreply@anthropic.com>`
4. **Protected Files:** Never create, edit, or summarize `PROMPTS.md` (reserved strictly for human use).
5. **Task & Decision Tracking:** Before starting work, consult `docs/TASKS.md` and `docs/DECISIONS.md`. After finishing a task, check off the item in `docs/TASKS.md` and record architectural choices in `docs/DECISIONS.md`.

## Documentation Index
- `docs/ARCHITECTURE.md`: Consult when designing system boundaries, layer responsibilities, or tracing request flows.
- `docs/API_SPEC.md`: Consult when defining or verifying HTTP routes, payload schemas, and response envelopes.
- `docs/DATA_MODEL.md`: Consult when updating Prisma schemas, indexes, model constraints, or seed values.
- `docs/AUTH.md`: Consult when implementing security policies, tokens, hashing, or role middlewares.
- `docs/TDD_WORKFLOW.md`: Consult for commit cycles, testing conventions, and coverage rules.
- `docs/CODING_STANDARDS.md`: Consult for code conventions, error classes, and validation structures.
- `docs/TASKS.md`: Consult for execution order, current progress, and task scope.
- `docs/DECISIONS.md`: Consult for ADR history and architectural rationale.
- `docs/AI_USAGE_LOG.md`: Consult when logging AI-driven modifications and overrides.
