// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { Preview } from '@storybook/angular';

const BANNER_ID = 'iris-preview-banner';
const GLOBAL_STYLE_ID = 'iris-preview-globals';

// Class toggled on <body> to suppress the a11y vision filter via CSS.
// Using !important overrides the addon's inline body.style.filter assignment
// regardless of when the addon's effects run — no timing dependency.
const VISION_RESET_CLASS = 'iris-a11y-vision-reset';

/**
 * Inject a permanent <style> block into the preview iframe once.
 * Uses CSS custom properties so it automatically reacts to theme class changes
 * on <body> — no re-injection needed per story render.
 *
 * Goals:
 * - Zero out Storybook's default body padding so the preview banner sits
 *   flush at the top edge (padding is moved to #storybook-root instead).
 * - Apply theme background / text colour to both Canvas and Docs views.
 * - Override the hardcoded Storybook background on .docs-story canvas boxes
 *   inside MDX pages.
 */
function ensureGlobalStyles(): void {
  if (document.getElementById(GLOBAL_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = GLOBAL_STYLE_ID;
  style.textContent = `
    /* Remove Storybook's default body padding so the preview banner sits
       flush against the top/side edges of the iframe. */
    body {
      padding: 0 !important;
      margin: 0 !important;
      background: var(--oi-background-color-primary) !important;
      color: var(--oi-content-color-primary) !important;
    }

    /* Re-add comfortable padding on the story canvas root so components
       are not pinned to the iframe edge in Canvas view. */
    #storybook-root {
      padding: 3rem !important;
      box-sizing: border-box;
    }

    /* Docs (MDX) page background — the wrapper rendered in docs viewMode. */
    #storybook-docs {
      background: var(--oi-background-color-primary) !important;
      color: var(--oi-content-color-primary) !important;
    }

    /* Story canvas boxes embedded inside MDX pages. */
    .docs-story {
      background: var(--oi-background-color-primary) !important;
    }

    /* Suppresses the a11y vision simulator filter when no filter should be
       active. !important overrides the addon's inline body.style.filter
       assignment regardless of React effect timing. */
    body.${VISION_RESET_CLASS} {
      filter: none !important;
    }
  `;
  document.head.appendChild(style);
}

interface StatusBannerConfig {
  bannerBg: string;
  bannerBorder: string;
  iconColor: string;
  iconSvg: string;
  badgeBg: string;
  badgeColor: string;
  label: string;
  message: string;
}

const STATUS_BANNERS: Record<string, StatusBannerConfig> = {
  untouched: {
    bannerBg: 'var(--oi-background-color-error)',
    bannerBorder: 'var(--oi-color-red-200)',
    iconColor: 'var(--oi-content-color-error)',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364 5.636 5.636M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/></svg>',
    badgeBg: 'var(--oi-base-color-error)',
    badgeColor: 'var(--oi-content-color-constant)',
    label: 'Untouched',
    message:
      'Automatically generated from Figma without developer review. ' +
      'Functional requirements have not been defined; behaviour, accessibility, and API may be incomplete or incorrect. ' +
      '<strong>Not suitable for use in product applications.</strong>',
  },
  preview: {
    bannerBg: 'var(--oi-background-color-warning)',
    bannerBorder: 'var(--oi-color-orange-200)',
    iconColor: 'var(--oi-content-color-warning)',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 12.375V7.5m9 4.5a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/><path fill="currentColor" d="M12 17.625a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/></svg>',
    badgeBg: 'var(--oi-base-color-warning)',
    badgeColor: 'var(--oi-content-color-primary)',
    label: 'Preview',
    message:
      'Functional requirements have been defined and incorporated into the implementation, but the component has not yet been validated by UX. ' +
      '<strong>API may still change. Use with caution in product applications.</strong>',
  },
  stable: {
    bannerBg: 'var(--oi-background-color-success)',
    bannerBorder: 'var(--oi-color-green-200)',
    iconColor: 'var(--oi-content-color-success)',
    iconSvg:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.25 12.75 10.5 15l5.25-5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/></svg>',
    badgeBg: 'var(--oi-base-color-success)',
    badgeColor: 'var(--oi-content-color-constant)',
    label: 'Stable',
    message:
      'Reviewed and approved by the development team; validated by the UX team. ' +
      '<strong>Safe to use in product applications.</strong>',
  },
};

function applyStatusBanner(tags: string[]): void {
  // Always clean up first — prevents banner accumulation across story navigations
  document.getElementById(BANNER_ID)?.remove();

  const status = ['untouched', 'preview', 'stable'].find((tag) => tags.includes(tag));
  if (!status) {
    return;
  }

  const config = STATUS_BANNERS[status];
  const wrapper = document.createElement('div');
  wrapper.id = BANNER_ID;
  Object.assign(wrapper.style, {
    position: 'sticky',
    top: '0',
    zIndex: '9999',
    padding: 'var(--oi-spacing-m)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--oi-background-color-primary)',
  });

  wrapper.innerHTML = `
    <div style="max-width:1000px;margin:0 auto;display:flex;align-items:flex-start;gap:var(--oi-spacing-l);padding:var(--oi-spacing-l);border-radius:var(--oi-border-radius-l);border:var(--oi-border-width-default) solid ${config.bannerBorder};background-color:${config.bannerBg};font-family:var(--oi-font-family-default);box-sizing:border-box;">
      <div style="flex-shrink:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:${config.iconColor};">
        ${config.iconSvg}
      </div>
      <div style="flex:1;min-width:1px;display:flex;flex-direction:column;gap:var(--oi-spacing-xs);">
        <div>
          <span style="display:inline-flex;align-items:center;height:var(--oi-size-s);padding:0 var(--oi-spacing-xs);border-radius:var(--oi-border-radius-default);border:none;background-color:${config.badgeBg};color:${config.badgeColor};font-size:var(--oi-font-size-s);font-weight:var(--oi-font-weight-400);line-height:var(--oi-line-height-s);white-space:nowrap;">${config.label}</span>
        </div>
        <span style="font-size:var(--oi-font-size-s);font-weight:var(--oi-font-weight-400);color:var(--oi-content-color-secondary);line-height:var(--oi-line-height-s);">${config.message}</span>
      </div>
    </div>
  `;

  document.body.insertBefore(wrapper, document.body.firstChild);
}

// Apply theme and direction on MDX-only pages where no story decorator fires.
// The decorator handles story views; this listener covers pure docs pages.
//
// The channel is set up AFTER preview.ts loads, so we must defer registration.
// The preview receives 'updateGlobals' (delta patch), not 'globalsUpdated'
// (which is a manager-side broadcast).
interface SbChannel {
  on: (event: string, cb: (data: Record<string, unknown>) => void) => void;
}

function applyGlobalsToDocument(globals: Record<string, string>): void {
  const theme = globals['theme'] ?? 'light';
  const direction = (globals['direction'] ?? 'ltr') as 'ltr' | 'rtl';
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-hc-light', 'theme-hc-dark');
  document.body.classList.add(`theme-${theme}`);
  document.documentElement.dir = direction;
  try {
    window.parent.document.documentElement.dir = direction;
  } catch {
    // Cross-origin guard.
  }
  ensureGlobalStyles();
}

// The channel is not yet available when preview.ts first evaluates.
// 'load' fires after all scripts are ready, guaranteeing channel existence
// before any user interaction can trigger a globals change.
window.addEventListener('load', () => {
  try {
    const channel = (window as unknown as Record<string, SbChannel | undefined>)['__STORYBOOK_ADDONS_CHANNEL__'];
    if (!channel) {
      return;
    }
    // 'updateGlobals' carries a delta; merge it with current body classes/dir.
    channel.on('updateGlobals', ({ globals }) => {
      const g = globals as Record<string, string>;
      const currentTheme =
        [...document.body.classList].find((c) => c.startsWith('theme-'))?.replace('theme-', '') ?? 'light';
      const currentDir = (document.documentElement.dir || 'ltr') as string;
      applyGlobalsToDocument({
        theme: g['theme'] ?? currentTheme,
        direction: g['direction'] ?? currentDir,
      });
    });
  } catch {
    // Not available during static build — safe to ignore.
  }
});

const preview: Preview = {
  parameters: {
    // Disable Storybook's built-in Backgrounds toolbar. We ship a custom
    // Theme picker that applies theme-* CSS classes to <body>; the native
    // background swatches are redundant and create conflicting UI.
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Iris UI', 'Actions', 'Inputs', 'Display', 'Overlay', 'Navigation'],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'hc-light', title: 'High Contrast Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'hc-dark', title: 'High Contrast Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'menu',
        items: [
          { value: 'ltr', title: 'LTR text direction', icon: 'arrowrightalt' },
          { value: 'rtl', title: 'RTL text direction', icon: 'arrowleftalt' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    direction: 'ltr',
  },
  tags: [],
  decorators: [
    (storyFn, context) => {
      const theme = context.globals['theme'] ?? 'light';
      const direction = (context.globals['direction'] ?? 'ltr') as 'ltr' | 'rtl';
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-hc-light', 'theme-hc-dark');
      document.body.classList.add(`theme-${theme}`);
      document.documentElement.dir = direction;
      // Also apply to the outer manager frame so the whole browser tab flips.
      try {
        window.parent.document.documentElement.dir = direction;
      } catch {
        // Cross-origin guard — no-op if parent is inaccessible.
      }

      ensureGlobalStyles();

      applyStatusBanner(context.parameters?.['iris']?.['noBanner'] ? [] : (context.tags ?? []));

      // The a11y addon's Vision Simulator has two bugs we work around via CSS:
      //
      // 1. The toolbar button only renders in Canvas view, so there is no UI to
      //    reset an active filter after navigating to Docs.
      //
      // 2. The addon's "remove filter" path uses a regex built from unescaped CSS
      //    filter strings — it never matches, so clicking "None" does not clear
      //    body.style.filter. Timing-based fixes (rAF, setTimeout) are unreliable
      //    because the addon may have its own deferred re-apply logic.
      //
      // Solution: toggle a CSS class on <body> that applies `filter: none !important`.
      // A stylesheet !important rule overrides any inline style the addon sets,
      // regardless of when or how many times the addon's effects run.
      const hasActiveVisionFilter = Boolean(context.globals['vision']) && context.viewMode === 'story';
      document.body.classList.toggle(VISION_RESET_CLASS, !hasActiveVisionFilter);

      return storyFn();
    },
  ],
};

export default preview;
