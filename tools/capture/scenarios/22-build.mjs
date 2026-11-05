/** The Build panel: Web and Android. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Roll-a-ball', 'Coin Hunt');
  await H.menu();
  await H.pick('Build');
  await s.settle(900);
  await s.shot('build-web');
  await page.locator('.build-platforms .chip', { hasText: 'Android' }).click();
  await s.settle(900);
  await s.shot('apk-dialog');
  await H.closeSheet();
}
