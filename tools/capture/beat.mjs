/**
 * The beat maker shots (beat-rack, beat-roll), from the open Free sounds sheet: a snare on 2 and 4 and a bass
 * line drawn in the piano roll. Leaves the beat maker closed (discarded) and the Free sounds sheet open.
 */
export async function beatSteps(page, s) {
  await page.locator('.sound-make button', { hasText: 'Make a beat' }).click();
  await s.settle(900);
  const snare = page.locator('.beat-row', { hasText: 'Snare' }).locator('.beat-pad');
  await snare.nth(6).tap(); await snare.nth(14).tap();
  await page.locator('.beat-mini-btn').first().tap();
  await s.settle(700);
  const grid = await page.locator('.beat-grid').boundingBox();
  const roll = await page.locator('.beat-roll').boundingBox();
  const cell = grid.width / 16;
  // A bass line: root, root, up a fifth, down a tone, each an eighth long (rows are 22 px).
  const line = [[0, 4], [4, 4], [8, 1], [12, 2], [14, 4]];
  for (const [step, row] of line) { await page.touchscreen.tap(grid.x + cell * (step + 0.5), roll.y + 30 + row * 22); await s.settle(120); }
  await s.shot('beat-roll');
  await page.locator('.beat-roll-head button', { hasText: 'Rack' }).tap();
  await s.settle(500);
  await s.shot('beat-rack');
  await page.locator('.beat-maker .sheet-x').click();
  await page.getByRole('button', { name: 'Discard' }).click();
  await s.settle(500);
}
