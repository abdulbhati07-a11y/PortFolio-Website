'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BootSequence from './BootSequence';
import WindowManager from './WindowManager';
import RoomPreview from './RoomPreview';
import type { Destination, PreviewKey } from './DeskScene';
import PortfolioChat from '@/components/shared/PortfolioChat';
import { profile } from '@/content/portfolio';
import { detectQuality, type QualityProfile } from '@/lib/quality';

const DeskScene = dynamic(() => import('./DeskScene'), { ssr: false, loading: () => <div className="scene-loading">Preparing the room…</div> });
const destinations: Exclude<Destination, 'room'>[] = ['projects', 'journey', 'about', 'contact'];

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function useSound() {
  const [enabled, setEnabled] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const nodes = useRef<OscillatorNode[]>([]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { setEnabled(localStorage.getItem('abdullah-sound') === 'on'); } catch { /* Storage is optional. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!enabled) {
      nodes.current.forEach((node) => { try { node.stop(); } catch { /* already stopped */ } });
      nodes.current = [];
      void audio.current?.close();
      audio.current = null;
      return;
    }
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = .008;
    gain.connect(context.destination);
    const first = context.createOscillator(); first.type = 'sine'; first.frequency.value = 82.41;
    const second = context.createOscillator(); second.type = 'sine'; second.frequency.value = 123.47;
    first.connect(gain); second.connect(gain); first.start(); second.start();
    audio.current = context; nodes.current = [first, second];
    return () => { first.stop(); second.stop(); void context.close(); };
  }, [enabled]);
  function update(value: boolean) {
    setEnabled(value);
    try { localStorage.setItem('abdullah-sound', value ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  }
  return [enabled, update] as const;
}

export default function ImmersiveExperience() {
  const [destination, setDestination] = useState<Destination>('room');
  const [visibleWindow, setVisibleWindow] = useState<Destination>('room');
  const [boot, setBoot] = useState(true);
  const [webglFailed, setWebglFailed] = useState(false);
  const [preview, setPreview] = useState<PreviewKey | null>(null);
  const [chatRequest, setChatRequest] = useState(0);
  const [quality] = useState<QualityProfile>(() => detectQuality());
  const [sound, setSound] = useSound();
  const reduced = Boolean(useReducedMotion());

  useEffect(() => {
    if (destination === 'room') return;
    const timer = window.setTimeout(() => setVisibleWindow(destination), reduced ? 0 : 720);
    return () => window.clearTimeout(timer);
  }, [destination, reduced]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { if (sessionStorage.getItem('abdullah-entered') === 'yes') setBoot(false); } catch { /* Storage is optional. */ }
      try {
        const canvas = document.createElement('canvas');
        if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) setWebglFailed(true);
      } catch { setWebglFailed(true); }
      const fromHash = window.location.hash.slice(1);
      if (destinations.includes(fromHash as Exclude<Destination, 'room'>)) setDestination(fromHash as Destination);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (preview) { setPreview(null); return; }
        setDestination('room'); history.pushState(null, '', location.pathname); return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
        const index = destinations.indexOf(destination as Exclude<Destination, 'room'>);
        const next = index === -1
          ? (event.key === 'ArrowRight' ? 0 : destinations.length - 1)
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + destinations.length) % destinations.length;
        setDestination(destinations[next]); history.pushState(null, '', '#' + destinations[next]);
      }
    }
    function pop() {
      const hash = location.hash.slice(1);
      setDestination(destinations.includes(hash as Exclude<Destination, 'room'>) ? hash as Destination : 'room');
    }
    window.addEventListener('keydown', key);
    window.addEventListener('popstate', pop);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('popstate', pop); };
  }, [destination, preview]);

  function select(next: Destination) {
    setPreview(null);
    setDestination(next);
    history.pushState(null, '', next === 'room' ? location.pathname : '#' + next);
  }

  function openChat() {
    setPreview(null);
    setChatRequest((value) => value + 1);
  }

  function enter(withSound: boolean) {
    setBoot(false);
    setSound(withSound);
    try { sessionStorage.setItem('abdullah-entered', 'yes'); } catch { /* Storage is optional. */ }
  }

  return <main className="immersive-shell">
    <a className="skip-link" href="/flat">Skip 3D experience and open Flat portfolio</a>
    <div className="scene-vignette" aria-hidden="true" />
    {webglFailed ? <div className="webgl-fallback"><p className="eyebrow">THE ROOM IS UNAVAILABLE</p><h1>The work is still here.</h1><p>Your browser could not display the 3D scene. Explore the complete portfolio in Flat mode.</p><Link href="/flat">Open the full Flat portfolio ↗</Link></div> : !boot && <SceneBoundary onFailure={() => setWebglFailed(true)}><DeskScene destination={destination} onSelect={select} onPreview={setPreview} onChat={openChat} reduced={reduced} quality={quality} onFailure={() => setWebglFailed(true)} /></SceneBoundary>}
    <div className="scene-grain" aria-hidden="true" />
    {!boot && !webglFailed && destination === 'room' && <div className="object-labels">{destinations.map((item) => <button className={'object-label ' + item} key={item} onMouseEnter={() => setPreview(item)} onFocus={() => setPreview(item)} onClick={() => select(item)}>{item} ↗</button>)}<button className="object-label assistant" onMouseEnter={() => setPreview('assistant')} onFocus={() => setPreview('assistant')} onClick={openChat}>ask the bot ↗</button></div>}
    <header className="hud-header"><button className="hud-logo" onClick={() => select('room')} aria-label="Return to room">A<span>B</span><small>THE ABDULLAH LAB</small></button><div><Link href="/flat">FLAT VERSION ↗</Link><button onClick={() => setSound(!sound)} aria-pressed={sound} aria-label={sound ? 'Mute sound' : 'Enable sound'}>{sound ? 'SOUND ON ♪' : 'SOUND OFF ♩'}</button></div></header>
    <AnimatePresence mode="wait">{destination === 'room' && !boot && !webglFailed && <motion.div className="room-intro" key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: reduced ? 0 : .55 }}><span className="eyebrow">DEVELOPER / DATA SCIENCE / PYTHON</span><h1>Ideas become<br /><em>things here.</em></h1><p>Explore Muhammad Abdullah Bhatti’s workbench.</p></motion.div>}</AnimatePresence>
    {!boot && !webglFailed && destination !== 'room' && <button className="back-room" onClick={() => select('room')}>← Back to the room</button>}
    {!boot && !webglFailed && <nav className="scene-dock" aria-label="Room destinations">{destinations.map((item, index) => <button key={item} onClick={() => select(item)} aria-current={destination === item ? 'page' : undefined}><span>0{index + 1}</span>{item}</button>)}</nav>}
    {!boot && !webglFailed && <WindowManager key={destination} destination={visibleWindow === destination ? visibleWindow : 'room'} onClose={() => select('room')} />}
    {!boot && !webglFailed && destination === 'room' && preview && <RoomPreview preview={preview} onClose={() => setPreview(null)} onOpen={() => preview === 'assistant' ? openChat() : select(preview)} />}
    {!boot && <PortfolioChat openSignal={chatRequest} />}
    {boot && !webglFailed && <BootSequence onEnter={enter} />}
    <div className="scene-status">{profile.name} <span>·</span> 5TH SEMESTER / UMT LAHORE</div>
  </main>;
}
