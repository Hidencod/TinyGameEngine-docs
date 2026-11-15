/** Playable Director: the card on an empty object, with a new timeline. */
const TALL = { width: 400, height: 1100 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Director');
  await H.addObject('Empty object');
  await H.tab('inspector');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(800);
  await page.locator('.inspector .add-btn', { hasText: 'Add component' }).click();
  await H.waitSheet();
  await H.pick('Playable Director', { exact: true });
  await s.settle(600);
  const c = H.card('Playable Director');
  await c.locator('.picker-btn').click();
  await H.waitSheet();
  await H.pick('New timeline…', { exact: true });
  await H.prompt('Intro');
  await s.settle(1200);
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Playable Director')) h.click();
  }));
  await c.scrollIntoViewIfNeeded();
  await s.settle(300);
  await s.shot('card-director', { clip: c, pad: 6 });
}
