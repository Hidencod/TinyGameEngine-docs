/** Cut a sprite sheet from an image: pick the pieces to keep. */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The 2D Platformer's tile sheet from the editor repo, as an example picture.
const IMAGE = resolve(import.meta.dirname, '../../../../TinyGameEngine/public/templates/platformer2d/tiles.png');

export async function run({ page, s, H }) {
  const buf = readFileSync(IMAGE);
  await H.home();
  await H.newProject('Empty', 'Cut');
  await H.tab('assets');
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await H.waitSheet();
  await s.shot('cut-new-menu');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), H.pick('Sprite sheet from an image')]);
  await chooser.setFiles({ name: 'tiles.png', mimeType: 'image/png', buffer: buf });
  await H.waitSheet();
  await H.prompt('64 x 64');
  await H.waitSheet();
  await H.prompt('Tiles');
  await page.locator('.cut-canvas').waitFor();
  await s.settle(800);
  // Turn a few pieces off.
  const box = await page.locator('.cut-canvas').boundingBox();
  for (const i of [1, 4]) await page.mouse.click(box.x + 40 * (i + 0.5), box.y + box.height / 2);
  await s.settle(300);
  await s.shot('cut-pieces');
}
