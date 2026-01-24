# ADP Frontend — Architecture & Implementation Guide

This document describes the architecture, technology choices, and recommended patterns for the ADP frontend located at the repository root (the app uses Next.js with the `app/` router). It explains why Next.js, TypeScript, SSR and cookie-based authentication were chosen, and provides concrete guidance for implementing role-based authorization (dealer, buyer, admin, seller), performance, SEO, security, and deployment.

## Table of contents

-   Summary and goals
-   Tech choices (why)
-   Project structure (mapping to repo)
-   Data fetching & rendering strategies (SSR/SSG/ISR/app router)
-   Authentication & Authorization (cookie-based + roles)
-   Middleware and route protection
-   Security best practices
-   Performance & SEO recommendations
-   Local development, build and deployment

## Summary and goals

Primary goals for this frontend:

-   SEO-friendly pages and good crawler experience — server-side rendered content where appropriate.
-   High runtime performance and fast TTFB (use Next.js server rendering patterns).
-   Type safety with TypeScript to catch errors at compile time and improve developer DX.
-   Secure, cookie-based authentication for sessions (httpOnly cookies) with role-based access control for `dealer`, `buyer`, `admin`, and `seller` users.
-   Clear separation between server and client logic (use server components where possible in the `app/` router).

## Tech choices (why)

-   Next.js (app router) — provides server-side rendering, hybrid rendering strategies, edge/ISR options, built-in routing, and middleware. This project already uses `app/` directory which aligns with latest Next.js conventions.

-   TypeScript — ensures type safety across React components, server actions, and lib utilities. Compile-time checks reduce runtime bugs.

-   Cookies (httpOnly, Secure) for authentication — safer against XSS than storing tokens in localStorage. Refresh / session management handled via server endpoints.

-   Role-based access control — application enforces 4 roles: `dealer`, `buyer`, `admin`, `seller`. Roles are checked at middleware and at the UI level.

-   Linting / Formatting — ESLint and Prettier are recommended; project includes `eslint.config.mjs`.

## Project structure (important files and folders)

Note: references below wrap repo files in backticks.

-   `app/` — Next.js app route pages and layouts. Use server components by default; add `'use client'` at top for client components.

    -   `app/layout.tsx` — global layout (shared providers, metadata)
    -   `app/page.tsx` — home page
    -   `app/admin/layout.tsx` and subfolders — admin zone
    -   `app/seller`, `app/buyer`, `app/dealer` — role-specific layouts and dashboards

-   `components/` — shared UI components (e.g., `VehicleCard.tsx`, `Header`, `Footer`). Keep these small and pure.

-   `lib/` — helpers and stores (`cartStore.ts`, `vehicleStore.ts`, `serverActions.ts`, `ws.ts`). Place server-only helpers under `lib/server` if needed.

-   `data/`, `validation/` — static data, zod schemas (or similar) used for form validation.

-   `public/` — static assets

-   `proxy.ts` — project-specific proxy configuration for API calls (used in development). Keep API base URLs in environment variables.

-   `next.config.ts`, `tsconfig.json`, `package.json` — project configuration and build scripts.

## Data fetching & rendering strategies

Because the project already uses the `app/` router, prefer server components and Next.js server data fetching patterns.

Guidelines:

-   Server components: Fetch data directly in React server components (recommended for SEO-sensitive pages and lists). They run on the server and can safely access secrets or call internal APIs.

-   Client components: Mark components that use state, effects, or browser-only APIs with `'use client'` at top. Keep them small (UI interactivity only).

-   Use server-side rendering (SSR) for pages that require fresh data on every request or are SEO critical (e.g., listing pages, seller details). In the `app/` router, a page or layout that performs data fetch will be server-rendered by default.

-   Incremental Static Regeneration (ISR): For pages that are mostly static but updated periodically (e.g., marketing pages), use caching and revalidation headers or Next's `revalidate` when fetching with the `fetch` API (e.g., `fetch(url, { next: { revalidate: 60 }})`).

-   Caching: Use short caching and stale-while-revalidate strategies where appropriate (list pages may cache for a short window to reduce backend load).

-   API calls from server components: call your backend directly (server-side) rather than exposing tokens to client. Use the `proxy.ts` or environment configured base URL for server calls.

## Authentication & Authorization

Design contract (inputs/outputs):

-   Input: user credentials (email/password), or existing session cookie on each request.
-   Output: on successful login, server sets a secure, httpOnly cookie containing a session token (opaque or JWT). Returns user profile and role metadata to client on authenticated endpoints.
-   Error modes: invalid credentials, expired session, refresh token required.

