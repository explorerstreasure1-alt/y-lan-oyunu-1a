import { type SpeechMode } from "../audio";

type AppSettings = {
  speechMode: SpeechMode;
  sfxEnabled: boolean;
  musicOn: boolean;
  autoPauseOnEat: boolean;
  theme: "dark" | "light";
  snakeColor: "classic" | "blue" | "purple" | "orange" | "pink";
  fontSize: "normal" | "large";
  highContrast: boolean;
  repeatFrequency: 1 | 2 | 3;
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
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all ${settings.speechMode === opt.value
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

          {/* Repeat Frequency */}
          <div>
            <h3 className="mb-3 font-pixel text-xs tracking-wider text-[#ffd96d] uppercase">
              🔁 KELİME TEKRAR SIKLIĞI
            </h3>
            <div className="grid gap-2">
              {[
                { value: 1 as const, label: "1x — Ara Ara", desc: "Her kelime tur başına 1 kez, uzun ve çeşitli tur" },
                { value: 2 as const, label: "2x — Dengeli (önerilen)", desc: "Kelime yedikten sonra araya başkaları girer, sonra tekrar çıkar" },
                { value: 3 as const, label: "3x — Yoğun Tekrar", desc: "Hızlı pekiştirme, kısa tur" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSettingsChange({ repeatFrequency: opt.value })}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all ${settings.repeatFrequency === opt.value
                    ? "border-[#99f5c3] bg-[#99f5c3]/15 ring-1 ring-[#99f5c3]/40"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                >
                  <div>
                    <p className="text-xs font-black text-white">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-white/60">{opt.desc}</p>
                  </div>
                  <span
                    className={`text-sm ${settings.repeatFrequency === opt.value ? "text-[#99f5c3]" : "text-white/30"}`}
                  >
                    {settings.repeatFrequency === opt.value ? "●" : "○"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Snake Color */}
          <div>
            <h3 className="mb-3 font-pixel text-xs tracking-wider text-[#ffd96d] uppercase">
              🐍 YILAN RENGİ
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: "classic" as const, label: "Yeşil", color: "#78e6b1" },
                { value: "blue" as const, label: "Mavi", color: "#5dade2" },
                { value: "purple" as const, label: "Mor", color: "#af7ac5" },
                { value: "orange" as const, label: "Turuncu", color: "#f39c12" },
                { value: "pink" as const, label: "Pembe", color: "#e91e63" },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onSettingsChange({ snakeColor: color.value })}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${settings.snakeColor === color.value
                    ? "border-[#99f5c3] bg-[#99f5c3]/15 ring-1 ring-[#99f5c3]/40"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  title={color.label}
                >
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-[10px] font-bold text-white/70">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Theme Toggle */}
          <div>
            <h3 className="mb-3 font-pixel text-xs tracking-wider text-[#ffd96d] uppercase">
              🎨 TEMA
            </h3>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: "dark" })}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all ${settings.theme === "dark"
                  ? "border-[#99f5c3] bg-[#99f5c3]/15 ring-1 ring-[#99f5c3]/40"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
              >
                <div>
                  <p className="text-xs font-black text-white">🌙 Karanlık Mod</p>
                  <p className="mt-0.5 text-[11px] text-white/60">Göz yormayan koyu tema</p>
                </div>
                <span
                  className={`text-sm ${settings.theme === "dark" ? "text-[#99f5c3]" : "text-white/30"}`}
                >
                  {settings.theme === "dark" ? "●" : "○"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: "light" })}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition-all ${settings.theme === "light"
                  ? "border-[#99f5c3] bg-[#99f5c3]/15 ring-1 ring-[#99f5c3]/40"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
              >
                <div>
                  <p className="text-xs font-black text-white">☀️ Aydınlık Mod</p>
                  <p className="mt-0.5 text-[11px] text-white/60">Parlak ve ferah tema</p>
                </div>
                <span
                  className={`text-sm ${settings.theme === "light" ? "text-[#99f5c3]" : "text-white/30"}`}
                >
                  {settings.theme === "light" ? "●" : "○"}
                </span>
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Accessibility */}
          <div>
            <h3 className="mb-3 font-pixel text-xs tracking-wider text-[#ffd96d] uppercase">
              ♿ ERİŞİLEBİLİRLİK
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs font-black text-white">🔤 Büyük Font</p>
                  <p className="mt-0.5 text-[11px] text-white/60">Metinleri daha büyük oku</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSettingsChange({ fontSize: settings.fontSize === "large" ? "normal" : "large" })}
                  className={`relative h-7 w-12 flex-none rounded-full transition-colors ${settings.fontSize === "large" ? "bg-[#99f5c3]" : "bg-white/20"
                    }`}
                  aria-pressed={settings.fontSize === "large"}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${settings.fontSize === "large" ? "left-6" : "left-1"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs font-black text-white">👁️ Yüksek Kontrast</p>
                  <p className="mt-0.5 text-[11px] text-white/60">Daha belirgin renkler ve kenarlıklar</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSettingsChange({ highContrast: !settings.highContrast })}
                  className={`relative h-7 w-12 flex-none rounded-full transition-colors ${settings.highContrast ? "bg-[#99f5c3]" : "bg-white/20"
                    }`}
                  aria-pressed={settings.highContrast}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${settings.highContrast ? "left-6" : "left-1"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs font-black text-white">🎵 Arka Plan Müziği</p>
                <p className="mt-0.5 text-[11px] text-white/60">Şirin huzurlu melodi — oyun boyunca çalar</p>
              </div>
              <button
                type="button"
                onClick={() => onSettingsChange({ musicOn: !settings.musicOn })}
                className={`relative h-7 w-12 flex-none rounded-full transition-colors ${settings.musicOn ? "bg-[#99f5c3]" : "bg-white/20"
                  }`}
                aria-pressed={settings.musicOn}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${settings.musicOn ? "left-6" : "left-1"
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs font-black text-white">🔔 Ses Efektleri</p>
                <p className="mt-0.5 text-[11px] text-white/60">Yeme, kombo ve seviye sesleri</p>
              </div>
              <button
                type="button"
                onClick={() => onSettingsChange({ sfxEnabled: !settings.sfxEnabled })}
                className={`relative h-7 w-12 flex-none rounded-full transition-colors ${settings.sfxEnabled ? "bg-[#99f5c3]" : "bg-white/20"
                  }`}
                aria-pressed={settings.sfxEnabled}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${settings.sfxEnabled ? "left-6" : "left-1"
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
                className={`relative h-7 w-12 flex-none rounded-full transition-colors ${settings.autoPauseOnEat ? "bg-[#ffd96d]" : "bg-white/20"
                  }`}
                aria-pressed={settings.autoPauseOnEat}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-[#17112e] transition-all ${settings.autoPauseOnEat ? "left-6" : "left-1"
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
