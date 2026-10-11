/** Tilemaps and 2D games: the Tilemap card, painting, the Platformer's Side view, the Freeze position switches. */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 2000 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('2D Platformer', 'Tiles');

  // The level is one Tilemap object: select it, show the whole level in the 3D view.
  await H.inspect('Level');
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Tilemap')) h.click();
  }));
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(600);
  const card = H.card('Tilemap');
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-tilemap', { clip: card, pad: 6 });

  // Paint mode on: the tool buttons are highlighted.
  await card.getByRole('button', { name: /Paint tiles/ }).click();
  await s.settle(400);
  await card.scrollIntoViewIfNeeded();
  await s.shot('card-tilemap-painting', { clip: card, pad: 6 });

  // Painting off again, so dragging the view doesn't paint.
  await card.getByRole('button', { name: /Stop painting/ }).click();
  await s.settle(300);

  // The 3D view with the level selected.
  await page.setViewportSize(PHONE);
  await H.split(70);
  await s.settle(1200);
  await s.shot('tilemap-level');

  // The 2D button: a flat side view with a vertical grid, to paint on.
  await page.locator('.vp-btn[aria-label="2D view"]').click();
  await s.settle(1200);
  await s.shot('tilemap-2d');

  // Zoom out and move to the ladder and platforms: yellow lines = one-way, cyan ladder = climbable, ring = walkthrough.
  const vp = await page.locator('.split-viewport').boundingBox();
  await page.mouse.move(vp.x + vp.width / 2, vp.y + vp.height / 2);
  await page.mouse.wheel(0, 500);
  await s.settle(400);
  await page.mouse.move(vp.x + vp.width * 0.8, vp.y + vp.height * 0.8);
  await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.move(vp.x + vp.width * 0.1, vp.y + vp.height * 0.8, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await s.settle(800);
  await s.shot('tilemap-marks');

  // Side view on the hero's Platformer card.
  await H.inspect('Player');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(600);
  const platformer = H.card('Platformer');
  await platformer.scrollIntoViewIfNeeded();
  await s.shot('card-platformer-sideview', { clip: platformer, pad: 6 });
  const body = H.card('Physics body');
  await body.scrollIntoViewIfNeeded();
  await s.shot('card-rigidbody-freeze', { clip: body, pad: 6 });
}
