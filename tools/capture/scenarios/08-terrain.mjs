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
  await s.settle(400);
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-terrain', { clip: card, pad: 6 });
  await page.setViewportSize(PHONE);
}
