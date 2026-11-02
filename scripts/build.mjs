// Build the static site (Cloudflare Pages or Vercel): copy only what the web app serves into dist/.
// Cloudflare Pages settings — Build command: node scripts/build.mjs   Output directory: dist
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const OUT = 'dist';
const FILES = ['index.html', 'manifest.webmanifest', 'icon.svg', 'sw.js'];
const DIRS = ['css', 'js', 'content', 'icons'];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const f of FILES) cpSync(f, `${OUT}/${f}`);
for (const d of DIRS) cpSync(d, `${OUT}/${d}`, { recursive: true });

// A new cache name per deploy, so installed copies pick up the update on next launch.
let rev = process.env.CF_PAGES_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || '';
if (!rev) { try { rev = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { rev = String(Date.now()); } }
const sw = readFileSync(`${OUT}/sw.js`, 'utf8').replace(/const VERSION = '[^']*';/, `const VERSION = 'neuroatlas-${rev.slice(0, 12)}';`);
writeFileSync(`${OUT}/sw.js`, sw);

// Cloudflare Pages headers: always revalidate the service worker and the page shell.
writeFileSync(`${OUT}/_headers`, [
  '/sw.js', '  Cache-Control: no-cache', '',
  '/', '  Cache-Control: no-cache', '',
  '/index.html', '  Cache-Control: no-cache', '',
  '/*', '  X-Content-Type-Options: nosniff', '  Referrer-Policy: strict-origin-when-cross-origin', '',
].join('\n'));

const missing = FILES.concat(DIRS).filter(p => !existsSync(`${OUT}/${p}`));
if (missing.length) { console.error('missing in dist:', missing); process.exit(1); }
console.log(`built ${OUT}/ (cache neuroatlas-${rev.slice(0, 12)})`);
