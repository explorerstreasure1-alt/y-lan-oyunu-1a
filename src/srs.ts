import { LEARNING_PATH, LEGACY_BASE_WORDS, LEGACY_PADDING_START, type VocabularyWord } from "./vocabulary";

export type LearningLanguage = "en" | "ru" | "it";

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
  isBonus?: boolean; // altın mama: yenince cümle mini-oyunu açılır
};

const MASTERY_STORAGE_KEY = "snake_abc_mastery_v5_story_3000";
const MASTERY_STORAGE_KEY_RU = "snake_abc_mastery_v5_story_3000_ru";
const MASTERY_STORAGE_KEY_IT = "snake_abc_mastery_v5_story_3000_it";

function storageKeyFor(lang: LearningLanguage): string {
  if (lang === "ru") return MASTERY_STORAGE_KEY_RU;
  if (lang === "it") return MASTERY_STORAGE_KEY_IT;
  return MASTERY_STORAGE_KEY;
}

export function getSavedMasteryMap(lang: LearningLanguage = "en"): Record<number, WordMastery> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKeyFor(lang));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<number, WordMastery>;
    if (lang === "en") {
      const migrated = migrateLegacyEnMastery(parsed);
      if (migrated !== parsed) {
        saveMasteryMap(migrated, lang);
        return migrated;
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

/**
 * ESKİ EN havuzu migrasyonu: eski kod 3000'e ulaşmak için taban kelimeleri kopyalıyordu
 * (id >= LEGACY_PADDING_START → kelime = LEGACY_BASE_WORDS[id % LEGACY_BASE_WORDS.length]).
 * Artık havuz gerçek benzersiz kelimelerle dolu; eski kopya id'leri kanonik id'ye taşınır.
 * İlerleme kaybolmaz, yalnızca doğru kelimeye oturur. İdempotenttir.
 */
export function migrateLegacyEnMastery(
  map: Record<number, WordMastery>
): Record<number, WordMastery> {
  if (LEGACY_PADDING_START <= 0 || LEGACY_BASE_WORDS.length === 0) return map;

  // Yeni düzende kelime -> kanonik id
  const wordToNewId = new Map<string, number>();
  for (const w of LEARNING_PATH) {
    if (!wordToNewId.has(w.word)) wordToNewId.set(w.word, w.id);
  }

  let changed = false;
  const next: Record<number, WordMastery> = {};

  const merge = (target: WordMastery | undefined, incoming: WordMastery): WordMastery => {
    if (!target) return incoming;
    // Daha "zengin" kaydı koru: öğrenilmiş > yıldız > görülme
    if (target.isLearned !== incoming.isLearned) return target.isLearned ? target : incoming;
    if (target.masteryStars !== incoming.masteryStars) return target.masteryStars > incoming.masteryStars ? target : incoming;
    return target.timesSeen >= incoming.timesSeen ? target : incoming;
  };

  for (const [idStr, mastery] of Object.entries(map)) {
    const id = Number(idStr);
    if (Number.isNaN(id)) continue;

    if (id < LEGACY_PADDING_START) {
      next[id] = merge(next[id], mastery);
      continue;
    }

    // Eski padding kopyası: kanonik kelimesine eşle
    const legacyWord = LEGACY_BASE_WORDS[id % LEGACY_BASE_WORDS.length];
    const newId = wordToNewId.get(legacyWord);
    if (newId === undefined || newId === id) {
      next[id] = merge(next[id], mastery);
      continue;
    }
    changed = true;
    next[newId] = merge(next[newId], mastery);
  }

  return changed ? next : map;
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
 * Hata defteri: Boss'ta yanlış şık veya quiz'de yanlış cevap kelimeyi zayıflatır.
 * Yıldız düşer ve tekrar zamanı sıfırlanır → kelime daha sık tekrara girer.
 */
export function recordWordFailure(
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

  const updated: WordMastery = {
    ...existing,
    masteryStars: Math.max(0, existing.masteryStars - 1),
    lastSeenAt: Date.now(),
  };

  const nextMap = { ...masteryMap, [wordId]: updated };
  saveMasteryMap(nextMap, lang);
  return nextMap;
}

/**
 * ✨ Eğitim güç-up'ı: kelimeye +2 yıldız (hızlı pekiştirme, 5★ 'Öğrendim' butonuyla gelir)
 */
export function recordWordBoost(
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

  if (existing.isLearned) {
    return { updatedMap: masteryMap, newStars: existing.masteryStars };
  }

  const updated: WordMastery = {
    ...existing,
    timesSeen: existing.timesSeen + 1,
    lastSeenAt: Date.now(),
    masteryStars: Math.min(4, existing.masteryStars + 2),
  };

  const nextMap = { ...masteryMap, [wordId]: updated };
  saveMasteryMap(nextMap, lang);
  return { updatedMap: nextMap, newStars: updated.masteryStars };
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Aralıklı tekrar: 1★=4 saat, 2★=1 gün, 3★=2 gün, 4★=3 gün (5★ öğrenilmiş → tekrar yok)
export function getReviewIntervalMs(stars: number): number {
  if (stars <= 1) return 4 * 60 * 60 * 1000;
  if (stars === 2) return DAY_MS;
  if (stars === 3) return 2 * DAY_MS;
  return 3 * DAY_MS;
}

/** Zamanı gelmiş planlı tekrar var mı? (isLearned kelimeler asla tekrar görünmez) */
export function isDueForReview(mastery: WordMastery, now: number = Date.now()): boolean {
  if (mastery.isLearned) return false;
  if (mastery.timesSeen <= 0) return false;
  return now - mastery.lastSeenAt >= getReviewIntervalMs(mastery.masteryStars);
}

/**
 * 3000 kelime havuzu + özel kelimeler ile akıllı mama seçici
 * - isLearned = true olan kelime ASLA havuza girmez
 * - Önce planlı aralıklı tekrar (due review), sonra tekrar destesi / yeni kelime
 * - repeatCount (1x/2x/3x): her kelime tur başına N kez çıkar; kopyalar havuz boyunca
 *   eşit aralıkla yayılır (aynı kelime üst üste ASLA gelmez, araya diğerleri girer)
 * - basePool: konu/seviye filtreli havuz (verilmezse tüm LEARNING_PATH)
 */
export function getNextFoodItem(
  newWordCursor: number,
  masteryMap: Record<number, WordMastery>,
  eatenTotalCount: number,
  _recentSessionUnlearnedIds: number[],
  extraPool: VocabularyWord[] = [],
  basePool: VocabularyWord[] = LEARNING_PATH,
  weakPool: VocabularyWord[] = [],
  repeatCount: number = 1
): { item: ActiveFoodItem; updatedCursor: number } {
  // Zayıf antrenman: zayıf kelimeler havuzun başına öncelikli eklenir (base'de tekrar etmezler)
  let fullPool: VocabularyWord[];
  if (weakPool.length > 0) {
    const weakIds = new Set(weakPool.map((w) => w.id));
    fullPool = [
      ...weakPool,
      ...extraPool.filter((w) => !weakIds.has(w.id)),
      ...basePool.filter((w) => !weakIds.has(w.id)),
    ];
  } else {
    fullPool = extraPool.length > 0 ? [...extraPool, ...basePool] : basePool;
  }
  const poolSize = fullPool.length;
  if (poolSize === 0) {
    return { item: { word: basePool[0], isReview: false }, updatedCursor: 0 };
  }

  // Tekrar destesi: 1x/2x/3x → destede her kelimenin N kopyası var.
  // Kopyalar poolSize hücre arayla dizili → dengeli dağılım, yığılma yok.
  const repeats = Math.max(1, Math.min(3, Math.floor(repeatCount) || 1));
  const deckSize = poolSize * repeats;

  const cycleIndex = eatenTotalCount % 8;

  // 1) Planlı aralıklı tekrar (SRS): zamanı gelen kelime önce çıkar, daha az öğrenilmiş olanlar daha sık
  if (cycleIndex < 5) {
    const dueWord = fullPool.find((w) => {
      const m = masteryMap[w.id];
      return Boolean(m && isDueForReview(m));
    });
    if (dueWord) {
      return {
        item: { word: dueWord, isReview: true },
        updatedCursor: newWordCursor,
      };
    }
  }

  // 2) Desteden sıradaki ÖĞRENİLMEMİŞ kelime (öğrenilenler atlanır)
  let currentPos = newWordCursor;
  let attempts = 0;

  while (attempts < deckSize * 2) {
    const candidateWord = fullPool[currentPos % poolSize];
    const mastery = masteryMap[candidateWord.id];
    if (!mastery?.isLearned) {
      return {
        item: { word: candidateWord, isReview: false },
        updatedCursor: (currentPos + 1) % deckSize,
      };
    }
    currentPos += 1;
    attempts += 1;
  }

  // All words learned - show a dummy (should show completion)
  const fallbackWord = fullPool[newWordCursor % poolSize];
  return {
    item: { word: fallbackWord, isReview: false },
    updatedCursor: (newWordCursor + 1) % deckSize,
  };
}

// --- Günlük aktivite kaydı (StatsModal "BUGÜN" özeti için) ---

const DAILY_LOG_KEY = "snake_abc_daily_log_v1";

export type DailyLog = {
  date: string;
  eaten: number; // ilk kez yenilen yeni kelimeler
  reviews: number; // tekrar mamaları
  learned: number; // "Öğrendim" tıklananlar
  failed: number; // boss/quiz'de zayıflatılanlar
};

const todayLocalKey = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const EMPTY_LOG: DailyLog = { date: "", eaten: 0, reviews: 0, learned: 0, failed: 0 };

export function getDailyLog(): DailyLog {
  if (typeof window === "undefined") return { ...EMPTY_LOG, date: todayLocalKey() };
  try {
    const raw = window.localStorage.getItem(DAILY_LOG_KEY);
    if (!raw) return { ...EMPTY_LOG, date: todayLocalKey() };
    const parsed = JSON.parse(raw) as Partial<DailyLog>;
    if (parsed.date !== todayLocalKey()) return { ...EMPTY_LOG, date: todayLocalKey() };
    return {
      date: todayLocalKey(),
      eaten: Number(parsed.eaten) || 0,
      reviews: Number(parsed.reviews) || 0,
      learned: Number(parsed.learned) || 0,
      failed: Number(parsed.failed) || 0,
    };
  } catch {
    return { ...EMPTY_LOG, date: todayLocalKey() };
  }
}

export function addDailyActivity(kind: "eaten" | "review" | "learned" | "failed"): DailyLog {
  const current = getDailyLog();
  const next: DailyLog = {
    ...current,
    date: todayLocalKey(),
    eaten: current.eaten + (kind === "eaten" ? 1 : 0),
    reviews: current.reviews + (kind === "review" ? 1 : 0),
    learned: current.learned + (kind === "learned" ? 1 : 0),
    failed: current.failed + (kind === "failed" ? 1 : 0),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(next));
    } catch {}
  }
  return next;
}

/** Zayıf kelime: hata defterine düşmüş veya tekrar tekrar pekişememiş (antrenman + özet listesi için) */
export function isWeakWord(mastery: WordMastery | undefined): boolean {
  if (!mastery || mastery.isLearned) return false;
  return mastery.masteryStars === 0 || (mastery.masteryStars <= 1 && mastery.timesSeen >= 2);
}
