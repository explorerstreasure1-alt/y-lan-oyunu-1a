export type SpeechMode = "word-tr" | "word" | "word-def" | "word-def-ex";

let audioCtx: AudioContext | null = null;
let bgmTimer: number | null = null;
let bgmPlaying = false;
let bgmMasterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// --- SFX (kept low volume, non-intrusive) ---
export function playTurnSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(330, now + 0.04);
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

export function playEatSfx(isReview = false, comboCount = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = isReview ? "triangle" : "square";
  const baseFreq = isReview ? 520 : 320;
  const pitchMultiplier = 1 + Math.min(0.8, (comboCount - 1) * 0.1);
  osc.frequency.setValueAtTime(baseFreq * pitchMultiplier, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 2 * pitchMultiplier, now + 0.1);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.12);
}

export function playComboSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);
    gain.gain.setValueAtTime(0.06, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.1);
  });
}

export function playLevelUpSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const melody = [440, 554.37, 659.25, 880, 1108.73];
  melody.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.06, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.15);
  });
}

export function playWrongSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

export function playGameOverSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(350, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.38);
  gain.gain.setValueAtTime(0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

/**
 * Eğlenceli Lofi Hip-Hop - daha canlı, eğlenceli, konsantrasyon arttıran
 * Rhodes tarzı akorlar + boom bap beat + vinyl çıtırtı + eğlenceli arpej
 */
const LOFI_CHORDS: number[][] = [
  [174.61, 220.0, 261.63, 329.63], // Fmaj7 - mutlu
  [196.0, 246.94, 293.66, 329.63], // G - Em7 varyant neşeli
  [146.83, 174.61, 220.0, 261.63], // Dm7 - biraz hüzünlü lofi
  [130.81, 164.81, 196.0, 261.63], // Cmaj7 - çözülme, mutlu son
];
const LOFI_BASS: number[] = [87.31, 98.0, 73.42, 65.41];

let lofiFilter: BiquadFilterNode | null = null;
let vinylNode: AudioBufferSourceNode | null = null;
let vinylGain: GainNode | null = null;

function playKick(ctx: AudioContext, at: number, dest: AudioNode) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, at);
  osc.frequency.exponentialRampToValueAtTime(42, at + 0.12);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(0.55, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.32);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(at);
  osc.stop(at + 0.35);
}

