# Badge — Functional Requirements and Hints

A small inline label used to communicate status, category, or a count at a glance.

## What it does

Displays a compact badge with a border, optional background fill, and optional leading icon. The badge can show text only, an icon with text, or an icon with no text (icon-only).

## Variants

Five intent types are available: default, info, success, error, and warning. Each type uses a distinct border and text color.

A strong mode increases visual emphasis by filling the badge with a solid background colour matching the intent, with white text on top (warning uses dark text for contrast).

## Icon

An optional leading icon can appear before the label text. When no text is provided and an icon is shown, the badge renders as a square.

## What it does not do

Does not support interactive states (hover, focus, click). Does not wrap to multiple lines.
