# Image Generation Rules

---

**Provider abstraction**
Never call a specific image-generation vendor's SDK directly from multiple places in a pipeline. Wrap it behind a single interface (e.g. `generate_image(...)`) that calling code depends on, so the underlying provider or model can be swapped later without touching the rest of the app.

**A failed response looks like:**
- Hardcoding one vendor's client/SDK calls throughout the pipeline instead of behind one interface
- Designing prompt/parameter structures that only make sense for one specific provider's API shape

---

**Credentials**
API keys live in `.env` only, loaded via `python-dotenv` — never hardcoded in source. Never log or print a full request payload that includes the key.

**A failed response looks like:**
- Embedding an API key in Python source
- Printing/logging a request that includes the raw API key

---

**Determinism and caching**
Pass an explicit seed whenever the provider supports one. Cache successful generations keyed by a hash of (seed, prompt, parameters) so re-running the pipeline doesn't silently re-spend money regenerating identical output. Support regenerating a specific subset of items (e.g. "sections 4, 5 and 6") without touching the rest.

**A failed response looks like:**
- No seed control, making outputs irreproducible
- Regenerating an entire batch to fix or retry one bad item
- No caching, so an interrupted or re-run pipeline re-generates everything from scratch

---

**Continuity between separate generations**
Text prompting alone is not reliable for making two separate generations connect, tile, or match seamlessly. Prefer a mechanism where the shared geometry/boundary is controlled externally rather than left to the model's interpretation of a text description — e.g. reference/control images, image-to-image generation seeded from an overlap region, inpainting masks, or edge conditioning. Confirm the chosen provider actually supports the mechanism before designing the pipeline around it — don't assume.

**A failed response looks like:**
- Assuming prompt text alone will make sequential/adjacent generations connect, with no verification step
- Designing the continuity strategy around a provider feature (e.g. image-to-image, ControlNet-style conditioning) without first confirming that provider supports it

---

**Cost control**
Prove the non-AI parts of a pipeline (geometry, compositing, validation) with a cheap local/synthetic prototype before spending on real generations. Always provide a preview/dry-run mode and the ability to generate a single item before running a full batch.

**A failed response looks like:**
- Wiring up the paid API before the local/synthetic prototype proves the surrounding pipeline works
- No way to generate or inspect a single item before committing to a full batch run

---

**Prompt composition**
Build prompts from discrete, composable parts (global visual identity, subject-specific variation, composition/technical requirements, continuity requirements) rather than one long hand-written string per item. This lets consistency be enforced programmatically as parameters change, instead of manually re-editing every prompt.

**A failed response looks like:**
- Hardcoding one giant bespoke prompt string per generated item with no shared/reusable components
- Changing the global visual identity in one prompt without a mechanism to propagate it to all others

---

**Model/endpoint validity**
Verify a model name or endpoint is currently valid (e.g. via the provider's list-models call) rather than hardcoding a specific dated snapshot name — providers rename or deprecate models over time, and a hardcoded name can 404 without warning.

**A failed response looks like:**
- Hardcoding a model id without checking it's still valid, only discovering it's deprecated at runtime
