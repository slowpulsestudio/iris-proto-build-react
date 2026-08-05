# Avatar — Functional Requirements and Hints

## Two display types

The avatar supports two mutually exclusive display types: `'face'` and `'placeholder'` (default). Only one is active at a time based on the `type` input.

## Face type

When `type` is `'face'`, the avatar displays a photo. The photo is only rendered when a source URL is provided. If no URL is given, nothing is rendered inside the avatar — the placeholder type should be used instead.

## Placeholder type

When `type` is `'placeholder'`, the avatar displays a short text label (typically one or two initials). The text is always visible regardless of interaction state.

## Four sizes

The avatar supports four sizes: `'sm'`, `'md'`, `'default'` (default), and `'lg'`. The size affects the container dimensions and the text size proportionally.

## Accessible label

The avatar exposes an accessible label. For face avatars, the label comes from the `alt` text describing the photo. For placeholder avatars, the label comes from the initials text. Either value serves as the accessible name for the element.

## Photo covers the full container

When a photo is displayed, it fills the entire avatar area without distortion, cropping to fit the circular shape.
