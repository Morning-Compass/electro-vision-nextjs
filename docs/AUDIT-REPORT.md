# Security, Performance, Code Quality & Improvement Audit

**Application:** Electro Vision  
**Stack:** Next.js 15 (App Router) + Tauri 2.0 + TypeScript  
**Audit date:** February 2025

---

## 1. SECURITY REPORT

### 1.1 Vulnerabilities by Severity

#### Critical

| ID | Finding | Location | Remediation |
|----|---------|----------|-------------|
| S1 | **Auth token not sent with API requests** | `ev-lib/ElectroVisionFetch.ts` | Backend may rely on session/cookies; if it expects `Authorization: Bearer <token>`, all protected endpoints are effectively unauthenticated. **Add optional auth header** from context (e.g. `User.authUser?.token`) in a wrapper or interceptor so every OLF call can send the token when available. |
| S2 | **Hardcoded backend hosts** | `ev-const/api-links.ts` (lines 3–4) | `rustHost` and `pythonHost` are `http://localhost:3501` and `http://localhost:8000`. In production, URLs must come from env (e.g. `NEXT_PUBLIC_API_HOST`) and use HTTPS. |

#### High

| ID | Finding | Location | Remediation |
|----|---------|----------|-------------|
| S3 | **No security headers** | `next.config.mjs` | Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options. Add `headers()` in Next config for production (or rely on host/Tauri for CSP). |
| S4 | **Tauri CSP is null** | `src-tauri/tauri.conf.json` → `app.security.csp` | Set a strict Content-Security-Policy to limit script/style sources and inline execution. Reduces XSS impact. |
| S5 | **No rate limiting or API route protection** | N/A | Next app uses `output: "export"` (no API routes); all API is external. Ensure **Rust/Python backends** enforce rate limiting, auth, and input validation. Document assumptions. |

#### Medium

| ID | Finding | Location | Remediation |
|----|---------|----------|-------------|
| S6 | **Sensitive data in context only** | `ev-contexts/userContextProvider.tsx` | Auth token lives in React state (good: not in localStorage). Ensure token is never logged (see Code Quality: console.*). Consider short-lived tokens and refresh flow. |
| S7 | **dangerouslySetInnerHTML** | `app/layout.tsx` line 48 | Used for localStorage polyfill only; content is static and app-controlled. **Keep as-is** but avoid adding user/server data here. |
| S8 | **No middleware** | (no `middleware.ts`) | No centralized auth redirect or security headers at edge. Optional: add middleware for redirecting unauthenticated users and setting headers when not using static export. |

#### Low

| ID | Finding | Location | Remediation |
|----|---------|----------|-------------|
| S9 | **Stray code file** | `app/changepasswordcode.txt` | Contains form-like code; not a secret. Move to `/docs` or remove; avoid keeping snippet files under `app/`. |
| S10 | **Dependency audit** | `package.json` | Run `npm audit` (with network) and fix reported vulnerabilities; re-run after dependency updates. |

### 1.2 Authentication / Authorization

- **Flow:** Login/register hit Rust backend; token and user stored in React context. No token sent on subsequent OLF requests in codebase.
- **Protection:** `PageTemplate` gates UI by `User.authUser?.id` and `email`; no server-side session check (static export).
- **Recommendation:** If backend expects Bearer token, add it to `ElectroVisionFetch` (e.g. inject headers from context or a small auth module). Ensure backend validates token and rate-limits auth endpoints.

### 1.3 Environment & Secrets

- No `process.env` / `NEXT_PUBLIC_*` usage for API base URLs; all URLs are in `api-links.ts`.
- **Recommendation:** Use `NEXT_PUBLIC_RUST_API_HOST` and `NEXT_PUBLIC_PYTHON_API_HOST` (or similar) and default to current localhost in dev. Never put secrets in client-exposed env.

### 1.4 Tauri-Specific

