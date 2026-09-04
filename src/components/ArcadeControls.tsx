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
    <div className="mt-2 flex w-full shrink-0 flex-col items-center gap-2 sm:hidden select-none">
      <div className="arcade-pad relative h-52 w-52 rounded-full border-2 border-white/10 bg-[#1e1440]/95 p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm touch-manipulation">
        {/* Up — geniş vuruş alanı */}
        <button
          type="button"
          onPointerDown={dirPress("up", onDirectionChange)}
          className="absolute top-1 left-1/2 -translate-x-1/2 rounded-t-2xl bg-[#3a226b] px-7 py-4 text-xl font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-w-[64px]"
          aria-label="Yukarı"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onPointerDown={dirPress("down", onDirectionChange)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-b-2xl bg-[#3a226b] px-7 py-4 text-xl font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-w-[64px]"
          aria-label="Aşağı"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onPointerDown={dirPress("left", onDirectionChange)}
          className="absolute left-1 top-1/2 -translate-y-1/2 rounded-l-2xl bg-[#3a226b] px-5 py-6 text-xl font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-h-[64px]"
          aria-label="Sol"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onPointerDown={dirPress("right", onDirectionChange)}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-r-2xl bg-[#3a226b] px-5 py-6 text-xl font-black text-[#ffd96d] shadow active:scale-95 active:bg-[#4a2d8a] active:brightness-150 transition-transform duration-75 touch-manipulation min-h-[64px]"
          aria-label="Sağ"
        >
          ▶
        </button>

        {/* Center Pause */}
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); buzz(); onPauseToggle(); }}
          className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-[#ffd96d] text-[10px] font-black text-[#21123a] shadow-md flex items-center justify-center active:brightness-110"
        >
          {isPlaying ? "PAUSE" : "START"}
        </button>
      </div>

      {/* Boost: basılı tut = yılan hızlanır */}
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); buzz(); onBoostStart(); }}
        onPointerUp={onBoostEnd}
        onPointerLeave={onBoostEnd}
        onPointerCancel={onBoostEnd}
        className={`flex h-12 w-48 select-none flex-row items-center justify-center gap-2 rounded-2xl border-2 text-sm font-black transition-colors ${
          isBoosting
            ? "border-[#ff84ad] bg-[#ff9ebb] text-[#330012] shadow-[0_0_14px_rgba(255,158,187,0.7)]"
            : "border-[#ffd96d]/50 bg-[#3a226b] text-[#ffd96d]"
        }`}
        aria-label="Hızlandır (basılı tut)"
      >
        <span className="text-xl leading-none">⚡</span>
        <span>HIZ</span>
        <span className="text-[8px] font-bold opacity-70">basılı tut</span>
      </button>
    </div>
  );
}
