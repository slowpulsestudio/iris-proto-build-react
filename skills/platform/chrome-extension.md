# Chrome Extension Rules

---

**Building and loading**
After any code change, run `pnpm build`, then go to `chrome://extensions` and click the reload icon next to the extension.

`dist/` is the compiled output — Chrome loads this folder. Always edit `src/` and rebuild; never touch `dist/` directly.

**A failed response looks like:**
- Telling the Designer to run a build command other than `pnpm build`
- Editing files inside `dist/` instead of `src/`
- Forgetting to mention the reload step after a code change

---

**Manifest and permissions**
Extensions must use Manifest V3. Permissions must be scoped to only what the extension actually needs.

**A failed response looks like:**
- Using Manifest V2 — it is deprecated and rejected by the Chrome Web Store
- Using `chrome.webRequest` to block requests — use `chrome.declarativeNetRequest` instead (the MV3 standard)
- Requesting `<all_urls>` or other broad host permissions when the extension only needs a specific site
- Adding a permission "just in case" rather than verifying the extension actually requires it

---

**Architecture: background vs. content**
Background logic lives in the service worker — it has no DOM access. Content scripts run inside web pages and have DOM access. These are separate execution contexts and cannot share variables or call each other's functions directly.

**A failed response looks like:**
- Writing DOM manipulation code inside the service worker
- Writing `chrome.declarativeNetRequest` rule registration inside a content script
- Accessing `document` or `window` from the service worker
- Communicating between contexts by any method other than `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`

---

**Content Security Policy**
Chrome enforces a strict CSP for extension pages — inline scripts are blocked.

**A failed response looks like:**
- Adding `<script>` tags with inline JavaScript to any extension HTML file
- Using `eval()` or `new Function()` in extension code
- Suggesting a CSP relaxation as a fix instead of moving the logic to an external script file

---

**Secrets**
Extension source files are publicly readable by anyone who installs the extension — Chrome packages the raw source into a `.crx` which is trivially unzipped. Secrets must never live in extension source code.

**A failed response looks like:**
- Storing an API key, token, or any secret inside any file in `src/` or `data/`
- Suggesting environment variables as a secrets solution — there is no `.env` at runtime in an extension
- Treating any file that ships with the extension as private

---

**Storage**
`chrome.storage.local` stores data on the current device only. `chrome.storage.sync` stores data tied to the user's Google account and syncs across all their devices (with quota limits). Use the right one for the right data — per-device state (e.g. block counts, cache) goes in `local`; user preferences go in `sync`.

**A failed response looks like:**
- Storing user preferences in `chrome.storage.local` when they should follow the user across devices
- Storing large cached data in `chrome.storage.sync` — it has a much smaller quota than `local`
- Using `localStorage` or `sessionStorage` — the service worker has no access to these

---

**Chrome Web Store**
The store reviews extensions for permissions, CSP violations, and remotely hosted code. Architectural decisions made without considering store requirements often require a full rewrite at submission time.

**A failed response looks like:**
- Making an architectural decision without first checking whether it is store-compliant
- Fetching and executing remote code at runtime — the store prohibits this
- Requesting permissions the store reviewer will flag as excessive for the stated functionality