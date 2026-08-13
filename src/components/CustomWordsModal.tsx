import { useState } from "react";
import { type VocabularyWord } from "../vocabulary";

type CustomWordsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomWords: (newWords: VocabularyWord[]) => void;
  customWords: VocabularyWord[];
  onRemoveCustomWords: (wordId: number) => void;
};

export const PREMADE_EXAM_PACKS = [
  {
    id: "yds",
    title: "YDS & YÖKDİL Sık Çıkan Kelimeler",
    desc: "Akademik sınavlarda en çok karşılaşılan 10 kritik kelime paketi.",
    words: [
      { word: "substantial", meaningTr: "Önemli / Kayda değer", pos: "adjective", level: "B2" as const, topic: "YDS Özel", definition: "Of considerable importance, size, or worth.", example: "There was a substantial increase in scores." },
      { word: "inevitable", meaningTr: "Kaçınılmaz / Kaçınılmaz olan", pos: "adjective", level: "B2" as const, topic: "YDS Özel", definition: "Certain to happen; unavoidable.", example: "Change is inevitable in education." },
      { word: "ambiguous", meaningTr: "Muğlak / İki anlamlı", pos: "adjective", level: "C1" as const, topic: "YDS Özel", definition: "Open to more than one interpretation.", example: "The question was ambiguous." },
      { word: "undermine", meaningTr: "Zayıflatmak / Baltalamak", pos: "verb", level: "C1" as const, topic: "YDS Özel", definition: "To weaken gradually or insidiously.", example: "Do not undermine your own effort." },
      { word: "plausible", meaningTr: "Makul / Mantıklı", pos: "adjective", level: "C1" as const, topic: "YDS Özel", definition: "Seeming reasonable or probable.", example: "He gave a plausible explanation." },
    ],
  },
  {
    id: "toefl",
    title: "TOEFL & IELTS Akıcı Kelimeler",
    desc: "Uluslararası sınavlarda yüksek puan getiren kelimeler.",
    words: [
      { word: "meticulous", meaningTr: "Titiz / Çok dikkatli", pos: "adjective", level: "C1" as const, topic: "TOEFL Özel", definition: "Showing great attention to detail.", example: "She is meticulous about spelling." },
      { word: "resilient", meaningTr: "Dayanıklı / Esnek", pos: "adjective", level: "B2" as const, topic: "TOEFL Özel", definition: "Able to withstand or recover quickly from difficult conditions.", example: "Resilient students learn from mistakes." },
      { word: "scrutinize", meaningTr: "Detaylıca incelemek", pos: "verb", level: "C1" as const, topic: "TOEFL Özel", definition: "To examine or inspect closely and thoroughly.", example: "Scientists scrutinize trial data." },
    ],
  },
  {
    id: "idioms",
    title: "Günlük İngilizce Kalıp & Deyimler",
    desc: "Konuşma dilinde hayat kurtaran popüler kalıplar.",
    words: [
      { word: "piece of cake", meaningTr: "Çocuk oyuncağı / Çok kolay", pos: "idiom", level: "A2" as const, topic: "Deyimler", definition: "Something that is very easy to do.", example: "This snake game is a piece of cake!" },
      { word: "break a leg", meaningTr: "İyi şanslar / Başarılar", pos: "idiom", level: "B1" as const, topic: "Deyimler", definition: "Good luck (used especially to actors before a performance).", example: "Break a leg on your English exam!" },
      { word: "under the weather", meaningTr: "Biraz halsiz / Hasta", pos: "idiom", level: "B1" as const, topic: "Deyimler", definition: "Slightly unwell or sick.", example: "I felt under the weather yesterday." },
      { word: "once in a blue moon", meaningTr: "Kırk yılda bir / Çok nadir", pos: "idiom", level: "B2" as const, topic: "Deyimler", definition: "Very rarely.", example: "He visits his hometown once in a blue moon." },
    ],
  },
];

