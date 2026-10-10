/** Game UI: Add menu entries, UI mode, and the cards of every UI element and canvas (Unity's uGUI shape). */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 2000 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Empty', 'UI shots');
  const cardShot = async (name, title) => {
    const c = H.card(title);
    await c.scrollIntoViewIfNeeded();
    await s.shot(name, { clip: c, pad: 6 });
  };

  /** Fold every group of the element card, then open the named ones. */
  const groups = async (...open) => {
    await page.evaluate((open) => {
      for (const g of document.querySelectorAll('.inspector .field-group')) {
        const title = g.querySelector('.field-group-head span:last-child')?.textContent ?? '';
        g.classList.toggle('open', open.includes(title));
      }
    }, open);
    await s.settle(300);
  };

  // The UI items of the Add menu.
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.tab('objects');
  await page.locator('.objects-tab .tab-toolbar .btn.primary').click();
  await H.waitSheet();
  await page.locator('.sheet-body').evaluate((el) => {
    const g = [...el.querySelectorAll('*')].find((n) => n.children.length === 0 && n.textContent.trim() === 'UI');
    g?.scrollIntoView({ block: 'start' });
  });
  await s.settle(400);
  await s.shot('add-menu-ui');
  await page.keyboard.press('Escape');
  await s.settle(300);

  // Every kind of element. The first one creates its Canvas, as in Unity.
  for (const [menu, name] of [['Text', 'text'], ['Button', 'button'], ['Image', 'image'], ['Slider', 'slider'], ['Panel', 'panel'], ['Screen (menu)', 'screen']]) {
    await page.setViewportSize(PHONE);
    await H.split(52);
    await H.addObject(menu);
    await s.settle(400);
    if (name === 'button' || name === 'slider') await s.shot('ui-mode-' + name);
    await page.setViewportSize(TALL);
    await H.split(8);
    await H.tab('inspector');
    // Each kind shows its own group; the shared ones get a shot of their own below.
    await groups(name === 'text' ? 'Text' : name === 'slider' ? 'Slider' : name === 'image' ? 'Image' : name === 'button' ? 'Button' : 'Panel', 'Slider values', 'Interaction');
    await cardShot('card-ui-' + name, 'UI element');
    if (name === 'text') {
      await groups('Rect Transform');
      await cardShot('card-ui-rect', 'UI element');
      await groups('Mask & effects');
      await cardShot('card-ui-fx', 'UI element');
    }
    if (name === 'panel') {
      await groups('Layout group');
      await cardShot('card-ui-layout', 'UI element');
    }
  }

  // The Canvas the first element made.
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.select('Canvas');
  await page.setViewportSize(TALL);
  await H.split(8);
  await H.tab('inspector');
  await cardShot('card-canvas', 'Canvas');

  // A World Canvas.
  await page.setViewportSize(PHONE);
  await H.split(52);
  await H.addObject('World Canvas');
  await page.setViewportSize(TALL);
  await H.split(8);
  await H.tab('inspector');
  await cardShot('card-canvas-world', 'Canvas');
}