function playSnare(ctx: AudioContext, at: number, dest: AudioNode) {
  // body
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(0.22, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
  osc.connect(g);
  g.connect(dest);
  osc.start(at);
  osc.stop(at + 0.25);
  // snap
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(320, at);
  g2.gain.setValueAtTime(0.0001, at);
  g2.gain.linearRampToValueAtTime(0.12, at + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
  osc2.connect(g2);
  g2.connect(dest);
  osc2.start(at);
  osc2.stop(at + 0.15);
}

function playHiHat(ctx: AudioContext, at: number, dest: AudioNode, open = false) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 6500;
  osc.type = "square";
  osc.frequency.setValueAtTime(9000, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(open ? 0.09 : 0.05, at + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, at + (open ? 0.28 : 0.08));
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(at);
  osc.stop(at + (open ? 0.3 : 0.1));
}

export function toggleRetroBgm(enable: boolean) {
  if (!enable) {
    if (bgmTimer) {
      window.clearInterval(bgmTimer);
      bgmTimer = null;
    }
    if (vinylNode) {
      try { vinylNode.stop(); } catch {}
      vinylNode = null;
    }
    bgmPlaying = false;
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;
  if (bgmPlaying) return;
  bgmPlaying = true;

  if (!bgmMasterGain) {
    bgmMasterGain = ctx.createGain();
    bgmMasterGain.gain.value = 0.58; // eğlenceli lofi için dolgun ses
    lofiFilter = ctx.createBiquadFilter();
    lofiFilter.type = "lowpass";
    lofiFilter.frequency.value = 1450; // daha parlak, eğlenceli
    lofiFilter.Q.value = 0.4;
    bgmMasterGain.connect(lofiFilter);
    lofiFilter.connect(ctx.destination);
  } else {
    bgmMasterGain.gain.setValueAtTime(0.58, ctx.currentTime);
  }

  // Vinyl crackle - lofi dokusu
  try {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    vinylNode = ctx.createBufferSource();
    vinylNode.buffer = buffer;
    vinylNode.loop = true;
    vinylGain = ctx.createGain();
    vinylGain.gain.value = 0.018; // çok kısık çıtırtı
    const vFilter = ctx.createBiquadFilter();
    vFilter.type = "bandpass";
    vFilter.frequency.value = 1800;
    vFilter.Q.value = 0.2;
    vinylNode.connect(vFilter);
    vFilter.connect(vinylGain);
    vinylGain.connect(bgmMasterGain);
    vinylNode.start();
  } catch {}

  let chordIndex = 0;
  let beatLoop = 0;

  const playLofiBar = () => {
    if (!bgmPlaying || !bgmMasterGain || !ctx) return;
    const now = ctx.currentTime + 0.05;
    const chord = LOFI_CHORDS[chordIndex % LOFI_CHORDS.length];
    const bassFreq = LOFI_BASS[chordIndex % LOFI_BASS.length];
    chordIndex++;

    // Eğlenceli arpej - Rhodes tarzı, notalar tek tek sevimli şekilde
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      osc.detune.value = (Math.random() - 0.5) * 8;
      gain.gain.setValueAtTime(0.0001, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.14, now + i * 0.09 + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.003, now + i * 0.09 + 2.6);
      osc.connect(gain);
      gain.connect(bgmMasterGain!);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 2.8);
    });

    // Bouncy bass - biraz daha eğlenceli, hafif slide
    const bOsc = ctx.createOscillator();
    const bGain = ctx.createGain();
    bOsc.type = "sine";
    bOsc.frequency.setValueAtTime(bassFreq, now);
    bOsc.frequency.linearRampToValueAtTime(bassFreq * 1.02, now + 0.12);
    bOsc.frequency.linearRampToValueAtTime(bassFreq, now + 0.28);
    bGain.gain.setValueAtTime(0.0001, now);
    bGain.gain.linearRampToValueAtTime(0.28, now + 0.12);
    bGain.gain.exponentialRampToValueAtTime(0.005, now + 1.8);
    bOsc.connect(bGain);
    bGain.connect(bgmMasterGain!);
    bOsc.start(now);
    bOsc.stop(now + 2.0);

    // 🎵 Daha eğlenceli boom bap beat - her bar'da 8 vuruş
    const beatDur = 0.52; // ~115 BPM, daha canlı
    for (let b = 0; b < 8; b++) {
      const t = now + b * (beatDur / 2);
      // Kick pattern: 1, 3, 4.5 - eğlenceli
      if (b === 0 || b === 4 || b === 5) playKick(ctx, t, bgmMasterGain!);
      // Snare: 2 ve 6
      if (b === 2 || b === 6) playSnare(ctx, t, bgmMasterGain!);
      // Hi-hat: her 8'likte, açık/kapalı varyasyonla eğlenceli
      if (b % 2 === 1) playHiHat(ctx, t, bgmMasterGain!, b === 7);
      else playHiHat(ctx, t, bgmMasterGain!, false);
    }
    beatLoop++;
  };

  playLofiBar();
  bgmTimer = window.setInterval(playLofiBar, 2080); // 4 beat bar
}

function duckBgm(duckDurationMs: number) {
  const ctx = getAudioContext();
  if (!ctx || !bgmMasterGain || !bgmPlaying) return;
  const now = ctx.currentTime;
  bgmMasterGain.gain.cancelScheduledValues(now);
  bgmMasterGain.gain.setValueAtTime(bgmMasterGain.gain.value, now);
  bgmMasterGain.gain.linearRampToValueAtTime(0.20, now + 0.06);
  bgmMasterGain.gain.linearRampToValueAtTime(0.58, now + duckDurationMs / 1000 + 0.25);
}

/* ------------------------------------------------------------------ */
/* BEAUTIFUL & CLEAR EN + TR speech engine                            */
/* ------------------------------------------------------------------ */

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
  // Chrome needs a kick
  setTimeout(loadVoices, 500);
}

function scoreVoice(v: SpeechSynthesisVoice, targetLang: "en" | "tr"): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let s = 0;

  if (targetLang === "en") {
    if (lang === "en-us") s += 100;
    else if (lang.startsWith("en-")) s += 80;
    if (name.includes("google") && lang.includes("en")) s += 50;
    if (name.includes("natural") || name.includes("premium") || name.includes("enhanced")) s += 40;
    if (name.includes("neural")) s += 35;
    if (name.includes("microsoft") && lang.includes("en")) s += 30;
    if (name.includes("zira") || name.includes("aria") || name.includes("jenny") || name.includes("samantha")) s += 25;
    // penalize low quality
    if (name.includes("espeak") || name.includes("festival")) s -= 30;
  } else {
    if (lang === "tr-tr") s += 100;
    else if (lang.startsWith("tr")) s += 80;
    if (name.includes("google") && lang.includes("tr")) s += 60;
    if (name.includes("yelda") || name.includes("aylin")) s += 40;
    if (name.includes("microsoft") && lang.includes("tr")) s += 30;
    if (name.includes("natural") || name.includes("neural")) s += 35;
    if (name.includes("espeak")) s -= 20;
  }
  // Prefer default voice slightly
  if (v.default) s += 5;
  return s;
}

