/** Debugger while playing: a breakpoint in the event sheet, the held game, the live inspector, the profiler. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Roll-a-ball', 'Coin Hunt');

  // Breakpoint on event 1: select it, tap it again for its menu.
  await H.tab('logic');
  await page.locator('.logic-tab .list-row').first().click();
  await s.settle(1200);
  const num = page.locator('.es-ev-num').first();
  await num.click(); await s.settle(300); await num.click();
  await H.waitSheet();
  await s.shot('debug-breakpoint-menu');
  await H.pick('Add breakpoint');
  await s.settle(500);
  await s.shot('debug-breakpoint-dot', { clip: page.locator('.es-event').first(), pad: 6 });
  await page.locator('.panel-host.open .panel-back').click();
  await s.settle(700);

  // Play: the breakpoint holds the game and opens the debugger.
  await page.locator('.topbar .play-btn').click();
  await page.waitForSelector('.play-debug.on', { timeout: 30000 });
  await s.settle(1200);
  await s.shot('debug-paused');

  // Inspect the player (picked by the event) and show the hud buttons.
  const player = page.locator('.play-debug-picked button', { hasText: 'Player' }).first();
  if (await player.count()) await player.click();
  else await page.locator('.play-debug-row', { hasText: /^Player$/ }).first().click();
  await s.settle(600);
  await page.locator('.play-debug-insp').evaluate((el) => { el.scrollTop = 0; });
  await s.shot('debug-inspector');
  await s.shot('debug-hud', { clip: page.locator('.play-hud'), pad: 6 });

  // Variables, then the profiler with the game running.
  await page.locator('.play-debug-tab', { hasText: 'Variables' }).click();
  await s.settle(500);
  await s.shot('debug-variables');
  await page.locator('.play-debug-banner button', { hasText: 'Remove' }).click();
  await page.locator('.play-hud button[aria-label="Resume"]').click();
  await page.locator('.play-debug-tab', { hasText: 'Profiler' }).click();
  await page.waitForFunction(() => /\d/.test(document.querySelector('.play-debug-prof-head b')?.textContent ?? ''), null, { timeout: 30000 });
  await s.settle(1500);
  await s.shot('debug-profiler');
  await page.locator('.play-stop').click();
  await s.settle(800);
}
