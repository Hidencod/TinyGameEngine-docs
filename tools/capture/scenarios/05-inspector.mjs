/** Inspector: header, transform, every component (and its variants), behaviors, instance variables. */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 2000 };

export async function run({ page, s, H }) {
  const row = (label) => page.locator('.inspector .field-row').filter({ has: page.locator('.field-label', { hasText: new RegExp('^' + label) }) }).first();
  const setSelect = async (label, value) => { await row(label).locator('select').first().selectOption(value); await s.settle(500); };
  const toggle = async (label) => { await row(label).locator('input[type=checkbox], .toggle').first().click(); await s.settle(400); };
  const cardShot = async (name, title, extra = {}) => {
    const c = H.card(title);
    await c.scrollIntoViewIfNeeded();
    await s.shot(name, { clip: c, pad: 6, ...extra });
  };
  const addComponent = async (label) => {
    await page.locator('.inspector .add-btn', { hasText: 'Add component' }).click();
    await H.waitSheet();
    await H.pick(label, { exact: true });
    await s.settle(600);
  };
  const addBehavior = async (label) => {
    await page.locator('.inspector .add-btn', { hasText: 'Add behavior' }).click();
    await H.waitSheet();
    await H.pick(label, { exact: true });
    await s.settle(600);
  };
  const collapseAll = async () => {
    await page.evaluate(() => document.querySelectorAll('.inspector .card:not(.collapsed) .card-head').forEach((h) => h.click()));
    await s.settle(300);
  };

  await H.home();
  await H.newProject('Empty 3D scene', 'Inspector tour');
  await H.addObject('Cube');
  await H.tab('inspector');

  // --- phone-size overview -------------------------------------------------
  await s.shot('inspector-cube');
  await s.shot('inspector-header-annotated', {
    hl: [
      { target: page.locator('.inspector .name-input'), label: 1 },
      { target: page.locator('.insp-flags .toggle-field, .insp-flags label').nth(0), label: 2, pad: 2 },
      { target: page.locator('.insp-flags .toggle-field, .insp-flags label').nth(1), label: 3, pad: 2 },
      { target: page.locator('.tags'), label: 4, pad: 2 },
      { target: H.card('Transform'), label: 5 },
    ],
  });
  await page.locator('.tag.add').click();
  await s.settle(400);
  await s.shot('inspector-new-tag');
  await H.prompt('crate');
  await s.shot('inspector-tag-added', { clip: page.locator('.insp-header'), pad: 6 });

  await page.locator('.inspector .add-btn', { hasText: 'Add component' }).click();
  await H.waitSheet();
  await s.shot('add-component-menu');
  await H.closeSheet();
  await page.locator('.inspector .add-btn', { hasText: 'Add behavior' }).click();
  await H.waitSheet();
  await s.shot('add-behavior-menu');
  await H.sheet().locator('.sheet-body').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await s.shot('add-behavior-menu-end');
  await H.closeSheet();
  await H.card('Shape & look').locator('.card-actions .icon-btn').click();
  await H.waitSheet();
  await s.shot('component-menu');
  await H.closeSheet();

  // --- tall viewport for whole-card crops --------------------------------------
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(800);

  await cardShot('card-transform', 'Transform');
  await cardShot('card-mesh', 'Shape & look');
  await setSelect('Style', 'standard');
  await cardShot('card-mesh-realistic', 'Shape & look');
  await setSelect('Style', 'lambert');
  await setSelect('Shape', 'model');
  await cardShot('card-mesh-model', 'Shape & look');
  await setSelect('Shape', 'box');

  // Collider variants.
  await cardShot('card-collider', 'Collider');
  for (const shape of ['box', 'sphere', 'capsule', 'convex', 'mesh']) {
    await H.card('Collider').locator('select').first().selectOption(shape);
    await s.settle(400);
    await cardShot('card-collider-' + shape, 'Collider');
  }
  await H.card('Shape & look').locator('select').first().selectOption('box');
  await H.card('Collider').locator('select').first().selectOption('auto');
  await s.settle(400);

  // Physics body.
  await addComponent('Physics body');
  for (const t of ['dynamic', 'static', 'kinematic']) {
    await H.card('Physics body').locator('select').first().selectOption(t);
    await s.settle(400);
    await cardShot('card-rigidbody-' + t, 'Physics body');
  }
  await H.card('Physics body').locator('select').first().selectOption('dynamic');

  // Sound, Code script, Particles on the cube.
  await addComponent('Sound');
  await cardShot('card-audio', 'Sound');
  await addComponent('Code script');
  await cardShot('card-script', 'Code script');
  await H.card('Code script').locator('.picker-btn').click();
  await H.waitSheet();
  await page.setViewportSize(PHONE);
  await s.settle(500);
  await s.shot('script-choose');
  await H.pick('New script');
  await H.prompt('Spinner');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(600);
  await cardShot('card-script-attached', 'Code script');
  await addComponent('Particles');
  {
    const stop0 = H.card('Particles').getByRole('button', { name: /Stop preview/ });
    if (await stop0.count()) { await stop0.click(); await s.settle(300); }
  }
  await cardShot('card-particles', 'Particles');
  await H.card('Particles').locator('.picker-btn').first().click();
  await H.waitSheet();
  await page.setViewportSize(PHONE);
  await s.settle(500);
  await s.shot('particles-presets');
  await H.pick('Fire');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(1500);
  {
    const stopBtn = H.card('Particles').getByRole('button', { name: /Stop preview/ });
    if (await stopBtn.count()) { await stopBtn.click(); await s.settle(300); }
  }
  await cardShot('card-particles-fire', 'Particles');

  // Instance variables.
  const addVar = page.locator('.inspector .var-list .btn', { hasText: 'Add variable' }).last();
  await addVar.scrollIntoViewIfNeeded();
  await addVar.click();
  await H.prompt('health');
  await H.pick('Number');
  await addVar.click();
  await H.prompt('name');
  await H.pick('Text');
  await s.settle(400);
  const vars = page.locator('.inspector .var-list').last();
  await vars.scrollIntoViewIfNeeded();
  await s.shot('inspector-instance-vars', { clip: page.locator('.inspector .section-title', { hasText: 'Instance variables' }), pad: 6 });
  await s.shot('inspector-instance-vars-list', { clip: vars, pad: 8 });

  // Camera.
  await H.select('Camera');
  await H.tab('inspector');
  await cardShot('card-camera', 'Camera');
  await H.card('Camera').locator('select').first().selectOption('orthographic');
  await s.settle(400);
  await cardShot('card-camera-ortho', 'Camera');
  await H.card('Camera').locator('select').first().selectOption('perspective');

  // Lights.
  await H.select('Sun');
  await H.tab('inspector');
  for (const k of ['directional', 'point', 'spot', 'hemisphere']) {
    await H.card('Light').locator('select').first().selectOption(k);
    await s.settle(400);
    await cardShot('card-light-' + k, 'Light');
  }
  await H.card('Light').locator('select').first().selectOption('directional');

  // Text (3D/HUD text component).
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.addObject('Text');
  await page.setViewportSize(TALL);
  await H.split(8);
  await H.tab('inspector');
  await cardShot('card-text', 'Text');

  // UI elements of every kind.
  for (const [menu, name] of [['Label', 'label'], ['Button', 'button'], ['Image', 'image'], ['Progress bar', 'progress'], ['Panel', 'panel'], ['Screen (menu)', 'screen']]) {
    await page.setViewportSize(PHONE);
    await H.split(52);
    await H.addObject(menu);
    await s.settle(400);
    if (name === 'button' || name === 'progress') await s.shot('ui-mode-' + name);
    await page.setViewportSize(TALL);
    await H.split(8);
    await H.tab('inspector');
    await cardShot('card-ui-' + name, 'UI element');
  }

  void toggle;
}
