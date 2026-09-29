import { dragArrow } from '../lib.mjs';
/** Both guided tutorials, one screenshot per step (plus the key moments inside a step). */

/** Follow the tutorial's own drag hint: press where its finger presses, slide where it slides. */
async function dragLikeHint(page, s) {
  const finger = page.locator('.tut-drag.on');
  await finger.waitFor({ timeout: 15000 });
  const pts = [];
  for (let i = 0; i < 40; i++) {
    pts.push(await finger.evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return { x: m.e, y: m.f, o: Number(getComputedStyle(el).opacity) };
    }));
    await page.waitForTimeout(60);
  }
  const vis = pts.filter((p) => p.o > 0.5);
  const start = vis[0];
  let end = start, best = 0;
  for (const p of vis) { const d = Math.hypot(p.x - start.x, p.y - start.y); if (d > best) { best = d; end = p; } }
  // The path's start: the point furthest from the end.
  let st = end; best = 0;
  for (const p of vis) { const d = Math.hypot(p.x - end.x, p.y - end.y); if (d > best) { best = d; st = p; } }
  return { from: st, to: end };
}

async function drag(page, from, to, extra = 1.6) {
  const tx = from.x + (to.x - from.x) * extra, ty = from.y + (to.y - from.y) * extra;
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) { await page.mouse.move(from.x + (tx - from.x) * i / 12, from.y + (ty - from.y) * i / 12); await page.waitForTimeout(30); }
  await page.mouse.up();
  await page.waitForTimeout(600);
}

const card = (page) => page.locator('.tut-card');
const title = (page) => page.locator('.tut-title');

async function waitTitle(page, re, timeout = 15000) {
  await page.waitForFunction((src) => new RegExp(src).test(document.querySelector('.tut-title')?.textContent ?? ''), re.source, { timeout });
  await page.waitForTimeout(700);
}

async function esPickItem(page, name) {
  await page.locator('.es-sheet-overlay.open .es-pick-item').filter({ has: page.locator('.es-pick-label', { hasText: new RegExp('^' + name + '$') }) }).first().click();
  await page.waitForTimeout(500);
}
async function esCard(page, label) {
  await page.locator('.es-sheet-overlay.open .es-pick-card').filter({ has: page.locator('.es-pick-label', { hasText: label }) }).first().click();
  await page.waitForTimeout(600);
}
async function esField(page, label) {
  return page.locator('.es-sheet-overlay.open .es-field').filter({ has: page.locator('.es-field-label', { hasText: new RegExp('^' + label + '$') }) }).first();
}

