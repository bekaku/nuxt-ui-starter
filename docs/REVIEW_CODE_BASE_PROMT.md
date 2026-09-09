You are performing a full, in-depth review of this project and then authoring
(or updating) a SKILLS.md file that encodes the project's actual coding rules and
conventions. This file will be read and STRICTLY FOLLOWED by AI agents (including
yourself) on every future task in this repo, so it must be accurate, specific, and
enforceable — not generic best-practice advice.

## Project context
This is the FRONTEND half of a full-stack project. The backend (Spring Boot) lives
in a separate repository that is NOT accessible in this review — do not attempt to
scan, guess, or fabricate anything about its source code.
- **Frontend (this repo)**: Nuxt 4 + Nuxt UI 4 (Tailwind CSS 4), TypeScript, pnpm.
  Client-only / BFF-light — no server-side database access (drizzle-orm and mysql2
  in package.json are legacy/unused for this app unless you find active usage —
  VERIFY this rather than assuming).
- **Backend**: Spring Boot, exposing the REST API this frontend consumes. Treated
  as an external black box for this review — reconstruct its contract only from
  how this frontend calls it (see Phase 1B).

## Phase 1A — Deep review of the frontend codebase
1. **Structure**: app/, components/, composables/, layouts/, middleware/, pages/,
   plugins/ — confirm Nuxt 4's new directory conventions are followed.
2. **API integration layer**: how the frontend calls the Spring Boot backend —
   is there a central $fetch/useFetch wrapper or API client? Base URL config
   (runtimeConfig / .env), request/response typing, error normalization, retry
   logic if any.
3. **Auth handling on the client**: how the JWT/session issued by Spring Boot is
   stored and sent (cookie vs Authorization header), token refresh flow, how
   401/403 responses are handled globally, route middleware for auth guards.
4. **Naming conventions**: components, composables, files, route/page naming.
5. **Component patterns**: Nuxt UI extension/wrapping patterns, slot usage quirks,
   prop/emit conventions, script setup ordering.
6. **State management**: useState/Pinia/provide-inject boundaries, what's
   fetched per-request vs cached.
7. **Validation**: zod schema usage — are frontend validation schemas duplicated
   from backend DTOs, or is there a shared contract source?
8. **Styling**: Tailwind 4 conventions, theme/design tokens, dark mode, i18n usage.
9. **TypeScript discipline**: strictness, `any` usage, where API response types
   are defined and whether they're kept in sync with backend DTOs manually or
   generated.
10. **Lint/format**: actual ESLint + Prettier config (read the config files, don't
    assume defaults); note rules that are configured but frequently broken.

Do not skip files for looking repetitive — repetition reveals the *real* convention.

## Phase 1B — Infer the backend contract from frontend usage only
NOTE: The Spring Boot backend is a separate repository and is NOT accessible in this
review. Do not guess at backend internals. Instead, reconstruct the API contract
entirely from how THIS frontend codebase calls and consumes it.

1. **Find every API call site**: search for all usages of $fetch, useFetch, ofetch,
   or any custom API client/composable wrapper (e.g. useApi, useApiFetch). Build an
   inventory: HTTP method, endpoint path, base URL source, request payload shape,
   query params, headers sent.
2. **Extract response shapes as actually consumed**: for each call site, note the
   TypeScript type/interface used for the response (if typed), or how the response
   is destructured/used if untyped. Pay attention to field naming (camelCase vs
   snake_case), date/time string formats, pagination envelope shape (e.g. does it
   return {data, total, page} or a raw array?), and nullable fields.
3. **Extract auth handling as observed**: how the JWT/session is attached to
   requests (cookie sent automatically vs Authorization header set manually),
   what happens on 401/403 (redirect, refresh call, toast), whether there's a
   central request interceptor/plugin doing this vs it being repeated per call.
4. **Extract error handling as observed**: how error responses are parsed —
   is there one central error shape assumed everywhere (e.g. {message, code,
   errors: []}), or does error handling differ call-site to call-site (a sign
   the backend itself may be inconsistent, or that the frontend hasn't
   standardized).
5. **Look for any contract source of truth already in the repo**: OpenAPI/Swagger
   JSON or YAML files, generated API client code, Postman collections, .http files,
   or shared type definition files (e.g. types/api.d.ts). If found, use these as
   the primary source and cross-check call sites against them — flag any call site
   that doesn't match.
6. **Flag inconsistencies found across call sites**: e.g. some endpoints returning
   {data: [...]} and others returning a bare array; some using camelCase and others
   snake_case; some errors parsed one way, others another. These are exactly the
   kind of contract drift issues SKILLS.md should call out as MUST-fix or
   MUST-follow-this-pattern-not-that-one.

Everything documented here should be labeled clearly as "observed from frontend
usage" rather than "confirmed backend behavior" — if a backend engineer reviews
this later, they should be able to tell it was reconstructed, not read from source.

## Phase 1C — Contract section for SKILLS.md
Write an "API Contract (as consumed by this frontend)" section summarizing:
- The single correct pattern for calling the API (which composable/wrapper to use,
  and that ad hoc $fetch calls outside it are NOT allowed if a wrapper exists)
- The expected request/response shape convention (naming case, pagination envelope,
  date format) — call out any endpoints that deviate and how they're special-cased
- The standard auth-attachment and 401/403 handling pattern
- The standard error-parsing pattern
- A note that if the backend contract changes, this section must be re-verified
  against actual network responses (e.g. via browser devtools or an OpenAPI spec),
  not assumed to still be accurate

## Phase 2 — Write SKILLS.md
- **Prescriptive, not descriptive**: "MUST" / "MUST NOT" / "ALWAYS" / "NEVER",
  not soft recommendations.
- **Concrete over abstract**: every rule backed by a short real snippet from this
  codebase, not a hypothetical.
- **Organized in two parts**: (1) Frontend rules, (2) API Contract (as consumed) —
  do NOT write a "Backend rules" section; this repo has no visibility into the
  Spring Boot backend's source code, so any backend-side rule would be a guess.
- **Call out found exceptions explicitly**: if most code does X but some does Y,
  say which is correct and that Y should be migrated.
- **"Before you commit" checklist**: map only to scripts that exist in THIS repo's
  package.json (e.g. pnpm lint, pnpm typecheck). Do not include backend build/test
  commands (mvn/gradle) — this repo has no way to verify what the backend actually
  uses.
- **Known footguns section**: limit to frontend-side issues you actually found —
  Nuxt UI slot gotchas, auth/cookie handling edge cases, contract drift between
  call sites, CORS errors observed/handled in code (e.g. credentials: 'include'
  usage). Do NOT speculate about backend misconfigurations you cannot see.
- Dense reference material — bullets and short code blocks, written for an AI agent
  with limited context, not prose for a human onboarding.

## Phase 3 — File placement
Produce a single SKILLS.md at the root of THIS repository (the frontend). It covers
frontend rules plus the "API Contract (as consumed by this frontend)" section.

Add a short note at the top of the contract section stating that this file only
reflects the frontend's view of the API, and that if a SKILLS.md or equivalent
rules file exists in the backend repo, its contract section should be reconciled
with this one by a human or in a separate review session where both repos are
accessible — do not assume or fabricate what the backend repo's file says.

## Phase 3.5 — Self-check
Re-scan a sample of files across different areas of the frontend and verify each
rule holds true in at least 3 real locations. Remove or soften anything you can't
verify. Then output the final SKILLS.md.

Do not ask me clarifying questions before starting — make reasonable assumptions
from what you find in the code, and list them under an "Open questions for the
team" section at the top of SKILLS.md instead.
