# Vercel Publish Rules

---

**Connecting a repo to Vercel**
Connect the GitHub repo to Vercel via the Vercel dashboard — Import Project → select the repo → Vercel auto-deploys on every push to `main`. This connection is set up once per repo; after that, deployments are automatic.

**A failed response looks like:**
- Suggesting a manual deploy command (`vercel deploy`, `vercel --prod`) when the GitHub connection handles deploys automatically
- Setting up the Vercel connection more than once for the same repo

---

**Deployments**
Every push to `main` triggers a production deployment automatically. Snapshot branches (`v1`, `v2`, etc.) each get their own Vercel preview URL — shareable without affecting the production site. These preview URLs are the primary way to share a specific version for review.

**A failed response looks like:**
- Suggesting a push to `main` as the way to "share a version for review" — create a snapshot branch (`vN`) instead so production is not affected
- Treating a snapshot branch as a working branch and pushing further changes to it

---

**Environment variables**
Secrets and environment variables are set in the Vercel dashboard under Project Settings → Environment Variables — never in the codebase. They can be scoped to Production, Preview, or Development environments separately.

**A failed response looks like:**
- Adding a secret or API key to any file in the repo instead of the Vercel dashboard
- Suggesting `.env` as the way to set variables for the deployed site — `.env` is for local development only; Vercel reads its own dashboard-configured variables at deploy time

---

**Deployment Protection must be off for shareable links to work**
Vercel's own **Vercel Authentication** / "Require Login" setting (Project Settings → Deployment Protection, `/~/settings/deployment-protection`) is on by default for some account/team types and blocks anyone without a Vercel login from viewing preview or snapshot URLs. This must be turned off right after first connecting the repo, otherwise Designers and stakeholders can't open the links they're sent. This is separate from the `vercel-password` skill's custom middleware gate, which is opt-in and only protects non-`main` branches.

**A failed response looks like:**
- Sharing a snapshot/preview URL without confirming Deployment Protection is off first
- Confusing Vercel's native Deployment Protection with the `vercel-password` middleware skill — they are unrelated settings
