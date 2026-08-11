import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LEARNING_PATH, TOTAL_WORDS, type VocabularyWord, type WordLevel } from "./vocabulary";
import {
  getNextFoodItem,
  getSavedMasteryMap,
  recordWordEaten,
  toggleWordLearnedState,
  type ActiveFoodItem,
  type WordMastery,
} from "./srs";
import {
  playComboSfx,
  playEatSfx,
  playGameOverSfx,
  playLevelUpSfx,
  playTurnSfx,
  speakWordDetails,
  toggleRetroBgm,
  type SpeechMode,
} from "./audio";
import { WordLibraryModal } from "./WordLibraryModal";
import { SkinsModal, SNAKE_SKINS, type SnakeSkinId } from "./components/SkinsModal";
import { QuizModal } from "./components/QuizModal";
import { ArcadeControls } from "./components/ArcadeControls";
import { TopicsModal } from "./components/TopicsModal";
import { StatsModal } from "./components/StatsModal";
import { DailyGoalBar } from "./components/DailyGoalBar";
import { AchievementsModal, type AchievementStats } from "./components/AchievementsModal";
import { CustomWordsModal } from "./components/CustomWordsModal";
import { ArcadeWheelModal } from "./components/ArcadeWheelModal";
import { MicPracticeModal } from "./components/MicPracticeModal";
import { WordOfDayModal } from "./components/WordOfDayModal";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
type GameStatus = "ready" | "playing" | "paused" | "over";
type GameSpeed = "slow" | "normal" | "fast";

type PowerUpType = "turtle" | "diamond" | "shield";
type PowerUpOnGrid = {
  type: PowerUpType;
  point: Point;
  emoji: string;
};

type BossOption = {
  textTr: string;
  isCorrect: boolean;
  point: Point;
};

