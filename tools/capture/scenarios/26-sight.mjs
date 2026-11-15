/** Sight: the cone drawn on a selected capsule, and the card. */
const TALL = { width: 400, height: 900 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Sight');
  await H.addObject('Capsule');
  await H.tab('inspector');
  await s.settle(600);
  await page.locator('.inspector .add-btn', { hasText: 'Add component' }).click();
  await H.waitSheet();
  await H.pick('Sight', { exact: true });
  await s.settle(800);
  const range = H.card('Sight').locator('input').first();
  await range.fill('6');
  await range.press('Enter');
  await s.settle(600);
  // From the top (the Y ball of the view gizmo), so the cone reads as a fan on the ground.
  await page.mouse.click(349, 60);
  await s.settle(1200);
  await s.shot('sight-cone');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(800);
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Sight')) h.click();
  }));
  const c = H.card('Sight');
  await c.scrollIntoViewIfNeeded();
  await s.settle(300);
  await s.shot('card-sight', { clip: c, pad: 6 });
}
