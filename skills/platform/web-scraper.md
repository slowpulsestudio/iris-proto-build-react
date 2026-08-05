# Web Scraper Rules

---

**Check for a cheaper source before writing an HTML scraper**
Many sites expose structured data that's far more reliable than parsing rendered HTML. Check in this order before reaching for BeautifulSoup or a headless browser:

1. **A public or undocumented JSON API** — open the site's network tab; many "static" sites are powered by a JSON endpoint (e.g. Lightspeed/webshopapp's `?format=json`)
2. **Embedded structured state in the HTML** — framework hydration payloads (e.g. Next.js `__NEXT_DATA__`, Nuxt's `__NUXT__`) often contain the full listing as clean JSON
3. **schema.org microdata / JSON-LD** — many e-commerce sites mark up listings with `itemProp`/`itemScope` or `<script type="application/ld+json">` blocks
4. **Plain HTML + CSS selectors** — last resort; most brittle, breaks silently when the site redesigns

**A failed response looks like:**
- Reaching for BeautifulSoup or a headless browser without first checking the network tab for a JSON endpoint
- Parsing rendered HTML when a `__NEXT_DATA__` or JSON-LD block contains the same data as clean structured JSON

---

**HTTP client setup**
Always set a realistic browser `User-Agent` and `Accept-Language` by default — many sites 403 the default `python-requests`/`httpx` user-agent outright. When your HTTP client wrapper accepts a per-call `headers` override, merge with defaults rather than replacing them: `{**DEFAULT_HEADERS, **overrides}`, not `kwargs.setdefault("headers", ...)`.

Before concluding an API is blocked, retest with proper headers — a bare `curl`/default-client 403 is often just a missing `Accept`/`User-Agent`/`Accept-Version` header, not real bot protection.

**A failed response looks like:**
- Making a request with the default `python-requests` or `httpx` user-agent and concluding the endpoint is inaccessible when it 403s
- Using `kwargs.setdefault("headers", DEFAULT_HEADERS)` — this silently drops the defaults when a caller also passes `headers`, causing the scraper to 403 in certain call paths
- Declaring a site "blocked" before retesting with a realistic browser user-agent

---

**When plain HTTP is blocked**
If the plain HTTP request 403s with proper headers, try a headless browser (e.g. Playwright) next — it can bypass simpler bot checks that just verify JS execution or a real browser fingerprint.

If the site still blocks with a JS challenge page (e.g. Cloudflare's "Just a moment..." interstitial), stop. Do not attempt to bypass it with stealth or anti-detection patches — that crosses from scraping a public page into deliberately circumventing a security control. Document the site as unsupported and tell the user.

**A failed response looks like:**
- Attempting to patch or bypass a Cloudflare challenge or CAPTCHA
- Escalating anti-detection techniques when a deliberate bot-protection mechanism is in place

---

**Adapter architecture**
Give every site adapter the same small interface (e.g. a module-level `name: str` and `fetch() -> list[Item]`) so sites are easy to add or remove and the pipeline code doesn't need per-site knowledge.

Dedupe results by a stable natural key (e.g. `(site, external_id)`) rather than trusting pagination to be exact. This makes it safe to guess at undocumented pagination parameters — a wrong guess produces overlapping fetches that the dedupe key collapses harmlessly.

When deriving a field via a heuristic (e.g. inferring a seller's country from a shipping-rate region code), sanity-check it against a real sample of live responses (e.g. `Counter(extracted_values)` over a real fetch) before trusting it — don't assume the first response is representative.

**A failed response looks like:**
- Writing per-site logic directly into the orchestration/pipeline code instead of behind a uniform adapter interface
- Deduplicating on a field that can vary across paginated fetches (e.g. a display title) instead of a stable ID
- Shipping a heuristic field derivation without verifying it against a real sample of live data
