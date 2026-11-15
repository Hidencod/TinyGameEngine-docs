/** Virtual Camera: the card (made from the Add menu with a cube selected, so it follows it), and the editor's preview of its shot. */
const TALL = { width: 400, height: 1500 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Virtual Camera');
  await H.addObject('Cube');
  await H.addObject('Virtual Camera');
  await s.settle(800);
  await s.shot('vcam-editor');
  await H.tab('inspector');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(800);
  await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => {
    if (!h.textContent.includes('Virtual Camera')) h.click();
  }));
  const c = H.card('Virtual Camera');
  await c.scrollIntoViewIfNeeded();
  await s.settle(300);
  await s.shot('card-virtual-camera', { clip: c, pad: 6 });
}
