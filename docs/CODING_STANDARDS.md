# Enterprise Coding Standards

## 1. Naming Conventions & Module Formats

- **Native ES Modules:** `"type": "module"` in `package.json`. Use standard `import` and `export` statements. All relative import paths **MUST** include the file extension (e.g. `import { AppError } from '../errors/app-error.js';`).
- **No TypeScript Compilers:** Pure modern JavaScript. Do not install `typescript`, `ts-node`, or `@types/*` packages.

| Artifact | Convention | Example |
| :--- | :--- | :--- |
| **Backend JS Files** | `kebab-case.js` | `vehicle.controller.js`, `auth.middleware.js` |
| **Frontend Components** | `PascalCase.jsx` | `VehicleCard.jsx`, `LoginPage.jsx` |
| **Frontend Utilities** | `kebab-case.js` or `camelCase.js` | `client.js`, `useAuth.js` |
| **Classes / Constructors** | `PascalCase` | `VehicleService`, `VehicleRepository` |
| **Functions / Methods / Variables** | `camelCase` | `purchaseVehicle`, `userEmail`, `isAvailable` |
| **Constants / Enums** | `UPPER_SNAKE_CASE` | `DEFAULT_PAGE_SIZE`, `ROLES.ADMIN` |
| **Database Tables** | `PascalCase` (Prisma) | `User`, `Vehicle`, `Order` |
| **Database Columns** | `camelCase` | `createdAt`, `passwordHash` |

---

## 2. Centralized Error Handling

All operational exceptions inherit from the standard `AppError` class:

```javascript
// src/errors/app-error.js
export class AppError extends Error {
  constructor(code, statusCode, message, details = []) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Express Central Error Middleware
```javascript
// src/middlewares/error.middleware.js
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle Zod validation errors at boundary
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input',
        details: err.errors
      }
    });
  }

  // Unhandled Programmer/System Errors
  logger.error({ err, reqId: req.headers['x-request-id'] }, 'Unhandled server error');

  return res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred'
    }
  });
};
```

---

## 3. Boundary Input Validation (Zod)

Every incoming HTTP request must pass through a strict schema validation middleware before entering controllers:

```javascript
// src/middlewares/validate.middleware.js
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

---

## 4. Git Hygiene & Pull Requests

1. **Atomic Commits:** Each commit must encapsulate a single logical change (Red test, Green fix, or Refactoring step). Avoid bundling unrelated changes across features.
2. **Branch Naming:** `feat/<ticket>-<short-description>`, `fix/<ticket>-<short-description>`, `refactor/<short-description>`.
3. **Commit Messages:** Follow Conventional Commits format (`type(scope): description`).
4. **Pull Requests:** Must maintain 100% passing tests and meet the >= 90% coverage threshold prior to merge.
