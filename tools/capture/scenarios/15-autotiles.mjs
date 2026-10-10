/** Auto tiles: set one up on a tilemap, then paint with it. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TALL = { width: 400, height: 2000 };
const IMAGE = resolve(import.meta.dirname, '../../../../TinyGameEngine/public/templates/platformer2d/tiles.png');

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('2D Platformer', 'Auto');
  await H.inspect('Level');
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Tilemap')) h.click();
  }));
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(600);
  const card = H.card('Tilemap');
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-tilemap-auto', { clip: card, pad: 6 });

  // Set up a new block set: the pieces are tapped in turn.
  await card.getByRole('button', { name: /Block \(9 pieces\)/ }).click();
  await H.waitSheet();
  const pal = page.locator('.sheet-layer.open .auto-root .tile-palette .tile-swatch');
  for (const i of [2, 0, 3, 4, 1]) await pal.nth(i).click();
  await s.settle(400);
  await s.shot('autotile-setup');
  for (const i of [5, 14, 15, 16]) await pal.nth(i).click();
  await s.settle(300);
  await page.locator('.sheet-layer.open .sheet-head .btn.primary', { hasText: 'Done' }).click();
  await s.settle(400);
  await H.prompt('Hills');
  await s.settle(800);
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-tilemap-auto-set', { clip: card, pad: 6 });

  // Paint with the new set: pieces fit themselves.
  const before = await card.locator('button', { hasText: /Clear \(/ }).textContent();
  await card.locator('.auto-pick', { hasText: 'Hills' }).click();
  await s.settle(300);
  await page.setViewportSize({ width: 400, height: 800 });
  await H.split(70);
  await s.settle(800);
  const vp = await page.locator('.split-viewport').boundingBox();
  await page.mouse.move(vp.x + vp.width * 0.3, vp.y + vp.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(vp.x + vp.width * 0.7, vp.y + vp.height * 0.3, { steps: 8 });
  await page.mouse.move(vp.x + vp.width * 0.7, vp.y + vp.height * 0.45, { steps: 8 });
  await page.mouse.up();
  await s.settle(600);
  await s.shot('autotile-painted');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(500);
  console.log('cells before:', before, 'after:', await H.card('Tilemap').locator('button', { hasText: /Clear \(/ }).textContent());
}
