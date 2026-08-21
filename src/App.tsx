import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	playComboSfx,
	playEatSfx,
	playGameOverSfx,
	playTurnSfx,
	type SpeechMode,
	setSpeechLanguage,
	speakWordDetails,
} from "./audio";
import {
	type AchievementStats,
	AchievementsModal,
} from "./components/AchievementsModal";
import { ArcadeControls } from "./components/ArcadeControls";
import { ArcadeWheelModal } from "./components/ArcadeWheelModal";
import { CustomWordsModal } from "./components/CustomWordsModal";
import { DailyGoalBar } from "./components/DailyGoalBar";
import { MicPracticeModal } from "./components/MicPracticeModal";
import { QuizModal } from "./components/QuizModal";
import { SettingsModal } from "./components/SettingsModal";
import {
	SkinsModal,
	SNAKE_SKINS,
	type SnakeSkinId,
} from "./components/SkinsModal";
import { StatsModal } from "./components/StatsModal";
import { TopicsModal } from "./components/TopicsModal";
import { WordOfDayModal } from "./components/WordOfDayModal";
import { startBackgroundMusic, stopBackgroundMusic } from "./music";
import {
	type ActiveFoodItem,
	addDailyActivity,
	type DailyLog,
	getDailyLog,
	getNextFoodItem,
	getSavedMasteryMap,
	isWeakWord,
	type LearningLanguage,
	recordWordBoost,
	recordWordEaten,
	recordWordFailure,
	toggleWordLearnedState,
	type WordMastery,
} from "./srs";
import {
	LEARNING_PATH,
	type VocabularyWord,
	type WordLevel,
} from "./vocabulary";
import { RUSSIAN_PATH } from "./vocabularyRu";
import { WordLibraryModal } from "./WordLibraryModal";

// PWA yükleme istemi — standart DOM lib'inde tanımlı olmayan olay tipi
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type GameStatus = "ready" | "playing" | "paused" | "over";
type GameSpeed = "slow" | "normal" | "fast";

type PowerUpType =
	| "turtle"
	| "diamond"
	| "shield"
	| "magnet"
	| "heart"
	| "boost"
	| "ghost"
	| "spotlight";
type ChargeKey =
	| "turtle"
	| "diamond"
	| "shield"
	| "magnet"
	| "ghost"
	| "spotlight";
type PowerUpOnGrid = {
	type: PowerUpType;
	point: Point;
	emoji: string;
};

// --- ULTRA STORY SIZE: 18 x 32 = tam 9:16 story, kareler olabildiğince dar, alan maksimum geniş ---
const COLUMNS = 18;
const ROWS = 32;
const STARTING_SNAKE: Point[] = [
	{ x: 9, y: 16 },
	{ x: 9, y: 17 },
	{ x: 9, y: 18 },
];

const directionDelta: Record<Direction, Point> = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
};

const isSamePoint = (first: Point, second: Point) =>
	first.x === second.x && first.y === second.y;

// Aynı milisaniyede iki olay (örn. fare + yem) aynı Date.now() id'sini alınca
// React "duplicate key" uyarısı verir — modül seviyesi sayaçla benzersizleştir
let floatIdSeq = 0;
const nextFloatId = () => {
	floatIdSeq = (floatIdSeq + 1) % 10;
	return Date.now() * 10 + floatIdSeq;
};
const isOpposite = (first: Direction, second: Direction) =>
	(first === "up" && second === "down") ||
	(first === "down" && second === "up") ||
	(first === "left" && second === "right") ||
	(first === "right" && second === "left");

function findOpenCell(
	snake: Point[],
	seed: number,
	reservedPoints: Point[] = [],
): Point {
	for (let attempt = 0; attempt < COLUMNS * ROWS; attempt += 1) {
		const value =
			(seed * 73 + attempt * 41 + 19) % ((COLUMNS - 2) * (ROWS - 2));
		const point = {
			x: (value % (COLUMNS - 2)) + 1,
			y: Math.floor(value / (COLUMNS - 2)) + 1,
		};
		const hitsSnake = snake.some((s) => isSamePoint(s, point));
		const hitsReserved = reservedPoints.some((r) => isSamePoint(r, point));
		if (!hitsSnake && !hitsReserved) return point;
	}
	return { x: 2, y: 2 };
}

// 🐀 Fare delikleri: 4 köşe her zaman boştur
const MOUSE_HOLES: Point[] = [
	{ x: 0, y: 0 },
	{ x: COLUMNS - 1, y: 0 },
	{ x: 0, y: ROWS - 1 },
	{ x: COLUMNS - 1, y: ROWS - 1 },
];

// Fare bir adımı: hedef eksene önce ilerler; yılan gövdesi engellerse diğer ekseni dener
function mouseStep(from: Point, target: Point, snake: Point[]): Point {
	const dx = Math.sign(target.x - from.x);
	const dy = Math.sign(target.y - from.y);
	const candidates: Point[] = [];
	if (Math.abs(dx) >= Math.abs(dy)) {
		if (dx !== 0) candidates.push({ x: from.x + dx, y: from.y });
		if (dy !== 0) candidates.push({ x: from.x, y: from.y + dy });
	} else {
		if (dy !== 0) candidates.push({ x: from.x, y: from.y + dy });
		if (dx !== 0) candidates.push({ x: from.x + dx, y: from.y });
	}
	const blocked = (p: Point) => snake.slice(1).some((s) => isSamePoint(s, p));
	const next = candidates.find((c) => !blocked(c));
	return next ?? from;
}

// 🐀 Fare durumu: önce yılanın kuyruğunu kovalar (hunt), ısırınca hedef deliğe kaçar (flee)
interface MouseState {
	pos: Point;
	target: Point; // hunt sırasında anlık kuyruk (yön için), flee sırasında hedef delik
	hole: Point; // kaçış deliği (flee'ye geçince target buna eşitlenir)
	phase: "hunt" | "flee";
	huntTicks: number; // kuyruğa yetişemezse pes edip kaçma sınırı
	stunTicks: number; // ısırık sonrası "çiğneme" molası — hareket yok, oyuncu yetişebilsin
	flightTicks: number; // flee'de yavaş kaçış sayacı — her 2. tick'te hareket eder
}

// Güç paneli tanımları — ❤️ Kalp ve ✨ Boost pasiftir (kutu yiyince anında uygulanır), kalanlar şarj biriktirir
const POWER_DEFS: {
	key: ChargeKey;
	emoji: string;
	name: string;
	desc: string;
}[] = [
		{ key: "turtle", emoji: "🐢", name: "Yavaş", desc: "Yılan yavaşlar, 12sn" },
		{ key: "diamond", emoji: "💎", name: "Çift XP", desc: "Puanlar x2, 12sn" },
		{ key: "shield", emoji: "🛡️", name: "Kalkan", desc: "Çarpma koruması, 20sn" },
		{
			key: "magnet",
			emoji: "🧲",
			name: "Mıknatıs",
			desc: "Mama sana yaklaşır, 12sn",
		},
		{
			key: "ghost",
			emoji: "👻",
			name: "Hayalet",
			desc: "Duvar/kuyruktan geçer, 8sn",
		},
		{
			key: "spotlight",
			emoji: "🔦",
			name: "İpucu Işığı",
			desc: "İpucu açılır, mama parlar, 8sn",
		},
	];
const EMPTY_CHARGES: Record<ChargeKey, number> = {
	turtle: 0,
	diamond: 0,
	shield: 0,
	magnet: 0,
	ghost: 0,
	spotlight: 0,
};

// Konu + seviye filtreli kelime havuzu - boş dönerse tüm havuza düş
function buildFilteredPool(
	topic: string | "ALL",
	level: WordLevel | "ALL",
	pool: VocabularyWord[],
): VocabularyWord[] {
	if (topic === "ALL" && level === "ALL") return pool;
	const filtered = pool.filter(
		(w) =>
			(topic === "ALL" || w.topic === topic) &&
			(level === "ALL" || w.level === level),
	);
	return filtered.length > 0 ? filtered : pool;
}

