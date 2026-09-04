import { useEffect, useMemo, useRef, useState } from "react";
import { LEVEL_ORDER, type Series, getSeriesForLanguage, toggleSeriesCompleted } from "../series";
import type { WordLevel } from "../vocabulary";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  selectedSeriesId: string | null;
  completedSet: Set<string>;
  onSelectSeries: (series: Series) => void;
  onCompletedChange: (next: Set<string>) => void;
  onClearSeries: () => void;
};

const LEVEL_META: Record<WordLevel, { label: string; dot: string; ring: string }> = {
  A1: { label: "Beginner", dot: "bg-[var(--accent-1)]", ring: "ring-[rgba(var(--accent-1-rgb)/0.22)]" },
  A2: { label: "Elementary", dot: "bg-[#FFB700]", ring: "ring-[rgba(255,183,0,0.22)]" },
  B1: { label: "Intermediate", dot: "bg-[#7aa8ff]", ring: "ring-[rgba(122,168,255,0.22)]" },
  B2: { label: "Upper-Int.", dot: "bg-[#ff6b9d]", ring: "ring-[rgba(255,107,157,0.22)]" },
  C1: { label: "Advanced", dot: "bg-[#b18cff]", ring: "ring-[rgba(177,140,255,0.22)]" },
  C2: { label: "Mastery", dot: "bg-[#ff7a3d]", ring: "ring-[rgba(255,122,61,0.22)]" },
};

