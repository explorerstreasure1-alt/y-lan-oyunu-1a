import { useEffect, useState } from "react";

const ACHIEVEMENTS_KEY = "snake_abc_achievements_v1";

function loadUnlocked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export type Achievement = {
  id: string;
  icon: string;
  titleTr: string;
  descriptionTr: string;
  condition: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  learnedCount: number;
  score: number;
  bestScore: number;
  maxCombo: number;
  quizzesCompleted: number;
  customWordsAdded: number;
  streakDays: number;
  level: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "level_2",
    icon: "⚡",
    titleTr: "Yükselen Oyuncu",
    descriptionTr: "XP ile Seviye 2'ye ulaş (200 XP).",
    condition: (s) => s.level >= 2,
  },
  {
    id: "level_5",
    icon: "🔥",
    titleTr: "Kelime Savaşçısı",
    descriptionTr: "Seviye 5'e ulaş (500 XP).",
    condition: (s) => s.level >= 5,
  },
  {
    id: "level_10",
    icon: "🚀",
    titleTr: "Kelime Kaptanı",
    descriptionTr: "Seviye 10'a ulaş (1000 XP).",
    condition: (s) => s.level >= 10,
  },
  {
    id: "level_20",
    icon: "👑",
    titleTr: "XP Efsanesi",
    descriptionTr: "Seviye 20'ye ulaş (2000 XP).",
    condition: (s) => s.level >= 20,
  },
  {
    id: "first_bite",
    icon: "🐣",
    titleTr: "İlk Isırık",
    descriptionTr: "Yılan oyunuyla ilk İngilizce kelimeni ye.",
    condition: (s) => s.score >= 2 || s.learnedCount >= 1,
  },
  {
    id: "novice_10",
    icon: "🎓",
    titleTr: "Kelime Çaylağı",
    descriptionTr: "Toplam 10 kelimeyi 'Öğrendim' olarak işaretle.",
    condition: (s) => s.learnedCount >= 10,
  },
  {
    id: "scholar_50",
    icon: "🚀",
    titleTr: "Kelime Bilgini",
    descriptionTr: "Toplam 50 kelimelik zengin hazineye ulaş.",
    condition: (s) => s.learnedCount >= 50,
  },
  {
    id: "master_200",
    icon: "👑",
    titleTr: "İngilizce Ustası",
    descriptionTr: "Tam 200 kelimeyi belleğine kazı.",
    condition: (s) => s.learnedCount >= 200,
  },
  {
    id: "legend_500",
    icon: "🏆",
    titleTr: "Ateri Efsanesi",
    descriptionTr: "500 kelimelik devasa bir kelime hazinesi oluştur.",
    condition: (s) => s.learnedCount >= 500,
  },
  {
    id: "combo_fire",
    icon: "🔥",
    titleTr: "Alevli Seri",
    descriptionTr: "Üst üste yanmadan 5 kelime serisi (Combo x5) yap.",
    condition: (s) => s.maxCombo >= 5,
  },
  {
    id: "quiz_ace",
    icon: "🎯",
    titleTr: "Test Şampiyonu",
    descriptionTr: "Oyun sonu mini kelime testini tamamla.",
    condition: (s) => s.quizzesCompleted >= 1,
  },
  {
    id: "high_scorer",
    icon: "💎",
    titleTr: "Yüksek Skor Kralı",
    descriptionTr: "Tek bir oyunda 100 puana ulaş.",
    condition: (s) => s.bestScore >= 100,
  },
  {
    id: "creator",
    icon: "✍️",
    titleTr: "Kendi Listeni Oluşturan",
    descriptionTr: "Oyuna kendi özel kelimelerinden ekle.",
    condition: (s) => s.customWordsAdded >= 1,
  },
  {
    id: "legendary_streak",
    icon: "🌟",
    titleTr: "Durdurulamaz Seri",
    descriptionTr: "10 kelimelik devasa bir kombo serisi yakala.",
    condition: (s) => s.maxCombo >= 10,
  },
  {
    id: "daily_streak_5",
    icon: "📅",
    titleTr: "Haftalık İstikrar",
    descriptionTr: "5 gün üst üste oyuna gir ve pratik yap.",
    condition: (s) => s.streakDays >= 5,
  },
  {
    id: "daily_streak_30",
    icon: "🏅",
    titleTr: "Demir İrade",
    descriptionTr: "Tam 30 gün boyunca her gün kelime pratiği yap.",
    condition: (s) => s.streakDays >= 30,
  },
];

type AchievementsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stats: AchievementStats;
};

export function AchievementsModal({ isOpen, onClose, stats }: AchievementsModalProps) {
  // Rozetler kalıcı: koşulu bir kez sağlanan rozet bir daha kilitlenmez (localStorage)
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>(loadUnlocked);

  useEffect(() => {
    if (!isOpen) return;
    let changed = false;
    const next = { ...unlocked };
    for (const ach of ACHIEVEMENTS) {
      if (!next[ach.id] && ach.condition(stats)) {
        next[ach.id] = true;
        changed = true;
      }
    }
    if (changed) {
      setUnlocked(next);
      try {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next));
      } catch {}
    }
  }, [isOpen, stats, unlocked]);

  if (!isOpen) return null;

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border-2 border-[#ffd96d] bg-[#231542] text-[#fff7e8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">BAŞARIMLAR & ROZETLER</h2>
            <p className="mt-1 text-xs text-white/70">
              {ACHIEVEMENTS.length} Başarımdan <strong className="text-[#99f5c3]">{unlockedCount}</strong> Tanesinin Kilidini Açtınız!
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

        {/* Progress Bar */}
        <div className="bg-[#1b0e35] px-6 py-3 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#75d9a6] via-[#ffd96d] to-[#ff84ad] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="font-pixel text-xs font-bold text-[#ffd96d]">{progressPercent}%</span>
        </div>

        {/* Badges Grid */}
        <div className="grid flex-1 gap-3 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = Boolean(unlocked[ach.id]);

            return (
              <div
                key={ach.id}
                className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  isUnlocked
                    ? "border-[#ffd96d]/60 bg-[#2d1b54] shadow-md ring-1 ring-[#ffd96d]/30"
                    : "border-white/10 bg-white/5 opacity-50 grayscale"
                }`}
              >
                <div className="text-3xl flex-none p-1.5 rounded-lg bg-black/20 border border-white/10">
                  {ach.icon}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-sm font-bold text-white">{ach.titleTr}</span>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-[#75d9a6]">✔️</span>
                    ) : (
                      <span className="text-[10px] font-bold text-white/40">🔒 Kilitli</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-white/70">{ach.descriptionTr}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
