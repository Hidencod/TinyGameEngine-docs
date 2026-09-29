/** Objects tab: add menu, hierarchy, object menu, parenting, prefabs, scene chip. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Sandbox');
  await H.tab('objects');
  await s.shot('objects-tab-empty-scene', {
    hl: [
      { target: page.locator('.objects-tab .tab-toolbar .chip').first(), label: 1 },
      { target: page.locator('.objects-tab .tab-toolbar .btn.primary'), label: 2 },
      { target: page.locator('.tree-row').first(), label: 3 },
    ],
  });

  // The Add menu, top to bottom.
  await page.locator('.objects-tab .tab-toolbar .btn.primary').click();
  await H.waitSheet();
  await s.shot('add-menu-1');
  const body = H.sheet().locator('.sheet-body');
  const groups = ['UI (on screen)', 'Particles', 'Lights', '3D models'];
  for (let i = 0; i < groups.length; i++) {
    await H.scrollTo(H.sheet().locator('.pick-group', { hasText: groups[i] }), 0);
    await s.shot('add-menu-' + (i + 2));
  }
  void body;
  await H.closeSheet();

  // Add a few things.
  await H.addObject('Cube');
  await s.shot('objects-added-cube');
  await H.addObject('Sphere');
  await H.addObject('Lamp (point light)');
  await H.addObject('Empty object');
  await H.tab('objects');

  // Object menu.
  await H.treeRow('Cube').locator('.tree-btn[aria-label="More"]').click();
  await H.waitSheet();
  await s.shot('object-menu');
  await H.pick('Set parent');
  await s.shot('object-set-parent');
  await H.pick('Empty', { exact: true });
  await s.settle(500);
  await H.treeRow('Sphere').locator('.tree-btn[aria-label="More"]').click();
  await H.waitSheet();
  await H.pick('Set parent');
  await H.pick('Empty', { exact: true });
  await s.settle(500);
  await H.tab('objects');
  await s.shot('objects-hierarchy', { hl: [{ target: H.treeRow('Empty'), label: 1 }, { target: H.treeRow('Cube'), label: 2 }, { target: H.treeRow('Sphere'), label: 3 }] });

  // Hide / show.
  await H.treeRow('Lamp').locator('.tree-btn[aria-label="Hide"]').click();
  await s.settle(400);
  await s.shot('objects-hidden-row', { hl: { target: H.treeRow('Lamp') } });

  // Selected row shows "Edit ›".
  await H.treeRow('Cube').click();
  await s.settle(400);
  await s.shot('objects-selected-row', { hl: { target: H.treeRow('Cube').locator('.tree-edit') } });

  // Rename.
  await H.treeRow('Empty').locator('.tree-btn[aria-label="More"]').click();
  await H.waitSheet();
  await H.pick('Rename');
  await s.shot('object-rename');
  await H.prompt('Crate');
  // Make prefab.
  await H.treeRow('Crate').locator('.tree-btn[aria-label="More"]').click();
  await H.waitSheet();
  await H.pick('Make prefab');
  await s.settle(600);
  await H.tab('objects');
  await H.scrollTo(page.locator('.objects-tab .section-title', { hasText: 'Prefabs' }), 0);
  await s.shot('objects-prefabs', { hl: { target: page.locator('.objects-tab .section-title', { hasText: 'Prefabs' }).locator('xpath=following-sibling::div[1]') } });

  // Scene chip opens the Scenes panel.
  await page.locator('.objects-tab').evaluate((el) => { el.scrollTop = 0; });
  await page.locator('.objects-tab .tab-toolbar .chip').first().click();
  await s.settle(700);
  await s.shot('scenes-panel');
  await page.getByRole('button', { name: /Add scene/ }).click();
  await s.settle(400);
  await s.shot('scenes-add-name');
  await H.prompt('Level 2');
  await s.settle(800);
  await page.locator('.objects-tab .tab-toolbar .chip').first().click();
  await s.settle(700);
  await s.shot('scenes-panel-two');
  await page.locator('.scenes-view .list-row').first().locator('.icon-btn').click();
  await H.waitSheet();
  await s.shot('scenes-row-menu');
  await H.closeSheet();
}
