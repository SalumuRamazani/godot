let ctx;
let master;
let windGain;
let padOsc = [];
let started = false;

function note(freq, time, dur, type = "sine", gain = 0.05) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

export async function initAudio() {
  if (started) return;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  started = true;
  startAmbience();
}

function startAmbience() {
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  windGain = ctx.createGain();
  windGain.gain.value = 0.18;
  noise.connect(filter);
  filter.connect(windGain);
  windGain.connect(master);
  noise.start();

  const padNotes = [196, 246.94, 293.66];
  padOsc = padNotes.map((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.value = 0.035 - i * 0.006;
    osc.connect(g);
    g.connect(master);
    osc.start();
    return osc;
  });

  scheduleMelody();
}

function scheduleMelody() {
  const scale = [392, 440, 493.88, 587.33, 659.25, 783.99];
  const now = ctx.currentTime;
  for (let i = 0; i < 8; i += 1) {
    const freq = scale[(i * 3 + 1) % scale.length];
    note(freq, now + i * 1.6, 1.35, "triangle", 0.03);
  }
  setTimeout(scheduleMelody, 12800);
}

export function playCollect() {
  if (!ctx) return;
  const t = ctx.currentTime;
  note(659.25, t, 0.22, "sine", 0.07);
  note(783.99, t + 0.08, 0.28, "triangle", 0.05);
  note(987.77, t + 0.16, 0.4, "sine", 0.04);
}

export function playWin() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const chord = [392, 493.88, 587.33, 739.99];
  chord.forEach((freq, i) => {
    note(freq, t + i * 0.12, 1.8, "sine", 0.06);
  });
}

export function setWind(amount) {
  if (!windGain) return;
  const next = 0.14 + amount * 0.12;
  windGain.gain.setTargetAtTime(next, ctx.currentTime, 0.2);
}
