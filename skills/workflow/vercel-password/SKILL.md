---
name: vercel-password
description: Adds a full-screen password gate (Vercel Edge middleware plus an auth endpoint) to snapshot/release branch deployments. Read only when the user asks to password-protect, gate, or restrict access to a Vercel preview or staging deployment.
---

# Vercel Middleware Password Gate

Unauthenticated visitors see a styled password form instead of the app. After entering the correct password a session cookie is set and they are redirected to the app. The gate is skipped on `main`, so local development and trunk preview URLs are never blocked — only snapshot/release branches (e.g. `v1`, `v2`) are protected.

## Prerequisites

- Project is deployed on **Vercel** (Edge Runtime is required)
- TypeScript is available in the project
- Environment variables can be set in the Vercel dashboard

Do NOT implement this for non-Vercel deployments without first asking the user how they deploy.

## Rules

- Create exactly two files: `middleware.ts` (project root) and `api/auth.ts`. The full contents are in [references/implementation.md](references/implementation.md) — read it before creating them and copy them exactly.
- Set `SITE_PASSWORD` in the **Vercel dashboard → Project → Settings → Environment Variables**, scoped to the branch(es) to protect (e.g. `v1`, `v2`), NOT `main`. Never hardcode it, never commit it, never log or echo it.
- Only make customisations (colours, text, cookie name, branch list, session length) when the user explicitly asks. The customisation table is in the reference file.
- This is lightweight access control for preview deployments, not production authentication. Do not use it as a replacement for OAuth/SSO on production apps with sensitive user data.

**A failed response looks like:**
- Creating additional files (a login page component, an auth context, React state for the gate)
- Installing any packages — this implementation has zero dependencies
- Modifying `index.html`, `vite.config.ts`, or any app source files
- Adding `SITE_PASSWORD` to `.env` or `.env.example` in the repo — Vercel dashboard only
- Explaining how the gate works to the user when they didn't ask

## References

| File | Contains |
|---|---|
| [references/implementation.md](references/implementation.md) | Exact `middleware.ts` and `api/auth.ts` code, env var setup, how it works, customisation table, security notes |
