/** One Inspector card per behavior (tall viewport so each card fits). */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 1400 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Behaviors');
  const behaviors = [
    ['Platformer', 'platformer'], ['Top-down movement', 'topdown'], ['Car', 'car'], ['Rotate', 'rotate'], ['Bullet', 'bullet'],
    ['Wave (sine)', 'sine'], ['Follow target', 'follow'], ['Destroy when far', 'destroyOffscreen'], ['Draggable', 'draggable'],
  ];
  for (const [label, id] of behaviors) {
    await page.setViewportSize(PHONE);
    await H.split(52);
    await H.addObject('Sphere');
    await page.setViewportSize(TALL);
    await H.split(10);
    await H.tab('inspector');
    await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => h.click()));
    await page.locator('.inspector .add-btn', { hasText: 'Add behavior' }).click();
    await H.waitSheet();
    await H.pick(label, { exact: true });
    await s.settle(600);
    const card = H.card(label);
    await card.scrollIntoViewIfNeeded();
    await s.shot('behavior-' + id, { clip: card, pad: 6 });
  }
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.select('Camera');
  await page.setViewportSize(TALL);
  await H.split(10);
  await H.tab('inspector');
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => h.click()));
  await page.locator('.inspector .add-btn', { hasText: 'Add behavior' }).click();
  await H.waitSheet();
  await H.pick('Camera follow', { exact: true });
  await s.settle(600);
  await s.shot('behavior-cameraFollow', { clip: H.card('Camera follow'), pad: 6 });
}
