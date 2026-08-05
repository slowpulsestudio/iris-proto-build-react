# Spinner — Functional Requirements and Hints

## Loop scenario

The spinner's default scenario represents an operation of unknown duration. There is no progress value in this state — the animation runs indefinitely.

## Completion scenario

When the progress of an operation is known, the spinner shows a static arc that fills proportionally to a progress value between 0 and 100. The arc does not animate. Progress values outside the 0–100 range are clamped to the nearest boundary. Values between 91 and 99 are further clamped to 90 so the arc never visually closes the circle — a closed circle is reserved exclusively for 100 to signal that the operation is fully complete.

## Sizes

The size does not affect behaviour, only visual weight.
