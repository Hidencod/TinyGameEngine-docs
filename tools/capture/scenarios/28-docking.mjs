/** Desktop docking: dragging a tab to an area's edge (the drop preview), and a rearranged layout with an editor window. */
export const viewport = { width: 1280, height: 760 };
export const desktop = true;

const STATS = `editor.window('Level stats', (ui) => {
  ui.header('Scene');
  ui.label('Objects', editor.scene.objects.length);
  ui.label('Selected', editor.selection.map((e) => e.name).join(', ') || '-');
  if (ui.button('Add crate')) editor.scene.add('Crate', { shape: 'box', position: [editor.scene.objects.length, 0.5, 0] });
});`;

export async function run({ page, s, H }) {
  await H.home();
  await page.evaluate(async (code) => {
    localStorage.removeItem('tge:dock');
    localStorage.setItem('tge:layout', JSON.stringify({ layout: 'desktop', density: 'compact' }));
    const st = await import('/src/editor/core/storage.ts');
    const f = await import('/src/shared/factory.ts');
    const p = f.createProject('Docking'); p.id = 'p_docs_dock';
    p.scenes[0].entities.push(f.createPrimitive('box', 'Crate', [0, 0.5, 0]), f.createPrimitive('sphere', 'Ball', [2, 0.5, -1]));
    const ed = f.createScript('Stats', 'editor');
    ed.code = code;
    p.scripts.push(ed);
    p.updatedAt = Date.now();
    await st.saveProject(p);
  }, STATS);
  await H.home();
  await page.locator('.hm-name:visible', { hasText: 'Docking' }).first().click();
  await page.waitForSelector('.dk-root', { timeout: 30000 });
  await s.settle(3000);

  const drag = async (tab, to, shot) => {
    const b = await page.locator(`.dk-tab[data-tab^="${tab}"]`).boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + 40, b.y + 40, { steps: 4 });
    await page.mouse.move(to.x, to.y, { steps: 10 });
    await s.settle(300);
    if (shot) await s.shot(shot, { keepMouse: true });
    await page.mouse.up();
    await s.settle(600);
  };
  const area = (tab) => page.locator('.dk-group', { has: page.locator(`.dk-tab[data-tab^="${tab}"]`) }).boundingBox();

  // The event sheet, dragged to the right edge of the 3D view: the preview shows where it goes.
  await page.locator('.dk-tab[data-tab="logic"]').click();
  await page.locator('.list-row', { hasText: 'Main events' }).first().click();
  await s.settle(1500);
  let a = await area('@scene');
  await drag('panel:eventSheet', { x: a.x + a.width - 40, y: a.y + a.height / 2 }, 'docking-drop');
  // Logic under the 3D view, and an editor window beside the Inspector.
  a = await area('@scene');
  await drag('logic', { x: a.x + a.width / 2, y: a.y + a.height - 40 });
  await page.locator('.menubar button', { hasText: 'Window' }).click();
  await s.settle(300);
  await page.getByText('Level stats', { exact: true }).click();
  await s.settle(1200);
  a = await area('inspector');
  await drag('panel:extWindow', { x: a.x + a.width / 2, y: a.y + a.height - 60 });
  await page.locator('.tree-row', { hasText: 'Crate' }).first().click();
  await s.settle(1500);
  await s.shot('docking-layout');
  await page.evaluate(async () => {
    localStorage.removeItem('tge:dock');
    (await import('/src/editor/core/storage.ts')).deleteProject('p_docs_dock');
  });
}
