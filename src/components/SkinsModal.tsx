export type SnakeSkinId = "classic" | "scholar" | "golden" | "cosmic" | "rainbow";

export type SnakeSkin = {
  id: SnakeSkinId;
  name: string;
  nameTr: string;
  description: string;
  unlockRequirementWords: number;
  headBg: string;
  bodyBg: string;
  eyeColor: string;
  hatEmoji?: string;
};

export const SNAKE_SKINS: SnakeSkin[] = [
  {
    id: "classic",
    name: "Classic Nibble",
    nameTr: "Klasik Tatlı Nibble",
    description: "Yeşil sevimli ateri yılanı.",
    unlockRequirementWords: 0,
    headBg: "#a3f6c5",
    bodyBg: "#78e6b1",
    eyeColor: "#22133f",
  },
  {
    id: "scholar",
    name: "Scholar Nibble 🎓",
    nameTr: "Bilgin Yılan",
    description: "Mezuniyet kepli akıllı İngilizce öğrencisi.",
    unlockRequirementWords: 10,
    headBg: "#a0c4ff",
    bodyBg: "#709dff",
    eyeColor: "#101d42",
    hatEmoji: "🎓",
  },
  {
    id: "golden",
    name: "Golden Dragon 🌟",
    nameTr: "Altın Ejderha",
    description: "Parıldayan altın kelime avcısı.",
    unlockRequirementWords: 50,
    headBg: "#ffe073",
    bodyBg: "#ffd000",
    eyeColor: "#422800",
    hatEmoji: "👑",
  },
  {
    id: "cosmic",
    name: "Cosmic Galaxy 🌌",
    nameTr: "Kozmik Galaksi",
    description: "Mor ve mavi yıldızlı uzay yılanı.",
    unlockRequirementWords: 100,
    headBg: "#c77dff",
    bodyBg: "#9d4edd",
    eyeColor: "#10002b",
    hatEmoji: "🚀",
  },
  {
    id: "rainbow",
    name: "Rainbow Arc 🌈",
    nameTr: "Gökkuşağı Efsanesi",
    description: "Rengarenk ateri şampiyonu.",
    unlockRequirementWords: 250,
    headBg: "#ff9ebb",
    bodyBg: "#ff70a6",
    eyeColor: "#3d0016",
    hatEmoji: "🌈",
  },
];

type SkinsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  learnedCount: number;
  activeSkinId: SnakeSkinId;
  onSelectSkin: (skinId: SnakeSkinId) => void;
};

export function SkinsModal({
  isOpen,
  onClose,
  learnedCount,
  activeSkinId,
  onSelectSkin,
}: SkinsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border-2 border-[#ffecad] bg-[#231542] text-[#fff7e8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">YILAN KOSTÜMLERİ & SKINS</h2>
            <p className="mt-1 text-xs text-white/70">
              Kelime öğrendikçe sevimli ateri kostümlerinin kilidini açın!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-colors"
          >
            Kapat
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          {SNAKE_SKINS.map((skin) => {
            const isUnlocked = learnedCount >= skin.unlockRequirementWords;
            const isSelected = activeSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#ffd96d] bg-[#331e5e] shadow-lg ring-2 ring-[#ffd96d]"
                    : isUnlocked
                    ? "border-white/15 bg-[#2a184f] hover:border-white/30"
                    : "border-white/10 bg-white/5 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-base font-bold text-white">
                      {skin.hatEmoji ? `${skin.hatEmoji} ` : ""}
                      {skin.nameTr}
                    </span>
                    {isSelected && (
                      <span className="rounded bg-[#ffd96d] px-2 py-0.5 font-pixel text-[10px] font-black text-[#21123a]">
                        SEÇİLİ
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-white/75">{skin.description}</p>

                  {/* Visual Preview */}
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 p-2.5">
                    <div
                      className="h-6 w-6 rounded-md border border-white/30 shadow-inner flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: skin.headBg }}
                    >
                      {skin.hatEmoji || "•"}
                    </div>
                    <div
                      className="h-5 w-5 rounded-sm opacity-90"
                      style={{ backgroundColor: skin.bodyBg }}
                    />
                    <div
                      className="h-4 w-4 rounded-sm opacity-80"
                      style={{ backgroundColor: skin.bodyBg }}
                    />
                    <span className="ml-auto font-pixel text-[10px] text-white/50">PREVIEW</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => onSelectSkin(skin.id)}
                      className={`w-full rounded-lg py-1.5 text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-[#ffd96d] text-[#21123a]"
                          : "bg-[#99f5c3] text-[#17112e] hover:bg-[#b2f8d3]"
                      }`}
                    >
                      {isSelected ? "Kullanımda" : "Kostümü Seç"}
                    </button>
                  ) : (
                    <div className="text-center font-pixel text-[11px] text-[#ff84ad]">
                      🔒 {skin.unlockRequirementWords} Kelime Öğren ({learnedCount}/{skin.unlockRequirementWords})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
