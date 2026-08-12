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
    <div className="mt-3 flex shrink-0 items-center justify-center gap-3 sm:hidden">
      <div className="arcade-pad relative h-36 w-36 rounded-full border-2 border-white/10 bg-[#251646]/95 p-2 shadow-inner backdrop-blur-sm">
        {/* Up */}
        <button
          type="button"
          onPointerDown={dirPress("up", onDirectionChange)}
          className="absolute top-1 left-1/2 -translate-x-1/2 rounded-t-lg bg-[#3a226b] px-4 py-2 text-lg font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Yukarı"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onPointerDown={dirPress("down", onDirectionChange)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-b-lg bg-[#3a226b] px-4 py-2 text-lg font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Aşağı"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onPointerDown={dirPress("left", onDirectionChange)}
          className="absolute left-1 top-1/2 -translate-y-1/2 rounded-l-lg bg-[#3a226b] px-2.5 py-3 text-lg font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Sol"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onPointerDown={dirPress("right", onDirectionChange)}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-r-lg bg-[#3a226b] px-2.5 py-3 text-lg font-black text-[#ffd96d] shadow active:brightness-150"
          aria-label="Sağ"
        >
          ▶
        </button>

        {/* Center Pause */}
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); onPauseToggle(); }}
          className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-[#ffd96d] text-[10px] font-black text-[#21123a] shadow-md flex items-center justify-center active:brightness-110"
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
        className={`flex h-36 w-16 select-none flex-col items-center justify-center gap-1 rounded-2xl border-2 text-sm font-black transition-colors ${
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
