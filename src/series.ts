import { FRENCH_PATH, GERMAN_PATH, ITALIAN_PATH, LEARNING_PATH, PORTUGUESE_PATH, SPANISH_PATH, type VocabularyWord, type WordLevel } from "./vocabulary";
import { RUSSIAN_PATH } from "./vocabularyRu";
import type { LearningLanguage } from "./srs";

export const SERIES_SIZE = 50;
export const LEVEL_ORDER: WordLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type Series = {
  id: string; // e.g. "en::Fiiller::1"
  lang: string;
  topic: string; // konu bazlı seri (örn. "Fiiller")
  level: WordLevel; // öbekteki baskın seviye (rozet için)
  seriesIndex: number; // 1-based per topic
  globalIndex: number; // 1-based across all topics
  words: VocabularyWord[];
  rangeLabel: string; // "1-50"
  label: string; // "Fiiller • Seri 1"
};

const STORAGE_KEY = "snake_abc_series_completed_v1";

export const LANG_META: Record<string, { flag: string; nameTr: string; nameEn: string }> = {
  en: { flag: "🇬🇧", nameTr: "İngilizce", nameEn: "English" },
  ru: { flag: "🇷🇺", nameTr: "Rusça", nameEn: "Russian" },
  it: { flag: "🇮🇹", nameTr: "İtalyanca", nameEn: "Italian" },
  es: { flag: "🇪🇸", nameTr: "İspanyolca", nameEn: "Spanish" },
  pt: { flag: "🇵🇹", nameTr: "Portekizce", nameEn: "Portuguese" },
  fr: { flag: "🇫🇷", nameTr: "Fransızca", nameEn: "French" },
  de: { flag: "🇩🇪", nameTr: "Almanca", nameEn: "German" },
};

export function getLangMeta(lang: string) {
  return LANG_META[lang] ?? { flag: "🏳️", nameTr: lang, nameEn: lang };
}

export function poolForLang(lang: string): VocabularyWord[] {
  if (lang === "ru") return RUSSIAN_PATH;
  if (lang === "it") return ITALIAN_PATH;
  if (lang === "es") return SPANISH_PATH;
  if (lang === "pt") return PORTUGUESE_PATH;
  if (lang === "fr") return FRENCH_PATH;
  if (lang === "de") return GERMAN_PATH;
  return LEARNING_PATH;
}

/** Bir öbeğin baskın seviyesi (rozet/görünüm için) */
function dominantLevel(words: VocabularyWord[]): WordLevel {
  const counts = new Map<WordLevel, number>();
  for (const w of words) counts.set(w.level, (counts.get(w.level) ?? 0) + 1);
  let best: WordLevel = words[0]?.level ?? "A1";
  let bestCount = -1;
  for (const lvl of LEVEL_ORDER) {
    const c = counts.get(lvl) ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = lvl;
    }
  }
  return best;
}

/** Konular: havuzdaki ilk görünüm sırasıyla */
export function getTopicsForLanguage(lang: string): string[] {
  const pool = poolForLang(lang);
  const seen: string[] = [];
  const set = new Set<string>();
  for (const w of pool) {
    if (!set.has(w.topic)) {
      set.add(w.topic);
      seen.push(w.topic);
    }
  }
  return seen;
}

export function getSeriesForLanguage(lang: string): Series[] {
  const pool = poolForLang(lang);
  const result: Series[] = [];
  let globalIdx = 0;
  for (const topic of getTopicsForLanguage(lang)) {
    const topicWords = pool.filter((w) => w.topic === topic);
    if (topicWords.length === 0) continue;
    const chunkCount = Math.ceil(topicWords.length / SERIES_SIZE);
    for (let i = 0; i < chunkCount; i++) {
      globalIdx += 1;
      const slice = topicWords.slice(i * SERIES_SIZE, (i + 1) * SERIES_SIZE);
      const start = i * SERIES_SIZE + 1;
      const end = start + slice.length - 1;
      result.push({
        id: `${lang}::${topic}::${i + 1}`,
        lang,
        topic,
        level: dominantLevel(slice),
        seriesIndex: i + 1,
        globalIndex: globalIdx,
        words: slice,
        rangeLabel: `${start}-${end}`,
        label: `${topic} • Seri ${i + 1}`,
      });
    }
  }
  return result;
}

/** Tek konunun 50'lik serileri (konuya tıklayınca açılan liste) */
export function getSeriesForTopic(lang: string, topic: string): Series[] {
  return getSeriesForLanguage(lang).filter((s) => s.topic === topic);
}

export function getAllSeriesFlat(): Record<LearningLanguage, Series[]> {
  return {
    en: getSeriesForLanguage("en"),
    ru: getSeriesForLanguage("ru"),
    it: getSeriesForLanguage("it"),
    es: getSeriesForLanguage("es"),
    pt: getSeriesForLanguage("pt"),
    fr: getSeriesForLanguage("fr"),
    de: getSeriesForLanguage("de"),
  } as Record<LearningLanguage, Series[]>;
}

// --- completed tracking ---

function loadCompletedRaw(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveCompletedRaw(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export function getCompletedSeries(): Set<string> {
  return loadCompletedRaw();
}

export function isSeriesCompleted(id: string, completed?: Set<string>): boolean {
  const set = completed ?? loadCompletedRaw();
  return set.has(id);
}

export function markSeriesCompleted(id: string): Set<string> {
  const set = loadCompletedRaw();
  set.add(id);
  saveCompletedRaw(set);
  return set;
}

export function unmarkSeriesCompleted(id: string): Set<string> {
  const set = loadCompletedRaw();
  set.delete(id);
  saveCompletedRaw(set);
  return set;
}

export function toggleSeriesCompleted(id: string): Set<string> {
  const set = loadCompletedRaw();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  saveCompletedRaw(set);
  return set;
}

export function getSelectedSeriesId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("snake_abc_selected_series_v1");
  } catch {
    return null;
  }
}

export function saveSelectedSeriesId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem("snake_abc_selected_series_v1", id);
    else window.localStorage.removeItem("snake_abc_selected_series_v1");
  } catch {}
}
