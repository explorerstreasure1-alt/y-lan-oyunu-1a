import { LEARNING_PATH, type WordLevel } from "../vocabulary";

type TopicsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic: string | "ALL";
  selectedLevel: WordLevel | "ALL";
  onSelectTopic: (topic: string | "ALL") => void;
  onSelectLevel: (level: WordLevel | "ALL") => void;
};

export function TopicsModal({
  isOpen,
  onClose,
  selectedTopic,
  selectedLevel,
  onSelectTopic,
  onSelectLevel,
}: TopicsModalProps) {
  if (!isOpen) return null;

  // Extract unique topics from dataset
  const allTopicsSet = new Set<string>();
  LEARNING_PATH.forEach((w) => allTopicsSet.add(w.topic));
  const topicsList = Array.from(allTopicsSet);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-[#ffecad] bg-[#231542] text-[#fff7e8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">KONU VE SEVİYE FİLTRESİ</h2>
            <p className="mt-1 text-xs text-white/70">
              Oyun esnasında karşınıza çıkacak kelimeleri özel bir konuya veya seviyeye odaklayın.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Levels Section */}
          <div>
            <h3 className="font-pixel text-xs tracking-wider text-[#99f5c3] uppercase mb-2">
              1. SEVİYE ODAĞI (CEFR TİER):
            </h3>
            <div className="flex flex-wrap gap-2 font-bold text-xs">
              {(["ALL", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onSelectLevel(lvl)}
                  className={`rounded-lg px-3.5 py-2 transition-all ${
                    selectedLevel === lvl
                      ? "bg-[#ffd96d] text-[#21123a] shadow-md ring-2 ring-[#ffd96d]"
                      : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {lvl === "ALL" ? "🌐 Tüm Seviyeler (A1-C2)" : `Seviye ${lvl}`}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Topics Section */}
          <div>
            <h3 className="font-pixel text-xs tracking-wider text-[#ffd96d] uppercase mb-2">
              2. ÖZEL KONU VE KATEGORİ SEÇİMİ:
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onSelectTopic("ALL")}
                className={`rounded-xl border p-3 text-left font-bold text-xs transition-all ${
                  selectedTopic === "ALL"
                    ? "border-[#99f5c3] bg-[#99f5c3]/20 text-[#99f5c3] shadow"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <span>🌈 Tüm Konular (Karışık Akış)</span>
              </button>

              {topicsList.map((top) => (
                <button
                  key={top}
                  type="button"
                  onClick={() => onSelectTopic(top)}
                  className={`rounded-xl border p-3 text-left font-bold text-xs transition-all ${
                    selectedTopic === top
                      ? "border-[#ffd96d] bg-[#ffd96d]/20 text-[#ffd96d] shadow"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span>📌 {top}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-[#1a0e33] px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#99f5c3] px-5 py-2 font-pixel text-xs font-black text-[#17112e] shadow hover:bg-[#b2f8d3]"
          >
            Seçimi Uygula & Oyuna Dön ➔
          </button>
        </div>
      </div>
    </div>
  );
}
