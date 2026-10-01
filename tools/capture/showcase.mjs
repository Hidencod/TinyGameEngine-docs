#!/usr/bin/env node
/**
 * Showcase games: build each game from its source in TinyGameEngine/showcase/, export
 * the playable HTML and a .tge project, and capture screenshots for its docs page.
 *
 *   (in TinyGameEngine)       npx vite --port 5199 --strictPort
 *   (in TinyGameEngine-docs)  npm run docs:showcase                # all games
 *                             npm run docs:showcase -- street      # games whose slug matches
 *
 * Writes
 *   ../tge-assets/showcase/<slug>/index.html   playable game (GitHub Pages; TGE_ASSETS to override)
 *   ../tge-assets/showcase/<slug>/<slug>.tge   the project, every asset embedded (opens offline)
 *   static/img/showcase/<slug>-*.webp          screenshots
 * The playable files go to tge-assets rather than this repo: they are large and change
 * with every engine release.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { TGE } from './lib.mjs';

const ASSETS = resolve(process.env.TGE_ASSETS ?? resolve(import.meta.dirname, '../../../tge-assets'), 'showcase');
const SHOTS = resolve(import.meta.dirname, '../../static/img/showcase');
const DESKTOP = { width: 1280, height: 720 };

/** module: file in TinyGameEngine/showcase/ exporting createShowcase(). */
const GAMES = [
  { module: 'streetRacer', slug: 'street-racer', shots: streetRacerShots },
];

const filter = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const headed = process.argv.includes('--headed');

try { await fetch(TGE); } catch {
  console.error(`The editor dev server is not running at ${TGE}.\nStart it in TinyGameEngine: npx vite --port 5199 --strictPort`);
  process.exit(1);
}

const browser = await chromium.launch({
  headless: !headed,
  // The real GPU: a whole city in software rendering is too slow for screenshots.
  // SHOWCASE_SWIFTSHADER=1 falls back to software (machines without a usable GPU).
  args: process.env.SHOWCASE_SWIFTSHADER
    ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
    : ['--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});

for (const game of GAMES.filter((g) => !filter.length || filter.some((f) => g.slug.includes(f)))) {
  console.log(`▶ ${game.slug}`);
  const context = await browser.newContext({ viewport: DESKTOP, colorScheme: 'dark', locale: 'en-US' });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.warn('  [pageerror]', e.message));

  // 1. Export: the same code paths as the editor's Export menu.
  await page.goto(TGE + '/', { timeout: 120000 });
  const out = await page.evaluate(async (mod) => {
    const m = await import(`/showcase/${mod}.ts`);
    const ex = await import('/src/export/index.ts');
    const project = m.createShowcase();
    const html = await ex.exportGameHtml(project, async () => null);
    // The .tge carries every asset (library models included), so it opens without internet.
    const full = structuredClone(project);
    for (const a of full.assets) {
      if (a.storage !== 'url' || !a.src) continue;
      const blob = await (await fetch(a.src)).blob();
      a.src = await ex.blobToDataUrl(blob.type ? blob : new Blob([blob], { type: a.mime }));
      a.storage = 'data';
    }
    const tge = await ex.exportProjectFile(full, async () => null);
    const b64 = async (blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(s);
    };
    return { html: await b64(html), tge: await b64(tge) };
  }, game.module);
  const dir = join(ASSETS, game.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), Buffer.from(out.html, 'base64'));
  writeFileSync(join(dir, game.slug + '.tge'), Buffer.from(out.tge, 'base64'));
  console.log(`  ✓ exported (${(out.html.length * 0.75 / 1e6).toFixed(1)} MB html, ${(out.tge.length * 0.75 / 1e6).toFixed(1)} MB tge) → ${dir}`);

  // 2. Screenshots.
  mkdirSync(SHOTS, { recursive: true });
  const shot = async (name, p = page) => {
    await sharp(await p.screenshot()).webp({ quality: 84, effort: 5 }).toFile(join(SHOTS, `${game.slug}-${name}.webp`));
    console.log('  ✓', `${game.slug}-${name}`);
  };
  await game.shots({ page, context, shot, tge: join(dir, game.slug + '.tge'), module: game.module });
  await context.close();
}
await browser.close();

// ---------------------------------------------------------------------------

async function streetRacerShots({ page, shot, tge, module }) {
  // The game itself, through the showcase dev runner (window.__tgeGame = GameAPI).
  await page.goto(`${TGE}/showcase/dev.html?game=${module}`, { timeout: 120000 });
  await page.waitForFunction(() => window.__tgeReady, null, { timeout: 120000 });
  await page.waitForTimeout(3000);
  await shot('start');
  await page.locator('.tge-ui-el.k-button', { hasText: 'Race!' }).first().click();
  // Countdown (3 s of game time), then let the player's car drive itself for the pictures.
  await page.waitForFunction(() => window.__tgeGame.getVar('Racing') === 1, null, { timeout: 120000 });
  await page.evaluate(() => window.__tgeGame.find('Player').setBehaviorParam('car', 'driver', 'ai'));
  await page.waitForTimeout(1500);
  await shot('grid');
  await page.waitForFunction(() => Number(window.__tgeGame.find('Player').getVar('progress')) > 0.07, null, { timeout: 240000 });
  await shot('race');

  // The editor in its desktop layout with the project imported and the event sheet open.
  await page.goto(TGE + '/', { timeout: 120000 });
  await page.waitForSelector('.home', { timeout: 30000 });
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Import \.tge/ }).click();
  await (await chooser).setFiles(tge);
  await page.locator('.project-card', { hasText: 'Street Racer' }).first().click({ timeout: 60000 });
  await page.waitForSelector('.editor.desktop', { timeout: 60000 });
  await page.waitForTimeout(6000);
  await shot('editor');
  await page.locator('.desk-dock .tab[data-tab="logic"]').click();
  await page.locator('.list-row', { hasText: 'Main events' }).first().click();
  await page.waitForSelector('.es-root', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await shot('events');
}
