/** Cloth: the Cloth card on a plane. */
const TALL = { width: 400, height: 1400 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Cloth');
  await H.addObject('Plane');
  await H.tab('inspector');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(800);
  await page.locator('.inspector .add-btn', { hasText: 'Add component' }).click();
  await H.waitSheet();
  await H.pick('Cloth', { exact: true });
  await s.settle(600);
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Cloth')) h.click();
  }));
  const c = H.card('Cloth');
  await c.scrollIntoViewIfNeeded();
  await s.settle(300);
  await s.shot('card-cloth', { clip: c, pad: 6 });
}
