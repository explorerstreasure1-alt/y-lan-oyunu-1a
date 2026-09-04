import type { PointerEvent } from "react";

type Direction = "up" | "down" | "left" | "right";

type ArcadeControlsProps = {
  onDirectionChange: (dir: Direction) => void;
  onPauseToggle: () => void;
  isPlaying: boolean;
  isBoosting: boolean;
  onBoostStart: () => void;
  onBoostEnd: () => void;
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

export function ArcadeControls({ onDirectionChange, onPauseToggle, isPlaying, isBoosting, onBoostStart, onBoostEnd }: ArcadeControlsProps) {
  return (
    <div className="mt-1 flex w-full shrink-0 flex-col items-center gap-1.5 sm:hidden select-none">
      {/* Premium D-pad — grid ile sabit, şekil düzgün, yukarı arkada kalmıyor */}
      <div className="arcade-pad grid h-36 w-36 grid-cols-3 grid-rows-3 gap-1 rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-[#22184a] to-[#161030] p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.35)] backdrop-blur-sm touch-manipulation place-items-center">
        <div className="col-start-2 row-start-1 w-full">
          <button type="button" onPointerDown={dirPress("up", onDirectionChange)}
            className="w-full rounded-t-[14px] rounded-b-[8px] bg-gradient-to-b from-[#4a2d8a] to-[#2e1a5a] border border-white/10 py-2.5 text-base font-black text-[#ffe9a8] shadow-[0_4px_12px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.14)] hover:from-[#4f3092] hover:to-[#321d60] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation"
            aria-label="Yukarı">▲</button>
        </div>
        <div className="col-start-1 row-start-2 w-full relative -top-[10px]">
          <button type="button" onPointerDown={dirPress("left", onDirectionChange)}
            className="w-full rounded-l-[14px] rounded-r-[8px] bg-gradient-to-b from-[#4a2d8a] to-[#2e1a5a] border border-white/10 py-3.5 text-base font-black text-[#ffe9a8] shadow-[0_4px_12px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#4f3092] hover:to-[#321d60] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation"
            aria-label="Sol">◀</button>
        </div>
        <div className="col-start-2 row-start-2 flex h-full w-full items-center justify-center">
          <button type="button" onPointerDown={(e) => { e.preventDefault(); buzz(); onPauseToggle(); }}
            className="h-9 w-9 rounded-full bg-gradient-to-b from-[#ffe9a8] to-[#ffd96d] border border-white/20 text-[8px] font-black text-[#1e1440] shadow-[0_4px_12px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.7)] flex items-center justify-center active:scale-95 active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)] transition-transform duration-75">
            {isPlaying ? "II" : "▶"}
          </button>
        </div>
        <div className="col-start-3 row-start-2 w-full relative -top-[10px]">
          <button type="button" onPointerDown={dirPress("right", onDirectionChange)}
            className="w-full rounded-r-[14px] rounded-l-[8px] bg-gradient-to-b from-[#4a2d8a] to-[#2e1a5a] border border-white/10 py-3.5 text-base font-black text-[#ffe9a8] shadow-[0_4px_12px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#4f3092] hover:to-[#321d60] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation"
            aria-label="Sağ">▶</button>
        </div>
        <div className="col-start-2 row-start-3 w-full">
          <button type="button" onPointerDown={dirPress("down", onDirectionChange)}
            className="w-full rounded-b-[14px] rounded-t-[8px] bg-gradient-to-b from-[#3d2680] to-[#271752] border border-white/10 py-2.5 text-base font-black text-[#ffe9a8] shadow-[0_4px_12px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#45308a] hover:to-[#2c1a5e] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)] transition-all duration-75 touch-manipulation"
            aria-label="Aşağı">▼</button>
        </div>
      </div>

      {/* Boost — aynı konum, daha premium */}
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); buzz(); onBoostStart(); }}
        onPointerUp={onBoostEnd}
        onPointerLeave={onBoostEnd}
        onPointerCancel={onBoostEnd}
        className={`flex h-8 w-36 select-none flex-row items-center justify-center gap-1.5 rounded-xl border text-xs font-black transition-all active:scale-[0.98] ${
          isBoosting
            ? "border-[#ff84ad] bg-gradient-to-b from-[#ff9ebb] to-[#ff7a9e] text-[#1a0a12] shadow-[0_0_14px_rgba(255,158,187,0.55),inset_0_1px_0_rgba(255,255,255,0.5)]"
            : "border-white/10 bg-gradient-to-b from-[#2e1a5a] to-[#25124a] text-[#ffe9a8] shadow-[0_4px_12px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] hover:from-[#35206a] hover:to-[#2a184a]"
        }`}
        aria-label="Hızlandır (basılı tut)"
      >
        <span className="text-sm leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">⚡</span>
        <span className="text-[11px] tracking-wide">HIZ</span>
      </button>
    </div>
  );
}
