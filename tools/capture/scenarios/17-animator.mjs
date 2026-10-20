/** Animator: the component, a controller with Idle ⇄ Walk on Speed, and a transition's settings. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('3D platformer', 'Animator');
  await H.inspect('Player');
  await page.locator('.add-btn', { hasText: 'Add component' }).click();
  await H.waitSheet();
  await H.pick('Animator', { exact: true });
  await s.settle(600);
  await page.locator('.picker-btn', { hasText: 'None' }).last().click();
  await H.waitSheet();
  await H.pick('New controller…');
  await H.prompt('Hero Animator');
  await s.settle(1500);

  const side = page.locator('.anm-side');
  const clickEmptyGraph = async () => {
    const g = await page.locator('.anm-svg').boundingBox();
    await page.mouse.click(g.x + 8, g.y + g.height - 8);
    await s.settle(300);
  };
  for (const clip of ['idle', 'walk', 'jump']) {
    await clickEmptyGraph();
    await side.locator('.anm-btn', { hasText: 'State' }).click();
    await H.waitSheet();
    await H.pick(clip, { exact: true });
    await s.settle(300);
  }
  await clickEmptyGraph();
  for (const [type, name] of [['Float', 'Speed'], ['Trigger', 'Jump']]) {
    await side.locator('.anm-section', { hasText: 'Parameters' }).locator('.anm-btn').click();
    await H.waitSheet();
    await H.pick(type, { exact: true });
    await H.prompt(name);
    await s.settle(300);
  }
  const transition = async (from, to, setup) => {
    await clickEmptyGraph();
    await side.locator('.anm-row', { hasText: from }).first().click();
    await s.settle(300);
    await side.locator('.anm-btn', { hasText: 'To…' }).click();
    await H.waitSheet();
    await H.pick(to, { exact: true });
    await s.settle(300);
    await setup();
  };
  const addCondition = async (param, mode, value) => {
    await side.locator('.anm-section', { hasText: 'Conditions' }).locator('.anm-btn').click();
    await s.settle(300);
    const row = side.locator('.anm-cond').last();
    await row.locator('select').first().selectOption(param);
    await s.settle(250);
    await row.locator('select').nth(1).selectOption(mode);
    await s.settle(250);
    if (value !== undefined) { const inp = row.locator('input').first(); await inp.fill(String(value)); await inp.press('Enter'); await s.settle(250); }
  };
  await transition('idle', 'walk', () => addCondition('Speed', 'greater', 0.1));
  await transition('walk', 'idle', () => addCondition('Speed', 'less', 0.1));
  await transition('idle', 'jump', () => addCondition('Jump', 'if'));
  // jump plays once and goes back at its end (exit time, no condition).
  await clickEmptyGraph();
  await side.locator('.anm-row', { hasText: 'jump' }).first().click();
  await s.settle(300);
  await side.locator('.anm-field', { hasText: 'Loop' }).locator('label.toggle').click();
  await s.settle(300);
  await side.locator('.anm-btn', { hasText: 'To…' }).click();
  await H.waitSheet();
  await H.pick('idle', { exact: true });
  await s.settle(300);

  // The idle → walk transition, selected.
  await clickEmptyGraph();
  await side.locator('.anm-row', { hasText: 'idle' }).first().click();
  await s.settle(300);
  await side.locator('.anm-row', { hasText: 'walk' }).first().click();
  await s.settle(400);
  await page.locator('.anm-zoom button[aria-label="Frame all"]').click();
  await s.settle(400);
  await s.shot('anim-transition');

  await clickEmptyGraph();
  await page.locator('.anm-zoom button[aria-label="Frame all"]').click();
  await s.settle(400);
  await s.shot('anim-controller');

  await page.locator('.panel-host.open .panel-back').click();
  await s.settle(600);
  await s.shot('anim-component', { clip: page.locator('.card', { hasText: 'Animator' }).last(), pad: 6 });
}
