# Iris UI — Accessibility

Accessibility is a foundational requirement and a validation gate — not a finishing touch.

## Conformance targets

| Theme | Target | Scope |
|---|---|---|
| Default (light & dark) | WCAG 2.2 Level AA | Current standard only |
| High-contrast (light & dark) | WCAG 2.0 + 2.1 + 2.2 | All levels A, AA, AAA |

High-contrast variants are purpose-built for accessibility. Users pick a theme during onboarding and can switch from the user-profile dropdown in the main header.

## What to verify

- **Contrast** — text and meaningful icons meet AA against their background token in every shipped theme mode (light and dark at minimum). Check resolved values per mode, not just light.
- **Focus visibility** — buttons, links, inputs, checkboxes, radios have a visible focus treatment.
- **Target size** — interactive targets use Iris UI sizing tokens (`--oi-size-*`); don't shrink below component defaults.
- **Semantic mapping** — status (info/success/warning/error) uses the correct semantic tokens and isn't carried by colour alone; pair with icon/text where the spec component does.
- **Don't defeat the system** — overriding a component's tokenised colours with raw values can silently break contrast guarantees. Keep bindings intact.

Prefer the tokenised, component-driven path (it carries the system's accessibility decisions) and flag any requested visual that would violate AA instead of silently applying it.
