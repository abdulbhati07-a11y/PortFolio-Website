'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { FiExternalLink, FiMinus, FiMusic, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { idleSpeaker, parseSpotifyItem, type SpeakerPlayback, type SpotifyItem, type SpotifySearchTrack } from '@/lib/spotify';
import { loadSpotifyEmbed, type EmbedPlaybackEvent, type SpotifyEmbedController } from '@/lib/spotify-embed';

type Selection = SpotifyItem & { title: string };
type Props = {
  selection: Selection | null;
  onSelection: (selection: Selection) => void;
  onPlayback: (playback: SpeakerPlayback) => void;
  onClose: () => void;
};

export default function SpotifySpeaker({ selection, onSelection, onPlayback, onClose }: Props) {
  const [input, setInput] = useState('');
  const [results,setResults] = useState<SpotifySearchTrack[]>([]);
  const [searched,setSearched] = useState(false);
  const [nextOffset,setNextOffset] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playback, setPlayback] = useState<SpeakerPlayback>(idleSpeaker);
  const inputRef = useRef<HTMLInputElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyEmbedController | null>(null);
  const current = useRef(selection);
  const fetchAbort = useRef<AbortController | null>(null);
  const trackAbort = useRef<AbortController | null>(null);
  const trackLookup = useRef('');
  const latestPlayback = useRef<SpeakerPlayback>(idleSpeaker);

  useEffect(() => { current.current = selection; }, [selection]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => { fetchAbort.current?.abort(); trackAbort.current?.abort(); previous?.focus(); };
  }, []);

  const report = useCallback((state: SpeakerPlayback) => {
    const previous = latestPlayback.current;
    if (previous.title === state.title && previous.uri === state.uri && previous.isPlaying === state.isPlaying && previous.isBuffering === state.isBuffering) return;
    latestPlayback.current = state;
    setPlayback(state);
    onPlayback(state);
  }, [onPlayback]);

  const syncPlayback = useCallback((event: EmbedPlaybackEvent) => {
    const item = current.current;
    if (!item) return;
    const uri = event.data.playingURI || item.uri;
    const state = { title: uri === item.uri ? item.title : 'Spotify track', uri, isPlaying: event.data.isPaused === false, isBuffering: Boolean(event.data.isBuffering) };
    report(state);
    // Album/playlist playback can advance inside Spotify's own controls.
    if (uri !== item.uri && uri !== trackLookup.current && parseSpotifyItem(uri)) {
      trackAbort.current?.abort();
      trackLookup.current = uri;
      const abort = new AbortController();
      trackAbort.current = abort;
      fetch(`/api/spotify?url=${encodeURIComponent(uri)}`, { signal: abort.signal })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (!data || abort.signal.aborted) return;
          current.current = { ...data };
          if (latestPlayback.current.uri === uri) report({ ...latestPlayback.current, title: data.title });
        }).catch(() => { /* The embedded player still shows the track details. */ });
    }
  }, [report]);

  // The embed lives outside the section surfaces, so room navigation does not restart it.
  const hasSelection = Boolean(selection);
  useEffect(() => {
    if (!hasSelection || !host.current) return;
    let disposed = false;
    const container = host.current;
    const element = document.createElement('div');
    container.appendChild(element);
    const timeout = window.setTimeout(() => {
      if (!disposed) setPlayerError('Spotify’s player is taking a while to connect. Try again or open the song in Spotify.');
    }, 20000);
    loadSpotifyEmbed().then(api => {
      if (disposed || !current.current) return;
      api.createController(element, { uri: current.current.uri, width: '100%', height: 152 }, embed => {
        if (disposed) { embed.destroy(); return; }
        controller.current = embed;
        embed.addListener('ready', () => { if (!disposed) { window.clearTimeout(timeout); setReady(true); setPlayerError(''); } });
        embed.addListener('playback_update', event => { if (!disposed) syncPlayback(event); });
        embed.addListener('playback_started', event => { if (!disposed) syncPlayback({ data: { ...event.data, isPaused: false } }); });
      });
    }).catch(cause => { if (!disposed) setPlayerError(cause.message); });
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.current?.pause();
      controller.current?.destroy();
      controller.current = null;
      container.replaceChildren();
    };
  }, [hasSelection, syncPlayback, retry]);

  async function searchSongs(event?: FormEvent<HTMLFormElement>, offset = 0) {
    event?.preventDefault();
    const query = input.trim();
    if (query.length < 2) { setError('Enter at least two characters to search.'); return; }
    fetchAbort.current?.abort();
    const abort = new AbortController();
    fetchAbort.current = abort;
    setBusy(true); setError('');
    if (!offset) { setResults([]); setSearched(false); setNextOffset(null); }
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&offset=${offset}`, { signal: abort.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not search Spotify.');
      if (abort.signal.aborted) return;
      setResults(previous => offset ? [...previous, ...data.tracks] : data.tracks);
      setNextOffset(data.nextOffset);
      setSearched(true);
    } catch (cause) {
      if (!abort.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not reach Spotify. Try again.');
    } finally { if (!abort.signal.aborted) setBusy(false); }
  }

  function selectSong(track: SpotifySearchTrack) {
    trackAbort.current?.abort();
    trackLookup.current = '';
    const next: Selection = { ...track, title: `${track.title}${track.artist ? ` · ${track.artist}` : ''}` };
    controller.current?.pause();
    current.current = next;
    onSelection(next);
    controller.current?.loadEntity(next.uri);
    report({ ...idleSpeaker, title: next.title, uri: next.uri });
    setPlayerError('');
  }

  const status = playback.isBuffering ? 'Buffering' : playback.isPlaying ? 'Playing' : selection ? 'Ready to play' : 'Your room. Your soundtrack.';
  return <aside className={`spotify-speaker ${compact ? 'is-compact' : ''}`} aria-labelledby="speaker-title">
    <header className="speaker-player-heading">
      <div className="speaker-player-icon"><FiMusic aria-hidden="true" /></div>
      <div><span className="speaker-eyebrow">THE DESK SPEAKER</span><h2 id="speaker-title">A little music?</h2></div>
      <button type="button" aria-label={compact ? 'Expand Spotify player' : 'Minimize Spotify player'} onClick={() => setCompact(value => !value)}>{compact ? <FiPlus /> : <FiMinus />}</button>
      <button type="button" aria-label="Close Spotify player and stop playback" onClick={onClose}><FiX /></button>
    </header>
    {!compact && <div className="speaker-song-picker">
      <p>Search a song or artist, then choose your soundtrack.</p>
      <form onSubmit={searchSongs} role="search" aria-label="Search Spotify songs">
        <label htmlFor="speaker-song-search">Search songs or artists</label>
        <div><input ref={inputRef} id="speaker-song-search" type="search" value={input} onChange={event => { fetchAbort.current?.abort(); setBusy(false); setInput(event.target.value); setResults([]); setSearched(false); setNextOffset(null); setError(''); }} maxLength={120} placeholder="Song title or artist…" autoComplete="off" required /><button disabled={busy} type="submit"><FiSearch aria-hidden="true" />{busy ? 'Searching…' : 'Search'}</button></div>
      </form>
      {error && <p className="speaker-error" role="alert">{error}</p>}
      <div className="speaker-search-summary" role="status">{busy ? 'Searching Spotify…' : searched ? results.length ? `${results.length} songs found` : 'No songs found. Try another title or artist.' : 'Search the Spotify catalog'}</div>
      {results.length > 0 && <ul className="speaker-search-results" aria-label="Spotify search results">{results.map(track => <li key={track.id}><button type="button" aria-label={`Select ${track.title} by ${track.artist}`} aria-pressed={selection?.uri === track.uri} onClick={() => selectSong(track)}>
        {track.image ? <Image src={track.image} alt="" width={40} height={40} unoptimized /> : <span className="speaker-result-art"><FiMusic aria-hidden="true" /></span>}
        <span className="speaker-result-copy"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="speaker-result-duration">{Math.floor(track.durationMs / 60000)}:{String(Math.floor(track.durationMs / 1000) % 60).padStart(2, '0')}</span>
      </button></li>)}</ul>}
      {nextOffset !== null && <button className="speaker-more" type="button" disabled={busy} onClick={() => searchSongs(undefined, nextOffset)}>Show more songs</button>}
      <a className="speaker-find-song" href="https://open.spotify.com" target="_blank" rel="noreferrer">Music from Spotify <FiExternalLink aria-hidden="true" /></a>
    </div>}
    <div className="speaker-now-playing" aria-live="polite"><span className={playback.isPlaying ? 'is-playing' : ''} /><div><strong>{playback.title === idleSpeaker.title && selection ? selection.title : playback.title}</strong><p>{status}</p></div></div>
    {selection && <div className="speaker-embed-shell">
      {!ready && !playerError && <p role="status">Connecting to Spotify…</p>}
      <div className="speaker-embed" ref={host} />
      {playerError && <div className="speaker-error" role="alert"><p>{playerError}</p><button className="speaker-retry" type="button" onClick={() => { setPlayerError(''); setReady(false); setRetry(value => value + 1); }}>Retry player</button></div>}
      <a className="speaker-open-track" href={selection.url} target="_blank" rel="noreferrer">Open in Spotify <FiExternalLink aria-hidden="true" /></a>
    </div>}
    {!compact && <p className="speaker-playback-note">Press play in the Spotify player. Full songs or previews depend on Spotify, your account, and your browser.</p>}
  </aside>;
}
