/** Editor layout tour: top bar, viewport and its toolbar, gizmos, dock, project menu. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Roll-a-ball', 'Coin Hunt');
  await H.tab('objects');

  const vpTools = page.locator('.vp-toolbar, .viewport-toolbar').first();
  const tb = (await vpTools.count()) ? vpTools : page.locator('.vp-btn').first().locator('..');

  await s.shot('editor-overview');
  await s.shot('editor-overview-annotated', {
    hl: [
      { target: page.locator('.topbar'), label: 1, pad: 0 },
      { target: tb, label: 2 },
      { target: page.locator('.split-viewport canvas').first(), label: 3, pad: -40 },
      { target: page.locator('.split-grip'), label: 4, pad: 6, badge: 'right' },
      { target: page.locator('.tabbar'), label: 5, pad: 0 },
      { target: page.locator('.dock-body'), label: 6, pad: -4 },
    ],
  });
  await s.shot('editor-topbar-annotated', {
    clip: page.locator('.topbar'), pad: 0, padBottom: 34,
    hl: [
      { target: page.getByRole('button', { name: 'Back to projects' }), label: 1, pad: 1, badge: 'below' },
      { target: page.locator('.topbar-name'), label: 2, pad: 1, badge: 'below' },
      { target: page.locator('.topbar').getByRole('button', { name: 'Undo' }), label: 3, pad: 1, badge: 'below' },
      { target: page.locator('.topbar').getByRole('button', { name: 'Redo' }), label: 4, pad: 1, badge: 'below' },
      { target: page.locator('.play-btn'), label: 5, pad: 1, badge: 'below' },
      { target: page.locator('.topbar').getByRole('button', { name: 'Menu' }), label: 6, pad: 1, badge: 'below' },
    ],
  });
  await s.shot('editor-viewport-toolbar', { clip: tb, pad: 16 });
  {
    const n = await page.locator('.vp-btn').count();
    const hl = [];
    for (let i = 0; i < n; i++) hl.push({ target: page.locator('.vp-btn').nth(i), label: i + 1, pad: 0, badge: 'right' });
    await s.shot('editor-viewport-toolbar-annotated', { clip: tb, pad: 16, padRight: 44, hl });
  }
  await s.shot('editor-tabbar', { clip: page.locator('.tabbar'), pad: 4 });
  await s.shot('editor-topbar', { clip: page.locator('.topbar'), pad: 0 });

  // Select the player: gizmo appears.
  await H.select('Player');
  await s.shot('viewport-selected-move');
  await page.getByRole('button', { name: 'Rotate', exact: true }).click();
  await s.shot('viewport-rotate');
  await page.getByRole('button', { name: 'Scale', exact: true }).click();
  await s.shot('viewport-scale');
  await page.getByRole('button', { name: 'Move', exact: true }).click();

  // Show where to drag an arrow.
  const arrow = await page.evaluate(() => null);
  void arrow;

  await page.getByRole('button', { name: 'Snap', exact: true }).click();
  await s.shot('viewport-snap-on', { hl: { target: page.getByRole('button', { name: 'Snap', exact: true }) }, wait: 300 });
  await page.getByRole('button', { name: 'Snap', exact: true }).click();

  await page.getByRole('button', { name: 'Colliders', exact: true }).click();
  await s.shot('viewport-colliders', { wait: 900 });
  await page.getByRole('button', { name: 'Colliders', exact: true }).click();

  // Multi select: two coins.
  await page.getByRole('button', { name: 'Select several', exact: true }).click();
  await s.settle(300);
  const coins = page.locator('.tree-row').filter({ has: page.locator('.tree-name', { hasText: /^Coin$/ }) });
  await coins.nth(0).click(); await s.settle(200);
  await coins.nth(1).click(); await s.settle(200);
  await coins.nth(2).click(); await s.settle(500);
  await s.shot('viewport-multi', {
    hl: [
      { target: page.getByRole('button', { name: 'Select several', exact: true }), label: 1 },
      { target: page.getByRole('button', { name: 'Pivot', exact: true }), label: 2 },
      { target: page.locator('.multi-chip'), label: 3 },
    ],
  });
  await page.locator('.multi-chip').click();
  await s.settle(400);
  await H.tab('inspector');
  await s.shot('inspector-multi');
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await s.settle(300);

  // Collapse the dock (tap the handle) for a big 3D view.
  await page.locator('.split-handle').click();
  await s.settle(700);
  await s.shot('editor-dock-collapsed');
  await page.locator('.split-handle').click();
  await s.settle(700);

  await H.menu();
  await s.shot('editor-project-menu');
  await H.closeSheet();

  // Each dock tab with nothing selected.
  for (const t of ['objects', 'assets', 'logic', 'scene']) {
    await H.tab(t);
    await s.shot('dock-' + t);
  }
  await H.tab('inspector');
  await s.shot('dock-inspector-empty');
}