Cookie-based session strategy (recommended):

-   Use short-lived access cookie and a longer-lived refresh cookie OR a single httpOnly cookie with server-side session storage.

-   Cookie flags:

    -   `HttpOnly` — prevents JS access.
    -   `Secure` — only sent over HTTPS (set in production).
    -   `SameSite=Strict` or `Lax` — use `Lax` for general compatibility, `Strict` for higher security.
    -   `Path=/` and `Max-Age` set appropriately.

-   Example cookie names:

    -   `adp_session` (httpOnly, secure) — contains opaque session id or signed JWT.
    -   Optionally `adp_refresh` for a refresh token (httpOnly).

-   Store session state server-side or use signed JWTs with short expiry; prefer server-side sessions if you want immediate revocation.

Login flow summary:

1. Client posts credentials to an authentication endpoint (server-side API).
2. Server validates and creates session; sets `Set-Cookie: adp_session=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=...`.
3. Server returns minimal user info (id, role) in response JSON.
4. Subsequent server-side requests (including Next.js server components and middleware) read the cookie and validate session.
5. On token expiry, use refresh flow or redirect to login.

Where to implement:

-   Implement auth endpoints in your backend API; frontend should call these endpoints via `fetch` from server components or from client actions for interactive flows.

-   Use a small server-side helper like `lib/session.ts` (or `lib/serverActions.ts`) to parse and validate cookies on the server. Keep token verification secret keys in environment variables.

Client-side patterns:

-   For client-side pages needing current user, either fetch `/api/me` from the client or embed user data in server-rendered HTML (server component passes user to client component via props).

-   Avoid accessing cookies from browser JS; rely on server-side verification for secure checks.

Roles & authorization:

-   Four roles: `dealer`, `buyer`, `admin`, `seller`.
-   Role checks performed at two levels:
    -   Middleware/Edge: block navigation to `app/admin/*` or `app/seller/*` for unauthorized roles early.
    -   Component-level: show/hide UI elements depending on role (e.g., menu items).

Example high-level rules:

-   `admin` — full access to admin dashboards and management API endpoints.
-   `seller` — manage inventory, orders, profile.
-   `dealer` — access dealer-specific flows (inventory/negotiation as needed).
-   `buyer` — browse, shortlist, orders, profile.

Always validate roles server-side even if the UI hides actions client-side.

## Route protection: proxy

Next.js supports an edge `middleware.ts` for route-level checks, but recent project patterns also use a top-level `proxy.ts` to handle auth gating and redirects (this repo includes `proxy.ts` at the project root). Both approaches run on the server and can validate cookies — pick the one that best fits your deployment (Edge middleware, Vercel Edge, or a server runtime).

Responsibilities for both approaches:

-   Read and validate your session cookie (for example `adp_session` or `userToken`).
-   If missing/invalid, redirect to `/login` or show an unauthorized page.
-   If present but the user lacks required role for the route, redirect appropriately.

This repository uses `proxy.ts` (see `proxy.ts` at project root) to gate routes. Example from this project:

```ts
// proxy.ts (project root)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const protectedRoutes = ["/add-vehicle", "/admin", "/buyer", "/dealer", "/my-cart"];

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtected = protectedRoutes.some((p) => path.startsWith(p));
    const userId = (await cookies()).get("userToken")?.value;

    if (isProtected && !userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"] };
```

Notes:

-   `middleware.ts` remains useful when you need Edge-specific features or advanced rewrites. `proxy.ts` is a simpler pattern used here to centralize route protection and keep behavior consistent across server runtimes.
-   Keep cookie parsing and session verification logic in a server-only helper (for example `lib/session.ts`) and import it from the proxy or middleware to avoid duplication.

## Security best practices

-   Cookies: always use `HttpOnly`, `Secure` and `SameSite` flags.
-   CSRF: with cookies, implement CSRF protections for state-changing POST/PUT/DELETE requests. Approaches:

    -   Double submit cookie pattern, or
    -   Use SameSite=Lax and POST endpoints check Origin/Referer headers where possible, or
    -   Keep sensitive state-changing endpoints behind same-origin checks and validate CSRF tokens.

-   XSS: sanitize any user-generated content before rendering. Prefer server-side sanitization for content saved in DB.

