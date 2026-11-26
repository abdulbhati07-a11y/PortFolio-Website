import { expect, test } from '@playwright/test';

const songId = '4cOdK2wGLETKBW3PvgPWqT';
const uri = `spotify:track:${songId}`;

// Spotify's network and DRM are independent of our UI. Exercise its documented
// controller events deterministically; do not claim this verifies audio delivery.
const embedFixture = `
window.__spotifyTest = { loads: [], paused: false, destroyed: false, listeners: {} };
window.onSpotifyIframeApiReady({createController(element, options, callback) {
  const state = window.__spotifyTest;
  state.loads.push(options.uri);
  const frame = document.createElement('iframe');
  frame.title = 'Spotify Embed';
  element.replaceWith(frame);
  callback({
    addListener(name, listener) { state.listeners[name] = listener; if(name === 'ready') listener({data:{}}); },
    loadEntity(uri) { state.loads.push(uri); },
    pause() { state.paused = true; },
    destroy() { state.destroyed = true; frame.remove(); }
  });
}});
`;

test('Spotify speaker loads links, reflects playback, and survives room navigation', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://open.spotify.com/embed/iframe-api/v1', route => route.fulfill({ contentType: 'application/javascript', body: embedFixture }));
  await page.route('**/api/spotify?*', route => route.fulfill({ json: { title: 'Test song', uri, type: 'track', id: songId, url: `https://open.spotify.com/track/${songId}` } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await page.locator('.desk-scene').getByRole('button', { name: 'Open Spotify speaker', exact: true }).click();
  const player = page.getByRole('complementary', { name: 'A little music?' });
  await expect(player.getByRole('textbox', { name: 'Spotify song link' })).toBeFocused();
  await player.getByRole('textbox').fill('https://example.com/not-a-song');
  await player.getByRole('button', { name: 'Load song' }).click();
  await expect(player.getByRole('alert')).toContainText('Paste a full open.spotify.com');
  await player.getByRole('textbox').fill(`https://open.spotify.com/track/${songId}?si=tracking`);
  await player.getByRole('button', { name: 'Load song' }).click();
  await expect(player.locator('iframe')).toBeVisible();
  await expect(page.locator('.desk-scene')).toHaveAttribute('data-speaker-title', 'Test song');
  await page.evaluate(`window.__spotifyTest.listeners.playback_update({data:{playingURI:'${uri}',isPaused:false,isBuffering:false}})`);
  await expect(page.locator('.desk-scene')).toHaveAttribute('data-speaker-playing', 'true');
  await expect(player.locator('.speaker-now-playing')).toContainText('Playing');
  await player.getByRole('button', { name: 'Minimize Spotify player' }).click();
  await expect(player.locator('iframe')).toBeVisible();
  await page.locator('.room-index').getByRole('button', { name: /Projects/ }).click();
  await expect(page.getByLabel('Project desktop')).toBeVisible();
  expect(await page.evaluate('window.__spotifyTest.loads.length')).toBe(1);
  await player.getByRole('button', { name: 'Close Spotify player and stop playback' }).click();
  await expect(player).toHaveCount(0);
  await expect(page.locator('.desk-scene')).toHaveAttribute('data-speaker-playing', 'false');
  expect(await page.evaluate('window.__spotifyTest.paused && window.__spotifyTest.destroyed')).toBe(true);
});

test('Spotify metadata endpoint rejects arbitrary hosts and invalid identifiers', async ({ request }) => {
  for (const value of ['https://example.com/track/' + songId, 'https://open.spotify.com.evil.test/track/' + songId, 'https://open.spotify.com/track/invalid', 'javascript:alert(1)']) {
    const response = await request.get('/api/spotify?url=' + encodeURIComponent(value));
    expect(response.status()).toBe(400);
  }
});

test('Spotify panel fits mobile and reports unavailable songs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/spotify?*', route => route.fulfill({ status: 404, json: { error: 'Spotify could not find this item.' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await page.locator('.room-music').click();
  await page.getByRole('textbox', { name: 'Spotify song link' }).fill(uri);
  await page.getByRole('button', { name: 'Load song' }).click();
  await expect(page.locator('.spotify-speaker').getByRole('alert')).toContainText('Spotify could not find this item');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await expect(page.locator('.spotify-speaker')).toHaveCount(0);
});
