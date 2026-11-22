/** Terrain: the hills in the 3D view and the Terrain card (sculpt tools, Make hills). */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 1400 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Terrain');
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.addObject('Terrain (hills)');
  await s.settle(1200);
  await s.shot('terrain-view');

  await page.setViewportSize(TALL);
  await H.split(10);
  await H.tab('inspector');
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Terrain')) h.click();
  }));
  const card = H.card('Terrain');
  await card.locator('button', { hasText: 'Sculpt' }).first().click();
  await s.settle(300);
  // The Paint tool shows its color swatches.
  await card.locator('.terrain-tools button', { hasText: 'Paint' }).first().click();
  await s.settle(400);
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-terrain', { clip: card, pad: 6 });

  // Details: a grass layer, painted over the middle of the hills.
  await card.locator('.terrain-tools button', { hasText: 'Details' }).first().click();
  await s.settle(300);
  await card.locator('.terrain-tools button', { hasText: 'Grass' }).last().click();
  await s.settle(600);
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-terrain-details', { clip: card, pad: 6 });
  await page.setViewportSize(PHONE);
  await H.split(52);
  await s.settle(600);
  const vp = await page.locator('.split-viewport').boundingBox();
  // Open ground right of and below the move handles (the tool bar is on the left).
  for (const fy of [0.5, 0.58, 0.66, 0.74, 0.82, 0.9]) {
    await page.mouse.move(vp.x + vp.width * 0.42, vp.y + vp.height * fy);
    await page.mouse.down();
    await page.mouse.move(vp.x + vp.width * 0.95, vp.y + vp.height * fy, { steps: 14 });
    await page.mouse.up();
    await s.settle(150);
  }
  await page.mouse.move(vp.x + vp.width - 5, vp.y + 5);
  await s.settle(1500);
  await s.shot('terrain-grass', { clip: page.locator('.split-viewport') });
}
