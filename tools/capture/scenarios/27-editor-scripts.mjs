/** Editor scripts: the Tools commands in the ☰ drawer, and a script's Inspector button with its gizmo. */
const CODE = `
editor.menu('Level/Scatter trees', async () => {
  const n = await editor.promptNumber('How many?', 8);
  if (n == null) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    editor.scene.add('Tree', { shape: 'cylinder', position: [Math.cos(a) * 6, 0.5, Math.sin(a) * 6], color: '#2e7d32' });
  }
});
editor.menu('Level/Clear trees', () => { for (const t of editor.scene.findAll('Tree')) t.destroy(); });
editor.menu('Align/Line up selected', () => { editor.selection.forEach((e, i) => { e.position = [i * 2, e.position.y, 0]; }); });
editor.button('Patrol', 'Bigger patrol', (e) => { e.script('Patrol').radius += 1; });
editor.gizmos('Patrol', (e, draw, selected) => {
  draw.color(selected ? '#ffcc00' : '#999999').circle([0, 0, 0], e.script('Patrol').radius);
});
`;

export async function run({ page, s, H }) {
  await H.home();
  await page.evaluate(async (code) => {
    const st = await import('/src/editor/core/storage.ts');
    const f = await import('/src/shared/factory.ts');
    const p = f.createProject('Editor scripts'); p.id = 'p_docs_ext';
    const g = f.createPrimitive('capsule', 'Guard', [0, 1, 0]);
    const patrol = f.createScript('Patrol', 'entity');
    patrol.code = 'export let radius = 4;\n\nfunction update(dt) {\n}\n';
    g.components.push({ ...f.defaultComponent('script'), scriptId: patrol.id, props: {} });
    p.scenes[0].entities.push(g);
    const ed = f.createScript('LevelTools', 'editor');
    ed.code = code.trim() + '\n';
    p.scripts.push(patrol, ed);
    p.updatedAt = Date.now();
    await st.saveProject(p);
  }, CODE);
  await H.home();
  await page.getByText('Editor scripts', { exact: true }).first().click();
  await page.waitForSelector('.editor', { timeout: 30000 });
  await s.settle(3000);
  // The Tools group of the ☰ drawer.
  await page.locator('.topbar button').first().click();
  await s.settle(800);
  await s.shot('editor-scripts-tools');
  await page.locator('.drawer-row', { hasText: 'Scatter trees' }).click();
  await s.settle(600);
  await page.locator('input:focus').press('Enter');
  await s.settle(1500);
  // The Guard: its gizmo and the button on its Patrol card.
  await page.locator('.tree-row', { hasText: 'Guard' }).first().click();
  await H.tab('inspector');
  await s.settle(600);
  await page.locator('.ext-buttons button').first().scrollIntoViewIfNeeded();
  await s.settle(800);
  await s.shot('editor-scripts-inspector');
  await page.evaluate(async () => (await import('/src/editor/core/storage.ts')).deleteProject('p_docs_ext'));
}
