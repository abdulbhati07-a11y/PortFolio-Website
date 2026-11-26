export type EmbedPlaybackEvent = {
  data: { playingURI?: string; isPaused?: boolean; isBuffering?: boolean };
};

export type SpotifyEmbedController = {
  loadEntity: (uri: string) => void;
  pause: () => void;
  destroy: () => void;
  addListener: (event: string, callback: (event: EmbedPlaybackEvent) => void) => void;
};

type SpotifyIframeApi = {
  createController: (element: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: SpotifyEmbedController) => void) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let apiPromise: Promise<SpotifyIframeApi> | undefined;

export function loadSpotifyEmbed(): Promise<SpotifyIframeApi> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(fail, 15000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      apiPromise = undefined;
      delete window.onSpotifyIframeApiReady;
      reject(new Error('Spotify’s player could not load. Check your connection or open the song in Spotify.'));
    }
    window.onSpotifyIframeApiReady = api => {
      window.clearTimeout(timeout);
      resolve(api);
    };
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    script.onerror = fail;
    document.body.appendChild(script);
  });
  return apiPromise;
}
