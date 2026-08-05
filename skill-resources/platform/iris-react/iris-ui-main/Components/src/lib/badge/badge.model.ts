// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/** Semantic type of the badge, which determines its color. */
export type BadgeType = 'default' | 'info' | 'success' | 'error' | 'warning';
/** Configuration object used by components that render a badge inline (e.g. menu items). */
export interface BadgeConfig {
  /** Semantic type determining the badge color. */
  type: BadgeType;
  /** When `true`, renders the bold/filled badge variant for higher visual prominence. */
  strong: boolean;
}
