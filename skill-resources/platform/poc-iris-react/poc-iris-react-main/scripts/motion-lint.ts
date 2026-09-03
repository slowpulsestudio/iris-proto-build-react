// Motion guardrail — greps src for the animation "never ship" list from the
// `animate` skill. High-signal only; exits non-zero on any hit.
//   run: node scripts/motion-lint.ts
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const TOKENS = join(SRC, 'tokens');

interface Rule {
  name: string;
  re: RegExp;
  applies: (path: string) => boolean;
}

const isStyle = (p: string) => p.endsWith('.css');
const isCode = (p: string) => p.endsWith('.ts') || p.endsWith('.tsx');
const notTokens = (p: string) => !p.startsWith(TOKENS);

const rules: Rule[] = [
  { name: 'transition: all (name the exact properties)', re: /transition:\s*all\b/, applies: isStyle },
  { name: 'scale(0) entrance (use scale(0.95) + opacity)', re: /scale\(\s*0\s*\)/, applies: isStyle },
  {
    name: 'built-in ease-in on UI (use --oi-motion-ease-emphasized)',
    re: /(^|[\s,(])ease-in(?![-\w])/,
    applies: (p) => isStyle(p) && notTokens(p),
  },
  {
    name: 'forked curve cubic-bezier(0.22, 1, 0.36, 1) (use the token)',
    re: /cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/,
    applies: (p) => (isStyle(p) || isCode(p)) && notTokens(p),
  },
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const hits: string[] = [];
for (const file of walk(SRC)) {
  const active = rules.filter((r) => r.applies(file));
  if (active.length === 0) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const rule of active) {
      if (rule.re.test(line)) {
        hits.push(`${file.replace(SRC, 'src')}:${i + 1}  ${rule.name}\n    ${line.trim()}`);
      }
    }
  });
}

if (hits.length > 0) {
  console.error(`motion-lint: ${hits.length} violation(s)\n`);
  console.error(hits.join('\n'));
  process.exit(1);
}
console.log('motion-lint: clean');
