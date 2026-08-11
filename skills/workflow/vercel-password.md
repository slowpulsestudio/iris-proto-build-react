# Vercel Middleware Password Gate

## What this skill does

Adds a full-screen password gate to any Vercel-deployed project. Unauthenticated visitors see a styled password form instead of the app. Once they enter the correct password, a session cookie is set and they are redirected to the app. The gate is skipped on the `main` branch so local development and trunk preview URLs are never blocked — only snapshot/release branches (e.g. `v1`, `v2`) are protected.

---

## When to use

Invoke this skill when the user asks to:
- Add a password screen to a Vercel project
- Protect a staging/preview deployment behind a password
- Gate a site so only invited users can access it

---

## Prerequisites

- Project is deployed on **Vercel** (Edge Runtime is required)
- TypeScript is available in the project
- Environment variables can be set in the Vercel dashboard

Do NOT attempt to implement this for non-Vercel deployments without first asking the user how they deploy.

---

## Files to create

Create exactly two files. Do not create any others unless the user asks.

### File 1: `middleware.ts` (project root)

```ts
export const config = { matcher: ["/:path*"] };

const COOKIE = "site_auth";

const gate = (err: boolean) =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Access required</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif;background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:white;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(2,6,24,.08);padding:40px;width:100%;max-width:360px}h1{font-size:18px;font-weight:600;color:#0f172b;margin-bottom:4px}p{font-size:14px;color:#62748e;margin-bottom:24px}input{width:100%;height:40px;padding:0 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;color:#0f172b;outline:none;margin-bottom:12px}input:focus{border-color:#00a6f4}button{width:100%;height:40px;background:#00a6f4;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}button:hover{background:#0084d1}.err{color:#e7000b;font-size:13px;margin-top:8px}</style></head><body><div class="card"><h1>Access required</h1><p>Enter the session password to continue.</p><form action="/api/auth" method="POST"><input type="password" name="password" placeholder="Password" autofocus/><button type="submit">Continue</button>${err ? '<p class="err">Incorrect password.</p>' : ''}</form></div></body></html>`;

export default function middleware(request: Request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return;

  // Only protect snapshot/release branches. main is always open.
  if (process.env.VERCEL_GIT_COMMIT_REF === "main") return;

  const url = new URL(request.url);
  // Let the auth handler through unconditionally
  if (url.pathname.startsWith("/api/")) return;

  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(COOKIE + "="))
    ?.split("=")[1];
  if (token === password) return;

  const err = url.searchParams.get("error") === "1";
  return new Response(gate(err), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
```

### File 2: `api/auth.ts` (inside the `api/` folder)

```ts
export const config = { runtime: "edge" };

const COOKIE = "site_auth";

export default async function handler(request: Request) {
  const password = process.env.SITE_PASSWORD ?? "";
  const body = await request.text();
  const submitted = new URLSearchParams(body).get("password") ?? "";
  const base = new URL(request.url).origin;

  if (submitted === password) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: base + "/",
        "Set-Cookie": `${COOKIE}=${password}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: base + "/?error=1" },
  });
}
```

---

## Environment variable

Set this in the **Vercel dashboard → Project → Settings → Environment Variables**. Apply it only to the branch(es) you want to protect (e.g. `v1`, `v2`) — NOT to `main`.

| Variable | Value |
|---|---|
| `SITE_PASSWORD` | The plain-text password visitors must enter |

**Never hardcode this value in source code. Never commit it to the repo.**

---

## How it works (for context only — do not explain to the user unless asked)

1. `middleware.ts` runs on every request via Vercel Edge Middleware.
2. If `SITE_PASSWORD` is not set, or the current branch is `main`, it does nothing and passes the request through.
3. If the visitor has a cookie `site_auth` whose value equals `SITE_PASSWORD`, they pass through.
4. Otherwise, the middleware returns the inline HTML password form.
5. The form POSTs to `/api/auth`, which is handled by `api/auth.ts`.
6. `api/auth.ts` compares the submitted password to `SITE_PASSWORD`:
   - Match → sets the `site_auth` cookie (HttpOnly, 24-hour expiry) and redirects to `/`
   - No match → redirects to `/?error=1`, which causes the gate to show an error message

---

## Customisation

If the user asks to change the look or behaviour, here are the exact things to modify:

| Goal | What to change |
|---|---|
| Change accent/button colour | Replace `#00a6f4` and `#0084d1` in the `gate()` CSS string |
| Change the heading or body text | Edit the `<h1>` and `<p>` text inside `gate()` |
| Change cookie name | Replace every instance of `"site_auth"` in both files with the new name (must match in both) |
| Protect `main` as well | Remove the `if (process.env.VERCEL_GIT_COMMIT_REF === "main") return;` line |
| Protect only specific branches | Replace the `main` check with a list: `const open = ["main", "staging"]; if (open.includes(process.env.VERCEL_GIT_COMMIT_REF ?? "")) return;` |
| Extend session duration | Change `Max-Age=86400` (seconds). 86400 = 24 hours |
| Exclude more paths from the gate | Add more conditions after the `/api/` check, e.g. `if (url.pathname === "/health") return;` |

Only make a customisation if the user explicitly requests it. Do not add customisations speculatively.

---

## Security notes

- The cookie is `HttpOnly` (not readable by JavaScript) and `SameSite=Lax` (CSRF-safe for standard form submissions).
- The password is compared as plain text. This is intentional — this gate is for lightweight access control on preview deployments, not a production authentication system.
- Do not use this as a replacement for proper auth (OAuth, SSO, etc.) on production apps with sensitive user data.
- Never log or echo the value of `SITE_PASSWORD` anywhere in code.

---

## What NOT to do

**A failed response looks like:**
- Creating additional files (a login page component, an auth context, React state for the gate)
- Installing any packages — this implementation has zero dependencies
- Modifying `index.html`, `vite.config.ts`, or any app source files
- Adding `SITE_PASSWORD` to `.env` or `.env.example` in the repo — Vercel dashboard only