function pickBestVoice(langPrefix: "en" | "tr"): SpeechSynthesisVoice | null {
  if (cachedVoices.length === 0) loadVoices();
  if (cachedVoices.length === 0) return null;
  const candidates = cachedVoices
    .map((v) => ({ v, score: scoreVoice(v, langPrefix) }))
    .filter(({ v }) => langPrefix === "en" ? v.lang.toLowerCase().startsWith("en") : v.lang.toLowerCase().startsWith("tr"))
    .sort((a, b) => b.score - a.score);
  if (candidates.length === 0) return null;
  return candidates[0].v;
}

// --- Text cleaners for beautiful clear speech ---

function cleanEnglishWordForSpeech(raw: string): string {
  // "go-went-gone" -> "go, went, gone"  |  "piece of cake" keep
  let t = raw.trim();
  // Replace hyphens between letters with comma + space for irregular verbs
  if (t.includes("-") && !t.includes(" ")) {
    // likely irregular verb chain like buy-bought-bought
    t = t.replace(/-/g, ", ");
  } else {
    t = t.replace(/-/g, " ");
  }
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function extractCoreTurkishForSpeech(raw: string): string {
  // Take the most natural short meaning, strip technical notes
  let t = raw.trim();
  // Remove flags/emojis
  t = t.replace(/🇹🇷|🇬🇧|🇺🇸/g, "");
  // Take only first alternative before "/"
  t = t.split("/")[0] ?? t;
  // Strip content inside parentheses (), [], {}
  t = t.split("(")[0] ?? t;
  t = t.split("[")[0] ?? t;
  t = t.split("{")[0] ?? t;
  // Remove " - çoğul", " - xyz", " (çoğul / 3. tekil)" already stripped by "(" but also handle " - "
  t = t.split(" - ")[0] ?? t;
  // Clean extra punctuation
  t = t.replace(/[:;_]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  // Limit length for clarity (keep first 3 words max for very long)
  // But keep it natural: if still very long, keep first 4 words
  const words = t.split(" ");
  if (words.length > 6) {
    t = words.slice(0, 4).join(" ");
  }
  return t;
}

function speakUtterance(
  text: string,
  lang: "en-US" | "tr-TR",
  rate: number,
  pitch: number,
  volume: number = 1,
  onEnd?: () => void,
  onError?: () => void
) {
  if (!text) {
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const best = pickBestVoice(lang.startsWith("en") ? "en" : "tr");
  if (best) utterance.voice = best;
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError as any;
  window.speechSynthesis.speak(utterance);
}

/**
 * Main: Beautiful, crystal-clear EN -> (pause) -> TR sequence
 * - English spoken slowly, clearly
 * - Short natural pause
 * - Turkish core meaning spoken warmly
 * No overlap, no emoji, no technical notes.
 */
export function speakWordDetails(
  word: string,
  meaningTr: string,
  definition: string,
  example: string,
  mode: SpeechMode = "word-tr"
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const enClean = cleanEnglishWordForSpeech(word);
  const trCore = extractCoreTurkishForSpeech(meaningTr);

  let englishText = enClean;
  if (mode === "word-def") englishText = `${enClean}. ${definition}`;
  if (mode === "word-def-ex") englishText = `${enClean}. ${definition}. For example: ${example}`;

  const estimatedMs = (englishText.length + (mode === "word-tr" ? trCore.length : 0)) * 70 + 600;
  duckBgm(estimatedMs);

  if (mode === "word-tr") {
    // Yenildiği AN söylensin - en hızlı şekilde, İngilizce hemen, ardından Türkçe
    speakUtterance(enClean, "en-US", 0.86, 1.02, 1, () => {
      window.setTimeout(() => {
        speakUtterance(trCore, "tr-TR", 0.94, 1.0, 1);
      }, 70);
    });
  } else if (mode === "word") {
    speakUtterance(enClean, "en-US", 0.86, 1.03);
  } else {
    speakUtterance(englishText, "en-US", 0.88, 1.02);
  }
}

export function speakEnglishOnly(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const enClean = cleanEnglishWordForSpeech(word);
  duckBgm(enClean.length * 90 + 600);
  speakUtterance(enClean, "en-US", 0.78, 1.03);
}

export function speakTurkishOnly(meaningTr: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const trCore = extractCoreTurkishForSpeech(meaningTr);
  duckBgm(trCore.length * 90 + 600);
  speakUtterance(trCore, "tr-TR", 0.88, 1.0);
}
