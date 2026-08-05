# Iris React — Tech Stack & Design System Rules

---

**Framework**
React + Vite. Package manager: pnpm only.

**A failed response looks like:**
- Suggesting `npm`, `npx`, or `yarn` for any command
- Introducing a framework other than React without being asked

---

**Code standards**

**A failed response looks like:**
- Editing an existing file without providing line numbers
- Adding an explanation for code that speaks for itself
- Assuming an answer instead of checking Figma or the existing codebase first

---

**Documentation standards**
Check with the Designer before creating any new `.md` file. Follow the same structure and tone as existing documentation, and link every design decision back to its Figma source.

**A failed response looks like:**
- Creating a new `.md` file without checking with the Designer first
- A design decision documented with no link back to its Figma source

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

**Motion tokens are the only source of truth**
All durations and easing curves must use Iris motion tokens. Never hardcode a timing value, easing curve, or animation duration.

| Token | Value | When to use |
|---|---|---|
| `--oi-motion-duration-snap` | 0ms | Instant — no animation |
| `--oi-motion-duration-short` | 120ms | Microinteractions: hover, tap, small UI changes |
| `--oi-motion-duration-default` | 200ms | Standard transitions: panels, state changes |
| `--oi-motion-duration-long` | 280ms | Larger transitions: modals, layout shifts |
| `--oi-motion-duration-loop` | 1000ms | Indefinite loops only |
| `--oi-motion-ease-enter` | `cubic-bezier(0.4, 0, 1, 1)` | Elements entering the interface |
| `--oi-motion-ease-exit` | `cubic-bezier(0, 0, 0.2, 1)` | Elements leaving the interface |
| `--oi-motion-ease-move` | `cubic-bezier(0.4, 0, 0.2, 1)` | Pre-existing elements animating on screen |
| `--oi-motion-ease-none` | `linear` | No easing, but still takes time |

Motion must be purposeful — only add it if it helps the user understand what just happened. Prefer opacity + small translate (8px or less) over large movements. Use `--oi-motion-duration-short` for interaction feedback, `--oi-motion-duration-default` for most transitions, `--oi-motion-duration-long` only for large layout changes such as modals.

Every animation must respect `prefers-reduced-motion`. When reduced motion is set, remove or minimise the transition — do not slow it down.

**A failed response looks like:**
- Using a hardcoded duration or easing curve instead of an `--oi-motion-*` token
- Using `--oi-motion-duration-long` for a small UI change
- Translating an element more than 8px for an enter/exit transition
- Using a JS animation library when SVG + CSS is sufficient
- Shipping an animation with no `prefers-reduced-motion` handling

---

## Resources
iris-ui-main/ -> src/iris-ui/
