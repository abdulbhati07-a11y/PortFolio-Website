export type SpotifyItem = {
  id: string;
  type: 'track' | 'album' | 'playlist';
  uri: string;
  url: string;
};

export type SpotifySearchTrack = SpotifyItem & {
  title: string;
  artist: string;
  album: string;
  image: string | null;
  durationMs: number;
};

/** Only canonical Spotify music links may reach our metadata endpoint. */
export function parseSpotifyItem(value: string): SpotifyItem | null {
  if (value.length > 512) return null;
  const input = value.trim();
  let match = /^spotify:(track|album|playlist):([a-zA-Z0-9]{22})$/.exec(input);
  if (!match) {
    try {
      const url = new URL(input);
      if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' || url.port || url.username || url.password) return null;
      match = /^\/(?:intl-[a-zA-Z-]+\/)?(?:embed\/)?(track|album|playlist)\/([a-zA-Z0-9]{22})\/?$/.exec(url.pathname);
    } catch { return null; }
  }
  if (!match) return null;
  const type = match[1] as SpotifyItem['type'];
  const id = match[2];
  return { id, type, uri: `spotify:${type}:${id}`, url: `https://open.spotify.com/${type}/${id}` };
}

export type SpeakerPlayback = {
  title: string;
  uri: string;
  isPlaying: boolean;
  isBuffering: boolean;
};

export const idleSpeaker: SpeakerPlayback = {
  title: 'Choose a song', uri: '', isPlaying: false, isBuffering: false,
};
