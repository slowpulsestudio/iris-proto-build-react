# Motion Rules

---

**Purpose**
Motion communicates change in the interface. It must be fast, subtle, and functional. If motion does not help the user understand what changed, do not add it.

---

## Principles

- Functional: explain state transitions, do not decorate
- Fast: never slow user workflows
- Consistent: similar interactions should behave similarly
- Subtle: calm and professional, no distracting movement

---

## Token source of truth

Use Iris motion tokens only. Do not hardcode duration or easing values.

Design tokens:
- `--oi-motion-duration-snap`
- `--oi-motion-duration-short`
- `--oi-motion-duration-default`
- `--oi-motion-duration-long`
- `--oi-motion-duration-loop`
- `--oi-motion-ease-enter`
- `--oi-motion-ease-exit`
- `--oi-motion-ease-move`
- `--oi-motion-ease-none`

Primitive mappings currently in use:
- `--oi-motion-duration-0` = `0ms`
- `--oi-motion-duration-120` = `120ms`
- `--oi-motion-duration-200` = `200ms`
- `--oi-motion-duration-280` = `280ms`
- `--oi-motion-duration-1000` = `1000ms`

---

## Core usage

State changes:
- Use motion to clarify transitions (for example loading to success)
- Prefer fade or slight scale over abrupt swaps

Enter and exit:
- Prefer opacity plus small movement (about 8px translate)
- Keep transitions short and unobtrusive

Interaction feedback:
- Provide immediate click/tap feedback
- Default to `--oi-motion-duration-short`

---

## Accessibility and performance

- Respect `prefers-reduced-motion`
- Avoid large or disorienting movement
- Keep transitions cheap (opacity/transform preferred)

---

## Definition of done

Do not call motion complete unless all are true:
- Uses system motion tokens
- Pattern is consistent with existing UI behavior
- Performance impact validated
- Reduced-motion behavior implemented

Before shipping, check:
- Does this clarify what changed?
- Does it provide useful feedback?
- Does it feel instant?

---

## Current scope

This baseline does not yet define:
- Complex choreography
- Detailed component-by-component motion behavior

Detailed motion patterns are expected to be documented in Storybook and a dedicated Figma motion pattern page when available.

**A failed response looks like:**
- Hardcoding easing or duration values instead of Iris motion tokens
- Adding decorative motion that does not communicate state
- Ignoring reduced-motion behavior
- Using large movement where subtle movement would communicate the same change
