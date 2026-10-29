import type { ThemeDef } from './useTheme.js';

/**
 * "More themes" — a separately-listed set of popular VS Code themes, kept
 * distinct from the 4 core design-system themes. Colors live in
 * src/tokens/more-themes/*.css; this module only declares the switcher entries.
 *
 * `swatch` is the theme's signature accent, shown as a colored dot in the menu.
 */
export type MoreThemeValue =
  | 'dracula'
  | 'night-owl'
  | 'ayu'
  | 'tokyo-night'
  | 'catppuccin'
  | 'monokai'
  | 'synthwave'
  | 'aura'
  | 'flexoki';

export const MORE_THEMES: ThemeDef[] = [
  { value: 'night-owl', label: 'Night Owl', icon: 'Palette', bodyClass: 'theme-night-owl', group: 'more', swatch: '#7E57C2' },
  { value: 'ayu', label: 'Ayu', icon: 'Palette', bodyClass: 'theme-ayu', group: 'more', swatch: '#E6B450' },
  { value: 'tokyo-night', label: 'Tokyo Night', icon: 'Palette', bodyClass: 'theme-tokyo-night', group: 'more', swatch: '#7AA2F7' },
  { value: 'catppuccin', label: 'Catppuccin', icon: 'Palette', bodyClass: 'theme-catppuccin', group: 'more', swatch: '#89B4FA' },
  { value: 'monokai', label: 'Monokai', icon: 'Palette', bodyClass: 'theme-monokai', group: 'more', swatch: '#F92672' },
  { value: 'dracula', label: 'Dracula', icon: 'Palette', bodyClass: 'theme-dracula', group: 'more', swatch: '#BD93F9' },
  { value: 'synthwave', label: "Synthwave '84", icon: 'Palette', bodyClass: 'theme-synthwave', group: 'more', swatch: '#FF7EDB' },
  { value: 'aura', label: 'Aura', icon: 'Palette', bodyClass: 'theme-aura', group: 'more', swatch: '#A277FF' },
  { value: 'flexoki', label: 'Flexoki', icon: 'Palette', bodyClass: 'theme-flexoki', group: 'more', swatch: '#4385BE' },
];
