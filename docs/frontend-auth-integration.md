# Frontend Auth Integration Guide

This guide explains how to integrate the Velo API authentication flow in a frontend application.

**Base URL (development):** `http://localhost:3000/api/v1`

---

## Overview

Velo uses **JWT-based authentication** with two supported client patterns:

| Method | Best for | How it works |
|--------|----------|--------------|
| **HttpOnly cookie** | Same-site or properly configured cross-origin SPAs | API sets `velo_session` cookie on login |
| **Bearer token** | Mobile apps, SSR, or SPAs that prefer explicit token storage | Use `accessToken` from login response in `Authorization` header |

All protected routes require authentication unless marked public (e.g. `/auth/*`, `/ingest/*`).

The API resolves the current user on every request from:

1. `Authorization: Bearer <token>` header (preferred if both are present)
2. `velo_session` cookie (fallback)

---

## Quick Start

### 1. Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "dev@example.com",
  "username": "devuser",
  "password": "password123"
}
```

**Validation rules:**

- `email` — valid email format
- `username` — min 3 characters
- `password` — min 8 characters

**Success (201):**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Registration does **not** log the user in automatically. Call login after register.

---

### 2. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "dev@example.com",
  "password": "password123"
}
```

`identifier` accepts **email or username**.

**Success (200):**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer"
}
```

The API also sets an HttpOnly cookie:

| Cookie | Name | Max age | Flags |
|--------|------|---------|-------|
| Session | `velo_session` | 7 days | `HttpOnly`, `SameSite=Lax`, `Secure` (production only) |

---

### 3. Get current user

```http
GET /api/v1/users/me
Authorization: Bearer <accessToken>
```

Or, with cookies:

```http
GET /api/v1/users/me
Cookie: velo_session=<token>
```

**Success (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "devuser",
  "email": "dev@example.com",
  "createdAt": "2026-05-22T12:00:00.000Z",
  "updatedAt": "2026-05-22T12:00:00.000Z"
}
```

**Unauthenticated (401):**

```json
{
  "message": "Unauthorized"
}
```

---

## Frontend Implementation

### Option A — Cookie-based (recommended for browser apps)

Use `credentials: 'include'` on every API request so the browser sends the session cookie.

```typescript
const API_BASE = 'http://localhost:3000/api/v1';

export async function login(identifier: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}

export async function getMe() {
  const response = await fetch(`${API_BASE}/users/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}
```

**Login flow:**

```typescript
await login('dev@example.com', 'password123');
const user = await getMe();
```

---

### Option B — Bearer token (recommended for mobile / token-first SPAs)

Store `accessToken` from the login response (memory or secure storage) and attach it to requests.

```typescript
let accessToken: string | null = null;

export async function login(identifier: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    throw await response.json();
  }

  const data = await response.json();
  accessToken = data.accessToken;
  return data;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!accessToken) {
    throw new Error('UNAUTHORIZED');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...init.headers,
    },
  });

  if (response.status === 401) {
    accessToken = null;
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}

export function logout() {
  accessToken = null;
}
```

---

### React example (Auth context)

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const me = await getMe().catch(() => null);
    setUser(me);
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    await loginRequest(identifier, password);
    await refreshUser();
  };

  const register = async (email: string, username: string, password: string) => {
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, username, password }),
    }).then(async (res) => {
      if (!res.ok) throw await res.json();
    });

    await login(email, password);
  };

  const logout = () => {
    // Bearer mode: clear token locally.
    // Cookie mode: server logout endpoint not yet available — see "Logout" section.
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

---

## Protected vs Public Routes

### Public (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Sign in |
| `POST` | `/api/v1/ingest/:projectId` | Webhook ingestion |
| `GET` | `/api/v1/` | Health/hello |

### Protected (auth required)

All other `/api/v1/*` routes return **401** when unauthenticated, including:

- `GET /api/v1/users/me`
- `/api/v1/projects/*`
- `/api/v1/projects/:id/endpoints/*`
- `/api/v1/projects/:id/webhook-logs/*`

---

## Error Responses

Domain errors use a consistent shape:

```json
{
  "success": false,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email/username or password",
  "errorId": "err_550e8400-e29b-41d4-a716-446655440000"
}
```

Common auth-related codes:

| HTTP | Code | When |
|------|------|------|
| 401 | `INVALID_CREDENTIALS` | Wrong email/username or password |
| 409 | `USER_ALREADY_EXISTS` | Email or username already taken |
| 401 | — | Missing or expired session (`{ "message": "Unauthorized" }`) |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

Use `errorId` when reporting issues — it maps to server logs.

---

## Cross-Origin Setup (CORS)

If your frontend runs on a different origin (e.g. `http://localhost:5173`), the API must allow credentialed requests. The API does not ship with CORS enabled yet — coordinate with backend to add:

- `Access-Control-Allow-Origin: <frontend-origin>` (not `*` when using cookies)
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

Until CORS is configured, use one of:

- A dev proxy (Vite `server.proxy`, Next.js rewrites)
- Same-origin deployment
- Bearer token mode without cookies

---

## Logout

There is **no logout endpoint** yet. Current options:

| Auth mode | Logout approach |
|-----------|-----------------|
| Bearer token | Clear `accessToken` in client state/storage |
| HttpOnly cookie | Cookie expires after 7 days; explicit logout requires a future `POST /auth/logout` endpoint |

---

## Session Details

| Setting | Value |
|---------|-------|
| Cookie name | `velo_session` |
| Token type | JWT |
| Session duration | 7 days |
| Cookie path | `/` |

In production, the session cookie is set with `Secure` (HTTPS only).

---

## WebSockets

Real-time webhook updates are available at:

```
ws://localhost:3000/ws/projects/:projectId
```

WebSocket connections are **not authenticated** in the current API version. Do not rely on WS for sensitive data until auth is added. Subscribe only to project IDs the user is allowed to access (enforce on frontend + add server-side auth later).

---

## Recommended Integration Checklist

- [ ] Choose cookie or Bearer strategy
- [ ] Set `credentials: 'include'` if using cookies
- [ ] Configure dev proxy or CORS for cross-origin dev
- [ ] Call `GET /users/me` on app boot to restore session
- [ ] Handle `401` globally (redirect to login)
- [ ] Display API error `message` / `code` to users
- [ ] Store `errorId` for support/debugging
- [ ] After register, call login (or auto-login in your UX)

---

## Environment Variables (frontend)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
# or
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

Example usage:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';
```
