import { limitRequest } from '@/lib/rate-limit';
import { parseSpotifyItem, type SpotifySearchTrack } from '@/lib/spotify';

export const runtime = 'nodejs';

let token: { value: string; expires: number } | undefined;
let pendingToken: Promise<string> | undefined;

async function accessToken() {
  if (token && token.expires > Date.now()) return token.value;
  if (pendingToken) return pendingToken;
  pendingToken = (async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store', signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Spotify authorization unavailable');
    const data = await response.json();
    if (typeof data.access_token !== 'string' || typeof data.expires_in !== 'number') throw new Error('Invalid token response');
    token = { value: data.access_token, expires: Date.now() + Math.max(0, data.expires_in - 60) * 1000 };
    return token.value;
  })();
  try { return await pendingToken; } finally { pendingToken = undefined; }
}

type CatalogTrack = {
  id?: string; name?: string; duration_ms?: number;
  artists?: { name?: string }[];
  album?: { name?: string; images?: { url?: string }[] };
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get('q') || '').trim();
  const offset = Number(params.get('offset') || '0');
  if (query.length < 2 || query.length > 120 || !Number.isInteger(offset) || offset < 0 || offset > 990) {
    return Response.json({ error: 'Search with 2–120 characters.' }, { status: 400 });
  }
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return Response.json({ error: 'Song search isn’t connected yet. Please try again later.' }, { status: 503 });
  }
  try {
    const limited = await limitRequest('spotify', request);
    if (!limited.ok) return Response.json({ error: limited.reason }, { status: limited.status });
    const endpoint = new URL('https://api.spotify.com/v1/search');
    endpoint.search = new URLSearchParams({ q: query, type: 'track', limit: '10', offset: String(offset), market: process.env.SPOTIFY_MARKET || 'PK' }).toString();
    const search = async () => fetch(endpoint, { headers: { Authorization: `Bearer ${await accessToken()}` }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    let response = await search();
    if (response.status === 401) { token = undefined; response = await search(); }
    if (response.status === 429) return Response.json({ error: 'Spotify is busy. Try your search again shortly.' }, { status: 429 });
    if (!response.ok) return Response.json({ error: 'Spotify search is unavailable right now. Please try again later.' }, { status: 502 });
    const data = await response.json();
    if (!Array.isArray(data.tracks?.items)) throw new Error('Invalid search response');
    const tracks: SpotifySearchTrack[] = data.tracks.items.flatMap((track: CatalogTrack | null) => {
      if (!track || typeof track.name !== 'string') return [];
      const item = parseSpotifyItem(`spotify:track:${track.id}`);
      if (!item) return [];
      const image = track.album?.images?.at(-1)?.url;
      return [{ ...item, title: track.name.slice(0, 200), artist: (track.artists || []).map(artist => artist.name || '').filter(Boolean).join(', ').slice(0, 200), album: (track.album?.name || '').slice(0, 200), image: image && /^https:\/\/i\.scdn\.co\//.test(image) ? image : null, durationMs: Math.max(0, Number(track.duration_ms) || 0) }];
    });
    return Response.json({ tracks, nextOffset: data.tracks.next && offset < 990 ? offset + 10 : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Couldn’t connect to Spotify search. Please try again.' }, { status: 502 });
  }
}
