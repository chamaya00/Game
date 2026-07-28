// Every sound here is synthesized with the Web Audio API — no audio files,
// so the artifact bundle stays a single self-contained HTML page.
let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

function tone(freq: number, startAt: number, durationSec: number, gainPeak: number, type: OscillatorType, ac: AudioContext) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(gainPeak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + durationSec + 0.02);
}

/** A soft two-note chime for an incoming message. */
export function playReceive() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  tone(740, t, 0.14, 0.05, "sine", ac);
  tone(880, t + 0.05, 0.16, 0.045, "sine", ac);
}

/** A quick upward blip for a sent message. */
export function playSend() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  tone(520, t, 0.08, 0.04, "sine", ac);
  tone(660, t + 0.045, 0.09, 0.035, "sine", ac);
}

/** A light tap for pressing a choice button. */
export function playTap() {
  const ac = getCtx();
  if (!ac) return;
  tone(300, ac.currentTime, 0.05, 0.03, "square", ac);
}

/** A brief detuned flicker for the phantom-swap moment (section 9's core mechanic). */
export function playGlitch() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  tone(180, t, 0.09, 0.05, "sawtooth", ac);
  tone(140, t + 0.05, 0.09, 0.045, "sawtooth", ac);
  tone(1200, t + 0.02, 0.03, 0.02, "square", ac);
}

/** A low, uneasy tone for a bad-ending / ghi_chu.txt reveal. */
export function playDread() {
  const ac = getCtx();
  if (!ac) return;
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
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + 1.7);
}

/** THE END sting: a slow dissonant descent. */
export function playTheEnd() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  tone(196, t, 2.2, 0.06, "sine", ac);
  tone(185, t + 0.3, 2.0, 0.05, "sine", ac);
}
