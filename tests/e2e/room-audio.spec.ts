import { expect, test } from '@playwright/test';

test('Room hum is opt-in, quiet, muted for Spotify and restored after pause', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(`
    window.__roomAudio = [];
    const NativeContext = window.AudioContext;
    window.AudioContext = class extends NativeContext {
      constructor(...args) {
        super(...args); window.__roomAudio.push(this);
        const createGain = this.createGain.bind(this);
        this.createGain = () => { const gain = createGain(); this.__master ||= gain; return gain; };
      }
    };
  `);
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  expect(await page.evaluate('window.__roomAudio.length')).toBe(0);
  const sound = page.locator('.room-sound');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate('window.__roomAudio[0].__master.gain.value')).toBeCloseTo(.012, 3);
  await sound.click();
  await expect.poll(() => page.evaluate('window.__roomAudio[0].state')).toBe('suspended');
  await sound.click();
  await expect.poll(() => page.evaluate('window.__roomAudio[0].state')).toBe('running');

  const id = '4cOdK2wGLETKBW3PvgPWqT';
  await page.route('**/api/spotify/search?*', route => route.fulfill({ json: { tracks: [{ id, uri: `spotify:track:${id}`, url: `https://open.spotify.com/track/${id}`, type: 'track', title: 'Audio check', artist: 'Test artist', image: null, durationMs: 180000 }], nextOffset: null } }));
  await page.route('https://open.spotify.com/embed/iframe-api/v1', route => route.fulfill({ contentType: 'application/javascript', body: `window.onSpotifyIframeApiReady({createController(el, options, done){done({addListener(name, cb){if(name==='ready')cb({data:{}});if(name==='playback_update')window.__playback=cb;},pause(){},destroy(){},loadEntity(){}});}});` }));
  await page.locator('.room-music').click();
  await page.getByRole('searchbox').fill('Audio check');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: 'Select Audio check by Test artist' }).click();
  await expect.poll(() => page.evaluate('typeof window.__playback')).toBe('function');
  await page.evaluate(`window.__playback({data:{playingURI:'spotify:track:${id}',isPaused:false}})`);
  await expect.poll(() => page.evaluate('window.__roomAudio[0].state')).toBe('suspended');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(`window.__playback({data:{playingURI:'spotify:track:${id}',isPaused:true}})`);
  await expect.poll(() => page.evaluate('window.__roomAudio[0].__master.gain.value')).toBeCloseTo(.012, 3);

  await page.reload();
  await page.getByRole('button', { name: 'Enter with sound', exact: true }).click();
  await expect(page.locator('.room-sound')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate('window.__roomAudio[0].__master.gain.value')).toBeCloseTo(.012, 3);
});
