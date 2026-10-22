/** Quality levels in Project settings: the list of levels, one open for editing, the level menu. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Levels');
  await H.menu();
  await H.pick('Project settings');
  await s.settle(700);
  const card = page.locator('.card', { has: page.locator('.card-title', { hasText: 'Graphics & performance' }) });
  await H.scrollTo(card);
  await s.shot('quality-levels', { wait: 700 });

  // A new level, copied from the last one.
  await page.locator('.q-levels .chip', { hasText: '＋' }).click();
  await H.prompt('Ultra');
  await s.settle(700);
  await H.scrollTo(card);
  await s.shot('quality-levels-new', { wait: 700 });

  // The level menu.
  await page.locator('.q-levels .icon-btn').click();
  await H.waitSheet();
  await s.shot('quality-level-menu');
}
