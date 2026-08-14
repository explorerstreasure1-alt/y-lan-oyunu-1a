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

// PointerDown + preventDefault: dokunma anında yön değişir, click gecikmesi/hover yutması olmaz
function dirPress(dir: Direction, onDirectionChange: (dir: Direction) => void) {
  return (e: PointerEvent) => {
    e.preventDefault();
    onDirectionChange(dir);
  };
}

export function ArcadeControls({ onDirectionChange, onPauseToggle, isPlaying, isBoosting, onBoostStart, onBoostEnd }: ArcadeControlsProps) {
  return (
    <div className="mt-3 flex w-full shrink-0 flex-col items-center gap-3 sm:hidden">
      <div className="arcade-pad relative h-48 w-48 rounded-full border-2 border-white/10 bg-[#251646]/95 p-2 shadow-inner backdrop-blur-sm">
        {/* Up */}
        <button
          type="button"
          onPointerDown={dirPress("up", onDirectionChange)}
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-t-2xl bg-[#3a226b] px-6 py-3 text-xl font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Yukarı"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onPointerDown={dirPress("down", onDirectionChange)}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-2xl bg-[#3a226b] px-6 py-3 text-xl font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Aşağı"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onPointerDown={dirPress("left", onDirectionChange)}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-l-2xl bg-[#3a226b] px-4 py-5 text-xl font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Sol"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onPointerDown={dirPress("right", onDirectionChange)}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-r-2xl bg-[#3a226b] px-4 py-5 text-xl font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Sağ"
        >
          ▶
        </button>

        {/* Center Pause */}
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onPauseToggle(); }}
          className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-[#ffd96d] text-[10px] font-black text-[#21123a] shadow-md flex items-center justify-center active:brightness-110"
        >
          {isPlaying ? "PAUSE" : "START"}
        </button>
      </div>

      {/* Boost: basılı tut = yılan hızlanır */}
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); onBoostStart(); }}
        onPointerUp={onBoostEnd}
        onPointerLeave={onBoostEnd}
        onPointerCancel={onBoostEnd}
        className={`flex h-14 w-48 select-none flex-row items-center justify-center gap-2 rounded-2xl border-2 text-sm font-black transition-colors ${
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
