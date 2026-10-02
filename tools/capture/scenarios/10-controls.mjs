/** Scene → Controls: buttons with their keyboard keys, gamepad button and on-screen switch. */
export const viewport = { width: 400, height: 1300 };

export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Hill explorer', 'Controls');
  await H.split(10);
  await H.tab('scene');
  // A second button: its keys and gamepad button come from its name (use → E / X).
  await page.locator('.controls-editor .btn', { hasText: 'Add button' }).click();
  await H.prompt('use');
  await s.settle(500);
  const card = page.locator('.controls-editor');
  await card.scrollIntoViewIfNeeded();
  const rows = await page.evaluate(() => [...document.querySelectorAll('.controls-editor .vbtn-row')].map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 140)));
  console.log('ROWS', JSON.stringify(rows));
  await s.shot('controls-card', { clip: card, pad: 6 });
}
