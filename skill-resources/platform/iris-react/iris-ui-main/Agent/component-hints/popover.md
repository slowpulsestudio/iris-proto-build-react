# Popover — Functional Requirements and Hints

## Directive trigger

The directive does not bind any event automatically. The consumer wires up the desired trigger (click, hover, focus, or any other event) and calls `toggle()`, `open()`, or `close()` on the directive instance via a template reference variable (`#myPopover="irisPopover"`). This keeps trigger behaviour fully in the consumer's control.

## Content

The content displayed inside the popover panel is supplied by the consumer as a template reference. The popover renders whatever the consumer provides — it does not prescribe a fixed structure.

## Overlay positioning

The default preferred position is bottom-center (the panel appears centered below the trigger). When the preferred position does not fit within the viewport, the overlay automatically tries fallback positions in order: bottom-center → bottom-start → bottom-end → top-center → top-start → top-end. The preferred position is configurable by the consumer.

## Close behaviour

The popover closes when the user clicks anywhere outside the panel, presses Escape, or when the host element is destroyed.

## Open animation

When the popover panel appears, it plays a brief entrance animation. This gives users a clear visual cue that the overlay has opened.

## Accessibility

The trigger element carries `aria-haspopup="dialog"` at all times. When the popover is open, the trigger also carries `aria-expanded="true"` and `aria-controls` referencing the panel element. When closed, `aria-expanded` is `false` and `aria-controls` is removed. The panel uses `role="dialog"`.