export function SeriesModal({ isOpen, onClose, language, selectedSeriesId, completedSet, onSelectSeries, onCompletedChange, onClearSeries }: Props) {
  const [levelFilter, setLevelFilter] = useState<WordLevel | "ALL">("ALL");
  const [pendingId, setPendingId] = useState<string | null>(selectedSeriesId);
  const allSeries = useMemo(() => getSeriesForLanguage(language), [language]);
  const filtered = useMemo(() => {
    if (levelFilter === "ALL") return allSeries;
    return allSeries.filter((s) => s.level === levelFilter);
  }, [allSeries, levelFilter]);

  // keep pending in sync when modal opens or language/selection changes
  useEffect(() => {
    if (isOpen) setPendingId(selectedSeriesId);
  }, [isOpen, selectedSeriesId, language]);

  const grouped = useMemo(() => {
    const map = new Map<WordLevel, Series[]>();
    for (const lvl of LEVEL_ORDER) {
      const arr = filtered.filter((s) => s.level === lvl);
      if (arr.length) map.set(lvl, arr);
    }
    return map;
  }, [filtered]);

  const longPressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const startPress = (id: string) => {
    longPressed.current = false;
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      const next = toggleSeriesCompleted(id);
      onCompletedChange(new Set(next));
      try { navigator.vibrate?.(40); } catch {}
    }, 620) as unknown as number;
  };
  const cancelPress = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };

  // a11y: esc, scroll lock, focus
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // focus dialog
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalDone = allSeries.filter((s) => completedSet.has(s.id)).length;
  const progress = allSeries.length ? Math.round((totalDone / allSeries.length) * 100) : 0;
  const pendingSeries = pendingId ? allSeries.find((s) => s.id === pendingId) ?? null : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-[#050410]/78 backdrop-blur-[14px]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/30 pointer-events-none" aria-hidden="true" />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-title"
        className="relative flex max-h-[92vh] w-full max-w-[860px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(19,16,46,0.96)] shadow-[0_24px_64px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] animate-pop outline-none"
      >
        {/* header — editorial */}
        <div className="relative border-b border-white/[0.07] px-5 sm:px-7 py-5 sm:py-6 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-1)] text-[#071a12] text-[15px] shadow-[0_6px_18px_rgba(0,255,163,0.25)]">◈</span>
                <p className="text-[11px] font-bold tracking-[0.18em] text-white/45 uppercase">Curated Paths</p>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-1)] shadow-[0_0_8px_rgba(0,255,163,0.8)]" />
                  {progress}% tamamlandı
                </span>
              </div>
              <h2 id="series-title" className="mt-2 font-[var(--font-display)] text-[22px] sm:text-[26px] font-black tracking-[-0.02em] leading-none text-white">
                {language === "ru" ? "🇷🇺" : language === "it" ? "🇮🇹" : language === "es" ? "🇪🇸" : language === "pt" ? "🇵🇹" : "🇬🇧"} Seriler <span className="font-[var(--font-body)] font-bold text-white/45 text-[13px] align-middle ml-1">— 50'li paketler</span>
              </h2>
              <p className="mt-2 max-w-[560px] text-[12.5px] leading-5 text-white/58">
                Her seri tam <b className="text-white font-bold">50 kelime</b> — seviye içinde sıralı. Bitirince otomatik <span className="inline-flex items-center rounded-full bg-[var(--accent-1)] px-1.5 py-0.5 text-[10px] font-black text-[#071a12]">✔</span> olur. Yanlışsa <b className="text-[var(--accent-2)]">basılı tut</b> ile geri al.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 w-[140px] overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] font-bold tracking-wide text-white/55">✔ {totalDone} / {allSeries.length}</span>
                {selectedSeriesId && <span className="rounded-full bg-[var(--accent-1)] px-2 py-0.5 text-[10px] font-black text-[#071a12]">✓ Aktif seri var</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--accent-1-ring)]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* controls — pill bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-[rgba(12,10,28,0.55)] px-5 sm:px-7 py-3.5 backdrop-blur">
          <span className="text-[11px] font-bold tracking-wide text-white/45 uppercase">Seviye</span>
          <div className="flex flex-wrap gap-1.5">
            {(["ALL", ...LEVEL_ORDER] as const).map((lvl) => {
              const active = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(lvl as WordLevel | "ALL")}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold border transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent-1-ring)] ${active ? "bg-white text-[#0a0a12] border-white shadow-[0_6px_16px_rgba(0,0,0,0.24)]" : "bg-white/[0.06] text-white/72 border-white/10 hover:bg-white/10 hover:text-white"}`}
                >
                  {lvl === "ALL" ? "Tümü" : lvl}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {selectedSeriesId ? (
              <button type="button" onClick={onClearSeries} className="rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold text-white/75 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/20">
                ✕ Seri iptali
              </button>
            ) : (
              <span className="hidden sm:inline text-[11px] text-white/35">İpucu: seriye dokun → sadece o 50 kelimeyle oyna</span>
            )}
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-7 bg-[radial-gradient(900px_400px_at_18%_0%,rgba(0,255,163,0.06),transparent_55%),radial-gradient(700px_400px_at_88%_0%,rgba(255,183,0,0.05),transparent_60%)]">
          {filtered.length === 0 ? (
            <div className="mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/60">∅</div>
              <p className="font-[var(--font-display)] text-[16px] font-bold text-white">Bu seviyede seri yok</p>
              <p className="text-[12px] leading-5 text-white/55">Filtreyi değiştir veya <b className="text-white">Tümü</b>ne dön.</p>
              <button type="button" onClick={() => setLevelFilter("ALL")} className="mt-1 rounded-full bg-white px-4 py-2 text-xs font-black text-[#0a0a12] hover:bg-white/90">Tümünü göster</button>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([lvl, series]) => {
              const doneInLevel = series.filter((s) => completedSet.has(s.id)).length;
              const meta = LEVEL_META[lvl];
              return (
                <section key={lvl} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-black tracking-wide text-white shadow-sm`}>
                      <span className={`h-2 w-2 rounded-full ${meta.dot} shadow-[0_0_8px_currentColor]`} aria-hidden="true" />
                      {lvl}
                      <span className="font-[var(--font-body)] font-semibold text-white/45">· {meta.label}</span>
                    </span>
                    <span className="text-[12px] font-semibold text-white/55">{series.length} seri</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${doneInLevel === series.length ? "bg-[var(--accent-1)] text-[#071a12]" : "bg-white/10 text-white/60 border border-white/10"}`}>{doneInLevel} ✔</span>
                    <span className="ml-auto hidden sm:inline text-[11px] text-white/30">Kelime {series[0]?.rangeLabel} → {series[series.length - 1]?.rangeLabel}</span>
                  </div>

                  <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {series.map((s) => {
                      const isCompleted = completedSet.has(s.id);
                      const isPending = pendingId === s.id;
                      const isActive = selectedSeriesId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          aria-pressed={isPending}
                          aria-label={`${s.label} ${s.rangeLabel} ${isCompleted ? "tamamlandı" : ""} ${isPending ? "seçili" : ""}`}
                          onMouseDown={() => startPress(s.id)}
                          onMouseUp={cancelPress}
                          onMouseLeave={cancelPress}
                          onTouchStart={() => startPress(s.id)}
                          onTouchEnd={cancelPress}
                          onTouchCancel={cancelPress}
                          onClick={() => {
                            if (longPressed.current) { longPressed.current = false; return; }
                            setPendingId(s.id);
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          className={`group relative flex flex-col items-start gap-2 rounded-[18px] border p-4 text-left backdrop-blur focus-visible:ring-2 focus-visible:ring-[var(--accent-1-ring)] focus-visible:ring-offset-0 transition-[transform,box-shadow,border-color,background-color] duration-200 select-none
                            ${isPending
                              ? "border-[var(--accent-1)] bg-[rgba(0,255,163,0.13)] shadow-[0_12px_28px_rgba(0,255,163,0.20),0_0_0_1px_rgba(0,255,163,0.28)] scale-[1.02] ring-1 ring-[var(--accent-1-ring)]"
                              : isActive && !isPending
                                ? "border-white/12 bg-white/[0.055] hover:border-white/20"
                                : isCompleted
                                  ? "border-white/10 bg-white/[0.045] hover:border-white/15 hover:bg-white/[0.07] opacity-[0.96]"
                                  : "border-white/[0.08] bg-[rgba(255,255,255,0.045)] hover:border-white/15 hover:bg-white/[0.07] hover:shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:-translate-y-[1px]"
                            }`}
                        >
                          <span className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-black shadow-sm transition ${isCompleted ? "bg-[var(--accent-1)] border-[var(--accent-1)] text-[#071a12]" : isPending ? "bg-white border-white text-[#0a0a12]" : "bg-[#1a1740] border-white/12 text-white/35 group-hover:text-white/55"}`} aria-hidden="true">
                            {isCompleted ? "✔" : isPending ? "●" : "○"}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <span className="font-[var(--font-mono)] text-[12px] font-black tracking-[-0.01em] text-white">{s.label}</span>
                            {isPending && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black leading-none text-[#0a0a12]">SEÇİLİ</span>}
                            {isActive && !isPending && <span className="rounded-full bg-white/15 border border-white/20 px-2 py-0.5 text-[10px] font-bold leading-none text-white/70">AKTİF</span>}
                          </span>

                          <span className="text-[12px] font-semibold leading-none text-white/55">Kelime {s.rangeLabel} <span className="text-white/30">· {s.words.length} kelime</span></span>

                          <span className="line-clamp-1 w-full text-[11px] leading-4 text-white/38 font-medium">
                            {s.words.slice(0, 3).map((w) => w.word).join("  •  ")} …
                          </span>

                          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${isPending ? "bg-[var(--accent-1)] text-[#071a12] shadow-[0_6px_16px_rgba(0,255,163,0.3)]" : isActive ? "bg-white/10 text-white/70 border border-white/15" : isCompleted ? "bg-white/10 text-white/65 border border-white/10" : "bg-white/[0.06] text-white/65 border border-white/10 group-hover:bg-white group-hover:text-[#0a0a12]"}`}>
                            {isPending ? "◎ Seçili" : "○ Seç"}
                          </span>

                          {isCompleted && <span className="text-[10px] font-semibold text-white/35">Basılı tut → tiki kaldır</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/[0.07] bg-[rgba(12,10,28,0.78)] px-5 sm:px-7 py-4 backdrop-blur">
          <p className="hidden sm:block text-[11.5px] leading-4 text-white/45 max-w-[460px]">
            Bir seriyi <b className="text-white">seç</b>, sonra <b className="text-[var(--accent-1)]">Başla</b> ile oyna — oyun sonunda otomatik ✔ olur.
          </p>
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.06] px-5 py-2.5 text-[13px] font-bold text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/20">
              Kapat
            </button>
            <button
              type="button"
              disabled={!pendingSeries}
              onClick={() => { if (pendingSeries) onSelectSeries(pendingSeries); }}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full px-7 py-2.5 text-[13px] font-black tracking-[-0.01em] shadow-[0_8px_20px_rgba(0,0,0,0.28)] transition focus-visible:ring-2 focus-visible:ring-[var(--accent-1-ring)] ${pendingSeries ? "bg-[var(--accent-1)] text-[#071a12] hover:bg-[var(--accent-1-strong)] hover:shadow-[0_10px_24px_rgba(0,255,163,0.32)]" : "bg-white/10 text-white/35 cursor-not-allowed border border-white/5"}`}
            >
              ▶ Başla {pendingSeries ? `— ${pendingSeries.label}` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