- **Permissions:** `capabilities/migrated.json` uses `core:default` only; no custom IPC commands. Minimal and appropriate.
- **Rust:** `main.rs` is default Tauri 2.0 template; no custom IPC, no filesystem/network code in app.
- **HTTPS:** `useHttpsScheme: true` in window config is good for production.
- **Recommendation:** Add CSP in `tauri.conf.json`; when adding IPC, use scoped permissions and validate/sanitize all inputs.

---

## 2. PERFORMANCE AUDIT

### 2.1 Next.js Configuration

| Item | Current | Note |
|------|---------|------|
| Output | `output: "export"` | Static export; no Node server. Good for Tauri loading from `../out`. |
| Images | `images: { unoptimized: true }` | Required for static export without Image Optimization API. Acceptable. |
| Turbopack | Used in dev (`next dev --turbopack`) | Webpack still configured (dev overlay); Turbopack not configured. Add `experimental.turbo` in `next.config.mjs` if you rely on Turbopack to avoid confusion. |

### 2.2 Rendering & Data Fetching

- **Strategy:** All audited pages are `"use client"`; data fetched in `useEffect` with OLF. No React Server Components for data; no streaming.
- **Impact:** No server-side rendering; LCP depends on client fetch and bundle size. Consider prefetching critical data (e.g. dashboard) or moving to RSC where it fits your architecture.
- **Duplicate risk:** e.g. `hub/page.tsx` fetches on `User?.authUser?.email` change; no request deduplication. Same for workspaces list. Consider a small cache or SWR/React Query to avoid redundant calls.

### 2.3 Bundle & Dependencies

- **Heavy deps (likely):** `recharts`, `reactflow`, `leaflet`, `react-leaflet`, `embla-carousel`, `react-datepicker`, `country-state-city`, `world-countries`. Good candidates for dynamic imports where used.
- **Editor:** `app/workspaces/plans/editor/page.tsx` is very large (~1.4k lines); already uses `dynamic(() => import("./LeafletMap"), { ssr: false })`. Further splitting (e.g. task form, map toolbar) would help.
- **Recommendation:** Run `@next/bundle-analyzer` (or Turbopack bundle analysis) and lazy-load non-critical routes (e.g. workspace editor, account, calendar).

### 2.4 Images & Assets

- Next.js `Image` used in many places; `unoptimized: true` means no automatic resizing/WebP. For Tauri-packed assets, consider pre-optimized assets or a build-time step.
- **Font:** Single Lexend font in layout; acceptable. Subset and weights are already limited.

### 2.5 React Optimization

- **useCallback/useMemo:** Used in carousel and workspace editor; not in list items (e.g. `WorkspaceEntry`, `TaskEntry`). For long lists, wrapping list item components in `React.memo` can reduce re-renders.
- **Context:** Single `UserContext`; any context change re-renders all consumers. If the tree grows, consider splitting (e.g. auth vs theme) or moving to a store (Zustand) for non-auth state.

### 2.6 Tauri / Desktop

- **Startup:** No custom Rust logic blocking startup. Dev URL points to `http://localhost:3000`; ensure Next dev server is up before launching Tauri.
- **IPC:** No custom IPC; no serialization or batching to optimize.
- **localStorage:** Polyfill in place for broken Tauri WebView localStorage; in-memory only in that case. No measurable perf impact.

### 2.7 Metrics (Suggested)

- **LCP / INP / CLS:** Not measured in this audit. Add Lighthouse or Real User Monitoring (e.g. Vercel Analytics, or Tauri-compatible RUM) for before/after comparisons.
- **Bundle size:** Run `next build` and inspect `.next` or analyzer output; set a budget and track after optimizations.

---

## 3. CODE QUALITY REPORT

### 3.1 Overall Score: **B-**