export async function run({ page, s, H }) {
  await H.home();
  await page.locator('.learn-card').click();
  await H.waitSheet();
  await H.pick('Part 1');
  await page.waitForSelector('.editor');
  await waitTitle(page, /first game/);
  await s.settle(1500);
  await s.shot('tut1-01-welcome');
  await page.locator('.tut-foot .btn').first().click();

  await waitTitle(page, /Try the game/);
  await s.shot('tut1-02-try');
  await page.locator('.topbar .play-btn').click();
  await waitTitle(page, /Roll around/);
  await s.settle(2500);
  await s.shot('tut1-03-playing');
  await page.locator('.play-stop').click();

  await waitTitle(page, /Add a coin/);
  await s.shot('tut1-04-add-coin');
  await H.tab('objects');
  await page.locator('.objects-tab .tab-toolbar .btn.primary').click();
  await H.waitSheet();
  await s.shot('tut1-05-add-menu');
  await H.pick('Cylinder', { exact: true });

  await waitTitle(page, /Move the coin/);
  await s.settle(2500);
  await s.shot('tut1-06-move-hint');
  await page.locator('.tut-icon[aria-label="Minimize"]').click();
  await s.settle(500);
  await dragArrow(page, 'x', 1.3);
  await s.settle(800);
  await s.shot('tut1-07-moved');

  await waitTitle(page, /Make it gold/);
  await s.shot('tut1-08-gold');
  await H.tab('inspector');
  await s.shot('tut1-09-color-field');
  await page.locator('.inspector .field-row').filter({ has: page.locator('.field-label', { hasText: /^Color$/ }) }).locator('.color-input').first().fill('#ffc400');
  await s.settle(600);

  await waitTitle(page, /Open the event sheet/);
  await H.tab('logic');
  await s.shot('tut1-10-open-sheet');
  await page.locator('.logic-tab .list-row').first().click();
  await s.settle(1000);

  await waitTitle(page, /WHEN the ball/);
  await s.shot('tut1-11-add-event');
  await page.locator('.es-add-event').first().click();
  await s.settle(700);
  await s.shot('tut1-12-pick-object');
  await esPickItem(page, 'Player');
  await s.shot('tut1-13-pick-condition');
  await esCard(page, 'On collision with');
  await (await esField(page, 'Other object')).locator('select').selectOption('Cylinder');
  await s.settle(600);
  await s.shot('tut1-14-condition-params');
  await page.locator('.es-sheet-overlay.open .es-btn-primary').filter({ hasText: /Add condition/ }).click();
  await s.settle(800);

  await waitTitle(page, /DO destroy/);
  await s.shot('tut1-15-add-action');
  await page.locator('.es-add-act').first().click();
  await s.settle(700);
  const coin = await page.locator('.es-sheet-overlay.open .es-pick-item .es-pick-label').allTextContents();
  await esPickItem(page, coin.find((c) => /Cylinder|Coin/.test(c)) ?? 'Cylinder');
  await s.shot('tut1-16-pick-destroy');
  await esCard(page, 'Destroy');
  await s.settle(400);
  const addBtn = page.locator('.es-sheet-overlay.open .es-btn-primary').filter({ hasText: /Add action/ });
  if (await addBtn.count()) await addBtn.click();
  await s.settle(900);
  await s.shot('tut1-17-event-done');

  await waitTitle(page, /Test it/);
  await page.locator('.panel-back').click();
  await s.settle(600);
  await page.locator('.topbar .play-btn').click();
  await waitTitle(page, /Collect the coin/);
  await s.settle(2500);
  await s.shot('tut1-18-collect');
  await page.locator('.play-stop').click();
  await waitTitle(page, /You made a game/);
  await s.shot('tut1-19-done');

  // ---- Part 2 --------------------------------------------------------------
  await page.locator('.tut-foot .btn.primary').click();
  await waitTitle(page, /Part 2/);
  await s.settle(1200);
  await s.shot('tut2-01-intro');
  await page.locator('.tut-foot .btn').first().click();

  await waitTitle(page, /More coins/);
  await H.tab('objects');
  await s.shot('tut2-02-more-coins');
  for (let i = 0; i < 4; i++) {
    if (!/More coins/.test(await title(page).textContent())) break;
    const coinRow = page.locator('.tree-row').filter({ has: page.locator('.tree-name', { hasText: /^(Cylinder|Coin)/ }) }).first();
    await coinRow.locator('.tree-btn[aria-label="More"]').click();
    await H.waitSheet();
    if (i === 0) await s.shot('tut2-03-duplicate-menu');
    await H.pick('Duplicate');
    await s.settle(500);
  }

  await waitTitle(page, /Spread them out/);
  await s.settle(1500);
  await s.shot('tut2-04-spread');
  for (let i = 0; i < 6; i++) {
    if (!/Spread them out/.test(await title(page).textContent())) break;
    const ring = page.locator('.tut-ring');
    if (await page.locator('.tut-tip').isVisible().catch(() => false)) {
      const b = await ring.boundingBox();
      if (b) { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await s.settle(900); }
    }
    if (await page.locator('.tut-icon[aria-label="Minimize"]').isVisible()) await page.locator('.tut-icon[aria-label="Minimize"]').click();
    await s.settle(400);
    const moves = [['x', 0.9], ['z', 0.9], ['x', -1.4], ['z', -1.4], ['x', 1.8], ['z', 1.8]];
    try { await dragArrow(page, moves[i][0], moves[i][1]); } catch (e) { console.warn(e.message); }
    await s.settle(900);
  }

  await waitTitle(page, /A label for the score/);
  await s.shot('tut2-05-label');
  await H.addObject('Label');
  await waitTitle(page, /Write on the label/);
  await H.tab('inspector');
  await s.shot('tut2-06-label-text');
  const text = page.locator('.inspector .field-row').filter({ has: page.locator('.field-label', { hasText: /^Text$/ }) }).locator('textarea, input').first();
  await text.fill('Score: 0');
  await text.blur();
  await s.settle(800);

  await waitTitle(page, /Open the event sheet|Count the coins/);
  await H.tab('logic');
  await page.locator('.logic-tab .list-row').first().click();
  await s.settle(1000);
  await waitTitle(page, /Count the coins/);
  await s.shot('tut2-07-count');
  await page.locator('.es-add-act').first().click();
  await s.settle(700);
  await page.locator('.es-sheet-overlay.open .es-pick-tile').filter({ hasText: 'System' }).click();
  await s.settle(600);
  await s.shot('tut2-08-system-actions');
  await esCard(page, 'Add to variable');
  await s.shot('tut2-09-add-to-var');
  // The step asks to create a Score variable if there is none.
  const newVar = page.locator('.es-sheet-overlay.open').getByText(/New (global )?variable/).first();
  const varField = await esField(page, 'Variable');
  const sel = varField.locator('select');
  if (await sel.count()) {
    const opts = await sel.locator('option').allTextContents();
    const create = opts.find((o) => /New/.test(o));
    if (!opts.includes('Score') && create) {
      await sel.selectOption({ label: create });
      await s.settle(600);
      await s.shot('tut2-10-new-variable');
      const nameInput = page.locator('input:focus');
      await nameInput.fill('Score');
      await nameInput.press('Enter');
      await s.settle(700);
    }
  } else if (await newVar.count()) await newVar.click();
  await s.shot('tut2-11-add-to-var-filled');
  await page.locator('.es-sheet-overlay.open .es-btn-primary').filter({ hasText: /Add action/ }).click();
  await s.settle(900);

  await waitTitle(page, /Show the score/);
  await s.shot('tut2-12-show-score');
  await page.locator('.es-add-act').first().click();
  await s.settle(600);
  await esPickItem(page, 'Label');
  await esCard(page, 'Set label');
  const textF = (await esField(page, 'Text')).locator('input, textarea').first();
  await textF.fill('"Score: " + Score');
  await s.settle(500);
  await s.shot('tut2-13-set-label');
  await page.locator('.es-sheet-overlay.open .es-btn-primary').filter({ hasText: /Add action/ }).click();
  await s.settle(900);

  await waitTitle(page, /all coins are collected/);
  await s.shot('tut2-14-win-event');
  await page.locator('.es-add-event').first().click();
  await s.settle(600);
  await page.locator('.es-sheet-overlay.open .es-pick-tile').filter({ hasText: 'System' }).click();
  await s.settle(500);
  await esCard(page, 'Compare variable');
  const val = (await esField(page, 'Value')).locator('input').first();
  await val.fill('3');
  await s.settle(500);
  await s.shot('tut2-15-compare');
  await page.locator('.es-sheet-overlay.open .es-btn-primary').filter({ hasText: /Add condition/ }).click();
  await s.settle(900);

  await waitTitle(page, /You win/);
  await page.locator('.es-add-act').last().click();
  await s.settle(600);
  await esPickItem(page, 'Label');
  await esCard(page, 'Set label');
  await (await esField(page, 'Text')).locator('input, textarea').first().fill('"You win!"');
  await s.settle(800);
  await page.locator('.es-sheet-overlay.open .es-btn-primary').filter({ hasText: /Add action/ }).click();
  await s.settle(900);
  await s.shot('tut2-16-sheet-done');

  await page.locator('.panel-back').click();
  await s.settle(600);
  await page.locator('.topbar .play-btn').click();
  await waitTitle(page, /Collect them all/);
  await s.settle(2500);
  await s.shot('tut2-17-playing');
  await page.locator('.play-stop').click();
  await waitTitle(page, /finished the tutorials/);
  await s.shot('tut2-18-finished');
  void card;
}
