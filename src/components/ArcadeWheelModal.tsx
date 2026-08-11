import { useState } from "react";

type ArcadeWheelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: (rewardPoints: number) => void;
};

const WHEEL_SECTORS = [
  { label: "+10 Puan", points: 10, color: "#99f5c3" },
  { label: "+20 Puan", points: 20, color: "#ffd96d" },
  { label: "+50 Mega Puan!", points: 50, color: "#ff84ad" },
  { label: "+5 Puan", points: 5, color: "#a0c4ff" },
  { label: "+15 Puan", points: 15, color: "#c77dff" },
  { label: "+30 Yıldız!", points: 30, color: "#ffe073" },
];

export function ArcadeWheelModal({ isOpen, onClose, onRewardWon }: ArcadeWheelModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonReward, setWonReward] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonReward(null);

    const randomIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const selectedSector = WHEEL_SECTORS[randomIndex];
    const degreesPerSector = 360 / WHEEL_SECTORS.length;
    const targetDegree = 360 * 5 + (360 - randomIndex * degreesPerSector - degreesPerSector / 2);

    setWheelRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setWonReward(selectedSector.label);
      onRewardWon(selectedSector.points);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-[#ffd96d] bg-[#231542] p-6 text-[#fff7e8] shadow-2xl text-center">
        <h2 className="font-pixel text-xl tracking-wide text-[#ffe073]">🎰 ATERİ KELİME ÇARKI</h2>
        <p className="mt-1 text-xs text-white/70">
          Çarkı çevirin ve ekstra skor ve yıldız bonusları kazanın!
        </p>

        {/* Wheel Container */}
        <div className="relative my-6 h-52 w-52 flex items-center justify-center">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-3 z-10 font-black text-2xl text-[#ffd96d] drop-shadow">
            ▼
          </div>

          <div
            className="h-full w-full rounded-full border-4 border-[#ffecad] shadow-2xl transition-all duration-[3000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              background: `conic-gradient(
                #99f5c3 0deg 60deg,
                #ffd96d 60deg 120deg,
                #ff84ad 120deg 180deg,
                #a0c4ff 180deg 240deg,
                #c77dff 240deg 300deg,
                #ffe073 300deg 360deg
              )`,
            }}
          />

          <div className="absolute h-14 w-10 border-2 border-black/20 rounded-full bg-[#231542] flex items-center justify-center font-pixel text-xs font-black text-[#ffd96d] shadow-inner">
            SNAKE
          </div>
        </div>

        {wonReward ? (
          <div className="animate-pop mb-4 rounded-xl border border-[#75d9a6] bg-[#75d9a6]/20 p-3">
            <p className="font-pixel text-sm font-bold text-[#75d9a6]">🎉 TEBRİKLER! {wonReward} KAZANDINIZ!</p>
          </div>
        ) : null}

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning}
            className="flex-1 rounded-xl bg-[#ffd96d] py-3 font-pixel text-sm font-black text-[#21123a] shadow-lg hover:bg-[#ffe073] disabled:opacity-50 transition-colors"
          >
            {spinning ? "Çark Dönüyor..." : "🎲 Çarkı Çevir!"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-pixel text-xs text-white hover:bg-white/20"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
