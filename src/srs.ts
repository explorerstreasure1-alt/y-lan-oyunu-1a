import { LEARNING_PATH, type VocabularyWord } from "./vocabulary";

export type LearningLanguage = "en" | "ru";

export type WordMastery = {
  wordId: number;
  timesSeen: number;
  lastSeenAt: number;
  masteryStars: number;
  isLearned: boolean; // true = asla gösterilmesin, ta ki "Unuttum" denene kadar
};

export type ActiveFoodItem = {
  word: VocabularyWord;
  isReview: boolean;
};

const MASTERY_STORAGE_KEY = "snake_abc_mastery_v5_story_3000";
const MASTERY_STORAGE_KEY_RU = "snake_abc_mastery_v5_story_3000_ru";

function storageKeyFor(lang: LearningLanguage): string {
  return lang === "ru" ? MASTERY_STORAGE_KEY_RU : MASTERY_STORAGE_KEY;
}

export function getSavedMasteryMap(lang: LearningLanguage = "en"): Record<number, WordMastery> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKeyFor(lang));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveMasteryMap(map: Record<number, WordMastery>, lang: LearningLanguage = "en") {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKeyFor(lang), JSON.stringify(map));
  } catch {}
}

export function toggleWordLearnedState(
  wordId: number,
  masteryMap: Record<number, WordMastery>,
  lang: LearningLanguage = "en"
): Record<number, WordMastery> {
  const existing = masteryMap[wordId] || {
    wordId,
    timesSeen: 0,
    lastSeenAt: Date.now(),
    masteryStars: 0,
    isLearned: false,
  };

  const nextIsLearned = !existing.isLearned;

  const updated: WordMastery = {
    ...existing,
    isLearned: nextIsLearned,
    masteryStars: nextIsLearned ? 5 : Math.max(0, existing.masteryStars - 1),
    lastSeenAt: Date.now(),
  };

  const nextMap = { ...masteryMap, [wordId]: updated };
  saveMasteryMap(nextMap, lang);
  return nextMap;
}

export function recordWordEaten(
  wordId: number,
  masteryMap: Record<number, WordMastery>,
  lang: LearningLanguage = "en"
): { updatedMap: Record<number, WordMastery>; newStars: number } {
  const existing = masteryMap[wordId] || {
    wordId,
    timesSeen: 0,
    lastSeenAt: Date.now(),
    masteryStars: 0,
    isLearned: false,
  };

  // If already learned, don't increase - it should never have been eaten, but safety
  if (existing.isLearned) {
    return { updatedMap: masteryMap, newStars: existing.masteryStars };
  }

  const nextTimesSeen = existing.timesSeen + 1;
  const nextStars = Math.min(4, existing.masteryStars + 1); // 5 only when "Öğrendim" clicked

  const updated: WordMastery = {
    ...existing,
    timesSeen: nextTimesSeen,
    lastSeenAt: Date.now(),
    masteryStars: nextStars,
  };

  const nextMap = { ...masteryMap, [wordId]: updated };
  saveMasteryMap(nextMap, lang);

  return { updatedMap: nextMap, newStars: nextStars };
}

/**
 * 3000 kelime havuzu + özel kelimeler ile akıllı mama seçici
 * - isLearned = true olan kelime ASLA havuza girmez
 * - Her 5 yeni kelimede 3 tekrar (sadece öğrenilmemiş son kelimelerden)
 * - basePool: konu/seviye filtreli havuz (verilmezse tüm LEARNING_PATH)
 */
export function getNextFoodItem(
  newWordCursor: number,
  masteryMap: Record<number, WordMastery>,
  eatenTotalCount: number,
  recentSessionUnlearnedIds: number[],
  extraPool: VocabularyWord[] = [],
  basePool: VocabularyWord[] = LEARNING_PATH
): { item: ActiveFoodItem; updatedCursor: number } {
  const fullPool = extraPool.length > 0 ? [...extraPool, ...basePool] : basePool;
  const poolSize = fullPool.length;

  const cycleIndex = eatenTotalCount % 8;
  const isReviewStep = cycleIndex >= 5 && recentSessionUnlearnedIds.length > 0;

  if (isReviewStep) {
    const candidateIds = recentSessionUnlearnedIds.filter((id) => !masteryMap[id]?.isLearned);
    if (candidateIds.length > 0) {
      const selectedId = candidateIds[eatenTotalCount % candidateIds.length];
      const found = fullPool.find((w) => w.id === selectedId) || basePool[selectedId % basePool.length];
      if (found && !masteryMap[found.id]?.isLearned) {
        return {
          item: { word: found, isReview: true },
          updatedCursor: newWordCursor,
        };
      }
    }
  }

  // Find next UNLEARNED word
  let currentCursor = newWordCursor;
  let attempts = 0;

  while (attempts < poolSize * 2) {
    const candidateWord = fullPool[currentCursor % poolSize];
    const mastery = masteryMap[candidateWord.id];
    if (!mastery?.isLearned) {
      return {
        item: { word: candidateWord, isReview: false },
        updatedCursor: (currentCursor + 1) % poolSize,
      };
    }
    currentCursor += 1;
    attempts += 1;
  }

  // All words learned - show a dummy (should show completion)
  const fallbackWord = fullPool[newWordCursor % poolSize];
  return {
    item: { word: fallbackWord, isReview: false },
    updatedCursor: (newWordCursor + 1) % poolSize,
  };
}
