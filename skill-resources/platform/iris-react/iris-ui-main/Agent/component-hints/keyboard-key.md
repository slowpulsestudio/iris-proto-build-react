# Keyboard Key — Functional Requirements and Hints

## Character capitalisation

When the key label is exactly one character long, it is always displayed in upper case. Labels with two or more characters are displayed in sentence case: the first character is upper case and the remaining characters are lower case.

## Key combinations

When multiple key labels are provided as an array, the component renders each key in sequence separated by a `+` connector. This communicates a keyboard shortcut that requires all keys to be pressed simultaneously, such as Ctrl+S or Shift+Alt+Delete. Each individual key label in a combination follows the same capitalisation rules as a standalone key.
