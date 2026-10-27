#!/usr/bin/env node
/**
 * Showcase games: build each game from its source in TinyGameEngine/showcase/, export
 * the playable HTML and a .tge project, and capture screenshots for its docs page.
 *
 *   (in TinyGameEngine)       npm run build:player   # the export embeds this prebuilt player:
 *                                                   # rebuild it after engine changes
 *                             npx vite --port 5199 --strictPort
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
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { TGE } from './lib.mjs';

const ASSETS = resolve(process.env.TGE_ASSETS ?? resolve(import.meta.dirname, '../../../tge-assets'), 'showcase');
const SHOTS = resolve(import.meta.dirname, '../../static/img/showcase');
const DESKTOP = { width: 1280, height: 720 };

/** module: file in TinyGameEngine/showcase/ exporting createShowcase(). */
const GAMES = [
  { module: 'streetRacer', slug: 'street-racer', shots: streetRacerShots, expect: 'Race!' },
  { module: 'lootRoom', slug: 'loot-room', shots: lootRoomShots },
  { module: 'crystalVault', slug: 'crystal-vault', shots: crystalVaultShots, expect: 'Crystals: 0 / 6' },
  { module: 'holeRush', slug: 'hungry-hole', shots: holeRushShots, expect: 'Hungry Hole' },
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

  // 1b. The exported game, as a visitor gets it (a plain web page): it must start without errors and show
  // its texts. This catches anything the export leaves out (localization, timelines, services...).
  await checkExported(browser, join(dir, 'index.html'), game);

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
  await page.getByText(/Race!/).first().click({ force: true });
  // Countdown (3 s of game time), then let the player's car drive itself for the pictures.
  await page.waitForFunction(() => window.__tgeGame.getVar('Racing') === 1, null, { timeout: 120000 });
  await page.evaluate(() => window.__tgeGame.find('Player').setBehaviorParam('car', 'driver', 'ai'));
  await page.waitForTimeout(1500);
  await shot('grid');
  await page.waitForFunction(() => Number(window.__tgeGame.find('Player').getVar('progress')) > 0.07, null, { timeout: 240000 });
  await shot('race');

  // The editor in its desktop layout with the project imported and the event sheet open.
  await page.goto(TGE + '/', { timeout: 120000 });
  await page.waitForSelector('.hm', { timeout: 30000 });
  await importTge(page, tge);
  await page.locator('.hm-card', { hasText: 'Street Racer' }).first().click({ timeout: 60000 });
  await page.waitForSelector('.editor.desktop', { timeout: 60000 });
  await page.waitForTimeout(6000);
  await shot('editor');
  await page.locator('.desk-area .tab[data-tab="logic"]').click();
  await page.locator('.list-row', { hasText: 'Main events' }).first().click();
  await page.waitForSelector('.es-root', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await shot('events');
}

async function lootRoomShots({ page, shot, tge, module }) {
  await page.goto(`${TGE}/showcase/dev.html?game=${module}`, { timeout: 120000 });
  await page.waitForFunction(() => window.__tgeReady, null, { timeout: 120000 });
  await page.waitForFunction(() => window.__tgeGame.select('#loot').length === 12, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  await shot('room');
  // Walk over a few things (the player is moved straight onto them; the pick-up code is the game's own).
  await page.evaluate(async () => {
    const g = window.__tgeGame;
    const p = g.first('Player');
    for (const [item, n] of [['Sword', 1], ['Heal Potion', 3], ['Apple', 2], ['Gold Key', 1], ['Diamond', 1]]) {
      for (const l of g.select('#loot').filter((e) => e.getVar('item') === item).slice(0, n)) {
        p.setPosition(l.position.x, 0.6, l.position.z);
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  });
  await page.waitForTimeout(500);
  await page.getByText(/🎒/).first().click({ force: true });
  await page.waitForTimeout(500);
  // Drag the Sword (slot 0) to slot 5, then select the potions.
  const box = async (name) => (await page.locator(`[data-entity-id="${await page.evaluate((n) => window.__tgeGame.find(n).id, name)}"]`).boundingBox());
  const a = await box('Slot0'), b = await box('Slot5');
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  const c = await box('Slot1');
  await page.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
  await page.waitForTimeout(600);
  await shot('bag');
  await page.getByText('✕').first().click({ force: true });
  await page.getByText(/Items/).first().click({ force: true });
  await page.waitForTimeout(800);
  await shot('book');
  // The project in the editor, with its data table open.
  await page.goto(TGE + '/', { timeout: 120000 });
  await page.waitForSelector('.hm', { timeout: 30000 });
  await importTge(page, tge);
  await page.locator('.hm-card', { hasText: 'Loot Room' }).first().click({ timeout: 60000 });
  await page.waitForSelector('.editor.desktop', { timeout: 60000 });
  await page.waitForTimeout(5000);
  await shot('editor');
}

async function crystalVaultShots({ page, shot, tge, module }) {
  await page.goto(`${TGE}/showcase/dev.html?game=${module}`, { timeout: 120000 });
  await page.waitForFunction(() => window.__tgeReady, null, { timeout: 120000 });
  // The intro: the camera is still pushing in and the title is fading.
  await page.waitForTimeout(1800);
  await shot('intro');
  await page.waitForFunction(() => window.__tgeGame.getVar('Started') === 1, null, { timeout: 120000 });
  await page.waitForTimeout(1200);
  await shot('play');
  // The same screen in French.
  await page.evaluate(() => { window.__tgeGame.language = 'fr'; });
  await page.waitForTimeout(500);
  await shot('french');
  await page.evaluate(() => { window.__tgeGame.language = 'en'; });
  // Clear the vault (the player is put on each crystal; the guards are kept in a corner) for the win screen.
  await page.evaluate(async () => {
    const g = window.__tgeGame;
    const p = g.find('Player');
    for (const c of g.select('#crystal')) {
      for (let i = 0; i < 6; i++) {
        p.setPosition(c.position.x, 0.9, c.position.z);
        for (const gd of g.select('Guard')) gd.setPosition(9, 0.5, 9);
        await new Promise((r) => setTimeout(r, 40));
      }
    }
  });
  await page.waitForTimeout(2500);
  await shot('win');
  // The project in the editor, with its event sheet open.
  await page.goto(TGE + '/', { timeout: 120000 });
  await page.waitForSelector('.hm', { timeout: 30000 });
  await importTge(page, tge);
  await page.locator('.hm-card', { hasText: 'Crystal Vault' }).first().click({ timeout: 60000 });
  await page.waitForSelector('.editor.desktop', { timeout: 60000 });
  await page.waitForTimeout(5000);
  await shot('editor');
  await page.locator('.desk-area .tab[data-tab="logic"]').click();
  await page.locator('.list-row', { hasText: 'Main events' }).first().click();
  await page.waitForSelector('.es-root', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await shot('events');
}

async function holeRushShots({ page, shot, tge, module }) {
  await page.goto(`${TGE}/showcase/dev.html?game=${module}`, { timeout: 120000 });
  await page.waitForFunction(() => window.__tgeReady, null, { timeout: 120000 });
  await page.waitForTimeout(4000);
  await shot('start');
  // A bot plays by pressing the arrow keys towards the nearest thing the hole can swallow; time is stepped by hand.
  await page.evaluate(() => {
    const g = window.__tgeGame;
    cancelAnimationFrame(g.raf);
    const key = (type, code) => window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
    const hole = g.find('Hole');
    const keys = ['KeyA', 'KeyD', 'KeyW', 'KeyS'];
    let held = new Set();
    const need = { t1: 0.5, t2: 1.5, t3: 2.6, t4: 3.5, t5: 4.5 };
    window.__runBot = (n) => {
      for (let i = 0; i < n; i++) {
        const r = g.getVar('HoleR');
        let best = null, bd = 1e9;
        for (const t of Object.keys(need)) {
          if (r * 1.15 < need[t]) continue;
          for (const e of g.query('#' + t)) {
            const d = Math.hypot(e.position.x - hole.position.x, e.position.z - hole.position.z);
            if (d < bd) { bd = d; best = e; }
          }
        }
        const want = new Set();
        if (best) {
          const dx = best.position.x - hole.position.x, dz = best.position.z - hole.position.z;
          if (dx > 0.25) want.add('KeyD'); else if (dx < -0.25) want.add('KeyA');
          if (dz > 0.25) want.add('KeyS'); else if (dz < -0.25) want.add('KeyW');
        }
        for (const k of keys) {
          if (want.has(k) && !held.has(k)) key('keydown', k);
          if (!want.has(k) && held.has(k)) key('keyup', k);
        }
        held = want;
        g.tick(1 / 60);
      }
    };
    g.pendingUIClicks.push(g.find('PlayButton').id);
    g.tick(1 / 60);
    window.__runBot(420);
  });
  await shot('play');
  await page.evaluate(() => window.__runBot(1500));
  await shot('big');
  await page.evaluate(() => { const g = window.__tgeGame; g.setVar('TimeLeft', 0.02); for (let i = 0; i < 6; i++) g.tick(1 / 60); });
  await page.waitForTimeout(600);
  await shot('end');
  // The project in the editor, with its event sheet open.
  await page.goto(TGE + '/', { timeout: 120000 });
  await page.waitForSelector('.hm', { timeout: 30000 });
  await importTge(page, tge);
  await page.locator('.hm-card', { hasText: 'Hungry Hole' }).first().click({ timeout: 60000 });
  await page.waitForSelector('.editor.desktop', { timeout: 60000 });
  await page.waitForTimeout(6000);
  await shot('editor');
  await page.locator('.desk-area .tab[data-tab="logic"]').click();
  await page.locator('.list-row', { hasText: 'Main events' }).first().click();
  await page.waitForSelector('.es-root', { timeout: 30000 });
  await page.waitForTimeout(1500);
  await shot('events');
}

/** Open an exported game from a local web server and fail loudly when it throws or does not show its text. */
async function checkExported(browser, file, game) {
  if (!existsSync(file)) throw new Error('missing ' + file);
  const html = readFileSync(file);
  const server = createServer((_req, res) => { res.writeHead(200, { 'content-type': 'text/html;charset=utf-8' }); res.end(html); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const context = await browser.newContext({ viewport: DESKTOP, locale: 'en-US' });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('page error: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console error: ' + m.text()); });
  await page.goto(url, { timeout: 120000 });
  await page.waitForTimeout(7000);
  const text = await page.evaluate(() => document.body.innerText);
  if (game.expect && !text.includes(game.expect)) problems.push(`the page does not show "${game.expect}" (it shows: ${text.replace(/\s+/g, ' ').slice(0, 120)})`);
  await context.close();
  server.close();
  if (problems.length) {
    console.error(`  ✗ the exported ${game.slug} is broken:`);
    for (const x of problems) console.error('    ' + x);
    process.exitCode = 1;
  } else console.log('  ✓ the exported game starts and shows its texts');
}

/**
 * Import a .tge on the home page. With no project yet the home page only offers three ways to start (no .tge
 * import), so one empty project is made first: after that the page lists projects and has the import button.
 */
async function importTge(page, tge) {
  // A visit with no seen release opens on What's new: go to the projects page first.
  await page.getByRole('button', { name: 'Projects', exact: true }).first().click({ timeout: 3000 }).catch(() => {});
  const importBtn = page.getByRole('button', { name: /Import \.tge/ });
  if (!(await importBtn.count())) {
    await page.getByRole('button', { name: /New project/ }).first().click();
    await page.locator('.hm-card.template').first().waitFor();
    await page.locator('.hm-card.template').filter({ has: page.locator('.hm-name', { hasText: /^Empty/ }) }).first().click();
    const input = page.locator('.sheet-layer.open .prompt-input').last();
    await input.waitFor();
    await input.fill('Scratch');
    await page.locator('.sheet-layer.open .dialog-actions .btn.primary').last().click();
    await page.waitForSelector('.editor', { timeout: 60000 });
    await page.waitForTimeout(2000);
    // The arrow at the top left goes back to the project list (a reload would reopen the project).
    await page.mouse.click(16, 15);
    await page.waitForSelector('.hm', { timeout: 30000 });
  }
  const chooser = page.waitForEvent('filechooser');
  await importBtn.click();
  await (await chooser).setFiles(tge);
}
