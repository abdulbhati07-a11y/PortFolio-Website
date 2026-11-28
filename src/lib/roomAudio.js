// A quiet electrical/fan hum, synthesized locally without a looping download.
// The context is created only after the visitor explicitly enables sound.
export function createRoomAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const sources = [];
  for (const [frequency, volume] of [[60, .40], [120, .28], [180, .055]]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;
    oscillator.connect(gain); gain.connect(master); oscillator.start();
    sources.push(oscillator);
  }

  // Low-pass air texture prevents the hum from sounding like a musical chord.
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < samples.length; i++) {
    previous = (previous + (Math.random() * 2 - 1) * .02) / 1.02;
    samples[i] = previous * 3;
  }
  const air = context.createBufferSource(), filter = context.createBiquadFilter(), airGain = context.createGain();
  air.buffer = buffer; air.loop = true;
  filter.type = 'lowpass'; filter.frequency.value = 380;
  airGain.gain.value = .10;
  air.connect(filter); filter.connect(airGain); airGain.connect(master); air.start();
  sources.push(air);

  let enabled = false, ducked = false, disposed = false, suspendTimer, revision = 0;
  async function update() {
    const version = ++revision;
    clearTimeout(suspendTimer);
    const audible = enabled && !ducked && !document.hidden;
    if (audible) await context.resume();
    if (disposed || version !== revision) return;
    const now = context.currentTime;
    master.gain.cancelAndHoldAtTime(now);
    master.gain.linearRampToValueAtTime(audible ? .012 : 0, now + (audible ? 1.6 : .28));
    if (!audible) suspendTimer = setTimeout(() => {
      if (!disposed && version === revision) context.suspend().catch(() => {});
    }, 320);
  }
  const visibility = () => { update().catch(() => {}); };
  document.addEventListener('visibilitychange', visibility);
  return {
    async setEnabled(value) { enabled = value; await update(); },
    setDucked(value) { ducked = value; update().catch(() => {}); },
    close() {
      disposed = true; revision++; clearTimeout(suspendTimer);
      document.removeEventListener('visibilitychange', visibility);
      sources.forEach(source => source.stop());
      return context.close().catch(() => {});
    },
  };
}
