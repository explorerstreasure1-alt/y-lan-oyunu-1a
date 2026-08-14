import { useState } from "react";
import { type VocabularyWord } from "../vocabulary";
import { runSpeechRecognition, similarityScore } from "./MicPracticeModal";

type QuizModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recentWords: VocabularyWord[];
  onBonusEarned: (points: number) => void;
  onWordFailed: (wordId: number) => void;
  language: "en" | "ru";
};

export function QuizModal({ isOpen, onClose, recentWords, onBonusEarned, onWordFailed, language }: QuizModalProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSpoken, setMicSpoken] = useState<string | null>(null);
  const [micScore, setMicScore] = useState<number | null>(null);

  if (!isOpen || recentWords.length === 0) return null;

  const currentWord = recentWords[questionIndex % recentWords.length];

  // Generate 3 options (1 correct, 2 distractors)
  const distractors = recentWords
    .filter((w) => w.id !== currentWord.id)
    .map((w) => w.meaningTr);

  const options = [currentWord.meaningTr, ...distractors.slice(0, 2)].sort(
    () => (currentWord.id % 2 === 0 ? 1 : -1)
  );

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentWord.meaningTr) {
      setScore((prev) => prev + 1);
    } else {
      // Hata defteri: yanlış cevap → kelime zayıflar, tekrara girer
      onWordFailed(currentWord.id);
    }
  };

  // 🎤 Sözlü cevap: mikrofon tanıması şık seçmek yerine geçer (≥%60 benzerlik = doğru)
  const handleMicAnswer = () => {
    if (isAnswered || isListening) return;
    setIsListening(true);
    setMicSpoken(null);
    setMicScore(null);

    const started = runSpeechRecognition(
      language,
      (transcript) => {
        setIsListening(false);
        setMicSpoken(transcript);
        const s = similarityScore(transcript, currentWord.word.toLowerCase().trim());
        setMicScore(s);
        setIsAnswered(true);
        if (s >= 60) {
          setSelectedOption(currentWord.meaningTr); // doğru şık yeşil parlasın
          setScore((prev) => prev + 1);
        } else {
          onWordFailed(currentWord.id);
        }
      },
      () => {
        setIsListening(false);
        setMicSpoken("Ses algılanamadı, tekrar deneyin.");
      }
    );

    if (!started) {
      setIsListening(false);
      alert("Tarayıcınız mikrofonla konuşma tanımayı desteklemiyor. Google Chrome veya Edge deneyebilirsiniz.");
    }
  };

  const handleNext = () => {
    if (questionIndex + 1 < Math.min(3, recentWords.length)) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsListening(false);
      setMicSpoken(null);
      setMicScore(null);
    } else {
      // Finished Quiz
      const bonusPoints = score * 10;
      onBonusEarned(bonusPoints);
      onClose();
    }
  };

  const answeredWrong = isAnswered && selectedOption !== currentWord.meaningTr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border-2 border-[#ffd96d] bg-[#241644] p-6 text-[#fff7e8] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-pixel text-xs tracking-wider text-[#99f5c3]">
            ⚡ HIZLI KELİME PEKİŞTİRME MİNİ-TESTİ
          </span>
          <span className="font-pixel text-xs text-[#ffd96d]">
            Soru {questionIndex + 1} / {Math.min(3, recentWords.length)}
          </span>
        </div>

        <div className="my-5 text-center">
          <p className="text-xs uppercase tracking-widest text-white/50">İNGİLİZCE KELİME:</p>
          <h3 className="font-pixel text-4xl font-extrabold text-[#fff7e8] mt-1">
            {currentWord.word}
          </h3>
          <p className="mt-1 text-xs italic text-[#ffd96d]">{currentWord.phonetic} • {currentWord.pos}</p>
        </div>

        {/* 🎤 Sözlü cevap: şık seçmeden kelimeyi yüksek sesle oku */}
        <div className="mb-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleMicAnswer}
            disabled={isAnswered}
            className={`flex items-center gap-2 rounded-full border-2 px-5 py-2 text-xs font-black transition-all ${
              isAnswered
                ? "border-white/10 bg-white/5 text-white/40"
                : isListening
                ? "border-[#ff84ad] bg-[#ff84ad]/20 text-[#ff84ad] animate-pulse"
                : "border-[#99f5c3]/50 bg-[#99f5c3]/10 text-[#99f5c3] hover:bg-[#99f5c3]/20"
            }`}
          >
            <span className="text-lg leading-none">🎤</span>
            {isListening ? "Dinleniyor... Kelimeyi söyleyin" : "Şıksız Sözlü Cevap Ver"}
          </button>
          {micSpoken && (
            <p className="text-[11px] text-white/60">
              Algılanan: <strong className="text-[#ffd96d]">"{micSpoken}"</strong>
              {micScore !== null && <span className="ml-1 text-white/50">(%{micScore})</span>}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((opt, i) => {
            const isCorrect = opt === currentWord.meaningTr;
            const isChosen = selectedOption === opt;

            let btnClass = "border-white/15 bg-white/5 text-white hover:bg-white/10";
            if (isAnswered) {
              if (isCorrect) btnClass = "border-[#75d9a6] bg-[#75d9a6]/20 text-[#75d9a6] font-bold";
              else if (isChosen) btnClass = "border-[#ff84ad] bg-[#ff84ad]/20 text-[#ff84ad]";
              else btnClass = "border-white/10 bg-white/5 opacity-40";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`rounded-xl border p-3.5 text-left text-sm font-bold transition-all ${btnClass}`}
              >
                <span>🇹🇷 {opt}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <>
            {answeredWrong && (
              <p className="mt-4 text-center font-pixel text-sm font-bold text-[#ff84ad]">
                ❌ Yanlış! Doğrusu: <span className="text-white">{currentWord.meaningTr}</span>
              </p>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 w-full rounded-xl bg-[#ffd96d] py-3 font-pixel text-sm font-black text-[#21123a] shadow-lg hover:bg-[#ffe073] transition-colors"
            >
              {questionIndex + 1 < Math.min(3, recentWords.length) ? "Sonraki Soru ➔" : "Testi Tamamla & Bonusu Al 🏆"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
