import { useState } from "react";
import { LEARNING_PATH, type WordLevel } from "./vocabulary";
import { toggleWordLearnedState, type WordMastery } from "./srs";
import { speakWordDetails, type SpeechMode } from "./audio";

type WordLibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  masteryMap: Record<number, WordMastery>;
  onMasteryChange: (newMap: Record<number, WordMastery>) => void;
  speechMode: SpeechMode;
};

type FilterStatus = "ALL" | "TO_LEARN" | "LEARNED";

export function WordLibraryModal({
  isOpen,
  onClose,
  masteryMap,
  onMasteryChange,
  speechMode,
}: WordLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<WordLevel | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

  if (!isOpen) return null;

  const handleToggleLearned = (wordId: number) => {
    const nextMap = toggleWordLearnedState(wordId, masteryMap);
    onMasteryChange(nextMap);
  };

  const filteredWords = LEARNING_PATH.filter((word) => {
    const mastery = masteryMap[word.id];
    const isLearned = Boolean(mastery?.isLearned);

    if (filterStatus === "LEARNED" && !isLearned) return false;
    if (filterStatus === "TO_LEARN" && isLearned) return false;

    if (selectedLevel !== "ALL" && word.level !== selectedLevel) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchWord = word.word.toLowerCase().includes(q);
      const matchTr = word.meaningTr.toLowerCase().includes(q);
      const matchTopic = word.topic.toLowerCase().includes(q);
      if (!matchWord && !matchTr && !matchTopic) return false;
    }

    return true;
  });

  const learnedCount = Object.values(masteryMap).filter((m) => m.isLearned).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border-2 border-[#ffecad] bg-[#231542] text-[#fff7e8] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">KELİME KÜTÜPHANESİ & HAVUZ</h2>
            <p className="mt-1 text-xs text-white/70">
              3,500 Kelimeden <strong className="text-[#99f5c3]">{learnedCount}</strong> Tanesini "Öğrendim" Olarak İşaretlediniz
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
          >
            Kapat (ESC)
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#1b1035] px-5 py-3">
          <input
            type="text"
            placeholder="İngilizce kelime, Türkçe anlam veya konu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/40 focus:border-[#99f5c3] focus:outline-none"
          />

          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`rounded-md px-2.5 py-1 ${filterStatus === "ALL" ? "bg-[#ffd96d] text-[#21123a]" : "text-white/70"}`}
            >
              Hepsini Göster
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("TO_LEARN")}
              className={`rounded-md px-2.5 py-1 ${filterStatus === "TO_LEARN" ? "bg-[#ffd96d] text-[#21123a]" : "text-white/70"}`}
            >
              Öğrenilecekler
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("LEARNED")}
              className={`rounded-md px-2.5 py-1 ${filterStatus === "LEARNED" ? "bg-[#75d9a6] text-[#123321]" : "text-white/70"}`}
            >
              Öğrendiklerim ✔️
            </button>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
            {(["ALL", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-md px-2 py-1 transition-colors ${
                  selectedLevel === lvl
                    ? "bg-[#ffe073] text-[#24123f]"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Word Grid */}
        <div className="grid flex-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWords.slice(0, 120).map((word) => {
            const mastery = masteryMap[word.id];
            const isLearned = Boolean(mastery?.isLearned);

            return (
              <div
                key={word.id}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  isLearned
                    ? "border-[#75d9a6]/60 bg-[#1e382b]/80 shadow-md"
                    : "border-white/10 bg-[#2b1950] hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-lg font-bold text-white">{word.word}</span>
                        <span className="text-[11px] italic text-white/50">{word.phonetic}</span>
                      </div>
                      <p className="mt-1 text-sm font-extrabold text-[#ffd96d]">
                        🇹🇷 {word.meaningTr}
                      </p>
                    </div>

                    <span className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-pixel text-[10px] text-white">
                      {word.level}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-4 text-white/75">
                    {word.definition}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleLearned(word.id)}
                    className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      isLearned
                        ? "bg-[#ff9ebb] text-[#330012] border border-[#ff9ebb]"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {isLearned ? "Unuttum 🔁 Geri Getir" : "Öğrendim ✔️ Asla Gösterme"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      speakWordDetails(word.word, word.meaningTr, word.definition, word.example, speechMode)
                    }
                    className="flex items-center gap-1 rounded bg-[#99f5c3] px-2 py-1 text-[11px] font-bold text-[#1a0e33] hover:bg-[#b2f8d3]"
                  >
                    <span>🔊 Dinle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
