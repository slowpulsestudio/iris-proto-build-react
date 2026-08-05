# Sliders — Functional Requirements and Hints

## Label type is independent of thumb mode

The `label` input (`'none' | 'tooltip' | 'bottom'`, default `'tooltip'`) is fully orthogonal to `dualThumb`. Every combination is valid — a dual-thumb slider can have a tooltip, a bottom label, or no label at all.

| `label`     | Behaviour                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `'none'`    | No value label shown                                                                                                               |
| `'tooltip'` | Value shown above the thumb only while the user is actively dragging or the thumb is focused. Fades in/out — not a hard show/hide. |
| `'bottom'`  | Value shown below the thumb, always visible regardless of interaction state.                                                       |

## Tooltip visibility

The tooltip appears when the thumb is focused (keyboard or pointer) **or** being dragged. It disappears when neither condition is true. Fades in/out — not a hard show/hide.

## Focus behaviour

A thumb becomes focused when clicked, dragged, or tabbed to. Focus persists after dragging ends — it only clears when the user clicks outside the slider component.

## Click vs drag — transition behaviour

Clicking the track should animate the thumb to the new position (transition on). Dragging should track the cursor with no transition (lag-free).

These are distinguished via `pointermove`: `pointerdown` sets a pending flag, `pointermove` promotes it to dragging, `pointerup`/`pointercancel` clears both. A click never fires `pointermove` so `dragging` stays false and the CSS transition plays normally.

## Dual thumb — progress fill

The filled track segment spans from `valueLow` to `valueHigh`, not from 0. Both values are independently settable and two-way bindable.

## Dual thumb — values cannot cross

`valueLow` must always be strictly less than `valueHigh` by at least one `step`. This invariant must be enforced in all cases:

- When the user drags or keyboards either thumb
- When values are set externally (e.g. from Storybook args or model bindings)

When a violation is detected, clamp the value that changed — not the other one. If `valueLow` was moved too high, correct `valueLow`. If `valueHigh` was moved too low, correct `valueHigh`.

## Dual thumb — focus behaviour

Both thumbs track their own focused state independently. Clicking one thumb clears focus on the other.

## Value clamping to min/max

The slider value(s) must never fall outside the configured `min`/`max` range, regardless of how they are set. This applies to both single and dual thumb modes. For dual thumb, `valueLow` must never be less than `min` and `valueHigh` must never exceed `max`.
