import { useState } from "react";
import { type VocabularyWord } from "../vocabulary";

type SentenceChallengeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  word: VocabularyWord;
  options: string[];
  onCorrect: (wordId: number) => void;
  onWrong: (wordId: number) => void;
};

export function SentenceChallengeModal({ isOpen, onClose, word, options, onCorrect, onWrong }: SentenceChallengeModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  // Örnek cümlede kelimeyi boşlukla maskele (geçmiyorsa olduğu gibi göster)
  // Unicode sınırlar: yalnızca harf/rakam komşuluğu OLMAYAN tam eşleşmeler maskelenir.
  // (JS \b ASCII'dir, Kiril "я" gibi tek harflerde yanlış davranır - \p{L} kullanıyoruz)
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const maskedExample = word.example.replace(
    new RegExp("(?<![\\p{L}\\p{N}])" + escapeRegex(word.word) + "(?![\\p{L}\\p{N}])", "giu"),
    "____"
  );
  const masked = maskedExample !== word.example;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === word.word) {
      onCorrect(word.id);
    } else {
      onWrong(word.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-pop">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border-2 border-[#ffd96d] bg-[#241644] p-6 text-[#fff7e8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-pixel text-xs tracking-wider text-[#ffd96d]">
            ✨ CÜMLE MİNİ-OYUNU
          </span>
          <span className="font-pixel text-xs text-[#99f5c3]">+15 PUAN</span>
        </div>

        <p className="mt-4 text-xs uppercase tracking-widest text-white/50">
          🇹🇷 {word.meaningTr.split(" /")[0]}
        </p>

        <div className="my-4 rounded-xl border border-white/10 bg-[#1a0f33] p-4 text-center">
          <p className="text-base font-bold italic leading-7 text-white/95">
            {masked ? maskedExample : word.example}
          </p>
          {!masked && (
            <p className="mt-2 text-xs font-bold text-[#ffd96d]">Hangi kelime bu cümleyi tamamlar?</p>
          )}
        </div>

        <div className="grid gap-2.5">
          {options.map((opt) => {
            const isCorrect = opt === word.word;
            const isChosen = selected === opt;

            let btnClass = "border-white/15 bg-white/5 text-white hover:bg-white/10";
            if (selected) {
              if (isCorrect) btnClass = "border-[#75d9a6] bg-[#75d9a6]/20 text-[#75d9a6] font-bold";
              else if (isChosen) btnClass = "border-[#ff84ad] bg-[#ff84ad]/20 text-[#ff84ad]";
              else btnClass = "border-white/10 bg-white/5 opacity-40";
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`rounded-xl border p-3 text-left text-sm font-bold transition-all ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className={`font-pixel text-sm font-bold ${selected === word.word ? "text-[#75d9a6]" : "text-[#ff84ad]"}`}>
              {selected === word.word ? "🎉 DOĞRU! +15 puan" : "❌ Yanlış! Doğrusu: " + word.word}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#ffd96d] px-5 py-2 font-pixel text-xs font-black text-[#21123a] hover:bg-[#ffe073] transition-colors"
            >
              Devam ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}