/** Effects: the Particle System's modules, Trail / Line renderer, Particle force field, and the shader Render tab. */
import { esc, PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 2000 };

export async function run({ page, s, H }) {
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
  /** A Particle System module section by its title. */
  const mod = (title) => page.locator('.ps-module').filter({ has: page.locator('.ps-module-title', { hasText: new RegExp('^' + esc(title) + '$') }) }).first();
  const isOpen = async (title) => (await mod(title).getAttribute('class'))?.split(/\s+/).includes('open');
  const setOpen = async (title, open) => {
    if ((await isOpen(title)) !== open) { await mod(title).locator('.ps-module-title').click(); await s.settle(300); }
  };
  const enable = async (title) => {
    const box = mod(title).locator('.ps-module-head input[type=checkbox]');
    if (!(await box.isChecked())) { await box.check(); await s.settle(500); }
  };
  const modShot = async (name, title) => {
    await mod(title).scrollIntoViewIfNeeded();
    await s.shot(name, { clip: mod(title), pad: 6 });
  };

  await H.home();
  await H.newProject('Empty 3D scene', 'Effects');
  await H.addObject('Cube');
  await H.tab('inspector');
  await page.setViewportSize(TALL);
  await H.split(8);
  await s.settle(800);

  // --- Particle System -------------------------------------------------------
  await addComponent('Particles');
  {
    const stop = H.card('Particles').getByRole('button', { name: /Stop preview/ });
    if (await stop.count()) { await stop.click(); await s.settle(300); }
  }
  await setOpen('Particle System', false);
  await cardShot('particles-modules', 'Particles');
  await setOpen('Particle System', true);
  await modShot('particles-main', 'Particle System');
  await setOpen('Particle System', false);
  for (const [title, name] of [['Emission', 'particles-emission'], ['Shape', 'particles-shape']]) {
    await setOpen(title, true);
    await modShot(name, title);
    await setOpen(title, false);
  }
  await enable('External Forces');
  await setOpen('External Forces', true);
  await modShot('particles-external-forces', 'External Forces');
  await setOpen('External Forces', false);
  await enable('Custom Data');
  await setOpen('Custom Data', true);
  await mod('Custom Data').locator('select').first().selectOption('vector');
  await s.settle(500);
  await modShot('particles-custom-data', 'Custom Data');
  await setOpen('Custom Data', false);
  await setOpen('Renderer', true);
  await modShot('particles-renderer', 'Renderer');
  await setOpen('Renderer', false);

  // --- Trail / Line renderer, force field -------------------------------------
  await addComponent('Trail renderer');
  await cardShot('card-trail', 'Trail renderer');
  await addComponent('Line renderer');
  await cardShot('card-line', 'Line renderer');
  await addComponent('Particle force field');
  {
    const heads = H.card('Particle force field').locator('.field-group-head');
    for (let i = 0; i < (await heads.count()); i++) {
      const g = heads.nth(i).locator('xpath=..');
      if (!(await g.getAttribute('class'))?.includes('open')) { await heads.nth(i).click(); await s.settle(200); }
    }
  }
  await cardShot('card-force-field', 'Particle force field');

  // --- Shader Render tab --------------------------------------------------------
  await page.setViewportSize(PHONE);
  await s.settle(500);
  await H.tab('assets');
  await page.getByRole('button', { name: 'New', exact: true }).click();
  await H.waitSheet();
  await H.pick('Shader (GLSL)');
  await H.pick('Particle dissolve');
  await H.prompt('Burn');
  await s.settle(1200);
  await page.locator('.shader-tab', { hasText: /^Render$/ }).click();
  await s.settle(600);
  await s.shot('shader-render-tab');
}