export function CustomWordsModal({ isOpen, onClose, onAddCustomWords, customWords, onRemoveCustomWords }: CustomWordsModalProps) {
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [defInput, setDefInput] = useState("");
  const [exampleInput, setExampleInput] = useState("");

  if (!isOpen) return null;

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim() || !meaningInput.trim()) return;

    const newWord: VocabularyWord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      word: wordInput.trim(),
      meaningTr: meaningInput.trim(),
      phonetic: `/${wordInput.trim().toLowerCase()}/`,
      pos: "custom",
      topic: "Özel Listem",
      level: "B1",
      definition: defInput.trim() || "Özel eklenen kelime.",
      example: exampleInput.trim() || `Example: ${wordInput.trim()} is useful.`,
    };

    onAddCustomWords([newWord]);
    setWordInput("");
    setMeaningInput("");
    setDefInput("");
    setExampleInput("");
  };

  const handleAddPack = (pack: typeof PREMADE_EXAM_PACKS[0]) => {
    const formattedWords: VocabularyWord[] = pack.words.map((w, idx) => ({
      id: Date.now() + idx + Math.floor(Math.random() * 500),
      word: w.word,
      meaningTr: w.meaningTr,
      phonetic: `/${w.word.toLowerCase()}/`,
      pos: w.pos,
      topic: w.topic,
      level: w.level,
      definition: w.definition,
      example: w.example,
    }));

    onAddCustomWords(formattedWords);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-[#ffecad] bg-[#231542] text-[#fff7e8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">ÖZEL KELİME & SINAV PAKETLERİ</h2>
            <p className="mt-1 text-xs text-white/70">
              Kendi çalışmak istediğiniz kelimeleri ekleyin veya hazır sınav paketlerini yükleyin.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-white/20 transition-colors"
          >
            Kapat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Premade Packs */}
          <div>
            <h3 className="font-pixel text-xs tracking-wider text-[#99f5c3] uppercase mb-3">
              1. ÖZEL SINAV & DEYİM PAKETLERİ YÜKLE:
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {PREMADE_EXAM_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="flex flex-col justify-between rounded-xl border border-white/15 bg-white/5 p-3.5 hover:border-white/30 transition-all"
                >
                  <div>
                    <span className="font-pixel text-xs font-bold text-[#ffd96d]">{pack.title}</span>
                    <p className="mt-1 text-[11px] leading-4 text-white/70">{pack.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddPack(pack)}
                    className="mt-3 w-full rounded-lg bg-[#99f5c3] py-1.5 font-pixel text-[11px] font-black text-[#17112e] hover:bg-[#b2f8d3] transition-colors"
                  >
                    + Paketi Ekle ({pack.words.length} Kelime)
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Add Form */}
          <div>
            <h3 className="font-pixel text-xs tracking-wider text-[#ffd96d] uppercase mb-3">
              2. KENDİ İNGİLİZCE KELİMENİ EKLE:
            </h3>
            <form onSubmit={handleAddSingle} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">
                    İngilizce Kelime / Kalıp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: serendipity"
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#99f5c3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">
                    Türkçe Anlamı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: şans eseri güzel şey bulma"
                    value={meaningInput}
                    onChange={(e) => setMeaningInput(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#ffd96d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">
                    İngilizce Tanım (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="Finding good things by chance."
                    value={defInput}
                    onChange={(e) => setDefInput(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">
                    Örnek Cümle (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="It was pure serendipity."
                    value={exampleInput}
                    onChange={(e) => setExampleInput(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#ffd96d] py-2.5 font-pixel text-xs font-black text-[#21123a] shadow hover:bg-[#ffe073] transition-colors"
              >
                + Kelimeyi Oyuna Ekle
              </button>
            </form>
          </div>

          <div className="h-px bg-white/10" />

          {/* Current Custom Words */}
          <div>
            <h3 className="font-pixel text-xs tracking-wider text-[#99f5c3] uppercase mb-3">
              3. MEVCUT ÖZEL KELİMELERİN ({customWords.length})
            </h3>
            {customWords.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-xs text-white/50 italic">
                Henüz özel kelime eklemedin. Paket yükle veya aşağıdan kendi kelimeni ekle.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {customWords.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span className="font-pixel text-xs font-bold text-white">{w.word}</span>
                      <span className="ml-2 text-[11px] font-bold text-[#ffd96d] truncate">🇹🇷 {w.meaningTr}</span>
                      <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-pixel text-white/60">{w.topic}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomWords(w.id)}
                      className="flex-none rounded-lg border border-[#ff84ad]/40 bg-[#ff84ad]/10 px-2 py-1 text-[10px] font-bold text-[#ff84ad] hover:bg-[#ff84ad]/25 transition-colors"
                      title="Bu kelimeyi özel listenden çıkar"
                    >
                      🗑 Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-[10px] leading-4 text-white/50">
              💾 Özel kelimeler tarayıcında kalıcı olarak saklanır — sayfayı kapatsan da kaybolmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
