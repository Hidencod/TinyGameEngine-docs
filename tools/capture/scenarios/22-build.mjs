/** The Build panel: Web and Android (account, keystore), and the sign-in screen at start. */
import { join } from 'node:path';

const KEYSTORE = join(import.meta.dirname, '..', 'fixtures', 'upload-key.p12'); // keytool PKCS#12, password secret123

export async function run({ page, s, H }) {
  // The start screen, signed out.
  H.keepWelcome = true;
  await H.home().catch(() => {});
  await page.waitForSelector('.wl-layer');
  await s.settle(600);
  await s.shot('welcome');
  await page.getByRole('button', { name: 'Try the engine' }).click();
  await page.waitForSelector('.wl-layer', { state: 'detached' });
  H.keepWelcome = false;

  // Signed in as a Free account (the account server's answer is stubbed, nothing is bought).
  await page.route('**/aab-api.jeevagames.com/me', (r) => r.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ email: 'maker@example.com', pro: false, source: null, manageUrl: null,
      checkout: { monthly: 'https://example.com/m', yearly: 'https://example.com/y' } }),
  }));
  await page.evaluate(() => {
    const b = btoa(JSON.stringify({ sub: 'docs', email: 'maker@example.com', exp: Date.now() + 864e5 })).replace(/=+$/, '');
    localStorage.setItem('tge.session', b + '.docs');
  });
  await H.home();
  await H.newProject('Roll-a-ball', 'Coin Hunt');
  await H.menu();
  await H.pick('Build');
  await s.settle(900);
  await s.shot('build-web');
  await page.locator('.build-platforms .chip', { hasText: 'Android' }).click();
  await s.settle(1200);
  await s.shot('apk-dialog');

  // Import a keystore: file, then its password.
  const chooser = page.waitForEvent('filechooser');
  await page.focus('.build-keystore select');
  await page.keyboard.press('ArrowDown');
  await (await chooser).setFiles(KEYSTORE);
  await H.prompt('secret123');
  await s.settle(1200);
  const panel = page.locator('.build-sheet .sheet-body');
  await page.locator('.build-keystore').scrollIntoViewIfNeeded();
  await s.shot('build-keystore', { clip: page.locator('.build-keystore'), pad: 40 });

  // App Bundle: the Account row with the plans.
  await page.locator('.build-sheet select').filter({ has: page.locator('option[value=aab]') }).selectOption('aab');
  await s.settle(900);
  await panel.evaluate((el) => { el.scrollTop = 0; });
  await s.shot('build-account', { clip: page.locator('.build-account'), pad: 40 });
  await H.closeSheet();
}
