// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { loadConfig, optimize } from 'svgo';
import { CONCURRENCY, PNG_SIZES, bold, detectSourceSize, dim, done, green, pool, progress, walk } from './_common.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src/icons');
const OUT = join(ROOT, 'dist-assets');
const SVG_OUT = join(OUT, 'svg');
const PNG_OUT = join(OUT, 'png');

async function main() {
  const t0 = Date.now();
  console.log(bold('\niris-ui-icons asset build\n'));
  await rm(OUT, { recursive: true, force: true });

  const svgoConfig = await loadConfig(join(ROOT, 'svgo.config.mjs'));
  const files = await walk(SRC);

  if (files.length === 0) {
    console.warn('  No SVG icons found in src/icons');
    return;
  }

  // Stage 1: optimize SVGs → dist-assets/svg/
  const tSvg = Date.now();
  let svgDone = 0;
  interface Optimized {
    rel: string;
    svg: string;
    size: number;
  }
  const optimized: Optimized[] = new Array(files.length);

  await pool(files, CONCURRENCY, async (file, idx) => {
    const rel = relative(SRC, file);
    const raw = await readFile(file, 'utf8');
    const { data } = optimize(raw, { path: file, ...svgoConfig });

    const dest = join(SVG_OUT, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, data);

    optimized[idx] = { rel, svg: data, size: detectSourceSize(data) };
    svgDone++;
    progress('Optimizing SVGs', svgDone, files.length, rel);
  });
  done('Optimized SVGs', files.length, Date.now() - tSvg);

  // Stage 2: rasterize PNGs → dist-assets/png/<size>/
  const totalPngs = files.length * PNG_SIZES.length;
  const tPng = Date.now();
  let pngDone = 0;

  await pool(optimized, CONCURRENCY, async (o) => {
    const buf = Buffer.from(o.svg);
    for (const size of PNG_SIZES) {
      const dest = join(PNG_OUT, String(size), o.rel.replace(/\.svg$/, '.png'));
      await mkdir(dirname(dest), { recursive: true });
      const density = Math.max(1, Math.ceil((72 * size) / o.size));
      await sharp(buf, { density }).resize(size, size).png({ compressionLevel: 9 }).toFile(dest);
      pngDone++;
      progress('Generating PNGs', pngDone, totalPngs, `${o.rel} @${size}`);
    }
  });
  done('Generated PNGs', totalPngs, Date.now() - tPng);

  console.log(
    `\n${bold(green('✓ Done'))} ${dim(`${files.length} icons · ${PNG_SIZES.length} PNG sizes · ${Date.now() - t0}ms`)}\n`,
  );
}

main().catch((err) => {
  if (process.stdout.isTTY) process.stdout.write('\n');
  console.error(err);
  process.exit(1);
});
