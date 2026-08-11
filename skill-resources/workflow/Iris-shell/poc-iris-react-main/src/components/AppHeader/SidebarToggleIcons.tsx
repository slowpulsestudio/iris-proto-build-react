/**
 * Inline SVGs for the header sidebar-toggle button.
 *
 * Not registered in `src/icons/manifest.json` — these are local to AppHeader
 * and only used by the toggle. Stroke/fill use `currentColor` so they inherit
 * IconButton's text color (driven by design tokens).
 */

export function SidebarExpandedIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 5.5H19C19.8284 5.5 20.5 6.17157 20.5 7V17C20.5 17.8284 19.8284 18.5 19 18.5H5C4.17157 18.5 3.5 17.8284 3.5 17V7C3.5 6.17157 4.17157 5.5 5 5.5Z"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7H6C5.44772 7 5 7.44772 5 8V16C5 16.5523 5.44772 17 6 17H12C12.5523 17 13 16.5523 13 16V8C13 7.44772 12.5523 7 12 7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SidebarCollapsedIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 5.5H19C19.8284 5.5 20.5 6.17157 20.5 7V17C20.5 17.8284 19.8284 18.5 19 18.5H5C4.17157 18.5 3.5 17.8284 3.5 17V7C3.5 6.17157 4.17157 5.5 5 5.5Z"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 7H6C5.44772 7 5 7.44772 5 8V16C5 16.5523 5.44772 17 6 17H8C8.55228 17 9 16.5523 9 16V8C9 7.44772 8.55228 7 8 7Z"
        fill="currentColor"
      />
    </svg>
  );
}
