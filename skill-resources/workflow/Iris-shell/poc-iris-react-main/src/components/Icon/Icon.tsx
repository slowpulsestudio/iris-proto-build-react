import { useMemo, type CSSProperties, type HTMLAttributes } from 'react';
import manifest from '../../icons/manifest.json';
import styles from './Icon.module.css';
import { cx } from '../../lib/cx.js';

// Index icons by name once. Each entry is the raw <svg…> string.
const ICONS_BY_NAME: Record<string, string> = (() => {
  const map: Record<string, string> = Object.create(null);
  for (const i of manifest.icons) map[i.name] = i.svg;
  return map;
})();

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'title'> {
  /** Icon name, e.g. "MagnifyingGlass". */
  name: string;
  /** CSS length applied to width/height. */
  size?: string;
  /** Accessible title; omit for decorative use. */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Icon — renders a named SVG from the design system icon library.
 *
 * The SVG sources use `currentColor` for strokes/fills, so colour is driven
 * purely by the surrounding text colour. Size is set via the `size` prop
 * (a CSS length) and applied to width/height of the host element.
 */
export function Icon({ name, size = '20px', title, className, ...rest }: IconProps) {
  const svg = ICONS_BY_NAME[name];

  // Inject role/aria attributes into the raw svg string when a title is given.
  const html = useMemo(() => {
    if (!svg) return '';
    if (!title) {
      // decorative
      return svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
    }
    return svg
      .replace('<svg ', '<svg role="img" focusable="false" ')
      .replace('>', `><title>${escapeXml(title)}</title>`);
  }, [svg, title]);

  if (!svg) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`<Icon name="${name}" /> not found in manifest.`);
    }
    return null;
  }

  return (
    <span
      {...rest}
      className={cx(styles.icon, className)}
      style={{ width: size, height: size, ...rest.style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
