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
      <div className="arcade-pad relative h-36 w-36 rounded-full border border-white/10 bg-[#1e1440]/90 p-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm touch-manipulation">
        {/* Up — kompakt ama hassas */}
        <button
          type="button"
          onPointerDown={dirPress("up", onDirectionChange)}
          className="absolute top-0.5 left-1/2 -translate-x-1/2 rounded-t-xl bg-[#3a226b] px-5 py-2.5 text-base font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-w-[48px]"
          aria-label="Yukarı"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onPointerDown={dirPress("down", onDirectionChange)}
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-b-xl bg-[#3a226b] px-5 py-2.5 text-base font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-w-[48px]"
          aria-label="Aşağı"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onPointerDown={dirPress("left", onDirectionChange)}
          className="absolute left-0.5 top-1/2 -translate-y-1/2 rounded-l-xl bg-[#3a226b] px-3.5 py-4 text-base font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-h-[48px]"
          aria-label="Sol"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onPointerDown={dirPress("right", onDirectionChange)}
          className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded-r-xl bg-[#3a226b] px-3.5 py-4 text-base font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-h-[48px]"
          aria-label="Sağ"
        >
          ▶
        </button>

        {/* Center Pause — küçültüldü */}
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); buzz(); onPauseToggle(); }}
          className="absolute inset-0 m-auto h-9 w-9 rounded-full bg-[#ffd96d] text-[8px] font-black text-[#21123a] shadow-md flex items-center justify-center active:brightness-110"
        >
          {isPlaying ? "II" : "▶"}
        </button>
      </div>

      {/* Boost — kompakt */}
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); buzz(); onBoostStart(); }}
        onPointerUp={onBoostEnd}
        onPointerLeave={onBoostEnd}
        onPointerCancel={onBoostEnd}
        className={`flex h-8 w-36 select-none flex-row items-center justify-center gap-1.5 rounded-xl border text-xs font-black transition-colors ${
          isBoosting
            ? "border-[#ff84ad] bg-[#ff9ebb] text-[#330012] shadow-[0_0_10px_rgba(255,158,187,0.6)]"
            : "border-[#ffd96d]/40 bg-[#3a226b] text-[#ffd96d]"
        }`}
        aria-label="Hızlandır (basılı tut)"
      >
        <span className="text-sm leading-none">⚡</span>
        <span className="text-[11px]">HIZ</span>
      </button>
    </div>
  );
}
