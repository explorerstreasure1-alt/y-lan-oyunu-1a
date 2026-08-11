import { type VocabularyWord } from "../vocabulary";
import { type WordMastery } from "../srs";
import { speakWordDetails, type SpeechMode } from "../audio";

type StatsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sessionScore: number;
  maxCombo: number;
  sessionWords: VocabularyWord[];
  masteryMap: Record<number, WordMastery>;
  onToggleLearned: (wordId: number) => void;
  speechMode: SpeechMode;
};

export function StatsModal({
  isOpen,
  onClose,
  sessionScore,
  maxCombo,
  sessionWords,
  masteryMap,
  onToggleLearned,
  speechMode,
}: StatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-[#ffd96d] bg-[#241644] text-[#fff7e8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">SON OYUN PERFORMANS RAPORU</h2>
            <p className="mt-1 text-xs text-white/70">
              Bu turda elde ettiğiniz harika kelime pratik özetiniz
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

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-[#1c0f38] px-6 py-4 border-b border-white/10 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">KAZANILAN SKOR</p>
            <p className="font-pixel text-2xl font-black text-[#99f5c3] mt-0.5">{sessionScore}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">EN YÜKSEK SERİ</p>
            <p className="font-pixel text-2xl font-black text-[#ffd96d] mt-0.5">x{maxCombo}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">YENEN KELİME</p>
            <p className="font-pixel text-2xl font-black text-[#a0c4ff] mt-0.5">{sessionWords.length}</p>
          </div>
        </div>

        {/* Eaten Words List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h3 className="font-pixel text-xs tracking-wider text-[#99f5c3] uppercase">
            BU ELDE PRATİK EDİLEN KELİMELER:
          </h3>

          {sessionWords.length === 0 ? (
            <p className="text-xs text-white/50 italic py-4">Bu turda henüz kelime maması yenmedi.</p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {sessionWords.map((word) => {
                const mastery = masteryMap[word.id];
                const isLearned = Boolean(mastery?.isLearned);

                return (
                  <div
                    key={word.id}
                    className={`flex flex-col justify-between rounded-xl border p-3 transition-all ${
                      isLearned
                        ? "border-[#75d9a6]/50 bg-[#1d382b]"
                        : "border-white/10 bg-[#2d1b50]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-base font-bold text-white">{word.word}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-pixel text-[9px] text-white">
                          {word.level}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-[#ffd96d]">🇹🇷 {word.meaningTr}</p>
                      <p className="mt-1 text-[10px] text-white/65 line-clamp-1">{word.definition}</p>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2">
                      <button
                        type="button"
                        onClick={() => onToggleLearned(word.id)}
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isLearned ? "bg-[#ff9ebb] text-[#330012]" : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {isLearned ? "Unuttum 🔁" : "Öğrendim ✔️"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          speakWordDetails(word.word, word.meaningTr, word.definition, word.example, speechMode)
                        }
                        className="rounded bg-[#99f5c3] px-2 py-0.5 text-[10px] font-bold text-[#17112e]"
                      >
                        🔊 Dinle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