type BossBattleState = {
  word: VocabularyWord;
  options: BossOption[];
  timeLeftSeconds: number;
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

const isSamePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y;
const isOpposite = (first: Direction, second: Direction) =>
  (first === "up" && second === "down") ||
  (first === "down" && second === "up") ||
  (first === "left" && second === "right") ||
  (first === "right" && second === "left");

function findOpenCell(snake: Point[], seed: number, reservedPoints: Point[] = []): Point {
  for (let attempt = 0; attempt < COLUMNS * ROWS; attempt += 1) {
    const value = (seed * 73 + attempt * 41 + 19) % ((COLUMNS - 2) * (ROWS - 2));
    const point = { x: (value % (COLUMNS - 2)) + 1, y: Math.floor(value / (COLUMNS - 2)) + 1 };
    const hitsSnake = snake.some((s) => isSamePoint(s, point));
    const hitsReserved = reservedPoints.some((r) => isSamePoint(r, point));
    if (!hitsSnake && !hitsReserved) return point;
  }
  return { x: 2, y: 2 };
}

export default function App() {
  const [snake, setSnake] = useState<Point[]>(STARTING_SNAKE);
  const [foodPoint, setFoodPoint] = useState<Point>(() => findOpenCell(STARTING_SNAKE, 1));
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);

  // Speed, CRT & Comfort
  const [speed, setSpeed] = useState<GameSpeed>("slow");
  const [wrapWalls, setWrapWalls] = useState(true);
  const [autoPauseOnEat] = useState(false);
  const [crtMode, setCrtMode] = useState(false);

  // Power-Ups & Buffs
  const [powerUpOnGrid, setPowerUpOnGrid] = useState<PowerUpOnGrid | null>(null);
  const [hasShield, setHasShield] = useState(false);
  const [isDoubleXpActive, setIsDoubleXpActive] = useState(false);
  const [isSlowBerryActive, setIsSlowBerryActive] = useState(false);

  // Boss Battle
  const [bossBattle, setBossBattle] = useState<BossBattleState | null>(null);
  const [bossesDefeated, setBossesDefeated] = useState(0);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string | "ALL">("ALL");
  const [selectedLevel, setSelectedLevel] = useState<WordLevel | "ALL">("ALL");

  // Streak / Combo & Visuals
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showComboBanner, setShowComboBanner] = useState(false);
  const [scoreFloat, setScoreFloat] = useState<{ id: number; text: string } | null>(null);
  const [boardFlash, setBoardFlash] = useState<"good" | "gold" | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Audio - lofi varsayılan açık, odak arttıran
  const [speechMode] = useState<SpeechMode>("word-tr");
  const [sfxEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);

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

  // PWA Install
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Data
  const [customWordBank, setCustomWordsBank] = useState<VocabularyWord[]>([]);
  const [quizzesCompletedCount, setQuizzesCompletedCount] = useState(0);
  const [masteryMap, setMasteryMap] = useState<Record<number, WordMastery>>(() => getSavedMasteryMap());
  const [activeFood, setActiveFood] = useState<ActiveFoodItem>(() => ({
    word: LEARNING_PATH[0],
    isReview: false,
  }));
  const [lastEaten, setLastEaten] = useState<{ word: VocabularyWord; isReview: boolean; stars: number } | null>(null);
  const [sessionEatenWords, setSessionEatenWords] = useState<VocabularyWord[]>([]);
  const [recentUnlearnedIds, setRecentUnlearnedIds] = useState<number[]>([]);

  // Refs
  const snakeRef = useRef<Point[]>(STARTING_SNAKE);
  const foodPointRef = useRef<Point>(foodPoint);
  const powerUpRef = useRef<PowerUpOnGrid | null>(powerUpOnGrid);
  const bossBattleRef = useRef<BossBattleState | null>(bossBattle);
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

  masteryMapRef.current = masteryMap;
  activeFoodRef.current = activeFood;
  powerUpRef.current = powerUpOnGrid;
  bossBattleRef.current = bossBattle;
  recentUnlearnedIdsRef.current = recentUnlearnedIds;

  const currentSkin = SNAKE_SKINS.find((s) => s.id === activeSkinId) || SNAKE_SKINS[0];

  // PWA install prompt listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
    toggleRetroBgm(bgmEnabled && status === "playing");
    return () => toggleRetroBgm(false);
  }, [bgmEnabled, status]);

  const setGameStatus = useCallback((nextStatus: GameStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const startGame = useCallback(() => {
    if (statusRef.current === "over") return;
    setGameStatus("playing");
    setIsWordOfDayOpen(false);
  }, [setGameStatus]);

  const triggerBossBattle = useCallback((targetWord: VocabularyWord) => {
    // never boss with learned word
    if (masteryMapRef.current[targetWord.id]?.isLearned) return;
    const reserved: Point[] = [foodPointRef.current];
    const optionsText = [
      targetWord.meaningTr,
      "Yanlış Anlam A",
      "Yanlış Anlam B",
      "Yanlış Anlam C",
    ].sort(() => (Math.random() > 0.5 ? 1 : -1));

    const bossOptions: BossOption[] = optionsText.map((t, i) => {
      const p = findOpenCell(snakeRef.current, i * 37 + 11, reserved);
      reserved.push(p);
      return {
        textTr: t,
        isCorrect: t === targetWord.meaningTr,
        point: p,
      };
    });

    const newBossState: BossBattleState = {
      word: targetWord,
      options: bossOptions,
      timeLeftSeconds: 15,
    };
    setBossBattle(newBossState);
  }, []);

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
    const { item, updatedCursor } = getNextFoodItem(0, masteryMapRef.current, 0, [], customWordBank);

    newWordCursorRef.current = updatedCursor;
    foodPointRef.current = nextFoodPoint;
    activeFoodRef.current = item;

    setSnake(freshSnake);
    setFoodPoint(nextFoodPoint);
    setActiveFood(item);
    setPowerUpOnGrid(null);
    setBossBattle(null);
    setHasShield(false);
    setIsDoubleXpActive(false);
    setIsSlowBerryActive(false);
    setScore(0);
    setComboStreak(0);
    setMaxCombo(0);
    setLastEaten(null);
    setSessionEatenWords([]);
    setRecentUnlearnedIds([]);
    setShowHint(false);
    setGameStatus("ready");
  }, [customWordBank, setGameStatus]);

  const changeDirection = useCallback(
    (nextDirection: Direction) => {
      if (statusRef.current === "over") return;
      if (!isOpposite(directionRef.current, nextDirection)) {
        if (sfxEnabled && directionRef.current !== nextDirection) playTurnSfx();
        queuedDirectionRef.current = nextDirection;
        if (statusRef.current === "ready" || statusRef.current === "paused") startGame();
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
        else if (statusRef.current === "paused" || statusRef.current === "ready") startGame();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
    const nextMap = toggleWordLearnedState(wordId, masteryMap);
    setMasteryMap(nextMap);
  };

  // Game loop - story speed: slightly slower for vertical readability
  useEffect(() => {
    // Story mod için çok daha yavaş, okumaya odaklı hızlar - kullanıcı isteği: çok çok yavaş
    let tickInterval = speed === "slow" ? 280 : speed === "normal" ? 200 : 135;
    if (isSlowBerryActive) tickInterval += 90;

    const gameLoop = window.setInterval(() => {
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
      const bitesFood = isSamePoint(nextHead, foodPointRef.current);
      const bitesPowerUp = powerUpRef.current && isSamePoint(nextHead, powerUpRef.current.point);
      const currentBoss = bossBattleRef.current;
      const hitBossOption = currentBoss?.options.find((o) => isSamePoint(nextHead, o.point));

      const bodyToCheck = bitesFood || hitBossOption ? oldSnake : oldSnake.slice(0, -1);
      const hitsWall = !wrapWalls && (nextX < 0 || nextX >= COLUMNS || nextY < 0 || nextY >= ROWS);
      const hitsBody = bodyToCheck.some((segment) => isSamePoint(segment, nextHead));

      if (hitsWall || hitsBody) {
        if (hasShield) {
          setHasShield(false);
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
      snakeRef.current = nextSnake;
      setSnake(nextSnake);

      if (hitBossOption && currentBoss) {
        if (hitBossOption.isCorrect) {
          setBossesDefeated((prev) => prev + 1);
          setScore((prev) => prev + 50);
          if (sfxEnabled) playLevelUpSfx();
          speakWordDetails(currentBoss.word.word, currentBoss.word.meaningTr, currentBoss.word.definition, currentBoss.word.example, speechMode);
          setMasteryMap((prev) => toggleWordLearnedState(currentBoss.word.id, prev));
        }
        setBossBattle(null);
      }

      if (bitesPowerUp && powerUpRef.current) {
        const type = powerUpRef.current.type;
        if (type === "turtle") setIsSlowBerryActive(true);
        if (type === "diamond") setIsDoubleXpActive(true);
        if (type === "shield") setHasShield(true);
        if (sfxEnabled) playComboSfx();
        setPowerUpOnGrid(null);
        // temporary buff timeouts
        window.setTimeout(() => {
          setIsSlowBerryActive(false);
          setIsDoubleXpActive(false);
        }, 12000);
      }

      if (bitesFood) {
        const foodItem = activeFoodRef.current;
        const currentWord = foodItem.word;
        const isReview = foodItem.isReview;

        const { updatedMap, newStars } = recordWordEaten(currentWord.id, masteryMapRef.current);
        setMasteryMap(updatedMap);
        masteryMapRef.current = updatedMap;

        if (!isReview) {
          const updatedRecent = [currentWord.id, ...recentUnlearnedIdsRef.current.filter(id => !updatedMap[id]?.isLearned).slice(0, 10)];
          recentUnlearnedIdsRef.current = updatedRecent;
          setRecentUnlearnedIds(updatedRecent);
        }

        setSessionEatenWords((prev) => [currentWord, ...prev.filter((w) => w.id !== currentWord.id)].slice(0, 20));

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

        if (eatenTotalRef.current % 10 === 0) {
          if (sfxEnabled) playLevelUpSfx();
          triggerBossBattle(currentWord);
        }

        if (Math.random() < 0.22 && !powerUpRef.current) {
          const pTypes: PowerUpType[] = ["turtle", "diamond", "shield"];
          const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
          const pEmoji = pType === "turtle" ? "🐢" : pType === "diamond" ? "💎" : "🛡️";
          const pPoint = findOpenCell(nextSnake, eatenTotalRef.current * 19, [foodPointRef.current]);
          setPowerUpOnGrid({ type: pType, point: pPoint, emoji: pEmoji });
        }

        let scorePoints = (isReview ? 5 : 2) * (nextCombo >= 3 ? 2 : 1);
        if (isDoubleXpActive) scorePoints *= 2;

        const nextScore = scoreRef.current + scorePoints;
        scoreRef.current = nextScore;
        setScore(nextScore);

        setScoreFloat({ id: Date.now(), text: `+${scorePoints}` });
        window.setTimeout(() => setScoreFloat(null), 850);
        setBoardFlash(isReview ? "gold" : "good");
        window.setTimeout(() => setBoardFlash(null), 480);
        setShowHint(false);

        setLastEaten({ word: currentWord, isReview, stars: newStars });

        if (sfxEnabled) playEatSfx(isReview, nextCombo);
        speakWordDetails(currentWord.word, currentWord.meaningTr, currentWord.definition, currentWord.example, speechMode);

        if (autoPauseOnEat) setGameStatus("paused");

        const { item: nextItem, updatedCursor } = getNextFoodItem(
          newWordCursorRef.current,
          updatedMap,
          eatenTotalRef.current,
          recentUnlearnedIdsRef.current,
          customWordBank
        );

        newWordCursorRef.current = updatedCursor;
        activeFoodRef.current = nextItem;
        setActiveFood(nextItem);

        const nextFoodCell = findOpenCell(nextSnake, eatenTotalRef.current + nextScore * 13);
        foodPointRef.current = nextFoodCell;
        setFoodPoint(nextFoodCell);
      }
    }, tickInterval);

    return () => window.clearInterval(gameLoop);
  }, [speed, wrapWalls, autoPauseOnEat, bestScore, sfxEnabled, speechMode, isSlowBerryActive, isDoubleXpActive, hasShield, customWordBank, triggerBossBattle, setGameStatus, sessionEatenWords.length]);

  const currentWord = activeFood.word;
  const isCurrentLearned = Boolean(masteryMap[currentWord.id]?.isLearned);
  const statusLabel = status === "playing" ? "OYUNDA" : status === "paused" ? "DURAKLATILDI" : status === "over" ? "BİTTİ" : "HAZIR";
  const progressPercent = Math.min(100, Math.round((learnedCount / TOTAL_WORDS) * 100));

  const achievementStats: AchievementStats = {
    learnedCount,
    score,
    bestScore,
    maxCombo,
    bossesDefeated,
    quizzesCompleted: quizzesCompletedCount,
    customWordsAdded: customWordBank.length,
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
    <main className={`min-h-screen overflow-x-hidden bg-[#17112e] px-3 py-3 text-[#fff7e8] sm:px-5 sm:py-5 ${crtMode ? "crt-overlay" : ""}`}>
      <div className="arcade-stars" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-[1280px] flex-col lg:block">
        {/* Header - responsive compact for mobile */}
        <header className="order-1 mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="pixel-mark" aria-hidden="true"><span /></div>
            <div className="leading-tight">
              <p className="font-pixel text-[10px] tracking-[0.22em] text-[#ffd96d]">SNAKE ABC 3000</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Story • A1-C2 • Öğrendim / Unuttum</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setIsWordOfDayOpen(true)} className="rounded-lg border border-[#99f5c3]/30 bg-[#99f5c3]/10 px-2.5 py-1 text-[11px] font-bold text-[#99f5c3]">🌟 Günlük</button>
            <button type="button" onClick={() => setIsAchievementsOpen(true)} className="rounded-lg border border-[#ffd96d]/30 bg-[#ffd96d]/10 px-2.5 py-1 text-[11px] font-bold text-[#ffd96d]">🏆 Rozet</button>
            <button type="button" onClick={() => setIsLibraryOpen(true)} className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/80">📖 {learnedCount}/{TOTAL_WORDS}</button>
          </div>
        </header>

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="order-2 mb-3 animate-pop flex items-center justify-between gap-3 rounded-xl border border-[#99f5c3]/40 bg-[#99f5c3]/15 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">📲</span>
              <div className="leading-tight">
                <p className="font-pixel text-[11px] font-bold text-white">UYGULAMA OLARAK YÜKLE</p>
                <p className="text-[11px] text-white/70">Telefonuna indir, tek dokunuşla aç, internet olmadan oyna!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleInstall} type="button" className="rounded-lg bg-[#99f5c3] px-3 py-1.5 text-xs font-black text-[#17112e]">YÜKLE</button>
              <button onClick={() => setShowInstallBanner(false)} type="button" className="text-white/50">✕</button>
            </div>
          </div>
        )}

        {/* Daily Goal */}
        <div className="order-5 mb-3">
          <DailyGoalBar learnedCount={learnedCount} />
        </div>

        {/* Top Controls - simplified for story */}
        <div className="order-4 mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#241743] p-2">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-white/50">Hız:</span>
            <button onClick={()=>setSpeed("slow")} className={`rounded px-2 py-0.5 font-bold ${speed==="slow"?"bg-[#99f5c3] text-[#17112e]":"bg-white/10 text-white/60"}`}>Yavaş</button>
            <button onClick={()=>setSpeed("normal")} className={`rounded px-2 py-0.5 font-bold ${speed==="normal"?"bg-[#ffd96d] text-[#17112e]":"bg-white/10 text-white/60"}`}>Orta</button>
            <button onClick={()=>setSpeed("fast")} className={`rounded px-2 py-0.5 font-bold ${speed==="fast"?"bg-[#ff84ad] text-[#17112e]":"bg-white/10 text-white/60"}`}>Hızlı</button>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={()=>setWrapWalls(!wrapWalls)} className={`rounded px-2 py-1 text-[11px] font-bold ${wrapWalls?"bg-[#75d9a6]/20 text-[#75d9a6] border border-[#75d9a6]/30":"bg-white/10 text-white/50"}`}>{wrapWalls?"🌀 Sınırsız":"🧱 Duvarlı"}</button>
            <button onClick={()=>setCrtMode(!crtMode)} className={`rounded px-2 py-1 text-[11px] font-bold ${crtMode?"bg-[#ff9ebb] text-[#330012]":"bg-white/10 text-white/50"}`}>📺 CRT</button>
            <button onClick={()=>setBgmEnabled(!bgmEnabled)} className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold ${bgmEnabled?"bg-[#c77dff] text-[#1a0033]":"bg-white/10 text-white/50"}`}><span>🎵</span>{bgmEnabled && status==="playing"?<span className="eq-bars"><i/><i/><i/></span>:<span>{bgmEnabled?"Açık":"Kapalı"}</span>}</button>
          </div>
        </div>

        {/* MAIN - Story layout: mobile first, then desktop side-by-side */}
        <div className="order-3 flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
          {/* Left/Center - Story Phone Frame */}
          <div className="w-full max-w-[400px] flex-none">
            <div ref={frameRef} className="story-frame">
              <div className="arcade-bezel story-bezel relative overflow-hidden">
                {bossBattle && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 w-[88%] animate-pop rounded-xl border-2 border-[#ff84ad] bg-[#2d0014]/95 p-2.5 text-center shadow-2xl backdrop-blur">
                    <p className="font-pixel text-[10px] font-black tracking-widest text-[#ff84ad]">⚔️ PATRON SAVAŞI!</p>
                    <p className="font-pixel text-xl font-extrabold text-white">{bossBattle.word.word}</p>
                    <p className="text-[10px] text-white/80">Doğru Türkçe küreye sür!</p>
                  </div>
                )}
                {showComboBanner && !bossBattle && (
                  <div className="absolute top-10 left-1/2 z-20 -translate-x-1/2 animate-pop rounded-xl border-2 border-[#ffd96d] bg-[#ffd96d] px-3 py-1 font-pixel text-xs font-black text-[#21123a] shadow-xl">🔥 COMBO x{comboStreak}!</div>
                )}

                <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#302052] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`status-light status-${status}`} />
                    <span className="font-pixel text-[9px] tracking-wider text-[#ffe99f] truncate max-w-[120px]">{currentWord.level} • {currentWord.topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasShield && <span className="text-[10px]">🛡️</span>}
                    {isDoubleXpActive && <span className="text-[10px]">💎 x2</span>}
                    <span className="font-pixel text-[8px] text-white/50">{statusLabel}</span>
                  </div>
                </div>

                <div ref={boardRef} onTouchStart={handleBoardTouchStart} onTouchEnd={handleBoardTouchEnd} className="game-board story-board" style={{ "--columns": COLUMNS } as React.CSSProperties}>
                  {boardFlash && <div className={`board-flash ${boardFlash}`} />}
                  {scoreFloat && <div key={scoreFloat.id} className="score-float">{scoreFloat.text}</div>}
                  {Array.from({ length: COLUMNS * ROWS }, (_, index) => {
                    const point = { x: index % COLUMNS, y: Math.floor(index / COLUMNS) };
                    const snakeIndex = snake.findIndex((s) => isSamePoint(s, point));
                    const isHead = snakeIndex === 0;
                    const isFood = isSamePoint(foodPoint, point);
                    const isPower = powerUpOnGrid && isSamePoint(powerUpOnGrid.point, point);
                    const bossOpt = bossBattle?.options.find((o) => isSamePoint(o.point, point));

                    // Nokia-style thin square orientation
                    let segOrientation: "h" | "v" = "h";
                    if (snakeIndex >= 0) {
                      if (snakeIndex === 0) {
                        // head orientation from current direction
                        const d = directionRef.current;
                        segOrientation = d === "left" || d === "right" ? "h" : "v";
                      } else {
                        const prev = snake[snakeIndex - 1];
                        const curr = snake[snakeIndex];
                        // if x differs from prev, it's horizontal move
                        segOrientation = prev.x !== curr.x ? "h" : "v";
                      }
                    }

                    return (
                      <div className="game-cell" key={`${point.x}-${point.y}`}>
                        {snakeIndex >= 0 && (
                          <div
                            className={
                              isHead
                                ? `snake-head ${segOrientation} snake-${directionRef.current}${hasShield ? " has-shield" : ""}`
                                : `snake-segment ${segOrientation}`
                            }
                            style={{ backgroundColor: isHead ? currentSkin.headBg : currentSkin.bodyBg }}
                          >
                            {isHead && (
                              <>
                                <b className="eye eye-one" style={{ backgroundColor: currentSkin.eyeColor }} />
                                <b className="eye eye-two" style={{ backgroundColor: currentSkin.eyeColor }} />
                                {currentSkin.hatEmoji && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px]">{currentSkin.hatEmoji}</span>}
                              </>
                            )}
                          </div>
                        )}
                        {isPower && <div className="absolute inset-0 flex items-center justify-center text-base animate-bounce z-10">{powerUpOnGrid!.emoji}</div>}
                        {bossOpt && <div className="absolute inset-[1px] flex items-center justify-center rounded-md border-2 border-[#ff84ad] bg-[#ff84ad] text-[#21123a] font-pixel text-[7px] font-black leading-none text-center p-0.5 z-20 animate-pulse">🇹🇷 {bossOpt.textTr}</div>}
                        {isFood && !bossOpt && (
                          <div className={`word-treat story-treat ${activeFood.isReview ? "review-treat" : ""}`}>
                            <span className="treat-dot" />
                            <div className="flex flex-col items-center leading-none">
                              <span className="text-[10px]">{currentWord.word}</span>
                              <span className="text-[7px] opacity-80 font-normal mt-0.5">🇹🇷 {currentWord.meaningTr.split(" /")[0].split(" (")[0].slice(0,14)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {status === "ready" && <div className="board-message"><span>BAŞLA</span><small>Ok tuşu / kaydır</small></div>}
                  {status === "paused" && <div className="board-message"><span>DURDURULDU</span><small>Boşlukla devam</small></div>}
                  {status === "over" && <div className="board-message"><span>BİTTİ</span><div className="flex gap-2 mt-2"><button onClick={()=>setIsStatsOpen(true)} type="button">📊 Rapor</button><button onClick={resetGame} type="button">Yeniden</button></div></div>}
                </div>

                <div className="flex shrink-0 items-center justify-between bg-[#302052] px-3 py-2">
                  <p className="font-pixel text-[9px] text-white/60">SKOR <strong className="text-[#99f5c3] ml-1">{String(score).padStart(3,"0")}</strong></p>
                  {comboStreak>1 && <p className="font-pixel text-[9px] text-[#ffd96d] animate-pulse">🔥 x{comboStreak}</p>}
                  <p className="font-pixel text-[9px] text-white/40">REKOR {String(bestScore).padStart(3,"0")}</p>
                  <button onClick={() => (status === "playing" ? setGameStatus("paused") : startGame())} type="button" className="pause-button !py-1 !px-2 !text-[10px]">{status === "playing" ? "Durdur" : "Başlat"}</button>
                </div>
              </div>

              <ArcadeControls onDirectionChange={changeDirection} onPauseToggle={() => (status === "playing" ? setGameStatus("paused") : startGame())} isPlaying={status === "playing"} />

              <div className="mt-2 flex shrink-0 justify-center gap-1.5">
                <button onClick={()=>setIsTopicsOpen(true)} type="button" className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">📌 Konu</button>
                <button onClick={()=>setIsSkinsOpen(true)} type="button" className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">{currentSkin.hatEmoji} Kostüm</button>
                <button onClick={()=>setIsWheelOpen(true)} type="button" className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">🎰 Çark</button>
                <button onClick={()=>setIsCustomWordsOpen(true)} type="button" className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">✍️ Özel</button>
              </div>
            </div>
          </div>

          {/* Right - Word Detail & Progress - responsive */}
          <div className="w-full max-w-[400px] flex-1 lg:max-w-[380px]">
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#241743] p-2.5 text-[11px]">
              <span className="font-pixel text-[10px] text-[#99f5c3]">SEVİYE FİLTRE:</span>
              <div className="flex gap-1">
                {(["ALL","A1","A2","B1","B2","C1","C2"] as const).map(lvl=> (
                  <button key={lvl} onClick={()=>setSelectedLevel(lvl)} className={`rounded px-1.5 py-0.5 font-pixel text-[10px] font-bold ${selectedLevel===lvl?"bg-[#ffd96d] text-[#21123a]":"bg-white/10 text-white/60"}`}>{lvl}</button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#ffd96d]/35 bg-[#251745] p-4 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-pixel text-[9px] tracking-widest text-[#99f5c3]">HEDEF MAMA</span>
                    {activeFood.isReview && <span className="rounded bg-[#ffd96d] px-1.5 py-0.5 font-pixel text-[8px] font-black text-[#21123a]">⭐ TEKRAR</span>}
                    {isCurrentLearned && <span className="rounded bg-[#75d9a6] px-1.5 py-0.5 font-pixel text-[8px] font-black text-[#112d1e]">ÖĞRENDİM - ASLA ÇIKMAZ</span>}
                  </div>
                  <h2 className="mt-1 truncate font-pixel text-2xl font-extrabold text-white">{currentWord.word}</h2>
                  <p className="mt-0.5 truncate font-pixel text-lg font-extrabold text-[#ffd96d]">🇹🇷 {currentWord.meaningTr}</p>
                </div>
                <span className="level-badge shrink-0">{currentWord.level}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
                <span className="truncate">{currentWord.phonetic} • {currentWord.pos}</span>
                <span className="shrink-0 ml-2">{currentWord.topic}</span>
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-[#1a0f33] p-3">
                <p className="text-[10px] font-bold uppercase text-[#99f5c3]">İNGİLİZCE TANIM:</p>
                <p className="mt-0.5 text-xs leading-5 text-white/90">{currentWord.definition}</p>
                <p className="mt-2 text-[10px] font-bold uppercase text-[#ffd96d]">ÖRNEK:</p>
                <p className="mt-0.5 text-xs italic leading-4 text-white/70">"{currentWord.example}"</p>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button onClick={toggleLearnedCurrentTarget} type="button" className={`flex-1 rounded-lg py-2 text-xs font-black transition-colors ${isCurrentLearned ? "bg-[#ff9ebb] text-[#330012] border border-[#ff9ebb]" : "bg-[#75d9a6] text-[#112d1e]"}`}>
                    {isCurrentLearned ? "Unuttum 🔁 Geri Getir" : "Öğrendim ✔️ Asla Gösterme"}
                  </button>
                  <button onClick={()=>speakWordDetails(currentWord.word, currentWord.meaningTr, currentWord.definition, currentWord.example, speechMode)} type="button" className="rounded-lg bg-[#99f5c3] px-3 py-2 text-xs font-black text-[#17112e]">🔊 Dinle</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setIsMicOpen(true)} type="button" className="flex-1 rounded-lg border border-[#ff84ad]/30 bg-[#ff84ad]/10 py-1.5 text-[11px] font-bold text-[#ff84ad]">🎙️ Telaffuz Dene</button>
                  <button onClick={()=>setShowHint(v=>!v)} type="button" className="flex-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-bold text-white/70">💡 {showHint?"Gizle":"İpucu"}</button>
                </div>
                {showHint && <div className="hint-bubble rounded-lg border border-[#ffd96d]/30 bg-[#ffd96d]/10 p-2.5 text-xs text-[#ffe9a8]"><p>🔤 İlk harf: <strong className="text-white">{currentWord.word.charAt(0).toUpperCase()}</strong> • Harf: {currentWord.word.replace(/\s/g,"").length}</p><p className="mt-1">🧩 {currentWord.word.charAt(0).toUpperCase()+ currentWord.word.slice(1).replace(/[a-zA-Z]/g,"•")}</p></div>}
              </div>

              <div className="mt-4 h-px bg-white/10" />

              <div className="mt-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-pixel text-[9px] tracking-widest text-[#ffd96d]">3000 KELİME İLERLEME</p>
                    <p className="mt-0.5 text-xs text-white/60"><strong className="text-white">{learnedCount}</strong> / {TOTAL_WORDS} Öğrendim (asla çıkmaz)</p>
                  </div>
                  <span className="font-pixel text-[11px] font-bold text-[#99f5c3]">{progressPercent}%</span>
                </div>
                <div className="journey-track mt-2"><span style={{ width: `${Math.max(progressPercent, learnedCount?1:0)}%` }} /></div>
                <p className="mt-1.5 text-[10px] leading-4 text-white/50">💡 Öğrendim yaptığın kelime, <strong className="text-white/80">Unuttum 🔁</strong> diyene kadar oyunda, çarkta, patron savaşında ve tüm havuzda bir daha asla karşına çıkmaz. Tam kalıcı öğrenme!</p>
              </div>

              {lastEaten && (
                <div className="learned-note mt-4 animate-pop">
                  <div className="flex items-center justify-between">
                    <p className="font-pixel text-[8px] tracking-widest text-[#ffd96d]">{lastEaten.isReview?"⭐ TEKRAR YENDİ!":"✨ YENİ YENDİ!"}</p>
                    <span className="text-xs text-[#ffd96d]">{"★".repeat(lastEaten.stars)}{"☆".repeat(5-lastEaten.stars)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-pixel text-base font-bold text-white truncate">{lastEaten.word.word}</span>
                      <span className="ml-2 text-xs font-bold text-[#ffd96d] truncate">🇹🇷 {lastEaten.word.meaningTr.split(" /")[0]}</span>
                    </div>
                    <button onClick={()=>speakWordDetails(lastEaten.word.word, lastEaten.word.meaningTr, lastEaten.word.definition, lastEaten.word.example, speechMode)} type="button" className="mini-hear shrink-0">Dinle</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-[#1a0f33]/60 p-3 text-[11px] text-white/60 leading-5 border border-white/5">
              <p className="font-pixel text-[10px] text-white/80">📲 VERCEL & MOBİL KURULUM</p>
              <p className="mt-1">1) Vercel'e yükle → Deploy → Linki al. 2) Telefonda linki Chrome ile aç → Üstteki <strong>📲 YÜKLE</strong> butonuna bas veya Chrome menü → <em>Ana Ekrana Ekle</em>. Oyun uygulama gibi çalışır, offline bile oynanır!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WordLibraryModal isOpen={isLibraryOpen} onClose={()=>setIsLibraryOpen(false)} masteryMap={masteryMap} onMasteryChange={(m)=>setMasteryMap(m)} speechMode={speechMode} />
      <SkinsModal isOpen={isSkinsOpen} onClose={()=>setIsSkinsOpen(false)} learnedCount={learnedCount} activeSkinId={activeSkinId} onSelectSkin={(id)=>{setActiveSkinId(id); setIsSkinsOpen(false);}} />
      <TopicsModal isOpen={isTopicsOpen} onClose={()=>setIsTopicsOpen(false)} selectedTopic={selectedTopic} selectedLevel={selectedLevel} onSelectTopic={(t)=>setSelectedTopic(t)} onSelectLevel={(l)=>setSelectedLevel(l)} />
      <AchievementsModal isOpen={isAchievementsOpen} onClose={()=>setIsAchievementsOpen(false)} stats={achievementStats} />
      <CustomWordsModal isOpen={isCustomWordsOpen} onClose={()=>setIsCustomWordsOpen(false)} onAddCustomWords={(nw)=>{setCustomWordsBank(p=>[...nw, ...p]); setIsCustomWordsOpen(false);}} />
      <ArcadeWheelModal isOpen={isWheelOpen} onClose={()=>setIsWheelOpen(false)} onRewardWon={(pts)=>setScore(p=>p+pts)} />
      <MicPracticeModal isOpen={isMicOpen} onClose={()=>setIsMicOpen(false)} word={currentWord} />
      <WordOfDayModal isOpen={isWordOfDayOpen} onClose={()=>setIsWordOfDayOpen(false)} speechMode={speechMode} />
      <QuizModal isOpen={isQuizOpen} onClose={()=>{setIsQuizOpen(false); setQuizzesCompletedCount(p=>p+1); setIsStatsOpen(true);}} recentWords={sessionEatenWords} onBonusEarned={(b)=>setScore(p=>p+b)} />
      <StatsModal isOpen={isStatsOpen} onClose={()=>setIsStatsOpen(false)} sessionScore={score} maxCombo={maxCombo} sessionWords={sessionEatenWords} masteryMap={masteryMap} onToggleLearned={(id)=>setMasteryMap(toggleWordLearnedState(id, masteryMap))} speechMode={speechMode} />
    </main>
  );
}
