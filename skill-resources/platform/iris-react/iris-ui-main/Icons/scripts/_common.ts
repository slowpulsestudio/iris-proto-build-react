// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { readdir } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';

export const PNG_SIZES = [16, 24, 32, 48, 64, 128] as const;
export const CONCURRENCY = Math.max(2, availableParallelism());

export const isTTY = process.stdout.isTTY === true;
export const dim = (s: string) => (isTTY ? `\x1b[2m${s}\x1b[0m` : s);
export const green = (s: string) => (isTTY ? `\x1b[32m${s}\x1b[0m` : s);
export const bold = (s: string) => (isTTY ? `\x1b[1m${s}\x1b[0m` : s);

let lastDraw = 0;
export function progress(label: string, current: number, total: number, item: string) {
  if (!isTTY) return;
  const now = Date.now();
  if (current !== total && now - lastDraw < 50) return;
  lastDraw = now;
  process.stdout.write(`\r\x1b[2K  ${label} ${dim(`[${current}/${total}]`)} ${item}`);
}

export function done(label: string, total: number, ms: number) {
  const line = `  ${green('✓')} ${label} ${dim(`(${total} in ${ms}ms)`)}`;
  if (isTTY) process.stdout.write(`\r\x1b[2K${line}\n`);
  else process.stdout.write(`${line}\n`);
}

export async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = await Promise.all(
    entries.map((e) => {
      const p = join(dir, e.name);
      if (e.isDirectory()) return walk(p);
      if (e.isFile() && p.endsWith('.svg')) return Promise.resolve([p]);
      return Promise.resolve([]);
    }),
  );
  return out.flat();
}

export function detectSourceSize(svg: string): number {
  const vb = svg.match(/viewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/);
  if (vb) return Math.max(Number(vb[1]), Number(vb[2]));
  const w = svg.match(/\bwidth="([\d.]+)"/);
  return w ? Number(w[1]) : 24;
}

export const toPosix = (p: string) => (process.platform === 'win32' ? p.split('\\').join('/') : p);

export async function pool<T>(items: T[], limit: number, fn: (item: T, index: number) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}
