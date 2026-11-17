'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BootSequence from './BootSequence';
import WindowManager from './WindowManager';
import RoomPreview from './RoomPreview';
import type { Destination, IntroStage, PreviewKey } from './DeskScene';
import PortfolioChat from '@/components/shared/PortfolioChat';
import { profile } from '@/content/portfolio';
import { detectQuality, type QualityProfile } from '@/lib/quality';

const DeskScene = dynamic(() => import('./DeskScene'), { ssr: false, loading: () => <div className="scene-loading" aria-label="Preparing the 3D room" /> });
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
    const start = context.currentTime;
    for (const [frequency, offset] of [[440, 0], [659.25, .13], [880, .27]] as const) {
      const tone = context.createOscillator(); const volume = context.createGain();
      tone.type = 'sine'; tone.frequency.value = frequency;
      volume.gain.setValueAtTime(.0001, start + offset);
      volume.gain.exponentialRampToValueAtTime(.016, start + offset + .025);
      volume.gain.exponentialRampToValueAtTime(.0001, start + offset + .34);
      tone.connect(volume); volume.connect(context.destination);
      tone.start(start + offset); tone.stop(start + offset + .36);
    }
    return () => { first.stop(); second.stop(); void context.close(); };
  }, [enabled]);
  function update(value: boolean) {
    setEnabled(value);
    try { localStorage.setItem('abdullah-sound', value ? 'on' : 'off'); } catch { /* Storage is optional. */ }
  }
  function playCue(kind: 'navigate' | 'chat' | 'open') {
    const context = audio.current;
    if (!enabled || !context) return;
    void context.resume();
    const tone = context.createOscillator(); const volume = context.createGain();
    const start = context.currentTime;
    tone.type = kind === 'chat' ? 'sine' : 'triangle';
    tone.frequency.setValueAtTime(kind === 'chat' ? 620 : kind === 'open' ? 480 : 330, start);
    tone.frequency.exponentialRampToValueAtTime(kind === 'chat' ? 940 : kind === 'open' ? 610 : 440, start + .18);
    volume.gain.setValueAtTime(.0001, start);
    volume.gain.exponentialRampToValueAtTime(.013, start + .018);
    volume.gain.exponentialRampToValueAtTime(.0001, start + .22);
    tone.connect(volume); volume.connect(context.destination);
    tone.start(start); tone.stop(start + .24);
  }
  return [enabled, update, playCue] as const;
}

