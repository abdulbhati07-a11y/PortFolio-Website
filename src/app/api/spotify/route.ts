import { parseSpotifyItem } from '@/lib/spotify';

export async function GET(request: Request) {
  const item = parseSpotifyItem(new URL(request.url).searchParams.get('url') || '');
  if (!item) return Response.json({ error: 'Paste a Spotify song, album, or playlist link.' }, { status: 400 });

  try {
    const endpoint = new URL('https://open.spotify.com/oembed');
    endpoint.searchParams.set('url', item.url);
    const response = await fetch(endpoint, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return Response.json({ error: 'Spotify could not find this item. Check that it is public and available.' }, { status: response.status === 404 ? 404 : 502 });
    const data = await response.json();
    if (typeof data.title !== 'string' || !data.title.trim()) throw new Error('Missing title');
    // Never forward or render the third party's HTML.
    return Response.json({ ...item, title: data.title.slice(0, 200) }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return Response.json({ error: 'Spotify is taking a while to respond. Try again shortly.' }, { status: 502 });
  }
}
