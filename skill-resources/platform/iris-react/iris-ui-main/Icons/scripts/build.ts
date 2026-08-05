// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, optimize } from 'svgo';
import { CONCURRENCY, bold, dim, done, green, pool, progress, toPosix, walk } from './_common.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src/icons');
const OUT = join(ROOT, 'dist');
const ICONS_OUT = join(OUT, 'icons');

interface Optimized {
  category: string;
  baseName: string;
  svg: string;
}

async function main() {
  const t0 = Date.now();
  console.log(bold('\niris-ui-icons build\n'));
  await rm(OUT, { recursive: true, force: true });

  const svgoConfig = await loadConfig(join(ROOT, 'svgo.config.mjs'));
  const files = await walk(SRC);

  if (files.length === 0) {
    console.warn('  No SVG icons found in src/icons');
    return;
  }

  // Stage 1: optimize SVGs (parallel, bounded).
  const optimized: Optimized[] = new Array(files.length);
  const tSvg = Date.now();
  let svgDone = 0;
  await pool(files, CONCURRENCY, async (file, idx) => {
    const rel = relative(SRC, file);
    const category = dirname(rel);
    const baseName = basename(rel, '.svg');

    const raw = await readFile(file, 'utf8');
    const { data } = optimize(raw, { path: file, ...svgoConfig });

    optimized[idx] = { category, baseName, svg: data };
    svgDone++;
    progress('Optimizing SVGs', svgDone, files.length, rel);
  });
  done('Optimized SVGs', files.length, Date.now() - tSvg);

  // Stage 2: manifest + named SVG exports + entry files.
  const tMeta = Date.now();
  await mkdir(OUT, { recursive: true });
  const icons = optimized
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category) || a.baseName.localeCompare(b.baseName))
    .map((o) => ({
      name: o.baseName,
      category: o.category === '.' ? 'uncategorized' : toPosix(o.category),
      svg: o.svg,
    }));

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify({ icons }, null, 2));

  // Barrel: dist/icons/index.js + index.cjs + index.d.ts
  const sorted = optimized.slice().sort((a, b) => a.baseName.localeCompare(b.baseName));
  await mkdir(ICONS_OUT, { recursive: true });
  await writeFile(
    join(ICONS_OUT, 'index.js'),
    sorted.map((o) => `export const ${o.baseName} = ${JSON.stringify(o.svg)};`).join('\n') + '\n',
  );
  await writeFile(
    join(ICONS_OUT, 'index.cjs'),
    '"use strict";\n' + sorted.map((o) => `exports.${o.baseName} = ${JSON.stringify(o.svg)};`).join('\n') + '\n',
  );
  await writeFile(
    join(ICONS_OUT, 'index.d.ts'),
    sorted.map((o) => `export declare const ${o.baseName}: string;`).join('\n') +
      '\n\nexport type IconName = ' +
      sorted.map((o) => `'${o.baseName}'`).join(' | ') +
      ';\n',
  );

  // Main entry
  await writeFile(
    join(OUT, 'index.js'),
    `import manifest from './manifest.json' with { type: 'json' };\nexport { manifest };\nexport const icons = manifest.icons;\nexport * from './icons/index.js';\n`,
  );
  await writeFile(
    join(OUT, 'index.cjs'),
    `"use strict";\nconst manifest = require('./manifest.json');\nexports.manifest = manifest;\nexports.icons = manifest.icons;\nObject.assign(exports, require('./icons/index.cjs'));\n`,
  );
  await writeFile(
    join(OUT, 'index.d.ts'),
    `export interface Icon {\n  name: string;\n  category: string;\n  svg: string;\n}\nexport interface Manifest {\n  icons: Icon[];\n}\nexport declare const manifest: Manifest;\nexport declare const icons: Icon[];\nexport * from './icons/index.js';\n`,
  );
  done('Wrote manifest + icons + entry', 3, Date.now() - tMeta);

  console.log(`\n${bold(green('✓ Done'))} ${dim(`${icons.length} icons · ${Date.now() - t0}ms`)}\n`);
}

main().catch((err) => {
  if (process.stdout.isTTY) process.stdout.write('\n');
  console.error(err);
  process.exit(1);
});
