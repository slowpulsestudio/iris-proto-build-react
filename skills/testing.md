# Testing Rules

---

**Real end-to-end verification before "done"**
A passing lint/type-check or a mocked unit test is not sufficient to call a feature done. Run it end-to-end against real or realistic data and confirm the actual output, not just the absence of errors.

**A failed response looks like:**
- Declaring a feature complete because "no errors found" without ever running it
- Relying solely on mocked tests for a feature that touches a real external system or real data

---

**Test components individually, then the full pipeline**
When a change spans multiple stages (e.g. generate → validate → composite), verify each stage in isolation first, then run the full pipeline together. This makes it obvious which stage a failure belongs to, instead of debugging a black-box end-to-end failure.

**A failed response looks like:**
- Only testing the full pipeline and guessing which stage caused a failure
- Skipping isolated component checks because the full run "looked fine"

---

**Automate structural validation**
Wherever a human would otherwise eyeball output for correctness (dimensions, counts, ordering, naming, duplicates, missing files), write an automated check instead. Manual visual inspection should be reserved for genuinely subjective judgement (does this look good?), not structural correctness (is this the right size/order/count?).

**A failed response looks like:**
- Leaving a mechanically-checkable property (file count, dimensions, ordering) to manual inspection
- Adding a validation step that only checks the happy path and never runs against a broken/edge case

---

**Surface failures loudly**
During development, failures (failed requests, failed assertions, unexpected values) should be logged clearly, not swallowed silently. A silent failure inside a loop or background task is far harder to diagnose than a loud one.

**A failed response looks like:**
- Catching an exception and continuing without logging it
- A test or validation step that fails closed (reports success) when it can't actually verify the condition