type SavedSettings = {
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

// Ayarlar - localStorage kalıcı, SettingsModal'den değiştirilir
function loadSettings(): SavedSettings {
	try {
		const raw = window.localStorage.getItem("snake-abc-settings");
		if (!raw)
			return {
				speechMode: "word-tr",
				sfxEnabled: true,
				musicOn: true,
				autoPauseOnEat: false,
				theme: "dark",
				snakeColor: "classic",
				fontSize: "normal",
				highContrast: false,
				repeatFrequency: 1,
			};
		const parsed = JSON.parse(raw) as Partial<SavedSettings>;
		const mode: SpeechMode =
			parsed.speechMode === "word" ||
				parsed.speechMode === "word-def" ||
				parsed.speechMode === "word-def-ex" ||
				parsed.speechMode === "word-tr"
				? parsed.speechMode
				: "word-tr";
		const snakeColor: SavedSettings["snakeColor"] =
			parsed.snakeColor === "blue" ||
				parsed.snakeColor === "purple" ||
				parsed.snakeColor === "orange" ||
				parsed.snakeColor === "pink"
				? parsed.snakeColor
				: "classic";
		const repeatFrequency: SavedSettings["repeatFrequency"] =
			parsed.repeatFrequency === 2 || parsed.repeatFrequency === 3
				? parsed.repeatFrequency
				: 1;
		return {
			speechMode: mode,
			sfxEnabled:
				typeof parsed.sfxEnabled === "boolean" ? parsed.sfxEnabled : true,
			musicOn: typeof parsed.musicOn === "boolean" ? parsed.musicOn : true,
			autoPauseOnEat:
				typeof parsed.autoPauseOnEat === "boolean"
					? parsed.autoPauseOnEat
					: false,
			theme: parsed.theme === "light" ? "light" : "dark",
			snakeColor,
			fontSize: parsed.fontSize === "large" ? "large" : "normal",
			highContrast:
				typeof parsed.highContrast === "boolean" ? parsed.highContrast : false,
			repeatFrequency,
		};
	} catch {
		return {
			speechMode: "word-tr",
			sfxEnabled: true,
			musicOn: true,
			autoPauseOnEat: false,
			theme: "dark",
			snakeColor: "classic",
			fontSize: "normal",
			highContrast: false,
			repeatFrequency: 1,
		};
	}
}

// %15 şansla mama altın elma (bonus) görünür - altın elma 2x puan + 2 XP kazandırır, soru/modal açmaz; tüm yemler hareketsizdir (mıknatıs gücü hariç)
function maybeBonusMama(item: ActiveFoodItem): ActiveFoodItem {
	return { ...item, isBonus: Math.random() < 0.15 };
}

export default function App() {
	const [snake, setSnake] = useState<Point[]>(STARTING_SNAKE);
	const [foodPoint, setFoodPoint] = useState<Point>(() =>
		findOpenCell(STARTING_SNAKE, 1),
	);
	const [status, setStatus] = useState<GameStatus>("ready");
	const [score, setScore] = useState(0);
	const [bestScore, setBestScore] = useState(0);
	const [learnedCount, setLearnedCount] = useState(0);

	// Speed, CRT & Comfort
	const [speed, setSpeed] = useState<GameSpeed>("slow");
	const [wrapWalls, setWrapWalls] = useState(true);
	const [crtMode, setCrtMode] = useState(false);
	const [isBoosting, setIsBoosting] = useState(false); // basılı tut = yılan hızlansın

	// Power-Ups & Buffs
	const [powerUpOnGrid, setPowerUpOnGrid] = useState<PowerUpOnGrid | null>(
		null,
	);
	const [hasShield, setHasShield] = useState(false);
	const [isDoubleXpActive, setIsDoubleXpActive] = useState(false);
	const [isSlowBerryActive, setIsSlowBerryActive] = useState(false);
	const [isMagnetActive, setIsMagnetActive] = useState(false);
	const [extraLives, setExtraLives] = useState(0);
	const [boostRemaining, setBoostRemaining] = useState(0);
	const [charges, setCharges] =
		useState<Record<ChargeKey, number>>(EMPTY_CHARGES);
	const [isGhostActive, setIsGhostActive] = useState(false);
	const [isSpotlightActive, setIsSpotlightActive] = useState(false);
	const [powerExpiry, setPowerExpiry] = useState<
		Partial<Record<ChargeKey, number>>
	>({});
	const [nowMs, setNowMs] = useState(() => Date.now());
	const [elapsedMs, setElapsedMs] = useState(0);

	// 🐀 Fare: yılandan kuyruk parçası koparmak için kuyruğu kovalar, ısırınca hedef deliğe kaçar; yılan kafası yakalarsa puan
	const [mouse, setMouse] = useState<MouseState | null>(null);
	const [mouseCount, setMouseCount] = useState(0); // yakalanan fare sayısı

	// XP / Seviye (kalıcı): kelime yeme ve quiz bonusuyla birikir - 100 XP = 1 seviye
	const [xp, setXp] = useState(() => {
		try {
			return Math.max(
				0,
				Number(window.localStorage.getItem("snake_abc_xp_v1")) || 0,
			);
		} catch {
			return 0;
		}
	});
	const [levelUpBanner, setLevelUpBanner] = useState<number | null>(null);
	const [dailyLog, setDailyLog] = useState<DailyLog>(getDailyLog);

	// Zayıf kelime antrenmanı: hata defterine düşen kelimelerle kısa seans
	const [weakTraining, setWeakTraining] = useState(false);

	// Filters (seçim localStorage'da kalıcı - her açılışta aynı konudan devam)
	const [selectedTopic, setSelectedTopic] = useState<string | "ALL">(() => {
		try {
			const saved = window.localStorage.getItem("snake-abc-topic");
			return saved && saved !== "ALL" ? saved : "ALL";
		} catch {
			return "ALL";
		}
	});
	const [selectedLevel, setSelectedLevel] = useState<WordLevel | "ALL">(() => {
		try {
			const saved = window.localStorage.getItem("snake-abc-level");
			return saved === "A1" ||
				saved === "A2" ||
				saved === "B1" ||
				saved === "B2" ||
				saved === "C1" ||
				saved === "C2"
				? (saved as WordLevel)
				: "ALL";
		} catch {
			return "ALL";
		}
	});
	// Dil: EN, RU veya IT - her dilin kendi havuzu + kendi kaydı (localStorage kalıcı)
	const [language, setLanguage] = useState<LearningLanguage>(() => {
		try {
			const saved = window.localStorage.getItem("snake-abc-lang");
			if (saved === "it") return "it";
			if (saved === "ru") return "ru";
			return "en";
		} catch {
			return "en";
		}
	});
	const activePool = language === "ru" ? RUSSIAN_PATH : language === "it" ? ITALIAN_PATH : LEARNING_PATH;
	const filteredPool = useMemo(
		() => buildFilteredPool(selectedTopic, selectedLevel, activePool),
		[selectedTopic, selectedLevel, activePool],
	);

	// Dil değişince: ses dilini ayarla + o güne ait kayıt haritasını yükle
	useEffect(() => {
		setSpeechLanguage(language);
		setMasteryMap(getSavedMasteryMap(language));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language]);

	// Seçili konu yeni dilin havuzunda yoksa sessizce tüm havuza düşmesin: "ALL" a sıfırla
	useEffect(() => {
		if (selectedTopic === "ALL") return;
		const pool = language === "ru" ? RUSSIAN_PATH : LEARNING_PATH;
		if (!pool.some((w) => w.topic === selectedTopic)) {
			setSelectedTopic("ALL");
			try {
				window.localStorage.setItem("snake-abc-topic", "ALL");
			} catch { }
		}
	}, [language, selectedTopic]);

	// Streak / Combo & Visuals
	const [comboStreak, setComboStreak] = useState(0);
	const [maxCombo, setMaxCombo] = useState(0);
	const [showComboBanner, setShowComboBanner] = useState(false);
	const [scoreFloat, setScoreFloat] = useState<{
		id: number;
		text: string;
	} | null>(null);
	const [wordToast, setWordToast] = useState<{
		id: number;
		word: VocabularyWord;
		isReview: boolean;
	} | null>(null);
	const [boardFlash, setBoardFlash] = useState<"good" | "gold" | null>(null);
	const [showHint, setShowHint] = useState(false);

	// Audio - lofi varsayılan açık, odak arttıran
	const [settings, setSettings] = useState<SavedSettings>(loadSettings);
	const { speechMode, sfxEnabled, musicOn, autoPauseOnEat, repeatFrequency } =
		settings;

	// Modals & UI
	const [activeSkinId, setActiveSkinId] = useState<SnakeSkinId>("classic");
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);
	const [isSkinsOpen, setIsSkinsOpen] = useState(false);
	const [isTopicsOpen, setIsTopicsOpen] = useState(false);
	const [isQuizOpen, setIsQuizOpen] = useState(false);
	const [isStatsOpen, setIsStatsOpen] = useState(false);
	const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
	const [isCustomWordsOpen, setIsCustomWordsOpen] = useState(false);
	const [isWheelOpen, setIsWheelOpen] = useState(false);
	const [isMicOpen, setIsMicOpen] = useState(false);
	const [isWordOfDayOpen, setIsWordOfDayOpen] = useState(true);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	// PWA Install
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showInstallBanner, setShowInstallBanner] = useState(false);

	// Data - aktif dil (EN) or (RU) - her dili için ayrı kayıt
	// Özel kelimeler localStorage'da kalıcı - paketler sayfa yenilenince kaybolmaz
	const [customWordBank, setCustomWordsBank] = useState<VocabularyWord[]>(
		() => {
			try {
				const raw = window.localStorage.getItem("snake-abc-custom-words");
				if (!raw) return [];
				const parsed: unknown = JSON.parse(raw);
				return Array.isArray(parsed) ? (parsed as VocabularyWord[]) : [];
			} catch {
				return [];
			}
		},
	);
	const [quizzesCompletedCount, setQuizzesCompletedCount] = useState(0);
	const [masteryMap, setMasteryMap] = useState<Record<number, WordMastery>>(
		() => getSavedMasteryMap(language),
	);
	const [activeFood, setActiveFood] = useState<ActiveFoodItem>(() =>
		maybeBonusMama({ word: activePool[0], isReview: false }),
	);
	const [lastEaten, setLastEaten] = useState<{
		word: VocabularyWord;
		isReview: boolean;
		stars: number;
	} | null>(null);
	const [sessionEatenWords, setSessionEatenWords] = useState<VocabularyWord[]>(
		[],
	);
	const [recentUnlearnedIds, setRecentUnlearnedIds] = useState<number[]>([]);

	// Refs
	const snakeRef = useRef<Point[]>(STARTING_SNAKE);
	// Kaydırma animasyonunda duvar sarımı (teleport) anında atlansın diye önceki pozisyonlar
	const prevSnakeRef = useRef<Point[]>(STARTING_SNAKE);
	const foodPointRef = useRef<Point>(foodPoint);
	const powerUpRef = useRef<PowerUpOnGrid | null>(powerUpOnGrid);
	const directionRef = useRef<Direction>("right");
	const queuedDirectionRef = useRef<Direction>("right");
	const statusRef = useRef<GameStatus>("ready");
	const scoreRef = useRef(0);
	const newWordCursorRef = useRef(0);
	const eatenTotalRef = useRef(0);
	const masteryMapRef = useRef(masteryMap);
	const activeFoodRef = useRef(activeFood);
	const recentUnlearnedIdsRef = useRef<number[]>([]);
	const comboStreakRef = useRef(0);
	const boardRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const touchStartRef = useRef<Point | null>(null);
	const xpRef = useRef(xp);
	const weakTrainingRef = useRef(false);
	const weakWordsRef = useRef<VocabularyWord[]>([]);
	const settingsRef = useRef(settings);
	const mouseRef = useRef<MouseState | null>(null);
	const mouseCooldownRef = useRef(20); // yeni fare çıkana kadar geçen tick sayısı

	// Render'daki teleport kontrolü için bir önceki commit edilmiş yılan pozisyonları
	useLayoutEffect(() => {
		prevSnakeRef.current = snake;
	}, [snake]);

	masteryMapRef.current = masteryMap;
	activeFoodRef.current = activeFood;
	powerUpRef.current = powerUpOnGrid;
	recentUnlearnedIdsRef.current = recentUnlearnedIds;
	xpRef.current = xp;
	settingsRef.current = settings;

	const currentSkin =
		SNAKE_SKINS.find((s) => s.id === activeSkinId) || SNAKE_SKINS[0];

	// PWA install prompt listener
	useEffect(() => {
		const handler = (e: Event) => {
			const evt = e as BeforeInstallPromptEvent;
			evt.preventDefault();
			setDeferredPrompt(evt);
			setShowInstallBanner(true);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	useEffect(() => {
		const savedBest = Number(window.localStorage.getItem("snake-abc-best"));
		if (Number.isFinite(savedBest) && savedBest > 0) setBestScore(savedBest);
		const count = Object.values(masteryMap).filter((m) => m.isLearned).length;
		setLearnedCount(count);
	}, [masteryMap]);

	useEffect(() => {
		try {
			window.localStorage.setItem(
				"snake-abc-custom-words",
				JSON.stringify(customWordBank),
			);
		} catch { }
	}, [customWordBank]);

	useEffect(() => {
		try {
			window.localStorage.setItem(
				"snake-abc-settings",
				JSON.stringify(settings),
			);
		} catch { }
	}, [settings]);

	// 🎵 Arka plan müziği: ayar açıkken melodiyi çal, kapalıyken durdur
	// (tarayıcı ilk kullanıcı etkileşimine kadar suspend eder — müzik otomatik senkron başlar)
	useEffect(() => {
		if (musicOn) startBackgroundMusic();
		else stopBackgroundMusic();
	}, [musicOn]);

	// 1sn saat: oturum süresi sayar + güç geri sayımlarını taze tutar
	useEffect(() => {
		const id = window.setInterval(() => {
			setNowMs(Date.now());
			setElapsedMs((e) => (statusRef.current === "playing" ? e + 1000 : e));
		}, 1000);
		return () => window.clearInterval(id);
	}, []);

	// Apply theme to document
	useEffect(() => {
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("data-theme", settings.theme);
			document.documentElement.setAttribute(
				"data-snake-color",
				settings.snakeColor,
			);
			document.documentElement.setAttribute(
				"data-font-size",
				settings.fontSize,
			);
			document.documentElement.setAttribute(
				"data-contrast",
				settings.highContrast ? "high" : "normal",
			);
		}
	}, [
		settings.theme,
		settings.snakeColor,
		settings.fontSize,
		settings.highContrast,
	]);

	const setGameStatus = useCallback((nextStatus: GameStatus) => {
		statusRef.current = nextStatus;
		setStatus(nextStatus);
	}, []);

	const startGame = useCallback(() => {
		if (statusRef.current === "over") return;
		setGameStatus("playing");
		setIsWordOfDayOpen(false);
	}, [setGameStatus]);

	const resetGame = useCallback(() => {
		const freshSnake = STARTING_SNAKE.map((point) => ({ ...point }));
		snakeRef.current = freshSnake;
		directionRef.current = "right";
		queuedDirectionRef.current = "right";
		scoreRef.current = 0;
		newWordCursorRef.current = 0;
		eatenTotalRef.current = 0;
		comboStreakRef.current = 0;
		recentUnlearnedIdsRef.current = [];

		const nextFoodPoint = findOpenCell(freshSnake, 1);
		const { item, updatedCursor } = getNextFoodItem(
			0,
			masteryMapRef.current,
			0,
			[],
			customWordBank,
			filteredPool,
			[],
			settingsRef.current.repeatFrequency,
		);

		newWordCursorRef.current = updatedCursor;
		foodPointRef.current = nextFoodPoint;
		const finalItem = maybeBonusMama(item);
		activeFoodRef.current = finalItem;

		setSnake(freshSnake);
		setFoodPoint(nextFoodPoint);
		setPowerUpOnGrid(null);
		setHasShield(false);
		setIsDoubleXpActive(false);
		setIsSlowBerryActive(false);
		setIsMagnetActive(false);
		setIsGhostActive(false);
		setIsSpotlightActive(false);
		setPowerExpiry({});
		setCharges(EMPTY_CHARGES);
		setExtraLives(0);
		setBoostRemaining(0);
		setElapsedMs(0);
		setScore(0);
		setComboStreak(0);
		setMaxCombo(0);
		setLastEaten(null);
		setWordToast(null);
		setSessionEatenWords([]);
		setRecentUnlearnedIds([]);
		setShowHint(false);
		mouseRef.current = null;
		setMouse(null);
		mouseCooldownRef.current = 20;
		setGameStatus("ready");
	}, [customWordBank, filteredPool, setGameStatus]);

	// Konu/seviye değişince: filtreyi uygula, imleci sıfırla, yeni kelime seç (oyunu bozmadan)
	const selectPool = useCallback(
		(topic: string | "ALL", level: WordLevel | "ALL") => {
			// Zayıf antrenman modu havuzla sınırlıdır - filtre değişince kapanır
			weakTrainingRef.current = false;
			setWeakTraining(false);
			setSelectedTopic(topic);
			setSelectedLevel(level);
			try {
				window.localStorage.setItem("snake-abc-topic", topic);
				window.localStorage.setItem("snake-abc-level", level);
			} catch { }
			const pool = buildFilteredPool(topic, level, activePool);
			const { item, updatedCursor } = getNextFoodItem(
				0,
				masteryMapRef.current,
				eatenTotalRef.current,
				recentUnlearnedIdsRef.current,
				customWordBank,
				pool,
				[],
				settingsRef.current.repeatFrequency,
			);
			newWordCursorRef.current = updatedCursor;
			const finalItem = maybeBonusMama(item);
			activeFoodRef.current = finalItem;
			setActiveFood(finalItem);
			const nextFoodCell = findOpenCell(
				snakeRef.current,
				eatenTotalRef.current + 3,
			);
			foodPointRef.current = nextFoodCell;
			setFoodPoint(nextFoodCell);
		},
		[customWordBank, activePool],
	);

	// Dil değiştirme: kaydı, havuzu, mama kelimesini ve oyunu yeni dile göre sıfırla
	const switchLanguage = useCallback(
		(nextLang: LearningLanguage) => {
			if (nextLang === language) return;
			weakTrainingRef.current = false;
			setWeakTraining(false);
			try {
				window.localStorage.setItem("snake-abc-lang", nextLang);
			} catch { }
			const newPool = nextLang === "ru" ? RUSSIAN_PATH : LEARNING_PATH;
			const newMap = getSavedMasteryMap(nextLang);
			masteryMapRef.current = newMap;
			setMasteryMap(newMap);
			setLanguage(nextLang);
			setSpeechLanguage(nextLang);
			const { item, updatedCursor } = getNextFoodItem(
				0,
				newMap,
				0,
				[],
				customWordBank,
				buildFilteredPool(selectedTopic, selectedLevel, newPool),
				[],
				settingsRef.current.repeatFrequency,
			);
			newWordCursorRef.current = updatedCursor;
			const finalItem = maybeBonusMama(item);
			activeFoodRef.current = finalItem;
			setActiveFood(finalItem);
			const nextFoodCell = findOpenCell(snakeRef.current, 3);
			foodPointRef.current = nextFoodCell;
			setFoodPoint(nextFoodCell);
			setSessionEatenWords([]);
			setRecentUnlearnedIds([]);
			recentUnlearnedIdsRef.current = [];
			setLastEaten(null);
			setComboStreak(0);
			comboStreakRef.current = 0;
			scoreRef.current = 0;
			setScore(0);
			eatenTotalRef.current = 0;
			setCharges(EMPTY_CHARGES);
			setIsGhostActive(false);
			setIsSpotlightActive(false);
			setPowerExpiry({});
			setElapsedMs(0);
			setGameStatus("ready");
			setIsQuizOpen(false);
		},
		[language, customWordBank, selectedTopic, selectedLevel, setGameStatus],
	);

	// XP ekle: seviye atlayınca banner göster, localStorage'a kalıcı yaz
	const addXp = useCallback((amount: number) => {
		const prev = xpRef.current;
		const next = prev + amount;
		xpRef.current = next;
		setXp(next);
		try {
			window.localStorage.setItem("snake_abc_xp_v1", String(next));
		} catch { }
		const prevLevel = Math.floor(prev / 100) + 1;
		const nextLevel = Math.floor(next / 100) + 1;
		if (nextLevel > prevLevel) {
			setLevelUpBanner(nextLevel);
			window.setTimeout(() => setLevelUpBanner(null), 2600);
		}
	}, []);

	// Zayıf kelimeler: hata defterine düşmüş veya tekrar tekrar pekişememiş
	const weakWords = useMemo(
		() => activePool.filter((w) => isWeakWord(masteryMap[w.id])),
		[activePool, masteryMap],
	);
	weakWordsRef.current = weakWords;

	// Zayıf antrenman aç/kapat: kelime havuzuna zayıf kelimeler önceden beslenir
	const toggleWeakTraining = () => {
		const nextEnabled = !weakTrainingRef.current;
		weakTrainingRef.current = nextEnabled;
		setWeakTraining(nextEnabled);
		const pool = buildFilteredPool(selectedTopic, selectedLevel, activePool);
		const weakExtra = nextEnabled ? weakWords : [];
		const { item, updatedCursor } = getNextFoodItem(
			0,
			masteryMapRef.current,
			eatenTotalRef.current,
			[],
			weakExtra,
			pool,
			[],
			settingsRef.current.repeatFrequency,
		);
		newWordCursorRef.current = updatedCursor;
		const finalItem = maybeBonusMama(item);
		activeFoodRef.current = finalItem;
		setActiveFood(finalItem);
	};

	// Güç paneli: şarj harca, süreli gücü başlat
	const activatePower = (type: ChargeKey) => {
		if (charges[type] <= 0) return;
		setCharges((c) => ({ ...c, [type]: c[type] - 1 }));
		const durationMs =
			type === "ghost" || type === "spotlight"
				? 8000
				: type === "shield"
					? 20000
					: 12000;
		if (type === "turtle") setIsSlowBerryActive(true);
		else if (type === "diamond") setIsDoubleXpActive(true);
		else if (type === "shield") setHasShield(true);
		else if (type === "magnet") setIsMagnetActive(true);
		else if (type === "ghost") setIsGhostActive(true);
		else if (type === "spotlight") {
			setIsSpotlightActive(true);
			setShowHint(true);
		}
		setPowerExpiry((p) => ({ ...p, [type]: Date.now() + durationMs }));
		if (sfxEnabled) playComboSfx();
		window.setTimeout(() => {
			if (type === "turtle") setIsSlowBerryActive(false);
			else if (type === "diamond") setIsDoubleXpActive(false);
			else if (type === "shield") setHasShield(false);
			else if (type === "magnet") setIsMagnetActive(false);
			else if (type === "ghost") setIsGhostActive(false);
			else if (type === "spotlight") {
				setIsSpotlightActive(false);
				setShowHint(false);
			}
			setPowerExpiry((p) => {
				const next = { ...p };
				delete next[type];
				return next;
			});
		}, durationMs);
	};

	const changeDirection = useCallback(
		(nextDirection: Direction) => {
			if (statusRef.current === "over") return;
			if (!isOpposite(directionRef.current, nextDirection)) {
				if (sfxEnabled && directionRef.current !== nextDirection) playTurnSfx();
				queuedDirectionRef.current = nextDirection;
				if (statusRef.current === "ready" || statusRef.current === "paused")
					startGame();
			}
		},
		[sfxEnabled, startGame],
	);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const keyDirections: Record<string, Direction> = {
				ArrowUp: "up",
				w: "up",
				W: "up",
				ArrowDown: "down",
				s: "down",
				S: "down",
				ArrowLeft: "left",
				a: "left",
				A: "left",
				ArrowRight: "right",
				d: "right",
				D: "right",
			};
			if (keyDirections[event.key]) {
				event.preventDefault();
				changeDirection(keyDirections[event.key]);
			}
			if (event.code === "Space") {
				event.preventDefault();
				if (statusRef.current === "playing") setGameStatus("paused");
				else if (
					statusRef.current === "paused" ||
					statusRef.current === "ready"
				)
					startGame();
			}
			// Shift = yılanı hızlandır (basılı tut)
			if (event.key === "Shift") {
				event.preventDefault();
				setIsBoosting(true);
			}
		};
		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key === "Shift") setIsBoosting(false);
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
		};
	}, [changeDirection, setGameStatus, startGame]);

	// Mobil: oyun çerçevesini (alan + yön pedi) ekrana sığdır - ped alanın hemen altında, ikisi birlikte görünür
	useLayoutEffect(() => {
		const board = boardRef.current;
		const frame = frameRef.current;
		if (!board || !frame) return;

		const fitFrameToViewport = () => {
			const isMobile = window.matchMedia("(max-width: 640px)").matches;
			if (!isMobile) {
				frame.style.height = "";
				board.style.width = "";
				board.style.aspectRatio = "";
				return;
			}
			// Kaydırmadan bağımsız doküman konumu
			const docTop = frame.getBoundingClientRect().top + window.scrollY;
			// Alt nefes payı: 12px
			const available = window.innerHeight - docTop - 12;
			frame.style.height = `${Math.max(320, Math.round(available))}px`;
			// 9/16 en-boy çerçeve dikeyde daralsın (flex ile board kalan yüksekliği alır)
			board.style.width = "100%";
			board.style.aspectRatio = "auto";
		};

		fitFrameToViewport();
		// Üstteki içerik (install banner vb.) değişince yeniden hesapla
		const layoutObserver = new ResizeObserver(fitFrameToViewport);
		layoutObserver.observe(document.body);
		window.addEventListener("resize", fitFrameToViewport);
		window.addEventListener("orientationchange", fitFrameToViewport);
		return () => {
			layoutObserver.disconnect();
			window.removeEventListener("resize", fitFrameToViewport);
			window.removeEventListener("orientationchange", fitFrameToViewport);
		};
	}, []);

	// Mobil: oyun alanında kaydırma (swipe) ile yön değiştir
	const handleBoardTouchStart = (event: React.TouchEvent) => {
		const touch = event.touches[0];
		touchStartRef.current = { x: touch.clientX, y: touch.clientY };
	};

	const handleBoardTouchEnd = (event: React.TouchEvent) => {
		const start = touchStartRef.current;
		touchStartRef.current = null;
		if (!start) return;
		const touch = event.changedTouches[0];
		const dx = touch.clientX - start.x;
		const dy = touch.clientY - start.y;
		if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // dokunma, kaydırma değil
		if (Math.abs(dx) > Math.abs(dy)) {
			changeDirection(dx > 0 ? "right" : "left");
		} else {
			changeDirection(dy > 0 ? "down" : "up");
		}
	};

	const toggleLearnedCurrentTarget = () => {
		const wordId = activeFood.word.id;
		const nextMap = toggleWordLearnedState(wordId, masteryMap, language);
		setMasteryMap(nextMap);
		// Öğrendim'e geçildiğinde günlük aktiviteye işle (Unuttum geri alma sayılmaz)
		if (!masteryMap[wordId]?.isLearned && nextMap[wordId]?.isLearned) {
			setDailyLog(addDailyActivity("learned"));
		}
	};

	// Game loop - story speed: slightly slower for vertical readability
	useEffect(() => {
		// Story mod için çok daha yavaş, okumaya odaklı hızlar - kullanıcı isteği: çok çok yavaş
		// Zorluk eğrisi: her 100 puanda hız kademeli artar (kademe başına -8ms, alt sınır 80ms)
		const difficultyCut = Math.min(Math.floor(scoreRef.current / 100) * 8, 100);
		let tickInterval =
			(speed === "slow" ? 240 : speed === "normal" ? 160 : 95) - difficultyCut;
		tickInterval = Math.max(80, tickInterval);
		if (isSlowBerryActive) tickInterval += 50;
		if (isBoosting)
			tickInterval = Math.max(30, Math.round(tickInterval * 0.35));

		// Yılan kayma animasyonu bu süreyle senkron kalsın
		boardRef.current?.style.setProperty("--tick-ms", `${tickInterval}ms`);

		const doTick = () => {
			if (statusRef.current !== "playing") return;

			directionRef.current = queuedDirectionRef.current;
			const delta = directionDelta[directionRef.current];
			const oldSnake = snakeRef.current;
			const head = oldSnake[0];

			let nextX = head.x + delta.x;
			let nextY = head.y + delta.y;

			if (wrapWalls) {
				if (nextX < 0) nextX = COLUMNS - 1;
				if (nextX >= COLUMNS) nextX = 0;
				if (nextY < 0) nextY = ROWS - 1;
				if (nextY >= ROWS) nextY = 0;
			}

			const nextHead = { x: nextX, y: nextY };

			// 🐀 Fare: yılanın kuyruğunu kovalar, kuyruğa 1 hücre kala parça koparıp hedef deliğe kaçar; yılan kafası yakalarsa +10 puan
			let mouseBite = false; // bu tick'te fare kuyruktan parça kopardı → yılan küçülür
			const currentMouse = mouseRef.current;
			if (currentMouse) {
				if (currentMouse.phase === "hunt") {
					// Kuyruk her tick hareket ettiği için hedefi anlık kuyruk pozisyonu yap
					const tail = oldSnake[oldSnake.length - 1];
					const distToTail =
						Math.abs(currentMouse.pos.x - tail.x) +
						Math.abs(currentMouse.pos.y - tail.y);
					if (distToTail <= 1) {
						// Kuyruğa yetişti → parça kopardı, kaçış deliğine yönel
						mouseBite = true;
						setScoreFloat({ id: nextFloatId(), text: "🐀 kuyruk kopardı!" });
						window.setTimeout(() => setScoreFloat(null), 850);
						// Fare parçayı "çiğner": 6 tick hareket etmez — oyuncu kafayla gelip yiyebilsin,
						// sonra kaçış deliğine koşar
						const stunnedMouse: MouseState = {
							...currentMouse,
							target: currentMouse.hole,
							phase: "flee",
							stunTicks: 6,
							flightTicks: 0,
						};
						mouseRef.current = stunnedMouse;
						setMouse(stunnedMouse);
					} else if (currentMouse.huntTicks >= 60) {
						// Çok uzun kovaladı → pes edip hedef deliğe kaçar
						const nextMousePos = mouseStep(
							currentMouse.pos,
							currentMouse.hole,
							oldSnake,
						);
						mouseRef.current = {
							...currentMouse,
							pos: nextMousePos,
							target: currentMouse.hole,
							phase: "flee",
							stunTicks: 0,
							flightTicks: 0,
						};
						setMouse({
							...currentMouse,
							pos: nextMousePos,
							target: currentMouse.hole,
							phase: "flee",
							stunTicks: 0,
							flightTicks: 0,
						});
					} else {
						// Kuyruğu kovalamaya devam et — fare yılanla aynı hızda koşar (1 adım/tick), oyuncu yetişip yakalayabilir
						// Hedef seçimi: dikey mesafe yataydan büyükse önce kuyruğun SATIRINA in (sütunu koru).
						// mouseStep |dx|>=|dy| iken x'i öncelediği için doğrudan kuyruğu hedeflerse yatay eksende
						// dönüp durabilir; ayrıca rowTarget fare kuyruk satırına inince kendi üzerine düşer (dx=0,
						// dy=0 → donar), bu yüzden aynı satıra yaklaşınca hedefi GERÇEK kuyruk yapıp yatayca kovalar.
						const huntTarget =
							Math.abs(tail.x - currentMouse.pos.x) >=
								Math.abs(tail.y - currentMouse.pos.y)
								? tail
								: { x: currentMouse.pos.x, y: tail.y };
						const nextMousePos = mouseStep(
							currentMouse.pos,
							huntTarget,
							oldSnake,
						);
						mouseRef.current = {
							pos: nextMousePos,
							target: tail,
							hole: currentMouse.hole,
							phase: "hunt",
							huntTicks: currentMouse.huntTicks + 1,
							stunTicks: 0,
							flightTicks: 0,
						};
						setMouse({
							pos: nextMousePos,
							target: tail,
							hole: currentMouse.hole,
							phase: "hunt",
							huntTicks: currentMouse.huntTicks + 1,
							stunTicks: 0,
							flightTicks: 0,
						});
					}
				} else {
					// flee: önce "çiğneme" molası (hareket yok), sonra HIZLI kaçış —
					// her tick'te bir hücre (yılanla aynı hız → daha zor yakalanır);
					// 1 hücre kala deliğe girer, kaybol
					if (currentMouse.stunTicks > 0) {
						const stillMouse = {
							...currentMouse,
							stunTicks: currentMouse.stunTicks - 1,
						};
						mouseRef.current = stillMouse;
						setMouse(stillMouse);
					} else {
						const distToTarget =
							Math.abs(currentMouse.pos.x - currentMouse.target.x) +
							Math.abs(currentMouse.pos.y - currentMouse.target.y);
						if (distToTarget <= 1) {
							mouseRef.current = null;
							setMouse(null);
							mouseCooldownRef.current = 18 + Math.floor(Math.random() * 14);
						} else {
							const nextMousePos = mouseStep(
								currentMouse.pos,
								currentMouse.target,
								oldSnake,
							);
							const movedMouse = {
								...currentMouse,
								pos: nextMousePos,
								flightTicks: currentMouse.flightTicks + 1,
							};
							mouseRef.current = movedMouse;
							setMouse(movedMouse);
						}
					}
				}
			} else if (mouseCooldownRef.current > 0) {
				mouseCooldownRef.current -= 1;
			} else {
				// Cooldown bitti → çıkış deliği rastgele, kaçış deliği EN UZAK olan:
				// uzun kovalamaca + yavaş kaçış = oyuncu fareyi yakalayabilsin; önce kuyruğu kovalar
				const shuffled = [...MOUSE_HOLES].sort(() => Math.random() - 0.5);
				const spawn = shuffled[0];
				// Fare deliğin hemen içinden çıkar (köşe hücresinde doğmaz)
				const insideSpawn = {
					x:
						spawn.x === 0 ? 1 : spawn.x === COLUMNS - 1 ? COLUMNS - 2 : spawn.x,
					y: spawn.y === 0 ? 1 : spawn.y === ROWS - 1 ? ROWS - 2 : spawn.y,
				};
				let hole = spawn;
				for (const candidate of shuffled) {
					const dist =
						Math.abs(candidate.x - insideSpawn.x) +
						Math.abs(candidate.y - insideSpawn.y);
					const bestDist =
						Math.abs(hole.x - insideSpawn.x) + Math.abs(hole.y - insideSpawn.y);
					if (dist > bestDist) hole = candidate;
				}
				const tail = oldSnake[oldSnake.length - 1];
				mouseRef.current = {
					pos: insideSpawn,
					target: tail,
					hole,
					phase: "hunt",
					huntTicks: 0,
					stunTicks: 0,
					flightTicks: 0,
				};
				setMouse({
					pos: insideSpawn,
					target: tail,
					hole,
					phase: "hunt",
					huntTicks: 0,
					stunTicks: 0,
					flightTicks: 0,
				});
			}
			const bitesMouse =
				mouseRef.current !== null &&
				Math.abs(nextHead.x - mouseRef.current.pos.x) <= 1 &&
				Math.abs(nextHead.y - mouseRef.current.pos.y) <= 1;

			// Mıknatıs güç-up'ı: mama her tick'te yılana 1 hücre yaklaşır
			if (isMagnetActive && !isSamePoint(nextHead, foodPointRef.current)) {
				const fp = foodPointRef.current;
				if (Math.abs(fp.x - head.x) + Math.abs(fp.y - head.y) > 1) {
					let nx = fp.x;
					let ny = fp.y;
					if (fp.x < head.x) nx += 1;
					else if (fp.x > head.x) nx -= 1;
					else if (fp.y < head.y) ny += 1;
					else if (fp.y > head.y) ny -= 1;
					foodPointRef.current = { x: nx, y: ny };
					setFoodPoint({ x: nx, y: ny });
				}
			}

			const bitesFood = isSamePoint(nextHead, foodPointRef.current);
			const bitesPowerUp =
				powerUpRef.current && isSamePoint(nextHead, powerUpRef.current.point);

			// 🐀 Fare yakalandı: +10 puan, efekt, delikler 24-38 tick sonra yeni fare çıkar
			if (bitesMouse) {
				const nextScore = scoreRef.current + 10;
				scoreRef.current = nextScore;
				setScore(nextScore);
				setScoreFloat({ id: nextFloatId(), text: "+10 🐀" });
				window.setTimeout(() => setScoreFloat(null), 850);
				addXp(1);
				setMouseCount((c) => c + 1);
				if (sfxEnabled) playEatSfx(false, 0);
				mouseRef.current = null;
				setMouse(null);
				mouseCooldownRef.current = 24 + Math.floor(Math.random() * 14);
			}

			const bodyToCheck = bitesFood ? oldSnake : oldSnake.slice(0, -1);
			const hitsWall =
				!wrapWalls &&
				(nextX < 0 || nextX >= COLUMNS || nextY < 0 || nextY >= ROWS);
			const hitsBody = bodyToCheck.some((segment) =>
				isSamePoint(segment, nextHead),
			);

			// 👻 Hayalet: duvar/kuyruk çarpışmaları yok sayılır
			if ((hitsWall || hitsBody) && !isGhostActive) {
				if (hasShield) {
					setHasShield(false);
				} else if (extraLives > 0) {
					// ❤️ Ekstra can: çarpma anında 1 can yakar, oyun devam eder
					setExtraLives((l) => l - 1);
					if (sfxEnabled) playEatSfx(false, 0);
				} else {
					const newBest = Math.max(bestScore, scoreRef.current);
					setBestScore(newBest);
					window.localStorage.setItem("snake-abc-best", String(newBest));
					if (sfxEnabled) playGameOverSfx();
					setGameStatus("over");
					if (sessionEatenWords.length > 0) {
						setIsQuizOpen(true);
					}
					return;
				}
			}

			const nextSnake = [nextHead, ...oldSnake];
			if (!bitesFood) nextSnake.pop();
			// 🐀 Fare kuyruktan parça kopardı → bir segment daha eksilir (kafa asla kaybolmaz)
			if (mouseBite && !bitesMouse && nextSnake.length > 1) nextSnake.pop();
			snakeRef.current = nextSnake;
			setSnake(nextSnake);

			if (bitesPowerUp && powerUpRef.current) {
				const type = powerUpRef.current.type;
				// ❤️ Kalp ve ✨ Boost pasiftir: anında uygulanır; diğerleri şarj olarak birikir (panelden kullanılır)
				if (type === "heart") setExtraLives((l) => l + 1);
				else if (type === "boost") setBoostRemaining((b) => b + 1);
				else if (type === "turtle" || type === "diamond" || type === "shield" || type === "magnet" || type === "ghost" || type === "spotlight") {
					setCharges((c) => ({ ...c, [type]: (c[type] ?? 0) + 1 }));
				}
				if (sfxEnabled) playComboSfx();
				setPowerUpOnGrid(null);
			}

			if (bitesFood) {
				const foodItem = activeFoodRef.current;
				const currentWord = foodItem.word;
				const isReview = foodItem.isReview;
				const isBonus = foodItem.isBonus;

				// ✨ Eğitim güç-up'ı: sonraki yemeklerde kelime +2 yıldız kazanır
				const isBoosted = boostRemaining > 0;
				const { updatedMap, newStars } = isBoosted
					? recordWordBoost(currentWord.id, masteryMapRef.current, language)
					: recordWordEaten(currentWord.id, masteryMapRef.current, language);
				if (isBoosted) setBoostRemaining((b) => b - 1);
				setMasteryMap(updatedMap);
				masteryMapRef.current = updatedMap;

				if (!isReview) {
					const updatedRecent = [
						currentWord.id,
						...recentUnlearnedIdsRef.current
							.filter((id) => !updatedMap[id]?.isLearned)
							.slice(0, 10),
					];
					recentUnlearnedIdsRef.current = updatedRecent;
					setRecentUnlearnedIds(updatedRecent);
				}

				setSessionEatenWords((prev) =>
					[currentWord, ...prev.filter((w) => w.id !== currentWord.id)],
				);

				const nextCombo = comboStreakRef.current + 1;
				comboStreakRef.current = nextCombo;
				setComboStreak(nextCombo);
				setMaxCombo((prev) => Math.max(prev, nextCombo));

				if (nextCombo > 1) {
					setShowComboBanner(true);
					window.setTimeout(() => setShowComboBanner(false), 1200);
					if (sfxEnabled) playComboSfx();
				}

				eatenTotalRef.current += 1;

				if (Math.random() < 0.22 && !powerUpRef.current) {
					const pTypes: PowerUpType[] = [
						"turtle",
						"diamond",
						"shield",
						"magnet",
						"heart",
						"boost",
						"ghost",
						"spotlight",
					];
					const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
					const pEmoji =
						pType === "turtle"
							? "🐢"
							: pType === "diamond"
								? "💎"
								: pType === "shield"
									? "🛡️"
									: pType === "magnet"
										? "🧲"
										: pType === "heart"
											? "❤️"
											: pType === "boost"
												? "✨"
												: pType === "ghost"
													? "👻"
													: "🔦";
					const pPoint = findOpenCell(nextSnake, eatenTotalRef.current * 19, [
						foodPointRef.current,
					]);
					setPowerUpOnGrid({ type: pType, point: pPoint, emoji: pEmoji });
				}

				let scorePoints = (isReview ? 5 : 2) * (nextCombo >= 3 ? 2 : 1);
				if (isBonus) scorePoints *= 2; // 🐛 altın yem: 2x puan
				if (isDoubleXpActive) scorePoints *= 2;

				const nextScore = scoreRef.current + scorePoints;
				scoreRef.current = nextScore;
				setScore(nextScore);

				addXp((isReview ? 2 : 5) + (isBonus ? 2 : 0));
				setDailyLog(addDailyActivity(isReview ? "review" : "eaten"));

				setScoreFloat({ id: nextFloatId(), text: `+${scorePoints}` });
				window.setTimeout(() => setScoreFloat(null), 850);
				setWordToast({ id: nextFloatId(), word: currentWord, isReview });
				setBoardFlash(isReview || isBonus ? "gold" : "good");
				window.setTimeout(() => setBoardFlash(null), 480);
				setShowHint(false);

				setLastEaten({ word: currentWord, isReview, stars: newStars });

				if (sfxEnabled) playEatSfx(isReview, nextCombo);
				// Mobil dokunsal geri bildirim: yeme anında minik titreşim
				try {
					navigator.vibrate?.(15);
				} catch { }
				speakWordDetails(
					currentWord.word,
					currentWord.meaningTr,
					currentWord.definition,
					currentWord.example,
					speechMode,
					currentWord.level,
				);

				if (autoPauseOnEat) setGameStatus("paused");

				const { item: nextItem, updatedCursor } = getNextFoodItem(
					newWordCursorRef.current,
					updatedMap,
					eatenTotalRef.current,
					recentUnlearnedIdsRef.current,
					customWordBank,
					filteredPool,
					weakTrainingRef.current ? weakWordsRef.current : [],
					settingsRef.current.repeatFrequency,
				);

				newWordCursorRef.current = updatedCursor;
				const finalItem = maybeBonusMama(nextItem);
				activeFoodRef.current = finalItem;
				setActiveFood(finalItem);

const nextFoodCell = findOpenCell(
					nextSnake,
					eatenTotalRef.current + nextScore * 13,
				);
				// Mıknatıs etkisi: yediğimiz yemeyi yılan başına doğru 1 hücre kaydır
				let magnetFoodCell = nextFoodCell;
				if (isMagnetActive) {
					const fd = Math.abs(nextFoodCell.x - head.x) + Math.abs(nextFoodCell.y - head.y);
					if (fd > 1) {
						const nx = nextFoodCell.x + (head.x > nextFoodCell.x ? 1 : head.x < nextFoodCell.x ? -1 : 0);
						const ny = nextFoodCell.y + (head.y > nextFoodCell.y ? 1 : head.y < nextFoodCell.y ? -1 : 0);
						magnetFoodCell = { x: nx, y: ny };
					}
				}
				foodPointRef.current = magnetFoodCell;
				setFoodPoint(magnetFoodCell);
			}
		};

		// rAF tabanlı döngü: tick'ler tutarlı aralıklarla ateşlenir, kaydırma animasyonuyla senkron kalır
		let rafId = 0;
		let lastTime = performance.now();
		let acc = 0;
		const frame = (now: number) => {
			if (statusRef.current === "playing") {
				acc += now - lastTime;
				if (acc > tickInterval * 4) acc = tickInterval; // arka sekmeye düşünce sıçrama olmasın
				while (acc >= tickInterval && statusRef.current === "playing") {
					acc -= tickInterval;
					doTick();
				}
			} else {
				acc = 0;
			}
			lastTime = now;
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);

		return () => cancelAnimationFrame(rafId);
	}, [
		speed,
		wrapWalls,
		autoPauseOnEat,
		bestScore,
		sfxEnabled,
		speechMode,
		isSlowBerryActive,
		isDoubleXpActive,
		hasShield,
		isMagnetActive,
		extraLives,
		boostRemaining,
		customWordBank,
		filteredPool,
		isBoosting,
		setGameStatus,
		sessionEatenWords.length,
		language,
		addXp,
		isGhostActive,
	]);

	const currentWord = activeFood.word;
	const isCurrentLearned = Boolean(masteryMap[currentWord.id]?.isLearned);
	const statusLabel =
		status === "playing"
			? "OYUNDA"
			: status === "paused"
				? "DURAKLATILDI"
				: status === "over"
					? "BİTTİ"
					: "HAZIR";
	const xpLevel = Math.floor(xp / 100) + 1;

	// Konu/seviye filtresi aktifse ilerleme çubuğu o havuza göre hesaplanır (konu başına kayıt)
	const isPoolFiltered = filteredPool.length < activePool.length;
	const poolTotal = filteredPool.length;
	const poolLearned = filteredPool.filter(
		(w) => masteryMap[w.id]?.isLearned,
	).length;
	const allPoolLearned = poolTotal > 0 && poolLearned === poolTotal;
	// Topic/seviye filtresinin aktif olup olmadığını pool boyutuna göre değil,
	// açıkça "ALL" dışı seçili olup olmadığına bakarak belirle.
	// buildFilteredPool "Eşleşme yoksa" full pool'a geri dönebilir, bu yüzden
	// size karşılaştırması yanlış sonuç verir.
	const topicLevelFilterActive =
		selectedTopic !== "ALL" || selectedLevel !== "ALL";
	const displayTotal = topicLevelFilterActive ? poolTotal : activePool.length;
	const displayLearned = topicLevelFilterActive ? poolLearned : learnedCount;
	const displayPercent = Math.min(
		100,
		Math.round((displayLearned / Math.max(1, displayTotal)) * 100),
	);

	// Oturum takibi: bu havuzda en az bir kez YENEN kelime sayısı (kalıcı, dil bazlı kayıt)
	const poolSeenCount = filteredPool.filter(
		(w) => (masteryMap[w.id]?.timesSeen ?? 0) > 0,
	).length;
	const poolRemaining = Math.max(0, displayTotal - poolSeenCount);
	const elapsedLabel = `${Math.floor(elapsedMs / 60000)}:${String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, "0")}`;

	const achievementStats: AchievementStats = {
		learnedCount,
		level: xpLevel,
		score,
		bestScore,
		maxCombo,
		quizzesCompleted: quizzesCompletedCount,
		customWordsAdded: customWordBank.length,
		streakDays: (() => {
			try {
				return (
					Number(window.localStorage.getItem("snake_abc_daily_streak_v1")) || 0
				);
			} catch {
				return 0;
			}
		})(),
	};

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setShowInstallBanner(false);
			setDeferredPrompt(null);
		}
	};

	return (
		<main
			className={`min-h-screen overflow-x-hidden bg-[#17112e] px-3 py-3 text-[#fff7e8] sm:px-5 sm:py-5 ${crtMode ? "crt-overlay" : ""}`}
		>
			<div className="arcade-stars" aria-hidden="true" />

			<div className="relative mx-auto flex max-w-[1280px] flex-col lg:block">
				{/* Header - responsive compact for mobile */}
				<header className="order-1 mb-2 flex flex-wrap items-center justify-between gap-1 border-b border-white/10 pb-1">
					<div className="hidden items-center gap-1.5 sm:flex">
						<div className="pixel-mark" aria-hidden="true">
							<span />
						</div>
						<div className="leading-tight">
							<p className="font-pixel text-[9px] tracking-[0.22em] text-[#ffd96d]">
								SNAKE ABC 3000
							</p>
							<p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
								Story • A1-C2
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-0.5">
						<div className="flex items-center gap-0.5 rounded-lg border border-white/15 bg-white/5 p-0.5">
							<button
								type="button"
								onClick={() => switchLanguage("en")}
								className={`rounded-md px-1 py-0.5 text-[9px] font-black ${language === "en" ? "bg-[#99f5c3] text-[#17112e]" : "text-white/60"}`}
							>
								🇬🇧 EN
							</button>
							<button
								type="button"
								onClick={() => switchLanguage("ru")}
								className={`rounded-md px-1 py-0.5 text-[9px] font-black ${language === "ru" ? "bg-[#ff9ebb] text-[#330012]" : "text-white/60"}`}
							>
								🇷🇺 RU
							</button>
						</div>
						<button
							type="button"
							onClick={() => setIsWordOfDayOpen(true)}
							className="rounded-lg border border-[#99f5c3]/30 bg-[#99f5c3]/10 px-1 py-0.5 text-[9px] font-bold text-[#99f5c3]"
						>
							🌟 Günlük
						</button>
						<button
							type="button"
							onClick={() => setIsAchievementsOpen(true)}
							className="rounded-lg border border-[#ffd96d]/30 bg-[#ffd96d]/10 px-1 py-0.5 text-[9px] font-bold text-[#ffd96d]"
						>
							🏆 Rozet
						</button>
						<button
							type="button"
							onClick={() => setIsLibraryOpen(true)}
							className="rounded-lg border border-white/15 bg-white/5 px-1 py-0.5 text-[9px] font-bold text-white/80"
						>
							📖 {learnedCount}/{activePool.length}
						</button>
						<button
							type="button"
							onClick={() => setIsStatsOpen(true)}
							className="rounded-lg border border-[#a0c4ff]/30 bg-[#a0c4ff]/10 px-1 py-0.5 text-[9px] font-bold text-[#a0c4ff]"
							title={`${xp} XP • ${xp % 100}/100`}
						>
							⚡ Lv{xpLevel}
						</button>
						<button
							type="button"
							onClick={() => setIsSettingsOpen(true)}
							className="rounded-lg border border-white/15 bg-white/5 px-1 py-0.5 text-[9px] font-bold text-white/80"
							title="Ayarlar"
						>
							⚙️ Ayarlar
						</button>
					</div>
				</header>

				{/* PWA Install Banner */}
				{showInstallBanner && (
					<div className="order-2 mb-3 animate-pop flex items-center justify-between gap-3 rounded-xl border border-[#99f5c3]/40 bg-[#99f5c3]/15 px-4 py-2.5">
						<div className="flex items-center gap-2">
							<span className="text-xl">📲</span>
							<div className="leading-tight">
								<p className="font-pixel text-[11px] font-bold text-white">
									UYGULAMA OLARAK YÜKLE
								</p>
								<p className="text-[11px] text-white/70">
									Telefonuna indir, tek dokunuşla aç, internet olmadan oyna!
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleInstall}
								type="button"
								className="rounded-lg bg-[#99f5c3] px-3 py-1.5 text-xs font-black text-[#17112e]"
							>
								YÜKLE
							</button>
							<button
								onClick={() => setShowInstallBanner(false)}
								type="button"
								className="text-white/50"
							>
								✕
							</button>
						</div>
					</div>
				)}

				{/* Daily Goal */}
				<div className="order-5 mb-2">
					<DailyGoalBar learnedCount={learnedCount} />
				</div>

				{/* Top Controls - simplified for story */}
				<div className="order-4 mb-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#241743] p-1">
					<div className="flex items-center gap-1 text-[10px]">
						<span className="text-white/50">Hız:</span>
						<button
							type="button"
							onClick={() => setSpeed("slow")}
							className={`rounded px-1 py-0.5 font-bold ${speed === "slow" ? "bg-[#99f5c3] text-[#17112e]" : "bg-white/10 text-white/60"}`}
						>
							Yavaş
						</button>
						<button
							type="button"
							onClick={() => setSpeed("normal")}
							className={`rounded px-1 py-0.5 font-bold ${speed === "normal" ? "bg-[#ffd96d] text-[#17112e]" : "bg-white/10 text-white/60"}`}
						>
							Orta
						</button>
						<button
							type="button"
							onClick={() => setSpeed("fast")}
							className={`rounded px-1 py-0.5 font-bold ${speed === "fast" ? "bg-[#ff84ad] text-[#17112e]" : "bg-white/10 text-white/60"}`}
						>
							Hızlı
						</button>
					</div>
					<div className="ml-auto flex items-center gap-1">
						<button
							type="button"
							onClick={() => setWrapWalls(!wrapWalls)}
							className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${wrapWalls ? "bg-[#75d9a6]/20 text-[#75d9a6] border border-[#75d9a6]/30" : "bg-white/10 text-white/50"}`}
						>
							{wrapWalls ? "🌀 Sınırsız" : "🧱 Duvarlı"}
						</button>
						<button
							type="button"
							onClick={() => setCrtMode(!crtMode)}
							className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${crtMode ? "bg-[#ff9ebb] text-[#330012]" : "bg-white/10 text-white/50"}`}
						>
							📺 CRT
						</button>
					</div>
				</div>

				{/* MAIN - Story layout: mobile first, then desktop side-by-side */}
				<div className="order-3 flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
					{/* Left/Center - Story Phone Frame */}
					<div className="w-full max-w-[420px] flex-none">
						{/* Mobile Speed Controls - Above game board */}
						<div className="mb-2 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#241743] p-1 sm:hidden">
							<span className="text-[9px] text-white/50">Hız:</span>
							<button
								type="button"
								onClick={() => setSpeed("slow")}
								className={`rounded px-2 py-0.5 text-[9px] font-bold ${speed === "slow" ? "bg-[#99f5c3] text-[#17112e]" : "bg-white/10 text-white/60"}`}
							>
								Yavaş
							</button>
							<button
								type="button"
								onClick={() => setSpeed("normal")}
								className={`rounded px-2 py-0.5 text-[9px] font-bold ${speed === "normal" ? "bg-[#ffd96d] text-[#17112e]" : "bg-white/10 text-white/60"}`}
							>
								Orta
							</button>
							<button
								type="button"
								onClick={() => setSpeed("fast")}
								className={`rounded px-2 py-0.5 text-[9px] font-bold ${speed === "fast" ? "bg-[#ff84ad] text-[#17112e]" : "bg-white/10 text-white/60"}`}
							>
								Hızlı
							</button>
						</div>
						<div ref={frameRef} className="story-frame">
							<div className="arcade-bezel story-bezel relative overflow-hidden">
								{showComboBanner && (
									<div className="absolute top-10 left-1/2 z-20 -translate-x-1/2 animate-pop rounded-xl border-2 border-[#ffd96d] bg-[#ffd96d] px-3 py-1 font-pixel text-xs font-black text-[#21123a] shadow-xl">
										🔥 COMBO x{comboStreak}!
									</div>
								)}

								<div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#302052] px-3 py-2">
									<div className="flex items-center gap-1.5">
										<span className={`status-light status-${status}`} />
										<span className="font-pixel text-[9px] tracking-wider text-[#ffe99f] truncate max-w-[120px]">
											{currentWord.level} • {currentWord.topic}
										</span>
									</div>
									<div className="flex items-center gap-2">
										{hasShield && <span className="text-[10px]">🛡️</span>}
										{isDoubleXpActive && (
											<span className="text-[10px]">💎 x2</span>
										)}
										{isSlowBerryActive && (
											<span className="text-[10px]">🐢</span>
										)}
										{isMagnetActive && <span className="text-[10px]">🧲</span>}
										{isGhostActive && <span className="text-[10px]">👻</span>}
										{isSpotlightActive && (
											<span className="text-[10px]">🔦</span>
										)}
										{extraLives > 0 && (
											<span className="text-[10px]">❤️ x{extraLives}</span>
										)}
										{boostRemaining > 0 && (
											<span className="text-[10px]">✨ x{boostRemaining}</span>
										)}
										<span className="font-pixel text-[8px] text-white/50">
											{statusLabel}
										</span>
									</div>
								</div>
								{/* Word Progress Indicator */}
								<div className="flex shrink-0 flex-col border-b border-white/10 bg-[#241743] px-3 py-2">
									<div className="flex items-center justify-between mb-1.5">
										<div className="flex items-center gap-2">
											<span className="font-pixel text-[10px] font-bold text-white/90">
												📚 {selectedTopic === "ALL" ? "Tüm Konular" : selectedTopic}
											</span>
											{selectedLevel !== "ALL" && (
												<span className="font-pixel text-[10px] font-bold text-[#99f5c3]">
													{selectedLevel}
												</span>
											)}
										</div>
										<div className="flex items-center gap-1">
											<span className="font-pixel text-[10px] font-bold text-[#ffd96d]">
												{sessionEatenWords.length}
											</span>
											<span className="font-pixel text-[10px] text-white/60">
												/
											</span>
											<span className="font-pixel text-[10px] font-bold text-white/70">
												{displayTotal}
											</span>
										</div>
									</div>
									{/* Progress Bar */}
									<div className="flex items-center gap-2">
										<div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-[#99f5c3] to-[#ffd96d] transition-all duration-300"
												style={{ width: `${Math.min(100, (sessionEatenWords.length / displayTotal) * 100)}%` }}
											/>
										</div>
										<span className="font-pixel text-[9px] font-bold text-[#ff84ad] whitespace-nowrap">
											{Math.max(0, displayTotal - sessionEatenWords.length)} kaldı
										</span>
									</div>
									{/* Last Eaten Word */}
									{lastEaten && (
										<div className="mt-2 flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1.5">
											<span className="font-pixel text-[8px] text-white/50">Son:</span>
											<span className="font-pixel text-[9px] font-bold text-[#99f5c3]">
												{lastEaten.word.word}
											</span>
											<span className="font-pixel text-[8px] text-white/60">
												{lastEaten.word.meaningTr.split(" /")[0].split(" (")[0].slice(0, 15)}
											</span>
											{lastEaten.stars > 0 && (
												<span className="font-pixel text-[8px] text-[#ffd96d]">
													{"⭐".repeat(lastEaten.stars)}
												</span>
											)}
										</div>
									)}
								</div>

								<div
									ref={boardRef}
									onTouchStart={handleBoardTouchStart}
									onTouchEnd={handleBoardTouchEnd}
									className={`game-board story-board ${isSpotlightActive ? "spotlight-on" : ""}`}
									style={
										{
											"--columns": COLUMNS,
											"--rows": ROWS,
										} as React.CSSProperties
									}
								>
									{boardFlash && (
										<div className={`board-flash ${boardFlash}`} />
									)}
									{scoreFloat && (
										<div key={scoreFloat.id} className="score-float">
											{scoreFloat.text}
										</div>
									)}
									{wordToast && (
										<div key={wordToast.id} className="word-toast">
											<span
												className={`word-toast-word ${wordToast.isReview ? "text-[#ffe9a0]" : ""}`}
											>
												{wordToast.word.word}
											</span>
											<span className="word-toast-meaning">
												🇹🇷{" "}
												{wordToast.word.meaningTr
													.split(" /")[0]
													.split(" (")[0]
													.slice(0, 18)}
											</span>
										</div>
									)}
									{/* Kaydırma katmanı: 576 hücre yerine slot'lar, her tick'te transform ile kayarak hareket eder */}
									<div className="board-layer">
										{/* 🐀 Fare delikleri: köşelerden görünen oyuklar (en alt katman) */}
										{MOUSE_HOLES.map((hole) => (
											<div
												key={`hole-${hole.x}-${hole.y}`}
												className="snake-slot"
												style={{
													transform: `translate(${hole.x * 100}%, ${hole.y * 100}%)`,
												}}
											>
												<div className="absolute inset-0 z-0 flex items-center justify-center mouse-hole">
													🕳️
												</div>
											</div>
										))}
										{/* Koşan fare: hedef yöne göre yüzünü çevirir */}
										{mouse && (
											<div
												className="snake-slot"
												style={{
													transform: `translate(${mouse.pos.x * 100}%, ${mouse.pos.y * 100}%)`,
												}}
											>
												<div
													className={`absolute inset-0 z-[4] flex items-center justify-center mouse-running ${mouse.pos.x < mouse.target.x ? "mouse-facing-right" : "mouse-facing-left"}`}
												>
													🐀
												</div>
											</div>
										)}
										{snake.map((segment, index) => {
											const prev = prevSnakeRef.current[index];
											// Nokia-style thin square orientation
											let segOrientation: "h" | "v" = "h";
											if (index === 0) {
												const d = directionRef.current;
												segOrientation =
													d === "left" || d === "right" ? "h" : "v";
											} else {
												const prevSeg = snake[index - 1];
												segOrientation = prevSeg.x !== segment.x ? "h" : "v";
											}
											// Duvar sarımı (teleport) anında atlamalı; normalde kayma animasyonu
											const teleported =
												prev &&
												(Math.abs(segment.x - prev.x) > 1 ||
													Math.abs(segment.y - prev.y) > 1);
											return (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: slot'lar görsel olarak özdeştir; index key'i kaydırma animasyonu için zorunludur (konum key'i her tick'te remount eder, transform transition çalışmaz)
													key={`snake-${index}`}
													className="snake-slot"
													style={{
														transform: `translate(${segment.x * 100}%, ${segment.y * 100}%)`,
														transitionDuration: teleported ? "0ms" : undefined,
													}}
												>
													<div
														className={
															index === 0
																? `snake-head ${segOrientation} snake-${directionRef.current}${hasShield ? " has-shield" : ""}${isGhostActive ? " ghost-mode" : ""}`
																: `snake-segment ${segOrientation}`
														}
														style={{
															backgroundColor:
																index === 0
																	? currentSkin.headBg
																	: currentSkin.bodyBg,
														}}
													>
														{index === 0 && (
															<>
																<b
																	className="eye eye-one"
																	style={{
																		backgroundColor: currentSkin.eyeColor,
																	}}
																/>
																<b
																	className="eye eye-two"
																	style={{
																		backgroundColor: currentSkin.eyeColor,
																	}}
																/>
																{currentSkin.hatEmoji && (
																	<span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px]">
																		{currentSkin.hatEmoji}
																	</span>
																)}
															</>
														)}
													</div>
												</div>
											);
										})}
										{powerUpOnGrid && (
											<div
												className="snake-slot"
												style={{
													transform: `translate(${powerUpOnGrid.point.x * 100}%, ${powerUpOnGrid.point.y * 100}%)`,
												}}
											>
												<div className="absolute inset-0 flex items-center justify-center text-base animate-bounce z-10">
													{powerUpOnGrid.emoji}
												</div>
											</div>
										)}
										<div
											className="snake-slot"
											style={{
												transform: `translate(${foodPoint.x * 100}%, ${foodPoint.y * 100}%)`,
											}}
										>
											<div
												className={`word-treat ${activeFood.isReview ? "review-treat" : ""} ${activeFood.isBonus ? "bonus-treat" : ""} ${isSpotlightActive ? "treat-glow" : ""}`}
											>
												<span
													className={`treat-emoji ${isSpotlightActive ? "treat-emoji-spot" : ""}`}
												>
													{activeFood.isReview
														? "🐹"
														: activeFood.isBonus
															? "🍎"
															: "🐭"}
												</span>
											</div>
										</div>
									</div>
									{status === "ready" && (
										<div className="board-message">
											<span>
												{allPoolLearned ? "🎉 HEPSİ ÖĞRENİLDİ!" : "BAŞLA"}
											</span>
											<small>
												{allPoolLearned
													? isPoolFiltered
														? "Bu konuyu bitirdin! Yeni konu seç ve devam et"
														: "Tüm kelimeleri öğrendin, kelime ustasısın!"
													: "Ok tuşu / kaydır"}
											</small>
										</div>
									)}
									{status === "paused" && (
										<div className="board-message">
											<span>DURDURULDU</span>
											<small>Boşlukla devam</small>
										</div>
									)}
									{status === "over" && (
										<div className="board-message">
											<span>BİTTİ</span>
											<div className="flex gap-2 mt-2">
												<button
													onClick={() => setIsStatsOpen(true)}
													type="button"
												>
													📊 Rapor
												</button>
												<button onClick={resetGame} type="button">
													Yeniden
												</button>
											</div>
										</div>
									)}
									{levelUpBanner !== null && (
										<div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
											<div className="animate-pop rounded-2xl border-2 border-[#ffd96d] bg-[#21123a]/95 px-6 py-4 text-center shadow-2xl">
												<p className="font-pixel text-[10px] tracking-widest text-[#ffd96d]">
													SEVİYE ATLADIN!
												</p>
												<p className="mt-1 font-pixel text-3xl font-black text-white">
													⚡ Lv {levelUpBanner}
												</p>
												<p className="mt-1 text-[11px] text-white/60">
													Her 100 XP yeni seviye • Devam et!
												</p>
											</div>
										</div>
									)}
								</div>

								<div className="flex shrink-0 items-center justify-between bg-[#302052] px-3 py-2">
									<p className="font-pixel text-[9px] text-white/60">
										SKOR{" "}
										<strong className="text-[#99f5c3] ml-1">
											{String(score).padStart(3, "0")}
										</strong>
									</p>
									{mouseCount > 0 && (
										<p className="font-pixel text-[9px] text-[#c9a2ff]">
											🐀 ×{mouseCount}
										</p>
									)}
									{score >= 100 && (
										<p className="font-pixel text-[9px] text-[#a0c4ff] animate-pulse">
											⚡ SEVİYE {Math.min(10, Math.floor(score / 100) + 1)}
										</p>
									)}
									{isBoosting && (
										<span className="font-pixel text-[9px] text-[#ff84ad] animate-pulse">
											⚡ HIZLI
										</span>
									)}
									{comboStreak > 1 && (
										<p className="font-pixel text-[9px] text-[#ffd96d] animate-pulse">
											🔥 x{comboStreak}
										</p>
									)}
									<p className="font-pixel text-[9px] text-white/40">
										REKOR {String(bestScore).padStart(3, "0")}
									</p>
									<button
										onClick={() =>
											status === "playing"
												? setGameStatus("paused")
												: startGame()
										}
										type="button"
										className="pause-button !py-1 !px-2 !text-[10px]"
									>
										{status === "playing" ? "Durdur" : "Başlat"}
									</button>
								</div>
							</div>

							<ArcadeControls
								onDirectionChange={changeDirection}
								onPauseToggle={() =>
									status === "playing" ? setGameStatus("paused") : startGame()
								}
								isPlaying={status === "playing"}
								isBoosting={isBoosting}
								onBoostStart={() => setIsBoosting(true)}
								onBoostEnd={() => setIsBoosting(false)}
							/>

							<div className="mt-1 flex flex-nowrap shrink-0 justify-start gap-0.5 overflow-x-auto topic-scroll px-0.5">
								<button
									onClick={() => setIsTopicsOpen(true)}
									type="button"
									className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${selectedTopic !== "ALL" || selectedLevel !== "ALL" ? "bg-[#ffd96d]/20 text-[#ffd96d] border border-[#ffd96d]/40" : "bg-white/10 text-white/70"}`}
								>
									📌 {selectedTopic !== "ALL" ? selectedTopic : "Konu"}
									{selectedLevel !== "ALL" ? ` • ${selectedLevel}` : ""}
								</button>
								<button
									onClick={toggleWeakTraining}
									type="button"
									className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${weakTraining ? "bg-[#ff84ad]/25 text-[#ff84ad] border border-[#ff84ad]/50" : "bg-white/10 text-white/70"}`}
									title="Hata defterine düşen zayıf kelimelerle özel antrenman"
								>
									{weakTraining ? "⚠️ Zayıf AÇIK" : "⚠️ Zayıf"}
								</button>
								<button
									onClick={() => setIsSkinsOpen(true)}
									type="button"
									className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/70"
								>
									{currentSkin.hatEmoji} Kostüm
								</button>
								<button
									onClick={() => setIsWheelOpen(true)}
									type="button"
									className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/70"
								>
									🎰 Çark
								</button>
								<button
									onClick={() => setIsCustomWordsOpen(true)}
									type="button"
									className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/70"
								>
									✍️ Özel
								</button>
								<span
									className="hidden self-center rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold text-white/40 select-none sm:inline-block"
									title="Uygulama sürümü"
								>
									v1.5
								</span>
							</div>
						</div>
					</div>

					{/* Right - Word Detail & Progress - responsive */}
					<div className="w-full max-w-[520px] flex-1 lg:max-w-[480px]">
						<div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#241743] p-2.5 text-[11px]">
							<span className="font-pixel text-[10px] text-[#99f5c3]">
								SEVİYE FİLTRE:
							</span>
							<div className="flex gap-1">
								{(["ALL", "A1", "A2", "B1", "B2", "C1", "C2"] as const).map(
									(lvl) => (
										<button
											key={lvl}
											type="button"
											onClick={() => selectPool(selectedTopic, lvl)}
											className={`rounded px-1.5 py-0.5 font-pixel text-[10px] font-bold ${selectedLevel === lvl ? "bg-[#ffd96d] text-[#21123a]" : "bg-white/10 text-white/60"}`}
										>
											{lvl}
										</button>
									),
								)}
							</div>
						</div>

						{/* Oyun takibi: Toplam / Yenen / Kalan + tekrar frekansı + süre */}
						<div className="mb-3 rounded-xl border border-white/10 bg-[#241743] p-2.5 text-[11px]">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<span className="font-pixel text-[9px] tracking-widest text-[#ffd96d]">
									🐭 OYUN TAKİBİ
								</span>
								<span>
									<strong className="text-white">{poolSeenCount}</strong>{" "}
									<span className="text-white/50">Yenen</span>
								</span>
								<span className="text-white/30">/</span>
								<span>
									<strong className="text-white">{displayTotal}</strong>{" "}
									<span className="text-white/50">Toplam</span>
								</span>
								<span className="ml-auto font-bold text-[#ff9ebb]">
									Kalan {poolRemaining}
								</span>
							</div>
							<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
								<span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
									🔁 x{repeatFrequency}
								</span>
								<span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
									⏱️ {elapsedLabel}
								</span>
								{isGhostActive && (
									<span className="rounded bg-[#a78bfa]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#c4b5fd]">
										👻 Hayalet
									</span>
								)}
								{isSpotlightActive && (
									<span className="rounded bg-[#fbbf24]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#fcd34d]">
										🔦 İpucu Işığı
									</span>
								)}
							</div>
						</div>

						{/* Güçler: kutuyu ye → şarj birikir, tıkla → kullanılır */}
						<div className="mb-3 rounded-xl border border-[#99f5c3]/25 bg-[#1d1138] p-2.5">
							<div className="flex items-center justify-between">
								<p className="font-pixel text-[9px] tracking-widest text-[#99f5c3]">
									⚡ GÜÇLER
								</p>
								<p className="text-[9px] text-white/40">
									Kutu ye, şarj kazan, tıkla kullan
								</p>
							</div>
							<div className="mt-2 grid grid-cols-4 gap-1.5">
								{POWER_DEFS.map((power) => {
									const powerCount = charges[power.key] ?? 0;
									const powerUntil = powerExpiry[power.key] ?? 0;
									const powerActive = powerUntil > nowMs;
									const leftSec = powerActive
										? Math.max(1, Math.ceil((powerUntil - nowMs) / 1000))
										: 0;
									return (
										<button
											key={power.key}
											type="button"
											onClick={() => activatePower(power.key)}
											disabled={powerCount <= 0 && !powerActive}
											title={`${power.name}: ${power.desc}`}
											className={`relative flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 text-center transition-all ${powerCount > 0 || powerActive
												? "cursor-pointer border-[#99f5c3]/40 bg-[#99f5c3]/10 hover:bg-[#99f5c3]/20"
												: "cursor-not-allowed border-white/10 bg-white/[0.03] opacity-50"
												}`}
										>
											<span className="text-sm leading-none">
												{power.emoji}
											</span>
											<span className="text-[8px] font-bold leading-none text-white/70">
												{power.name}
											</span>
											<span
												className={`absolute -top-1.5 -right-1 rounded-full px-1 text-[8px] font-black ${powerActive ? "bg-[#ffd96d] text-[#17112e]" : powerCount > 0 ? "bg-[#99f5c3] text-[#17112e]" : "bg-white/10 text-white/40"}`}
											>
												{powerActive ? `${leftSec}sn` : powerCount}
											</span>
										</button>
									);
								})}
							</div>
							<div className="mt-2 flex items-center gap-1.5">
								<span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
									❤️ Can x{extraLives}
								</span>
								<span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
									✨ Boost x{boostRemaining}
								</span>
								<span className="ml-auto text-[9px] text-white/40">
									Pasif: yiyince anında
								</span>
							</div>
						</div>

						<div className="rounded-2xl border-2 border-[#ffd96d]/35 bg-[#251745] p-4 shadow-lg">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-1.5">
										<span className="font-pixel text-[9px] tracking-widest text-[#99f5c3]">
											HEDEF MAMA
										</span>
										{activeFood.isReview && (
											<span className="rounded bg-[#ffd96d] px-1.5 py-0.5 font-pixel text-[8px] font-black text-[#21123a]">
												⭐ TEKRAR
											</span>
										)}
										{isCurrentLearned && (
											<span className="rounded bg-[#75d9a6] px-1.5 py-0.5 font-pixel text-[8px] font-black text-[#112d1e]">
												ÖĞRENDİM - ASLA ÇIKMAZ
											</span>
										)}
									</div>
									<h2 className="mt-1 truncate font-pixel text-2xl font-extrabold text-white">
										{currentWord.word}
									</h2>
									<p className="mt-0.5 truncate font-pixel text-lg font-extrabold text-[#ffd96d]">
										🇹🇷 {currentWord.meaningTr}
									</p>
								</div>
								<span className="level-badge shrink-0">
									{currentWord.level}
								</span>
							</div>

							<div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
								<span className="truncate">
									{currentWord.phonetic} • {currentWord.pos}
								</span>
								<span className="shrink-0 ml-2">{currentWord.topic}</span>
							</div>

							<div className="mt-3 rounded-xl border border-white/10 bg-[#1a0f33] p-3">
								<p className="text-[10px] font-bold uppercase text-[#99f5c3]">
									İNGİLİZCE TANIM:
								</p>
								<p className="mt-0.5 text-xs leading-5 text-white/90">
									{currentWord.definition}
								</p>
								<p className="mt-2 text-[10px] font-bold uppercase text-[#ffd96d]">
									ÖRNEK:
								</p>
								<p className="mt-0.5 text-xs italic leading-4 text-white/70">
									"{currentWord.example}"
								</p>
							</div>

							<div className="mt-3 flex flex-col gap-2">
								<div className="flex gap-2">
									<button
										onClick={toggleLearnedCurrentTarget}
										type="button"
										className={`flex-1 rounded-lg py-2 text-xs font-black transition-colors ${isCurrentLearned ? "bg-[#ff9ebb] text-[#330012] border border-[#ff9ebb]" : "bg-[#75d9a6] text-[#112d1e]"}`}
									>
										{isCurrentLearned
											? "Unuttum 🔁 Geri Getir"
											: "Öğrendim ✔️ Asla Gösterme"}
									</button>
									<button
										onClick={() => {
											speakWordDetails(
												currentWord.word,
												currentWord.meaningTr,
												currentWord.definition,
												currentWord.example,
												speechMode,
												currentWord.level,
											);
											setWordToast({
												id: nextFloatId(),
												word: currentWord,
												isReview: activeFood.isReview,
											});
										}}
										type="button"
										className="rounded-lg bg-[#99f5c3] px-3 py-2 text-xs font-black text-[#17112e]"
									>
										🔊 Dinle
									</button>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => setIsMicOpen(true)}
										type="button"
										className="flex-1 rounded-lg border border-[#ff84ad]/30 bg-[#ff84ad]/10 py-1.5 text-[11px] font-bold text-[#ff84ad]"
									>
										🎙️ Telaffuz Dene
									</button>
									<button
										onClick={() => setShowHint((v) => !v)}
										type="button"
										className="flex-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-bold text-white/70"
									>
										💡 {showHint ? "Gizle" : "İpucu"}
									</button>
								</div>
								{showHint && (
									<div className="hint-bubble rounded-lg border border-[#ffd96d]/30 bg-[#ffd96d]/10 p-2.5 text-xs text-[#ffe9a8]">
										<p>
											🔤 İlk harf:{" "}
											<strong className="text-white">
												{currentWord.word.charAt(0).toUpperCase()}
											</strong>{" "}
											• Harf: {currentWord.word.replace(/\s/g, "").length}
										</p>
										<p className="mt-1">
											🧩{" "}
											{currentWord.word.charAt(0).toUpperCase() +
												currentWord.word.slice(1).replace(/[a-zA-Z]/g, "•")}
										</p>
									</div>
								)}
							</div>

							<div className="mt-4 h-px bg-white/10" />

							<div className="mt-3">
								<div className="flex items-end justify-between">
									<div>
										<p className="font-pixel text-[9px] tracking-widest text-[#ffd96d]">
											{isPoolFiltered
												? "BU KONUDAKİ İLERLEME"
												: "3000 KELİME İLERLEME"}
										</p>
										<p className="mt-0.5 text-xs text-white/60">
											<strong className="text-white">{displayLearned}</strong> /{" "}
											{displayTotal}{" "}
											{isPoolFiltered
												? "bu konuda Öğrendim (asla çıkmaz)"
												: "Öğrendim (asla çıkmaz)"}
										</p>
									</div>
									<span className="font-pixel text-[11px] font-bold text-[#99f5c3]">
										{displayPercent}%
									</span>
								</div>
								<div className="journey-track mt-2">
									<span
										style={{
											width: `${Math.max(displayPercent, displayLearned ? 1 : 0)}%`,
										}}
									/>
								</div>
								{allPoolLearned && (
									<p className="mt-1.5 text-[11px] font-bold text-[#ffd96d]">
										🏆{" "}
										{isPoolFiltered
											? "Bu konuyu tamamen bitirdin! Yeni bir konu seçerek devam et."
											: "Muhteşem! Tüm kelimeleri öğrendin. Artık resmi bir kelime ustasısın!"}
									</p>
								)}
								<p className="mt-1.5 text-[10px] leading-4 text-white/50">
									💡 Öğrendim yaptığın kelime,{" "}
									<strong className="text-white/80">Unuttum 🔁</strong> diyene
									kadar oyunda, çarkta ve tüm havuzda bir daha asla karşına
									çıkmaz. Tam kalıcı öğrenme!
								</p>
								{isPoolFiltered && (
									<p className="mt-1.5 text-[10px] leading-4 text-white/50">
										📌{" "}
										{selectedTopic !== "ALL"
											? `"${selectedTopic}" konusu`
											: "Seçili seviye"}{" "}
										etkin — seçimi değiştirmek için üstteki{" "}
										<strong className="text-white/80">📌 Konu</strong> butonunu
										kullan.
									</p>
								)}
							</div>

							{lastEaten && (
								<div className="learned-note mt-4 animate-pop">
									<div className="flex items-center justify-between">
										<p className="font-pixel text-[8px] tracking-widest text-[#ffd96d]">
											{lastEaten.isReview
												? "⭐ TEKRAR YENDİ!"
												: "✨ YENİ YENDİ!"}
										</p>
										<span className="text-xs text-[#ffd96d]">
											{"★".repeat(lastEaten.stars)}
											{"☆".repeat(5 - lastEaten.stars)}
										</span>
									</div>
									<div className="mt-1 flex items-center justify-between gap-2">
										<div className="min-w-0">
											<span className="font-pixel text-base font-bold text-white truncate">
												{lastEaten.word.word}
											</span>
											<span className="ml-2 text-xs font-bold text-[#ffd96d] truncate">
												🇹🇷 {lastEaten.word.meaningTr.split(" /")[0]}
											</span>
										</div>
										<button
											onClick={() => {
												speakWordDetails(
													lastEaten.word.word,
													lastEaten.word.meaningTr,
													lastEaten.word.definition,
													lastEaten.word.example,
													speechMode,
													lastEaten.word.level,
												);
												setWordToast({
													id: nextFloatId(),
													word: lastEaten.word,
													isReview: lastEaten.isReview,
												});
											}}
											type="button"
											className="mini-hear shrink-0"
										>
											Dinle
										</button>
									</div>
								</div>
							)}
						</div>

						<div className="mt-3 rounded-xl bg-[#1a0f33]/60 p-3 text-[11px] text-white/60 leading-5 border border-white/5">
							<p className="font-pixel text-[10px] text-white/80">
								📲 VERCEL & MOBİL KURULUM
							</p>
							<p className="mt-1">
								1) Vercel'e yükle → Deploy → Linki al. 2) Telefonda linki Chrome
								ile aç → Üstteki <strong>📲 YÜKLE</strong> butonuna bas veya
								Chrome menü → <em>Ana Ekrana Ekle</em>. Oyun uygulama gibi
								çalışır, offline bile oynanır!
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Modals */}
			<WordLibraryModal
				isOpen={isLibraryOpen}
				onClose={() => setIsLibraryOpen(false)}
				words={activePool}
				masteryMap={masteryMap}
				onMasteryChange={(m) => setMasteryMap(m)}
				speechMode={speechMode}
				language={language}
			/>
			<SkinsModal
				isOpen={isSkinsOpen}
				onClose={() => setIsSkinsOpen(false)}
				learnedCount={learnedCount}
				activeSkinId={activeSkinId}
				onSelectSkin={(id) => {
					setActiveSkinId(id);
					setIsSkinsOpen(false);
				}}
			/>
			<TopicsModal
				isOpen={isTopicsOpen}
				onClose={() => setIsTopicsOpen(false)}
				words={activePool}
				selectedTopic={selectedTopic}
				selectedLevel={selectedLevel}
				onSelectTopic={(t) => selectPool(t, selectedLevel)}
				onSelectLevel={(l) => selectPool(selectedTopic, l)}
				masteryMap={masteryMap}
			/>
			<AchievementsModal
				isOpen={isAchievementsOpen}
				onClose={() => setIsAchievementsOpen(false)}
				stats={achievementStats}
			/>
			<CustomWordsModal
				isOpen={isCustomWordsOpen}
				onClose={() => setIsCustomWordsOpen(false)}
				customWords={customWordBank}
				onRemoveCustomWords={(id) => {
					setCustomWordsBank((p) => p.filter((w) => w.id !== id));
				}}
				onAddCustomWords={(nw) => {
					setCustomWordsBank((p) => [...nw, ...p]);
					setIsCustomWordsOpen(false);
				}}
				language={language}
			/>
			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				settings={settings}
				onSettingsChange={(patch) =>
					setSettings((prev) => ({ ...prev, ...patch }))
				}
			/>
			<ArcadeWheelModal
				isOpen={isWheelOpen}
				onClose={() => setIsWheelOpen(false)}
				onRewardWon={(pts) => setScore((p) => p + pts)}
			/>
			<MicPracticeModal
				isOpen={isMicOpen}
				onClose={() => setIsMicOpen(false)}
				word={currentWord}
				language={language}
			/>
			<WordOfDayModal
				isOpen={isWordOfDayOpen}
				onClose={() => setIsWordOfDayOpen(false)}
				speechMode={speechMode}
				words={activePool}
			/>
			<QuizModal
				isOpen={isQuizOpen}
				onClose={() => {
					setIsQuizOpen(false);
					setQuizzesCompletedCount((p) => p + 1);
					setIsStatsOpen(true);
				}}
				recentWords={sessionEatenWords}
				language={language}
				onBonusEarned={(b) => {
					setScore((p) => p + b);
					addXp(b);
				}}
				onWordFailed={(id) => {
					const nextMap = recordWordFailure(
						id,
						masteryMapRef.current,
						language,
					);
					masteryMapRef.current = nextMap;
					setMasteryMap(nextMap);
					setDailyLog(addDailyActivity("failed"));
				}}
			/>
			<StatsModal
				isOpen={isStatsOpen}
				onClose={() => setIsStatsOpen(false)}
				sessionScore={score}
				maxCombo={maxCombo}
				sessionWords={sessionEatenWords}
				masteryMap={masteryMap}
				onToggleLearned={(id) =>
					setMasteryMap(toggleWordLearnedState(id, masteryMap, language))
				}
				speechMode={speechMode}
				language={language}
				learnedCount={learnedCount}
				words={activePool}
				dailyLog={dailyLog}
			/>
		</main>
	);
}
