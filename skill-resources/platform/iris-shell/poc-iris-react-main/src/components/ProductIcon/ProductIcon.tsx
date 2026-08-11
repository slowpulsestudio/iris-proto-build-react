import type { CSSProperties } from 'react';

/**
 * ProductIcon — inline SVG glyphs for the product chooser entries.
 *
 * Rendered inline (not <img>) so stroke/fill can use `currentColor`, which
 * means the icon picks up its container's text color and follows the active
 * theme automatically.
 */

export type ProductIconName =
  | 'identity-manager'
  | 'active-roles'
  | 'safeguard'
  | 'services';

export interface ProductIconProps {
  name: ProductIconName;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
}

export function ProductIcon({
  name,
  size = 16,
  className,
  style,
}: ProductIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
    focusable: false as const,
    className,
    style,
  };

  if (name === 'identity-manager') {
    return (
      <svg {...common}>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6m0 0a5.63 5.63 0 0 0-4.5 2.25M12 13.5a5.63 5.63 0 0 1 4.5 2.25m2.25-10.5V3.375m0 1.875-1.783-.58m1.783.58-1.102 1.517M18.75 5.25l1.102 1.517M18.75 5.25l1.783-.58m.342 5.83A8.992 8.992 0 1 1 13.5 3.125"
        />
      </svg>
    );
  }

  if (name === 'active-roles') {
    return (
      <svg {...common}>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 7.375h17.25a.75.75 0 0 1 .75.75v11.204c0 .178-.07.348-.195.474a.66.66 0 0 1-.472.197H3.75a.75.75 0 0 1-.53-.221.76.76 0 0 1-.22-.534zm0 0h9L9.224 4.252A.75.75 0 0 0 8.664 4H3.75a.75.75 0 0 0-.75.75zM12 17c.344-1.294 1.556-2.25 3-2.25m0 0c1.444 0 2.656.956 3 2.25m-3-2.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5M6 12h4m-4 3h3"
        />
      </svg>
    );
  }

  if (name === 'safeguard') {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="m12 21-.237.712a.75.75 0 0 0 .474 0zM4 4l-.182-.728-.568.142V4zm8-2 .182-.728a.75.75 0 0 0-.364 0zm8 2h.75v-.586l-.568-.142zM8.715 14.561a.75.75 0 0 0 1.216.878L9.323 15zm5.354.878a.75.75 0 1 0 1.216-.878l-.608.439zm2.156-4.691a.75.75 0 1 0-.45-1.43l.225.715zM12.75 7a.75.75 0 1 0-1.5 0h1.5M8.225 9.317a.75.75 0 0 0-.45 1.43L8 10.034zM12 21c.237-.712.238-.711.238-.711h-.002l-.011-.005a6 6 0 0 1-.287-.11 12 12 0 0 1-.85-.388 13.5 13.5 0 0 1-2.604-1.713C6.6 16.484 4.75 13.97 4.75 10.167h-1.5c0 4.363 2.149 7.265 4.266 9.052 1.056.89 2.108 1.51 2.897 1.907a13 13 0 0 0 1.239.546l.1.036.007.002.002.001h.001zM4 10.167h.75V4h-1.5v6.167zM4 4l.182.728 8-2L12 2l-.182-.728-8 2zm8 17c.237.712.238.711.238.711h.003q.003-.002.007-.003l.1-.036q.1-.036.278-.108c.235-.095.566-.24.961-.438a15 15 0 0 0 2.897-1.907c2.117-1.787 4.266-4.689 4.266-9.052h-1.5c0 3.803-1.851 6.317-3.734 7.906a13.5 13.5 0 0 1-2.603 1.713 12 12 0 0 1-1.082.478q-.038.014-.056.02l-.011.004h-.002zm8-10.833h.75V4h-1.5v6.167zM20 4l.182-.728-8-2L12 2l-.182.728 8 2zM9.323 15l.608.439 2.677-3.708-.608-.44-.608-.438-2.677 3.708zM12 11.292l-.608.439 2.677 3.708.608-.439.608-.439-2.677-3.708zm0 0 .225.715 4-1.26-.225-.714-.225-.716-4 1.26zm0 0h.75V7h-1.5v4.292zm0 0 .225-.716-4-1.259-.225.716-.225.715 4 1.26z"
        />
      </svg>
    );
  }

  if (name === 'services') {
    return (
      <svg {...common}>
        <path
          stroke="currentColor"
          strokeWidth={1.5}
          d="M14 15h-4m4 0a1.5 1.5 0 1 0 1.033-1.426M14 15a1.5 1.5 0 0 1 1.033-1.426m-6.066 0a1.5 1.5 0 1 1-.936 2.852 1.5 1.5 0 0 1 .936-2.852Zm0 0 2.112-3.89m3.954 3.89-2.112-3.89m-1.842 0c.254.198.574.316.921.316s.667-.118.921-.316a1.5 1.5 0 1 0-1.842 0Zm10.614 1.236q.615 1.08 0 2.16l-3.926 6.84Q17.153 21 15.915 21h-7.83q-1.239 0-1.852-1.08l-3.926-6.84q-.615-1.08 0-2.16l3.926-6.84Q6.847 3 8.085 3h7.83q1.239 0 1.852 1.08z"
        />
      </svg>
    );
  }

  return null;
}
