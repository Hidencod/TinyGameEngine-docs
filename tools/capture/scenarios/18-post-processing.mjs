/** Post-processing: the Volume component with its effects inline, the profile page, Files, and the view with effects. */
export async function run({ page, s, H }) {
  await H.home();
  await H.newProject('Post-processing', 'Look');
  await H.split(45);

  // The editor view draws the effects of the volumes it is in.
  await s.shot('pp-editor-view', { clip: page.locator('.split-viewport'), pad: 0, wait: 1500 });

  // The Global volume: profile, weight and priority, then its effects right in the inspector.
  await H.inspect('Cinematic look');
  const vol = H.card('Post-processing volume');
  await H.scrollTo(vol);
  await s.shot('pp-volume-inspector', { wait: 800 });

  // Add effect…
  await page.locator('.btn', { hasText: 'Add effect' }).first().scrollIntoViewIfNeeded();
  await page.locator('.btn', { hasText: 'Add effect' }).first().click();
  await H.waitSheet();
  await s.shot('pp-add-effect');
  await H.closeAllSheets();

  // The whole profile on a page of its own.
  await page.locator('.btn', { hasText: /^Open$/ }).first().scrollIntoViewIfNeeded();
  await page.locator('.btn', { hasText: /^Open$/ }).first().click();
  await s.settle(900);
  await s.shot('pp-profile-panel', { wait: 600 });
  await page.locator('.panel-host.open .panel-back').click();
  await s.settle(600);

  // A Box volume: size, blend distance, priority.
  await H.inspect('Dream zone');
  await H.scrollTo(H.card('Post-processing volume'));
  await s.shot('pp-volume-box', { wait: 800 });

  // A local volume shows its box (and where its blend ends) in the editor view.
  await page.locator('.vp-btn[aria-label="Focus"]').click();
  await s.settle(1200);
  await s.shot('pp-zone-bounds', { clip: page.locator('.split-viewport'), pad: 0, wait: 1200 });

  // Profiles in Files.
  await H.tab('assets');
  await page.locator('.chip', { hasText: 'Profiles' }).click();
  await s.settle(500);
  await s.shot('pp-files-profiles');
}
