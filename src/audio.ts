export type SpeechMode = "word-tr" | "word" | "word-def" | "word-def-ex";

let audioCtx: AudioContext | null = null;

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

function scoreVoice(v: SpeechSynthesisVoice, targetLang: "en" | "tr" | "ru"): number {
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
  } else if (targetLang === "tr") {
    if (lang === "tr-tr") s += 100;
    else if (lang.startsWith("tr")) s += 80;
    if (name.includes("google") && lang.includes("tr")) s += 60;
    if (name.includes("yelda") || name.includes("aylin")) s += 40;
    if (name.includes("microsoft") && lang.includes("tr")) s += 30;
    if (name.includes("natural") || name.includes("neural")) s += 35;
    if (name.includes("espeak")) s -= 20;
  } else {
    // Russian
    if (lang === "ru-ru") s += 100;
    else if (lang.startsWith("ru")) s += 80;
    if (name.includes("google") && lang.includes("ru")) s += 60;
    if (name.includes("microsoft") && lang.includes("ru")) s += 30;
    if (name.includes("natural") || name.includes("neural")) s += 35;
    if (name.includes("milena") || name.includes("svetlana") || name.includes("pavel")) s += 25;
    if (name.includes("espeak")) s -= 20;
  }
  // Prefer default voice slightly
  if (v.default) s += 5;
  return s;
}

function pickBestVoice(langPrefix: "en" | "tr" | "ru"): SpeechSynthesisVoice | null {
  if (cachedVoices.length === 0) loadVoices();
  if (cachedVoices.length === 0) return null;
  const candidates = cachedVoices
    .map((v) => ({ v, score: scoreVoice(v, langPrefix) }))
    .filter(({ v }) => v.lang.toLowerCase().startsWith(langPrefix))
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
  lang: "en-US" | "tr-TR" | "ru-RU",
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
  const prefix = lang.startsWith("en") ? "en" : lang.startsWith("ru") ? "ru" : "tr";
  const best = pickBestVoice(prefix);
  if (best) utterance.voice = best;
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError as any;
  // Chrome bazen kuyruğa takılır (sessiz bekleme, 1-3 sn gecikme) - resume ile tetikle
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.resume();
    } catch {}
  }
  window.speechSynthesis.speak(utterance);
}

/** Aktif öğrenme dili - App.tsx dil değişince çağırır */
let currentSpeechLang: "en" | "ru" = "en";

export function setSpeechLanguage(lang: "en" | "ru") {
  currentSpeechLang = lang;
}

function cleanRussianWordForSpeech(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Main: Beautiful, crystal-clear EN/RU -> (mini-pause) -> TR sequence
 * - Söylendiği AN yüksek hızda (rate ~1.1) okunur, bekleme yok
 * - Türkçe anlam hemen ardından gelir
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

  const isRussian = currentSpeechLang === "ru";
  const wordClean = isRussian ? cleanRussianWordForSpeech(word) : cleanEnglishWordForSpeech(word);
  const trCore = extractCoreTurkishForSpeech(meaningTr);

  let targetText = wordClean;
  if (mode === "word-def") targetText = `${wordClean}. ${definition}`;
  if (mode === "word-def-ex") targetText = `${wordClean}. ${definition}. ${isRussian ? "Например:" : "For example:"} ${example}`;

  if (mode === "word-tr") {
    // HIZLI: yabancı kelime ~1.4x, Türkçe anlam beklemesiz hemen ardından ~1.45x
    speakUtterance(wordClean, isRussian ? "ru-RU" : "en-US", 1.4, 1.02, 1, () => {
      speakUtterance(trCore, "tr-TR", 1.45, 1.0);
    });
  } else if (mode === "word") {
    speakUtterance(wordClean, isRussian ? "ru-RU" : "en-US", 1.4, 1.03);
  } else {
    speakUtterance(targetText, isRussian ? "ru-RU" : "en-US", 1.3, 1.02);
  }
}

export function speakEnglishOnly(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const isRussian = currentSpeechLang === "ru";
  const wordClean = isRussian ? cleanRussianWordForSpeech(word) : cleanEnglishWordForSpeech(word);
  speakUtterance(wordClean, isRussian ? "ru-RU" : "en-US", 1.4, 1.03);
}

export function speakTurkishOnly(meaningTr: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const trCore = extractCoreTurkishForSpeech(meaningTr);
  speakUtterance(trCore, "tr-TR", 1.45, 1.0);
}