-   Secret management: store secrets (JWT signing key, session DB credentials) in environment variables and use provider secrets (Vercel secrets, GitHub Actions secrets) in deployments.

-   Content Security Policy (CSP): add a strong CSP via `next.config.js` or server headers.

-   Rate limiting: protect authentication endpoints with rate limiting (server-side).

## Performance & SEO recommendations

-   Use server components and SSR for SEO-critical pages (vehicle listings, seller details, landing pages).

-   Use Next.js `<Image>` from `next/image` for optimized images (`components/Image.tsx` exists — ensure it uses or wraps `next/image`). Configure `next.config.ts` `images.domains` when your images are hosted externally.

-   Reduce bundle size: mark heavy libraries as dynamic imports and keep reusable UI components small.

-   Use HTTP caching on the server for static assets and CDN configuration for production (Vercel or other providers handle CDN automatically).

-   Add proper meta tags, Open Graph tags and structured data on the server in `app/layout.tsx` or page-level metadata for SEO.

-   Lighthouse: periodically run Lighthouse audits and monitor Core Web Vitals.

## Local development, build and deployment

Common commands (adjust if you use yarn or pnpm):

```bash
# install
npm install

# development
npm run dev

# production build
npm run build
npm run start
```

Environment variables (example names):

-   `NEXT_PUBLIC_API_URL` — public API base for client-side fetches (only non-sensitive values should be exposed).
-   `API_URL` — server-only API base (for server components and middleware).
-   `SESSION_SECRET` — signing key for session cookies (server-only).
-   `NODE_ENV` — `development` / `production`.

Deployment:

-   Vercel: recommended (native Next.js support, ISR, Edge functions). Set environment variables in the Vercel project settings.
-   Docker: you can build a Node image and run `next start`.
-   Ensure HTTPS in production to allow `Secure` cookie flag.

## Small, low-risk code examples (patterns)

Role-based UI in a component (client component):

```tsx
"use client";
import { useEffect, useState } from "react";

export default function RoleAwareMenu() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetch("/api/me")
            .then((r) => r.json())
            .then(setUser)
            .catch(() => setUser(null));
    }, []);

    if (!user) return null;
    return (
        <nav>
            {user.roleType === "admin" && <a href="/admin">Admin</a>}
            {user.roroleTypele === "seller" && <a href="/seller/dashboard">Seller</a>}
        </nav>
    );
}
```

## Practical fetch examples (from this project)

Below are concrete examples that reuse the project's API helper layers. This repo provides `lib/api/server-request.ts` for server-side requests and `lib/api/client-request.ts` for browser/client requests. Use these helpers to keep consistent headers, cookie forwarding and error handling.

-   Server-side fetch (server component or `app/` route):

```ts
// app/vehicles/page.tsx (server component)
import { api as serverApi } from "@/lib/api/server-request";

export default async function VehiclesPage() {
    // serverApi.get forwards cookies and supports Next.js caching options
    const vehicles = await serverApi.get("/vehicles", { params: { page: 1 }, cacheRevalidate: 30, isAuthRequired: false });

    return (
        <div>
            <h1>Vehicles</h1>
            {/* render vehicles */}
        </div>
    );
}
```

-   Client-side fetch (client component or browser action):

```tsx
// components/UserMenu.tsx (client component)
"use client";
import { useEffect, useState } from "react";
import { api as clientApi } from "@/lib/api/client-request";

export default function UserMenu() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // clientApi.get uses `credentials: 'include'` so httpOnly cookies are sent automatically
        clientApi
            .get("/me")
            .then((data) => setUser(data))
            .catch(() => setUser(null));
    }, []);

    if (!user) return <a href="/login">Sign in</a>;
    return <div>{user.name}</div>;
}
```

Notes:

-   The server helper (`server-request.ts`) forwards cookies using Next's `cookies()` helper so authentication works during SSR and server components.
-   The client helper (`client-request.ts`) sets `credentials: 'include'` so browser will send httpOnly cookies automatically to the API.
-   Both helpers centralize error handling and JSON parsing — prefer them over raw `fetch` calls scattered across the codebase.

## Accessibility

-   Use semantic HTML elements, aria attributes where needed, and run axe / Lighthouse accessibility checks.
-   Ensure keyboard focus order and visible focus states on interactive components.

## Final notes

This project is already structured to use Next.js `app/` router and TypeScript. The recommendations above combine security, performance and SEO best practices with pragmatic implementation steps (middleware, server helpers, cookie-based sessions).

---

_Document created on 22 Dec 2025._
