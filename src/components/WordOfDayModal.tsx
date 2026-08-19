import type { VocabularyWord } from "../vocabulary";
import { speakWordDetails, type SpeechMode } from "../audio";

type WordOfDayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  speechMode: SpeechMode;
  words: VocabularyWord[];
};

// Deterministic word pick that changes each calendar day
export function getWordOfTheDay(pool: VocabularyWord[]): VocabularyWord {
  const today = new Date();
  const dayIndex =
    today.getFullYear() * 1000 + (today.getMonth() + 1) * 40 + today.getDate();
  // Prefer meaningful curated words at the start of the dataset
  const words = pool.slice(0, 120);
  return words[dayIndex % words.length];
}

export function WordOfDayModal({ isOpen, onClose, speechMode, words }: WordOfDayModalProps) {
  if (!isOpen) return null;

  const word = getWordOfTheDay(words);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md rounded-2xl border-2 border-[#ffd96d] bg-gradient-to-br from-[#2a1852] to-[#1c1038] p-6 text-center text-[#fff7e8] shadow-2xl">
        <div className="mb-3 text-4xl">🌟</div>
        <span className="font-pixel text-xs tracking-widest text-[#ffd96d] uppercase">
          GÜNÜN KELİMESİ
        </span>

        <h2 className="mt-3 font-pixel text-4xl font-extrabold text-white">{word.word}</h2>
        <p className="mt-1 text-sm italic text-[#99f5c3]">{word.phonetic} • {word.pos.toUpperCase()}</p>

        <p className="mt-3 font-pixel text-2xl font-extrabold text-[#ffd96d]">
          🇹🇷 {word.meaningTr}
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3.5 text-left">
          <p className="text-[11px] font-bold uppercase text-[#99f5c3]">İngilizce Tanım:</p>
          <p className="mt-0.5 text-xs leading-5 text-white/90">{word.definition}</p>
          <p className="mt-2 text-[11px] font-bold uppercase text-[#ffd96d]">Örnek Cümle:</p>
          <p className="mt-0.5 text-xs italic leading-4 text-white/75">"{word.example}"</p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => speakWordDetails(word.word, word.meaningTr, word.definition, word.example, speechMode, word.level)}
            className="flex-1 rounded-xl bg-[#99f5c3] py-2.5 font-pixel text-xs font-black text-[#17112e] hover:bg-[#b2f8d3] transition-colors"
          >
            🔊 Dinle
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#ffd96d] py-2.5 font-pixel text-xs font-black text-[#21123a] hover:bg-[#ffe073] transition-colors"
          >
            Oyuna Başla ➔
          </button>
        </div>
      </div>
    </div>
  );
}
