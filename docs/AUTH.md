# Authentication & Authorization Architecture

## 1. Overview & Core Security Policies

- **Runtime & Language:** Modern JavaScript with Native ES Modules (`"type": "module"`, explicit `.js` import paths).
- **Token Model:** Stateless JSON Web Tokens (JWT) signed via HMAC-SHA256 (`HS256`).
- **Transport Security:** Tokens transmitted via `Authorization: Bearer <token>` HTTP header or secure HTTP-only cookies (`SameSite=Strict`, `Secure=true`).
- **Zero Public Admin Creation:** The registration endpoint `/api/auth/register` creates accounts strictly with `Role.CUSTOMER`. Admin accounts can only be provisioned through seed scripts (`prisma/seed.js`) or direct administrative CLI commands. Any incoming payload attempting to pass `role: 'ADMIN'` is stripped or rejected at the Zod validation boundary.

---

## 2. Password Hashing Specification

- **Algorithm:** `bcryptjs`.
- **Work Factor (Cost):** 12 salt rounds (approx. 250-350ms hash time on standard servers).
- **Timing Attack Mitigation:**
  - During login, if an email lookup yields no user record, a dummy password hash comparison is executed (`bcrypt.compare(candidatePassword, DUMMY_HASH)`) before returning an error.
  - Both missing users and password mismatches return an identical error:
    `AppError('INVALID_CREDENTIALS', 401, 'Invalid email or password')`.

---

## 3. JWT Specification & Lifecycle

### 3.1 Claims & Payload Structure
```json
{
  "sub": "cuid_user_id",
  "email": "customer@example.com",
  "role": "CUSTOMER",
  "iat": 1729760000,
  "exp": 1729846400
}
```

### 3.2 Secret Management & Expiry
- Stored exclusively in environment variables validated at startup: `JWT_SECRET` (minimum 32 characters) and `JWT_EXPIRES_IN` (e.g., `"1d"` or `"24h"`).
- In the event of a missing `JWT_SECRET`, the application crashes during bootstrap via Zod env validation.

---

## 4. Middleware Implementation Logic (ES Modules)

### 4.1 `authenticate` Middleware
```javascript
// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication token required');
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err) {
    throw new AppError('INVALID_TOKEN', 401, 'Session expired or token invalid');
  }
};
```

### 4.2 `requireAdmin` Middleware
```javascript
// src/middlewares/auth.middleware.js
import { AppError } from '../errors/app-error.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 403, 'Administrative privileges required');
  }

  next();
};
```
