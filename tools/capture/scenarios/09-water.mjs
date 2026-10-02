/** Water: the Hill explorer's lake in the 3D view and the Water card. */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 1100 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Hill explorer', 'Water');
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.select('Lake');
  await page.getByRole('button', { name: 'Focus', exact: true }).click();
  await s.settle(800);
  // Turn the view so the tree on the near shore isn't in front of the lake.
  const vp = await page.locator('.viewport canvas').first().boundingBox();
  await page.mouse.move(vp.x + vp.width * 0.8, vp.y + vp.height * 0.85);
  await page.mouse.down();
  await page.mouse.move(vp.x + vp.width * 0.35, vp.y + vp.height * 0.85, { steps: 12 });
  await page.mouse.up();
  await page.evaluate(() => document.querySelector('.tree-row.selected')?.click());
  await s.settle(1500);
  await s.shot('water-view');

  await page.setViewportSize(TALL);
  await H.split(10);
  await H.tab('inspector');
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Water')) h.click();
  }));
  const card = H.card('Water');
  await card.scrollIntoViewIfNeeded();
  await s.settle(300);
  await s.shot('card-water', { clip: card, pad: 6 });
  await page.setViewportSize(PHONE);
}