- **Strengths:** TypeScript `strict: true`, clear separation (`ev-const`, `ev-lib`, `ev-types`, `ev-contexts`), consistent use of Next Image and App Router, minimal Tauri surface.
- **Gaps:** No tests, many `console.*` and several `any` types, no ESLint config file (Next defaults only), one very large page component.

### 3.2 TypeScript

| Item | Status | Details |
|------|--------|--------|
| Strict mode | OK | `tsconfig.json`: `"strict": true` |
| Explicit any | Needs work | ~15 uses of `any` (e.g. `app/workspaces/plans/editor/page.tsx`, `LeafletMap.tsx`, `Datepicker.tsx`, `Input.tsx`, `hub/page.tsx`). Prefer specific types or `unknown` + guards. |
| Return types | Partial | Many async functions return inferred types; ElectroVisionFetch returns `Promise<any>`. Tighten API response types. |

**File/line references (any):**

- `components/datepicker/Datepicker.tsx`: 10, 71 (`control?: any`)
- `components/Input.tsx`: 6 (`register?: any`)
- `app/workspaces/plans/editor/page.tsx`: 80 (`map: any`), 811–835, 1010, 1026 (`error: any`, `pyTask: any`, etc.)
- `app/workspaces/plans/editor/LeafletMap.tsx`: 44, 53 (`map: any`)
- `app/hub/page.tsx`: 161 (`props: any` in Tooltip formatter)

### 3.3 Testing

- **Unit / integration / e2e:** No test files (`*.test.*`, `*.spec.*`).
- **Recommendation:** Add Vitest for unit (ev-lib, ev-const, utils), React Testing Library for components, and Playwright or Tauri WebDriver for e2e. Start with auth flow and OLF error handling.

### 3.4 Code Standards

- **Console:** 80+ `console.log` / `console.error` / `console.warn` across app and components. Remove or replace with a logger that is no-op in production (or gated by `NEXT_PUBLIC_DEBUG`).
- **Error handling:** Mix of `toast.error`, `setError`, and `console.error`; some catch blocks don’t surface errors to the user. Standardize (e.g. toast for user, logger for dev).
- **Naming:** Generally clear; a few abbreviations (OLF for fetch singleton). Consider `apiClient` or `electroVisionApi` for clarity.
- **ESLint:** No project-level `.eslintrc` or `eslint.config.js`; Next default applies. Add rules: `no-console` (warn), `@typescript-eslint/no-explicit-any` (warn).

### 3.5 Architecture

- **State:** Single React Context for user; no global store. Fits current size; consider splitting or a store if complexity grows.
- **API layer:** Single ElectroVisionFetch instance; no interceptors. Extend with auth header and optional request/response logging in dev.
- **Routing:** App Router with client pages; no route guards (auth is component-level in PageTemplate).

---

## 4. IMPROVEMENTS & BEST PRACTICES

### 4.1 Top 10 Priority Recommendations

1. **Send auth token with API requests** – Add `Authorization: Bearer <token>` (from context) in ElectroVisionFetch or a thin wrapper when token exists.
2. **Move API base URLs to env** – Use `NEXT_PUBLIC_RUST_API_HOST` and `NEXT_PUBLIC_PYTHON_API_HOST` in `api-links.ts`; keep localhost as dev default.
3. **Add security headers** – In Next config (or host), set CSP, HSTS, X-Frame-Options, X-Content-Type-Options for production.
4. **Set Tauri CSP** – Configure `app.security.csp` in `tauri.conf.json` with a strict policy.
5. **Remove or gate console.*** – Strip `console.log` in production or use a debug logger; keep `console.error` only where necessary or replace with logger.
6. **Replace `any` with types** – Start with `ElectroVisionFetch` (response types), then editor and form components (Leaflet map, react-hook-form control).
7. **Add basic tests** – At least: one test for ElectroVisionFetch error path, one for PageTemplate (auth gate), one for login flow (mocked OLF).
8. **Add ESLint rules** – `no-console`, `@typescript-eslint/no-explicit-any`; fix or suppress with comment where intentional.
9. **Configure Turbopack** – Add `experimental.turbo` (or equivalent) in `next.config.mjs` and remove Webpack-only hooks if not needed, to align with `next dev --turbopack`.
10. **Split large editor page** – Extract task form, map toolbar, or side panels from `workspaces/plans/editor/page.tsx` into smaller components or lazy-loaded chunks.

