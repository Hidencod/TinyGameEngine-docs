/** Event sheet editor, code editor, settings, export dialog, libraries, play console. */
import { PHONE } from '../lib.mjs';

const TALL = { width: 400, height: 1300 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Roll-a-ball', 'Coin Hunt');

  // --- event sheet editor ----------------------------------------------------
  await H.tab('logic');
  await page.locator('.logic-tab .list-row').first().click();
  await s.settle(1200);
  await s.shot('es-overview');
  await page.locator('.es-scroll').evaluate((el) => { el.scrollTop = 0; });
  await s.settle(400);
  const topIcons = page.locator('.es-top .es-icon-btn');
  await s.shot('es-overview-annotated', {
    hl: [
      { target: page.locator('.es-sheet-sel'), label: 1, noScroll: true },
      { target: topIcons.nth(0), label: 2, pad: 2, badge: 'below', noScroll: true },
      { target: topIcons.nth(1), pad: 2, noScroll: true },
      { target: topIcons.nth(2), pad: 2, noScroll: true },
      { target: topIcons.nth(3), label: 6, pad: 2, badge: 'below', noScroll: true },
      { target: page.locator('.es-ev-num').first(), label: 3, pad: 2, noScroll: true },
      { target: page.locator('.es-cond').first(), label: 4, pad: 2, badge: 'right', noScroll: true },
      { target: page.locator('.es-act').first(), label: 5, pad: 2, badge: 'right', noScroll: true },
    ],
  });
  await page.setViewportSize(TALL);
  await s.settle(600);
  await s.shot('es-overview-tall');
  await page.setViewportSize(PHONE);
  await s.settle(600);

  // Select an event → selection bar.
  await page.locator('.es-ev-num').nth(1).click();
  await s.settle(500);
  await s.shot('es-selected');
  await s.shot('es-selbar', { clip: page.locator('.es-selbar'), pad: 4 });
  // Menu (right click = long press).
  await page.locator('.es-ev-num').nth(1).click({ button: 'right' });
  await s.settle(600);
  await s.shot('es-event-menu');
  await H.closeSheet();
  await page.keyboard.press('Escape');
  await s.settle(300);

  // Condition menu.
  await page.locator('.es-cond').nth(1).click({ button: 'right' });
  await s.settle(600);
  await s.shot('es-condition-menu');
  await H.closeSheet();
  await page.keyboard.press('Escape');

  // Sheet menu and ＋ More….
  await page.locator('.es-sheet-sel').click();
  await s.settle(600);
  await s.shot('es-sheet-menu');
  await H.closeSheet();
  await page.locator('.es-bottom-actions').getByRole('button', { name: 'Add other' }).click();
  await s.settle(600);
  await s.shot('es-add-more');
  await H.closeSheet();

  // Find.
  await page.getByRole('button', { name: 'Find' }).click();
  await s.settle(300);
  await page.keyboard.type('Coin');
  await s.settle(600);
  await s.shot('es-find');
  await page.getByRole('button', { name: 'Close find' }).click();
  await s.settle(300);

  // Edit an action with an expression, open the ƒx panel.
  const act = page.locator('.es-act').filter({ hasText: /Score|Coins/ }).first();
  await act.click();
  await s.settle(300);
  await act.click();
  await s.settle(800);
  await s.shot('es-edit-action');
  const fx = page.locator('.es-sheet-overlay.open .es-fx-btn[aria-label="Insert"]').first();
  if (await fx.count()) {
    await fx.click();
    await s.settle(500);
    await s.shot('es-param-fx');
  }
  await page.keyboard.press('Escape');
  await s.settle(500);
  if (await page.locator('.es-sheet-overlay.open').count()) {
    await page.locator('.es-sheet-overlay.open [aria-label="Close"]').first().click().catch(() => {});
    await s.settle(500);
  }

  // Picker: System conditions, then search.
  await page.locator('.es-add-event').click();
  await s.settle(600);
  await page.locator('.es-sheet-overlay.open .es-pick-tile').filter({ hasText: 'System' }).click();
  await s.settle(500);
  await s.shot('es-picker-system');
  await page.locator('.es-sheet-overlay.open .es-search').fill('timer');
  await s.settle(500);
  await s.shot('es-picker-search');
  await page.keyboard.press('Escape');
  await s.settle(500);
  if (await page.locator('.es-sheet-overlay.open').count()) {
    await page.locator('.es-sheet-overlay.open [aria-label="Close"]').first().click().catch(() => {});
    await s.settle(500);
  }
  await page.locator('.panel-back').click();
  await s.settle(600);

  // --- code editor --------------------------------------------------------------
  await H.tab('logic');
  await page.locator('.logic-tab .section-title', { hasText: 'Code scripts' }).locator('.btn').click();
  await H.waitSheet();
  await s.shot('script-new-kind');
  await H.pick('Object script');
  await H.prompt('Spinner');
  await s.settle(1500);
  await s.shot('code-editor');
  await page.getByRole('button', { name: 'Insert an example' }).click();
  await H.waitSheet();
  await s.shot('code-snippets');
  await H.pick('Spin');
  await s.settle(600);
  await s.shot('code-snippet-insert');
  await H.pick('Replace the whole script');
  await s.settle(800);
  await s.shot('code-editor-snippet');
  await page.getByRole('button', { name: 'API help' }).click();
  await s.settle(700);
  await s.shot('code-api');
  await page.getByRole('button', { name: 'API help' }).click().catch(() => {});
  await page.locator('.panel-back').click();
  await s.settle(600);
  await s.shot('logic-with-script');

  // --- project settings -------------------------------------------------------
  await H.menu();
  await H.pick('Project settings');
  await s.settle(700);
  await s.shot('settings-panel');
  await page.setViewportSize({ width: 400, height: 1500 });
  await s.settle(600);
  await s.shot('settings-panel-full');
  await page.setViewportSize(PHONE);
  await page.locator('.panel-back').click();
  await s.settle(600);

  // --- APK export dialog --------------------------------------------------------
  await H.menu();
  await H.pick('Export game (APK)');
  await s.settle(900);
  await s.shot('apk-dialog');
  await H.closeSheet();

  // --- libraries -----------------------------------------------------------------
  await H.tab('assets');
  await s.shot('assets-tab-coins');
  await page.getByRole('button', { name: /Free sounds/ }).click();
  await H.waitSheet();
  await s.shot('sounds-library');
  await H.closeSheet();
  await page.getByRole('button', { name: /Free models/ }).click();
  await s.settle(4000);
  await s.shot('models-library');
  await page.locator('.library-search').fill('car');
  await s.settle(1500);
  await s.shot('models-library-search');
  await page.locator('.panel-back').click();
  await s.settle(600);

  // Sky picker (Scene tab → Background → Sky image).
  await H.tab('scene');
  const bg = page.locator('.scene-tab .field-row').filter({ has: page.locator('.field-label', { hasText: /^Background$/ }) }).locator('select');
  if (await bg.count()) {
    if ((await bg.inputValue()) === 'sky') {
      await s.shot('scene-sky');
      await page.locator('.scene-tab .picker-btn').first().click();
    } else {
      await bg.selectOption('sky');
    }
    await H.waitSheet();
    await s.shot('sky-picker');
    await H.closeSheet();
  }
  await page.setViewportSize({ width: 400, height: 1600 });
  await H.split(8);
  await s.settle(600);
  await s.shot('scene-tab-full', { clip: page.locator('.scene-tab'), pad: 0 });
  await page.setViewportSize(PHONE);
  await H.split(52);

  // --- play console ----------------------------------------------------------------
  await page.locator('.topbar .play-btn').click();
  await s.settle(3500);
  await s.shot('play-mode');
  await page.getByRole('button', { name: 'Debug console' }).click().catch(() => {});
  await s.settle(600);
  await s.shot('play-console');
  await page.locator('.play-stop').click();
  await s.settle(800);
}
