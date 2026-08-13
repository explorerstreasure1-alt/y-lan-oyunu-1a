import { type SpeechMode } from "../audio";

type AppSettings = {
  speechMode: SpeechMode;
  sfxEnabled: boolean;
  autoPauseOnEat: boolean;
};

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (next: Partial<AppSettings>) => void;
};

export const SPEECH_MODE_OPTIONS: { value: SpeechMode; label: string; desc: string }[] = [
  { value: "word-tr", label: "Kelime + Türkçe", desc: "Yabancı kelime, ardından Türkçe anlam" },
  { value: "word", label: "Sadece Kelime", desc: "Yabancı kelime tek başına" },
  { value: "word-def", label: "Kelime + Tanım", desc: "Kelime ve İngilizce tanımı" },
  { value: "word-def-ex", label: "Hepsi", desc: "Kelime + Tanım + Örnek cümle" },
];

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-pop">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border-2 border-[#99f5c3] bg-[#231542] text-[#fff7e8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-pixel text-xl tracking-wide text-[#99f5c3]">⚙️ AYARLAR</h2>
            <p className="mt-1 text-xs text-white/70">Konuşma ve oyun tercihlerin tarayıcında saklanır</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-white/20 transition-colors"
          >
            Kapat
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Speech Mode */}
          <div>
            <h3 className="mb-3 font-pixel text-xs tracking-wider text-[#ffd96d] uppercase">
              🔊 YEMEK YİYİNCE SESLENDİRME
            </h3>
            <div className="grid gap-2">
              {SPEECH_MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSettingsChange({ speechMode: opt.value })}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                    settings.speechMode === opt.value
                      ? "border-[#99f5c3] bg-[#99f5c3]/15 ring-1 ring-[#99f5c3]/40"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <p className="text-xs font-black text-white">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-white/60">{opt.desc}</p>
                  </div>
                  <span
                    className={`text-sm ${settings.speechMode === opt.value ? "text-[#99f5c3]" : "text-white/30"}`}
                  >
                    {settings.speechMode === opt.value ? "●" : "○"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs font-black text-white">🔔 Ses Efektleri</p>
                <p className="mt-0.5 text-[11px] text-white/60">Yeme, kombo ve seviye sesleri</p>
              </div>
              <button
                type="button"
                onClick={() => onSettingsChange({ sfxEnabled: !settings.sfxEnabled })}
                className={`relative h-7 w-12 flex-none rounded-full transition-colors ${
                  settings.sfxEnabled ? "bg-[#99f5c3]" : "bg-white/20"
                }`}
                aria-pressed={settings.sfxEnabled}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${
                    settings.sfxEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs font-black text-white">⏸️ Mama Yiyince Duraklat</p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  Kelimeyi rahat okumak için her yemekten sonra oyun dursun
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSettingsChange({ autoPauseOnEat: !settings.autoPauseOnEat })}
                className={`relative h-7 w-12 flex-none rounded-full transition-colors ${
                  settings.autoPauseOnEat ? "bg-[#ffd96d]" : "bg-white/20"
                }`}
                aria-pressed={settings.autoPauseOnEat}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${
                    settings.autoPauseOnEat ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}