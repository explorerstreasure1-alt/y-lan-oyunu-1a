import { getAudioContext } from "./audio";

// 🎵 Şirin arka plan melodisi — Web Audio ile CANLI sentezlenir, dosya yok, tek bağımlılık: paylaşılan AudioContext.
// 4/4, 112 BPM, Do majör — müzik kutusu tınısı (üçgen dalga) + yumuşak bas (sinüs). 8 bar ≈ 17 sn, sonsuz loop.
const BEAT = 60 / 112;

// [MIDI nota, vuruş] — her bar tam 4 vuruş
const MELODY: [number, number][] = [
	// bar 1 (C)
	[72, 1],
	[76, 0.5],
	[79, 0.5],
	[76, 0.5],
	[72, 0.5],
	[76, 1],
	// bar 2 (C)
	[74, 1],
	[76, 0.5],
	[77, 0.5],
	[76, 1],
	[74, 1],
	// bar 3 (Am)
	[69, 1],
	[72, 0.5],
	[76, 0.5],
	[72, 1],
	[69, 1],
	// bar 4 (F)
	[65, 1],
	[69, 0.5],
	[72, 0.5],
	[74, 0.5],
	[76, 0.5],
	[77, 1],
	// bar 5 (G)
	[74, 1],
	[71, 0.5],
	[79, 0.5],
	[74, 1],
	[71, 1],
	// bar 6 (C)
	[72, 1],
	[76, 1],
	[79, 0.5],
	[76, 0.5],
	[72, 1],
	// bar 7 (F → G)
	[77, 0.5],
	[76, 0.5],
	[74, 1],
	[72, 0.5],
	[74, 0.5],
	[76, 1],
	// bar 8 (C) — kapanış C5'te biter, loop başındaki C5 ile kaynaşır
	[72, 1.5],
	[74, 0.5],
	[72, 2],
];

const BASS: [number, number][] = [
	[48, 2],
	[48, 1],
	[48, 1], // bar 1: C3
	[48, 2],
	[48, 1],
	[48, 1], // bar 2: C3
	[45, 2],
	[45, 1],
	[45, 1], // bar 3: A2
	[41, 2],
	[41, 1],
	[41, 1], // bar 4: F2
	[43, 2],
	[43, 1],
	[43, 1], // bar 5: G2
	[48, 2],
	[48, 1],
	[48, 1], // bar 6: C3
	[41, 2],
	[43, 1],
	[43, 1], // bar 7: F2 → G2
	[48, 2],
	[48, 1],
	[48, 1], // bar 8: C3
];

const LOOP_BEATS = 32;
const LOOP_SECONDS = LOOP_BEATS * BEAT;

let musicOn = false;
let musicBus: GainNode | null = null;
let loopTimer: number | null = null;
let nextLoopStart = 0;

function midiToFreq(midi: number): number {
	return 440 * 2 ** ((midi - 69) / 12);
}

/** Tek nota: kısa giriş, müzik kutusu gibi sönümlenen gövde */
function scheduleNote(
	ctx: AudioContext,
	dest: AudioNode,
	freq: number,
	start: number,
	dur: number,
	wave: OscillatorType,
	volume: number,
) {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = wave;
	osc.frequency.setValueAtTime(freq, start);
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.8);
	osc.connect(gain);
	gain.connect(dest);
	osc.start(start);
	osc.stop(start + dur * 0.85 + 0.05);
}

function scheduleLoop(ctx: AudioContext) {
	const start = nextLoopStart;
	let t = start;
	for (const [midi, beats] of MELODY) {
		scheduleNote(
			ctx,
			musicBus ?? ctx.destination,
			midiToFreq(midi),
			t,
			beats * BEAT * 0.95,
			"triangle",
			0.045,
		);
		t += beats * BEAT;
	}
	t = start;
	for (const [midi, beats] of BASS) {
		scheduleNote(
			ctx,
			musicBus ?? ctx.destination,
			midiToFreq(midi),
			t,
			beats * BEAT * 0.95,
			"sine",
			0.032,
		);
		t += beats * BEAT;
	}
	nextLoopStart = start + LOOP_SECONDS;
	// Bir sonraki turu, başlamasına ~80 ms kala planla (timer sürüklenmesi tek turu, senkronu bozmaz)
	const tick = () => {
		if (!musicOn) return;
		if (ctx.state === "running") {
			scheduleLoop(ctx);
		} else {
			// Suspend (arka sekme vb.): notaları kuyruğa yığma, kısa aralıkla tekrar dene
			loopTimer = window.setTimeout(tick, 500);
		}
	};
	loopTimer = window.setTimeout(
		tick,
		Math.max(0, (nextLoopStart - ctx.currentTime) * 1000 - 80),
	);
}

function kickOff(ctx: AudioContext) {
	if (!musicOn || musicBus) return;
	const gain = ctx.createGain();
	gain.gain.value = 1;
	gain.connect(ctx.destination);
	musicBus = gain;
	nextLoopStart = ctx.currentTime + 0.12;
	scheduleLoop(ctx);
}

/** Müziği başlat. Tarayıcı kullanıcı etkileşimi bekliyorsa context suspended kalır —
 *  ilk etkileşimde otomatik resume edilince müzik de otomatik başlar. */
export function startBackgroundMusic(): void {
	const ctx = getAudioContext();
	if (!ctx || musicOn) return;
	musicOn = true;
	if (ctx.state === "running") {
		kickOff(ctx);
		return;
	}
	// Suspended: resume olunca başlat, tek seferlik dinleyici
	const onStateChange = () => {
		if (ctx.state !== "running") return;
		ctx.removeEventListener("statechange", onStateChange);
		kickOff(ctx);
	};
	ctx.addEventListener("statechange", onStateChange);
	ctx.resume().catch(() => {});
}

export function stopBackgroundMusic(): void {
	musicOn = false;
	if (loopTimer !== null) {
		window.clearTimeout(loopTimer);
		loopTimer = null;
	}
	try {
		musicBus?.disconnect();
	} catch {
		// zaten kopmuş olabilir
	}
	musicBus = null;
}
