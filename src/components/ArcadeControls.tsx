type Direction = "up" | "down" | "left" | "right";

type ArcadeControlsProps = {
  onDirectionChange: (dir: Direction) => void;
  onPauseToggle: () => void;
  isPlaying: boolean;
};

export function ArcadeControls({ onDirectionChange, onPauseToggle, isPlaying }: ArcadeControlsProps) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 sm:hidden">
      <div className="relative h-36 w-36 rounded-full border-2 border-white/10 bg-[#251646] p-2 shadow-inner">
        {/* Up */}
        <button
          type="button"
          onClick={() => onDirectionChange("up")}
          className="absolute top-1 left-1/2 -translate-x-1/2 rounded-t-lg bg-[#3a226b] px-4 py-2 text-lg font-black text-[#ffd96d] shadow hover:bg-[#4d2d8f] active:scale-95"
          aria-label="Yukarı"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onClick={() => onDirectionChange("down")}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-b-lg bg-[#3a226b] px-4 py-2 text-lg font-black text-[#ffd96d] shadow hover:bg-[#4d2d8f] active:scale-95"
          aria-label="Aşağı"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onClick={() => onDirectionChange("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 rounded-l-lg bg-[#3a226b] px-2.5 py-3 text-lg font-black text-[#ffd96d] shadow hover:bg-[#4d2d8f] active:scale-95"
          aria-label="Sol"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onClick={() => onDirectionChange("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-r-lg bg-[#3a226b] px-2.5 py-3 text-lg font-black text-[#ffd96d] shadow hover:bg-[#4d2d8f] active:scale-95"
          aria-label="Sağ"
        >
          ▶
        </button>

        {/* Center Pause */}
        <button
          type="button"
          onClick={onPauseToggle}
          className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-[#ffd96d] text-[10px] font-black text-[#21123a] shadow-md flex items-center justify-center active:scale-90"
        >
          {isPlaying ? "PAUSE" : "START"}
        </button>
      </div>
    </div>
  );
}
