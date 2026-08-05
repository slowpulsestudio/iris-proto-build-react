// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import type { EventEmitter } from 'events';
import { beforeAll } from 'vitest';

// jsdom (used by vitest) does not support CSS @layer cascade rules, which Angular CDK overlay styles use.
// This causes "Error: Could not parse CSS stylesheet" noise on every test involving overlays/modals.
// The errors are cosmetic — tests pass and components behave correctly.
//
// Root cause: jsdom emits these via VirtualConsole.emit("jsdomError", ...). The sendTo() call registered
// inside vitest's environment setup captures the ORIGINAL Node.js console (before vitest replaces it),
// so the errors bypass globalThis.console entirely and write straight to process.stderr.
// Patching console.error after the fact has no effect for this path.
//
// Fix: intercept at the VirtualConsole event level (window._virtualConsole) inside beforeAll,
// after the jsdom window exists but before tests run. Remove the default jsdomError listener
// installed by sendTo() and replace it with a filtered version.
//
// Remove this workaround once jsdom gains @layer support (tracked in jsdom/jsdom#3813)
// or the Angular test runner switches to a real browser environment.
const CSS_PARSE_ERROR = 'Error: Could not parse CSS stylesheet';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const virtualConsole = (window as any)._virtualConsole as (EventEmitter & { sendTo?: unknown }) | undefined;
  if (!virtualConsole) {
    return;
  }

  // Remove the jsdomError listener registered by sendTo() and add a filtered replacement.
  virtualConsole.removeAllListeners('jsdomError');
  virtualConsole.on('jsdomError', (e: Error) => {
    if (!String(e.stack).includes(CSS_PARSE_ERROR)) {
      console.error(e.stack);
    }
  });
});
