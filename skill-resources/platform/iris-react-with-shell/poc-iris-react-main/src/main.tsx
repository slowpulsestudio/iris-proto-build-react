import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Token layer (order matters: primitives → semantic theme overrides → custom)
import './tokens/tokens.primitives.css';
import './tokens/tokens.light.css';
import './tokens/tokens.dark.css';
import './tokens/tokens.hc-light.css';
import './tokens/tokens.hc-dark.css';
import './tokens/tokens.custom.css';
// "More themes" (popular VS Code themes), kept separate from the core set.
// Imported last so their body.theme-* overrides win over the base light set.
import './tokens/more-themes/index.css';
// Chart categorical series tokens, kept separate from the semantic token files.
import './tokens/charts/tokens.charts.css';
import './tokens/charts/tokens.charts.more-themes.css';

// Base
import './styles/reset.css';
import './styles/typography.css';
import './styles/base.css';
import './styles/scroll.css';

import App from './App.js';
import { THEMES } from './lib/useTheme.js';

// Default theme. The useTheme hook later restores the user's saved
// preference; this prevents a flash if no preference is stored.
const STORED_THEME = localStorage.getItem('ars.theme');
const VALID = THEMES.map((t) => t.value) as string[];
const initial = STORED_THEME && VALID.includes(STORED_THEME) ? STORED_THEME : 'dark';
document.body.classList.add(`theme-${initial}`);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
