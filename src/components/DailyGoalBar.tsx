import { useEffect, useRef, useState } from "react";

type DailyGoalBarProps = {
  learnedCount: number;
};

const STREAK_KEY = "snake_abc_daily_streak_v1";
const LAST_DATE_KEY = "snake_abc_last_date_v1";
const DAILY_COUNT_KEY = "snake_abc_daily_count_v1";

const dailyKey = () => new Date().toISOString().slice(0, 10);

export function DailyGoalBar({ learnedCount }: DailyGoalBarProps) {
  const [streakDays, setStreakDays] = useState(1);
  const [dailyLearnedToday, setDailyLearnedToday] = useState(0);
  const prevLearnedRef = useRef(learnedCount);
  const dailyTarget = 10;

  // Streak: her pratik gününde 1 artar, 1 gün atlanırsa sıfırlanır
  useEffect(() => {
    const todayStr = dailyKey();
    const lastDate = localStorage.getItem(LAST_DATE_KEY);
    const savedStreak = Number(localStorage.getItem(STREAK_KEY)) || 1;

    if (lastDate !== todayStr) {
      if (lastDate) {
        const last = new Date(lastDate);
        const current = new Date(todayStr);
        const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          const nextStreak = savedStreak + 1;
          setStreakDays(nextStreak);
          localStorage.setItem(STREAK_KEY, String(nextStreak));
        } else if (diffDays > 1) {
          setStreakDays(1);
          localStorage.setItem(STREAK_KEY, "1");
        }
      }
      localStorage.setItem(LAST_DATE_KEY, todayStr);
    } else {
      setStreakDays(savedStreak);
    }

    // Günlük öğrenme sayacı: bugünün tarihiyle saklanır, gün atlanınca sıfırlanır
    try {
      const saved = JSON.parse(localStorage.getItem(DAILY_COUNT_KEY) || "null") as {
        date: string;
        count: number;
      } | null;
      if (saved && saved.date === todayStr && Number.isFinite(saved.count)) {
        setDailyLearnedToday(Math.min(dailyTarget, saved.count));
      } else {
        setDailyLearnedToday(0);
      }
    } catch {
      setDailyLearnedToday(0);
    }
  }, []);

  // Ancak gerçek yeni öğrenme kadar artır - sayfa açma ile şişmez
  useEffect(() => {
    const delta = Math.max(0, learnedCount - prevLearnedRef.current);
    prevLearnedRef.current = learnedCount;
    if (delta === 0) return;
    setDailyLearnedToday((prev) => {
      const next = Math.min(dailyTarget, prev + delta);
      try {
        localStorage.setItem(DAILY_COUNT_KEY, JSON.stringify({ date: dailyKey(), count: next }));
      } catch {}
      return next;
    });
  }, [learnedCount]);

  const percent = Math.min(100, Math.round((dailyLearnedToday / dailyTarget) * 100));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#211442] px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-base">🔥</span>
        <div>
          <span className="font-pixel text-[10px] text-[#ffd96d] uppercase tracking-wider">
            GÜNLÜK ÖĞRENME SERİSİ:
          </span>
          <p className="font-pixel text-xs font-black text-white">{streakDays} Gün Üst Üste Pratik Yapıldı!</p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-[200px] flex-1 max-w-xs">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] font-pixel text-white/70 mb-1">
            <span>Günün Hedefi ({dailyLearnedToday}/{dailyTarget})</span>
            <span>{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#75d9a6] to-[#ffe073] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        {percent >= 100 && (
          <span className="animate-bounce font-pixel text-xs text-[#ffd96d]" title="Günün Hedefi Tamamlandı!">
            🏆 HEDEF TAMAM!
          </span>
        )}
      </div>
    </div>
  );
}