### 4.2 Quick Wins (< 1 hour)

- Add `NEXT_PUBLIC_RUST_API_HOST` and `NEXT_PUBLIC_PYTHON_API_HOST` to `.env.local` and use them in `api-links.ts`.
- Remove or comment out non-essential `console.log` in auth and hub pages (e.g. `app/auth/login/page.tsx` line 62, `app/hub/page.tsx` line 50).
- Add `headers` to `next.config.mjs` (e.g. X-Frame-Options, X-Content-Type-Options) and a basic CSP.
- Set `app.security.csp` in `tauri.conf.json` (e.g. `default-src 'self'` and script/style allowlist).
- Move or delete `app/changepasswordcode.txt`.
- Add `.eslintrc.json` with `no-console: "warn"` and `@typescript-eslint/no-explicit-any: "warn"`.
- Type the dashboard API response in `hub/page.tsx` (replace `DashboardData` usage with a proper interface if missing).
- Wrap `WorkspaceEntry` in `React.memo` if workspaces list is long.

### 4.3 Long-Term / Architectural

- **Auth:** If backend supports it, implement refresh tokens and short-lived access tokens; store only in memory or secure storage (e.g. Tauri Store plugin for desktop).
- **Data layer:** Introduce React Query or SWR for server state (caching, deduplication, loading/error states) and keep context for auth UI state only.
- **RSC where useful:** For marketing or static content, consider Server Components and streaming to improve LCP without changing Tauri flow.
- **Monitoring:** Add error reporting (e.g. Sentry) and optional RUM for Core Web Vitals; in Tauri, consider crash reporting and update checks.
- **E2E:** Automate login → dashboard → workspace list with Playwright or Tauri WebDriver to protect against regressions.

---

## 5. CONFIGURATION REVIEW

### 5.1 Next.js (`next.config.mjs`)

**Suggested additions:**

```javascript
// Security headers (when not using static export with external host)
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
// Then in config: async headers() { return [{ source: '/:path*', headers: securityHeaders }]; }

// Turbopack (if using next dev --turbopack)
// experimental: { turbo: { ... } } as per https://nextjs.org/docs/app/api-reference/next-config-js/turbo
```

- Keep `images: { unoptimized: true }` and `output: "export"` for Tauri.
- Consider removing or conditioning the webpack dev overlay removal if you no longer need it with Turbopack.

### 5.2 Tauri (`tauri.conf.json`)

**Suggested:**

- `app.security.csp`: e.g. `"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* https://*"`
- Adjust `connect-src` to match your API origins in dev and prod.
- Keep `useHttpsScheme: true`; when adding IPC, use capability files and minimal permissions.

### 5.3 TypeScript (`tsconfig.json`)

- Already good: `strict: true`, paths, target. Optional: `noUncheckedIndexedAccess` for stricter indexing.

---

## 6. DELIVERABLES SUMMARY

| Deliverable | Location in this document |
|-------------|----------------------------|
| Security report | §1 – vulnerabilities by severity (S1–S10), auth, env, Tauri |
| Performance | §2 – config, rendering, bundle, images, React, Tauri, metrics |
| Code quality score | §3 – B- with file/line references for any and testing/standards |
| Top 10 improvements | §4.1 |
| Quick wins | §4.2 |
| Long-term recommendations | §4.3 |
| Configuration review | §5 – Next, Tauri, TypeScript |

---

*End of audit report. Re-run security and performance checks after applying changes and after major dependency upgrades.*
