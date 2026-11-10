/** Home screen: first start, templates page, Continue building + Recent projects, All projects, project menu, Help. */
export async function run({ page, s, H }) {
  // The editor reopens on a reload, so leave a project the way people do: ☰ → Close project.
  const backHome = async () => {
    await H.menu();
    await page.locator('.drawer-close').click();
    await page.locator('.hm').waitFor();
    await s.settle(800);
  };
  await H.home();
  await s.shot('home-empty');

  await page.locator('.hm-nav button.help').click();
  await H.waitSheet();
  await s.shot('help-menu');
  await H.closeSheet();

  // New project opens the templates page.
  await page.getByRole('button', { name: /New project/ }).first().click();
  await page.locator('.hm-card.template').first().waitFor();
  await s.settle(1200);
  await s.shot('templates-picker');
  await page.locator('.hm-main').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await s.settle(600);
  await s.shot('templates-picker-end');
  await page.locator('.hm-card.template').filter({ has: page.locator('.hm-name', { hasText: /^Roll-a-ball/ }) }).first().click();
  await page.locator('.prompt-input').waitFor();
  await s.shot('new-project-name');
  await H.prompt('Coin Hunt');
  await page.waitForSelector('.editor', { timeout: 30000 });
  await s.settle(2500);

  for (const [template, name] of [['Hill explorer', 'Gem Hills'], ['3D Platformer', 'Jump Quest']]) {
    await backHome();
    await H.newProject(template, name);
  }
  await backHome();
  await page.locator('.hm-continue').waitFor();
  await s.settle(1200);

  await s.shot('home-projects', {
    hl: [
      { target: page.locator('.hm-continue'), label: 1 },
      { target: page.locator('.hm-section .hm-card').first(), label: 2 },
      { target: page.locator('.hm-link', { hasText: 'See all' }), label: 3 },
      { target: page.locator('.hm-account'), label: 4 },
    ],
  });

  await page.locator('.hm-section .hm-more').first().click();
  await H.waitSheet();
  await s.shot('project-menu');
  await H.pick('Rename');
  await s.shot('project-rename');
  await H.closeAllSheets();

  await page.locator('.hm-link', { hasText: 'See all' }).click();
  await s.settle(800);
  await s.shot('home-all-projects');
}
