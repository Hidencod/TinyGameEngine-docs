/** The LOD group and Ragdoll component cards. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty 3D scene', 'Detail');
  await H.addObject('Cube');
  await H.tab('inspector');
  await page.setViewportSize({ width: 400, height: 2000 });
  await H.split(8);
  await s.settle(800);
  const addComponent = async (label) => {
    await page.locator('.inspector .add-btn', { hasText: 'Add component' }).click();
    await H.waitSheet();
    await H.pick(label, { exact: true });
    await s.settle(600);
  };
  const cardShot = async (name, title) => {
    const c = H.card(title);
    await c.scrollIntoViewIfNeeded();
    await s.shot(name, { clip: c, pad: 6 });
  };
  await addComponent('LOD group');
  await cardShot('card-lod', 'LOD group');
  await addComponent('Ragdoll');
  await cardShot('card-ragdoll', 'Ragdoll');
}
