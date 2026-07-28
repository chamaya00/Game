// Every sound here is synthesized with the Web Audio API — no audio files,
// so the artifact bundle stays a single self-contained HTML page.
let ctx: AudioContext | null = null;
let enabled = true;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let round1Bus: GainNode | null = null;
let round2Bus: GainNode | null = null;
let currentMusicMode: "round1" | "round2" | null = null;

function ensureCtx(): AudioContext | null {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    sfxGain = ctx.createGain();
    sfxGain.gain.value = enabled ? 1 : 0;
    sfxGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = enabled ? 1 : 0;
    musicGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Browsers require a real user gesture before audio can play. Sound effects
// already only fire from click handlers, but ambient music is started from
// a screen-driven effect that may run before any click — so resume on the
// first gesture anywhere on the page, whichever screen the user lands on.
if (typeof document !== "undefined") {
  const resumeOnGesture = () => {
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  };
  document.addEventListener("pointerdown", resumeOnGesture);
  document.addEventListener("keydown", resumeOnGesture);
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  if (!ctx) return;
  const t = ctx.currentTime;
  [sfxGain, musicGain].forEach((g) => {
    if (!g) return;
    g.gain.cancelScheduledValues(t);
    g.gain.linearRampToValueAtTime(value ? 1 : 0, t + 0.4);
  });
}

function tone(freq: number, startAt: number, durationSec: number, gainPeak: number, type: OscillatorType, ac: AudioContext, dest: AudioNode) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainPeak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(startAt);
  osc.stop(startAt + durationSec + 0.02);
}

/** A soft two-note chime for an incoming message. */
export function playReceive() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  const t = ac.currentTime;
  tone(740, t, 0.14, 0.05, "sine", ac, sfxGain);
  tone(880, t + 0.05, 0.16, 0.045, "sine", ac, sfxGain);
}

/** A quick upward blip for a sent message. */
export function playSend() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  const t = ac.currentTime;
  tone(520, t, 0.08, 0.04, "sine", ac, sfxGain);
  tone(660, t + 0.045, 0.09, 0.035, "sine", ac, sfxGain);
}

/** A light tap for pressing a choice button. */
export function playTap() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  tone(300, ac.currentTime, 0.05, 0.03, "square", ac, sfxGain);
}

/** A brief detuned flicker for the phantom-swap moment (section 9's core mechanic). */
export function playGlitch() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  const t = ac.currentTime;
  tone(180, t, 0.09, 0.05, "sawtooth", ac, sfxGain);
  tone(140, t + 0.05, 0.09, 0.045, "sawtooth", ac, sfxGain);
  tone(1200, t + 0.02, 0.03, 0.02, "square", ac, sfxGain);
}

/** A breathy, formant-swept whisper — used under silences in Round 2 (hesitate beats). */
export function playWhisper() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  const t = ac.currentTime;
  const bufferSize = Math.floor(ac.sampleRate * 1.2);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(500, t);
  filter.frequency.linearRampToValueAtTime(1400, t + 0.6);
  filter.frequency.linearRampToValueAtTime(700, t + 1.1);
  filter.Q.value = 1.2;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.03, t + 0.25);
  gain.gain.linearRampToValueAtTime(0, t + 1.1);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  noise.start(t);
  noise.stop(t + 1.2);
}

/** A low, uneasy tone for a bad-ending / ghi_chu.txt reveal. */
export function playDread() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 1.4);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.06, t + 0.2);
  gain.gain.linearRampToValueAtTime(0, t + 1.6);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start(t);
  osc.stop(t + 1.7);
}

/** THE END sting: a slow dissonant descent. */
export function playTheEnd() {
  const ac = ensureCtx();
  if (!ac || !sfxGain) return;
  const t = ac.currentTime;
  tone(196, t, 2.2, 0.06, "sine", ac, sfxGain);
  tone(185, t + 0.3, 2.0, 0.05, "sine", ac, sfxGain);
}

// --- Ambient background music -------------------------------------------
// Both beds run continuously once built (cheap sine/saw oscillators) and
// are crossfaded via gain, matching the app's ~4s "round-shift" mood swing
// instead of hard-cutting between tracks.

function buildRound1Pad(ac: AudioContext, bus: GainNode) {
  // A soft A-major-ish pad: root, fifth, third, gently detuned against each other.
  const freqs = [220, 329.63, 277.18];
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f * (1 + (i - 1) * 0.0015);
    const g = ac.createGain();
    g.gain.value = 0.028;
    osc.connect(g);
    g.connect(bus);
    osc.start();
  });

  // slow "breathing" swell on the whole pad
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.012;
  lfo.connect(lfoGain);
  lfoGain.connect(bus.gain);
  lfo.start();

  // occasional bright pentatonic "sparkle" note, warm and cozy
  const scale = [440, 493.88, 587.33, 659.25, 739.99];
  function scheduleSparkle() {
    window.setTimeout(() => {
      if (currentMusicMode === "round1") {
        const f = scale[Math.floor(Math.random() * scale.length)];
        tone(f, ac.currentTime, 1.4, 0.02, "sine", ac, bus);
      }
      scheduleSparkle();
    }, 3500 + Math.random() * 4500);
  }
  scheduleSparkle();
}

function buildRound2Drone(ac: AudioContext, bus: GainNode) {
  // A low, slightly-detuned pair of oscillators — the beating between them
  // is the "wrongness" underneath everything in Round 2.
  const base = 55; // A1
  [1, 1.006].forEach((detune) => {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = base * detune;
    const g = ac.createGain();
    g.gain.value = 0.03;
    osc.connect(g);
    g.connect(bus);
    osc.start();
  });

  // a second, higher sine sitting a fifth up, just enough to feel hollow
  const fifth = ac.createOscillator();
  fifth.type = "sine";
  fifth.frequency.value = base * 1.5;
  const fifthGain = ac.createGain();
  fifthGain.gain.value = 0.012;
  fifth.connect(fifthGain);
  fifthGain.connect(bus);
  fifth.start();

  // rare dissonant blip — a minor second above the drone, never resolving
  function scheduleDread() {
    window.setTimeout(() => {
      if (currentMusicMode === "round2") {
        const f = base * 2 * (Math.random() < 0.6 ? 1.0595 : 1);
        tone(f, ac.currentTime, 2.8, 0.014, "sine", ac, bus);
      }
      scheduleDread();
    }, 6000 + Math.random() * 7000);
  }
  scheduleDread();
}

function ensureMusicGraph(ac: AudioContext) {
  if (round1Bus) return;
  round1Bus = ac.createGain();
  round1Bus.gain.value = 0;
  round1Bus.connect(musicGain!);
  buildRound1Pad(ac, round1Bus);

  round2Bus = ac.createGain();
  round2Bus.gain.value = 0;
  round2Bus.connect(musicGain!);
  buildRound2Drone(ac, round2Bus);
}

/** Crossfades the ambient bed to match the given round's mood. Idempotent. */
export function setMusicMode(mode: "round1" | "round2") {
  const ac = ensureCtx();
  if (!ac || !musicGain) return;
  ensureMusicGraph(ac);
  if (currentMusicMode === mode) return;
  currentMusicMode = mode;
  const t = ac.currentTime;
  const fadeSec = 2.5;
  round1Bus!.gain.cancelScheduledValues(t);
  round2Bus!.gain.cancelScheduledValues(t);
  round1Bus!.gain.linearRampToValueAtTime(mode === "round1" ? 1 : 0, t + fadeSec);
  round2Bus!.gain.linearRampToValueAtTime(mode === "round2" ? 1 : 0, t + fadeSec);
}
