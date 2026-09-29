/** Home screen, templates, tutorials picker, project cards and menus, help menu. */
export async function run({ page, s, H }) {
  await H.home();
  await s.shot('home-empty');
  await s.shot('home-empty-annotated', {
    hl: [
      { target: page.getByRole('button', { name: /New project/ }), label: 1 },
      { target: page.getByRole('button', { name: /Import .tge/ }), label: 2 },
      { target: page.locator('.learn-card'), label: 3 },
      { target: page.locator('.home-help'), label: 4 },
    ],
  });

  await page.locator('.home-help').click();
  await H.waitSheet();
  await s.shot('help-menu');
  await H.closeSheet();

  await page.locator('.learn-card').click();
  await H.waitSheet();
  await s.shot('tutorials-picker');
  await H.closeSheet();

  await page.getByRole('button', { name: /New project/ }).click();
  await H.waitSheet();
  await s.settle(1200);
  await s.shot('templates-picker');
  await H.sheet().locator('.sheet-body').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await s.settle(600);
  await s.shot('templates-picker-end');
  await H.pick('Roll-a-ball');
  await page.locator('.prompt-input').waitFor();
  await s.shot('new-project-name');
  await H.prompt('Coin Hunt');
  await page.waitForSelector('.editor');
  await s.settle(2500);
  await page.getByRole('button', { name: 'Back to projects' }).click();
  await s.settle(800);

  await page.getByRole('button', { name: /New project/ }).click();
  await H.waitSheet();
  await H.pick('3D Platformer');
  await H.prompt('Jump Quest');
  await page.waitForSelector('.editor');
  await s.settle(2500);
  await page.getByRole('button', { name: 'Back to projects' }).click();
  await s.settle(800);

  await s.shot('home-projects');
  await s.shot('home-project-card', { hl: [{ target: page.locator('.project-card').first(), label: 1 }, { target: page.locator('.project-card .icon-btn').first(), label: 2 }] });
  await page.locator('.project-card .icon-btn').first().click();
  await H.waitSheet();
  await s.shot('project-menu');
  await H.pick('Rename');
  await s.shot('project-rename');
  await H.closeSheet();
}