export default function ImmersiveExperience() {
  const [destination, setDestination] = useState<Destination>('room');
  const [visibleWindow, setVisibleWindow] = useState<Destination>('room');
  const [introStage, setIntroStage] = useState<IntroStage>('boot');
  const [webglFailed, setWebglFailed] = useState(false);
  const [preview, setPreview] = useState<PreviewKey | null>(null);
  const [chatRequest, setChatRequest] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [quality] = useState<QualityProfile>(() => detectQuality());
  const [sound, setSound, playCue] = useSound();
  const reduced = Boolean(useReducedMotion());
  const boot = introStage === 'boot';
  const roomReady = introStage === 'ready';

  useEffect(() => {
    const next = introStage === 'bot' ? 'reveal' : introStage === 'reveal' ? 'name' : introStage === 'name' ? 'ready' : null;
    if (!next) return;
    const delay = introStage === 'bot' ? 1700 : introStage === 'reveal' ? 4200 : 2700;
    const timer = window.setTimeout(() => setIntroStage(next), delay);
    return () => window.clearTimeout(timer);
  }, [introStage]);

  useEffect(() => {
    if (destination === 'room') return;
    const timer = window.setTimeout(() => setVisibleWindow(destination), reduced ? 0 : 720);
    return () => window.clearTimeout(timer);
  }, [destination, reduced]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { if (sessionStorage.getItem('abdullah-entered') === 'yes') setIntroStage('ready'); } catch { /* Storage is optional. */ }
      try {
        const canvas = document.createElement('canvas');
        if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) { setWebglFailed(true); setIntroStage('ready'); }
      } catch { setWebglFailed(true); setIntroStage('ready'); }
      const fromHash = window.location.hash.slice(1);
      if (destinations.includes(fromHash as Exclude<Destination, 'room'>)) { setDestination(fromHash as Destination); setIntroStage('ready'); }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (!roomReady) { setIntroStage('ready'); return; }
        if (preview) { setPreview(null); return; }
        setDestination('room'); history.pushState(null, '', location.pathname); return;
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (!roomReady) return;
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
  }, [destination, preview, roomReady]);

  function select(next: Destination) {
    setPreview(null);
    setDestination(next);
    playCue('navigate');
    history.pushState(null, '', next === 'room' ? location.pathname : '#' + next);
  }

  function showPreview(next: PreviewKey) { setPreview(next); playCue('open'); }

  function openChat() {
    setPreview(null);
    setChatRequest((value) => value + 1);
    playCue('chat');
  }

  function enter(withSound: boolean, skip = false) {
    setIntroStage(skip || reduced ? 'ready' : 'bot');
    setSound(withSound);
    try { sessionStorage.setItem('abdullah-entered', 'yes'); } catch { /* Storage is optional. */ }
  }

  return <main className="immersive-shell" data-intro-stage={introStage}>
    <a className="skip-link" href="/flat">Skip 3D experience and open Flat portfolio</a>
    <div className="scene-vignette" aria-hidden="true" />
    {webglFailed ? <div className="webgl-fallback"><p className="eyebrow">THE ROOM IS UNAVAILABLE</p><h1>The work is still here.</h1><p>Your browser could not display the 3D scene. Explore the complete portfolio in Flat mode.</p><Link href="/flat">Open the full Flat portfolio ↗</Link></div> : !boot && <SceneBoundary onFailure={() => { setWebglFailed(true); setIntroStage('ready'); }}><DeskScene destination={destination} introStage={introStage} onPreview={showPreview} onChat={openChat} onDrag={() => setHasDragged(true)} reduced={reduced} quality={quality} onFailure={() => { setWebglFailed(true); setIntroStage('ready'); }} /></SceneBoundary>}
    <div className="scene-grain" aria-hidden="true" />
    {roomReady && !webglFailed && destination === 'room' && <div className="object-labels">{destinations.map((item) => <button className={'object-label ' + item} key={item} onClick={() => showPreview(item)}>{item} ↗</button>)}<button className="object-label assistant" onClick={openChat}>ask the bot ↗</button></div>}
    {roomReady && <header className="hud-header"><button className="hud-logo" onClick={() => select('room')} aria-label="Return to room">A<span>B</span><small>THE ABDULLAH LAB</small></button><div><Link href="/flat">FLAT VERSION ↗</Link><button onClick={() => setSound(!sound)} aria-pressed={sound} aria-label={sound ? 'Mute sound' : 'Enable sound'}>{sound ? 'SOUND ON ♪' : 'SOUND OFF ♩'}</button></div></header>}
    <AnimatePresence mode="wait">{destination === 'room' && roomReady && !webglFailed && <motion.div className="room-intro" key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: reduced ? 0 : .55 }}><h1>Muhammad Abdullah Bhatti</h1><p>DEVELOPER · DATA SCIENCE · PYTHON<br />5TH SEMESTER / UMT LAHORE</p></motion.div>}</AnimatePresence>
    {roomReady && !webglFailed && destination !== 'room' && <button className="back-room" onClick={() => select('room')}>← Back to the room</button>}
    {roomReady && !webglFailed && <nav className="scene-dock" aria-label="Room destinations">{destinations.map((item, index) => <button key={item} onClick={() => select(item)} aria-current={destination === item ? 'page' : undefined}><span>0{index + 1}</span>{item}</button>)}</nav>}
    {roomReady && !webglFailed && destination === 'room' && !hasDragged && !reduced && <div className="room-drag-hint" aria-hidden="true">↔ &nbsp; DRAG TO LOOK AROUND</div>}
    {roomReady && !webglFailed && <WindowManager key={destination} destination={visibleWindow === destination ? visibleWindow : 'room'} onClose={() => select('room')} />}
    {roomReady && !webglFailed && destination === 'room' && preview && <RoomPreview preview={preview} onClose={() => setPreview(null)} onOpen={() => preview === 'assistant' ? openChat() : select(preview)} />}
    {roomReady && <PortfolioChat openSignal={chatRequest} />}
    {boot && !webglFailed && <BootSequence onEnter={enter} onSkip={() => enter(false, true)} />}
    {!boot && !roomReady && !webglFailed && <><Link className="intro-flat-link" href="/flat">FLAT VERSION ↗</Link><button className="intro-skip" onClick={() => setIntroStage('ready')}>Skip intro ↗</button></>}
    {introStage === 'name' && !webglFailed && <div className="cinematic-name" role="status"><span>INTRODUCING</span><strong>ABDULLAH</strong><small>MUHAMMAD ABDULLAH BHATTI / DEVELOPER</small></div>}
    {introStage === 'bot' && !webglFailed && <div className="cinematic-caption"><span>01 / MEET YOUR GUIDE</span><p>Every room has a story.<br />This one begins here.</p></div>}
    {introStage === 'reveal' && !webglFailed && <div className="cinematic-caption reveal-caption"><span>02 / THE WORKBENCH</span><p>Ideas become things here.</p></div>}
    {roomReady && destination !== 'room' && <div className="scene-status">{profile.name} <span>·</span> 5TH SEMESTER / UMT LAHORE</div>}
  </main>;
}
