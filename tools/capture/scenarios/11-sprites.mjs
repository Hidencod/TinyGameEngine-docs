/** Sprites: the sprite editor (painter, frames, origin, collision) and the Sprite card. */
import { PHONE } from '../lib.mjs';

/** A small 3-frame bouncing ball strip, drawn in the page. */
async function frames(page) {
  return page.evaluate(async () => {
    const out = [];
    for (let i = 0; i < 3; i++) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const g = c.getContext('2d');
      const y = [150, 120, 150][i], sx = [1.25, 1, 1.25][i], sy = [0.8, 1, 0.8][i];
      g.fillStyle = '#ff7a1a'; g.strokeStyle = '#7a2e00'; g.lineWidth = 8;
      g.beginPath(); g.ellipse(128, y + 40, 60 * sx, 60 * sy, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(105, y + 20, 14, 0, 7); g.fill();
      const b = await new Promise((r) => c.toBlob(r, 'image/png'));
      out.push(Array.from(new Uint8Array(await b.arrayBuffer())));
    }
    return out;
  });
}

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty', 'Sprites');
  await page.setViewportSize(PHONE);
  const imgs = await frames(page);

  // New sprite -> size -> name -> the painter opens at once.
  await H.tab('assets');
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await H.waitSheet();
  await H.pick('Sprite', { exact: true });
  await H.pick('256 × 256');
  await H.prompt('Ball');
  await page.locator('iframe.sprite-frame').waitFor();
  await s.settle(5000);
  await s.shot('sprite-painter');
  await page.locator('.sheet-layer.open .btn.primary', { hasText: 'Done' }).last().click();
  await s.settle(1500);

  // Frames: import a picture into each frame.
  for (let i = 0; i < 3; i++) {
    if (i > 0) { await page.locator('.se-root [title="Add frame"]').click(); await s.settle(200); }
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.se-root button', { hasText: 'Import' }).click(),
    ]);
    await chooser.setFiles({ name: 'f.png', mimeType: 'image/png', buffer: Buffer.from(imgs[i]) });
    await s.settle(500);
  }
  await page.locator('.se-thumb').first().click();
  await s.settle(300);
  await s.shot('sprite-frames');

  await page.locator('.se-root .chip', { hasText: 'Origin' }).click();
  await page.locator('.se-preset').nth(7).click();
  await s.settle(300);
  await s.shot('sprite-origin');

  await page.locator('.se-root .chip', { hasText: 'Collision' }).click();
  await page.locator('.se-root button', { hasText: 'Auto' }).click();
  await s.settle(300);
  await s.shot('sprite-collision');

  await page.locator('.sheet-layer.open .btn.primary', { hasText: 'Save' }).last().click();
  await s.settle(800);

  // Place it and show the Sprite card.
  await H.addObject('Ball');
  await H.tab('inspector');
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Sprite')) h.click();
  }));
  const card = H.card('Sprite');
  await card.getByRole('button', { name: /Ball|Choose|None|—/ }).first().click().catch(() => {});
  await s.settle(400);
  if (await page.locator('.sheet-layer.open').count()) { await H.pickItem('Ball').click(); await s.settle(600); }
  await page.setViewportSize({ width: 400, height: 1100 });
  await H.split(10);
  await card.scrollIntoViewIfNeeded();
  await s.settle(400);
  await s.shot('card-sprite', { clip: card, pad: 6 });
}
