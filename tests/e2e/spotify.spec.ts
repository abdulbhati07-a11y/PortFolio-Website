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

test('Spotify speaker searches songs, reflects playback, and survives room navigation', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://open.spotify.com/embed/iframe-api/v1', route => route.fulfill({ contentType: 'application/javascript', body: embedFixture }));
  await page.route('**/api/spotify/search?*', route => route.fulfill({ json: { tracks: [{ title: 'Test song', artist: 'Test artist', album: 'Test album', image: null, durationMs: 180000, uri, type: 'track', id: songId, url: `https://open.spotify.com/track/${songId}` }], nextOffset: null } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await page.locator('.desk-scene').getByRole('button', { name: 'Open Spotify speaker', exact: true }).click();
  const player = page.getByRole('complementary', { name: 'A little music?' });
  await expect(player.getByRole('searchbox', { name: 'Search songs or artists' })).toBeFocused();
  await player.getByRole('searchbox').fill('Test artist');
  await player.getByRole('button', { name: 'Search', exact: true }).click();
  await player.getByRole('button', { name: 'Select Test song by Test artist' }).click();
  await expect(player.locator('iframe')).toBeVisible();
  await expect(page.locator('.desk-scene')).toHaveAttribute('data-speaker-title', 'Test song · Test artist');
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
  await page.route('**/api/spotify/search?*', route => route.fulfill({ status: 503, json: { error: 'Song search isn’t connected yet. Please try again later.' } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await page.locator('.room-music').click();
  await page.getByRole('searchbox', { name: 'Search songs or artists' }).fill('Arijit Singh');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('.spotify-speaker').getByRole('alert')).toContainText('Song search isn’t connected yet');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await expect(page.locator('.spotify-speaker')).toHaveCount(0);
});

 test('Spotify search rejects invalid queries before contacting the catalog', async ({ request }) => {
   for (const query of ['', 'a', 'a'.repeat(121)]) {
     const response = await request.get('/api/spotify/search?q=' + encodeURIComponent(query));
     expect(response.status()).toBe(400);
   }
   expect((await request.get('/api/spotify/search?q=test&offset=-1')).status()).toBe(400);
 });

 test('Spotify search handles empty results and loads additional selections', async ({ page }) => {
   await page.emulateMedia({ reducedMotion: 'reduce' });
   await page.route('https://open.spotify.com/embed/iframe-api/v1', route => route.fulfill({ contentType: 'application/javascript', body: embedFixture }));
   await page.route('**/api/spotify/search?*', route => {
     const url = new URL(route.request().url());
     const q = url.searchParams.get('q');
     const more = url.searchParams.get('offset') === '10';
     return route.fulfill({ json: { tracks: q === 'nothing' ? [] : [{ title: more ? 'Another song' : 'Test song', artist: 'Test artist', album: '', image: null, durationMs: 180000, uri: more ? 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b' : uri, type: 'track', id: more ? '0VjIjW4GlUZAMYd2vXMi3b' : songId, url: `https://open.spotify.com/track/${more ? '0VjIjW4GlUZAMYd2vXMi3b' : songId}` }], nextOffset: q === 'nothing' || more ? null : 10 } });
   });
   await page.goto('/');
   await page.getByRole('button', { name: 'Enter without sound' }).click();
   await page.locator('.room-music').click();
   const player = page.getByRole('complementary', { name: 'A little music?' });
   await player.getByRole('searchbox').fill('nothing');
   await player.getByRole('button', { name: 'Search', exact: true }).click();
   await expect(player.getByRole('status')).toContainText('No songs found');
   await player.getByRole('searchbox').fill('artist');
   await player.getByRole('button', { name: 'Search', exact: true }).click();
   await player.getByRole('button', { name: 'Select Test song by Test artist' }).click();
   await expect(player.locator('iframe')).toBeVisible();
   await player.getByRole('button', { name: 'Show more songs' }).click();
   await player.getByRole('button', { name: 'Select Another song by Test artist' }).click();
   await expect(page.locator('.desk-scene')).toHaveAttribute('data-speaker-title', 'Another song · Test artist');
   expect(await page.evaluate('window.__spotifyTest.loads.length')).toBe(2);
 });
