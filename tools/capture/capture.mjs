#!/usr/bin/env node
/**
 * Capture every documentation screenshot from the real editor.
 *
 *   (in TinyGameEngine)       npx vite --port 5199 --strictPort
 *   (in TinyGameEngine-docs)  npm run docs:shots                 # all scenarios
 *                             npm run docs:shots -- home events  # scenarios whose file name matches
 *                             npm run docs:shots -- --shot=inspector-mesh   # only shots whose name contains this
 *
 * Each scenario (tools/capture/scenarios/*.mjs) runs in a fresh browser context (empty
 * storage), drives the editor like a user and saves static/img/shots/<name>.webp.
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { editorHelpers, PHONE, Shooter, TGE } from './lib.mjs';

const args = process.argv.slice(2);
const shotFilter = args.filter((a) => a.startsWith('--shot=')).map((a) => a.slice(7));
const headed = args.includes('--headed');
const names = args.filter((a) => !a.startsWith('--'));

const dir = resolve(import.meta.dirname, 'scenarios');
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()
  .filter((f) => !names.length || names.some((n) => f.includes(n)));

try { await fetch(TGE); } catch {
  console.error(`The editor dev server is not running at ${TGE}.\nStart it in TinyGameEngine: npx vite --port 5199 --strictPort`);
  process.exit(1);
}

const browser = await chromium.launch({
  headless: !headed,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
let total = 0, failed = 0;
for (const f of files) {
  const mod = await import(pathToFileURL(join(dir, f)).href);
  const viewport = mod.viewport ?? PHONE;
  const context = await browser.newContext({
    viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    colorScheme: 'dark', locale: 'en-US', timezoneId: 'America/New_York',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.warn('  [pageerror]', e.message));
  const s = new Shooter(page, { only: shotFilter.length ? shotFilter : null });
  const H = editorHelpers(page, s);
  console.log(`▶ ${f}`);
  const t0 = Date.now();
  try {
    await mod.run({ page, s, H, context, browser });
  } catch (err) {
    failed++;
    console.error(`  ✗ ${f} failed:`, err.message.split('\n')[0]);
    await page.screenshot({ path: join(resolve(import.meta.dirname, '../../.capture-errors'), f + '.png') }).catch(() => {});
  }
  total += s.count;
  console.log(`  ${s.count} shots in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  await context.close();
}
await browser.close();
console.log(`\n${total} screenshots${failed ? `, ${failed} scenario(s) failed (see .capture-errors/)` : ''}`);
process.exit(failed ? 1 : 0);
