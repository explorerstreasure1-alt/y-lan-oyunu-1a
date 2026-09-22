import type { VocabularyWord, WordLevel } from "./vocabulary";

/**
 * Havuz büyütücü — her dili 3000'den 7500 kelimeye çıkarır.
 *
 * Yöntem: havuzdaki GERÇEK kelimeleri birleştiren kurallı öbekler üretir
 * (sıfat+isim, sayı+isim). Örn: "red car" → "Kırmızı Araba".
 * - Hiçbir mevcut kelimenin id'si değişmez (ilk 3000 aynen korunur,
 *   eski öğrenme kayıtları bozulmaz) — yeni öbekler sona eklenir.
 * - Uydurma "word_2" tarzı dolgu YOK; her öbek gerçek iki kelimeden kurulur.
 * - Türkçe karşılık bileşimseldir: "sıfatTr + isimTr".
 * - Konu isimden miras alınır → konu bazlı 50'li seriler otomatik büyür.
 */

export const TARGET_WORDS = 7500;

type MakeFn = (
  word: string,
  tr: string,
  pos: string,
  level: WordLevel,
  topic: string,
  id: number,
) => VocabularyWord;

const LEVEL_RANK: Record<string, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 5,
};

function shortTr(tr: string): string {
  return tr.split(" /")[0].split(" (")[0].trim() || tr;
}

/** Öbek parçası olabilecek temiz tek kelime mi? (dolgu artıkları elenir) */
function isCleanSingle(w: string): boolean {
  const t = w.trim();
  if (!t) return false;
  if (t.includes(" ") || t.includes("_") || t.includes("-")) return false;
  if (t.includes("(") || t.includes("/") || t.includes("[")) return false;
  if (t.length > 24) return false;
  return true;
}

function maxLevel(a: WordLevel, b: WordLevel): WordLevel {
  return (LEVEL_RANK[a] ?? 0) >= (LEVEL_RANK[b] ?? 0) ? a : b;
}

export function expandPoolToTarget(
  base: VocabularyWord[],
  make: MakeFn,
  adjectiveFirst: boolean,
): VocabularyWord[] {
  if (base.length >= TARGET_WORDS) {
    return base.slice(0, TARGET_WORDS).map((w, i) => ({ ...w, id: i }));
  }
  const taken = new Set<string>();
  for (const w of base) taken.add(w.word.toLowerCase().trim());

  const out = [...base];
  const push = (
    word: string,
    tr: string,
    level: WordLevel,
    topic: string,
  ): boolean => {
    const key = word.toLowerCase().trim();
    if (taken.has(key)) return false;
    taken.add(key);
    out.push(make(word, tr, "phrase", level, topic, out.length));
    return true;
  };

  const nouns = base.filter((w) => w.pos === "noun" && isCleanSingle(w.word));
  const adjs = base.filter(
    (w) => w.pos === "adjective" && isCleanSingle(w.word),
  );
  const nums = base.filter(
    (w) => w.topic === "Sayılar" && isCleanSingle(w.word),
  );

  // 1) sıfat + isim (sıfat dışta → konular dengeli yayılır)
  for (const a of adjs) {
    if (out.length >= TARGET_WORDS) break;
    for (const n of nouns) {
      if (out.length >= TARGET_WORDS) break;
      const word = adjectiveFirst
        ? `${a.word} ${n.word}`
        : `${n.word} ${a.word}`;
      push(word, `${shortTr(a.meaningTr)} ${shortTr(n.meaningTr)}`, maxLevel(a.level, n.level), n.topic);
    }
  }

  // 2) sayı + isim (sayı her dilde ismin önündedir)
  for (const s of nums) {
    if (out.length >= TARGET_WORDS) break;
    for (const n of nouns) {
      if (out.length >= TARGET_WORDS) break;
      push(
        `${s.word} ${n.word}`,
        `${shortTr(s.meaningTr)} ${shortTr(n.meaningTr)}`,
        maxLevel(s.level, n.level),
        n.topic,
      );
    }
  }

  // 3) güvenlik ağı: isim + isim (neredeyse hiç gerekmez)
  for (const a of nouns) {
    if (out.length >= TARGET_WORDS) break;
    for (const n of nouns) {
      if (out.length >= TARGET_WORDS) break;
      if (a.id === n.id) continue;
      const word = adjectiveFirst
        ? `${a.word} ${n.word}`
        : `${n.word} ${a.word}`;
      push(word, `${shortTr(a.meaningTr)} ${shortTr(n.meaningTr)}`, maxLevel(a.level, n.level), n.topic);
    }
  }

  return out.slice(0, TARGET_WORDS).map((w, i) => ({ ...w, id: i }));
}
