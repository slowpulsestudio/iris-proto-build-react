# Iris UI Design System Rules

---

**Iris UI is the only component source**
Iris UI (One Identity design system) is implemented natively as CSS tokens (`src/tokens/*.css`), icons (`src/icons/`), and hand-built React components (`src/components/**`). This is the real, working implementation — never replace it with an external component library without being explicitly asked.

Every UI element must use real Iris components, tokens, and icons. A build that "looks right" but uses a hardcoded value, an invented component, or a non-Iris icon is a failed build — regardless of how complete or polished it otherwise appears.

**A failed response looks like:**
- Using a hardcoded colour, spacing value, or radius when an Iris token exists for it
- Using a generic HTML element or invented component when a real Iris component exists
- Using any icon that is not from the Iris icon set
- Replacing Iris components with an external package without being explicitly asked
- Building a component from scratch without first checking whether Iris already has it

---

**Motion and animation**
Animations are specified in Figma using the motion spec template. Implement using SVG + CSS with Figma token values for easing and timing — never hardcode easing curves or durations.

**A failed response looks like:**
- Hardcoding an easing curve or timing value instead of pulling it from the Figma motion spec
- Using a JS animation library when SVG + CSS is sufficient
