import type { PointerEvent } from "react";

type Direction = "up" | "down" | "left" | "right";

type ArcadeControlsProps = {
  onDirectionChange: (dir: Direction) => void;
  onPauseToggle: () => void;
  isPlaying: boolean;
  isBoosting: boolean;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onPoisonFire: () => void;
  poisonAmmo: number;
  compact?: boolean;
};

// Dokunma hissi: mobilde kısa titreme (desteklemeyen tarayıcıda sessizce yok sayılır)
function buzz() {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* haptik desteklenmiyor */
  }
}

// PointerDown + preventDefault: dokunma anında yön değişir, click gecikmesi/hover yutması olmaz
function dirPress(dir: Direction, onDirectionChange: (dir: Direction) => void) {
  return (e: PointerEvent) => {
    e.preventDefault();
    buzz();
    onDirectionChange(dir);
  };
}

export function ArcadeControls({ onDirectionChange, onPauseToggle, isPlaying, isBoosting, onBoostStart, onBoostEnd, onPoisonFire, poisonAmmo, compact = false }: ArcadeControlsProps) {
  const pad = compact ? "h-32 w-32 gap-1 rounded-[16px] p-1.5" : "h-44 w-44 gap-1.5 rounded-[20px] p-2";
  const dirBtn = compact
    ? "w-full h-[32px] rounded-[12px] rounded-b-[8px] text-[13px] shadow-[0_3px_8px_rgba(0,0,0,0.30)]"
    : "w-full h-[42px] rounded-t-[14px] rounded-b-[8px] text-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.32)]";
  const dirBtnH = compact ? "h-[40px]" : "h-[52px]";
  const dirBtnSide = compact ? "rounded-r-[12px] rounded-l-[8px]" : "rounded-r-[14px] rounded-l-[8px]";
  const dirBtnV = compact ? "rounded-b-[12px] rounded-t-[8px]" : "rounded-b-[14px] rounded-t-[8px]";
  const pauseBtn = compact ? "h-7 w-7" : "h-10 w-10";
  const bottomRow = compact ? "grid-cols-[1fr_auto_1fr] gap-1" : "grid-cols-[1fr_auto_1fr] gap-1.5";
  const boostBtn = compact ? "h-6 w-28 text-[9px]" : "h-8 w-36 text-xs";
  const poisonBtn = compact ? "h-8 w-8" : "h-10 w-10";
  const padShadow = compact
    ? "shadow-[0_8px_20px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.30)]"
    : "shadow-[0_10px_28px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.35)]";
  return (
    <div className={`relative mt-1 flex w-full shrink-0 flex-col items-center gap-${compact ? 1 : 1.5} sm:hidden select-none`}>
      {/* Premium D-pad — aşağı sabitle, kompakt */}
      <div className={`arcade-pad grid ${pad} grid-cols-3 grid-rows-3 border border-white/[0.09] bg-gradient-to-b from-[#22184a] to-[#161030] ${padShadow} backdrop-blur-sm touch-manipulation place-items-center`}>
        <div className="col-start-2 row-start-1 w-full">
          <button type="button" onPointerDown={dirPress("up", onDirectionChange)}
            className={`w-full ${dirBtn} ${dirBtnV} bg-gradient-to-b from-[#4a2d8a] to-[#2e1a5a] border border-white/10 font-black text-[#ffe9a8] shadow-[0_3px_8px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.14)] hover:from-[#4f3092] hover:to-[#321d60] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation flex items-center justify-center`}
            aria-label="Yukarı">▲</button>
        </div>
        <div className="col-start-1 row-start-2 w-full">
          <button type="button" onPointerDown={dirPress("left", onDirectionChange)}
            className={`w-full ${dirBtnH} ${dirBtnSide} bg-gradient-to-b from-[#4a2d8a] to-[#2e1a5a] border border-white/10 font-black text-[#ffe9a8] shadow-[0_3px_8px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#4f3092] hover:to-[#321d60] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation flex items-center justify-center`}
            aria-label="Sol">◀</button>
        </div>
        <div className="col-start-2 row-start-2 flex h-full w-full items-center justify-center">
          <button type="button" onPointerDown={(e) => { e.preventDefault(); buzz(); onPauseToggle(); }}
            className={`${pauseBtn} rounded-full bg-gradient-to-b from-[#ffe9a8] to-[#ffd96d] border border-white/20 text-[9px] font-black text-[#1e1440] shadow-[0_3px_8px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.7)] flex items-center justify-center active:scale-95 active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)] transition-transform duration-75`}
          >
            {isPlaying ? "II" : "▶"}
          </button>
        </div>
        <div className="col-start-3 row-start-2 w-full">
          <button type="button" onPointerDown={dirPress("right", onDirectionChange)}
            className={`w-full ${dirBtnH} ${dirBtnSide} bg-gradient-to-b from-[#4a2d8a] to-[#2e1a5a] border border-white/10 font-black text-[#ffe9a8] shadow-[0_3px_8px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#4f3092] hover:to-[#321d60] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation flex items-center justify-center`}
            aria-label="Sağ">▶</button>
        </div>
        <div className="col-start-2 row-start-3 w-full">
          <button type="button" onPointerDown={dirPress("down", onDirectionChange)}
            className={`w-full ${dirBtn} ${dirBtnV} bg-gradient-to-b from-[#3d2680] to-[#271752] border border-white/10 font-black text-[#ffe9a8] shadow-[0_3px_8px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#45308a] hover:to-[#2c1a5e] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation flex items-center justify-center`}
            aria-label="Aşağı">▼</button>
        </div>
      </div>

      {/* Alt sıra: HIZ ortada, zehir sağda — kompakt */}
      <div className={`grid w-full ${bottomRow} items-center gap-1`}>
        <div />
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); buzz(); onBoostStart(); }}
          onPointerUp={onBoostEnd}
          onPointerLeave={onBoostEnd}
          onPointerCancel={onBoostEnd}
          className={`flex ${boostBtn} select-none flex-row items-center justify-center gap-1 rounded-xl border text-[9px] font-black transition-all active:scale-[0.98] ${
            isBoosting
              ? "border-[#ff84ad] bg-gradient-to-b from-[#ff9ebb] to-[#ff7a9e] text-[#1a0a12] shadow-[0_0_14px_rgba(255,158,187,0.55),inset_0_1px_0_rgba(255,255,255,0.5)]"
              : "border-white/10 bg-gradient-to-b from-[#2e1a5a] to-[#25124a] text-[#ffe9a8] shadow-[0_3px_8px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] hover:from-[#35206a] hover:to-[#2a184a]"
          }`}
          aria-label="Hızlandır (basılı tut)"
        >
          <span className="text-sm leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">⚡</span>
          <span className="text-[10px] tracking-wide">HIZ</span>
        </button>
        <div className="flex justify-start">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); buzz(); onPoisonFire(); }}
            className={`flex ${poisonBtn} select-none flex-col items-center justify-center rounded-full border-2 text-[9px] font-black transition-all active:scale-90 touch-manipulation border-[#7CFC00]/60 bg-gradient-to-b from-[#7CFC00]/30 to-[#4a8a00]/30 text-[#c6ff8a] shadow-[0_0_14px_rgba(124,252,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]`}
            aria-label="Zehir püskürt (sınırsız)"
          >
            <span className="text-base leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">☠️</span>
            <span className="-mt-0.5 text-[7px] tabular-nums">∞</span>
          </button>
        </div>
      </div>
    </div>
  );
}
