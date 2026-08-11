import { useState } from "react";
import { type VocabularyWord } from "../vocabulary";

type MicPracticeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  word: VocabularyWord;
};

export function MicPracticeModal({ isOpen, onClose, word }: MicPracticeModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleStartListening = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: typeof window.SpeechSynthesisUtterance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof window.SpeechSynthesisUtterance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tarayıcınız mikrofonla konuşma tanımayı desteklemiyor. Google Chrome veya Edge deneyebilirsiniz.");
      return;
    }

    try {
      const recognition = new (SpeechRecognition as unknown as new () => {
        lang: string;
        start: () => void;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: () => void;
      })();

      recognition.lang = "en-US";
      setIsListening(true);
      setSpokenText(null);
      setMatchScore(null);

      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const target = word.word.toLowerCase().trim();
        setIsListening(false);
        setSpokenText(transcript);

        if (transcript === target || transcript.includes(target) || target.includes(transcript)) {
          setMatchScore(100);
        } else {
          setMatchScore(65);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpokenText("Ses algılanamadı, tekrar deneyin.");
      };
    } catch {
      setIsListening(false);
      alert("Mikrofon başlatılamadı.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-[#99f5c3] bg-[#231542] p-6 text-[#fff7e8] shadow-2xl text-center">
        <span className="font-pixel text-xs tracking-wider text-[#99f5c3] uppercase">
          🎙️ MİKROFON İLE İNGİLİZCE TELAFFUZ PRATİĞİ
        </span>

        <h3 className="font-pixel text-3xl font-extrabold text-[#fff7e8] mt-3">
          {word.word}
        </h3>
        <p className="text-xs italic text-[#ffd96d]">{word.phonetic} • 🇹🇷 {word.meaningTr}</p>

        {/* Mic Button */}
        <div className="my-6">
          <button
            type="button"
            onClick={handleStartListening}
            className={`h-24 w-24 rounded-full border-4 shadow-xl flex items-center justify-center text-3xl transition-all ${
              isListening
                ? "border-[#ff84ad] bg-[#ff84ad]/30 animate-pulse text-[#ff84ad]"
                : "border-[#99f5c3] bg-[#99f5c3]/20 hover:scale-105 text-[#99f5c3]"
            }`}
          >
            🎤
          </button>
          <p className="mt-2 text-xs font-bold text-white/70">
            {isListening ? "Dinleniyor... Kelimeyi Yüksek Sesle Söyleyin" : "Mikrofona Basıp Kelimeyi Okuyun"}
          </p>
        </div>

        {spokenText && (
          <div className="mb-4 rounded-xl border border-white/15 bg-black/30 p-3 text-xs w-full">
            <p className="text-white/60">Algılanan Sesiniz:</p>
            <p className="font-pixel text-base font-bold text-[#ffd96d] mt-1">"{spokenText}"</p>

            {matchScore !== null && (
              <div className="mt-2 font-pixel text-sm font-bold text-[#75d9a6]">
                {matchScore === 100 ? "🎉 MÜKEMMEL TELAFFUZ! (100%)" : "👍 BİRAZ DAHI DİKKATLİ OKUYUN (%65)"}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-pixel text-xs text-white hover:bg-white/20"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
