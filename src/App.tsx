import { GameEndControls } from "./components/GameEndControls";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import html2canvas from "html2canvas";
import { createPortal } from "react-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import { GoogleGenAI } from "@google/genai";
import { io, Socket } from "socket.io-client";
import { Facebook, Youtube, Instagram, Heart, Hand, BellRing, RefreshCw } from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { motion, AnimatePresence, animate } from "motion/react";
import {
  Upload,
  WifiOff,
  Box,
  ShieldPlus,
  Trash2,
  Mail,
  User,
  Image as ImageIcon,
  Bell,
  Users,
  Trophy,
  Timer,
  Hammer,
  Sparkles,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  Snowflake,
  MessageSquare,
  Send,
  X,
  Home,
  Flag,
  Ban,
  MessageSquareOff,
  Info,
  Star,
  Zap,
  Lock,
  Camera,
  Check,
  Settings,
  Crown,
  AlertTriangle,
  Type,
  Eye,
  EyeOff,
  Shield,
  Search,
  UserMinus,
  UserPlus,
  UserCheck,
  Smile,
  Loader2,
  LogOut,
  Plus,
  Edit2,
  ShoppingCart,
  Hash,
  Copy,
  Swords,
  Volume2,
  VolumeX,
  Music,
  Tv,
  Play,
  Gift,
  Unlock,
  Coins,
  FileText,
  History,
  Activity,
  MessageCircle,
  Clock,
  CloudRain,
  Disc,
  Key,
  LogIn,
  UserX,
} from "lucide-react";

import easyGuessData from "./data/easyGuess.json";
import busCompleteData from "./data/busCompleteData.json";
import { getApiBaseUrl, apiUrl, isServerlessMode, DEFAULT_CATEGORIES } from "./apiConfig";
import { MatchmakingService } from "./services/matchmakingService";
import { GameEngineService } from "./services/gameEngineService";
import { getServerlessSocket } from "./services/serverlessSocket";

const globalImageCache = new Set<string>();
export function preloadIQImages(urls: string[]) {
  if (!urls || !Array.isArray(urls)) return;
  urls.forEach((url) => {
    if (!url || typeof url !== "string" || globalImageCache.has(url)) return;
    globalImageCache.add(url);
    const fullUrl = url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:") ? url : apiUrl(url);
    const img = new Image();
    img.src = fullUrl;
    if (typeof img.decode === "function") {
      img.decode().catch(() => {});
    }
  });
}

const limit99 = (val: number | string | undefined | null): string | number => {
  if (val === undefined || val === null) return 0;
  const num = typeof val === "number" ? val : parseInt(val.toString(), 10);
  if (isNaN(num)) return val;
  return num > 99 ? "+99" : num;
};

const SPIN_REWARDS_UI = [
  {
    id: "time_freeze",
    type: "helper",
    value: "time_freeze",
    label: "تجميد الوقت",
    icon: <Snowflake className="w-6 h-6" />,
    color: "#06b6d4",
  },
  {
    id: "word_length",
    type: "helper",
    value: "word_length",
    label: "كاشف الحروف",
    icon: <Type className="w-6 h-6" />,
    color: "#22c55e",
  },
  {
    id: "word_count",
    type: "helper",
    value: "word_count",
    label: "عدد الكلمات",
    icon: <Hash className="w-6 h-6" />,
    color: "#6366f1",
  },
  {
    id: "hint",
    type: "helper",
    value: "hint",
    label: "تلميح",
    icon: <HelpCircle className="w-6 h-6" />,
    color: "#3b82f6",
  },
  {
    id: "spy_lens",
    type: "helper",
    value: "spy_lens",
    label: "الجاسوس",
    icon: <Eye className="w-6 h-6" />,
    color: "#a855f7",
  },
  {
    id: "token_1",
    type: "token",
    value: 1,
    label: "تخمينة 1",
    icon: (
      <img
        src="/Takhmina_coin_02.png"
        className="w-6 h-6"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    ),
    color: "#fbbf24",
  },
  {
    id: "token_2",
    type: "token",
    value: 2,
    label: "2 تخمينة",
    icon: (
      <img
        src="/Takhmina_coin_02.png"
        className="w-6 h-6"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    ),
    color: "#f59e0b",
  },
  {
    id: "token_3",
    type: "token",
    value: 3,
    label: "3 تخمينة",
    icon: (
      <img
        src="/Takhmina_coin_02.png"
        className="w-6 h-6"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    ),
    color: "#d97706",
  },
  {
    id: "token_4",
    type: "token",
    value: 4,
    label: "4 تخمينة",
    icon: (
      <img
        src="/Takhmina_coin_02.png"
        className="w-6 h-6"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    ),
    color: "#b45309",
  },
  {
    id: "token_5",
    type: "token",
    value: 5,
    label: "5 تخمينة",
    icon: (
      <img
        src="/Takhmina_coin_02.png"
        className="w-6 h-6"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    ),
    color: "#92400e",
  },
  {
    id: "token_10",
    type: "token",
    value: 10,
    label: "تخمينة 10",
    icon: (
      <img
        src="/Takhmina_coin_02.png"
        className="w-6 h-6"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    ),
    color: "#78350f",
  },
  {
    id: "xp_10",
    type: "xp",
    value: 10,
    label: "10 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#f97316",
  },
  {
    id: "xp_20",
    type: "xp",
    value: 20,
    label: "20 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#ea580c",
  },
  {
    id: "xp_30",
    type: "xp",
    value: 30,
    label: "30 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#c2410c",
  },
  {
    id: "xp_40",
    type: "xp",
    value: 40,
    label: "40 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#9a3412",
  },
  {
    id: "xp_50",
    type: "xp",
    value: 50,
    label: "50 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#7c2d12",
  },
  {
    id: "xp_100",
    type: "xp",
    value: 100,
    label: "100 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#431407",
  },
  {
    id: "xp_5000",
    type: "xp",
    value: 5000,
    label: "5000 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#ef4444",
  },
  {
    id: "xp_10000",
    type: "xp",
    value: 10000,
    label: "10000 XP",
    icon: <Star className="w-6 h-6" />,
    color: "#dc2626",
  },
  {
    id: "pro_30",
    type: "pro",
    value: 30,
    label: "باقة المحترفين",
    icon: <Crown className="w-6 h-6" />,
    color: "#ec4899",
  },
];

const CategoryPageAd = ({ isAdmin, isPro }: { isAdmin?: boolean; isPro?: boolean }) => {
  const adRef = useRef<HTMLModElement>(null);

  if (isAdmin || isPro) return null;

  useEffect(() => {
    let interval: any;
    const attemptPush = () => {
      if (adRef.current && adRef.current.clientWidth > 0) {
        try {
          if (typeof window !== "undefined" && window.adsbygoogle && !adRef.current.dataset.adPushed) {
            adRef.current.dataset.adPushed = "true";
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        } catch (e) {
          console.error("AdSense initialization error:", e);
        }
        if (interval) clearInterval(interval);
      }
    };

    interval = setInterval(attemptPush, 500);
    const timeout = setTimeout(attemptPush, 100);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="w-full max-w-md mt-2 md:mt-2 flex flex-col items-center justify-center overflow-hidden min-h-[50px] sm:min-h-[90px]">
      <ins
        ref={adRef}
        className="adsbygoogle w-full"
        style={{ display: "block", minWidth: "250px" }} // تم تحديد عرض أدنى لتجنب خطأ availableWidth=0
        data-ad-client="ca-pub-8026106142955130"
        data-ad-slot="9111492892"
        data-ad-format="horizontal" // إجبار الشكل الأفقي
        data-full-width-responsive="false" // لمنع تحويل الإعلان لمربع كبير على الموبايل وإجباره على البقاء أفقيًا
      ></ins>
    </div>
  );
};

const XPAnimatedCounter = ({ finalXP }: { finalXP: number }) => {
  const [displayXP, setDisplayXP] = useState(0);

  useEffect(() => {
    const controls = animate(0, finalXP, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (value) => setDisplayXP(Math.round(value)),
    });
    return () => controls.stop();
  }, [finalXP]);

  return (
    <span className="flex items-center justify-center gap-2" dir="ltr">
      XP: <span className="text-yellow-400">{displayXP}</span>
    </span>
  );
};
import confetti from "canvas-confetti";
import { COLLECTION_DATA } from "../collectionData";
import { AdminCustomization } from "./components/AdminCustomization";
import { MockAdModal } from "./components/MockAdModal";
import { AdminLogin } from "./components/AdminLogin";
import { QuickChatManager } from "./components/QuickChatManager";
import { AvatarDisplay } from "./components/AvatarDisplay";
import { LevelUpModal } from "./components/LevelUpModal";
import { MatchIntro } from "./components/MatchIntro";
import { useAvatarConfig } from "./contexts/AvatarContext";
import { STATIC_ASSETS } from "./constants";
import Cropper from "react-easy-crop";
import { Howl, Howler } from "howler";
import { filterProfanity } from "./profanityFilter";

declare global {
  interface Window {
    adsbygoogle: any[];
    adBreak: (o: any) => void;
    adConfig: (o: any) => void;
  }
}

// Audio URLs
const SOUNDS = {
  hammer: "/sounds/hammer.mp3",
  pop: "/sounds/pop.mp3",
  xp: "/sounds/xp.mp3",
  prize: "/sounds/prize.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.mp3",
  countdown: "/sounds/countdown.mp3",
  cyclingReward: "/sounds/cyclingReward.mp3",
  chestOpen: "/sounds/chestOpen.mp3",
  shakingBox: "/sounds/shakingBox.mp3",
  bell: "/sounds/bell.mp3",
  correctAnswer: "/sounds/correct-answer.mp3",
  wrong: "/sounds/wrong.mp3",
  alarm: "/sounds/alarm.mp3",
  message: "/sounds/message.mp3",
  clickOpen: "/sounds/click-open.mp3",
  clickClose: "/sounds/click-close.mp3",
  tick: "/sounds/tick.mp3",
  clockTicking: "/sounds/clock-ticking.mp3",
  handXFill: "/sounds/hand-x-fill.mp3",
  connect4Fall: "/sounds/playing-connect-4.mp3",
  "rocket-laser-single-shoot": "/sounds/rocket-laser-single-shoot.mp3",
  "space-war-rocket-level-upgrade": "/sounds/space-war-rocket-level-upgrade.mp3",
  connect4PickPiece: "/sounds/connect-4-pick-piece.mp3",
  luckyReels: "/sounds/lucky-reels-sound-effect.mp3",
  spinStart: "/sounds/lucky-reels-sound-effect.mp3",
  proArrival: "/sounds/proArrival.mp3",
  spinStop: "/sounds/bell.mp3",
  notification: "/sounds/notification.mp3",
  lobbyBackground: "/sounds/lobby-background-music.mp3",
  gameBackground: "/sounds/start-game-background-music.mp3",
  deskBell: "/sounds/desk-bell.mp3",
  countdownBeep: "/sounds/countdown-beep.mp3",
  boomSingleTick: "/sounds/boom-single-tick.mp3",
  bombFuse: "/sounds/bomb-fuse.mp3",
  bombExplosion: "/sounds/bomb-explosion.mp3",
  boomingExplosion: "/sounds/booming-explosion.mp3",
  beachRaceBackground: "/sounds/beach-race-palying-music.mp3",
};

// Types
interface Player {
  id: string;
  name: string;
  age: number; // Added for player privacy and child protection
  avatar: string;
  gender: string;
  score: number;
  targetImage: { name: string; image: string } | null;
  isMuted: boolean;
  hasGuessed: boolean;
  selectedCategory: string | null;
  selectedLevel?: string | null;
  hintCount: number;
  quickGuessUsed: boolean;
  wordLengthUsed?: boolean;
  timeFreezeUsed?: boolean;
  spyLensUsed?: boolean;
  reported: boolean; // Added for player reporting feature
  helpersUsedCount?: number;
  lastGuess?: string;
  xp: number;
  level?: number;
  streak: number;
  serial?: string;
  wins?: number;
  reports?: number;
  reportedBy?: any[];
  banCount?: number;
  isPermanentBan?: number;
  ownedHelpers?: { [key: string]: number };
  lastRenameAt?: number;
  keys?: number;
  isPro?: boolean;
  busCompleteWins?: number;
  xoWins?: number;
  handWins?: number;
  iqWins?: number;
  dotsWins?: number;
  speedCupsWins?: number;
  bombPartyWins?: number;
  wordleWins?: number;
  connectFourWordsWins?: number;
  spaceWarWins?: number;
  puzzleWins?: number;
  beachRaceWins?: number;
  selectedSelectionMode?: string;
}

interface Room {
  id: string;
  players: Player[];
  proposedSelectionMode?: string | null;
  proposedSelectionModeBy?: string | null;
  gameState:
    | "waiting"
    | "discussion"
    | "guessing"
    | "finished"
    | "custom_image_upload"
    | "bus_complete_setup"
    | "bus_complete_spin"
    | "bus_complete_playing"
    | "bus_complete_evaluating"
    | "xo_playing"
    | "xo_finished"
    | "hand_playing"
    | "hand_finished"
    | "bomb_party_playing"
    | "bomb_party_finished"
    | "space_war_setup"
    | "space_war_playing"
    | "space_war_finished"
    | "puzzle_setup"
    | "puzzle_playing"
    | "puzzle_finished"
    | "beach_race_setup"
    | "beach_race_playing"
    | "beach_race_finished";
  bombParty?: any;
  handGrid?: (string | null)[];
  handPickerId?: string | null;
  handSearcherId?: string | null;
  handPhase?: "picking" | "searching" | string;
  handWinner?: string | "draw" | null;
  handP1Score?: number;
  handP2Score?: number;
  handRematchRequestedBy?: string[];
  handTargetNumber?: number | null;
  handNumbers?: any[];
  handSearcherSelected?: number | null;
  timer: number;
  category: string;
  isPaused: boolean;
  pausingPlayerId: string | null;
  adPausedPlayersArray?: string[];
  quickGuessTimer: number;
  isFrozen?: boolean;
  freezeTimer?: number;
  adCooldownTimer?: number;
  judgmentTimer?: number;
  isWaitingForJudgment?: boolean;
  judgingPlayerId?: string;
  guessingPlayerId?: string;
  currentTurn?: string | null;
  waitingForAnswerFrom?: string | null;
  matchType?: "random" | "private" | "friend" | string;
  selectionMode?: "ready" | "custom" | "bus_complete" | "xo" | "hand_khamin" | "iq" | "dots" | "speed_cups" | "bomb_party" | null;
  busCompleteLetter?: string;
  busCompleteWinner?: string;
  busCompleteHideResults?: boolean;
  busCompleteAdViewers?: string[];
  busCompleteCooldowns?: Record<string, number>;
  busCompleteSubmittedPlayers?: string[];
  busCompleteSubmitTimes?: Record<string, number>;
  busCompleteTimerReduction?: number;
  busCompleteChangeLetterRequestBy?: string | null;
  busCompleteRematchRequestedBy?: string[];
  xoBoard?: (string | null)[];
  xoTurn?: string | null;
  xoWinner?: string | "draw" | null;
  xoMatchWins?: { [key: string]: number };
  xoWinningLine?: number[] | null;
  xoRematchRequestedBy?: string[];
  xoXPlayer?: string | null;
  xoOPlayer?: string | null;
  busCompleteScores?: Record<
    string,
    {
      boy: number;
      girl: number;
      animal: number;
      plant: number;
      inanimate: number;
      country: number;
      total: number;
    }
  >;
  busCompleteAnswers?: Record<
    string,
    {
      boy: string;
      girl: string;
      animal: string;
      plant: string;
      inanimate: string;
      country: string;
    }
  >;
}

const findNodeByText = (text: string, nodes: any[]): any | null => {
  for (const node of nodes) {
    if (node.text === text) return node;
    if (node.children) {
      const found = findNodeByText(text, node.children);
      if (found) return found;
    }
  }
  return null;
};

const AVATARS = [
  { id: "/assets/avatar.png", level: 1, gender: "all" },
  // Boys
  { id: "avatar-free-boy-01.png", level: 1, gender: "boy" },
  { id: "avatar-free-boy-02.png", level: 1, gender: "boy" },
  { id: "avatar-free-boy-03.png", level: 1, gender: "boy" },
  { id: "avatar-free-boy-04.png", level: 1, gender: "boy" },
  { id: "avatar-lvl-boy-10.png", level: 10, gender: "boy" },
  { id: "avatar-lvl-boy-20.png", level: 20, gender: "boy" },
  { id: "avatar-lvl-boy-30.png", level: 30, gender: "boy" },
  { id: "avatar-lvl-boy-40.png", level: 40, gender: "boy" },
  // Girls
  { id: "avatar-free-girl-01.png", level: 1, gender: "girl" },
  { id: "avatar-free-girl-02.png", level: 1, gender: "girl" },
  { id: "avatar-free-girl-03.png", level: 1, gender: "girl" },
  { id: "avatar-free-girl-04.png", level: 1, gender: "girl" },
  { id: "avatar-lvl-girl-10.png", level: 10, gender: "girl" },
  { id: "avatar-lvl-girl-20.png", level: 20, gender: "girl" },
  { id: "avatar-lvl-girl-30.png", level: 30, gender: "girl" },
  { id: "avatar-lvl-girl-40.png", level: 40, gender: "girl" },
];

// Get version from meta tag injected by server, fallback to hardcoded if not found
const getAppVersion = () => {
  const metaVersion = document
    .querySelector('meta[name="app-version"]')
    ?.getAttribute("content");
  return metaVersion && metaVersion !== "{{VERSION}}" ? metaVersion : "1.1.6";
};
const APP_VERSION = getAppVersion(); // Version for cache clearing

const EMOTES = [
  "😂",
  "🤪",
  "😡",
  "😔",
  "🤔",
  "🙄",
  "🤯",
  "😭",
  "👀",
  "🕒",
  "👋",
  "✋",
  "👌",
  "👍",
  "👎",
  "🎉",
  "🤷🏼‍♂️",
  "🤷🏻‍♀️",
  "🤦🏼‍♂️",
  "🤦",
];

const POWER_UP_UNLOCKS = [10, 20, 30, 40, 50];
const AVATAR_UNLOCKS = [10, 20, 30, 40, 50];

const DAILY_QUEST_REWARDS = [50, 100, 150, 250, 300, 400, 500];
const HELPER_ITEMS = [
  {
    id: "word_length",
    name: "كاشف الحروف",
    icon: <Type className="w-5 h-5 text-green-500" />,
  },
  {
    id: "word_count",
    name: "عدد الكلمات",
    icon: <Hash className="w-5 h-5 text-indigo-500" />,
  },
  {
    id: "time_freeze",
    name: "تجميد الوقت",
    icon: <Snowflake className="w-5 h-5 text-cyan-500" />,
  },
  {
    id: "hint",
    name: "تلميح",
    icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
  },
  {
    id: "spy_lens",
    name: "الجاسوس",
    icon: <Eye className="w-5 h-5 text-purple-500" />,
  },
];

const enterFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  }
};

const TypingIndicator = ({
  gender,
  type = "changing_questions",
}: {
  gender?: string;
  type?: "changing_questions" | "typing";
}) => (
  <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-xl rounded-tl-none shadow-sm w-fit border border-gray-100">
    <span className="text-[10px] font-bold text-accent-blue mr-1">
      {type === "changing_questions"
        ? `انتظر...! المنافس ${gender === "girl" ? "تقوم" : "يقوم"} بتغيير السؤال.`
        : `المنافس ${gender === "girl" ? "تكتب" : "يكتب"}...`}
    </span>
    <div className="flex gap-0.5">
      <span className="w-1 h-1 bg-accent-blue rounded-full typing-dot"></span>
      <span className="w-1 h-1 bg-accent-blue rounded-full typing-dot"></span>
      <span className="w-1 h-1 bg-accent-blue rounded-full typing-dot"></span>
    </div>
  </div>
);

const isSameDay = (d1: number, d2: number) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
};

const isSameWeek = (d1: number, d2: number) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const firstDayOfWeek = new Date(
    date1.setDate(date1.getDate() - date1.getDay()),
  );
  const firstDayOfWeek2 = new Date(
    date2.setDate(date2.getDate() - date2.getDay()),
  );
  return (
    firstDayOfWeek.getFullYear() === firstDayOfWeek2.getFullYear() &&
    firstDayOfWeek.getMonth() === firstDayOfWeek2.getMonth() &&
    firstDayOfWeek.getDate() === firstDayOfWeek2.getDate()
  );
};

import { CheckoutPage } from "./components/CheckoutPage";
import WordleGame from "./WordleGame";
import ConnectFourWordsGame from "./ConnectFourWordsGame";
import SpaceWarGame from "./SpaceWarGame";
import PuzzleGame from "./PuzzleGame";
import BeachRaceGame from "./BeachRaceGame";

function normalizeEgyptian(text: string): string {
  if (!text) return "";
  let normalized = text.trim().replace(/\s+/g, " ");
  normalized = normalized.replace(/[أإآ]/g, "ا");
  normalized = normalized.replace(/ة/g, "ه");
  normalized = normalized.replace(/ى/g, "ي");
  normalized = normalized.replace(/ؤ/g, "و");
  normalized = normalized.replace(/ئ/g, "ي");
  normalized = normalized.replace(/گ/g, "ج");
  normalized = normalized.replace(/پ/g, "ب");
  normalized = normalized.replace(/ڤ/g, "ف");
  normalized = normalized.replace(/چ/g, "ج");
  normalized = normalized.replace(/ژ/g, "ز");
  normalized = normalized.replace(/ڤ/g, "ف");
  return normalized;
}

function resolveGameImageUrl(urlOrPath: string | null | undefined): string {
  if (!urlOrPath) return "";
  if (
    urlOrPath.startsWith("data:") ||
    urlOrPath.startsWith("http://") ||
    urlOrPath.startsWith("https://") ||
    urlOrPath.startsWith("blob:")
  ) {
    return urlOrPath;
  }
  return apiUrl(urlOrPath);
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const RewardCard = React.memo(
  ({
    playerName,
    level,
    avatar,
    selectedFrame,
    reward,
    categoryName,
    isClaimed,
    onClaim,
    isStageComplete,
    previewFrame,
    customConfig,
    isHighestLikes,
  }: any) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
      if (cardRef.current) {
        try {
          const canvas = await html2canvas(cardRef.current, {
            useCORS: true,
            backgroundColor: null,
            scale: 2, // Improve quality
          });
          const dataUrl = canvas.toDataURL("image/png");

          const downloadFallback = () => {
            const link = document.createElement("a");
            link.download = "reward.png";
            link.href = dataUrl;
            link.click();
          };

          if (navigator.share && navigator.canShare) {
            try {
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], "reward.png", {
                type: "image/png",
              });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: "مكافأتي في خمن تخمينة!",
                  text: "شوف مكافأتي في لعبة خمن تخمينة!",
                  url: window.location.origin,
                });
              } else {
                downloadFallback();
              }
            } catch (shareErr: any) {
              console.warn(
                "Share API failed or was cancelled, falling back to download:",
                shareErr,
              );
              if (shareErr.name !== "AbortError") {
                downloadFallback();
              }
            }
          } else {
            downloadFallback();
          }
        } catch (err) {
          console.error("Share failed:", err);
          alert("حدث خطأ أثناء المشاركة، يرجى المحاولة مرة أخرى.");
        }
      }
    };

    const frameToDisplay = isClaimed ? selectedFrame : previewFrame;

    return (
      <div className="flex flex-col items-center gap-4 pt-6 md:pt-6 space-y-3 md:space-y-4">
        <div
          ref={cardRef}
          className="p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm bg-[#fdfbf7]"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              <AvatarDisplay
                avatar={avatar}
                level={level}
                customConfig={customConfig}
                className="w-full h-full"
                hideExtras={false}
                isOnline={true}
                selectedFrame={frameToDisplay}
                isHighestLikes={isHighestLikes}
              />
            </div>
            <h3 className="text-2xl font-black" style={{ color: "#4a3f35" }}>
              {playerName}
            </h3>
            <p className="text-sm font-bold" style={{ color: "#4b5563" }}>
              المستوى: {level}
            </p>
            <div className="mt-4 p-3 bg-white rounded-xl border-2 border-black w-full text-center">
              <p className="text-sm font-black" style={{ color: "#4a3f35" }}>
                مبروك! كسبت:
              </p>
              <p className="text-lg font-black" style={{ color: "#f97316" }}>
                {reward.xp} XP
              </p>
              {reward.frame && (
                <p className="text-sm font-black" style={{ color: "#3b82f6" }}>
                  + إطار مميز
                </p>
              )}
            </div>
          </div>
        </div>
        {isClaimed ? (
          <button
            onClick={handleShare}
            className="btn-game btn-secondary py-3 px-6 text-lg font-black"
          >
            مشاركة المكافأة 🚀
          </button>
        ) : (
          <button
            disabled={!isStageComplete}
            onClick={onClaim}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${isStageComplete ? "bg-orange-500 text-white hint-glow hover:bg-orange/90" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            استلام المكافأة
          </button>
        )}
      </div>
    );
  },
);

const AnimatedXp = ({
  xp,
  joined,
  children,
}: {
  xp: number;
  joined: boolean;
  children: (displayXp: number) => React.ReactNode;
}) => {
  const [displayXp, setDisplayXp] = useState(xp);

  useEffect(() => {
    if (xp === displayXp || joined) return;

    const duration = 500;
    const startXp = displayXp;
    const targetXp = xp;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextValue = startXp + (targetXp - startXp) * progress;

      setDisplayXp(nextValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayXp(targetXp);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [xp, joined]);

  return <>{children(displayXp)}</>;
};

const getLevel = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;

interface CityImageProps {
  id?: number | string;
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  wrapperClassName?: string;
}

const CityImage = ({
  src,
  alt,
  className,
  onClick,
  wrapperClassName = "",
}: CityImageProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative ${wrapperClassName}`} onClick={onClick}>
      {!loaded && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-xl`}
        >
          <Search className="w-5 h-5 text-gray-400 opacity-50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const SpeedCupsBoard = ({ room, socket, me, myId, onLeave, playSound }: { room: any, socket: any, me: any, myId: string, onLeave: () => void, playSound: any }) => {
  const isP1 = room.players[0]?.id === myId;
  const isP2 = room.players.length > 1 && room.players[1]?.id === myId;
  
  const myStack = isP1 ? room.speedCupsP1Stack || [] : (isP2 ? room.speedCupsP2Stack || [] : []);
  const myDone = isP1 ? room.speedCupsP1Done : (isP2 ? room.speedCupsP2Done : false);
  const oppStack = isP1 ? room.speedCupsP2Stack || [] : (isP2 ? room.speedCupsP1Stack || [] : []);
  const oppDone = isP1 ? room.speedCupsP2Done : (isP2 ? room.speedCupsP1Done : false);
  
  const p1Wins = room.speedCupsMatchWins?.[room.players[0]?.id] || 0;
  const p2Wins = room.players.length > 1 ? room.speedCupsMatchWins?.[room.players[1]?.id] || 0 : 0;
  const myWins = isP1 ? p1Wins : (isP2 ? p2Wins : 0);
  const oppWins = isP1 ? p2Wins : (isP2 ? p1Wins : 0);

  const colors = ["black", "blue", "green", "red", "yellow"];
  
  // Local state for cup positions (shuffled at round start)
  const [cupOrder, setCupOrder] = React.useState([...colors]);
  const prevGameStateRef = React.useRef(room.gameState);

  const [localStack, setLocalStack] = React.useState<string[]>([]);
  const localStackRef = React.useRef<string[]>([]);
  const isInitialSyncRef = React.useRef(true);

  React.useEffect(() => {
    isInitialSyncRef.current = true;
  }, [room.id]);

  // Sync local stack with server state
  React.useEffect(() => {
    const isPlaying = room.gameState === "speed_cups_playing";
    const isReset = myStack.length === 0;
    
    if (!isPlaying || isReset || isInitialSyncRef.current) {
      setLocalStack(myStack);
      localStackRef.current = myStack;
      isInitialSyncRef.current = false;
    }
  }, [JSON.stringify(myStack), room.gameState, room.speedCupsCurrentCardIndex]);

  // Preload speed cups assets for zero delay/lag
  React.useEffect(() => {
    const staticImages = [
      "/speed-cups/black-cup.png",
      "/speed-cups/blue-cup.png",
      "/speed-cups/green-cup.png",
      "/speed-cups/red-cup.png",
      "/speed-cups/yellow-cup.png",
      "/speed-cups/desktop-bell-before-click.png",
      "/speed-cups/desktop-bell-after-clicked.png",
      "/speed-cups/cards-back.png"
    ];
    staticImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    if (room.speedCupsCards) {
      room.speedCupsCards.forEach((card: any) => {
        const img = new Image();
        img.src = `/speed-cups/${card.card_name}.png`;
      });
    }
  }, [room.speedCupsCards]);

  React.useEffect(() => {
    if (room.gameState === "speed_cups_countdown" && room.speedCupsTimer === 3) {
      setCupOrder([...colors].sort(() => Math.random() - 0.5));
    }

    if (room.gameState === "speed_cups_evaluating" && prevGameStateRef.current !== "speed_cups_evaluating") {
      const currentCard = room.speedCupsCards?.[room.speedCupsCurrentCardIndex];
      if (currentCard) {
        const isCorrect = JSON.stringify(myStack) === JSON.stringify(currentCard.color_order);
        if (isCorrect) {
          playSound("correctAnswer");
        } else {
          playSound("wrong");
        }
      }
    }
    prevGameStateRef.current = room.gameState;
  }, [room.gameState, room.speedCupsTimer, room.speedCupsCards, room.speedCupsCurrentCardIndex, myStack, playSound]);

  const currentCard = room.speedCupsCards?.[room.speedCupsCurrentCardIndex];
  
  const handleClearStack = () => {
    if (room.gameState === "speed_cups_playing" && !myDone && !((room.adPausedPlayersArray?.length || 0) > 0)) {
      playSound("clickClose");
      setLocalStack([]);
      localStackRef.current = [];
      socket?.emit("speed_cups_clear_cups", { roomId: room.id });
      GameEngineService.handleAction("speed_cups_clear_cups", { roomId: room.id, playerId: socket?.id });
    }
  };

  const renderStack = (stack: string[], done: boolean, isOpponent: boolean) => {
    const isEvaluating = room.gameState === "speed_cups_evaluating";
    let isCorrect = false;
    if (isEvaluating && currentCard) {
      isCorrect = JSON.stringify(stack) === JSON.stringify(currentCard.color_order);
    }
    
    const isClickable = !isOpponent && !myDone && room.gameState === "speed_cups_playing" && stack.length > 0;
    
    return (
      <div 
        onClick={isClickable ? handleClearStack : undefined}
        className={`flex flex-col items-center justify-end h-40 md:h-48 w-12 md:w-16 relative ${isClickable ? "cursor-pointer" : ""}`}
      >
        {isEvaluating && (
          <div className="absolute -top-10 z-20 flex items-center justify-center bg-white border-2 border-pink-200 rounded-full w-10 h-10 shadow-md animate-bounce">
            <span className="text-xl leading-none">{isCorrect ? "✔️" : "❌"}</span>
          </div>
        )}
        <div className="relative w-full h-full flex flex-col justify-end">
          {stack.map((color, idx) => (
            <div key={idx} className="absolute w-full flex justify-center" style={{ bottom: `${idx * 14}px`, zIndex: idx }}>
               <img src={`/speed-cups/${color}-cup.png`} className="w-10 md:w-14 h-auto object-contain" />
            </div>
          ))}
        </div>
        <span className="text-[10px] font-bold text-gray-500 mt-1">{isOpponent ? "الخصم" : "أنت"}</span>
      </div>
    );
  };

  if (room.gameState === "speed_cups_finished") {
    return (
       <div className="w-full py-4 flex flex-col items-center justify-center animate-fade-in text-center space-y-6">
         <div className="space-y-2 mb-2">
           <h2 className="text-xl md:text-2xl font-black text-pink-600">انتهت مباراة أكواب السرعة! 🏆</h2>
         </div>

         <div className="w-full bg-white rounded-2xl p-4 shadow-md border-2 border-pink-100 flex flex-col items-center gap-4 max-w-md mx-auto">
           <div className="flex w-full items-center justify-center gap-4">
             {/* Player 1 Stats */}
             <div className="flex flex-col items-center gap-2 p-3 bg-pink-50/50 rounded-xl border-2 border-pink-100 w-1/2">
               <div className="font-black text-base text-pink-700 truncate max-w-full px-2">
                 {isP1 ? "أنت" : (room.players[0]?.name || "اللاعب 1").split(" ")[0]}
               </div>
               <div className="text-3xl font-black text-pink-600 bg-white w-full text-center py-1.5 rounded-lg border border-pink-200">
                 {p1Wins}
               </div>
             </div>
             
             <div className="text-xl font-black text-gray-300 font-mono">VS</div>
             
             {/* Player 2 Stats */}
             <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 w-1/2">
               <div className="font-black text-base text-gray-700 truncate max-w-full px-2">
                 {!isP1 ? "أنت" : (room.players[1]?.name || "الخصم").split(" ")[0]}
               </div>
               <div className="text-3xl font-black text-gray-600 bg-white w-full text-center py-1.5 rounded-lg border border-gray-200">
                 {p2Wins}
               </div>
             </div>
           </div>

           <div className="text-center font-black text-base md:text-lg text-white bg-pink-500 border-b-4 border-pink-700 px-6 py-2.5 rounded-xl shadow-md w-full">
             {room.speedCupsWinner === "draw" ? (
               "النتيجة النهائية تعادل! 🤝"
             ) : room.speedCupsWinner === myId ? (
               "لقد فزت بالمباراة! 🎉"
             ) : (
               "حظ أوفر المرة القادمة! 😔"
             )}
           </div>

           <GameEndControls
             room={room}
             socket={socket}
             myId={myId}
             playerSerial={localStorage.getItem("khamin_player_serial") || ""}
             onRematch={() => {
               socket?.emit("speed_cups_propose_rematch", { roomId: room.id });
               GameEngineService.handleAction("speed_cups_propose_rematch", { roomId: room.id });
             }}
             onLeaveGame={onLeave}
             playSound={playSound}
           />
         </div>
       </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full relative select-none">
      <div className="flex items-center justify-between w-full px-2">
        <div className="flex flex-col items-center bg-gray-100 rounded-lg p-1.5 px-3">
          <span className="text-[10px] text-gray-500 font-bold">نقاطك</span>
          <span className="text-lg font-black text-pink-600">{myWins}</span>
        </div>

            {/* Cards count indicator above cards */}
            {room.gameState !== "speed_cups_finished" && room.speedCupsCards && (
              <div className="text-[10px] md:text-xs font-black text-pink-600 bg-pink-50 items-center h-8 flex justify-between border border-pink-200 rounded-full px-2.5 py-0.5 mb-2 whitespace-nowrap shadow-sm">
                الكروت: {(room.speedCupsCurrentCardIndex || 0) + 1} / {room.speedCupsCards.length}
              </div>
            )}

        <div className="flex flex-col items-center bg-gray-100 rounded-lg p-1.5 px-3">
          <span className="text-[10px] text-gray-500 font-bold">نقاط الخصم</span>
          <span className="text-lg font-black text-gray-700">{oppWins}</span>
        </div>
      </div>

      {/* Main Board - Side-by-side Layout with Perfectly Aligned Center Column to Prevent Overlaps */}
      <div className="flex flex-row items-end justify-between w-full min-h-[220px] md:min-h-[280px] mb-2">
        {/* Right Stack (Me) */}
        {renderStack(localStack, myDone, false)}
        
        {/* Center Area */}
        <div className="flex flex-col items-center justify-between flex-1 mx-2 h-full py-1">
          {/* Card Area */}
          <div className="flex flex-col items-center justify-start flex-1 min-h-0 w-full">

            <div className="relative flex items-center justify-center">
              {room.gameState === "speed_cups_waiting" ? (
                <div className="relative flex flex-col items-center">
                  <img src="/speed-cups/cards-back.png" className="w-30 md:w-40 h-auto animate-pulse" />
                  <div className="absolute inset-0 bg-black/45 rounded-xl flex items-center justify-center">
                    <motion.button 
                      onClick={() => {
                        socket?.emit("speed_cups_start", { roomId: room.id });
                        GameEngineService.handleAction("speed_cups_start", { roomId: room.id });
                      }}
                      disabled={((room.adPausedPlayersArray?.length || 0) > 0)}
                      animate={((room.adPausedPlayersArray?.length || 0) > 0) ? {} : { scale: [1, 1.05, 1] }}
                      transition={((room.adPausedPlayersArray?.length || 0) > 0) ? {} : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={((room.adPausedPlayersArray?.length || 0) > 0) ? {} : { scale: 1.08 }}
                      className={`font-black text-[14px] md:text-sm px-3 py-2 rounded-lg shadow-lg border-b-2 active:translate-y-0.5 active:border-b-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        ((room.adPausedPlayersArray?.length || 0) > 0)
                        ? "bg-gray-400 text-gray-200 border-gray-600 cursor-not-allowed"
                        : "bg-pink-500 hover:bg-pink-600 text-white border-pink-700"
                      }`}
                    >
                      <span>{((room.adPausedPlayersArray?.length || 0) > 0) ? "انتظر! 📺" : "ابدأ اللعب وسحب الكروت"}</span>
                      {!((room.adPausedPlayersArray?.length || 0) > 0) && <span className="text-base">👆</span>}
                    </motion.button>
                  </div>
                </div>
              ) : room.gameState === "speed_cups_countdown" ? (
                <div className="relative">
                  <img src="/speed-cups/cards-back.png" className="w-30 md:w-40 h-auto filter brightness-75" />
                  <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {room.speedCupsTimer}
                    </div>
                  </div>
                </div>
              ) : (room.gameState === "speed_cups_playing" || room.gameState === "speed_cups_evaluating") ? (
                <div className="relative animate-scale-in">
                  <img src={`/speed-cups/${currentCard?.card_name}.png`} className="w-30 md:w-40 h-auto" />
                  {room.gameState === "speed_cups_playing" && (
                    <div className="absolute -top-2.5 -right-2.5 bg-red-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                      {room.speedCupsTimer}
                    </div>
                  )}
                </div>
              ) : (
                <img src="/speed-cups/cards-back.png" className="w-20 md:w-28 h-auto opacity-40 grayscale" />
              )}
            </div>
          </div>
          
          {/* Bell Area - Positioned below card area with guaranteed vertical margin */}
          <div className="mt-4 mb-1 flex justify-center">
            <img 
              src={`/speed-cups/desktop-bell-${myDone ? 'after-clicked' : 'before-click'}.png`} 
              className={`w-20 md:w-25 h-auto cursor-pointer transition-all duration-150 ${!myDone && room.gameState === "speed_cups_playing" && !((room.adPausedPlayersArray?.length || 0) > 0) ? "active:scale-90 hover:scale-105" : "opacity-50"}`}
              onClick={() => {
                if (room.gameState === "speed_cups_playing" && !myDone && localStack.length === 5 && !((room.adPausedPlayersArray?.length || 0) > 0)) {
                  playSound("deskBell");
                  socket?.emit("speed_cups_ring_bell", { roomId: room.id });
                  GameEngineService.handleAction("speed_cups_ring_bell", { roomId: room.id, playerId: socket?.id });
                }
              }}
            />
          </div>
        </div>
        
        {/* Left Stack (Opponent) */}
        {renderStack(oppStack, oppDone, true)}
      </div>

      {/* Cups to click */}
      <div className="flex justify-center gap-2.5 md:gap-3 bg-pink-100 p-2 md:p-3 rounded-2xl border-2 border-gray-200 w-full relative overflow-hidden">
        {cupOrder.map(color => {
           const isUsed = localStack.includes(color);
           return (
             <button
               key={color}
               disabled={room.gameState !== "speed_cups_playing" || myDone || isUsed || ((room.adPausedPlayersArray?.length || 0) > 0)}
               onClick={() => {
                 playSound("handXFill");
                 const currentLocalStack = localStackRef.current;
                 if (!currentLocalStack.includes(color) && currentLocalStack.length < 5) {
                   const newStack = [...currentLocalStack, color];
                   localStackRef.current = newStack;
                   setLocalStack(newStack);
                   socket?.emit("speed_cups_click_cup", { roomId: room.id, color });
                   GameEngineService.handleAction("speed_cups_click_cup", { roomId: room.id, color, playerId: socket?.id });
                 }
               }}
               className={`transition-all ${isUsed || room.gameState !== "speed_cups_playing" || ((room.adPausedPlayersArray?.length || 0) > 0) ? 'opacity-30 grayscale cursor-not-allowed' : 'active:scale-90 hover:-translate-y-1 cursor-pointer'}`}
             >
               <img src={`/speed-cups/${color}-cup.png`} className="w-10 md:w-14 h-auto object-contain" />
             </button>
           );
        })}
      </div>
      <div className="text-[9px] text-red-500 font-bold mt-1 text-center w-full">
        اللاعب اللي يرتب الألوان ويضغط الجرس الأول يكسب الجولة!
      </div>
    </div>
  );
};

let sessionAdFailuresCount = parseInt(
  localStorage.getItem("khamin_ad_failures") || "0",
);

export default function App() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const { customConfig, refreshConfig } = useAvatarConfig();
  const appVersion = customConfig.version || "1.1.1";
  const [initialVersion, setInitialVersion] = useState<string | null>(() => {
    const meta = document.querySelector('meta[name="app-version"]');
    const v = meta?.getAttribute("content");
    return (v && v !== "{{VERSION}}") ? v : null;
  });
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
    onNeedRefresh() {
      console.log("[DEBUG] New SW available, showing update banner...");
      setNeedsUpdate(true);
    },
  });

  useEffect(() => {
    if (typeof window.adConfig === "function") {
      try {
        window.adConfig({
          preloadAdBreaks: "on",
          sound: "on",
          maxAdContentRating: "T",
          onReady: () => {
            console.log("H5 Games Ads ready");
          },
        });
      } catch (e) {
        console.error("Failed to initialize adConfig", e);
      }
    }
  }, []);

  useEffect(() => {
    if (customConfig.version && !initialVersion) {
      setInitialVersion(customConfig.version);
    }
  }, [customConfig.version, initialVersion]);

  const renderQuantity = (
    total: number,
    tempCount: number,
    tempColorClass: string = "text-purple-500",
  ) => {
    if (!total) return "0";
    const actualTemp = Math.min(total, tempCount || 0);
    const perm = total - actualTemp;
    if (actualTemp > 0) {
      return (
        <span dir="ltr">
          {perm}
          <span className={tempColorClass}>+{actualTemp}</span>
        </span>
      );
    }
    return String(total);
  };

  useEffect(() => {
    const lastOpenedStore = localStorage.getItem("khamin_last_opened_store");
    if (!lastOpenedStore) {
      setHasNewStoreOffers(true);
    } else {
      const lastOpenedTime = parseInt(lastOpenedStore);
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - lastOpenedTime > ONE_WEEK) {
        setHasNewStoreOffers(true);
      }
    }
  }, []);

  // Re-enabled version check but without forcing reloads
  useEffect(() => {
    if (
      initialVersion &&
      appVersion !== "1.1.1" &&
      appVersion !== initialVersion
    ) {
      console.log("New version detected from config:", appVersion);
      setNeedsUpdate(true);
      setNeedRefresh(true);
    }
  }, [appVersion, initialVersion, setNeedRefresh]);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(apiUrl("/api/version"));
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || !contentType.includes("application/json")) return;
        const data = await response.json();
        if (data.version && initialVersion && data.version !== initialVersion) {
          console.log("New version detected from API:", data.version);
          setNeedsUpdate(true);
          setNeedRefresh(true);
        }
      } catch (e) {
        // Silently ignore network / version check failures
      }
    };

    if (initialVersion) {
      // Periodically check version every 15 minutes (we skip immediate boot check to save bandwidth since we just fetched config)
      const interval = setInterval(checkVersion, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [initialVersion, setNeedRefresh]);

  useEffect(() => {
    if (customConfig.version) {
      const version = customConfig.version;

      // Update manifest
      const manifestLink = document.querySelector(
        "link[rel='manifest']",
      ) as HTMLLinkElement;
      if (manifestLink) {
        const currentHref = manifestLink.href || "";
        const baseManifest = currentHref.includes("webmanifest")
          ? "/manifest.webmanifest"
          : "/manifest.json";
        manifestLink.href = `${baseManifest}?v=${version}`;
      }
    }
  }, [customConfig.version]);

  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showNetworkErrorModal, setShowNetworkErrorModal] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    const isServerlessMode = typeof window !== 'undefined' && 
      (window.location.hostname.includes("github.io") || 
       !import.meta.env.VITE_SERVER_URL);

    if (isConnected || isServerlessMode) {
      const timer = setTimeout(() => {
        setIsReadyToPlay(true);
        if (isServerlessMode) {
          setIsConnecting(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsReadyToPlay(false);
    }
  }, [isConnected]);

  useEffect(() => {
    const isServerlessMode = typeof window !== 'undefined' && 
      (window.location.hostname.includes("github.io") || 
       !import.meta.env.VITE_SERVER_URL);

    if (isServerlessMode) {
      setShowNetworkErrorModal(false);
      return;
    }

    let timeoutId: any = null;
    const isCurrentlyDisconnected = !isConnected || isConnecting || !!connectionError;

    if (isCurrentlyDisconnected) {
      // If disconnected, wait 3 seconds before showing the modal to prevent flickering
      timeoutId = setTimeout(() => {
        setShowNetworkErrorModal(true);
      }, 3000);
    } else {
      // If connected, hide the modal immediately
      setShowNetworkErrorModal(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isConnected, isConnecting, connectionError]);

  const [reconnectWaitingMessage, setReconnectWaitingMessage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem("khamin_player_name") || "",
  );
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const [isHighestLikes, setIsHighestLikes] = useState(false);
  const [highestLikesSerials, setHighestLikesSerials] = useState<string[]>([]);
  const [highestStreakSerials, setHighestStreakSerials] = useState<string[]>(
    [],
  );
  const [highestLikesValue, setHighestLikesValue] = useState<number>(() => {
    try {
      return parseInt(
        localStorage.getItem("khamin_highest_likes_value") || "0",
      );
    } catch {
      return 0;
    }
  });
  const [highestLikesPlayers, setHighestLikesPlayers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("khamin_highest_likes_players");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [highestLevelValue, setHighestLevelValue] = useState<number>(() => {
    try {
      return parseInt(
        localStorage.getItem("khamin_highest_level_value") || "0",
      );
    } catch {
      return 0;
    }
  });
  const [highestLevelSerials, setHighestLevelSerials] = useState<string[]>([]);
  const [highestLevelPlayers, setHighestLevelPlayers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("khamin_highest_level_players");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [highestStreakValue, setHighestStreakValue] = useState<number>(() => {
    try {
      return parseInt(
        localStorage.getItem("khamin_highest_streak_value") || "0",
      );
    } catch {
      return 0;
    }
  });
  const [highestStreakPlayers, setHighestStreakPlayers] = useState<any[]>(
    () => {
      try {
        const cached = localStorage.getItem("khamin_highest_streak_players");
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    },
  );
  const [lastRenameAt, setLastRenameAt] = useState(() =>
    parseInt(localStorage.getItem("khamin_last_rename_at") || "0"),
  );
  const playerNameRef = useRef(playerName);
  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  const [xp, setXp] = useState(
    () => parseInt(localStorage.getItem("khamin_xp") || "0") || 0,
  );
  const [streak, setStreak] = useState(
    () => parseInt(localStorage.getItem("khamin_streak") || "0") || 0,
  );
  const [wins, setWins] = useState(
    () => parseInt(localStorage.getItem("khamin_wins") || "0") || 0,
  );
  const [tokens, setتخمينات] = useState(
    () => parseInt(localStorage.getItem("khamin_tokens") || "0") || 0,
  );
  const [keys, setKeys] = useState(
    () => parseInt(localStorage.getItem("khamin_keys") || "0") || 0,
  );
  const [busCompleteRewardLevel, setBusCompleteRewardLevel] = useState(
    () => parseInt(localStorage.getItem("khamin_bus_reward_level") || "1") || 1,
  );
  const [busCompleteMatchPoints, setBusCompleteMatchPoints] = useState(
    () => parseInt(localStorage.getItem("khamin_bus_match_points") || "0") || 0,
  );

  const [xoRewardLevel, setXoRewardLevel] = useState(
    () => parseInt(localStorage.getItem("khamin_xo_reward_level") || "1") || 1,
  );
  const [xoMatchPoints, setXoMatchPoints] = useState(
    () => parseInt(localStorage.getItem("khamin_xo_match_points") || "0") || 0,
  );
  const [iqMatchPoints, setIqMatchPoints] = useState(
    () => parseInt(localStorage.getItem("khamin_iq_match_points") || "0") || 0,
  );
  const [iqRewardLevel, setIqRewardLevel] = useState(
    () => parseInt(localStorage.getItem("khamin_iq_reward_level") || "1") || 1,
  );
  const [dotsRewardLevel, setDotsRewardLevel] = useState(
    () => parseInt(localStorage.getItem("khamin_dots_reward_level") || "1") || 1,
  );
  const [dotsMatchPoints, setDotsMatchPoints] = useState(
    () => parseInt(localStorage.getItem("khamin_dots_match_points") || "0") || 0,
  );
  const [speedCupsRewardLevel, setSpeedCupsRewardLevel] = useState(
    () => parseInt(localStorage.getItem("khamin_speed_cups_reward_level") || "1") || 1,
  );
  const [speedCupsMatchPoints, setSpeedCupsMatchPoints] = useState(
    () => parseInt(localStorage.getItem("khamin_speed_cups_match_points") || "0") || 0,
  );
  const [handRewardLevel, setHandRewardLevel] = useState(
    () => parseInt(localStorage.getItem("khamin_hand_reward_level") || "1") || 1,
  );
  const [handMatchPoints, setHandMatchPoints] = useState(
    () => parseInt(localStorage.getItem("khamin_hand_match_points") || "0") || 0,
  );
  const [tempItems, setTempItems] = useState<{
    keys: number;
    tokens: number;
    helpers: Record<string, number>;
  }>(() => {
    try {
      const saved = localStorage.getItem("khamin_temp_items");
      return saved ? JSON.parse(saved) : { keys: 0, tokens: 0, helpers: {} };
    } catch {
      return { keys: 0, tokens: 0, helpers: {} };
    }
  });

  useEffect(() => {
    localStorage.setItem("khamin_temp_items", JSON.stringify(tempItems));
  }, [tempItems]);
  const [likes, setLikes] = useState(
    () => parseInt(localStorage.getItem("khamin_likes") || "0") || 0,
  );
  const [playerSerial, setPlayerSerial] = useState(
    () => localStorage.getItem("khamin_player_serial") || "",
  );

  useEffect(() => {
    if (
      !playerName.trim() ||
      !socket ||
      playerName.trim() === (localStorage.getItem("khamin_player_name") || "")
    ) {
      setIsNameAvailable(null);
      setIsCheckingName(false);
      return;
    }

    setIsCheckingName(true);
    const timeoutId = setTimeout(() => {
      socket.emit(
        "check_name_availability",
        { name: playerName, playerSerial },
        (res: any) => {
          setIsNameAvailable(res.available);
          setIsCheckingName(false);
        },
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [playerName, socket, playerSerial]);
  useEffect(() => {
    let timer: any;
    if (isNameAvailable === true) {
      timer = setTimeout(() => {
        setIsNameAvailable(null);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isNameAvailable]);

  const [showKeyDrop, setShowKeyDrop] = useState(false);

  const [playerAge, setPlayerAge] = useState(() => {
    const storedAge = localStorage.getItem("khamin_player_age");
    return storedAge ? parseInt(storedAge) : "";
  });
  const [gender, setGender] = useState<"boy" | "girl">(
    () =>
      (localStorage.getItem("khamin_player_gender") as "boy" | "girl") || "boy",
  );
  const [playerId] = useState(() => {
    let id = localStorage.getItem("khamin_player_id");
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem("khamin_player_id", id);
    }
    return id;
  });
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  useEffect(() => {
    const setFp = async () => {
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      localStorage.setItem("khamin_fingerprint", result.visitorId);
      setFingerprint(result.visitorId);
    };
    setFp();
  }, []);

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showWCGiftModal, setShowWCGiftModal] = useState(false);
  const [googleRegistrationData, setGoogleRegistrationData] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHowToOpenEasyGuess, setShowHowToOpenEasyGuess] = useState(false);
  const [loginSerial, setLoginSerial] = useState("");
  const [loginToken, setLoginToken] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showProfileLoginModal, setShowProfileLoginModal] = useState(false);
  const [profileLoginSerial, setProfileLoginSerial] = useState("");
  const [profileLoginToken, setProfileLoginToken] = useState("");
  const [profileLoginError, setProfileLoginError] = useState("");
  const [pendingWelcomeModal, setPendingWelcomeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
  const [showGenerateLinkCodeModal, setShowGenerateLinkCodeModal] =
    useState(false);
  const [generatedLinkCode, setGeneratedLinkCode] = useState("");
  const [linkCodeToEnter, setLinkCodeToEnter] = useState("");
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [citySearchState, setCitySearchState] = useState<any>(null);
  const [isCitySearchLoaded, setIsCitySearchLoaded] = useState(false);
  const [displayedRewards, setDisplayedRewards] = useState<any>(null);

  const [citySearchTimeLeft, setCitySearchTimeLeft] = useState("");
  const [selectedCity, setSelectedCity] = useState(1);
  const [blockedPlayers, setBlockedPlayers] = useState<
    { serial: string; name: string }[]
  >([]);
  const [showBlockedPlayers, setShowBlockedPlayers] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [canSendComplaint, setCanSendComplaint] = useState(true);
  const [showShopModal, setShowShopModal] = useState(false);
  const [hasNewStoreOffers, setHasNewStoreOffers] = useState(false);
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [selectedWalletItem, setSelectedWalletItem] = useState<string | null>(
    null,
  );
  const [showTokenInfoModal, setShowTokenInfoModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [matchAdState, setMatchAdState] = useState<{ show: boolean; timer: number; adFailed: boolean; adStarted: boolean; }>({ show: false, timer: 0, adFailed: false, adStarted: false });
  const isOpponentWatchingAdInRoom = (roomObj: any, currentSocketId?: string, currentUserId?: string) => {
    if (!roomObj || !roomObj.adPausedPlayersArray || roomObj.adPausedPlayersArray.length === 0) return false;
    return roomObj.adPausedPlayersArray.some((id: string) => {
      if (id && (id === currentSocketId || id === currentUserId)) return false;
      const p = roomObj.players?.find((pl: any) => pl.id === id || pl.socketId === id || pl.serial === id);
      return p && !p.isBot;
    });
  };
  const matchesPlayedRef = useRef(0);
  const previousGameStateRef = useRef<string | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [hasWatchedCategoryAd, setHasWatchedCategoryAd] = useState(false);
  const [isWatchingCategoryAd, setIsWatchingCategoryAd] = useState(false);
  const [showCategoryAdButton, setShowCategoryAdButton] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(document.hidden);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("khamin_notifications_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [hideMyInfo, setHideMyInfo] = useState(() => {
    const saved = localStorage.getItem("khamin_hide_my_info");
    return saved !== null ? saved === "true" : false;
  });

  const [hideFriendRequests, setHideFriendRequests] = useState(() => {
    const saved = localStorage.getItem("khamin_hide_friend_requests");
    return saved !== null ? saved === "true" : false;
  });

  const [disableGuessChat, setDisableGuessChat] = useState(() => {
    const saved = localStorage.getItem("khamin_disable_guess_chat");
    return saved !== null ? saved === "true" : false;
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const toggleTokenInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showTokenInfoModal) {
      playSound("clickClose");
    } else {
      playSound("clickOpen");
    }
    setShowTokenInfoModal(!showTokenInfoModal);
  };

  const [showAdConfirmation, setShowAdConfirmation] = useState(false);
  const [readyPowerUps, setReadyPowerUps] = useState<string[]>([]);
  const [adStatus, setAdStatus] = useState({
    adsWatched: 0,
    maxAds: 5,
    canWatch: false,
    loading: true,
  });
  const [keyAdStatus, setKeyAdStatus] = useState({
    adsWatched: 0,
    maxAds: 5,
    canWatch: false,
    loading: true,
  });
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isKeyCooldown, setIsKeyCooldown] = useState(false);
  const [keyCooldownTime, setKeyCooldownTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldown && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    } else if (cooldownTime === 0) {
      setIsCooldown(false);
    }
    return () => clearInterval(timer);
  }, [isCooldown, cooldownTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isKeyCooldown && keyCooldownTime > 0) {
      timer = setInterval(() => {
        setKeyCooldownTime((prev) => prev - 1);
      }, 1000);
    } else if (keyCooldownTime === 0) {
      setIsKeyCooldown(false);
    }
    return () => clearInterval(timer);
  }, [isKeyCooldown, keyCooldownTime]);

  useEffect(() => {
    if (socket && isConnected && playerSerial) {
      socket.emit("check_ad_status", { serial: playerSerial });
      socket.emit("check_key_ad_status", { serial: playerSerial });

      socket.on("ad_status", (status) => {
        setAdStatus({ ...status, loading: false });
      });

      socket.on("key_ad_status", (status) => {
        setKeyAdStatus({ ...status, loading: false });
      });

      socket.on("ad_success", (data) => {
        setتخمينات(data.tokens);
        localStorage.setItem("khamin_tokens", data.tokens.toString());
        setAdStatus((prev) => ({
          ...prev,
          adsWatched: data.adsWatched,
          canWatch: data.adsWatched < data.maxAds,
        }));
        playSound("win");
        showAlert("تمت إضافة التخمينة بنجاح! 🎉", "نجاح");
      });

      socket.on("key_ad_success", (data) => {
        localStorage.setItem("khamin_keys", data.keys.toString());
        setKeyAdStatus((prev) => ({
          ...prev,
          adsWatched: data.adsWatched,
          canWatch: data.adsWatched < data.maxAds,
        }));
        playSound("win");
        showAlert("تمت إضافة المفتاح بنجاح! 🎉", "نجاح");
      });

      socket.on("ad_error", (msg) => {
        showAlert(msg, "تنبيه");
      });

      socket.on("rain_gift_error", (msg) => {
        showAlert(msg, "تنبيه");
        localStorage.removeItem("khamin_pending_rain_gift");
        setCollectedRewards({ xp: 0, tokens: 0, helpers: {} });
        setShowRainGiftSummary(false);
      });

      // Sync notifications status
      socket.emit("update_player_notifications", {
        serial: playerSerial,
        enabled: notificationsEnabled,
      });

      return () => {
        socket.off("ad_status");
        socket.off("key_ad_status");
        socket.off("ad_success");
        socket.off("key_ad_success");
        socket.off("ad_error");
        socket.off("rain_gift_error");
      };
    }
  }, [socket, isConnected, playerSerial, notificationsEnabled]);

  const [proPackageExpiry, setProPackageExpiry] = useState<number | null>(
    () => {
      const saved = localStorage.getItem("khamin_pro_package_expiry");
      if (saved) return parseInt(saved);
      if (localStorage.getItem("khamin_pro_package") === "true") {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("khamin_pro_package_expiry", expiry.toString());
        localStorage.removeItem("khamin_pro_package");
        return expiry;
      }
      return null;
    },
  );
  const [unlockedHelpersExpiry, setUnlockedHelpersExpiry] = useState<
    number | null
  >(() => {
    const saved = localStorage.getItem("khamin_unlocked_helpers_expiry");
    if (saved) return parseInt(saved);
    return null;
  });
  const hasProPackage =
    proPackageExpiry !== null && proPackageExpiry > Date.now();
  const hasUnlockedHelpers =
    unlockedHelpersExpiry !== null && unlockedHelpersExpiry > Date.now();
  const proPackageDaysLeft = hasProPackage
    ? Math.ceil((proPackageExpiry! - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const prevLevelRef = useRef(getLevel(xp));

  useEffect(() => {
    const currentLevel = getLevel(xp);
    if (currentLevel > prevLevelRef.current) {
      let milestoneCrossed = null;
      for (let m of [10, 20, 30, 40, 50]) {
        if (prevLevelRef.current < m && currentLevel >= m) {
          milestoneCrossed = m;
        }
      }

      if (milestoneCrossed) {
        setShowLevelUp(milestoneCrossed);
      } else {
        setShowLevelUp(currentLevel);
      }
      playSound("win");
    }
    prevLevelRef.current = currentLevel;
  }, [xp]);
  const [showMatchIntro, setShowMatchIntro] = useState(false);

  // Rain Gift Event States
  const [showRainGiftGame, setShowRainGiftGame] = useState(false);
  const [isRainGiftActive, setIsRainGiftActive] = useState(false);
  const [rainGiftCountdown, setRainGiftCountdown] = useState<string>("");
  const [rainGiftParticipants, setRainGiftParticipants] = useState<number>(0);
  const [fallingItems, setFallingItems] = useState<any[]>([]);
  const [collectedRewards, setCollectedRewards] = useState({
    xp: 0,
    tokens: 0,
    helpers: {} as Record<string, number>,
  });
  const [gameTimer, setGameTimer] = useState(180);
  const [showRainGiftSummary, setShowRainGiftSummary] = useState(false);
  const [hasPaidForCurrentRainEvent, setHasPaidForCurrentRainEvent] =
    useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      try {
        const egyptTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
        );
        const target = new Date(egyptTime);
        target.setHours(19, 0, 0, 0);

        const diffMinutes =
          (egyptTime.getTime() - target.getTime()) / (1000 * 60);
        const active = diffMinutes >= 0 && diffMinutes <= 3;

        setIsRainGiftActive(active);

        // Reset payment status when event is not active
        if (!active && hasPaidForCurrentRainEvent) {
          setHasPaidForCurrentRainEvent(false);
        }

        // Clear unclaimed rewards 10 minutes before the next event (18:50 to 19:00)
        if (diffMinutes >= -10 && diffMinutes < 0) {
          if (localStorage.getItem("khamin_pending_rain_gift")) {
            localStorage.removeItem("khamin_pending_rain_gift");
            setCollectedRewards({ xp: 0, tokens: 0, helpers: {} });
          }
        }

        if (active) {
          setRainGiftCountdown("الحدث متاح الآن!");
        } else {
          if (egyptTime > target) {
            target.setDate(target.getDate() + 1);
          }
          const diff = target.getTime() - egyptTime.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setRainGiftCountdown(
            `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          );
        }
      } catch (e) {
        // Fallback if timezone not supported
        const utcHour = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        const targetUTCHour = 17; // 7 PM Egypt is roughly 17:00 UTC
        const active = utcHour === targetUTCHour && utcMinutes <= 3;
        setIsRainGiftActive(active);

        // Reset payment status when event is not active
        if (!active && hasPaidForCurrentRainEvent) {
          setHasPaidForCurrentRainEvent(false);
        }

        // Clear unclaimed rewards 10 minutes before the next event (16:50 UTC to 17:00 UTC)
        if (utcHour === targetUTCHour - 1 && utcMinutes >= 50) {
          if (localStorage.getItem("khamin_pending_rain_gift")) {
            localStorage.removeItem("khamin_pending_rain_gift");
            setCollectedRewards({ xp: 0, tokens: 0, helpers: {} });
          }
        }

        setRainGiftCountdown(active ? "الحدث متاح الآن!" : "قريباً...");
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isRainGiftActive) {
      setRainGiftParticipants((prev) =>
        prev === 0 ? Math.floor(Math.random() * 50) + 120 : prev,
      );
      const participantInterval = setInterval(
        () => {
          setRainGiftParticipants(
            (prev) => prev + Math.floor(Math.random() * 2) + 1,
          ); // increment 1-2
        },
        3000 + Math.random() * 4000,
      );
      return () => clearInterval(participantInterval);
    } else {
      setRainGiftParticipants(0);
    }
  }, [isRainGiftActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;

    if (showRainGiftGame) {
      const calculateRemainingTime = () => {
        if (!isRainGiftActive) return 180; // Allow admin testing outside window
        try {
          const now = new Date();
          const egyptTime = new Date(
            now.toLocaleString("en-US", { timeZone: "Africa/Cairo" }),
          );
          const target = new Date(egyptTime);
          target.setHours(19, 0, 0, 0);

          const elapsedSeconds = Math.floor(
            (egyptTime.getTime() - target.getTime()) / 1000,
          );
          const remainingSeconds = 180 - elapsedSeconds;
          return Math.max(0, Math.min(180, remainingSeconds));
        } catch (e) {
          const now = new Date();
          const utcHour = now.getUTCHours();
          const utcMinutes = now.getUTCMinutes();
          const utcSeconds = now.getUTCSeconds();
          const targetUTCHour = 17; // 7 PM Egypt is 17:00 UTC
          if (utcHour === targetUTCHour && utcMinutes <= 3) {
            const elapsed = utcMinutes * 60 + utcSeconds;
            return Math.max(0, 180 - elapsed);
          }
          return 180;
        }
      };

      setGameTimer(calculateRemainingTime());
      setCollectedRewards({ xp: 0, tokens: 0, helpers: {} });
      setFallingItems([]);

      interval = setInterval(() => {
        setGameTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            clearInterval(spawnInterval);
            setTimeout(() => {
              setShowRainGiftGame(false);
              setShowRainGiftSummary(true);
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      spawnInterval = setInterval(() => {
        const id = Math.random().toString(36).substr(2, 9);
        const x = Math.random() * 60 + 20; // 20% to 80% to keep items fully inside the screen
        const duration = Math.random() * 1.5 + 2; // Slightly faster: 2s to 3.5s

        const rand = Math.random();
        let type: "xp" | "token" | "helper" = "xp";
        let value: any = 10;
        let icon = "⭐";

        if (rand < 0.8) {
          // 80% XP chance
          type = "xp";
          value = 10;
          icon = `${value}XP`;
        } else if (rand < 0.82) {
          // 2% تخمينة chance
          type = "token";
          value = 1;
          icon = "🪙";
        } else {
          // Helper items (18% chance)
          type = "helper";
          const helpers = [
            {
              id: "spy_lens",
              icon: <Eye className="w-8 h-8 text-purple-500" />,
            },
            {
              id: "time_freeze",
              icon: <Snowflake className="w-8 h-8 text-cyan-500" />,
            },
            {
              id: "hint",
              icon: <HelpCircle className="w-8 h-8 text-blue-500" />,
            },
            {
              id: "word_count",
              icon: <Hash className="w-8 h-8 text-indigo-500" />,
            },
            {
              id: "word_length",
              icon: <Type className="w-8 h-8 text-green-500" />,
            },
          ];
          const h = helpers[Math.floor(Math.random() * helpers.length)];
          value = h.id;
          icon = h.icon;
        }

        const newItem = {
          id,
          x,
          duration,
          type,
          value,
          icon,
          size: Math.random() * 30 + 50,
        }; // Larger: 60px to 90px
        setFallingItems((prev) => [...prev, newItem]);

        setTimeout(() => {
          setFallingItems((prev) => prev.filter((i) => i.id !== id));
        }, duration * 1000);
      }, 350);
    }

    return () => {
      clearInterval(interval);
      clearInterval(spawnInterval);
    };
  }, [showRainGiftGame]);

  useEffect(() => {
    if (socket) {
      socket.on("force_refresh", () => {
        setNeedRefresh(true);
        setNeedsUpdate(true);
      });
      return () => {
        socket.off("force_refresh");
      };
    }
  }, [socket, setNeedRefresh]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [myLeaderboardRank, setMyLeaderboardRank] = useState<number | null>(() => {
    try {
      const cached = localStorage.getItem("khamin_my_rank");
      return cached !== null ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [topPlayers, setTopPlayers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("khamin_top_players");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [leaderboardFilter, setLeaderboardFilter] = useState<
    "all" | "busComplete" | "xo" | "hand" | "iq" | "dots" | "speedCups" | "bombParty" | "wordle" | "connectFourWords" | "spaceWar" | "wins" | "streak" | "likes"
  >("all");
  const [leaderboardVisibleCount, setLeaderboardVisibleCount] = useState(10);

  useEffect(() => {
    setLeaderboardVisibleCount(10);
    if (!showLeaderboardModal) {
      setLeaderboardFilter("all");
    }
  }, [leaderboardFilter, showLeaderboardModal]);

  const sortedTopPlayers = useMemo(() => {
    let sorted = [...topPlayers];
    if (leaderboardFilter === "busComplete") {
      sorted.sort((a, b) => (b.busCompleteWins || 0) - (a.busCompleteWins || 0));
    } else if (leaderboardFilter === "bombParty") {
      sorted.sort((a, b) => (b.bombPartyWins || 0) - (a.bombPartyWins || 0));
    } else if (leaderboardFilter === "xo") {
      sorted.sort((a, b) => (b.xoWins || 0) - (a.xoWins || 0));
    } else if (leaderboardFilter === "hand") {
      sorted.sort((a, b) => (b.handWins || 0) - (a.handWins || 0));
    } else if (leaderboardFilter === "iq") {
      sorted.sort((a, b) => (b.iqWins || 0) - (a.iqWins || 0));
    } else if (leaderboardFilter === "dots") {
      sorted.sort((a, b) => (b.dotsWins || 0) - (a.dotsWins || 0));
    } else if (leaderboardFilter === "speedCups") {
      sorted.sort((a, b) => (b.speedCupsWins || 0) - (a.speedCupsWins || 0));
    } else if (leaderboardFilter === "wordle") {
      sorted.sort((a, b) => (b.wordleWins || 0) - (a.wordleWins || 0));
    } else if (leaderboardFilter === "connectFourWords") {
      sorted.sort((a, b) => (b.connectFourWordsWins || 0) - (a.connectFourWordsWins || 0));
    } else if (leaderboardFilter === "spaceWar") {
      sorted.sort((a, b) => (b.spaceWarWins || 0) - (a.spaceWarWins || 0));
    } else if (leaderboardFilter === "puzzle") {
      sorted.sort((a, b) => (b.puzzleWins || 0) - (a.puzzleWins || 0));
    } else if (leaderboardFilter === "beachRace") {
      sorted.sort((a, b) => (b.beachRaceWins || 0) - (a.beachRaceWins || 0));
    } else if (leaderboardFilter === "wins") {
      sorted.sort((a, b) => (b.wins || 0) - (a.wins || 0));
    } else if (leaderboardFilter === "streak") {
      sorted.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    } else if (leaderboardFilter === "likes") {
      sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return sorted;
  }, [topPlayers, leaderboardFilter]);

  const handleLeaderboardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
      if (leaderboardVisibleCount < sortedTopPlayers.length) {
        setLeaderboardVisibleCount((prev) =>
          Math.min(prev + 10, sortedTopPlayers.length),
        );
      }
    }
  };
  const [customAvatar, setCustomAvatar] = useState(
    () => localStorage.getItem("khamin_custom_avatar") || "",
  );
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("khamin_is_admin") === "true",
  );
  const [mockAdProviderState, setMockAdProviderState] = useState<{
    onComplete: () => void;
    onDismissed?: () => void;
  } | null>(null);
  const [adSolveCategory, setAdSolveCategory] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow any origin that ends with .run.app or is localhost to be safe, however since it's just passing tokens to current origin it's okay.
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        const payload = event.data.payload;
        if (payload.isAdmin === "true") {
          setIsAdmin(true);
          localStorage.setItem("khamin_is_admin", "true");
          localStorage.setItem("khamin_admin_email", payload.email || "");
          localStorage.setItem("khamin_admin_token", payload.adminToken || "");
          window.location.reload();
        } else {
          // Regular user google login
          if (socket) {
            socket.emit(
              "google_login_or_register",
              {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                fingerprint: localStorage.getItem("khamin_fingerprint"),
              },
              (response: any) => {
                if (response.error) {
                  showAlert(response.error, "خطأ");
                  return;
                }
                if (response.requiresRegistration) {
                  setGoogleRegistrationData({
                    email: response.email,
                    name: response.name,
                  });
                  setPlayerName(response.name || "");
                  setShowWelcomeModal(true);
                  setShowCreateAccount(true);
                } else {
                  const { serial, name, secretToken } = response;
                  if (serial) {
                    setPlayerSerial(serial);
                    setPlayerName(name);
                    localStorage.setItem("khamin_player_serial", serial);
                    if (secretToken)
                      localStorage.setItem("khamin_secret_token", secretToken);
                    localStorage.setItem("khamin_player_name", name);

                    socket.emit("set_player_serial_for_socket", {
                      serial,
                      fingerprint: localStorage.getItem("khamin_fingerprint"),
                      secretToken,
                    });
                    setShowWelcomeModal(false);
                    setShowCreateAccount(false);

                    playSound("clickClose");
                    setGoogleRegistrationData(null);

                    socket.emit(
                      "get_player_data",
                      {
                        serial,
                        fingerprint: localStorage.getItem("khamin_fingerprint"),
                        secretToken,
                      },
                      (playerData: any) => {
                        if (playerData && !playerData.error) {
                          setPlayerName(playerData.name);
                          setAvatar(playerData.avatar);
                          setXp(playerData.xp || 0);
                        }
                      },
                    );
                  }
                }
              },
            );
          }
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [socket]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin_auth") === "success") {
      const isAdminParam = params.get("isAdmin") === "true";
      setIsAdmin(isAdminParam);
      localStorage.setItem("khamin_is_admin", isAdminParam.toString());
      if (isAdminParam) {
        localStorage.setItem("khamin_admin_email", params.get("email") || "");
        localStorage.setItem(
          "khamin_admin_token",
          params.get("adminToken") || "",
        );
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  }, []);

  useEffect(() => {
    if (socket && isConnected && isAdmin) {
      const adminToken = localStorage.getItem("khamin_admin_token");
      const adminEmail =
        localStorage.getItem("khamin_admin_email") || "adhamsabry.co@gmail.com";
      socket.emit(
        "admin_set_admin_status",
        {
          serial: playerSerial,
          isAdmin: true,
          email: adminEmail,
          adminToken,
        },
        (res: any) => {
          if (res?.success) {
            if (res.adminToken) {
              localStorage.setItem("khamin_admin_token", res.adminToken);
            }
            if (Array.isArray(res.players)) setAdminPlayers(res.players);
            if (Array.isArray(res.reports)) setAdminReports(res.reports);
          }
        },
      );
    }
  }, [socket, isConnected, isAdmin, playerSerial]);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminReports, setAdminReports] = useState<any[]>([]);
  const [adminPlayers, setAdminPlayers] = useState<any[]>([]);
  const [adminPlayerFilter, setAdminPlayerFilter] = useState<
    "all" | "reports" | "level" | "wins" | "streak" | "online" | "banned"
  >("all");
  const [adminVisiblePlayersCount, setAdminVisiblePlayersCount] = useState(10);
  const adminPlayersListRef = useRef<HTMLDivElement>(null);
  const filteredAdminPlayers = useMemo(() => {
    let players = [...adminPlayers];

    // Apply search
    if (adminSearchQuery) {
      players = players.filter(
        (p) =>
          (p.name && p.name.includes(adminSearchQuery)) ||
          (p.serial && p.serial.includes(adminSearchQuery)),
      );
    }

    // Apply sorting/filtering
    switch (adminPlayerFilter) {
      case "reports":
        players.sort((a, b) => (b.reports || 0) - (a.reports || 0));
        break;
      case "level":
        players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        break;
      case "wins":
        players.sort((a, b) => (b.wins || 0) - (a.wins || 0));
        break;
      case "streak":
        players.sort((a, b) => (b.streak || 0) - (a.streak || 0));
        break;
      case "online":
        players = players.filter((p) => p.isOnline);
        players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        break;
      case "banned":
        players = players.filter(
          (p) =>
            (p.banUntil && p.banUntil > Date.now()) || p.isPermanentBan === 1,
        );
        players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        break;
      default:
        // Default sort by XP or something
        players.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        break;
    }

    return players;
  }, [adminPlayers, adminSearchQuery, adminPlayerFilter]);

  const handleAdminPlayersScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
        if (adminVisiblePlayersCount < filteredAdminPlayers.length) {
          setAdminVisiblePlayersCount((prev) => prev + 10);
        }
      }
    },
    [adminVisiblePlayersCount, filteredAdminPlayers.length],
  );

  useEffect(() => {
    setAdminVisiblePlayersCount(10);
  }, [adminSearchQuery, adminPlayerFilter]);
  const [adminEmail, setAdminEmail] = useState(
    () => localStorage.getItem("khamin_admin_email") || "",
  );
  const [adminTab, setAdminTab] = useState<
    | "players"
    | "images"
    | "customization"
    | "shop"
    | "announcements"
    | "rewards"
    | "policies"
    | "avatar_review"
    | "contacts"
    | "quick_chat"
  >("players");
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [adminContacts, setAdminContacts] = useState<any[]>([]);
  const [replyingToContact, setReplyingToContact] = useState<number | null>(
    null,
  );
  const [replyingToReport, setReplyingToReport] = useState<string | null>(null);
  const [contactReplyMessage, setContactReplyMessage] = useState("");
  const [reportReplyMessage, setReportReplyMessage] = useState("");
  const [activeRooms, setActiveRooms] = useState<any[]>([]);

  const [spectatingRoomId, setSpectatingRoomId] = useState<string | null>(null);
  const spectatingRoomIdRef = useRef<string | null>(null);
  const spectatorChatEndRef = useRef<HTMLDivElement>(null);
  const [spectatorRoomData, setSpectatorRoomData] = useState<any>(null);

  const updateSpectatingRoomId = (id: string | null) => {
    setSpectatingRoomId(id);
    spectatingRoomIdRef.current = id;
  };

  useEffect(() => {
    if (spectatorChatEndRef.current) {
      const parent = spectatorChatEndRef.current.parentElement;
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [spectatorRoomData?.chatHistory]);

  useEffect(() => {
    if (spectatingRoomId && activeRooms.length === 0 && socket) {
      socket.emit("admin_get_active_rooms", (rooms: any) => {
        if (Array.isArray(rooms)) setActiveRooms(rooms);
      });
    }
  }, [spectatingRoomId, socket, activeRooms.length]);
  const [pendingAvatars, setPendingAvatars] = useState<
    { serial: string; name: string; level: number; pendingAvatar: string }[]
  >([]);
  const [avatarStatus, setAvatarStatus] = useState<
    "approved" | "pending" | "rejected"
  >("approved");
  const [adminAnnouncementMessage, setAdminAnnouncementMessage] = useState(
    "تنبيه: سيتم تحديث اللعبة خلال 10 دقائق، نرجو إنهاء الجولات الحالية!\nوعدم دخول جولات جديدة الان.",
  );
  const [adminRewardType, setAdminRewardType] = useState<
    "pro_package" | "unlock_helpers" | "tokens"
  >("pro_package");
  const [adminRewardDuration, setAdminRewardDuration] = useState<number>(24);
  const [adminRewardMessage, setAdminRewardMessage] = useState(
    "هدية مجانية لجميع اللاعبين! استمتع بباقة المحترفين مجاناً.",
  );
  const [adminTokenRewardAmount, setAdminTokenRewardAmount] =
    useState<number>(100);
  const [adminTokenRewardMessage, setAdminTokenRewardMessage] = useState(
    "هدية خاصة للاعبين المميزين (مستوى 50+) 🎁",
  );
  const [confirmTokenSend, setConfirmTokenSend] = useState(false);
  const [gamePolicies, setGamePolicies] = useState(() => {
    const saved = localStorage.getItem("khamin_game_policies");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRainGiftEnabled === undefined)
          parsed.isRainGiftEnabled = true;
        return parsed;
      } catch (e) {}
    }
    return {
      termsAr: "",
      termsEn: "",
      privacyAr: "",
      privacyEn: "",
      isRainGiftEnabled: true,
    };
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    subject: "",
    message: "",
  });
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(
    () => window.location.pathname,
  );

  useEffect(() => {
    const handlePopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentRoute(path);
  };
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [adminImages, setAdminImages] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [paymobSettings, setPaymobSettings] = useState({
    paymob_api_key:
      "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFek9EazBNU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5ySGdYVGNEVmFpSkQ2bTktQ1lETzJzSEV1N3JqVjR1RkdpR2F2dHlZNEM4T0JicXFSYWF3NEFqVWdES1otQ25NOHd3aGtDZlVfVFk3UkRjNV9jZ3BUZw==",
    paymob_wallet_integration_id: "5579190",
    paymob_card_integration_id: "5572379",
    paymob_iframe_id: "1013400",
    paymob_hmac: "A2DBAF7F92579F5B6CE8687D60BE29BA",
  });
  const [luckyWheelEnabled, setLuckyWheelEnabled] = useState(() => {
    const saved = localStorage.getItem("khamin_lucky_wheel_enabled");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("khamin_game_policies", JSON.stringify(gamePolicies));
  }, [gamePolicies]);

  useEffect(() => {
    localStorage.setItem(
      "khamin_lucky_wheel_enabled",
      luckyWheelEnabled.toString(),
    );
  }, [luckyWheelEnabled]);

  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    const s = window.location.search.toLowerCase();
    return { pathname: p, hash: h, search: s };
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath({
        pathname: window.location.pathname.toLowerCase(),
        hash: window.location.hash.toLowerCase(),
        search: window.location.search.toLowerCase(),
      });
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const p = currentPath.pathname;
    const h = currentPath.hash;
    const s = currentPath.search;
    const searchParams = new URLSearchParams(s);
    const isAdminRoute =
      p.endsWith("/admin") ||
      p.endsWith("/admin/") ||
      h === "#admin" ||
      h === "#/admin" ||
      searchParams.get("page") === "admin" ||
      searchParams.get("admin") === "true" ||
      searchParams.get("isadmin") === "true";

    if (isAdminRoute) {
      if (isAdmin) {
        setShowAdminDashboard(true);
        setShowAdminLogin(false);
      } else {
        setShowAdminDashboard(false);
        setShowAdminLogin(true);
      }
    } else {
      setShowAdminDashboard(false);
      setShowAdminLogin(false);
    }
  }, [currentPath, isAdmin]);

  useEffect(() => {
    if (adminTab === "rewards" && isAdmin) {
      socket?.emit("admin_get_reward_history", (history: any[]) => {
        setRewardHistory(history);
      });
    }
  }, [adminTab, isAdmin, socket]);

  const [newImage, setNewImage] = useState({
    category: "animals",
    name: "",
    data: "",
  });
  const [newCategory, setNewCategory] = useState({
    id: "",
    name: "",
    icon: "",
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [adminImageSearchQuery, setAdminImageSearchQuery] = useState("");
  const [expandedAdminCategories, setExpandedAdminCategories] = useState<
    Record<string, boolean>
  >({});
  const [visibleImagesCount, setVisibleImagesCount] = useState<
    Record<string, number>
  >({});
  const [expandedUploadLevel, setExpandedUploadLevel] = useState<string>(
    "مستوي مبتدئين التخمين",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Sound Settings
  const [sfxVolume, setSfxVolume] = useState(() =>
    parseFloat(localStorage.getItem("khamin_sfx_volume") || "1"),
  );
  const [musicVolume, setMusicVolume] = useState(() =>
    parseFloat(localStorage.getItem("khamin_music_volume") || "0.5"),
  );
  const [isSfxMuted, setIsSfxMuted] = useState(
    () => localStorage.getItem("khamin_sfx_muted") === "true",
  );
  const [isMusicMuted, setIsMusicMuted] = useState(
    () => localStorage.getItem("khamin_music_muted") === "true",
  );

  useEffect(() => {
    localStorage.setItem("khamin_sfx_volume", sfxVolume.toString());
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem("khamin_music_volume", musicVolume.toString());
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem("khamin_sfx_muted", isSfxMuted.toString());
  }, [isSfxMuted]);

  useEffect(() => {
    localStorage.setItem("khamin_music_muted", isMusicMuted.toString());
  }, [isMusicMuted]);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      if (!url.startsWith("data:")) {
        image.setAttribute("crossOrigin", "anonymous");
      }
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
  ): Promise<string | null> => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      canvas.width = 200;
      canvas.height = 200;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        200,
        200,
      );

      return canvas.toDataURL("image/jpeg", 0.6);
    } catch (e) {
      console.error("Error creating cropped image:", e);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        showAlert("يرجى اختيار ملف صورة صالح", "خطأ");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        showAlert("حجم الصورة كبير جداً (الحد الأقصى 2 ميجابايت)", "خطأ");
        return;
      }

      // Image compression system
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 800;
              const MAX_HEIGHT = 800;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.6));
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });
      };

      try {
        const compressedDataUrl = await compressImage(file);
        setImageSrc(compressedDataUrl);
        setShowCropper(true);
      } catch (err) {
        setError("حدث خطأ أثناء ضغط الصورة");
      }
    }
  };

  const checkImageSafety = async (
    base64Image: string,
  ): Promise<"safe" | "unsafe" | "suspicious"> => {
    try {
      const apiKey =
        process.env.GEMINI_API_KEY || (process as any).env?.GOOGLE_API_KEY;
      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        console.warn(
          "GEMINI_API_KEY is missing or invalid. Falling back to manual review.",
        );
        return "suspicious";
      }

      const ai = new GoogleGenAI({ apiKey });

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(",")[1],
        },
      };

      const prompt =
        "Analyze this image for a children's game. Is it safe for kids? \n" +
        "- 'safe': Clearly safe objects (e.g., animals like horses, cats, giraffes, nature, toys, cartoons, friendly faces). Animals are ALWAYS safe.\n" +
        "- 'unsafe': Clearly inappropriate (e.g., nudity, gore, violence, drugs, hate symbols).\n" +
        "- 'suspicious': Borderline, contains text, or is unclear.\n" +
        "Respond with ONLY one word: 'safe', 'unsafe', or 'suspicious'.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [imagePart, { text: prompt }] }],
      });

      const result = response.text?.toLowerCase().trim();
      console.log("AI Safety Result:", result);
      if (result === "safe" || result === "unsafe" || result === "suspicious")
        return result as any;
      return "suspicious";
    } catch (error) {
      console.error("AI Safety Check failed:", error);
      // If it's a specific API error (like invalid key), log it clearly
      if (error instanceof Error && error.message.includes("API_KEY_INVALID")) {
        console.error(
          "The provided Gemini API key is invalid. Please check your Secrets settings.",
        );
      }
      return "suspicious"; // Fallback to manual review if AI fails
    }
  };

  useEffect(() => {
    if (adminTab === "avatar_review" && socket) {
      socket.emit("admin_get_pending_avatars", (pending: any) => {
        if (Array.isArray(pending)) setPendingAvatars(pending);
      });
    } else if (adminTab === "contacts" && socket) {
      socket.emit("admin_get_contacts", (contacts: any) => {
        if (Array.isArray(contacts)) setAdminContacts(contacts);
      });
    }
  }, [adminTab, socket]);

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImage) {
          setIsUploading(true);
          const safetyResult = await checkImageSafety(croppedImage);
          setIsUploading(false);

          if (safetyResult === "unsafe") {
            setError("الصورة تحتوي على محتوى غير لائق. يرجى اختيار صورة أخرى.");
            return;
          }

          socket?.emit(
            "request_custom_avatar",
            {
              playerSerial,
              avatar: croppedImage,
              status: safetyResult === "safe" ? "approved" : "pending",
            },
            (res: any) => {
              if (res.success) {
                const newStatus =
                  safetyResult === "safe" ? "approved" : "pending";
                setAvatarStatus(newStatus);
                if (newStatus === "approved") {
                  setAvatar(croppedImage);
                  setCustomAvatar(croppedImage);
                  localStorage.setItem("khamin_custom_avatar", croppedImage);
                } else {
                  // If pending, we don't save to localStorage yet
                  // We just show it in the UI if needed, but don't "apply" it
                  setCustomAvatar(croppedImage);
                }
                showAlert(res.message, "نجاح");
              } else {
                setError(res.message || "فشل إرسال الصورة");
              }
            },
          );

          setShowCropper(false);
          setImageSrc(null);
        } else {
          setError("حدث خطأ أثناء معالجة الصورة");
        }
      }
    } catch (e) {
      console.error(e);
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsUploading(false);
    }
  };

  const renderAvatarContent = (
    avatarStr: string,
    level: number = 1,
    hideExtras: boolean = false,
    isOnline: boolean = false,
    frame?: string,
    serial?: string,
  ) => {
    const isHighest = serial ? highestLikesSerials.includes(serial) : false;
    const isHighestStreak = serial
      ? highestStreakSerials.includes(serial)
      : false;
    const inRandomMatch = room?.category === "random" || !!joined; // Broad check, joined usually means in a room

    return (
      <AvatarDisplay
        avatar={avatarStr}
        level={level}
        customConfig={customConfig}
        className="w-full h-full"
        hideExtras={hideExtras}
        isOnline={isOnline}
        selectedFrame={frame}
        isHighestLikes={isHighest}
        isHighestStreak={isHighestStreak}
      />
    );
  };

  const truncateName = (name: string, limit: number = 12) => {
    if (!name) return "";
    return name.length > limit ? name.substring(0, limit) + "..." : name;
  };

  // Cache clearing logic
  useEffect(() => {
    const lastVersion = localStorage.getItem("khamin_app_version");
    if (lastVersion && lastVersion !== APP_VERSION) {
      // DO NOT use localStorage.clear() here! It wipes the player's ID and logs them out.
      // We only want to clear the service worker caches.
      if ("caches" in window) {
        caches.keys().then((names) => {
          for (let name of names) {
            caches.delete(name);
          }
        });
      }
      localStorage.setItem("khamin_app_version", APP_VERSION);
      window.location.reload();
    } else if (!lastVersion) {
      localStorage.setItem("khamin_app_version", APP_VERSION);
    }
  }, []);

  const sortPlayers = (players: any[]) => {
    return [...players].sort((a, b) => {
      const xpA = a.xp || 0;
      const xpB = b.xp || 0;
      if (xpB !== xpA) return xpB - xpA;

      const winsA = a.wins || 0;
      const winsB = b.wins || 0;
      if (winsB !== winsA) return winsB - winsA;

      const bStreak = b.streak || 0;
      const aStreak = a.streak || 0;
      if (bStreak !== aStreak) return bStreak - aStreak;

      return (a.serial || "").localeCompare(b.serial || "");
    });
  };
  const getXpProgress = (xp: number) => {
    const level = getLevel(xp);
    const currentLevelXp = getXpForCurrentLevel(level);
    const nextLevelXp = getXpForNextLevel(level);
    const progress =
      ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };
  const getXpForNextLevel = (level: number) => Math.pow(level, 2) * 50;
  const getXpForCurrentLevel = (level: number) => Math.pow(level - 1, 2) * 50;
  const getQuickGuessWaitTime = (level: number) => {
    // Level 1: 150s wait, Level 50: 3s wait (decreases 3s per level)
    return Math.max(3, 150 - (level - 1) * 3);
  };

  const getQuickGuessThreshold = (level: number) => {
    // The threshold is when the game timer (600s) reaches (600 - waitTime)
    // Level 1: 600 - 150 = 450s remaining
    // Level 10: 600 - 123 = 477s remaining
    return 600 - getQuickGuessWaitTime(level);
  };

  const renderStars = (level: number) => {
    const starsCount = Math.min(5, Math.floor(level / 10));
    if (starsCount === 0) return null;

    const getMilestoneLevel = (lvl: number) => {
      if (lvl >= 50) return 50;
      if (lvl >= 40) return 40;
      if (lvl >= 30) return 30;
      if (lvl >= 20) return 20;
      if (lvl >= 10) return 10;
      return 1;
    };
    const milestoneLevel = getMilestoneLevel(level);

    const customStar = customConfig.stars?.[milestoneLevel];
    const staticStar =
      STATIC_ASSETS.stars[milestoneLevel as keyof typeof STATIC_ASSETS.stars];
    const displayStar = customStar
      ? `/uploads/${customStar}`
      : staticStar
        ? `/assets/${staticStar}`
        : null;

    return (
      <div className="flex justify-center gap-1 mt-1" dir="ltr">
        {Array.from({ length: starsCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            {displayStar ? (
              <img
                src={displayStar}
                className="w-4 h-4 object-contain drop-shadow-sm"
                alt="Star"
              />
            ) : (
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    localStorage.setItem("khamin_xp", xp.toString());
    localStorage.setItem("khamin_streak", streak.toString());
  }, [xp, streak]);

  const [avatar, setAvatar] = useState(
    () => localStorage.getItem("khamin_player_avatar") || AVATARS[0].id,
  );
  const [selectedFrame, setSelectedFrame] = useState(
    () => localStorage.getItem("khamin_player_frame") || "",
  );
  const [hasSelectedAvatar, setHasSelectedAvatar] = useState(false);
  const [selectedInitialFrame, setSelectedInitialFrame] = useState<
    string | null
  >(null);
  const [hasSelectedFrame, setHasSelectedFrame] = useState(false);

  // Player Profile Modal State
  const [selectedProfileSerial, setSelectedProfileSerial] = useState<
    string | null
  >(null);
  const [selectedProfileData, setSelectedProfileData] = useState<any | null>(
    null,
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    localStorage.setItem("khamin_player_avatar", avatar);
    if (socket) {
      socket.emit("update_avatar", { avatar });
    }
  }, [avatar, socket]);

  useEffect(() => {
    localStorage.setItem("khamin_player_frame", selectedFrame);
    if (socket && playerSerial) {
      socket.emit("update_selected_frame", {
        playerSerial,
        frame: selectedFrame,
      });
    }
  }, [selectedFrame, socket, playerSerial]);

  useEffect(() => {
    localStorage.setItem("khamin_player_name", playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem("khamin_player_age", playerAge.toString());
  }, [playerAge]);

  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [bombExplosionFrame, setBombExplosionFrame] = useState<number | null>(null);


  
  const [handPickerLocalSelected, setHandPickerLocalSelected] = useState<number | null>(null);
  useEffect(() => {
    if (room?.handPhase !== "picking") {
      setHandPickerLocalSelected(null);
    }
  }, [room?.handPhase]);
  const [shakeBell, setShakeBell] = useState(false);

  const [privateCategoryMode, setPrivateCategoryMode] = useState<
    null | "ready" | "custom"
  >(null);
  const [customImageBase64, setCustomImageBase64] = useState<string>("");
  const [customImageAnswer, setCustomImageAnswer] = useState<string>("");
  const [isCustomSubmitted, setIsCustomSubmitted] = useState<boolean>(false);
  const [isCustomUploading, setIsCustomUploading] = useState<boolean>(false);
  const [isWaitingForJudgment, setIsWaitingForJudgment] =
    useState<boolean>(false);
  const [judgmentRequest, setJudgmentRequest] = useState<{
    guess: string;
    type: "quick" | "final";
    playerId: string;
  } | null>(null);
  const [proAnnouncement, setProAnnouncement] = useState<{
    name: string;
    type: "joined" | "found";
  } | null>(null);
  const [clickedResponses, setClickedResponses] = useState<string[]>([]);
  const [isQuickResponseDisabled, setIsQuickResponseDisabled] = useState(false);
  const quickResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Chat State
  const [currentQuickChatNodes, setCurrentQuickChatNodes] = useState<any[]>([]);
  const [quickChatOffset, setQuickChatOffset] = useState(0);
  const [isReelsSpinning, setIsReelsSpinning] = useState(false);
  const reelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [reelRandomItems, setReelRandomItems] = useState<string[][]>([
    [],
    [],
    [],
    [],
  ]);
  const askedQuickChatNodeRef = useRef<any | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const proAnnouncedForRef = useRef<string[]>([]);

  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  useEffect(() => {
    if (!room) {
      proAnnouncedForRef.current = [];
      setProAnnouncement((prev) => (prev !== null ? null : prev));
      return;
    }

    if (room && room.players) {
      if (room.gameState === "finished") {
        proAnnouncedForRef.current = [];
      } else {
        // Trigger condition based on match type:
        // - Random: show when found
        // - Private/Code: show only when room is full (2/2)
        const isReadyToAnnounce =
          room.matchType === "random" || room.players.length === 2;

        if (isReadyToAnnounce) {
          // Filter to only announce OTHER players (opponents) who are Pro
          const newPros = room.players.filter(
            (p) =>
              p.id !== socket?.id &&
              p.isPro &&
              !proAnnouncedForRef.current.includes(`${room.id}-${p.serial}`),
          );
          if (newPros.length > 0 && !proAnnouncement) {
            const p = newPros[0];
            proAnnouncedForRef.current.push(`${room.id}-${p.serial}`);
            setProAnnouncement({
              name: p.name,
              type: room.matchType === "random" ? "found" : "joined",
            });
            playSound("proArrival"); // A nice sound for pro arrival
            setTimeout(() => setProAnnouncement(null), 5000);
          }
        }
      }
    }
  }, [room, proAnnouncement, socket?.id]);

  useEffect(() => {
    if (
      currentQuickChatNodes.length > 0 &&
      quickChatOffset >= currentQuickChatNodes.length
    ) {
      setQuickChatOffset(0);
    }
  }, [currentQuickChatNodes.length, quickChatOffset]);

  useEffect(() => {
    setIsSendingQuestion(false);
  }, [room?.waitingForAnswerFrom, room?.currentTurn, room?.gameState]);

  useEffect(() => {
    if (room?.gameState === "finished" || room?.gameState === "waiting") {
      setIsQuickResponseDisabled(false);
      setClickedResponses([]);
      if (quickResponseTimeoutRef.current) {
        clearTimeout(quickResponseTimeoutRef.current);
        quickResponseTimeoutRef.current = null;
      }
    }
  }, [room?.gameState]);

  // Scroll to top when entering waiting state
  useEffect(() => {
    if (room?.gameState === "waiting") {
      const scrollToTop = () => {
        window.scrollTo({ top: 0 });
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTo({ top: 0 });
        }
      };

      scrollToTop();
      // Also try after a short delay in case content is still rendering
      const timer = setTimeout(scrollToTop, 100);
      return () => clearTimeout(timer);
    }
  }, [room?.gameState]);

  const roomRef = useRef<Room | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const isIntentionalLeaveRef = useRef(false);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // Clear any reconnection waiting messages when joining/leaving rooms or transitioning to a new room ID
    setReconnectWaitingMessage(null);
  }, [joined, room?.id]);

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  useEffect(() => {
    if (isAdmin && showAdminDashboard && adminTab === "notifications") {
      const fetchPushStats = async () => {
        try {
          if (isServerlessMode()) {
            const { getSupabaseClient } = await import("./services/supabaseClient");
            const supabase = getSupabaseClient();
            const [playersRes, pushRes] = await Promise.all([
               supabase.from('players').select('*', { count: 'exact', head: true }),
               supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
            ]);
            setPushStats({
              count: pushRes.count || 0,
              totalPlayers: playersRes.count || 0,
            });
            setPushStatsError(null);
            return;
          }

          const token = localStorage.getItem("khamin_admin_token");
          if (!token) return;
          const response = await fetch(apiUrl(`/api/admin/push-stats?token=${token}`));
          if (!response.ok) {
            setPushStatsError(`خطأ في جلب البيانات (${response.status})`);
            return;
          }
          const data = await response.json();
          if (data.count !== undefined) {
            setPushStats({
              count: data.count,
              totalPlayers: data.totalPlayers || 0,
            });
            setPushStatsError(null);
          } else {
            setPushStatsError("بيانات غير مكتملة");
          }
        } catch (err) {
          setPushStatsError("خطأ في الاتصال");
        }
      };
      fetchPushStats();
      const interval = setInterval(fetchPushStats, 60000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, showAdminDashboard, adminTab]);

  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("/");
  const [pushSendToBell, setPushSendToBell] = useState(false);
  const [pushStartDate, setPushStartDate] = useState("");
  const [pushEndDate, setPushEndDate] = useState("");
  const [pushTime, setPushTime] = useState("");
  const [scheduledPushes, setScheduledPushes] = useState<any[]>([]);
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushStats, setPushStats] = useState<{
    count: number;
    totalPlayers: number;
  } | null>(null);
  const [pushStatsError, setPushStatsError] = useState<string | null>(null);

  const fetchScheduledPushes = async () => {
    const adminToken = localStorage.getItem("khamin_admin_token");
    if (!adminToken) return;
    try {
      const res = await fetch(
        apiUrl(`/api/push/scheduled?adminToken=${adminToken}&t=${Date.now()}`),
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setScheduledPushes(data);
      } else {
        console.error("Failed to fetch scheduled pushes:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching scheduled pushes:", err);
    }
  };

  useEffect(() => {
    if (isAdmin && showAdminDashboard && adminTab === "notifications") {
      fetchScheduledPushes();
    }
  }, [isAdmin, showAdminDashboard, adminTab]);

  const subscribeToPush = async (force = false) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications not supported");
      return;
    }

    // Check current permission
    console.log("[Push] Checking permission:", Notification.permission);

    // If permission is default and not forced, show our custom prompt
    if (!force && Notification.permission === "default") {
      const isDismissed =
        localStorage.getItem("khamin_push_prompt_dismissed") === "true";
      console.log("[Push] Prompt dismissed:", isDismissed);

      if (!isDismissed) {
        setShowPushPrompt(true);
        return;
      }
      return; // Don't proceed if dismissed
    }

    // If permission is denied, we can't do anything automatically
    if (Notification.permission === "denied") {
      console.log("[Push] Permission denied by user");
      if (force) {
        showAlert(
          "لقد قمت بحظر الإشعارات من إعدادات المتصفح. يرجى تفعيلها يدوياً لتلقي التنبيهات.",
          "تنبيه",
        );
      }
      return;
    }

    // If we are here, either permission is granted or we are forcing (which will trigger browser prompt)
    // But we only proceed if notifications are enabled in our app settings OR we are forcing
    if (!force && !notificationsEnabled) {
      console.log("[Push] Notifications disabled in app settings");
      return;
    }

    const currentSerial = playerSerial || localStorage.getItem("khamin_player_serial");
    if (!force && localStorage.getItem("khamin_push_synced") === currentSerial) {
      return; // Already registered and synced
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Get public key from server
      const response = await fetch(apiUrl("/api/push/public-key"));
      const { publicKey } = await response.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // If we got here, subscription was successful (user clicked "Allow" in browser prompt)
      setNotificationsEnabled(true);
      localStorage.setItem("khamin_notifications_enabled", "true");
      if (currentSerial) {
        localStorage.setItem("khamin_push_synced", currentSerial);
      }

      // Send subscription to server
      await fetch(apiUrl("/api/push/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serial: currentSerial,
          subscription,
        }),
      });

      if (socket && isConnected && currentSerial) {
        socket.emit("update_player_notifications", {
          serial: currentSerial,
          enabled: true,
        });
      }

      console.log("Push subscription successful");
      setShowPushPrompt(false);
      if (force) {
        showAlert("تم تفعيل إشعارات الهاتف بنجاح! 🔔", "نجاح");
      }
    } catch (err: any) {
      console.error("Failed to subscribe to push:", err);
      // If it's a DOMException or applicationServerKey mismatch, try to unsubscribe first then resubscribe
      if (err.name === 'InvalidStateError' || err.message?.includes('mismatch')) {
        try {
           const registration = await navigator.serviceWorker.ready;
           const existingSub = await registration.pushManager.getSubscription();
           if (existingSub) {
             await existingSub.unsubscribe();
             // Retry once silently
             if (!force) subscribeToPush(true);
             return;
           }
        } catch (e) {
           console.error("Failed to recover from push subscription error:", e);
        }
      }
      
      if (force) {
        showAlert("فشل تفعيل الإشعارات. يرجى المحاولة مرة أخرى.", "خطأ");
      }
    }
  };

  const unsubscribeFromPush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        localStorage.removeItem("khamin_push_synced");
        
        const currentSerial = playerSerial || localStorage.getItem("khamin_player_serial");
        
        // Notify server to remove subscription
        await fetch(apiUrl("/api/push/unsubscribe"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serial: currentSerial,
            subscription,
          }),
        });

        if (socket && isConnected && currentSerial) {
          socket.emit("update_player_notifications", {
            serial: currentSerial,
            enabled: false,
          });
        }
      }
      console.log("Push unsubscription successful");
    } catch (err) {
      console.error("Failed to unsubscribe from push:", err);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    playSound("clickOpen");
    localStorage.setItem("khamin_notifications_enabled", newValue.toString());

    if (newValue) {
      await subscribeToPush(true);
    } else {
      await unsubscribeFromPush();
    }

    // Update server player data
    if (socket && isConnected) {
      socket.emit("update_player_notifications", {
        serial: playerSerial,
        enabled: newValue,
      });
    }
  };

  const toggleHideMyInfo = () => {
    const newValue = !hideMyInfo;
    setHideMyInfo(newValue);
    playSound("clickOpen");
    localStorage.setItem("khamin_hide_my_info", newValue.toString());
    if (socket && isConnected) {
      socket.emit("update_player_privacy", {
        serial: playerSerial,
        hideMyInfo: newValue,
      });
    }
  };

  const toggleHideFriendRequests = () => {
    const newValue = !hideFriendRequests;
    setHideFriendRequests(newValue);
    playSound("clickOpen");
    localStorage.setItem("khamin_hide_friend_requests", newValue.toString());
    if (socket && isConnected) {
      socket.emit("update_player_privacy", {
        serial: playerSerial,
        hideFriendRequests: newValue,
      });
    } 
  };

  const toggleDisableGuessChat = () => {
    const newValue = !disableGuessChat;
    setDisableGuessChat(newValue);
    playSound("clickOpen");
    localStorage.setItem("khamin_disable_guess_chat", newValue.toString());
    if (socket && isConnected) {
      socket.emit("update_player_privacy", {
        serial: playerSerial,
        disableGuessChat: newValue,
      });
    }
  };

  const [playerCollection, setPlayerCollection] = useState<any[]>(() => {
    try {
      const serial = localStorage.getItem("khamin_player_serial");
      if (serial) {
        const cached = localStorage.getItem(`khamin_collection_cache_${serial}`);
        return cached ? JSON.parse(cached) : [];
      }
    } catch (e) {}
    return [];
  });
  const [claimedCollectionRewards, setClaimedCollectionRewards] = useState<any[]>(() => {
    try {
      const serial = localStorage.getItem("khamin_player_serial");
      if (serial) {
        const cached = localStorage.getItem(`khamin_claimed_cache_${serial}`);
        return cached ? JSON.parse(cached) : [];
      }
    } catch (e) {}
    return [];
  });
  const [seenCategoryCounts, setSeenCategoryCounts] = useState<
    Record<string, number>
  >(() => {
    const saved = localStorage.getItem("khamin_seen_category_counts");
    return saved ? JSON.parse(saved) : {};
  });
  const [seenFrames, setSeenFrames] = useState<string[]>(() => {
    const saved = localStorage.getItem("khamin_seen_frames");
    return saved ? JSON.parse(saved) : [];
  });
  const [showCollectionModal, setShowCollectionModal] = useState<string | null>(
    null,
  );
  const [pendingClaimReward, setPendingClaimReward] = useState<{
    categoryId: string;
    stage: number;
  } | null>(null);
  const [announcementMessage, setAnnouncementMessage] = useState<string | null>(
    null,
  );
  const [activeGlobalReward, setActiveGlobalReward] = useState<any | null>(
    null,
  );
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState(
    "جاري التحقق من التحديثات...",
  );
  const [gameVersion, setGameVersion] = useState(
    localStorage.getItem("khamin_game_version") || "1.1.1",
  );

  const unlockedFrames = useMemo(() => {
    return COLLECTION_DATA.filter((cat) => {
      const finalStage = cat.stages[cat.stages.length - 1];
      return claimedCollectionRewards.some(
        (r) => r.category_id === cat.id && r.stage === finalStage.stage,
      );
    }).map((cat) => cat.id);
  }, [claimedCollectionRewards]);

  const hasNewFrame = unlockedFrames.some((id) => !seenFrames.includes(id));
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = useRef(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIdVisible, setIsIdVisible] = useState(false);
  const [banUntil, setBanUntil] = useState<number | null>(null);
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const [reports, setReports] = useState(0);
  const [reportedSerials, setReportedSerials] = useState<string[]>([]);
  const [recentOpponents, setRecentOpponents] = useState<any[]>([]);
  const [showRecentOpponents, setShowRecentOpponents] = useState(false);

  // Friend System State
  const [showPlayerSearchModal, setShowPlayerSearchModal] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [playerSearchResults, setPlayerSearchResults] = useState<any[]>([]);
  const [isSearchingPlayers, setIsSearchingPlayers] = useState(false);

  // Effect to handle initial frame removal at level 10
  useEffect(() => {
    const currentLevel = getLevel(xp);
    if (currentLevel >= 10 && selectedFrame) {
      const initialFrames = [
        "animals-category-frame-gift.png",
        "birds-category-frame-gift.png",
        "food-category-frame-gift.png",
        "people-category-frame-gift.png",
        "objects-category-frame-gift.png",
        "plants-category-frame-gift.png",
        "insects-category-frame-gift.png",
        "football-category-frame-gift.png",
      ];

      if (initialFrames.includes(selectedFrame)) {
        let categoryId = null;
        for (const [id, data] of Object.entries(COLLECTION_DATA)) {
          if (data.stages.some((s) => s.reward?.frame === selectedFrame)) {
            categoryId = id;
            break;
          }
        }

        const ownsFrame = claimedCollectionRewards.some(
          (r) => r.category_id === categoryId && r.stage === 2,
        );

        const now = new Date();
        const WC_END_DATE = new Date("2026-07-20T00:00:00Z");
        const isWCGiftActive = selectedFrame === "football-category-frame-gift.png" && now <= WC_END_DATE;

        if (!ownsFrame && !isWCGiftActive && playerSerial) {
          setSelectedFrame("");
          localStorage.setItem("khamin_player_frame", "");
          socket?.emit("update_selected_frame", { playerSerial, frame: "" });
        }
      }
    }
  }, [xp, selectedFrame, claimedCollectionRewards, playerSerial, socket]);

  // World Cup Gift Logic
  useEffect(() => {
    if (playerName && !showWelcomeModal) {
      const now = new Date();
      const WC_END_DATE = new Date("2026-07-20T00:00:00Z");
      
      if (now > WC_END_DATE && selectedFrame === "football-category-frame-gift.png" && playerSerial) {
        // Enforce expiration if they had it equipped as a gift
        let categoryId = null;
        for (const [id, data] of Object.entries(COLLECTION_DATA)) {
          if (data.stages.some((s) => s.reward?.frame === selectedFrame)) {
            categoryId = id;
            break;
          }
        }
        const ownsFrame = claimedCollectionRewards.some(
          (r) => r.category_id === categoryId && r.stage === 2,
        );
        if (!ownsFrame) {
          const prevFrame = localStorage.getItem("khamin_previous_frame_before_wc") || "";
          setSelectedFrame(prevFrame);
          localStorage.setItem("khamin_player_frame", prevFrame);
          socket?.emit("update_selected_frame", { playerSerial, frame: prevFrame });
        }
      }
    }
  }, [playerName, showWelcomeModal, selectedFrame, claimedCollectionRewards, playerSerial, socket]);

  const handleClaimWCGift = () => {
    localStorage.setItem(`wc_gift_claimed_2026_${playerSerial}`, "true");
    if (selectedFrame !== "football-category-frame-gift.png") {
      localStorage.setItem("khamin_previous_frame_before_wc", selectedFrame || "");
    }
    
    const newFrame = "football-category-frame-gift.png";
    setSelectedFrame(newFrame);
    localStorage.setItem("khamin_player_frame", newFrame);
    if (playerSerial) {
      socket?.emit("update_selected_frame", { playerSerial, frame: newFrame });
    }
    
    playSound("clickClose");
    setShowWCGiftModal(false);
    setTimeout(checkAndShowNextModal, 300);
  };

  const handleDeclineWCGift = () => {
    localStorage.setItem(`wc_gift_claimed_2026_${playerSerial}`, "true");
    playSound("clickClose");
    setShowWCGiftModal(false);
    setTimeout(checkAndShowNextModal, 300);
  };


  useEffect(() => {
    if (!showPlayerSearchModal) {
      setPlayerSearchQuery("");
      setPlayerSearchResults([]);
      return;
    }

    if (playerSearchQuery.trim().length === 0) {
      setPlayerSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearchingPlayers(true);
      if (socket && isConnected) {
        socket.emit(
          "search_players_by_name",
          { query: playerSearchQuery, requesterSerial: playerSerial },
          (response: any) => {
            setIsSearchingPlayers(false);
            if (response && response.success) {
              setPlayerSearchResults(response.results);
            } else {
              setPlayerSearchResults([]);
            }
          },
        );
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    playerSearchQuery,
    showPlayerSearchModal,
    socket,
    isConnected,
    playerSerial,
  ]);

  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [friendsList, setFriendsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("khamin_friends_list");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [friendsTotal, setFriendsTotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("khamin_friends_total");
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  });
  const [friendsPage, setFriendsPage] = useState(1);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [likeNotifications, setLikeNotifications] = useState<any[]>([]);
  const [friendAcceptedNotifications, setFriendAcceptedNotifications] =
    useState<any[]>([]);
  const [collectionNotifications, setCollectionNotifications] = useState<any[]>(
    [],
  );
  const [giftNotifications, setGiftNotifications] = useState<any[]>([]);
  const [showGiftModal, setShowGiftModal] = useState<{
    serial: string;
    name: string;
    avatar: string;
    level: number;
    selectedFrame?: string;
  } | null>(null);
  const [giftAmounts, setGiftAmounts] = useState<{
    keys: string;
    tokens: string;
    helpers: Record<string, string>;
  }>({ keys: "", tokens: "", helpers: {} });
  const [systemMessages, setSystemMessages] = useState<any[]>([]);
  const [showAskFriendModal, setShowAskFriendModal] = useState<{
    imageName: string;
    categoryId: string;
  } | null>(null);
  const [selectedFriendsForRequest, setSelectedFriendsForRequest] = useState<
    string[]
  >([]);
  const [askedFriendsForImage, setAskedFriendsForImage] = useState<string[]>(
    [],
  );
  const [isLoadingAskedFriends, setIsLoadingAskedFriends] = useState(false);
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
  const [opponentFriendStatus, setOpponentFriendStatus] = useState<
    "none" | "pending_sent" | "pending_received" | "friends"
  >("none");
  const currentOpponentSerialRef = useRef<string | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<any>(null);

  // Update currentOpponentSerialRef whenever room or playerSerial changes
  useEffect(() => {
    if (room && playerSerial) {
      const opp = room.players.find((p: any) => p.serial !== playerSerial);
      currentOpponentSerialRef.current = opp?.serial || null;
    } else {
      currentOpponentSerialRef.current = null;
    }
  }, [room, playerSerial]);

  // App Badging API for PWA notification badge
  useEffect(() => {
    const unreadCount =
      friendRequests.length +
      collectionNotifications.length +
      systemMessages.length +
      likeNotifications.length +
      giftNotifications.length +
      friendAcceptedNotifications.length;
    if ("setAppBadge" in navigator) {
      if (unreadCount > 0) {
        // @ts-ignore
        navigator
          .setAppBadge(unreadCount)
          .catch((e: any) => console.log("Badge error:", e));
      } else {
        // @ts-ignore
        navigator
          .clearAppBadge()
          .catch((e: any) => console.log("Badge error:", e));
      }
    }
  }, [
    friendRequests.length,
    collectionNotifications.length,
    systemMessages.length,
    likeNotifications.length,
    giftNotifications.length,
  ]);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    const checkScrollState = () => {
      const overlays = document.querySelectorAll(".fixed.inset-0");
      let shouldHide = false;
      overlays.forEach((el) => {
        if (!el.classList.contains("bg-transparent")) {
          shouldHide = true;
        }
      });
      document.body.style.overflow = shouldHide ? "hidden" : "";
    };

    checkScrollState();
    const observer = new MutationObserver(checkScrollState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      document.body.style.overflow = "";
    };
  }, []);

  // Poll friends list for online status
  const friendsListLengthRef = useRef(friendsList.length);
  useEffect(() => {
    friendsListLengthRef.current = friendsList.length;
  }, [friendsList.length]);

  useEffect(() => {
    if (socket && playerSerial) {
      const fetchFriends = () => {
        const fetchLimit = showFriendsModal
          ? Math.max(10, friendsListLengthRef.current)
          : 10;
        socket.emit(
          "get_friends",
          { serial: playerSerial, limit: fetchLimit },
          (res: any) => {
            if (res.success) {
              setFriendsList(res.friends || []);
              setFriendsTotal(res.total || 0);
              localStorage.setItem("khamin_friends_list", JSON.stringify(res.friends || []));
              localStorage.setItem("khamin_friends_total", (res.total || 0).toString());
            }
          },
        );
      };

      // Fetch immediately on mount / dependency changes to avoid any delay!
      fetchFriends();

      const pollRate = showFriendsModal ? 15000 : 60000;
      const interval = setInterval(fetchFriends, pollRate);
      return () => clearInterval(interval);
    }
  }, [socket, playerSerial, showFriendsModal]);

  // Load Friends Effect
  useEffect(() => {
    if (
      socket &&
      playerSerial &&
      showFriendsModal
    ) {
      console.log("Pagination Check:", {
        friendsListLength: friendsList.length,
        friendsPage,
        expectedLength: (friendsPage - 1) * 10,
        friendsTotal,
      });
      if (friendsList.length >= (friendsPage - 1) * 10) {
        setFriendsLoading(true);
        socket.emit(
          "get_friends",
          { serial: playerSerial, page: friendsPage },
          (res: any) => {
            if (res.success) {
              if (friendsPage === 1) {
                setFriendsList(res.friends || []);
              } else {
                setFriendsList((prev) => {
                  const newFriends = (res.friends || []).filter(
                    (f: any) => !prev.some((p) => p.serial === f.serial),
                  );
                  return [...prev, ...newFriends];
                });
              }
              setFriendsTotal(res.total || 0);
            }
            setFriendsLoading(false);
          },
        );
      }
    }
  }, [showFriendsModal, friendsPage, socket, playerSerial]);

  // Check Opponent Friend Status when entering a match
  useEffect(() => {
    if (socket && playerSerial && room) {
      const opp = room.players.find((p: any) => p.serial !== playerSerial);
      if (opp && opp.serial) {
        socket.emit(
          "check_friend_status",
          { serial: playerSerial, targetSerial: opp.serial },
          (res: any) => {
            if (res.success) {
              setOpponentFriendStatus(res.status);
            }
          },
        );
      }
    } else {
      setOpponentFriendStatus("none");
    }
  }, [room?.id, room?.players.length, socket, playerSerial]);

  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("khamin_categories_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CATEGORIES;
  });
  const [selectedCategoryLevel, setSelectedCategoryLevel] = useState<string>(
    "مستوي مبتدئين التخمين",
  );
  const [confirmedAttributes, setConfirmedAttributes] = useState<string[]>([]);
  const lastInitializedQuickChatRef = useRef<string | null>(null);

  const hasShownRainGiftAlertRef = useRef(false);

  useEffect(() => {
    if (
      isRainGiftActive &&
      gamePolicies.isRainGiftEnabled &&
      !hasShownRainGiftAlertRef.current &&
      !showRainGiftGame &&
      !showRainGiftSummary
    ) {
      hasShownRainGiftAlertRef.current = true;
      showConfirm(
        "بدأ حدث مطر الهدايا الآن! هل تريد الانضمام للحدث وجمع الهدايا؟",
        () => {
          if (!hasPaidForCurrentRainEvent && !isAdmin) {
            if (keys < 5) {
              showAlert("تحتاج إلى 5 مفاتيح 🗝️ للاشتراك في الحدث!", "تنبيه");
              return;
            }
            socket?.emit(
              "rain_gift_pay",
              { serial: playerSerial },
              (res: any) => {
                if (res.success) {
                  setHasPaidForCurrentRainEvent(true);
                  if (room) {
                    socket?.emit("leave_room", { roomId: room.id }, () => {
                      resetToHome();
                      setShowRainGiftGame(true);
                    });
                  } else if (isSearching) {
                    socket?.emit("leave_matchmaking");
                    resetToHome();
                    setShowRainGiftGame(true);
                  } else {
                    setShowRainGiftGame(true);
                  }
                } else {
                  showAlert(res.error || "حدث خطأ أثناء الاشتراك", "خطأ");
                }
              },
            );
          } else {
            // Already paid or admin
            if (room) {
              socket?.emit("leave_room", { roomId: room.id }, () => {
                resetToHome();
                setShowRainGiftGame(true);
              });
            } else if (isSearching) {
              socket?.emit("leave_matchmaking");
              resetToHome();
              setShowRainGiftGame(true);
            } else {
              setShowRainGiftGame(true);
            }
          }
        },
        "حدث مطر الهدايا 🎁",
        () => {}, // onCancel
        "اشترك الأن",
        "حسنا",
      );
    } else if (!isRainGiftActive) {
      hasShownRainGiftAlertRef.current = false;
      setCustomConfirm((prev) => {
        if (prev.show && prev.title === "حدث مطر الهدايا 🎁") {
          return { ...prev, show: false };
        }
        return prev;
      });
    }
  }, [
    isRainGiftActive,
    gamePolicies.isRainGiftEnabled,
    showRainGiftGame,
    showRainGiftSummary,
    room,
    isSearching,
    socket,
    keys,
    isAdmin,
  ]);

  useEffect(() => {
    if (
      room?.gameState === "discussion" &&
      room.category &&
      customConfig?.quickChat
    ) {
      const initKey = `${room.id}-${room.category}`;
      if (lastInitializedQuickChatRef.current === initKey) return;

      const categoryObj = categories.find((c) => c.id === room.category);
      const categoryName = categoryObj ? categoryObj.name : room.category;

      const rootNode = customConfig.quickChat.find(
        (n: any) =>
          n.text.trim() === categoryName.trim() ||
          n.text.trim() === room.category.trim() ||
          categoryName.includes(n.text.trim()) ||
          n.text.includes(categoryName.trim()),
      );

      if (rootNode && rootNode.children) {
        let nodes = [...rootNode.children];
        const normalizedCategory = normalizeEgyptian(
          categoryName + room.category,
        );
        const isPeople = normalizedCategory.includes("اشخاص");
        const isAnimals = normalizedCategory.includes("حيوانات");
        const isFood = normalizedCategory.includes("اكلات");

        if (isPeople || isAnimals || isFood) {
          nodes.sort((a, b) => {
            const aText = normalizeEgyptian(a.text);
            const bText = normalizeEgyptian(b.text);
            let aIsPriority = false;
            let bIsPriority = false;

            if (isPeople) {
              aIsPriority = aText.includes("رجل") || aText.includes("ست");
              bIsPriority = bText.includes("رجل") || bText.includes("ست");
            } else if (isAnimals) {
              aIsPriority = aText.includes("بري") || aText.includes("بحري");
              bIsPriority = bText.includes("بري") || bText.includes("بحري");
            } else if (isFood) {
              aIsPriority = aText.includes("حلو") || aText.includes("حادق");
              bIsPriority = bText.includes("حلو") || bText.includes("حادق");
            }

            if (aIsPriority && !bIsPriority) return -1;
            if (!aIsPriority && bIsPriority) return 1;
            return 0;
          });
        }
        setCurrentQuickChatNodes(nodes);
        setQuickChatOffset(0);
      } else {
        setCurrentQuickChatNodes([]);
        setQuickChatOffset(0);
      }
      askedQuickChatNodeRef.current = null;
      setConfirmedAttributes([]);
      lastInitializedQuickChatRef.current = initKey;
    } else if (room?.gameState !== "discussion") {
      lastInitializedQuickChatRef.current = null;
      setConfirmedAttributes([]);
    }
  }, [
    room?.gameState,
    room?.category,
    room?.id,
    customConfig?.quickChat,
    categories,
  ]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalPlayersCount, setTotalPlayersCount] = useState(0);

  useEffect(() => {
    if (isServerlessMode()) {
      import("./services/supabaseClient").then(({ getSupabaseClient }) => {
        const supabase = getSupabaseClient();
        const fetchTotal = async () => {
          try {
            const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
            if (count !== null) setTotalPlayersCount(count);
          } catch (e) {}
        };
        fetchTotal();
        const interval = setInterval(fetchTotal, 60000);
        return () => clearInterval(interval);
      }).catch(e => console.error("Failed to load supabase client", e));
    }
  }, []);

  const getTextDirection = (text: string): "ltr" | "rtl" => {
    if (!text) return "rtl";
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    if (hasEnglish && !hasArabic) return "ltr";
    if (hasArabic) return "rtl";
    return hasEnglish ? "ltr" : "rtl";
  };
  const [proposedMatch, setProposedMatch] = useState<{
    matchId: string;
    opponent: {
      name: string;
      avatar: string;
      gender?: string;
      selectedFrame?: string;
      age: number;
      level?: number;
      proPackageExpiry?: number | null;
    };
  } | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [opponentAccepted, setOpponentAccepted] = useState(false);
  const [matchResponseTimeLeft, setMatchResponseTimeLeft] = useState<
    number | null
  >(null);
  const [searchTimeLeft, setSearchTimeLeft] = useState<number | null>(null);
  const [adCooldownTimer, setAdCooldownTimer] = useState<number>(0);
  const [error, setError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [error]);

  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    message: string;
    title?: string;
    onClose?: () => void;
  }>({ show: false, message: "" });
  const [customConfirm, setCustomConfirm] = useState<{
    show: boolean;
    message: string;
    title?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ show: false, message: "", onConfirm: () => {} });
  const [customPrompt, setCustomPrompt] = useState<{
    show: boolean;
    message: string;
    defaultValue?: string;
    title?: string;
    onConfirm: (value: string) => void;
  }>({ show: false, message: "", onConfirm: () => {} });
  const [hasSeenLevelInfo, setHasSeenLevelInfo] = useState(() => {
    return localStorage.getItem("khamin_seen_level_info") === "true";
  });
  const [lastSeenPowerUpLevel, setLastSeenPowerUpLevel] = useState(() => {
    const saved = localStorage.getItem("khamin_last_seen_powerup_level");
    if (saved) return parseInt(saved);
    return 1;
  });
  const [lastSeenAvatarLevel, setLastSeenAvatarLevel] = useState(() => {
    const saved = localStorage.getItem("khamin_last_seen_avatar_level");
    if (saved) return parseInt(saved);
    return 1;
  });
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showLuckyWheelModal, setShowLuckyWheelModal] = useState(false);
  const [hasSeenLuckyWheelThisSession, setHasSeenLuckyWheelThisSession] =
    useState(() => {
      return (
        sessionStorage.getItem("khamin_has_seen_lucky_wheel_session") === "true"
      );
    });

  const updateHasSeenLuckyWheelThisSession = (value: boolean) => {
    setHasSeenLuckyWheelThisSession(value);
    sessionStorage.setItem(
      "khamin_has_seen_lucky_wheel_session",
      value.toString(),
    );
  };

  const [hasSeenCitySearchToday, setHasSeenCitySearchToday] = useState(() => {
    const saved = localStorage.getItem("khamin_has_seen_city_search_today");
    if (saved) {
      try {
        const { date } = JSON.parse(saved);
        return isSameDay(Date.now(), date);
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const updateHasSeenCitySearchToday = () => {
    setHasSeenCitySearchToday(true);
    localStorage.setItem(
      "khamin_has_seen_city_search_today",
      JSON.stringify({ date: Date.now() }),
    );
  };

  const [
    hasManuallyOpenedCitySearchToday,
    setHasManuallyOpenedCitySearchToday,
  ] = useState(() => {
    const saved = localStorage.getItem(
      "khamin_has_manually_opened_city_search_today",
    );
    if (saved) {
      try {
        const { date } = JSON.parse(saved);
        return isSameDay(Date.now(), date);
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const updateHasManuallyOpenedCitySearchToday = () => {
    setHasManuallyOpenedCitySearchToday(true);
    localStorage.setItem(
      "khamin_has_manually_opened_city_search_today",
      JSON.stringify({ date: Date.now() }),
    );
  };
  const [spinStatus, setSpinStatus] = useState(() => {
    const saved = localStorage.getItem("khamin_has_used_free_spin");
    const lastUsed = localStorage.getItem("khamin_last_free_spin_date");
    let hasFreeSpin = true;
    if (saved === "true" && lastUsed) {
      const d1 = new Date();
      const d2 = new Date(parseInt(lastUsed));
      if (
        d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate()
      ) {
        hasFreeSpin = false;
      }
    }
    return {
      dailySpinCount: 0,
      freeSpinUsed: hasFreeSpin ? 0 : 1,
      maxPaidSpins: 10,
      hasFreeSpin,
    };
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [localIsSpinning, setLocalIsSpinning] = useState(false);
  const [isSpinAdLoading, setIsSpinAdLoading] = useState(false);
  const [isGlobalAdLoading, setIsGlobalAdLoading] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showDailyQuestModal, setShowDailyQuestModal] = useState(false);
  const [spinCooldown, setSpinCooldown] = useState(() => {
    const savedEnd = localStorage.getItem("khamin_spin_cooldown_end");
    if (savedEnd) {
      const end = parseInt(savedEnd);
      const now = Date.now();
      if (end > now) {
        return Math.ceil((end - now) / 1000);
      }
    }
    return 0;
  });

  useEffect(() => {
    if (spinCooldown > 0) {
      const timer = setTimeout(() => {
        setSpinCooldown((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            localStorage.removeItem("khamin_spin_cooldown_end");
          }
          return next;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [spinCooldown]);

  const [hasUsedFreeQuickGuess, setHasUsedFreeQuickGuess] = useState(() => {
    return localStorage.getItem("khamin_has_used_free_quick_guess") === "true";
  });

  const updateHasUsedFreeQuickGuess = (value: boolean) => {
    setHasUsedFreeQuickGuess(value);
    localStorage.setItem("khamin_has_used_free_quick_guess", value.toString());
  };

  const [hasUsedFreeSpin, setHasUsedFreeSpin] = useState(() => {
    const saved = localStorage.getItem("khamin_has_used_free_spin");
    const lastUsed = localStorage.getItem("khamin_last_free_spin_date");
    if (saved === "true" && lastUsed) {
      const d1 = new Date();
      const d2 = new Date(parseInt(lastUsed));
      if (
        d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate()
      ) {
        return true;
      }
    }
    return false;
  });

  const updateHasUsedFreeSpin = (value: boolean) => {
    setHasUsedFreeSpin(value);
    localStorage.setItem("khamin_has_used_free_spin", value.toString());
    localStorage.setItem("khamin_last_free_spin_date", Date.now().toString());
  };
  const [dailyQuestStreak, setDailyQuestStreak] = useState(() => {
    const saved = localStorage.getItem("khamin_daily_streak");
    return saved ? parseInt(saved) : 1;
  });
  const [lastDailyClaim, setLastDailyClaim] = useState(() => {
    const saved = localStorage.getItem("khamin_last_daily_claim");
    return saved ? parseInt(saved) : 0;
  });
  const [hasSeenDailyToday, setHasSeenDailyToday] = useState(false);

  useEffect(() => {
    if (showLuckyWheelModal) {
      setRotation(0);
      setShowReward(false);
      setLocalIsSpinning(false);
      setIsSpinning(false);
    }
  }, [showLuckyWheelModal]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (spinResult && localIsSpinning) {
      const segments = SPIN_REWARDS_UI;
      const segmentAngle = 360 / segments.length;
      const rewardIndex = segments.findIndex(
        (r) => r.id === spinResult.reward.id,
      );
      const targetIndex = rewardIndex >= 0 ? rewardIndex : 0;

      const extraSpins = 8;
      const targetAngle = 360 * extraSpins + (360 - targetIndex * segmentAngle);

      setRotation(targetAngle);

      timer = setTimeout(() => {
        setLocalIsSpinning(false);
        setIsSpinning(false);
        setShowReward(true);
        playSound("win");

        // Start cooldown if it was an ad spin
        // If dailySpinCount > 1, it means we've done at least one spin.
        // Since freeSpinUsed is 1 after the first spin, any spin where dailySpinCount > 1 is an ad spin.
        if (spinResult.dailySpinCount > 1) {
          setSpinCooldown(30);
          localStorage.setItem(
            "khamin_spin_cooldown_end",
            (Date.now() + 30000).toString(),
          );
        }

        // Update stats
        setXp(spinResult.newStats.xp);
        setتخمينات(spinResult.newStats.tokens);
        setOwnedHelpers(spinResult.newStats.ownedHelpers);
        setProPackageExpiry(spinResult.newStats.proPackageExpiry);
        if (spinResult.newStats.tempItems) {
          setTempItems(spinResult.newStats.tempItems);
        }
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [spinResult, localIsSpinning]);

  const handleSpinClick = () => {
    if (isSpinning || localIsSpinning || spinCooldown > 0 || isSpinAdLoading)
      return;

    const isAdSpin = !spinStatus.hasFreeSpin;

    if (isAdSpin) {
      if (spinStatus.dailySpinCount >= 11 && !isAdmin) {
        showAlert("لقد استنفدت جميع محاولاتك لليوم! عد غداً.", "تنبيه");
        return;
      }

      setIsSpinAdLoading(true);
      // Ad logic
      let adFinished = false;
      let adViewed = false;
      let adDismissed = false;

      const handleAdFailure = () => {
        setIsSpinAdLoading(false);
        if (sessionAdFailuresCount < 2) {
          sessionAdFailuresCount += 1;
          localStorage.setItem(
            "khamin_ad_failures",
            sessionAdFailuresCount.toString(),
          );
          showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
          adFinished = true;
          setIsReelsSpinning(false);
          return;
        }
        sessionAdFailuresCount = 0;
        localStorage.setItem("khamin_ad_failures", "0");
        setMockAdProviderState({
          onComplete: () => {
            adFinished = true;
            adViewed = true;
            startSpin(true);
          },
          onDismissed: () => {
            adFinished = true;
            setIsReelsSpinning(false);
            showAlert(
              "يجب مشاهدة الإعلان كاملاً للف الأسهم المجانية!",
              "تنبيه",
            );
          },
        });
      };

      if (typeof (window as any).adBreak === "function") {
        const adTimeout = setTimeout(() => {
          if (!adFinished) handleAdFailure();
        }, 12000);

        try {
          (window as any).adBreak({
            type: "reward",
            name: "lucky_wheel_spin",
            beforeAd: () => {
            (window as any).adStartTime = Date.now();
              clearTimeout(adTimeout);
              if (adFinished) setMockAdProviderState(null);
              adFinished = false;
              setIsSpinAdLoading(false);
              Howler.mute(true);
            },
            afterAd: () => {
              Howler.mute(false);
            },
            beforeReward: (showAdFn: any) => {
              showAdFn();
            },
            adViewed: () => {
              sessionAdFailuresCount = 0;
              localStorage.setItem("khamin_ad_failures", "0");
              adFinished = true;
              adViewed = true;
              startSpin(true);
            },
            adDismissed: () => {
              setIsSpinAdLoading(false);
              adFinished = true;
              adDismissed = true;
              Howler.mute(false);
              showAlert(
                "يجب مشاهدة الإعلان بالكامل للحصول على المحاولة!",
                "تنبيه",
              );
            },
            adBreakDone: (placementInfo: any) => {
              setIsSpinAdLoading(false);
              adFinished = true;
              clearTimeout(adTimeout);
              if (!adViewed && !adDismissed) {
                handleAdFailure();
              }
            },
          });
        } catch (e) {
          console.error("Ad error:", e);
          clearTimeout(adTimeout);
          handleAdFailure();
        }
      } else {
        // No ad SDK found (AdBlocker)
        handleAdFailure();
      }
    } else {
      startSpin(false);
    }
  };

  const startSpin = (isAd: boolean) => {
    if (!isAd) {
      updateHasUsedFreeSpin(true);
    }
    setLocalIsSpinning(false);
    setRotation(0);
    setShowReward(false);

    setTimeout(() => {
      setLocalIsSpinning(true);
      setIsSpinning(true);
      playSound("luckyReels");
      socket?.emit("perform_spin", { serial: playerSerial, isAdSpin: isAd });
    }, 50);
  };
  const [ownedHelpers, setOwnedHelpers] = useState<{ [key: string]: number }>(
    () => {
      const saved = localStorage.getItem("khamin_owned_helpers");
      return saved ? JSON.parse(saved) : {};
    },
  );

  useEffect(() => {
    if (joined && playerSerial) {
      const pendingGift = localStorage.getItem("khamin_pending_rain_gift");
      if (pendingGift) {
        try {
          const rewards = JSON.parse(pendingGift);
          if (
            rewards.xp > 0 ||
            rewards.tokens > 0 ||
            Object.keys(rewards.helpers || {}).length > 0
          ) {
            setCollectedRewards(rewards);
            // Removed automatic trigger: setShowRainGiftSummary(true);
          } else {
            localStorage.removeItem("khamin_pending_rain_gift");
          }
        } catch (e) {
          localStorage.removeItem("khamin_pending_rain_gift");
        }
      }
    }
  }, [joined, playerSerial, socket, hasProPackage]);

  const [dailyQuestRewardInfo, setDailyQuestRewardInfo] = useState<{
    xp: number;
    helper?: string;
    tokens?: number;
  } | null>(null);
  const [isChestOpening, setIsChestOpening] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [cyclingReward, setCyclingReward] = useState<any>(null);
  const [chestReward, setChestReward] = useState<any>(null);
  const [pendingDailyReward, setPendingDailyReward] = useState<any>(null);
  const [appOpenDate] = useState(Date.now());
  const [tokensEarnedThisWeek, setتخميناتEarnedThisWeek] = useState(0);
  const [lastTokenEarnedDay, setLastTokenEarnedDay] = useState(0);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (pendingWelcomeModal && !showInstallModal) {
      setShowWelcomeModal(true);
      setPendingWelcomeModal(false);
    }
  }, [pendingWelcomeModal, showInstallModal]);

  useEffect(() => {
    isSearchingRef.current = isSearching;
  }, [isSearching]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissedAt = localStorage.getItem("khamin_install_dismissed");
      const isDismissedRecently =
        dismissedAt &&
        Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000;
      if (!isDismissedRecently) {
        setShowInstallModal(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setShowInstallModal(false);
        setDeferredPrompt(null);
      });
    }
  };

  const handleCloseInstallModal = () => {
    setShowInstallModal(false);
    localStorage.setItem("khamin_install_dismissed", Date.now().toString());
  };

  useEffect(() => {
    const dismissedAt = localStorage.getItem("khamin_install_dismissed");
    const isDismissedRecently =
      dismissedAt &&
      Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000;
    if (loadingProgress === 100 && deferredPrompt && !isDismissedRecently) {
      setShowInstallModal(true);
    }
  }, [loadingProgress, deferredPrompt]);

  const [isSpinStatusLoaded, setIsSpinStatusLoaded] = useState(false);

  const checkAndShowNextModal = () => {
    if (
      joined ||
      !playerSerial ||
      !isConnected ||
      !isCitySearchLoaded ||
      !isSpinStatusLoaded
    )
      return;

    // Prevent opening the next modal if any of the sequence modals (or welcome modal) are currently open
    if (
      showWelcomeModal ||
      showWCGiftModal ||
      showDailyQuestModal ||
      showLuckyWheelModal ||
      showCitySearch
    )
      return;

    // 0. World Cup Gift
    const wcClaimed = localStorage.getItem(`wc_gift_claimed_2026_${playerSerial}`) === "true";
    const now = new Date();
    const WC_END_DATE = new Date("2026-07-20T00:00:00Z");
    if (now <= WC_END_DATE && !wcClaimed) {
      setShowWCGiftModal(true);
      return;
    }

    // 1. Daily Quest
    const hasUnclaimedDaily =
      lastDailyClaim === 0 || !isSameDay(Date.now(), lastDailyClaim);
    if (!hasSeenDailyToday && hasUnclaimedDaily) {
      setShowDailyQuestModal(true);
      setHasSeenDailyToday(true);
      return;
    }

    // Mark daily as "seen" even if they don't have one to claim, so we can move to next
    if (!hasSeenDailyToday) {
      setHasSeenDailyToday(true);
    }

    // 2. Lucky Wheel
    if (
      !hasSeenLuckyWheelThisSession &&
      spinStatus.hasFreeSpin &&
      luckyWheelEnabled
    ) {
      setShowLuckyWheelModal(true);
      updateHasSeenLuckyWheelThisSession(true);
      return;
    }

    // 3. City Search
    if (!hasSeenCitySearchToday && !citySearchState?.active) {
      setShowCitySearch(true);
      updateHasSeenCitySearchToday();
      return;
    }
  };

  useEffect(() => {
    checkAndShowNextModal();
  }, [
    joined,
    lastDailyClaim,
    hasSeenDailyToday,
    playerSerial,
    isConnected,
    isCitySearchLoaded,
    isSpinStatusLoaded,
    hasSeenLuckyWheelThisSession,
    spinStatus.hasFreeSpin,
    luckyWheelEnabled,
    isAdmin,
    hasSeenCitySearchToday,
    citySearchState,
    showWelcomeModal,
    showWCGiftModal,
    showDailyQuestModal,
    showLuckyWheelModal,
    showCitySearch,
  ]);

  useEffect(() => {
    if (socket && isConnected && playerSerial) {
      socket.emit("get_spin_status", { serial: playerSerial });
      socket.on("spin_status", (status) => {
        setSpinStatus(status);
        setIsSpinStatusLoaded(true);
        // Sync local storage with server status
        if (status.freeSpinUsed > 0) {
          setHasUsedFreeSpin(true);
          localStorage.setItem("khamin_has_used_free_spin", "true");
          // We don't necessarily know the exact date from the server here,
          // but setting it to now is a safe bet for "today"
          if (!localStorage.getItem("khamin_last_free_spin_date")) {
            localStorage.setItem(
              "khamin_last_free_spin_date",
              Date.now().toString(),
            );
          }
        } else {
          setHasUsedFreeSpin(false);
          localStorage.removeItem("khamin_has_used_free_spin");
          localStorage.removeItem("khamin_last_free_spin_date");
        }
      });
      socket.on("spin_result", (data) => {
        setSpinResult(null); // Reset to ensure next spin triggers effect
        setTimeout(() => setSpinResult(data), 0);
        setSpinStatus({
          dailySpinCount: data.dailySpinCount,
          freeSpinUsed: data.freeSpinUsed,
          maxPaidSpins: 10,
          hasFreeSpin: data.freeSpinUsed === 0,
        });
      });
      socket.on("spin_error", (msg) => {
        setIsSpinning(false);
        showAlert(msg, "تنبيه");
      });

      return () => {
        socket.off("spin_status");
        socket.off("spin_result");
        socket.off("spin_error");
      };
    }
  }, [socket, isConnected, playerSerial]);

  const handleClaimDailyQuest = () => {
    setIsChestOpening(true);
    setPendingDailyReward(null); // Reset pending reward
    playSound("clickOpen");
    if (socket) {
      socket.emit("claim_daily_quest", {
        serial: playerSerial,
        isPro: hasProPackage,
      });
    }
  };

  const startCycling = () => {
    if (!pendingDailyReward || isCycling) return;
    setIsCycling(true);
    playSound("chestOpen");

    // Cycle animation
    let cycleCount = 0;
    const interval = setInterval(() => {
      const randomItem =
        HELPER_ITEMS[Math.floor(Math.random() * HELPER_ITEMS.length)];
      setCyclingReward(randomItem);
      playSound("cyclingReward");
      cycleCount++;
      if (cycleCount >= 40) {
        clearInterval(interval);
        setCyclingReward(pendingDailyReward.helperReward);
        setChestReward({
          xp: pendingDailyReward.xpReward,
          helper: pendingDailyReward.helperReward,
          tokens: pendingDailyReward.tokenReward,
        });
        stopSound("cyclingReward");
        playSound("bell");
        setIsCycling(false);

        // Apply rewards locally for immediate UI update
        setXp(pendingDailyReward.newXp);
        setتخمينات(pendingDailyReward.newتخمينات);
        setOwnedHelpers(pendingDailyReward.newOwnedHelpers);
        setDailyQuestStreak(pendingDailyReward.newStreak);
        setLastDailyClaim(pendingDailyReward.newLastClaim);
        if (pendingDailyReward.weeklyتخميناتClaimed !== undefined) {
          setتخميناتEarnedThisWeek(pendingDailyReward.weeklyتخميناتClaimed);
          localStorage.setItem(
            "khamin_tokens_earned_this_week",
            pendingDailyReward.weeklyتخميناتClaimed.toString(),
          );
        }

        // Sync local storage
        localStorage.setItem(
          "khamin_daily_streak",
          pendingDailyReward.newStreak.toString(),
        );
        localStorage.setItem(
          "khamin_last_daily_claim",
          pendingDailyReward.newLastClaim.toString(),
        );
        localStorage.setItem(
          "khamin_owned_helpers",
          JSON.stringify(pendingDailyReward.newOwnedHelpers),
        );

        setPendingDailyReward(null);
      }
    }, 50);
  };

  const toggleDailyQuests = () => {
    if (showDailyQuestModal) {
      playSound("clickClose");
      setShowDailyQuestModal(false);
      // Sequence will continue via useEffect or manual call
      setTimeout(checkAndShowNextModal, 300);
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowDailyQuestModal(true);
    }
  };

  const handleshowFriendsModal = () => {
    if (showFriendsModal) {
      playSound("clickClose");
      setShowFriendsModal(false);
      // Sequence will continue via useEffect or manual call
      setTimeout(checkAndShowNextModal, 300);
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowFriendsModal(true);
      if (socket && playerSerial) {
        setFriendsLoading(true);
        socket.emit(
          "get_friends",
          { serial: playerSerial, limit: Math.max(10, friendsList.length) },
          (res: any) => {
            setFriendsLoading(false);
            if (res.success) {
              setFriendsList(res.friends || []);
              setFriendsTotal(res.total || 0);
            }
          },
        );
      }
    }
  };

  const handleOpenCitySearch = () => {
    if (showCitySearch) {
      playSound("clickClose");
      setShowCitySearch(false);
      // Sequence will continue via useEffect or manual call
      setTimeout(checkAndShowNextModal, 300);
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowCitySearch(true);
      updateHasManuallyOpenedCitySearchToday();
    }
  };

  const handleOpenshowCollectionModal = () => {
    if (showCollectionModal) {
      playSound("clickClose");
      setShowCollectionModal(null);
      // Sequence will continue via useEffect or manual call
      setTimeout(checkAndShowNextModal, 300);
    } else {
      playSound("clickOpen");
      closeAllModals();
      renderCollectionModal();
    }
  };

  const openPlayerProfile = (serial: string) => {
    playSound("clickOpen");
    setSelectedProfileData(null);
    setSelectedProfileSerial(serial);
    setIsLoadingProfile(true);
    socket?.emit(
      "get_player_profile",
      { targetSerial: serial, requesterSerial: playerSerial },
      (response: any) => {
        setIsLoadingProfile(false);
        if (response.success) {
          socket?.emit(
            "check_friend_status",
            { mySerial: playerSerial, targetSerial: serial },
            (statusRes: any) => {
              setSelectedProfileData({
                ...response.profile,
                friendStatus: statusRes.status,
              });
            },
          );
        } else {
          showAlert(response.error || "حدث خطأ", "خطأ");
          setSelectedProfileSerial(null);
        }
      },
    );
  };

  const handleOpenshowLeaderboardModal = () => {
    if (showLeaderboardModal) {
      playSound("clickClose");
      setShowLeaderboardModal(false);
      // Sequence will continue via useEffect or manual call
      setTimeout(checkAndShowNextModal, 300);
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowLeaderboardModal(true);
      if (socket) {
        socket.emit("get_top_players", (players: any[]) => {
          if (Array.isArray(players)) {
            setTopPlayers(sortPlayers(players));
            try {
              localStorage.setItem("khamin_top_players", JSON.stringify(players));
            } catch (e) {}
          }
        });
      }
    }
  };

  const toggleLuckyWheel = () => {
    if (showLuckyWheelModal) {
      playSound("clickClose");
      setShowLuckyWheelModal(false);
      // Sequence will continue via useEffect or manual call
      setTimeout(checkAndShowNextModal, 300);
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowLuckyWheelModal(true);
    }
  };

  const closeAllModals = () => {
    if (showSettingsModal) {
      const currentLevel = getLevel(xp);
      setLastSeenAvatarLevel(currentLevel);
      localStorage.setItem(
        "khamin_last_seen_avatar_level",
        currentLevel.toString(),
      );
    }
    if (showLevelInfo) {
      const currentLevel = getLevel(xp);
      setLastSeenPowerUpLevel(currentLevel);
      localStorage.setItem(
        "khamin_last_seen_powerup_level",
        currentLevel.toString(),
      );
    }
    setShowSettingsModal(false);
    setShowLevelInfo(false);
    setShowAdminDashboard(false);
    setShowReportModal(false);
    setShowShopModal(false);
    setShowLuckyWheelModal(false);
    setShowWCGiftModal(false);
  };

  const toggleSettings = () => {
    if (showSettingsModal) {
      playSound("clickClose");
      handleProfileUpdate();
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowSettingsModal(true);
    }
  };

  const handleBuyItem = (itemId: string) => {
    playSound("clickOpen");
    setSelectedWalletItem(itemId);
    setShowCheckoutPage(true);
  };

  const handleBuyTokensWithKeys = () => {
    playSound("clickOpen");
    if ((keys || 0) < 100) {
      showAlert("ليس لديك مفاتيح كافية!", "المتجر");
      return;
    }

    showConfirm(
      "هل تريد تحويل 100 مفتاح إلى 10 تخمينات؟",
      () => {
        socket?.emit(
          "buy_tokens_with_keys",
          { playerSerial: playerSerial },
          (res: any) => {
            if (res.success) {
              showAlert("تم التحويل بنجاح! 🎉", "المتجر");
            } else {
              showAlert(res.error || "حدث خطأ، حاول مرة أخرى.", "خطأ");
            }
          },
        );
      },
      "تبديل المفاتيح",
    );
  };

  const handleBuyProWithKeys = () => {
    playSound("clickOpen");
    if ((keys || 0) < 100) {
      showAlert("ليس لديك مفاتيح كافية!", "المتجر");
      return;
    }

    showConfirm(
      "هل تريد تفعيل باقة المحترفين لمدة يوم واحد مقابل 100 مفتاح؟",
      () => {
        socket?.emit(
          "buy_pro_with_keys",
          { playerSerial: playerSerial },
          (res: any) => {
            if (res.success) {
              showAlert("تم تفعيل باقة المحترفين بنجاح! 🎉", "المتجر");
              setProPackageExpiry(res.proPackageExpiry);
              localStorage.setItem(
                "khamin_pro_package_expiry",
                res.proPackageExpiry.toString(),
              );
            } else {
              showAlert(res.error || "حدث خطأ، حاول مرة أخرى.", "خطأ");
            }
          },
        );
      },
      "تفعيل الباقة",
    );
  };

  const handleProcessPayment = async (
    paymentMethod: "wallet" | "card",
    details: any,
    quantity: number = 1,
  ) => {
    if (!selectedWalletItem) return;

    setIsInitiatingPayment(true);

    try {
      const response = await fetch(apiUrl("/api/paymob/initiate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: selectedWalletItem,
          playerSerial,
          paymentMethod,
          customerInfo: details,
          quantity,
        }),
      });
      const data = await response.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setIsInitiatingPayment(false);
        showAlert(data.error || "حدث خطأ أثناء بدء عملية الدفع", "خطأ");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setIsInitiatingPayment(false);
      showAlert("حدث خطأ أثناء الاتصال بخادم الدفع", "خطأ");
    }
  };

  const toggleShop = () => {
    if (showShopModal) {
      playSound("clickClose");
      closeAllModals();
    } else {
      playSound("clickOpen");
      closeAllModals();
      setShowShopModal(true);
      setHasNewStoreOffers(false);
      localStorage.setItem("khamin_last_opened_store", Date.now().toString());
    }
  };

  const toggleLevelInfo = () => {
    if (showLevelInfo) {
      playSound("clickClose");
      closeAllModals();
    } else {
      playSound("clickOpen");
      closeAllModals();
      if (!hasSeenLevelInfo) {
        setHasSeenLevelInfo(true);
        localStorage.setItem("khamin_seen_level_info", "true");
      }
      setShowLevelInfo(true);
    }
  };

  const showAlert = (
    message: string,
    title: string = "تنبيه",
    onClose?: () => void,
  ) => {
    setCustomAlert({ show: true, message, title, onClose });
    playSound("clickOpen");
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title: string = "تأكيد",
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
  ) => {
    setCustomConfirm({
      show: true,
      message,
      title,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    });
    playSound("clickOpen");
  };

  const showPrompt = (
    message: string,
    defaultValue: string = "",
    onConfirm: (value: string) => void,
    title: string = "إدخال",
  ) => {
    setCustomPrompt({ show: true, message, defaultValue, title, onConfirm });
    playSound("clickOpen");
  };

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isIntentionalLeaveRef.current) return;
      if (room?.gameState === "discussion" || room?.gameState === "guessing") {
        socket?.emit("intentional_leave", { roomId });
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [room?.gameState, roomId, socket]);

  useEffect(() => {
    const fetchCats = (force = false) => {
      if (!force) {
        const cached = localStorage.getItem("khamin_categories_cache");
        const cachedTime = localStorage.getItem("khamin_categories_cache_time");
        if (cached && cachedTime) {
          const age = Date.now() - parseInt(cachedTime, 10);
          if (age < 30 * 60 * 1000) {
            // Cache is young enough, skip API call
            return;
          }
        }
      }
      if (isServerlessMode()) {
        setCategories(DEFAULT_CATEGORIES);
        return;
      }
      fetch(apiUrl("/api/categories"))
        .then((res) => {
          if (!res.ok) throw new Error("Categories fetch not ok");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            try {
              localStorage.setItem("khamin_categories_cache", JSON.stringify(data));
              localStorage.setItem("khamin_categories_cache_time", Date.now().toString());
            } catch (e) {}
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
        })
        .catch((err) => {
          console.warn("Using default categories (Serverless/Offline):", err);
          setCategories(DEFAULT_CATEGORIES);
        });
    };

    fetchCats(false);

    if (socket) {
      const handleCatsUpdated = () => fetchCats(true);
      socket.on("categories_updated", handleCatsUpdated);
      return () => {
        socket.off("categories_updated", handleCatsUpdated);
      };
    }
  }, [socket]);

  // Matchmaking timeout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      isSearching &&
      !proposedMatch &&
      searchTimeLeft !== null &&
      searchTimeLeft > 0
    ) {
      interval = setInterval(() => {
        setSearchTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (isSearching && !proposedMatch && searchTimeLeft === 0) {
      setIsSearching(false);
      setJoined(false);
      socket?.emit("leave_matchmaking");
      setRoomId((prev) => (prev.startsWith("random_") || prev === "waiting_friend" ? "" : prev));
      setError("لم يتم العثور على منافس حالياً. يرجى المحاولة في وقت لاحق.");
      setTimeout(() => setError(""), 5000);
      setSearchTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [isSearching, proposedMatch, searchTimeLeft, socket]);

  // Match response timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      proposedMatch &&
      matchResponseTimeLeft !== null &&
      matchResponseTimeLeft > 0
    ) {
      interval = setInterval(() => {
        setMatchResponseTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (matchResponseTimeLeft === 0 && !hasResponded) {
      setHasResponded(true);
      socket?.emit("respond_to_match", {
        matchId: proposedMatch?.matchId,
        response: "reject",
      });
      setProposedMatch(null);
      setMatchResponseTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [proposedMatch, matchResponseTimeLeft, hasResponded, socket]);

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Global Fullscreen and Audio trigger on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume().catch(() => {});
      }
      setAudioUnlocked(true);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchend", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchend", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchend", handleFirstInteraction);
    };
  }, []);

  const [guess, setGuess] = useState("");
  const [customChatInput, setCustomChatInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [guessChatUnlocked, setGuessChatUnlocked] = useState(false);
  const [showGuessChatLockAlert, setShowGuessChatLockAlert] = useState(false);

  useEffect(() => {
    if (!room || room.gameState === "waiting" || room.selectionMode === "ready") {
      setGuessChatUnlocked(false);
    }
  }, [room?.id, room?.gameState, room?.selectionMode]);

  // Typing logic
  useEffect(() => {
    if (!socket || !roomId) return;

    if (chatInput.trim().length > 0) {
      socket.emit("typing", { roomId });

      const timeout = setTimeout(() => {
        socket.emit("stop_typing", { roomId });
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      socket.emit("stop_typing", { roomId });
    }
  }, [chatInput, socket, roomId]);

  const [chatHistory, setChatHistory] = useState<
    {
      id: string;
      senderId: string;
      text: string;
      playerName: string;
      avatar: string;
    }[]
  >([]);
  const [bubbles, setBubbles] = useState<
    { id: string; senderId: string; text: string }[]
  >([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      const parent = chatEndRef.current.parentElement;
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [chatHistory, isOpponentTyping]);
  const [spyLensImage, setSpyLensImage] = useState<string | null>(null);
  const [showHammer, setShowHammer] = useState<string | null>(null);
  const [funnyFilter, setFunnyFilter] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    serial: string;
    name: string;
  } | null>(null);
  const [isOpponentBlocked, setIsOpponentBlocked] = useState(false);
  const [useToken, setUseToken] = useState(false);
  const [isMutedByOpponent, setIsMutedByOpponent] = useState(false);
  const [busAnswers, setBusAnswers] = useState({
    boy: "",
    girl: "",
    animal: "",
    plant: "",
    inanimate: "",
    country: "",
  });
  const hasRestoredBusDraftRef = useRef(false);
  const [spinLetter, setSpinLetter] = useState("؟");
  const [hideBusResults, setHideBusResults] = useState(false);
  const [showDotsTutorial, setShowDotsTutorial] = useState(false);
  const isOpponentBlockedRef = useRef(isOpponentBlocked);
  useEffect(() => {
    isOpponentBlockedRef.current = isOpponentBlocked;
  }, [isOpponentBlocked]);

  useEffect(() => {
    if (room?.gameState === "dots_playing" && room.dotsTurn === socket?.id) {
      if (!localStorage.getItem("dots_tutorial_seen")) {
        setShowDotsTutorial(true);
      }
    }
  }, [room?.gameState, room?.dotsTurn, socket?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (room?.gameState === "bus_complete_spin") {
      const letters = [
        "أ",
        "ب",
        "ت",
        "ث",
        "ج",
        "ح",
        "خ",
        "د",
        "ذ",
        "ر",
        "ز",
        "س",
        "ش",
        "ص",
        "ض",
        "ط",
        "ظ",
        "ع",
        "غ",
        "ف",
        "ق",
        "ك",
        "ل",
        "م",
        "ن",
        "ه",
        "و",
        "ي",
      ];
      interval = setInterval(() => {
        setSpinLetter(letters[Math.floor(Math.random() * letters.length)]);
        playSound("cyclingReward");
      }, 100);
    } else if (room?.busCompleteLetter) {
      setSpinLetter(room.busCompleteLetter);
      stopSound("cyclingReward");
      playSound("bell");
    } else {
      setSpinLetter("؟");
    }
    return () => clearInterval(interval);
  }, [room?.gameState, room?.busCompleteLetter]);

  // Friend System Functions
  const handleAddFriend = (targetSerial: string) => {
    if (!socket || !playerSerial) return;

    if (!isAdmin && friendsList.length >= 50) {
      showAlert(
        "قائمة الأصدقاء ممتلئة, يجب حذف صديق لإضافة صديق جديد!",
        "تنبيه",
      );
      setShowPlayerSearchModal(false);
      setShowRecentOpponents(false);
      setSelectedProfileSerial(null);
      setShowFriendsModal(true);
      return;
    }

    socket.emit(
      "add_friend",
      { serial: playerSerial, targetSerial: targetSerial },
      (res: any) => {
        if (res.success) {
          setOpponentFriendStatus("pending_sent"); // Optimistic update
        } else {
          if (res.limitReached) {
            showAlert(
              res.error ||
                "قائمة الأصدقاء ممتلئة, يجب حذف صديق لإضافة صديق جديد!",
              "تنبيه",
            );
            setShowPlayerSearchModal(false);
            setShowRecentOpponents(false);
            setSelectedProfileSerial(null);
            setShowFriendsModal(true);
          } else {
            showAlert(
              res.error || res.message || "حدث خطأ أثناء الإرسال",
              "خطأ",
            );
          }
        }
      },
    );
  };

  const handleRespondCollectionRequest = (
    notificationId: string,
    action: "send" | "delete",
  ) => {
    if (!socket || !playerSerial) return;
    socket.emit(
      "respond_collection_request",
      { serial: playerSerial, notificationId, action },
      (res: any) => {
        if (res.success) {
          setCollectionNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId),
          );
          if (action === "send") {
            showAlert("تم إرسال الصورة بنجاح!", "نجاح");
            socket.emit("get_player_data", {
              serial: playerSerial,
              fingerprint: localStorage.getItem("khamin_fingerprint"),
              secretToken: localStorage.getItem("khamin_secret_token"),
            }); // to refresh collection
            fetchCollection(playerSerial);
          }
        } else {
          showAlert(res.error || "حدث خطأ", "خطأ");
        }
      },
    );
  };

  const handleReplyLike = (notification: any) => {
    socket?.emit(
      "dismiss_like_notification",
      { serial: playerSerial, notificationId: notification.id },
      (res: any) => {
        if (res.success) {
          setLikeNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id),
          );
        }
      },
    );
    openPlayerProfile(notification.senderSerial);
  };

  const handleReceiveCollectionImage = (notificationId: string) => {
    if (!socket || !playerSerial) return;
    socket.emit(
      "receive_collection_image",
      { serial: playerSerial, notificationId },
      (res: any) => {
        if (res.success) {
          setCollectionNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId),
          );
          showAlert("تم استلام الصورة بنجاح!", "نجاح");
          socket.emit("get_player_data", {
            serial: playerSerial,
            fingerprint: localStorage.getItem("khamin_fingerprint"),
            secretToken: localStorage.getItem("khamin_secret_token"),
          }); // to refresh collection
          fetchCollection(playerSerial);
        } else {
          showAlert(res.error || "حدث خطأ", "خطأ");
        }
      },
    );
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    if (!socket || !playerSerial) return;

    if (!isAdmin && friendsList.length >= 50) {
      showAlert(
        "قائمة الأصدقاء ممتلئة, يجب حذف صديق لإضافة صديق جديد!",
        "تنبيه",
      );
      setShowFriendRequestsModal(false);
      setSelectedProfileSerial(null);
      setShowFriendsModal(true);
      return;
    }

    const request = friendRequests.find((r) => r.id === requestId);
    socket.emit(
      "accept_friend_request",
      { serial: playerSerial, requestId },
      (res: any) => {
        if (res && res.success) {
          setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));

          // Update in-game status if this request was from our current opponent
          if (
            request &&
            (request.sender === currentOpponentSerialRef.current ||
              request.player1 === currentOpponentSerialRef.current ||
              request.player2 === currentOpponentSerialRef.current)
          ) {
            setOpponentFriendStatus("friends");
          }

          // Refresh friends list/total immediately
          socket.emit(
            "get_friends",
            { serial: playerSerial, page: friendsPage },
            (friendsRes: any) => {
              if (friendsRes.success) {
                setFriendsList(friendsRes.friends);
                setFriendsTotal(friendsRes.total);
              }
            },
          );
          const fingerprint = localStorage.getItem("khamin_fingerprint");
          socket.emit("get_player_data", {
            serial: playerSerial,
            fingerprint,
            secretToken: localStorage.getItem("khamin_secret_token"),
          });
        } else if (res && res.limitReached) {
          showAlert(
            res.error ||
              "قائمة الأصدقاء ممتلئة, يجب حذف صديق لإضافة صديق جديد!",
            "تنبيه",
          );
          setShowFriendRequestsModal(false);
          setSelectedProfileSerial(null);
          setShowFriendsModal(true);
        } else if (res && res.error) {
          showAlert(res.error || "حدث خطأ", "خطأ");
        }
      },
    );
  };

  const handleRejectFriendRequest = (requestId: string) => {
    if (!socket || !playerSerial) return;
    const request = friendRequests.find((r) => r.id === requestId);
    socket.emit(
      "reject_friend_request",
      { serial: playerSerial, requestId },
      (res: any) => {
        if (res.success) {
          setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));

          // Update in-game status if this request was from our current opponent
          if (
            request &&
            (request.sender === currentOpponentSerialRef.current ||
              request.player1 === currentOpponentSerialRef.current ||
              request.player2 === currentOpponentSerialRef.current)
          ) {
            setOpponentFriendStatus("none");
          }
        }
      },
    );
  };

  const handleRemoveFriend = (friendSerial: string) => {
    if (!socket || !playerSerial) return;
    showConfirm(
      "هل أنت متأكد من حذف هذا الصديق؟",
      () => {
        socket.emit(
          "remove_friend",
          { serial: playerSerial, targetSerial: friendSerial },
          (res: any) => {
            if (res.success) {
              setFriendsList((prev) =>
                prev.filter((f) => f.serial !== friendSerial),
              );
              setFriendsTotal((prev) => Math.max(0, prev - 1));

              // Update in-game status if this person is our current opponent
              if (friendSerial === currentOpponentSerialRef.current) {
                setOpponentFriendStatus("none");
              }
            }
          },
        );
      },
      "تأكيد الحذف",
    );
  };

  const audioRef = useRef<{ [key: string]: Howl }>({});
  const lobbyMusicRef = useRef<Howl | null>(null);
  const gameMusicRef = useRef<Howl | null>(null);
  const beachRaceMusicRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Initialize sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      if (key === "lobbyBackground") {
        lobbyMusicRef.current = new Howl({
          src: [url],
          loop: true,
          preload: true,
          volume: musicVolume,
          html5: true,
        });
      } else if (key === "gameBackground") {
        gameMusicRef.current = new Howl({
          src: [url],
          loop: true,
          preload: true,
          volume: musicVolume,
          html5: true,
        });
      } else if (key === "beachRaceBackground") {
        beachRaceMusicRef.current = new Howl({
          src: [url],
          loop: true,
          preload: true,
          volume: musicVolume,
          html5: true,
        });
      } else if (key === "bombFuse") {
        audioRef.current[key] = new Howl({
          src: [url],
          loop: true,
          preload: true,
        });
      } else {
        audioRef.current[key] = new Howl({ src: [url], preload: true });
      }
    });

    return () => {
      if (lobbyMusicRef.current) lobbyMusicRef.current.unload();
      if (gameMusicRef.current) gameMusicRef.current.unload();
      if (beachRaceMusicRef.current) beachRaceMusicRef.current.unload();
      Object.values(audioRef.current).forEach((howl: any) => howl.unload());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isBeachRacePlaying = !!room && room.gameState === "beach_race_playing";
    const isGameActive = !!room && (
      room.gameState === "playing" ||
      room.gameState === "finished" ||
      room.gameState === "bomb_party_playing" ||
      room.gameState === "bomb_party_finished" ||
      room.gameState === "xo_playing" ||
      room.gameState === "xo_finished" ||
      room.gameState === "iq_playing" ||
      room.gameState === "iq_finished" ||
      room.gameState === "dots_playing" ||
      room.gameState === "dots_finished" ||
      room.gameState === "bus_complete_playing" ||
      room.gameState === "bus_complete_evaluating" ||
      room.gameState === "bus_complete_spin" ||
      room.gameState === "bus_complete_finished" ||
      room.gameState === "hand_playing" ||
      room.gameState === "hand_finished" ||
      room.gameState === "speed_cups_playing" ||
      room.gameState === "speed_cups_evaluating" ||
      room.gameState === "speed_cups_finished" ||
      room.gameState === "speed_cups_countdown" ||
      room.gameState === "wordle_setup" ||
      room.gameState === "wordle_playing" ||
      room.gameState === "wordle_finished" ||
      room.gameState === "connect_four_words_setup" ||
      room.gameState === "connect_four_words_playing" ||
      room.gameState === "connect_four_words_finished" ||
      room.gameState === "space_war_setup" ||
      room.gameState === "space_war_playing" ||
      room.gameState === "space_war_finished" ||
      room.gameState === "puzzle_setup" ||
      room.gameState === "puzzle_playing" ||
      room.gameState === "puzzle_finished" ||
      room.gameState === "beach_race_setup" ||
      room.gameState === "beach_race_playing" ||
      room.gameState === "beach_race_finished"
    );

    const activeMusic = isBeachRacePlaying
      ? beachRaceMusicRef.current
      : isGameActive
      ? gameMusicRef.current
      : lobbyMusicRef.current;

    const allMusics = [
      lobbyMusicRef.current,
      gameMusicRef.current,
      beachRaceMusicRef.current,
    ];

    allMusics.forEach((music) => {
      if (music && music !== activeMusic && music.playing()) {
        music.pause();
      }
    });

    if (activeMusic) {
      // Set volume
      const vol = isMusicMuted ? 0 : musicVolume;
      activeMusic.volume(vol);

      if (
        !isMusicMuted &&
        musicVolume > 0 &&
        audioUnlocked &&
        !isDocumentHidden
      ) {
        if (!activeMusic.playing()) {
          if (activeMusic.state() === "loaded") {
            activeMusic.play();
          } else {
            activeMusic.once("load", () => {
              if (
                !isMusicMuted &&
                musicVolume > 0 &&
                audioUnlocked &&
                !isDocumentHidden
              ) {
                activeMusic.play();
              }
            });
          }
        }
      } else {
        if (activeMusic.playing()) {
          activeMusic.pause();
        }
      }
    }
  }, [
    musicVolume,
    isMusicMuted,
    room?.gameState,
    audioUnlocked,
    isDocumentHidden,
  ]);

  const playSound = useCallback(
    (key: keyof typeof SOUNDS, volumeOverride?: number) => {
      if (isSfxMuted) return;
      const sound = audioRef.current[key];
      if (sound) {
        sound.volume(
          volumeOverride !== undefined ? volumeOverride * sfxVolume : sfxVolume,
        );
        sound.stop(); // Stop any currently playing instance of this sound
        sound.play();
      }
    },
    [sfxVolume, isSfxMuted],
  );

  const stopSound = useCallback((key: keyof typeof SOUNDS) => {
    const sound = audioRef.current[key];
    if (sound) {
      sound.stop();
    }
  }, []);

  useEffect(() => {
    if (room?.gameState === "hand_playing" && room?.handPhase === "picking" && room.handPickerId === socket?.id) {
       playSound("clockTicking");
    } else {
       stopSound("clockTicking");
    }
  }, [room?.gameState, room?.handPhase, room?.handPickerId, socket?.id, playSound, stopSound]);

  // Loop bombFuse sound during active Bomb Party play phase
  useEffect(() => {
    if (room?.gameState === "bomb_party_playing") {
      playSound("bombFuse");
    } else {
      stopSound("bombFuse");
    }
  }, [room?.gameState, playSound, stopSound]);

  // Synchronized ticking of boomSingleTick with the bomb's heartbeat pulse
  useEffect(() => {
    if (room?.gameState !== "bomb_party_playing" || !room?.bombParty || room?.bombParty?.gameOver) {
      return;
    }

    let timeoutId: any;

    const tick = () => {
      playSound("boomSingleTick");

      // Calculate elapsed time directly using Date.now() to avoid state dependencies
      const elapsed = Math.max(0, Date.now() - room.bombParty!.bombStartTime);
      const remainingMs = Math.max(0, room.bombParty!.turnTimeLimit - elapsed);
      const turnLimitSec = (room.bombParty!.turnTimeLimit || 10000) / 1000;
      const ratio = Math.max(0, Math.min(1, (remainingMs / 1000) / turnLimitSec));
      
      // Calmer pulse duration: from 1.2s down to 0.5s
      const pulseDuration = 0.5 + 0.7 * ratio;

      timeoutId = setTimeout(tick, pulseDuration * 1000);
    };

    // Schedule the first tick shortly
    timeoutId = setTimeout(tick, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [room?.gameState, room?.bombParty?.bombStartTime, room?.bombParty?.turnTimeLimit, room?.bombParty?.gameOver, playSound]);

  const prevGameStateRef = useRef<string | null>(null);
  const prevHandGridCountRef = useRef<number>(0);
  const prevHandNextIdxRef = useRef<number>(-1);
  
  useEffect(() => {
    if (room?.gameState === "hand_playing" && room.handGrid && room.handPickerId === socket?.id) {
      const filledCount = room.handGrid.filter((c: any) => c !== null).length;
      if (filledCount > prevHandGridCountRef.current) {
         playSound("handXFill");
      }
      prevHandGridCountRef.current = filledCount;
    } else if (room?.gameState !== "hand_playing") {
      prevHandGridCountRef.current = 0;
      prevHandNextIdxRef.current = -1;
    }
  }, [room?.gameState, room?.handGrid, room?.handPickerId, socket?.id, playSound]);

  useEffect(() => {
    
    if (room && room.gameState === "bomb_party_finished" && prevGameStateRef.current === "bomb_party_playing") {
      const winnerId = room.bombParty?.matchWinnerId;
      const isDraw = !winnerId;
      const isMeWinner = winnerId === socket?.id;
      
      if (isMeWinner) {
        playSound("win");
        setBombPartyMatchPoints(prev => prev + 10); // Winner gets 10 points to match standard games
      } else if (isDraw) {
        playSound("pop");
      } else {
        playSound("bombExplosion");
        
        // Trigger 9-frame explosion sequence (100ms per frame)
        let currentFrame = 1;
        setBombExplosionFrame(1);
        const interval = setInterval(() => {
          currentFrame += 1;
          if (currentFrame <= 9) {
            setBombExplosionFrame(currentFrame);
          } else {
            clearInterval(interval);
            setBombExplosionFrame(null);
          }
        }, 100);
      }
    }

    if (room && room.gameState === "xo_finished" && prevGameStateRef.current === "xo_playing") {
      if (room.xoWinner === socket?.id) {
        playSound("win");
      } else if (room.xoWinner === "draw") {
        playSound("pop");
      } else {
        playSound("lose");
      }
    }

    if (room && room.gameState === "iq_finished" && prevGameStateRef.current === "iq_playing") {
      if (room.iqWinner === socket?.id) {
        playSound("win");
      } else if (room.iqWinner === "draw") {
        playSound("pop");
      } else {
        playSound("lose");
      }
    }

    if (room && room.gameState === "dots_finished" && prevGameStateRef.current === "dots_playing" && room.players.find(p => p.id === socket?.id)) {
      if (room.dotsWinner === socket?.id) {
        playSound("win");
      } else if (room.dotsWinner === "draw") {
        playSound("pop");
      } else {
        playSound("lose");
      }
    }

    if (room && room.gameState === "speed_cups_finished" && (prevGameStateRef.current === "speed_cups_playing" || prevGameStateRef.current === "speed_cups_evaluating")) {
      stopSound("correct");
      stopSound("wrong");
      if (room.speedCupsWinner === socket?.id) {
        playSound("win");
      } else if (room.speedCupsWinner === "draw") {
        playSound("pop");
      } else {
        playSound("lose");
      }
    }


    if (room && room.gameState === "bus_complete_evaluating" && prevGameStateRef.current === "bus_complete_playing") {
      if (room.busCompleteWinner === socket?.id) {
        playSound("win");
      } else if (room.busCompleteWinner === "tie") {
        playSound("pop");
      } else {
        playSound("lose");
      }
    }

    if (room && room.gameState === "hand_finished" && prevGameStateRef.current === "hand_playing") {
      if (room.handWinner === socket?.id) {
        playSound("win");
      } else if (room.handWinner === "draw") {
        playSound("pop");
      } else {
        playSound("lose");
      }
    }

    prevGameStateRef.current = room?.gameState || null;
  }, [room?.gameState, room?.xoWinner, room?.iqWinner, room?.busCompleteWinner, room?.handWinner, socket?.id, playSound]);

  useEffect(() => {
    if (room?.gameState === "bus_complete_playing" && socket?.id && room?.busCompleteDraftAnswers?.[socket.id]) {
       if (!hasRestoredBusDraftRef.current) {
         const drafts = room.busCompleteDraftAnswers[socket.id];
         const currentEmpty = Object.values(busAnswers).every(v => !v);
         if (currentEmpty && drafts && Object.values(drafts).some(v => v)) {
             setBusAnswers(drafts);
             hasRestoredBusDraftRef.current = true;
         }
       }
    } else if (room?.gameState !== "bus_complete_playing") {
       hasRestoredBusDraftRef.current = false;
    }
  }, [room?.gameState, room?.busCompleteDraftAnswers, socket?.id]);

  useEffect(() => {
    if ((room as any)?.iqPreloadImages && Array.isArray((room as any).iqPreloadImages)) {
      preloadIQImages((room as any).iqPreloadImages);
    }
  }, [room?.iqPreloadImages, (room as any)?.iqLevel]);

  const clearPlayerData = () => {
    // Clear all localStorage items related to the game
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("khamin_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear caches if any exist
    if ("caches" in window) {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }

    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Reset all state variables
    setPlayerSerial("");
    setPlayerName("");
    setPlayerAge("");
    setCustomAvatar("");
    setXp(0);
    setWins(0);
    setStreak(0);
    setReports(0);
    setتخمينات(0);
    setLikes(0);
    setOwnedHelpers({});
    setProPackageExpiry(null);
    setDailyQuestStreak(1);
    setLastDailyClaim(0);
    setتخميناتEarnedThisWeek(0);
    setLastTokenEarnedDay(0);
    setIsPermanentBan(false);
    setBanUntil(0);
    setIsAdmin(false);
    setAdminEmail("");
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let imgTimeoutId: NodeJS.Timeout;

    if (
      room &&
      (room.gameState === "guessing" || room.gameState === "discussion")
    ) {
      const hasSeenRules = localStorage.getItem("khamin_rules_seen");
      if (!hasSeenRules) {
        timeoutId = setTimeout(() => {
          setShowRulesModal(true);
        }, 3000); // تأخير الظهور لمدة 3 ثواني
      }

      const easyGuessCount = parseInt(
        localStorage.getItem("khamin_easy_guess_answers_count") || "0",
      );
      const lastEasyGuessMatch = localStorage.getItem(
        "khamin_easy_guess_last_match",
      );

      // إذا لم يظهر من قبل 3 مرات، ولم يظهر في هذه المباراة، ونافذة القوانين غير ظاهرة
      if (
        easyGuessCount < 3 &&
        lastEasyGuessMatch !== room.id &&
        !showRulesModal
      ) {
        imgTimeoutId = setTimeout(() => {
          if (!showRulesModal) {
            setShowHowToOpenEasyGuess(true);
            localStorage.setItem("khamin_easy_guess_last_match", room.id);
            localStorage.setItem(
              "khamin_easy_guess_answers_count",
              (easyGuessCount + 1).toString(),
            );
          }
        }, 5000);
      }
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (imgTimeoutId) clearTimeout(imgTimeoutId);
    };
  }, [room?.gameState, room?.id, showRulesModal]);

  const handleAcceptRules = () => {
    localStorage.setItem("khamin_rules_seen", "true");
    setShowRulesModal(false);
    playSound("clickClose");
  };

  useEffect(() => {
    const processAuthSuccess = (userData: any) => {
      console.log("Processing Auth Success:", userData);
      if (userData.isAdmin) {
        console.log("User is admin, attempting to set status...");
        if (!socket) {
          console.error("Socket not connected");
          setError("خطأ في الاتصال بالخادم. حاول مرة أخرى.");
          return;
        }

        setIsAdmin(true);
        setAdminEmail(userData.email);
        localStorage.setItem("khamin_is_admin", "true");
        localStorage.setItem("khamin_admin_email", userData.email);
        if (userData.adminToken) {
          localStorage.setItem("khamin_admin_token", userData.adminToken);
        }
        socket.emit(
          "admin_set_admin_status",
          {
            serial: playerSerial,
            isAdmin: true,
            email: userData.email,
            adminToken: userData.adminToken,
          },
          (res: any) => {
            console.log("Admin status set response:", res);
            if (res.success) {
              if (res.adminToken) {
                localStorage.setItem("khamin_admin_token", res.adminToken);
              }
              closeAllModals();
              setShowAdminDashboard(true);
            } else {
              console.error("Failed to set admin status:", res.error);
              setError(
                "فشل في تحديث صلاحيات الإدارة: " +
                  (res.error || "خطأ غير معروف"),
              );
            }
          },
        );
      } else {
        console.log("User is not admin");
        setError("عذراً، هذا الحساب لا يملك صلاحيات الإدارة.");
      }
    };

    // Check URL parameters for direct redirect auth and prizes
    const checkUrlParams = () => {
      if (!socket) return;
      const params = new URLSearchParams(window.location.search);

      // Handle Admin Auth
      if (params.get("admin_auth") === "success") {
        const user = {
          email: params.get("email"),
          adminToken: params.get("adminToken"),
          isAdmin: params.get("isAdmin") === "true",
        };
        console.log("Google Auth Success found in URL params:", user);

        if (socket.connected) {
          processAuthSuccess(user);
          // Clean URL but keep other params for now
          const url = new URL(window.location.href);
          url.searchParams.delete("admin_auth");
          url.searchParams.delete("email");
          url.searchParams.delete("adminToken");
          url.searchParams.delete("isAdmin");
          window.history.replaceState({}, document.title, url.toString());
        } else {
          socket.once("connect", () => {
            processAuthSuccess(user);
            const url = new URL(window.location.href);
            url.searchParams.delete("admin_auth");
            url.searchParams.delete("email");
            url.searchParams.delete("adminToken");
            url.searchParams.delete("isAdmin");
            window.history.replaceState({}, document.title, url.toString());
          });
        }
      }

      // Handle Prize Serial
      const serialParam = params.get("serial");
      const helperParam = params.get("helper");
      if (serialParam && helperParam) {
        console.log("Found prize serial in URL:", serialParam, helperParam);

        // If we don't have a serial yet, use this one
        if (!playerSerial) {
          setPlayerSerial(serialParam);
          localStorage.setItem("khamin_player_serial", serialParam);
        }

        const claimPrize = () => {
          socket.emit(
            "claim_serial_prize",
            { serial: serialParam, helperId: helperParam },
            (res: any) => {
              if (res.success) {
                console.log("Prize claimed successfully:", helperParam);
                setReadyPowerUps((prev) => [...prev, helperParam]);
                showAlert(
                  `مبروك! حصلت على مساعدة "${HELPER_ITEMS.find((h) => h.id === helperParam)?.name || helperParam}" مجانية لهذه المباراة! 🎁`,
                  "هدية",
                );
              } else {
                console.log("Prize claim failed:", res.error);
                if (res.error) setError(res.error);
              }
            },
          );
        };

        if (socket.connected) {
          claimPrize();
        } else {
          socket.once("connect", claimPrize);
        }
      }
    };
    checkUrlParams();

    return () => {
      // Cleanup if needed
    };
  }, [socket, playerSerial]);

  const fetchAdminImages = useCallback(async () => {
    try {
      console.log("Fetching admin images...");
      const res = await fetch(apiUrl("/api/admin/images"));
      const data = await res.json();
      console.log("Admin images fetched:", data);
      if (Array.isArray(data)) setAdminImages(data);
    } catch (error) {
      console.error("Fetch images failed", error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin && showAdminDashboard && adminTab === "images") {
      fetchAdminImages();
    }
  }, [isAdmin, showAdminDashboard, adminTab, fetchAdminImages]);

  useEffect(() => {
    console.log(
      "DEBUG: adminImages updated:",
      adminImages.map((img) => ({ name: img.name, category: img.category })),
    );
  }, [adminImages]);

  const lastFetchedCollectionTimeRef = useRef<{ [serial: string]: number }>({});
  const fetchCollection = useCallback(async (serial: string, force = false) => {
    if (!serial) return;
    const now = Date.now();
    if (
      !force &&
      lastFetchedCollectionTimeRef.current[serial] &&
      now - lastFetchedCollectionTimeRef.current[serial] < 10 * 60 * 1000 // 10 minutes cache
    ) {
      return;
    }

    // Check localStorage cache if not forced
    if (!force) {
      const cachedTime = localStorage.getItem(`khamin_collection_cache_time_${serial}`);
      if (cachedTime) {
        const age = now - parseInt(cachedTime, 10);
        if (age < 10 * 60 * 1000) {
          lastFetchedCollectionTimeRef.current[serial] = parseInt(cachedTime, 10);
          return;
        }
      }
    }

    lastFetchedCollectionTimeRef.current[serial] = now;
    try {
      const res = await fetch(apiUrl(`/api/collection/${serial}`));
      const data = await res.json();
      if (data.collection) {
        setPlayerCollection(data.collection);
        try {
          localStorage.setItem(`khamin_collection_cache_${serial}`, JSON.stringify(data.collection));
        } catch (e) {}
      }
      if (data.claimed) {
        setClaimedCollectionRewards(data.claimed);
        try {
          localStorage.setItem(`khamin_claimed_cache_${serial}`, JSON.stringify(data.claimed));
        } catch (e) {}
      }
      try {
        localStorage.setItem(`khamin_collection_cache_time_${serial}`, now.toString());
      } catch (e) {}
    } catch (error) {
      console.error("Fetch collection failed", error);
    }
  }, []);

  useEffect(() => {
    if (playerSerial) {
      fetchCollection(playerSerial);
    }
  }, [playerSerial, fetchCollection]);

  useEffect(() => {
    if (socket && playerSerial) {
      socket.on("collection_reward_claimed", (data: any) => {
        showAlert(
          `مبروك! أكملت المرحلة ${data.stage} من فئة ${data.categoryName} وحصلت على ${data.xp} XP! 🏆`,
          "مكافأة المجموعة",
        );
        setXp((prev) => prev + data.xp);
        fetchCollection(playerSerial);
        const fingerprint = localStorage.getItem("khamin_fingerprint");
        if (fingerprint) {
          socket.emit("get_player_data", {
            serial: playerSerial,
            fingerprint,
            secretToken: localStorage.getItem("khamin_secret_token"),
          });
        }
      });
      return () => {
        socket.off("collection_reward_claimed");
      };
    }
  }, [socket, playerSerial, fetchCollection]);

  useEffect(() => {
    if (showAdminDashboard && socket) {
      socket.emit("admin_get_players", (players: any) => {
        if (Array.isArray(players)) setAdminPlayers(players);
      });
      socket.emit("admin_get_reports", (reports: any) => {
        if (Array.isArray(reports)) setAdminReports(reports);
      });
      socket.emit("admin_get_pending_avatars", (pending: any) => {
        if (Array.isArray(pending)) setPendingAvatars(pending);
      });
      socket.emit("admin_get_contacts", (contacts: any) => {
        if (Array.isArray(contacts)) setAdminContacts(contacts);
      });
      socket.emit("admin_get_settings", (settings: any) => {
        if (settings) {
          setPaymobSettings({
            paymob_api_key:
              settings.paymob_api_key ||
              "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFek9EazBNU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5ySGdYVGNEVmFpSkQ2bTktQ1lETzJzSEV1N3JqVjR1RkdpR2F2dHlZNEM4T0JicXFSYWF3NEFqVWdES1otQ25NOHd3aGtDZlVfVFk3UkRjNV9jZ3BUZw==",
            paymob_wallet_integration_id:
              settings.paymob_wallet_integration_id || "5579190",
            paymob_card_integration_id:
              settings.paymob_card_integration_id || "5572379",
            paymob_iframe_id: settings.paymob_iframe_id || "1013400",
            paymob_hmac:
              settings.paymob_hmac || "A2DBAF7F92579F5B6CE8687D60BE29BA",
          });
          if (settings.lucky_wheel_enabled !== undefined) {
            setLuckyWheelEnabled(settings.lucky_wheel_enabled === "true");
          }
        }
      });
    }
  }, [showAdminDashboard, socket]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(apiUrl("/api/categories"));
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Fetch categories failed", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.icon) return;
    setIsAddingCategory(true);
    try {
      const id = newCategory.name.toLowerCase().replace(/\s+/g, "_");
      const response = await fetch(apiUrl("/api/admin/categories"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: newCategory.name,
          icon: newCategory.icon,
        }),
      });
      if (response.ok) {
        setNewCategory({ id: "", name: "", icon: "" });
        fetchCategories();
        showAlert("تم إضافة الفئة بنجاح", "نجاح");
      } else {
        showAlert("فشل إضافة الفئة", "خطأ");
      }
    } catch (error) {
      console.error("Add category failed", error);
      showAlert("حدث خطأ أثناء الإضافة", "خطأ");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    showConfirm(
      "هل أنت متأكد من حذف هذه الفئة وجميع الصور المرتبطة بها؟",
      async () => {
        try {
          const response = await fetch(apiUrl(`/api/admin/categories/${id}`), {
            method: "DELETE",
          });
          if (response.ok) {
            fetchCategories();
            fetchAdminImages();
          } else {
            showAlert("فشل حذف الفئة", "خطأ");
          }
        } catch (error) {
          console.error("Delete category failed", error);
          showAlert("حدث خطأ أثناء الحذف", "خطأ");
        }
      },
      "حذف الفئة",
    );
  };

  const handleImageUpload = async () => {
    if (!newImage.name || !newImage.data) return;
    setIsUploading(true);
    try {
      const targetLevel = expandedUploadLevel || "مستوي مبتدئين التخمين";
      const response = await fetch(apiUrl("/api/admin/images"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newImage,
          addedBy: adminEmail,
          level: targetLevel,
        }),
      });
      if (response.ok) {
        // Auto-expand the category that was just uploaded to
        setExpandedAdminCategories((prev) => ({
          ...prev,
          [newImage.category]: true,
        }));
        setNewImage({ ...newImage, name: "", data: "" });
        fetchAdminImages();
        showAlert("تم رفع الصورة بنجاح", "نجاح");
      } else {
        showAlert("فشل رفع الصورة", "خطأ");
      }
    } catch (error) {
      console.error("Upload failed", error);
      showAlert("حدث خطأ أثناء الرفع", "خطأ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    showConfirm(
      "هل أنت متأكد من حذف هذه الصورة؟",
      async () => {
        try {
          const response = await fetch(apiUrl(`/api/admin/images/${id}`), {
            method: "DELETE",
          });
          if (response.ok) {
            fetchAdminImages();
          } else {
            showAlert("فشل حذف الصورة", "خطأ");
          }
        } catch (error) {
          console.error("Delete failed", error);
        }
      },
      "حذف الصورة",
    );
  };

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      try {
        console.log("Disconnecting existing socket to prevent duplicates...");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      } catch (e) {
        console.error("Error disconnecting existing socket:", e);
      }
    }

    setIsConnecting(true);
    setIsConnected(false);
    setConnectionError(null);

    let newSocket: any;
    if (isServerlessMode()) {
      console.log("[Serverless Mode] Active - initializing ServerlessSocket directly");
      newSocket = getServerlessSocket();
    } else {
      const serverUrl = getApiBaseUrl();
      console.log("Initializing socket connection to:", serverUrl);
      try {
        newSocket = io(serverUrl, {
          transports: ["websocket"],
          upgrade: false,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        });
      } catch (err) {
        console.warn("io() initialization failed, falling back to ServerlessSocket:", err);
        newSocket = getServerlessSocket();
      }
    }

    if (newSocket && typeof newSocket.emit === "function" && !isServerlessMode()) {
      const originalEmit = newSocket.emit;
      newSocket.emit = function(event: string, ...args: any[]) {
        const room = GameEngineService.getCurrentRoom();
        const isBotOrOffline = room?.players?.[1]?.isBot || !this.connected;
        
        // Events that must ALWAYS go to real server (if possible) or be ignored
        const serverEvents = [
          "check_ad_status", "check_key_ad_status", "update_player_notifications", 
          "set_player_serial_for_socket", "update_player_privacy", "update_avatar",
          "update_selected_frame", "find_random_match", "leave_matchmaking", "respond_to_match",
          "admin_get_active_rooms", "admin_get_reward_history", "admin_get_pending_avatars",
          "admin_get_contacts"
        ];

        if (isBotOrOffline && !serverEvents.includes(event)) {
           console.log("[Serverless Intercept] Routing to GameEngineService:", event, args[0]);
           GameEngineService.handleAction(event, args[0]);
           return this as any;
        }
        
        return originalEmit.apply(this, [event, ...args] as any);
      };
      
      const originalOn = newSocket.on;
      newSocket.on = function(event: string, fn: any) {
        GameEngineService.on(event, fn);
        return originalOn.apply(this, [event, fn] as any);
      };

      const originalOff = newSocket.off;
      newSocket.off = function(event: string, fn?: any) {
        if (fn) {
          GameEngineService.off(event, fn);
        }
        return originalOff.apply(this, [event, fn] as any);
      };
    }
    
    socketRef.current = newSocket;
    setSocket(newSocket);

    if (isServerlessMode()) {
      setIsConnected(true);
      setIsConnecting(false);
    }

    newSocket.on("config_updated", () => {
      refreshConfig();
    });

    newSocket.on("system_announcement", (message: string) => {
      setAnnouncementMessage(message);
    });

    newSocket.on("global_reward_available", (reward: any) => {
      setActiveGlobalReward(reward);
    });

    newSocket.on("bus_complete_reward_claimed", (data: any) => {
      playSound("prize");
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا تخمينة كومبليت بنجاح! 🎁",
         message: "تم ترقية مستوى الهدايا إلى " + data.newLevel + "! متبقى 48 ساعة فقط قبل انتهاء صلاحية هدايا الوسائل المساعدة والمفاتيح التي استلمتها الان! استمتع بها.\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + (data.newLevel > 1 ? data.newLevel - 1 : 10) + " من كل وسيلة مساعدة",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
      
      if (data.points != null) {
        setBusCompleteMatchPoints(data.points);
        localStorage.setItem("khamin_bus_match_points", data.points.toString());
      }
      if (data.newLevel != null) {
        setBusCompleteRewardLevel(data.newLevel);
        localStorage.setItem("khamin_bus_reward_level", data.newLevel.toString());
      }
    });

    newSocket.on("hand_reward_claimed", (data: any) => {
      playSound("prize");
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا التخمين بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا كف اليد إلى " + data.newLevel + "!\n\n" +
                  "تم إضافة:\n" +
                  `+ ${data.xp} نقطة خبرة ✨\n` +
                  `+ ${data.keys} مفاتيح 🔑\n` +
                  `+ ${Object.values(data.helpers)[0]} من كل وسيلة مساعدة 🛠️`,
         confirmText: "رائع!",
         onConfirm: () => { setCustomConfirm({ show: false, title: "", message: "", confirmText: "", onConfirm: () => {} }); }
      });
      if (data.points != null) {
        setHandMatchPoints(data.points);
        localStorage.setItem("khamin_hand_match_points", data.points.toString());
      }
      if (data.newLevel != null) {
        setHandRewardLevel(data.newLevel);
        localStorage.setItem("khamin_hand_reward_level", data.newLevel.toString());
      }
    });

    newSocket.on("iq_reward_claimed", (data: any) => {
      playSound("prize");
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا IQ بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا IQ إلى " + data.newLevel + "!\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + (data.newLevel > 1 ? data.newLevel - 1 : 10) + " من كل وسيلة مساعدة",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
      if (data.points != null) {
        setIqMatchPoints(data.points);
        localStorage.setItem("khamin_iq_match_points", data.points.toString());
      }
      if (data.newLevel != null) {
        setIqRewardLevel(data.newLevel);
        localStorage.setItem("khamin_iq_reward_level", data.newLevel.toString());
      }
    });

    newSocket.on("beach_race_reward_claimed", (data: any) => {
      playSound("prize");
      if (data.newLevel != null) {
        setBeachRaceRewardLevel(data.newLevel);
        setBeachRaceMatchPoints(0);
        localStorage.setItem("khamin_beach_race_reward_level", data.newLevel.toString());
        localStorage.setItem("khamin_beach_race_match_points", "0");
      }
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا سباق التخمين بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا سباق التخمين إلى " + data.newLevel + "!\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + (data.newLevel - 1) + " من كل وسيلة مساعدة (تلميح، عدد الكلمات، كاشف الحروف، تجميد الوقت، الجاسوس)",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
    });

    newSocket.on("wordle_reward_claimed", (data: any) => {
      playSound("prize");
      if (data.points != null) {
        setWordleMatchPoints(data.points);
        localStorage.setItem("khamin_wordle_match_points", data.points.toString());
      }
      if (data.newLevel != null) {
        setWordleRewardLevel(data.newLevel);
        localStorage.setItem("khamin_wordle_reward_level", data.newLevel.toString());
      }
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا تخمينة كلمة لي بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا تخمينة كلمة لي إلى " + data.newLevel + "!\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + data.newLevel + " من كل وسيلة مساعدة (تلميح، عدد الكلمات، كاشف الحروف، تجميد الوقت، الجاسوس)",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
    });
    newSocket.on("xo_reward_claimed", (data: any) => {
      playSound("prize");
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا XO بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا XO إلى " + data.newLevel + "!\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + (data.newLevel > 1 ? data.newLevel - 1 : 10) + " من كل وسيلة مساعدة",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
      if (data.points != null) {
        setXoMatchPoints(data.points);
        localStorage.setItem("khamin_xo_match_points", data.points.toString());
      }
      if (data.newLevel != null) {
        setXoRewardLevel(data.newLevel);
        localStorage.setItem("khamin_xo_reward_level", data.newLevel.toString());
      }
    });

    newSocket.on("bomb_party_reward_claimed", (data: any) => {
      playSound("prize");
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا قنبلة التخمين بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا قنبلة التخمين إلى " + data.newLevel + "!\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + (data.newLevel > 1 ? data.newLevel - 1 : 10) + " من كل وسيلة مساعدة",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
      if (data.newLevel != null) {
        setBombPartyRewardLevel(data.newLevel);
        localStorage.setItem("khamin_bomb_reward_level", data.newLevel.toString());
      }
    });

    newSocket.on("dots_reward_claimed", (data: any) => {
      playSound("prize");
      setCustomConfirm({
         show: true,
         title: "تم استلام هدايا لعبة نقطة وخط بنجاح! 🎁",
         message: "تم ترقية مستوى هدايا نقطة وخط إلى " + data.newLevel + "!\n\n" +
                  "حصلت على:\n" +
                  "⭐ " + data.xp + " خبرة\n" +
                  "🔑 " + data.keys + " مفاتيح\n" +
                  "🔧 " + (data.newLevel > 1 ? data.newLevel - 1 : 10) + " من كل وسيلة مساعدة",
         confirmText: "رائع!",
         onConfirm: () => setCustomConfirm(prev => ({...prev, show: false}))
      });
      if (data.points != null) {
        setDotsMatchPoints(data.points);
        localStorage.setItem("khamin_dots_match_points", data.points.toString());
      }
      if (data.newLevel != null) {
        setDotsRewardLevel(data.newLevel);
        localStorage.setItem("khamin_dots_reward_level", data.newLevel.toString());
      }
    });

    newSocket.on("app_settings", (settings: any) => {
      if (settings && settings.lucky_wheel_enabled !== undefined) {
        setLuckyWheelEnabled(
          settings.lucky_wheel_enabled === "true" ||
            settings.lucky_wheel_enabled === true,
        );
      }
    });

    newSocket.on("connect", () => {
      if (socketRef.current !== newSocket) return;
      console.log("Socket connected successfully! ID:", newSocket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);

      refreshConfig();

      newSocket.emit("get_shop_items", (items: any[]) => {
        if (items) setShopItems(items);
      });

      newSocket.on(
        "show_alert",
        (data: { message: string; title?: string }) => {
          showAlert(data.message, data.title);
        },
      );

      const serial = localStorage.getItem("khamin_player_serial");
      if (serial) {
        newSocket.emit("set_player_serial_for_socket", {
          serial,
          fingerprint,
          secretToken: localStorage.getItem("khamin_secret_token"),
        });
        const isAdmin = localStorage.getItem("khamin_is_admin") === "true";
        const adminEmail =
          localStorage.getItem("khamin_admin_email") ||
          "adhamsabry.co@gmail.com";
        const adminToken = localStorage.getItem("khamin_admin_token");
        if (isAdmin) {
          newSocket.emit(
            "admin_set_admin_status",
            { serial, isAdmin: true, email: adminEmail, adminToken },
            (res: any) => {
              if (res?.success && res.adminToken) {
                localStorage.setItem("khamin_admin_token", res.adminToken);
              }
            },
          );
        }
        // Fetch actual server data
        newSocket.emit(
          "get_player_data",
          {
            serial,
            fingerprint,
            secretToken: localStorage.getItem("khamin_secret_token"),
          },
          (data: any) => {
            if (data && data.error) {
              // We DO NOT remove the serial from localStorage here anymore.
              // This prevents permanent account loss if the server DB is temporarily empty/reset.
              setError(data.error);
              setShowWelcomeModal(true);
            } else if (data) {
              setRoom((currentRoom) => {
                if (currentRoom && (!data.activeRoomId || data.activeRoomId !== currentRoom.id)) {
                  setTimeout(() => {
                    showAlert("انتهت المباراة أو غادر منافسك أثناء انقطاع اتصالك.", "تنبيه");
                  }, 100);
                  setJoined(false);
                  return null;
                }
                return currentRoom;
              });

              setXp(data.xp);
              prevLevelRef.current = getLevel(data.xp);
              setWins(data.wins || 0);
              setReports(data.reports || 0);
              setتخمينات(data.tokens || 0);
              setReportedSerials(data.reportedSerials || []);
              if (data.secretToken) {
                localStorage.setItem("khamin_secret_token", data.secretToken);
              }
              if (data.recentOpponents) {
                setRecentOpponents(data.recentOpponents);
              }
              localStorage.setItem(
                "khamin_tokens",
                (data.tokens || 0).toString(),
              );

              if (data.keys != null) {
                setKeys(data.keys);
                localStorage.setItem("khamin_keys", data.keys.toString());
              }
              if (data.busCompleteRewardLevel != null) {
                setBusCompleteRewardLevel(data.busCompleteRewardLevel);
                localStorage.setItem("khamin_bus_reward_level", data.busCompleteRewardLevel.toString());
              }
              if (data.busCompleteMatchPoints != null) {
                setBusCompleteMatchPoints(data.busCompleteMatchPoints);
                localStorage.setItem("khamin_bus_match_points", data.busCompleteMatchPoints.toString());
              }
              if (data.xoRewardLevel != null) {
                setXoRewardLevel(data.xoRewardLevel);
                localStorage.setItem("khamin_xo_reward_level", data.xoRewardLevel.toString());
              }
              if (data.iqRewardLevel != null) {
                setIqRewardLevel(data.iqRewardLevel);
                localStorage.setItem("khamin_iq_reward_level", data.iqRewardLevel.toString());
              }
              if (data.xoMatchPoints != null) {
                setXoMatchPoints(data.xoMatchPoints);
                localStorage.setItem("khamin_xo_match_points", data.xoMatchPoints.toString());
              }
              if (data.iqMatchPoints != null) {
                setIqMatchPoints(data.iqMatchPoints);
                localStorage.setItem("khamin_iq_match_points", data.iqMatchPoints.toString());
              }
              if (data.dotsRewardLevel != null) {
                setDotsRewardLevel(data.dotsRewardLevel);
                localStorage.setItem("khamin_dots_reward_level", data.dotsRewardLevel.toString());
              }
              if (data.dotsMatchPoints != null) {
                setDotsMatchPoints(data.dotsMatchPoints);
                localStorage.setItem("khamin_dots_match_points", data.dotsMatchPoints.toString());
              }
              if (data.speedCupsRewardLevel != null) {
                setSpeedCupsRewardLevel(data.speedCupsRewardLevel);
                localStorage.setItem("khamin_speed_cups_reward_level", data.speedCupsRewardLevel.toString());
              }
              if (data.speedCupsMatchPoints != null) {
                setSpeedCupsMatchPoints(data.speedCupsMatchPoints);
                localStorage.setItem("khamin_speed_cups_match_points", data.speedCupsMatchPoints.toString());
              }
              if (data.handRewardLevel != null) {
                setHandRewardLevel(data.handRewardLevel);
                localStorage.setItem("khamin_hand_reward_level", data.handRewardLevel.toString());
              }
              if (data.handMatchPoints != null) {
                setHandMatchPoints(data.handMatchPoints);
                localStorage.setItem("khamin_hand_match_points", data.handMatchPoints.toString());
              }
              if (data.likes != null) {
                setLikes(data.likes);
                localStorage.setItem("khamin_likes", data.likes.toString());
              }
              if (data.tempItems) {
                setTempItems(data.tempItems);
              }
              if (data.ownedHelpers) {
                setOwnedHelpers(data.ownedHelpers);
                localStorage.setItem(
                  "khamin_owned_helpers",
                  JSON.stringify(data.ownedHelpers),
                );
              }

              newSocket.emit("get_city_search", { serial });

              if (data.dailyQuestStreak) {
                setDailyQuestStreak(data.dailyQuestStreak);
                localStorage.setItem(
                  "khamin_daily_streak",
                  data.dailyQuestStreak.toString(),
                );
              }

              if (data.lastDailyClaim) {
                setLastDailyClaim(data.lastDailyClaim);
                localStorage.setItem(
                  "khamin_last_daily_claim",
                  data.lastDailyClaim.toString(),
                );
              }

              if (data.weeklyتخميناتClaimed !== undefined) {
                setتخميناتEarnedThisWeek(data.weeklyتخميناتClaimed);
                localStorage.setItem(
                  "khamin_tokens_earned_this_week",
                  data.weeklyتخميناتClaimed.toString(),
                );
              }

              fetchCollection(serial);

              if (data.isPermanentBan) {
                setIsPermanentBan(true);
                newSocket.disconnect();
              } else if (data.banUntil && data.banUntil > Date.now()) {
                setBanUntil(data.banUntil);
                newSocket.disconnect();
              }

              if (data.proPackageExpiry) {
                setProPackageExpiry(data.proPackageExpiry);
                localStorage.setItem(
                  "khamin_pro_package_expiry",
                  data.proPackageExpiry.toString(),
                );
              }
              if (data.unlockedHelpersExpiry) {
                setUnlockedHelpersExpiry(data.unlockedHelpersExpiry);
                localStorage.setItem(
                  "khamin_unlocked_helpers_expiry",
                  data.unlockedHelpersExpiry.toString(),
                );
              }

              // Sync Avatar State from Server
              if (data.avatar) {
                setAvatar(data.avatar);
                localStorage.setItem("khamin_player_avatar", data.avatar);
                if (data.avatar.startsWith("data:image/")) {
                  setCustomAvatar(data.avatar);
                  localStorage.setItem("khamin_custom_avatar", data.avatar);
                } else if (data.avatarStatus !== "pending") {
                  // If the current avatar is NOT a custom one, and we don't have a pending one,
                  // we should probably clear the customAvatar state unless it's actually pending
                  if (!data.pendingAvatar) {
                    setCustomAvatar("");
                    localStorage.removeItem("khamin_custom_avatar");
                  }
                }
              }
              if (data.avatarStatus) {
                setAvatarStatus(data.avatarStatus);
                if (data.avatarStatus === "rejected") {
                  setCustomAvatar("");
                  localStorage.removeItem("khamin_custom_avatar");
                }
              }
              if (data.pendingAvatar) {
                setCustomAvatar(data.pendingAvatar);
                // We don't save pending to localStorage to avoid it persisting if rejected
              }
              if (data.selectedFrame !== undefined) {
                setSelectedFrame(data.selectedFrame);
                localStorage.setItem("khamin_player_frame", data.selectedFrame);
              }

              if (data.likes !== undefined) {
                setLikes(data.likes);
                localStorage.setItem("khamin_likes", data.likes.toString());
              }

              localStorage.setItem("khamin_xp", data.xp.toString());
              localStorage.setItem("khamin_wins", (data.wins || 0).toString());
            } else {
              // We DO NOT call clearPlayerData() here anymore to prevent permanent account loss
              // if the server database is temporarily empty or unavailable.
              setError(
                "لم يتم العثور على حسابك في قاعدة البيانات. قد يكون هناك تحديث أو صيانة.",
              );
              setPendingWelcomeModal(true);
            }
          },
        );
      } else {
        setPendingWelcomeModal(true);
      }

      newSocket.emit("get_player_rank", playerSerial, (rank: number) => {
        if (typeof rank === "number") {
          setMyLeaderboardRank(rank);
          try {
            localStorage.setItem("khamin_my_rank", JSON.stringify(rank));
          } catch (e) {}
        }
      });

      newSocket.emit("get_highest_likes_serial", (data: any) => {
        if (data && typeof data === "object") {
          if (data.serials) setHighestLikesSerials(data.serials);
          if (data.value !== undefined) {
            setHighestLikesValue(data.value);
            localStorage.setItem(
              "khamin_highest_likes_value",
              data.value.toString(),
            );
          }
          if (data.players) {
            setHighestLikesPlayers(data.players);
            localStorage.setItem(
              "khamin_highest_likes_players",
              JSON.stringify(data.players),
            );
          }
        }
      });

      newSocket.emit("get_highest_streak_serial", (data: any) => {
        if (data && typeof data === "object") {
          if (data.serials) setHighestStreakSerials(data.serials);
          if (data.value !== undefined) {
            setHighestStreakValue(data.value);
            localStorage.setItem(
              "khamin_highest_streak_value",
              data.value.toString(),
            );
          }
          if (data.players) {
            setHighestStreakPlayers(data.players);
            localStorage.setItem(
              "khamin_highest_streak_players",
              JSON.stringify(data.players),
            );
          }
        }
      });

      newSocket.emit("get_highest_level_serial", (data: any) => {
        if (data && typeof data === "object") {
          if (data.serials) setHighestLevelSerials(data.serials);
          if (data.value !== undefined) {
            setHighestLevelValue(data.value);
            localStorage.setItem(
              "khamin_highest_level_value",
              data.value.toString(),
            );
          }
          if (data.players) {
            setHighestLevelPlayers(data.players);
            localStorage.setItem(
              "khamin_highest_level_players",
              JSON.stringify(data.players),
            );
          }
        }
      });

      newSocket.on("highest_likes_update", (data: any) => {
        if (data && typeof data === "object") {
          if (data.serials) setHighestLikesSerials(data.serials);
          if (data.value !== undefined) {
            setHighestLikesValue(data.value);
            localStorage.setItem(
              "khamin_highest_likes_value",
              data.value.toString(),
            );
          }
          if (data.players) {
            setHighestLikesPlayers(data.players);
            localStorage.setItem(
              "khamin_highest_likes_players",
              JSON.stringify(data.players),
            );
          }
        }
      });

      newSocket.on("highest_level_update", (data: any) => {
        if (data && typeof data === "object") {
          if (data.serials) setHighestLevelSerials(data.serials);
          if (data.value !== undefined) {
            setHighestLevelValue(data.value);
            localStorage.setItem(
              "khamin_highest_level_value",
              data.value.toString(),
            );
          }
          if (data.players) {
            setHighestLevelPlayers(data.players);
            localStorage.setItem(
              "khamin_highest_level_players",
              JSON.stringify(data.players),
            );
          }
        }
      });

      newSocket.on("highest_streak_update", (data: any) => {
        if (data && typeof data === "object") {
          if (data.serials) setHighestStreakSerials(data.serials);
          if (data.value !== undefined) {
            setHighestStreakValue(data.value);
            localStorage.setItem(
              "khamin_highest_streak_value",
              data.value.toString(),
            );
          }
          if (data.players) {
            setHighestStreakPlayers(data.players);
            localStorage.setItem(
              "khamin_highest_streak_players",
              JSON.stringify(data.players),
            );
          }
        }
      });

      if (serial) {
        newSocket.emit("get_friends", { serial }, (res: any) => {
          if (res.success) {
            setFriendsList(res.friends);
            setFriendsTotal(res.total);
          }
        });

        newSocket.emit("get_friend_requests", { serial }, (res: any) => {
          if (res.success) setFriendRequests(res.requests);
        });

        newSocket.emit(
          "get_collection_notifications",
          { serial },
          (res: any) => {
            if (res.notifications)
              setCollectionNotifications(res.notifications);
          },
        );

        newSocket.emit("get_admin_messages", { serial }, (res: any) => {
          if (res.messages) setSystemMessages(res.messages);
        });

        newSocket.emit("get_like_notifications", { serial }, (res: any) => {
          if (res.notifications) setLikeNotifications(res.notifications);
        });

        newSocket.emit(
          "get_friend_accepted_notifications",
          { serial },
          (res: any) => {
            if (res.notifications)
              setFriendAcceptedNotifications(res.notifications);
          },
        );

        newSocket.emit("get_gift_notifications", { serial }, (res: any) => {
          if (res.success && res.notifications)
            setGiftNotifications(res.notifications);
        });
      }
    });

    newSocket.on("new_gift_notification", (notif: any) => {
      playSound("notification");
      setGiftNotifications((prev) => [notif, ...prev]);
    });

    newSocket.on("connect_error", (err) => {
      if (socketRef.current !== newSocket) return;
      console.warn("Socket connection error, seamlessly switching to Serverless Mode:", err);
      const serverlessSock = getServerlessSocket();
      socketRef.current = serverlessSock as any;
      setSocket(serverlessSock as any);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    newSocket.on("disconnect", (reason) => {
      if (socketRef.current !== newSocket) return;
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("disconnected_error", (msg: string) => {
      if (socketRef.current !== newSocket) return;
      setError(msg);
      setIsConnected(false);
    });

    newSocket.on("new_like_notification", (notification: any) => {
      setLikeNotifications((prev) => [notification, ...prev]);
      playSound("message");
    });

    newSocket.on("online_count", (data) => {
      if (typeof data === "number") {
        setOnlineCount(data);
      } else if (data && typeof data === "object") {
        setOnlineCount(data.online);
        setTotalPlayersCount(data.total);
      }
    });

    newSocket.on("key_found", (data: any) => {
      setKeys(data.keys);
      localStorage.setItem("khamin_keys", data.keys.toString());
      setShowKeyDrop(true);
      setTimeout(() => setShowKeyDrop(false), 3000);
      playSound("prize"); // Using a milder drop sound instead of the loud win sound
    });

    newSocket.on("player_data_update", (data: any) => {
      if (data.reports !== undefined) setReports(data.reports);
      if (data.xp !== undefined) {
        setXp(data.xp);
        localStorage.setItem("khamin_xp", data.xp.toString());
      }
      if (data.wins !== undefined) {
        setWins(data.wins);
        localStorage.setItem("khamin_wins", data.wins.toString());
      }
      if (data.streak !== undefined) {
        setStreak(data.streak);
        localStorage.setItem("khamin_streak", data.streak.toString());
      }
      if (data.tokens != null) {
        setتخمينات(data.tokens);
        localStorage.setItem("khamin_tokens", data.tokens.toString());
      }
      if (data.keys != null) {
        setKeys(data.keys);
        localStorage.setItem("khamin_keys", data.keys.toString());
      }
      if (data.busCompleteRewardLevel != null) {
        setBusCompleteRewardLevel(data.busCompleteRewardLevel);
        localStorage.setItem("khamin_bus_reward_level", data.busCompleteRewardLevel.toString());
      }
      if (data.busCompleteMatchPoints != null) {
        setBusCompleteMatchPoints(data.busCompleteMatchPoints);
        localStorage.setItem("khamin_bus_match_points", data.busCompleteMatchPoints.toString());
      }
      if (data.xoRewardLevel != null) {
                setXoRewardLevel(data.xoRewardLevel);
                localStorage.setItem("khamin_xo_reward_level", data.xoRewardLevel.toString());
              }
              if (data.iqRewardLevel != null) {
                setIqRewardLevel(data.iqRewardLevel);
                localStorage.setItem("khamin_iq_reward_level", data.iqRewardLevel.toString());
              }
      if (data.xoMatchPoints != null) {
                setXoMatchPoints(data.xoMatchPoints);
                localStorage.setItem("khamin_xo_match_points", data.xoMatchPoints.toString());
              }
              if (data.iqMatchPoints != null) {
                setIqMatchPoints(data.iqMatchPoints);
                localStorage.setItem("khamin_iq_match_points", data.iqMatchPoints.toString());
              }
              if (data.dotsRewardLevel != null) {
                setDotsRewardLevel(data.dotsRewardLevel);
                localStorage.setItem("khamin_dots_reward_level", data.dotsRewardLevel.toString());
              }
              if (data.dotsMatchPoints != null) {
                setDotsMatchPoints(data.dotsMatchPoints);
                localStorage.setItem("khamin_dots_match_points", data.dotsMatchPoints.toString());
              }
              if (data.speedCupsRewardLevel != null) {
                setSpeedCupsRewardLevel(data.speedCupsRewardLevel);
                localStorage.setItem("khamin_speed_cups_reward_level", data.speedCupsRewardLevel.toString());
              }
              if (data.speedCupsMatchPoints != null) {
                setSpeedCupsMatchPoints(data.speedCupsMatchPoints);
                localStorage.setItem("khamin_speed_cups_match_points", data.speedCupsMatchPoints.toString());
              }
      if (data.handRewardLevel != null) {
        setHandRewardLevel(data.handRewardLevel);
        localStorage.setItem("khamin_hand_reward_level", data.handRewardLevel.toString());
      }
      if (data.handMatchPoints != null) {
        setHandMatchPoints(data.handMatchPoints);
        localStorage.setItem("khamin_hand_match_points", data.handMatchPoints.toString());
      }
      if (data.wordleRewardLevel != null) {
        setWordleRewardLevel(data.wordleRewardLevel);
        localStorage.setItem("khamin_wordle_reward_level", data.wordleRewardLevel.toString());
      }
      if (data.wordleMatchPoints != null) {
        setWordleMatchPoints(data.wordleMatchPoints);
        localStorage.setItem("khamin_wordle_match_points", data.wordleMatchPoints.toString());
      }
if (data.connectFourWordsRewardLevel != null) {
        setConnectFourWordsRewardLevel(data.connectFourWordsRewardLevel);
        localStorage.setItem("khamin_cfw_reward_level", data.connectFourWordsRewardLevel.toString());
      }
      if (data.connectFourWordsMatchPoints != null) {
        setConnectFourWordsMatchPoints(data.connectFourWordsMatchPoints);
        localStorage.setItem("khamin_cfw_match_points", data.connectFourWordsMatchPoints.toString());
      }
      if (data.spaceWarRewardLevel != null) {
        setSpaceWarRewardLevel(data.spaceWarRewardLevel);
        localStorage.setItem("khamin_space_war_reward_level", data.spaceWarRewardLevel.toString());
      }
      if (data.spaceWarMatchPoints != null) {
        setSpaceWarMatchPoints(data.spaceWarMatchPoints);
        localStorage.setItem("khamin_space_war_match_points", data.spaceWarMatchPoints.toString());
      }
      if (data.puzzleRewardLevel != null) {
        setPuzzleRewardLevel(data.puzzleRewardLevel);
        localStorage.setItem("khamin_puzzle_reward_level", data.puzzleRewardLevel.toString());
      }
      if (data.puzzleMatchPoints != null) {
        setPuzzleMatchPoints(data.puzzleMatchPoints);
        localStorage.setItem("khamin_puzzle_match_points", data.puzzleMatchPoints.toString());
      }
      if (data.beachRaceRewardLevel != null) {
        setBeachRaceRewardLevel(data.beachRaceRewardLevel);
        localStorage.setItem("khamin_beach_race_reward_level", data.beachRaceRewardLevel.toString());
      }
      if (data.beachRaceMatchPoints != null) {
        setBeachRaceMatchPoints(data.beachRaceMatchPoints);
        localStorage.setItem("khamin_beach_race_match_points", data.beachRaceMatchPoints.toString());
      }
      if (data.likes != null) {
        setLikes(data.likes);
        localStorage.setItem("khamin_likes", data.likes.toString());
      }
      if (data.proPackageExpiry !== undefined) {
        setProPackageExpiry(data.proPackageExpiry);
        localStorage.setItem(
          "khamin_pro_package_expiry",
          data.proPackageExpiry.toString(),
        );
      }
      if (data.unlockedHelpersExpiry !== undefined) {
        setUnlockedHelpersExpiry(data.unlockedHelpersExpiry);
        localStorage.setItem(
          "khamin_unlocked_helpers_expiry",
          data.unlockedHelpersExpiry.toString(),
        );
      }
      if (data.name !== undefined) {
        setPlayerName(data.name);
        localStorage.setItem("khamin_player_name", data.name);
      }
      if (data.isHighestLikes !== undefined) {
        setIsHighestLikes(data.isHighestLikes);
      }
      if (data.tempItems) {
        setTempItems(data.tempItems);
      }
      if (data.lastRenameAt !== undefined) {
        setLastRenameAt(data.lastRenameAt);
        localStorage.setItem(
          "khamin_last_rename_at",
          data.lastRenameAt.toString(),
        );
      }
      if (data.banUntil !== undefined) setBanUntil(data.banUntil);
      if (data.isPermanentBan !== undefined)
        setIsPermanentBan(data.isPermanentBan);
      if (data.ownedHelpers !== undefined) {
        setOwnedHelpers(data.ownedHelpers);
        localStorage.setItem(
          "khamin_owned_helpers",
          JSON.stringify(data.ownedHelpers),
        );
      }
      if (data.dailyQuestStreak !== undefined) {
        setDailyQuestStreak(data.dailyQuestStreak);
        localStorage.setItem(
          "khamin_daily_streak",
          data.dailyQuestStreak.toString(),
        );
      }
      if (data.lastDailyClaim !== undefined) {
        setLastDailyClaim(data.lastDailyClaim);
        localStorage.setItem(
          "khamin_last_daily_claim",
          data.lastDailyClaim.toString(),
        );
      }
      if (data.recentOpponents !== undefined) {
        setRecentOpponents(data.recentOpponents);
      }
    });

    newSocket.on("daily_quest_success", (data: any) => {
      setPendingDailyReward(data);
    });

    newSocket.on("daily_quest_error", (msg: string) => {
      setError(msg);
      setIsChestOpening(false);
    });

    newSocket.on("top_3_update", (top3: any[]) => {
      if (Array.isArray(top3)) {
        setTopPlayers((prev) => {
          if (prev.length > 3) {
            const updated = [...prev];
            for (let i = 0; i < top3.length; i++) {
              updated[i] = top3[i];
            }
            return updated;
          }
          return top3;
        });
      }
    });

    newSocket.on("top_players_update", (players: any[]) => {
      setTopPlayers(sortPlayers(players));
      localStorage.setItem("khamin_top_players", JSON.stringify(players));
    });

    newSocket.on("opponent_muted_you", (isMuted: boolean) => {
      setIsMutedByOpponent(isMuted);
    });

    newSocket.on("helper_used", ({ playerId, helperId }) => {
      const player = roomRef.current?.players.find(
        (p: any) => p.id === playerId,
      );
      if (player) {
        const helper = HELPER_ITEMS.find((h) => h.id === helperId);
        setError(
          `استخدم ${player.name} مساعدة: ${helper?.name || helperId} 🎁`,
        );
        setTimeout(() => setError(""), 3000);
      }
    });

    newSocket.on("helper_effect", ({ helperId, data }) => {
      if (data.message) {
        showAlert(data.message, "مساعدة المهام");
      }

      if (helperId === "reveal_letter" && data.letter) {
        setHint(`المساعدة: الحرف التالي هو "${data.letter}"`);
      }
    });

    newSocket.on("ad_cooldown_update", (timeLeft: number) => {
      setAdCooldownTimer(timeLeft);
    });

    const handleHandBell = () => {
      playSound("deskBell");
    };
    const handleHandWrong = () => {
      playSound("wrong");
      setShakeBell(true);
      setTimeout(() => setShakeBell(false), 500);
    };

    newSocket.on("hand_bell_rung", handleHandBell);
    newSocket.on("hand_wrong_guess", handleHandWrong);

    GameEngineService.on("hand_bell_rung", handleHandBell);
    GameEngineService.on("hand_wrong_guess", handleHandWrong);

    newSocket.on("room_update", (updatedRoom: Room) => {
      if ((updatedRoom as any)?.iqPreloadImages && Array.isArray((updatedRoom as any).iqPreloadImages)) {
        preloadIQImages((updatedRoom as any).iqPreloadImages);
      }

      if (spectatingRoomIdRef.current === updatedRoom.id) {
        setSpectatorRoomData(updatedRoom);
        return;
      }

      if (updatedRoom.gameState !== roomRef.current?.gameState) {
        setChatHistory([]);
        setChatInput("");
        setIsWaitingForJudgment(false); // Reset on room update

        // Reset custom upload states
        if (updatedRoom.gameState !== "custom_image_upload") {
          setIsCustomSubmitted(false);
          setCustomImageBase64("");
          setCustomImageAnswer("");
        }

        if (
          updatedRoom.gameState === "bus_complete_setup" ||
          updatedRoom.gameState === "waiting"
        ) {
          setBusAnswers({
            boy: "",
            girl: "",
            animal: "",
            plant: "",
            inanimate: "",
            country: "",
          });
        }

        if (
          updatedRoom.gameState === "finished" ||
          updatedRoom.gameState === "waiting"
        ) {
          const currentSerial = localStorage.getItem("khamin_player_serial");
          const currentFingerprint = localStorage.getItem("khamin_fingerprint");
          if (currentSerial && currentFingerprint) {
            newSocket.emit("get_player_data", {
              serial: currentSerial,
              fingerprint: currentFingerprint,
              secretToken: localStorage.getItem("khamin_secret_token"),
            });
          }
        }
      }

      if (updatedRoom.adCooldownTimer !== undefined) {
        setAdCooldownTimer(updatedRoom.adCooldownTimer);
      }

      if (
        roomRef.current?.players.length === 1 &&
        updatedRoom.players.length === 2
      ) {
        const newPlayer = updatedRoom.players.find(
          (p) => p.id !== newSocket.id,
        );
        if (newPlayer) {
          setError(`انضم اللاعب ${newPlayer.name} إلى الغرفة! 🎮`);
          setTimeout(() => setError(""), 3000);
        }
      }

      if (
        roomRef.current?.players.length === 2 &&
        updatedRoom.players.length === 1
      ) {
        const opp = roomRef.current.players.find((p) => p.id !== newSocket.id);
        const verb = opp?.gender === "girl" ? "غادرت" : "غادر";
        setError(`${verb} المنافس${opp?.gender === "girl" ? "ة" : ""} الغرفة!`);
        setTimeout(() => setError(""), 3000);
      }

      if (
        updatedRoom.gameState === "hand_playing" &&
        roomRef.current?.gameState === "hand_playing" &&
        updatedRoom.handGrid &&
        roomRef.current?.handGrid
      ) {
        const currentFilledCount = roomRef.current.handGrid.filter((c: any) => c !== null).length;
        const incomingFilledCount = updatedRoom.handGrid.filter((c: any) => c !== null).length;
        if (incomingFilledCount < currentFilledCount) {
          updatedRoom.handGrid = roomRef.current.handGrid;
        }
      }

      setRoom(updatedRoom);
      setJoined(true);

      // Sync my data from server
      const me = updatedRoom.players.find((p) => p.id === newSocket.id);
      if (me && me.ownedHelpers) {
        setOwnedHelpers(me.ownedHelpers);
        localStorage.setItem(
          "khamin_owned_helpers",
          JSON.stringify(me.ownedHelpers),
        );
      }
    });

    newSocket.on("policies_update", (policies: any) => {
      setGamePolicies(policies);
    });

    newSocket.on(
      "avatar_review_result",
      ({ success, message, status, avatar: newAvatar }) => {
        if (success) {
          setAvatarStatus(status);
          if (status === "approved") {
            // If approved, we can now use the custom avatar
            if (newAvatar) {
              setAvatar(newAvatar);
              setCustomAvatar(newAvatar);
              localStorage.setItem("khamin_player_avatar", newAvatar);
              localStorage.setItem("khamin_custom_avatar", newAvatar);
            }
          } else if (status === "rejected") {
            // If rejected, revert to what the server says is our current avatar
            if (newAvatar) {
              setAvatar(newAvatar);
              localStorage.setItem("khamin_player_avatar", newAvatar);
              if (newAvatar.startsWith("data:image/")) {
                setCustomAvatar(newAvatar);
                localStorage.setItem("khamin_custom_avatar", newAvatar);
              } else {
                setCustomAvatar(null);
                localStorage.removeItem("khamin_custom_avatar");
              }
            }
          }
          showAlert(message, "مراجعة الصورة");
        } else {
          showAlert(message, "خطأ");
        }
      },
    );

    newSocket.on("timer_update", (timer: number) => {
      setRoom((prev) => (prev ? { ...prev, timer } : null));
    });
    newSocket.on("iq_timer_update", (timer: number) => {
      setRoom((prev) => (prev ? { ...prev, iqTurnTimer: timer } : null));
    });
    newSocket.on("dots_timer_update", (timer: number) => {
      setRoom((prev) => (prev ? { ...prev, dotsTurnTimer: timer } : null));
    });
    newSocket.on("speed_cups_timer_update", (timer: number) => {
      setRoom((prev) => (prev ? { ...prev, speedCupsTimer: timer } : null));
    });

    newSocket.on("player_disconnected_waiting", ({ name }) => {
      setReconnectWaitingMessage("انقطع اتصال المنافس، انتظر قليلاً!");
    });

    newSocket.on("player_reconnected", ({ name }) => {
      setReconnectWaitingMessage(null);
    });

    newSocket.on("chat_bubble", async ({ senderId, text }) => {
      if (senderId !== newSocket.id && isOpponentBlockedRef.current) return;

      // Re-enable quick response buttons if message is from opponent
      if (senderId !== newSocket.id && senderId !== "system") {
        setIsOpponentTyping(false);
        setIsQuickResponseDisabled(false);
        setClickedResponses([]);
        if (quickResponseTimeoutRef.current) {
          clearTimeout(quickResponseTimeoutRef.current);
          quickResponseTimeoutRef.current = null;
        }

        // Quick Chat Reels Logic
        if (text === "آه" || text === "لأ") {
          if (reelTimeoutRef.current) clearTimeout(reelTimeoutRef.current);
          setIsReelsSpinning(true);
          setSpinningReels([true, true, true, true]);
          setTimeout(() => setSpinningReels([false, true, true, true]), 400);
          setTimeout(() => setSpinningReels([false, false, true, true]), 500);
          setTimeout(() => setSpinningReels([false, false, false, true]), 600);
          reelTimeoutRef.current = setTimeout(() => {
            setSpinningReels([false, false, false, false]);
            setIsReelsSpinning(false);
            reelTimeoutRef.current = null;
            if (text === "آه" && askedQuickChatNodeRef.current) {
              const nodeText = askedQuickChatNodeRef.current.text;
              setConfirmedAttributes((prev) =>
                prev.includes(nodeText) ? prev : [...prev, nodeText],
              );

              const children = askedQuickChatNodeRef.current.children;
              if (children && children.length > 0) {
                // If 'Yes' and has children, we enter its branch
                setCurrentQuickChatNodes(children);
                setQuickChatOffset(0);
              } else {
                // If 'Yes' but no children (flat structure), just remove this question
                const nodeToFilter = askedQuickChatNodeRef.current;
                setCurrentQuickChatNodes((prev) => {
                  const filtered = prev.filter(
                    (n) =>
                      n.id !== nodeToFilter.id && n.text !== nodeToFilter.text,
                  );
                  // If only one option remains, it's inferred as 'Yes'
                  if (filtered.length === 1) {
                    const inferredNode = filtered[0];
                    setConfirmedAttributes((prevAttrs) =>
                      prevAttrs.includes(inferredNode.text)
                        ? prevAttrs
                        : [...prevAttrs, inferredNode.text],
                    );
                    return inferredNode.children &&
                      inferredNode.children.length > 0
                      ? inferredNode.children
                      : [];
                  }
                  return filtered;
                });
              }
            } else if (text === "لأ" && askedQuickChatNodeRef.current) {
              // Answer is 'No', remove this branch/question from current options
              const nodeToFilter = askedQuickChatNodeRef.current;
              const currentCategory = roomRef.current?.category || "";
              const categoryObj = categories.find(
                (c) => c.id === currentCategory,
              );
              const categoryName = categoryObj
                ? categoryObj.name
                : currentCategory;
              const normalizedCategory = normalizeEgyptian(
                categoryName + currentCategory,
              );
              const isPeople = normalizedCategory.includes("اشخاص");
              const isAnimals = normalizedCategory.includes("حيوانات");
              const isFood = normalizedCategory.includes("اكلات");

              const nodeText = normalizeEgyptian(nodeToFilter.text);
              const isGenderNode =
                isPeople &&
                (nodeText.includes("رجل") || nodeText.includes("ست"));
              const isAnimalTypeNode =
                isAnimals &&
                (nodeText.includes("بري") || nodeText.includes("بحري"));
              const isFoodTypeNode =
                isFood &&
                (nodeText.includes("حلو") || nodeText.includes("حادق"));

              if (isGenderNode || isAnimalTypeNode || isFoodTypeNode) {
                setCurrentQuickChatNodes((prev) => {
                  let otherText = "";
                  if (isGenderNode) {
                    otherText = nodeText.includes("رجل") ? "ست" : "رجل";
                  } else if (isAnimalTypeNode) {
                    otherText = nodeText.includes("بري") ? "بحري" : "بري";
                  } else if (isFoodTypeNode) {
                    otherText = nodeText.includes("حلو") ? "حادق" : "حلو";
                  }

                  const otherNode = prev.find((n) =>
                    normalizeEgyptian(n.text).includes(otherText),
                  );

                  if (otherNode) {
                    // Automatic inference
                    setConfirmedAttributes((prevAttrs) =>
                      prevAttrs.includes(otherNode.text)
                        ? prevAttrs
                        : [...prevAttrs, otherNode.text],
                    );
                    return otherNode.children && otherNode.children.length > 0
                      ? otherNode.children
                      : [];
                  }

                  // Fallback to default filtering
                  const filtered = prev.filter(
                    (n) =>
                      n.id !== nodeToFilter.id && n.text !== nodeToFilter.text,
                  );
                  if (filtered.length === 1) {
                    const inferredNode = filtered[0];
                    setConfirmedAttributes((prevAttrs) =>
                      prevAttrs.includes(inferredNode.text)
                        ? prevAttrs
                        : [...prevAttrs, inferredNode.text],
                    );
                    return inferredNode.children &&
                      inferredNode.children.length > 0
                      ? inferredNode.children
                      : [];
                  }
                  return filtered;
                });
              } else {
                setCurrentQuickChatNodes((prev) => {
                  const filtered = prev.filter(
                    (n) =>
                      n.id !== nodeToFilter.id && n.text !== nodeToFilter.text,
                  );

                  // If only one option remains, it's inferred as 'Yes'
                  if (filtered.length === 1) {
                    const inferredNode = filtered[0];
                    setConfirmedAttributes((prevAttrs) =>
                      prevAttrs.includes(inferredNode.text)
                        ? prevAttrs
                        : [...prevAttrs, inferredNode.text],
                    );

                    // Auto-advance to its children (even if empty, to clear siblings)
                    return inferredNode.children &&
                      inferredNode.children.length > 0
                      ? inferredNode.children
                      : [];
                  }
                  return filtered;
                });
              }
            }
            askedQuickChatNodeRef.current = null;
          }, 700); // Spin duration
        }
      }

      // Update spectator data if spectating
      if (spectatingRoomIdRef.current) {
        setSpectatorRoomData((prev) => {
          if (!prev) return null;
          const sender = prev.players.find((p: any) => p.id === senderId);
          const newMsg = {
            senderId,
            senderName:
              sender?.name || (senderId === "system" ? "النظام" : "منافس"),
            text,
            timestamp: Date.now(),
          };
          return {
            ...prev,
            chatHistory: [...(prev.chatHistory || []), newMsg].slice(-50),
          };
        });
      }

      const sender = roomRef.current?.players.find(
        (p: any) => p.id === senderId,
      );
      const msgId = Math.random().toString(36).substr(2, 9);

      // Play message sound for incoming messages
      if (senderId !== newSocket.id) {
        playSound("message");
      }

      setChatHistory((prev) => {
        if (prev.some((m) => m.id === msgId)) return prev;
        return [
          ...prev,
          {
            id: msgId,
            senderId,
            text,
            playerName:
              sender?.name ||
              (senderId === "system"
                ? "النظام"
                : senderId === newSocket.id
                  ? playerNameRef.current
                  : "منافس"),
            avatar: sender?.avatar || "👤",
          },
        ];
      });
    });

    newSocket.on("opponent_typing", () => {
      setIsOpponentTyping(true);
    });

    newSocket.on("opponent_stop_typing", () => {
      setIsOpponentTyping(false);
    });

    newSocket.on("guess_result", ({ playerId, correct }) => {
      if (playerId === newSocket.id) {
        setIsWaitingForJudgment(false);
      }
      if (!correct) {
        playSound("hammer");
        setShowHammer(playerId);
        setFunnyFilter(playerId);
        setTimeout(() => {
          setShowHammer(null);
          setFunnyFilter(null);
        }, 2000);
      } else {
        playSound("correctAnswer");
      }
    });

    newSocket.on("judgment_requested", ({ guess, type, playerId }) => {
      playSound("doorBell"); // nice sound to alert
      setJudgmentRequest({ guess, type, playerId });
    });

    newSocket.on("game_finished", ({ room, winnerId, updates }) => {
      if (isIntentionalLeaveRef.current) return;
      setReconnectWaitingMessage(null);
      setRoom(room);
      setCooldowns({});
      setReadyPowerUps([]);
      setActivePowerUp(null);
      setShowAdConfirmation(false);
      setHasWatchedCategoryAd(false);
      setIsWaitingForJudgment(false);
      setJudgmentRequest(null);

      // Mark free quick guess as used after the first match finishes
      if (!hasUsedFreeQuickGuess) {
        updateHasUsedFreeQuickGuess(true);
      }

      const isWinner = winnerId === newSocket.id;
      if (isWinner) {
        playSound("win");
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 10001,
        });
      } else {
        playSound("lose");
      }

      if (updates && updates[newSocket.id]) {
        // UI uses room.lastUpdates for the game finished screen
        // do not update React state logic here since player_data_update sends absolute values.
      }

      // Auto-refresh collection data in background when game finishes
      const currentSerial = localStorage.getItem("khamin_player_serial");
      if (currentSerial) {
        setTimeout(() => fetchCollection(currentSerial), 1500); // slight delay to ensure DB is written
      }
    });

    newSocket.on("emote_received", ({ senderId, emote }) => {
      if (senderId !== newSocket.id && isOpponentBlockedRef.current) return;
      const id = Math.random().toString(36).substr(2, 9);

      // Add to bubbles
      setBubbles((prev) => {
        if (prev.some((b) => b.id === id)) return prev;
        return [...prev, { id, senderId, text: emote }];
      });
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
      }, 4000);

      // Add to chat history
      const sender = roomRef.current?.players.find(
        (p: any) => p.id === senderId,
      );
      setChatHistory((prev) => [
        ...prev,
        {
          id,
          senderId,
          text: emote,
          playerName:
            sender?.name ||
            (senderId === newSocket.id ? playerNameRef.current : "منافس"),
          avatar: sender?.avatar || "👤",
        },
      ]);
    });

    newSocket.on("match_intro_triggered", () => {
      setShowMatchIntro(true);
    });

    newSocket.on("waiting_for_match", () => {
      setIsPrivate(false);
      setIsSearching(true);
      setJoined(true);
      setProposedMatch(null);
      setSearchTimeLeft(120);
    });

    newSocket.on("match_proposed", (data) => {
      setProposedMatch(data);
      setHasResponded(false);
      setOpponentAccepted(data.opponentAccepted || false);
      setMatchResponseTimeLeft(10);
    });

    newSocket.on("opponent_accepted", () => {
      setOpponentAccepted(true);
    });

    newSocket.on("match_rejected", ({ reason }: { reason?: string } = {}) => {
      setProposedMatch((prev) => {
        if (prev && isSearchingRef.current) {
          let message = "تم إلغاء التحدي";
          if (reason === "rejected")
            message = `المنافس ${prev.opponent.gender === "girl" ? "رفضت" : "رفض"} التحدي ❌`;
          if (reason === "timeout") message = "انتهى وقت قبول التحدي ⏰";
          if (reason === "blocked")
            message = `المنافس ${prev.opponent.gender === "girl" ? "قامت" : "قام"} بحظرك 🚫`;
          if (reason === "opponent_left")
            message = `المنافس ${prev.opponent.gender === "girl" ? "غادرت" : "غادر"} البحث 🏃`;
          if (reason === "opponent_disconnected")
            message = `انقطع اتصال المنافس ${prev.opponent.gender === "girl" ? "ة" : ""} 🔌`;

          if (reason !== "you_rejected") {
            setError(message);
            setTimeout(() => setError(""), 3000);
          }
        }
        return null;
      });
      setHasResponded(false);
      setOpponentAccepted(false);
      setMatchResponseTimeLeft(null);
    });

    newSocket.on("random_match_found", ({ roomId }) => {
      setRoomId(roomId);
      setIsPrivate(false);
      setIsSearching(false);
      setJoined(true);
      setProposedMatch(null);
      setHasResponded(false);
      setOpponentAccepted(false);
      setMatchResponseTimeLeft(null);
      setSearchTimeLeft(null);
    });

    newSocket.on(
      "bus_complete_letter_change_requested",
      ({ opponentName }) => {
        showConfirm(
          `${opponentName} يريد تغيير الحرف`,
          () => {
            newSocket.emit("accept_change_bus_complete_letter", {
              roomId: roomRef.current?.id,
            });
          },
          "طلب تغيير الحرف",
          () => {
            newSocket.emit("reject_change_bus_complete_letter", {
              roomId: roomRef.current?.id,
            });
          },
          "موافقة",
          "رفض",
        );
      },
    );

    newSocket.on(
      "bus_complete_letter_change_rejected",
      ({ opponentName }) => {
        showAlert(`تم رفض تغيير الحرف من قبل ${opponentName}`, "مرفوض");
      },
    );

    newSocket.on("game_started", () => {
      setChatHistory([]);
      setCooldowns({});
      setReadyPowerUps([]);
      setActivePowerUp(null);
      setShowAdConfirmation(false);
    });

    newSocket.on("quick_guess_started", ({ playerId }) => {
      playSound("countdown");
    });

    newSocket.on("quick_guess_timer_update", (timer: number) => {
      setRoom((prev) => (prev ? { ...prev, quickGuessTimer: timer } : null));
    });

    newSocket.on("quick_guess_timeout", () => {
      setGuess("");
    });

    newSocket.on("hint_received", ({ hint }) => {
      setHint(hint);
      setTimeout(() => setHint(null), 10000);
    });

    newSocket.on("word_length_result", ({ length }) => {
      setHint(`الكلمة تتكون من ${length} حروف`);
      setTimeout(() => setHint(null), 5000);
    });

    newSocket.on("word_count_result", ({ count }) => {
      let wordText = "كلمة واحدة";
      if (count === 2) wordText = "كلمتين";
      else if (count >= 3 && count <= 10) wordText = `${count} كلمات`;
      else if (count > 10) wordText = `${count} كلمة`;

      setHint(`الإجابة تتكون من ${wordText}`);
      setTimeout(() => setHint(null), 5000);
    });

    newSocket.on("freeze_started", ({ playerId }) => {
      playSound("countdown");
    });

    newSocket.on("freeze_timer_update", (timer) => {
      setRoom((prev) => {
        if (
          !prev ||
          (prev.gameState !== "discussion" && prev.gameState !== "guessing")
        ) {
          return prev;
        }
        return { ...prev, freezeTimer: timer, isFrozen: true };
      });
    });

    newSocket.on("freeze_ended", () => {
      setRoom((prev) =>
        prev ? { ...prev, isFrozen: false, freezeTimer: 0 } : null,
      );
    });

    newSocket.on("judgment_timer_update", (timer) => {
      setRoom((prev) => (prev ? { ...prev, judgmentTimer: timer } : null));
    });

    newSocket.on("spy_lens_active", ({ image }) => {
      setSpyLensImage(image);
      setTimeout(() => setSpyLensImage(null), 5000);
    });

    newSocket.on("game_stopped", ({ reason }) => {
      setReconnectWaitingMessage(null);
      setError(reason);
      setTimeout(() => setError(""), 5000);
      setJoined(false);
      setRoom(null);
      setRoomId("");
      setShowMatchIntro(false);
      setIsSearching(false);
      setProposedMatch(null);
      setChatHistory([]);
      setChatInput("");
    });

    newSocket.on("opponent_left_lobby", () => {
      setRoom((prevRoom) => {
        const opp = prevRoom?.players.find(
          (p: any) => p.serial !== playerSerial,
        );
        const verb = opp?.gender === "girl" ? "غادرت" : "غادر";
        setError(`${verb} المنافس${opp?.gender === "girl" ? "ة" : ""} الغرفة`);
        return prevRoom;
      });
      setTimeout(() => setError(""), 5000);
      setJoined(false);
      setRoom(null);
      setRoomId("");
      setShowMatchIntro(false);
      setIsSearching(false);
      setProposedMatch(null);
      setChatHistory([]);
      setChatInput("");
    });

    newSocket.on("error", (msg) => {
      setError(msg);
      setIsJoiningRoom(false);
    });

    newSocket.on("auth_error", () => {
      clearPlayerData();
      setPendingWelcomeModal(true);
      setError("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
    });

    newSocket.on("account_deleted_by_admin", () => {
      clearPlayerData();
      window.location.reload();
    });

    newSocket.on("banned_status", ({ banUntil, isPermanent }) => {
      if (isPermanent) {
        setIsPermanentBan(true);
      } else {
        setBanUntil(banUntil);
      }
      setIsSearching(false);
      setJoined(false);
      setIsPrivate(false);
      newSocket.disconnect();
    });

    newSocket.on("update_reported_serials", (serials: string[]) => {
      setReportedSerials(serials);
    });

    newSocket.on("city_search_update", (state) => {
      setCitySearchState(state);
      setIsCitySearchLoaded(true);
    });

    newSocket.on("rewards_claimed", (rewards) => {
      playSound("win");
      showAlert("تم استلام المكافآت بنجاح! 🥳", "نجاح");
      setShowCitySearch(false);
      setCitySearchState(null);

      // Update state immediately for instant feedback
      if (rewards.xp) {
        setXp((prev) => {
          const newVal = prev + rewards.xp;
          localStorage.setItem("khamin_xp", newVal.toString());
          return newVal;
        });
      }
      if (rewards.tokens) {
        setتخمينات((prev) => {
          const newVal = prev + rewards.tokens;
          localStorage.setItem("khamin_tokens", newVal.toString());
          return newVal;
        });
      }
      if (rewards.keys) {
        setKeys((prev) => {
          const newVal = prev + rewards.keys;
          localStorage.setItem("khamin_keys", newVal.toString());
          return newVal;
        });
      }

      if (rewards.pro_package_days) {
        const currentExpiry = proPackageExpiry || Date.now();
        const base = currentExpiry < Date.now() ? Date.now() : currentExpiry;
        const newExpiry = base + rewards.pro_package_days * 24 * 60 * 60 * 1000;
        setProPackageExpiry(newExpiry);
        localStorage.setItem("khamin_pro_package_expiry", newExpiry.toString());
      }

      setOwnedHelpers((prev) => {
        const next = { ...prev };
        if (rewards.time_freeze)
          next.time_freeze = (next.time_freeze || 0) + rewards.time_freeze;
        if (rewards.word_count)
          next.word_count = (next.word_count || 0) + rewards.word_count;
        if (rewards.word_length)
          next.word_length = (next.word_length || 0) + rewards.word_length;
        if (rewards.hint) next.hint = (next.hint || 0) + rewards.hint;
        if (rewards.spy_lens)
          next.spy_lens = (next.spy_lens || 0) + rewards.spy_lens;
        localStorage.setItem("khamin_owned_helpers", JSON.stringify(next));
        return next;
      });

      newSocket.emit("get_player_data", {
        serial: localStorage.getItem("khamin_player_serial"),
        fingerprint: localStorage.getItem("khamin_fingerprint"),
        secretToken: localStorage.getItem("khamin_secret_token"),
      });
    });

    // Friend System Event Listeners
    newSocket.on("new_admin_message", () => {
      playSound("notification");
      const currentSerial = localStorage.getItem("khamin_player_serial");
      if (currentSerial) {
        newSocket.emit(
          "get_admin_messages",
          { serial: currentSerial },
          (res: any) => {
            if (res.messages) setSystemMessages(res.messages);
          },
        );
      }
    });

    newSocket.on("new_collection_notification", () => {
      playSound("notification");
      const currentSerial = localStorage.getItem("khamin_player_serial");
      if (currentSerial) {
        newSocket.emit(
          "get_collection_notifications",
          { serial: currentSerial },
          (res: any) => {
            if (res.notifications)
              setCollectionNotifications(res.notifications);
          },
        );
        fetchCollection(currentSerial);
      }
    });

    newSocket.on(
      "friend_request_received",
      ({ senderSerial }: { senderSerial?: string } = {}) => {
        playSound("notification");
        const currentSerial = localStorage.getItem("khamin_player_serial");
        if (currentSerial) {
          newSocket.emit(
            "get_friend_requests",
            { serial: currentSerial },
            (res: any) => {
              if (res.success) setFriendRequests(res.requests);
            },
          );
        }
        // Update in-game button status if the sender is our current opponent
        if (senderSerial && senderSerial === currentOpponentSerialRef.current) {
          setOpponentFriendStatus("pending_received");
        }
      },
    );

    newSocket.on(
      "friend_request_accepted",
      ({
        targetSerial,
        senderName,
      }: { targetSerial?: string; senderName?: string } = {}) => {
        showAlert(
          `${senderName || "صديق جديد"} وافق علي طلب الصداقة! 🤝`,
          "نجاح",
        );
        const currentSerial = localStorage.getItem("khamin_player_serial");
        if (currentSerial) {
          // Refresh friends list/total immediately
          newSocket.emit(
            "get_friends",
            { serial: currentSerial },
            (res: any) => {
              if (res.success) {
                setFriendsList(res.friends);
                setFriendsTotal(res.total);
              }
            },
          );

          newSocket.emit(
            "get_friend_accepted_notifications",
            { serial: currentSerial },
            (res: any) => {
              if (res.notifications)
                setFriendAcceptedNotifications(res.notifications);
            },
          );

          const fingerprint = localStorage.getItem("khamin_fingerprint");
          newSocket.emit("get_player_data", {
            serial: currentSerial,
            fingerprint,
            secretToken: localStorage.getItem("khamin_secret_token"),
          });
        }
        // Update in-game button status to 'friends' if the person who accepted is our current opponent
        if (targetSerial && targetSerial === currentOpponentSerialRef.current) {
          setOpponentFriendStatus("friends");
        }
      },
    );

    newSocket.on(
      "friend_removed",
      ({ targetSerial }: { targetSerial?: string } = {}) => {
        const currentSerial = localStorage.getItem("khamin_player_serial");
        if (currentSerial) {
          newSocket.emit(
            "get_friends",
            { serial: currentSerial },
            (res: any) => {
              if (res.success) {
                setFriendsList(res.friends);
                setFriendsTotal(res.total);
              }
            },
          );
        }
        // Revert in-game button status if the removed person is our current opponent
        if (targetSerial && targetSerial === currentOpponentSerialRef.current) {
          setOpponentFriendStatus("none");
        }
      },
    );

    newSocket.on("friend_challenge_received", (data) => {
      setIncomingChallenge(data);
      playSound("countdown");
    });

    newSocket.on("friend_challenge_cancelled", () => {
      setIncomingChallenge(null);
    });

    newSocket.on("friend_challenge_rejected", ({ reason }: any = {}) => {
      if (reason === "later") {
        showAlert("اللاعب مشغول حالياً، يرجى المحاولة بعد قليل.", "ليس الآن");
      } else {
        showAlert("اللاعب غير مستعد حالياً أو رفض التحدي.", "تنبيه");
      }
      setIsSearching(false);
      setRoomId("");
    });

    newSocket.on("friend_challenge_accepted", ({ roomId }) => {
      setRoomId(roomId);
      setIsPrivate(false);
      setIsSearching(false);
      setJoined(true);
      setIncomingChallenge(null);
      setShowFriendsModal(false);
    });

    return newSocket;
  }, []);

  // Removed the automatic page reload useEffect that was causing infinite reload loops

  const loadingStarted = useRef(false);
  useEffect(() => {
    if (loadingStarted.current) return;
    loadingStarted.current = true;

    // Real update check and loading process
    const startLoading = async () => {
      try {
        setLoadingStatus("جاري التحميل أنتظر...");
        setLoadingProgress(10);

        // Fetch config from server (reusing refreshConfig from AvatarContext)
        const config = await refreshConfig();
        if (!config) throw new Error("Failed to fetch config");

        // Try to subscribe to push notifications
        // We do it after a short delay to not block loading
        setTimeout(() => subscribeToPush(), 5000);

        const serverVersion = config.version || "1.1.1";
        setGameVersion(serverVersion);
        setLoadingProgress(50);

        // Check maintenance mode using config.maintenance instead of making a separate request
        try {
          const params = new URLSearchParams(window.location.search);
          const isAdminInUrl = params.get("isAdmin") === "true";

          if (config.maintenance) {
            if (!isAdmin && !isAdminInUrl) {
              setIsMaintenanceMode(true);
              setIsAppLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to check maintenance mode from config:", err);
        }

        // Check if we need to force update (reload)
        const localVersion = localStorage.getItem("khamin_game_version");

        console.log("[DEBUG] Version Check:", { localVersion, serverVersion });

        // Force a hard refresh if:
        // 1. Version mismatch (always reload to get new version)
        if (localVersion && localVersion !== serverVersion) {
          console.log(
            "[DEBUG] Needs refresh. Version mismatch:",
            localVersion !== serverVersion,
          );
          setLoadingStatus("جاري تهيئة الملفات وضمان أحدث نسخة...");
          setLoadingProgress(100);
          localStorage.setItem("khamin_game_version", serverVersion);

          // Update all service workers instead of unregistering to preserve push notifications subscription!
          if ("serviceWorker" in navigator) {
            try {
              const registrations =
                await navigator.serviceWorker.getRegistrations();
              for (let registration of registrations) {
                console.log("[DEBUG] Updating SW:", registration.scope);
                await registration.update();
              }
            } catch (err) {
              console.error("Error updating service worker:", err);
            }
          }

          // Clear all caches
          if ("caches" in window) {
            try {
              const keys = await caches.keys();
              console.log("[DEBUG] Clearing caches:", keys);
              await Promise.all(keys.map((key) => caches.delete(key)));
            } catch (err) {
              console.error("Error clearing caches:", err);
            }
          }

          // Add cache busting query parameter to force browser to fetch new files
          const url = new URL(window.location.href);
          url.searchParams.set("v", Date.now().toString());
          console.log("[DEBUG] Reloading to:", url.toString());
          window.location.href = url.toString();
          return;
        }
        localStorage.setItem("khamin_game_version", serverVersion);

        setLoadingProgress(100);
        setLoadingStatus("تم التحديث بنجاح!");
        // Minimal delay just to show 100% briefly
        await new Promise((r) => setTimeout(r, 200));

        // Remove the version parameter from the URL after loading is complete
        const url = new URL(window.location.href);
        if (url.searchParams.has("v")) {
          url.searchParams.delete("v");
          window.history.replaceState({}, "", url.toString());
        }

        setIsAppLoading(false);
      } catch (error) {
        console.error("Loading failed:", error);
        setLoadingStatus("فشل الاتصال بالسيرفر. يرجى التحقق من اتصالك.");
        // Fallback: let them in anyway after a short delay so they aren't stuck
        await new Promise((r) => setTimeout(r, 1000));

        // Also cleanup URL in fallback
        const url = new URL(window.location.href);
        if (url.searchParams.has("v")) {
          url.searchParams.delete("v");
          window.history.replaceState({}, "", url.toString());
        }

        setIsAppLoading(false);
      }
    };

    startLoading();
  }, []);

  useEffect(() => {
    if (isAppLoading) return;
    const newSocket = connectSocket();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const activeSocket = socketRef.current;
      if (!activeSocket) return;
      if (isIntentionalLeaveRef.current) return;
      if (
        roomRef.current &&
        (roomRef.current.gameState === "guessing" ||
          roomRef.current.gameState === "discussion")
      ) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome
        activeSocket.emit("intentional_leave", { roomId: roomRef.current.id });

        const me = roomRef.current?.players.find(
          (p: any) => p.id === activeSocket.id,
        );
        if (me?.useToken) {
          return "تحذير: إذا انسحبت الآن، ستخسر التخمينة المستخدمة! وتعتبر خاسر. هل تريد حقاً مغادرة اللعبة؟";
        }
        return "انسحابك من المبارة تعتبر خاسر. هل تريد حقاً مغادرة اللعبة؟";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    GameEngineService.setOnRoomUpdate((updatedRoom) => {
      setRoom(updatedRoom as any);
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socketRef.current?.disconnect();
    };
  }, [isAppLoading, connectSocket]);

  const lastTickTimeRef = useRef<{ [key: string]: number }>({});

  // Separate effect for countdown sound to avoid re-binding socket listeners
  useEffect(() => {
    // Remove the version and prize parameters from the URL after the match ends OR when returning to home
    if (room?.gameState === "finished" || !room) {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has("v")) {
        url.searchParams.delete("v");
        changed = true;
      }
      if (url.searchParams.has("helper")) {
        url.searchParams.delete("helper");
        changed = true;
      }
      if (url.searchParams.has("serial")) {
        url.searchParams.delete("serial");
        changed = true;
      }
      if (changed) {
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [room?.gameState, room]);

  useEffect(() => {
    if (!room) {
      stopSound("tick");
      return;
    }

    const isTickActive =
      room.gameState === "guessing" && room.timer <= 10 && room.timer > 0;

    if (isTickActive) {
      if (lastTickTimeRef.current.gameTimer !== room.timer) {
        playSound("tick", 0.3);
        lastTickTimeRef.current.gameTimer = room.timer;
      }
    } else {
      stopSound("tick");
    }

    // Speed cups countdown
    if (!room) {
      stopSound("countdownBeep");
      lastTickTimeRef.current.speedCupsCountdown = -1;
      return;
    }

    if (room.gameState === "speed_cups_countdown" && room.speedCupsTimer === 3) {
      if (lastTickTimeRef.current.speedCupsCountdown !== 3) {
        playSound("countdownBeep", 0.6);
        lastTickTimeRef.current.speedCupsCountdown = 3;
      }
    } else if (room.gameState === "speed_cups_playing") {
      if (lastTickTimeRef.current.speedCupsCountdown !== -2) {
        stopSound("countdownBeep");
        lastTickTimeRef.current.speedCupsCountdown = -2;
      }
    } else if (room.gameState !== "speed_cups_countdown") {
      stopSound("countdownBeep");
      lastTickTimeRef.current.speedCupsCountdown = -1;
    }
  }, [room?.timer, room?.speedCupsTimer, room?.gameState, playSound, stopSound]);

  // Clock ticking for bus_complete_playing last minute
  useEffect(() => {
    if (!room) return;
    const isBusCompleteHurry = room.gameState === "bus_complete_playing" && room.timer <= 60 && room.timer > 0;
    
    if (isBusCompleteHurry) {
       if (lastTickTimeRef.current.busCompleteHurryStarted !== 1) {
         playSound("clockTicking", 0.5);
         lastTickTimeRef.current.busCompleteHurryStarted = 1;
       }
    } else {
       if (lastTickTimeRef.current.busCompleteHurryStarted === 1) {
         stopSound("clockTicking");
         lastTickTimeRef.current.busCompleteHurryStarted = 0;
       }
    }
  }, [room?.timer, room?.gameState, playSound, stopSound]);

  // Quick Guess timer sound
  useEffect(() => {
    if (room?.quickGuessTimer && room.quickGuessTimer > 0) {
      if (lastTickTimeRef.current.quickGuessTimer !== room.quickGuessTimer) {
        playSound("tick", 0.3);
        lastTickTimeRef.current.quickGuessTimer = room.quickGuessTimer;
      }
    } else {
      stopSound("tick");
    }
  }, [room?.quickGuessTimer, playSound, stopSound]);

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] -= 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(""); // أو الدالة التي تستخدمها لتفريغ قيمة الخطأ مثل setError(null)
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleJoin = () => {
    playSound("clickOpen");
    if (!playerSerial) {
      setPendingWelcomeModal(true);
      return;
    }
    if (!playerName.trim() || !playerAge || playerAge < 0) {
      playSound("wrong");
      setError("يرجى إدخال اسمك وعمرك أولاً");
      return;
    }
    if (!roomId.trim()) {
      playSound("wrong");
      setError("حقل مفقود! يرجى إدخال كود الغرفة");
      return;
    }
    if (playerAge <= 12) {
      playSound("wrong");
      setError("يجب أن يكون عمرك 13 عاماً أو أكثر.");
      return;
    }
    setError("");

    localStorage.setItem("khamin_player_name", playerName);
    localStorage.setItem("khamin_player_age", playerAge.toString());
    setIsPrivate(true);
    
    setIsJoiningRoom(true);
    socket?.emit("join_room", {
      roomId,
      playerName,
      avatar,
      age: playerAge,
      gender,
      xp,
      streak,
      wins,
      serial: playerSerial,
    });
    setIsOpponentBlocked(false);
    
    setTimeout(() => setIsJoiningRoom(false), 3000);
  };

  const handleRandomMatch = () => {
    playSound("clickOpen");
    if (!playerSerial) {
      setPendingWelcomeModal(true);
      return;
    }
    if (!playerName.trim() || !playerAge || playerAge < 0) {
      playSound("wrong");
      setError("يرجى إدخال اسمك وعمرك أولاً");
      return;
    }
    if (playerAge <= 12) {
      playSound("wrong");
      setError("يجب أن يكون عمرك 13 عاماً أو أكثر.");
      return;
    }
    setError("");

    localStorage.setItem("khamin_player_name", playerName);
    localStorage.setItem("khamin_player_age", playerAge.toString());
    setIsPrivate(false);
    setIsOpponentBlocked(false);

    setIsSearching(true);
    setSearchTimeLeft(60);

    if (socket && isConnected) {
      socket.emit("find_random_match", {
        playerId,
        playerName,
        avatar,
        age: playerAge,
        gender,
        xp,
        streak,
        wins,
        serial: playerSerial,
        useToken: getLevel(xp) >= 50 && useToken,
      });
    } else {
      MatchmakingService.findRandomMatch(
        {
          id: playerSerial || playerId,
          name: playerName,
          avatar: avatar,
          level: getLevel(xp),
          gender: gender,
          age: playerAge,
          xp: xp,
          serial: playerSerial,
        },
        "general",
        (statusMsg: string) => {
          // Status update
        },
        3
      ).then((matchResult) => {
        if (matchResult) {
          const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          setProposedMatch({
            matchId,
            roomId: matchResult.roomId,
            opponent: matchResult.opponent,
            opponentAccepted: true,
            isP2P: matchResult.isP2P,
            p2pManager: matchResult.p2pManager,
          } as any);
          setHasResponded(false);
          setOpponentAccepted(true);
          setMatchResponseTimeLeft(10);
          try {
            playSound("matchFound");
          } catch (e) {}
        }
      }).catch((err) => {
        console.warn("Serverless matchmaking error:", err);
      });
    }
  };


  const handleProposeMode = (mode: string) => {
    const isOfflineOrBot = room?.players?.[1]?.isBot || !socket?.connected;
    if (isOfflineOrBot) {
      GameEngineService.handleAction("propose_selection_mode", {
        roomId: room?.id,
        mode: mode,
        playerId: socket?.id || playerId,
      });
    } else {
      socket?.emit("propose_selection_mode", {
        roomId: room?.id,
        mode: mode,
      });
    }
  };

  const handleServerlessMatchAccept = (currentProposedMatch: any) => {
    if (!currentProposedMatch) return;
    const opp = currentProposedMatch.opponent;
    const myId = socket?.id || playerId;
    const oppId = opp.id || `bot_${Math.random().toString(36).substr(2, 6)}`;
    const initialRoom: any = {
      id: currentProposedMatch.roomId || `room_${Date.now()}`,
      players: [
        {
          id: myId,
          name: playerName,
          playerName: playerName,
          avatar: avatar,
          age: playerAge,
          gender: gender,
          xp: xp,
          level: getLevel(xp),
          serial: playerSerial,
          selectedFrame: selectedFrame,
          isBot: false,
        } as any,
        {
          id: oppId,
          name: opp.name,
          playerName: opp.name,
          avatar: opp.avatar,
          age: opp.age || 25,
          gender: opp.gender || "boy",
          xp: opp.xp || (opp.level * 100),
          level: opp.level || 1,
          serial: opp.serial || oppId,
          isBot: opp.isBot !== false,
          disableGuessChat: 1,
          persona: opp.persona || "",
          selectedFrame: opp.selectedFrame || "",
          proPackageExpiry: opp.proPackageExpiry || null,
          wins: opp.wins || 10,
          busCompleteWins: opp.busCompleteWins || 5,
          xoWins: opp.xoWins || 5,
          handWins: opp.handWins || 5,
          iqWins: opp.iqWins || 5,
          dotsWins: opp.dotsWins || 5,
          speedCupsWins: opp.speedCupsWins || 5,
          bombPartyWins: opp.bombPartyWins || 5,
          wordleWins: opp.wordleWins || 5,
          connectFourWordsWins: opp.connectFourWordsWins || 5,
          spaceWarWins: opp.spaceWarWins || 5,
        } as any,
      ],
      gameState: "waiting",
      timer: 60,
      category: "random",
      isPaused: false,
      pausingPlayerId: null,
      quickGuessTimer: 15,
      selectionMode: null,
      isP2P: currentProposedMatch.isP2P,
      p2pManager: currentProposedMatch.p2pManager,
      isBot: opp.isBot !== false,
    };
    setRoomId(initialRoom.id);
    setIsPrivate(false);
    setIsSearching(false);
    setJoined(true);
    setProposedMatch(null);
    setHasResponded(false);
    setOpponentAccepted(false);
    setMatchResponseTimeLeft(null);
    setSearchTimeLeft(null);
    setRoom(initialRoom);
    GameEngineService.initRoom(initialRoom);
  };

  const handleRegister = () => {
    playSound("clickOpen");
    setRegisterError("");
    if (!playerName.trim() || !playerAge) {
      playSound("wrong");
      setRegisterError("يرجى إدخال اسمك وعمرك أولاً");
      return;
    }

    if (!hasSelectedAvatar) {
      playSound("wrong");
      setRegisterError("يرجى اختيار افاتار البداية الخاص بك");
      return;
    }

    if (!hasSelectedFrame) {
      playSound("wrong");
      setRegisterError("يرجى اختيار إطار البداية الخاص بك");
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      playSound("wrong");
      setRegisterError(
        "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية لإنشاء حساب",
      );
      return;
    }

    socket?.emit(
      "register_player",
      {
        name: playerName,
        avatar,
        xp,
        gender,
        fingerprint,
        selectedFrame: selectedInitialFrame,
        email: googleRegistrationData ? googleRegistrationData.email : null,
      },
      (response: any) => {
        if (response.error) {
          setRegisterError(response.error);
          return;
        }

        const { serial, name, secretToken } = response;
        if (serial) {
          setPlayerSerial(serial);
          setPlayerName(name); // Update with filtered name
          localStorage.setItem("khamin_player_serial", serial);
          if (secretToken)
            localStorage.setItem("khamin_secret_token", secretToken);
          localStorage.setItem("khamin_player_name", name);
          localStorage.setItem("khamin_player_age", playerAge.toString());
          localStorage.setItem("khamin_player_gender", gender);
          localStorage.setItem("khamin_player_avatar", avatar);
          setGoogleRegistrationData(null);
          if (selectedInitialFrame) {
            localStorage.setItem("khamin_player_frame", selectedInitialFrame);
            setSelectedFrame(selectedInitialFrame);
          }
          localStorage.setItem("khamin_wins", "0");

          const isAdmin = localStorage.getItem("khamin_is_admin") === "true";
          const adminEmail =
            localStorage.getItem("khamin_admin_email") ||
            "adhamsabry.co@gmail.com";
          if (isAdmin) {
            socket?.emit(
              "admin_set_admin_status",
              { serial, isAdmin: true, email: adminEmail },
              (res: any) => {
                if (res?.success && res.adminToken) {
                  localStorage.setItem("khamin_admin_token", res.adminToken);
                }
              },
            );
          }

          socket?.emit("set_player_serial_for_socket", {
            serial,
            fingerprint: localStorage.getItem("khamin_fingerprint"),
            secretToken,
          });

          socket?.emit("get_city_search", { serial });

          setShowWelcomeModal(false);
          
          playSound("clickClose");
          setError("");
        } else {
          setError("فشل التسجيل. يرجى المحاولة مرة أخرى.");
        }
      },
    );
  };

  const handleLogin = () => {
    playSound("clickOpen");
    setLoginError("");
    if (!loginSerial.trim()) {
      playSound("wrong");
      setLoginError("يرجى إدخال رقم ID اللاعب");
      return;
    }

    socket?.emit(
      "get_player_data",
      {
        serial: loginSerial.trim(),
        fingerprint,
        secretToken: loginToken.trim() || undefined,
      },
      (player: any) => {
        if (player && player.error) {
          setLoginError(player.error);
        } else if (player) {
          setPlayerSerial(player.serial);
          setPlayerName(player.name);
          setIsHighestLikes(player.isHighestLikes || false);
          setPlayerAge(player.age || 18);
          setGender(player.gender || "boy");
          setAvatar(player.avatar);
          setXp(player.xp || 0);
          prevLevelRef.current = getLevel(player.xp || 0);
          setWins(player.wins || 0);
          setتخمينات(player.tokens || 0);
          setLikes(player.likes || 0);
          setStreak(player.streak || 0);
          setOwnedHelpers(player.ownedHelpers || {});
          if (player.selectedFrame !== undefined) {
            setSelectedFrame(player.selectedFrame);
            localStorage.setItem("khamin_player_frame", player.selectedFrame);
          }

          localStorage.setItem("khamin_player_serial", player.serial);
          if (player.secretToken) {
            localStorage.setItem("khamin_secret_token", player.secretToken);
          }
          localStorage.setItem("khamin_player_name", player.name);
          localStorage.setItem(
            "khamin_player_age",
            (player.age || 18).toString(),
          );
          localStorage.setItem("khamin_player_gender", player.gender || "boy");
          localStorage.setItem("khamin_player_avatar", player.avatar);
          localStorage.setItem("khamin_wins", (player.wins || 0).toString());
          localStorage.setItem("khamin_xp", (player.xp || 0).toString());
          localStorage.setItem("khamin_likes", (player.likes || 0).toString());
          localStorage.setItem(
            "khamin_tokens",
            (player.tokens || 0).toString(),
          );
          localStorage.setItem(
            "khamin_streak",
            (player.streak || 0).toString(),
          );

          fetchCollection(player.serial);

          socket?.emit("set_player_serial_for_socket", {
            serial: player.serial,
            fingerprint: localStorage.getItem("khamin_fingerprint"),
            secretToken: player.secretToken,
          });
          socket?.emit("get_city_search", { serial: player.serial });

          setShowWelcomeModal(false);

          playSound("clickClose");
          setError("");
        } else {
          playSound("wrong");
          setLoginError("رقم ID غير صحيح أو الحساب غير موجود");
        }
      },
    );
  };

  const handleProfileLogin = () => {
    playSound("clickOpen");
    setProfileLoginError("");
    if (!profileLoginSerial.trim()) {
      playSound("wrong");
      setProfileLoginError("يرجى إدخال رقم ID اللاعب");
      return;
    }

    socket?.emit(
      "get_player_data",
      {
        serial: profileLoginSerial.trim(),
        fingerprint,
        secretToken: profileLoginToken.trim() || undefined,
      },
      (player: any) => {
        if (player && player.error) {
          setProfileLoginError(player.error);
        } else if (player) {
          setPlayerSerial(player.serial);
          setPlayerName(player.name);
          setIsHighestLikes(player.isHighestLikes || false);
          setPlayerAge(player.age || 18);
          setGender(player.gender || "boy");
          setAvatar(player.avatar);
          setXp(player.xp || 0);
          prevLevelRef.current = getLevel(player.xp || 0);
          setWins(player.wins || 0);
          setتخمينات(player.tokens || 0);
          setLikes(player.likes || 0);
          setStreak(player.streak || 0);
          setOwnedHelpers(player.ownedHelpers || {});
          if (player.selectedFrame !== undefined) {
            setSelectedFrame(player.selectedFrame);
            localStorage.setItem("khamin_player_frame", player.selectedFrame);
          }

          localStorage.setItem("khamin_player_serial", player.serial);
          if (player.secretToken) {
            localStorage.setItem("khamin_secret_token", player.secretToken);
          }
          localStorage.setItem("khamin_player_name", player.name);
          localStorage.setItem(
            "khamin_player_age",
            (player.age || 18).toString(),
          );
          localStorage.setItem("khamin_player_gender", player.gender || "boy");
          localStorage.setItem("khamin_player_avatar", player.avatar);
          localStorage.setItem("khamin_wins", (player.wins || 0).toString());
          localStorage.setItem("khamin_xp", (player.xp || 0).toString());
          localStorage.setItem("khamin_likes", (player.likes || 0).toString());
          localStorage.setItem(
            "khamin_tokens",
            (player.tokens || 0).toString(),
          );
          localStorage.setItem(
            "khamin_streak",
            (player.streak || 0).toString(),
          );

          fetchCollection(player.serial);

          socket?.emit("set_player_serial_for_socket", {
            serial: player.serial,
            fingerprint: localStorage.getItem("khamin_fingerprint"),
            secretToken: player.secretToken,
          });
          socket?.emit("get_city_search", { serial: player.serial });

          setShowProfileLoginModal(false);
          setProfileLoginSerial("");
          closeAllModals();

          playSound("clickClose");
          setError("");
          showAlert("تم تسجيل الدخول بنجاح!", "تسجيل الدخول");
        } else {
          playSound("wrong");
          setProfileLoginError("رقم ID غير صحيح أو الحساب غير موجود");
        }
      },
    );
  };

  const getEasyGuessOptions = () => {
    if (!room || !room.category || !me?.targetImage?.name) return null;
    const categoryObj = categories.find((c) => c.id === room.category);
    const categoryName = categoryObj ? categoryObj.name : room.category;

    // @ts-ignore
    const categoryData = easyGuessData[categoryName];
    if (!categoryData) return null;

    const options = categoryData[me.targetImage.name];
    if (!options || !Array.isArray(options)) return null;

    return options;
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    playSound("clickOpen");
    if (room?.isCustomImageMode) {
      socket?.emit("custom_guess", { roomId: room!.id, guess, type: "final" });
      setIsWaitingForJudgment(true);
    } else {
      socket?.emit("submit_guess", { roomId, guess });
      GameEngineService.handleAction("submit_guess", { roomId, guess, playerId: socket?.id });
    }
    setGuess("");
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCustomUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // compress with JPEG 0.7
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setCustomImageBase64(dataUrl);
        setIsCustomUploading(false);
      };
      img.onerror = () => {
        setIsCustomUploading(false);
        showAlert("حدث خطأ أثناء تحميل الصورة.", "خطأ");
      };
    };
    reader.onerror = () => {
      setIsCustomUploading(false);
      showAlert("حدث خطأ أثناء قراءة الملف.", "خطأ");
    };
  };

  const handleCustomImageSubmit = () => {
    if (!customImageBase64 || !customImageAnswer.trim() || !socket || !roomId) {
      if (!customImageBase64) showAlert("برجاء رفع صورة أولاً.", "تنبيه");
      else if (!customImageAnswer.trim())
        showAlert("برجاء كتابة اسم الصورة المفترض تخمينه.", "تنبيه");
      return;
    }
    setIsCustomSubmitted(true);
    socket?.emit("submit_custom_image", {
      roomId,
      imageBase64: customImageBase64,
      answer: customImageAnswer.trim(),
    });
    GameEngineService.handleAction("submit_custom_image", {
      roomId,
      imageBase64: customImageBase64,
      answer: customImageAnswer.trim(),
      playerId: socket?.id,
    });
  };

  const submitJudgment = (isCorrect: boolean) => {
    if (!judgmentRequest || !socket || !roomId) return;
    socket.emit("custom_guess_judgment", {
      roomId,
      guess: judgmentRequest.guess,
      type: judgmentRequest.type,
      playerId: judgmentRequest.playerId,
      isCorrect,
    });
    setJudgmentRequest(null);
  };

  
  const handleWatchAdForGuessChat = () => {
    playSound("clickOpen");
    if (socket && room?.id) {
      socket.emit("ad_started", { roomId: room.id, powerUpName: "فتح شات الدردشة" });
    }
    showAd(
      room?.id || "",
      socket?.id || "",
      () => {
        setGuessChatUnlocked(true);
      },
      undefined,
      () => {
        if (socket && room?.id) {
          socket.emit("ad_ended", { roomId: room.id });
        }
      }
    );
  };

  const handleSendChat = (e: React.FormEvent) => {

    e.preventDefault();
    if (!chatInput.trim()) return;
    playSound("clickOpen");
    socket?.emit("send_chat", { roomId, text: chatInput });
    setChatInput("");
  };

  const handleQuickGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    if (room?.isCustomImageMode) {
      socket?.emit("custom_guess", { roomId: room!.id, guess, type: "quick" });
      setIsWaitingForJudgment(true);
    } else {
      socket?.emit("submit_quick_guess", { roomId: room!.id, guess });
    }
    setGuess("");
  };

  const adTriggeredRef = useRef(false);

  const handleWatchKeyAd = () => {
    console.log("handleWatchKeyAd called. Current keyAdStatus:", keyAdStatus);

    if (adTriggeredRef.current || isGlobalAdLoading) return;
    if (isKeyCooldown) {
      showAlert("يرجى الانتظار 30 ثانية قبل مشاهدة الإعلان التالي!", "تنبيه");
      return;
    }

    if (!keyAdStatus.canWatch) {
      console.log("Cannot watch key ad: limit reached");
      showAlert("انتهت المحاولات لهذا اليوم!", "تنبيه");
      return;
    }

    // Close confirmation modal immediately to prevent "fixed window" issue
    setShowAdConfirmation(false);

    // Set triggered to true immediately to prevent double clicks
    adTriggeredRef.current = true;
    setIsGlobalAdLoading(true);

    let localAdTriggered = false;
    const startAdProcess = () => {
      if (localAdTriggered) return;
      localAdTriggered = true;
      setIsGlobalAdLoading(false);
      socket?.emit("start_ad_watch", { serial: playerSerial });
    };

    let adSafetyTimeout: NodeJS.Timeout;
    const onAdComplete = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);

      // Trigger cooldown after ad finishes
      setIsKeyCooldown(true);
      setKeyCooldownTime(30);

      socket?.emit("watch_key_ad_request", { serial: playerSerial });
    };

    const startMockAd = () => {
      console.log("Falling back to mock ad");
      startAdProcess();
      setMockAdProviderState({
        onComplete: () => {
          onAdComplete();
        },
        onDismissed: () => {
          clearTimeout(adSafetyTimeout);
          adTriggeredRef.current = false;
          setIsGlobalAdLoading(false);
          showAlert(
            "تم إغلاق الإعلان قبل الاكتمال. لن تحصل على مكافأة.",
            "تنبيه",
          );
        },
      });
    };

    const handleAdUnavailable = () => {
      setIsGlobalAdLoading(false);
      if (sessionAdFailuresCount < 2) {
        sessionAdFailuresCount += 1;
        localStorage.setItem(
          "khamin_ad_failures",
          sessionAdFailuresCount.toString(),
        );
        showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
        adTriggeredRef.current = false;
        return;
      }
      sessionAdFailuresCount = 0;
      localStorage.setItem("khamin_ad_failures", "0");
      console.warn(
        "Google Ads unavailable, falling back to mock ad temporarily",
      );
      startMockAd();
    };

    // Call real AdSense adBreak if available
    if (typeof window.adBreak === "function") {
      console.log("Calling Google AdSense adBreak");
      // Set a safety timeout: if AdSense doesn't trigger beforeAd within 12 seconds, use fallback
      const adTimeout = setTimeout(() => {
        if (!localAdTriggered) {
          console.warn("AdSense adBreak timed out, using fallback");
          handleAdUnavailable();
        }
      }, 12000);

      try {
        window.adBreak({
          type: "reward",
          name: "get_key",
          beforeAd: () => {
            console.log("AdSense: beforeAd");
            clearTimeout(adTimeout);
            if (localAdTriggered) {
              console.log("AdSense started late, closing mock ad");
              setMockAdProviderState(null);
            }
            localAdTriggered = false;
            setIsGlobalAdLoading(false);
            startAdProcess();

            // Safety timeout: if ad doesn't finish or dismiss within 60 seconds, resume game
            adSafetyTimeout = setTimeout(() => {
              console.warn("AdSense ad stuck, resuming game");
              setIsGlobalAdLoading(false);
              adTriggeredRef.current = false;
              showAlert("حدث خطأ أثناء تحميل الإعلان.", "خطأ");
            }, 60000);
          },
          afterAd: () => {
            console.log("AdSense: afterAd");
          },
          beforeReward: (showAdFn: any) => {
            console.log("AdSense: beforeReward");
            showAdFn();
          },
          adDismissed: () => {
            console.log("AdSense: adDismissed");
            clearTimeout(adSafetyTimeout);
            adTriggeredRef.current = false;
            setIsGlobalAdLoading(false);
            showAlert(
              "تم إغلاق الإعلان قبل الاكتمال. لن تحصل على مكافأة.",
              "تنبيه",
            );
          },
          adViewed: () => {
            console.log("AdSense: adViewed");
            sessionAdFailuresCount = 0;
            localStorage.setItem("khamin_ad_failures", "0");
            onAdComplete();
          },
          adBreakDone: (placementInfo: any) => {
            console.log("AdSense: adBreakDone", placementInfo);
            setIsGlobalAdLoading(false);
            // If adBreakDone is called but ad was never triggered, it means no ad was available
            if (!localAdTriggered) {
              clearTimeout(adTimeout);
              console.warn(
                "AdSense adBreakDone called without triggering ad, using fallback",
              );
              handleAdUnavailable();
            } else {
              adTriggeredRef.current = false;
            }
          },
        });
      } catch (error) {
        console.error("Error calling window.adBreak:", error);
        clearTimeout(adTimeout);
        handleAdUnavailable();
      }
    } else {
      // Fallback if AdSense is blocked or not loaded
      handleAdUnavailable();
    }
  };
  const handleWatchAd = () => {
    console.log("handleWatchAd called. Current adStatus:", adStatus);

    if (adTriggeredRef.current || isGlobalAdLoading) return;
    if (isCooldown) {
      showAlert("يرجى الانتظار 30 ثانية قبل مشاهدة الإعلان التالي!", "تنبيه");
      return;
    }

    const isPowerUp = !!activePowerUp;

    // Level check only for token rewards (from shop)
    if (!isPowerUp && getLevel(xp) < 50) {
      showAlert("يجب أن تصل للمستوى 50 لتتمكن من مشاهدة الإعلانات!", "تنبيه");
      return;
    }

    // Daily limit check only for token rewards
    if (!isPowerUp && !adStatus.canWatch) {
      console.log("Cannot watch ad: limit reached or level too low");
      showAlert("انتهت المحاولات لهذا اليوم!", "تنبيه");
      return;
    }

    // Close confirmation modal immediately to prevent "fixed window" issue
    setShowAdConfirmation(false);

    // Set triggered to true immediately to prevent double clicks
    adTriggeredRef.current = true;
    setIsGlobalAdLoading(true);

    let localAdTriggered = false;

    const startAdProcess = () => {
      if (localAdTriggered) return;
      localAdTriggered = true;
      setIsGlobalAdLoading(false);

      if (roomId && isPowerUp) {
        const powerUpName = {
          quick_guess: "تخمين سريع",
          hint: "نصيحة",
          word_length: "كاشف الحروف",
          word_count: "عدد الكلمات",
          time_freeze: "تجميد الوقت",
          spy_lens: "الجاسوس",
        }[activePowerUp || ""];

        if (roomId) {
          socket?.emit("ad_started", {
            roomId,
            powerUpName,
            helperId: activePowerUp,
          });
        }
      } else if (roomId) {
        socket?.emit("ad_started", { roomId });
      }
      socket?.emit("start_ad_watch", { serial: playerSerial });
    };

    let adSafetyTimeout: NodeJS.Timeout;

    const onAdComplete = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);

      // Trigger cooldown after ad finishes
      setIsCooldown(true);
      setCooldownTime(30);

      if (isPowerUp) {
        if (!readyPowerUps.includes(activePowerUp!)) {
          setReadyPowerUps((prev) => [...prev, activePowerUp!]);
        }
        // Notify server that ad reward is ready for this helper
        if (roomId) {
          socket?.emit("ad_reward_ready", { roomId, helperId: activePowerUp });
        }
        setActivePowerUp(null);
      } else {
        socket?.emit("watch_ad_request", { serial: playerSerial });
      }

      if (roomId) {
        socket?.emit("ad_ended", { roomId });
      }
    };

    const startMockAd = () => {
      console.log("Falling back to mock ad");
      startAdProcess();
      setMockAdProviderState({
        onComplete: () => {
          onAdComplete();
        },
        onDismissed: () => {
          clearTimeout(adSafetyTimeout);
          adTriggeredRef.current = false;
          setIsGlobalAdLoading(false);
          showAlert(
            "تم إغلاق الإعلان قبل الاكتمال. لن تحصل على مكافأة.",
            "تنبيه",
          );
          if (roomId) socket?.emit("ad_ended", { roomId });
          setActivePowerUp(null);
        },
      });
    };

    const handleAdUnavailable = () => {
      setIsGlobalAdLoading(false);
      if (sessionAdFailuresCount < 2) {
        sessionAdFailuresCount += 1;
        localStorage.setItem(
          "khamin_ad_failures",
          sessionAdFailuresCount.toString(),
        );
        showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
        adTriggeredRef.current = false;
        setActivePowerUp(null);
        return;
      }
      sessionAdFailuresCount = 0;
      localStorage.setItem("khamin_ad_failures", "0");
      console.warn(
        "Google Ads unavailable, falling back to mock ad temporarily",
      );
      startMockAd();
    };

    // Call real AdSense adBreak if available
    if (typeof window.adBreak === "function") {
      console.log("Calling Google AdSense adBreak");

      // Set a safety timeout: if AdSense doesn't trigger beforeAd within 12 seconds, use fallback
      const adTimeout = setTimeout(() => {
        if (!localAdTriggered) {
          console.warn("AdSense adBreak timed out, using fallback");
          handleAdUnavailable();
        }
      }, 12000);

      try {
        window.adBreak({
          type: "reward",
          name: isPowerUp ? `use_${activePowerUp}` : "get_token",
          beforeAd: () => {
            console.log("AdSense: beforeAd");
            clearTimeout(adTimeout);
            if (localAdTriggered) {
              console.log("AdSense started late, closing mock ad");
              setMockAdProviderState(null);
            }
            localAdTriggered = false;
            setIsGlobalAdLoading(false);
            startAdProcess();

            // Safety timeout: if ad doesn't finish or dismiss within 60 seconds, resume game
            adSafetyTimeout = setTimeout(() => {
              console.warn("AdSense ad stuck, resuming game");
              if (roomId) {
                socket?.emit("ad_ended", { roomId });
              }
              setActivePowerUp(null);
              setIsGlobalAdLoading(false);
              adTriggeredRef.current = false;
              showAlert("حدث خطأ أثناء تحميل الإعلان.", "خطأ");
            }, 60000);
          },
          afterAd: () => {
            console.log("AdSense: afterAd");
          },
          beforeReward: (showAdFn: any) => {
            console.log("AdSense: beforeReward");
            showAdFn();
          },
          adDismissed: () => {
            console.log("AdSense: adDismissed");
            clearTimeout(adSafetyTimeout);
            adTriggeredRef.current = false;
            setIsGlobalAdLoading(false);
            showAlert(
              "تم إغلاق الإعلان قبل الاكتمال. لن تحصل على مكافأة.",
              "تنبيه",
            );
            if (roomId) {
              socket?.emit("ad_ended", { roomId });
            }
            setActivePowerUp(null);
          },
          adViewed: () => {
            console.log("AdSense: adViewed");
            sessionAdFailuresCount = 0;
            localStorage.setItem("khamin_ad_failures", "0");
            onAdComplete();
          },
          adBreakDone: (placementInfo: any) => {
            console.log("AdSense: adBreakDone", placementInfo);
            setIsGlobalAdLoading(false);
            // If adBreakDone is called but ad was never triggered, it means no ad was available
            if (!localAdTriggered) {
              clearTimeout(adTimeout);
              console.warn(
                "AdSense adBreakDone called without triggering ad, using fallback",
              );
              handleAdUnavailable();
            } else {
              adTriggeredRef.current = false;
            }
          },
        });
      } catch (error) {
        console.error("Error calling window.adBreak:", error);
        clearTimeout(adTimeout);
        handleAdUnavailable();
      }
    } else {
      // Fallback if AdSense is blocked or not loaded
      handleAdUnavailable();
    }
  };

  const triggerMatchAd = useCallback(() => {
    if (hasProPackage) {
      setMatchAdState({ show: false, timer: 0, adFailed: false, adStarted: false });
      localStorage.removeItem("khamin_pending_match_ad");
      return;
    }

    setMatchAdState(prev => ({ ...prev, adStarted: true, adFailed: false }));
    
    if (typeof (window as any).adBreak === "function") {
      let adFinished = false;
      let adViewed = false;
      let adDismissed = false;
      
      const handleAdFailure = () => {
        localStorage.removeItem("khamin_pending_match_ad");
        setMatchAdState({ show: false, timer: 0, adFailed: false, adStarted: false });
      };

      const adTimeout = setTimeout(() => {
        if (!adFinished) handleAdFailure();
      }, 12000);

      try {
        (window as any).adBreak({
          type: "reward",
          name: "match_interval_ad",
          beforeAd: () => {
            clearTimeout(adTimeout);
          },
          beforeReward: (showAdFn: any) => showAdFn(),
          afterAd: () => {},
          adDismissed: () => {
            adFinished = true;
            adDismissed = true;
            localStorage.setItem("khamin_pending_match_ad", "true");
            setMatchAdState(prev => ({ ...prev, adFailed: true, adStarted: false }));
          },
          adViewed: () => {
            adFinished = true;
            adViewed = true;
            localStorage.removeItem("khamin_pending_match_ad");
            setMatchAdState({ show: false, timer: 0, adFailed: false, adStarted: false });
          },
          adBreakDone: (placementInfo: any) => {
            adFinished = true;
            clearTimeout(adTimeout);
            if (!adViewed && !adDismissed) {
               localStorage.removeItem("khamin_pending_match_ad");
               setMatchAdState({ show: false, timer: 0, adFailed: false, adStarted: false });
            }
          }
        });
      } catch(e) {
        clearTimeout(adTimeout);
        handleAdFailure();
      }
    } else {
      localStorage.removeItem("khamin_pending_match_ad");
      setMatchAdState({ show: false, timer: 0, adFailed: false, adStarted: false });
    }
  }, [hasProPackage]);

  useEffect(() => {
    if (room && room.gameState !== previousGameStateRef.current) {
      if (room.gameState === "xo_finished" || room.gameState === "bus_complete_evaluating" || room.gameState === "finished" || room.gameState === "hand_finished" || room.gameState === "iq_finished" || room.gameState === "dots_finished" || room.gameState === "bus_complete_finished" || room.gameState === "speed_cups_finished" || room.gameState === "bomb_party_finished" || room.gameState === "wordle_finished" || room.gameState === "connect_four_words_finished" || room.gameState === "space_war_finished" || room.gameState === "puzzle_finished" || room.gameState === "beach_race_finished") {
        if (!hasProPackage) {
          const increment = (room.gameState === "puzzle_finished" || room.gameState === "bus_complete_finished") ? 3 : 1;
          matchesPlayedRef.current += increment;
          if (matchesPlayedRef.current >= 3) {
            matchesPlayedRef.current = 0;
            localStorage.setItem("khamin_pending_match_ad", "true");
            setMatchAdState({ show: true, timer: 3, adFailed: false, adStarted: false });
          }
        }
      } else if (room.gameState === "waiting" && localStorage.getItem("khamin_pending_match_ad") === "true" && !hasProPackage) {
        setMatchAdState({ show: true, timer: 0, adFailed: true, adStarted: false });
      }
      previousGameStateRef.current = room.gameState;
    }
  }, [room?.gameState, hasProPackage]);

  useEffect(() => {
    if (matchAdState.show && matchAdState.timer > 0 && !matchAdState.adStarted && !matchAdState.adFailed) {
      const timerId = setTimeout(() => {
        setMatchAdState(prev => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (matchAdState.show && matchAdState.timer === 0 && !matchAdState.adStarted && !matchAdState.adFailed) {
      triggerMatchAd();
    }
  }, [matchAdState.show, matchAdState.timer, matchAdState.adStarted, matchAdState.adFailed, triggerMatchAd]);

  useEffect(() => {
    if (matchAdState.show) {
      if (room?.id) {
        socket?.emit("ad_started", { roomId: room.id, powerUpName: "تجهيز مباراة" });
      }
    } else {
      if (room?.id) {
        socket?.emit("ad_ended", { roomId: room.id });
      }
    }
  }, [matchAdState.show, room?.id, socket]);

  const handleWatchCategoryAd = useCallback(() => {
    if (adTriggeredRef.current) return;
    adTriggeredRef.current = true;
    let localAdTriggered = false;

    const startAdProcess = () => {
      if (localAdTriggered) return;
      localAdTriggered = true;
      setIsWatchingCategoryAd(true);
      setShowCategoryAdButton(false);
      if (roomId) {
        socket?.emit("ad_started", { roomId, powerUpName: "فتح فئات التخمين" });
      }
      socket?.emit("start_ad_watch", { serial: playerSerial });
    };

    let adSafetyTimeout: NodeJS.Timeout;

    const onAdComplete = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsWatchingCategoryAd(false);
      setHasWatchedCategoryAd(true);
      setShowCategoryAdButton(false);

      if (roomId) {
        socket?.emit("ad_ended", { roomId });
      }
    };

    const onAdDismissed = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsWatchingCategoryAd(false);
      setShowCategoryAdButton(true);
      showAlert("يجب استكمال مشاهدة الإعلان لفتح فئات التخمين.", "تنبيه");

      if (roomId) {
        socket?.emit("ad_ended", { roomId });
      }
    };

    const startMockAd = () => {
      console.log("Falling back to mock ad for category");
      startAdProcess();
      setMockAdProviderState({
        onComplete: () => {
          onAdComplete();
        },
        onDismissed: () => {
          onAdDismissed();
        },
      });
    };

    const handleAdUnavailable = () => {
      if (sessionAdFailuresCount < 2) {
        sessionAdFailuresCount += 1;
        localStorage.setItem(
          "khamin_ad_failures",
          sessionAdFailuresCount.toString(),
        );
        showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
        setIsWatchingCategoryAd(false);
        setShowCategoryAdButton(true);
        adTriggeredRef.current = false;
        return;
      }
      sessionAdFailuresCount = 0;
      localStorage.setItem("khamin_ad_failures", "0");
      console.warn(
        "Google Ads unavailable, falling back to mock ad temporarily",
      );
      startMockAd();
    };

    if (typeof window.adBreak === "function") {
      const adTimeout = setTimeout(() => {
        if (!localAdTriggered) {
          handleAdUnavailable();
        }
      }, 12000);

      try {
        window.adBreak({
          type: "reward",
          name: "category_selection",
          beforeAd: () => {
            clearTimeout(adTimeout);
            if (localAdTriggered) {
              setMockAdProviderState(null);
            }
            localAdTriggered = false;
            startAdProcess();
            adSafetyTimeout = setTimeout(() => {
              if (roomId) socket?.emit("ad_ended", { roomId });
              adTriggeredRef.current = false;
              setIsWatchingCategoryAd(false);
              setShowCategoryAdButton(true);
            }, 60000);
          },
          beforeReward: (showAdFn: any) => showAdFn(),
          adDismissed: () => onAdDismissed(),
          adViewed: () => onAdComplete(),
          adBreakDone: (placementInfo: any) => {
            if (!localAdTriggered) {
              clearTimeout(adTimeout);
              console.warn(
                "AdSense adBreakDone called without triggering ad, using fallback",
              );
              handleAdUnavailable();
            } else {
              adTriggeredRef.current = false;
            }
          },
        });
      } catch (error) {
        clearTimeout(adTimeout);
        handleAdUnavailable();
      }
    } else {
      handleAdUnavailable();
    }
  }, [roomId, playerSerial, socket]);

  useEffect(() => {
    if (
      room?.gameState === "waiting" &&
      room.players.length === 2 &&
      !hasWatchedCategoryAd &&
      !isWatchingCategoryAd &&
      !showCategoryAdButton &&
      !adTriggeredRef.current
    ) {
      if (hasProPackage) {
        setHasWatchedCategoryAd(true);
      } else {
        // [TEMP] Category Ad disabled temporarily
        // handleWatchCategoryAd();
        setHasWatchedCategoryAd(true);
      }
    }
  }, [
    room?.gameState,
    room?.players?.length,
    hasWatchedCategoryAd,
    isWatchingCategoryAd,
    showCategoryAdButton,
    handleWatchCategoryAd,
    hasProPackage,
  ]);

  const handleRewardAd = (categoryId: string, stage: number) => {
    if (adTriggeredRef.current || isGlobalAdLoading) return;

    // Close confirmation modal immediately
    setPendingClaimReward(null);

    adTriggeredRef.current = true;
    setIsGlobalAdLoading(true);
    let localAdTriggered = false;

    const startAdProcess = () => {
      if (localAdTriggered) return;
      localAdTriggered = true;
      setIsGlobalAdLoading(false);
      if (roomId) {
        socket?.emit("ad_started", { roomId, powerUpName: "استلام مكافأة" });
      }
      socket?.emit("start_ad_watch", { serial: playerSerial });
    };

    let adSafetyTimeout: NodeJS.Timeout;

    const onAdComplete = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);

      if (roomId) {
        socket?.emit("ad_ended", { roomId });
      }

      socket?.emit("claim_collection_reward", {
        serial: playerSerial,
        categoryId,
        stage,
      });
    };

    const startMockAd = () => {
      startAdProcess();
      setMockAdProviderState({
        onComplete: () => {
          onAdComplete();
        },
        onDismissed: () => {
          clearTimeout(adSafetyTimeout);
          adTriggeredRef.current = false;
          setIsGlobalAdLoading(false);
          if (roomId) {
            socket?.emit("ad_ended", { roomId });
          }
          showAlert(
            "تم إغلاق الإعلان قبل الاكتمال. لن تحصل على مكافأة.",
            "تنبيه",
          );
        },
      });
    };

    const handleAdUnavailable = () => {
      setIsGlobalAdLoading(false);
      if (sessionAdFailuresCount < 2) {
        sessionAdFailuresCount += 1;
        localStorage.setItem(
          "khamin_ad_failures",
          sessionAdFailuresCount.toString(),
        );
        showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
        adTriggeredRef.current = false;
        return;
      }
      sessionAdFailuresCount = 0;
      localStorage.setItem("khamin_ad_failures", "0");
      startMockAd();
    };

    if (typeof window.adBreak === "function") {
      const adTimeout = setTimeout(() => {
        if (!localAdTriggered) {
          handleAdUnavailable();
        }
      }, 12000);

      try {
        window.adBreak({
          type: "reward",
          name: "claim_collection_reward",
          beforeAd: () => {
            clearTimeout(adTimeout);
            if (localAdTriggered) {
              setMockAdProviderState(null);
            }
            localAdTriggered = false;
            startAdProcess();
            adSafetyTimeout = setTimeout(() => {
              if (roomId) {
                socket?.emit("ad_ended", { roomId });
              }
              adTriggeredRef.current = false;
              showAlert("حدث خطأ أثناء تحميل الإعلان.", "خطأ");
            }, 60000);
          },
          afterAd: () => {},
          beforeReward: (showAdFn: any) => {
            showAdFn();
          },
          adDismissed: () => {
            clearTimeout(adSafetyTimeout);
            adTriggeredRef.current = false;
            if (roomId) {
              socket?.emit("ad_ended", { roomId });
            }
            showAlert(
              "تم إغلاق الإعلان قبل الاكتمال. لن تحصل على مكافأة.",
              "تنبيه",
            );
          },
          adViewed: () => {
            sessionAdFailuresCount = 0;
            localStorage.setItem("khamin_ad_failures", "0");
            onAdComplete();
          },
          adBreakDone: (placementInfo: any) => {
            if (!localAdTriggered) {
              clearTimeout(adTimeout);
              handleAdUnavailable();
            } else {
              adTriggeredRef.current = false;
            }
          },
        });
      } catch (error) {
        clearTimeout(adTimeout);
        handleAdUnavailable();
      }
    } else {
      handleAdUnavailable();
    }
  };

  const handleUnlockNameChange = () => {
    if (!socket || !playerSerial) return;
    socket.emit("unlock_name_change", { playerSerial }, (res: any) => {
      if (res.success) {
        showAlert("تم فتح إمكانية تغيير الاسم بنجاح!", "نجاح");
        setLastRenameAt(0);
        localStorage.setItem("khamin_last_rename_at", "0");
        if (res.keys !== undefined && res.keys !== null) {
          setKeys(res.keys);
          localStorage.setItem("khamin_keys", res.keys.toString());
        }
      } else {
        showAlert(res.error || "حدث خطأ غير متوقع.", "خطأ");
      }
    });
  };

  const handleProfileUpdate = () => {
    if (!socket) return;

    // Close the modal first (current behavior to mask delay)
    closeAllModals();

    // 1. Emit the update to the server with the persistent serial
    socket.emit(
      "update_profile",
      {
        playerSerial: playerSerial,
        playerName: playerName, // Fixed: was 'name', server expects 'playerName'
        age: playerAge,
        avatar: avatar,
        gender: gender,
      },
      (response: any) => {
        if (response.success === false) {
          // Revert localStorage name if it was cached prematurely
          const oldName =
            localStorage.getItem("khamin_player_name") || playerName;
          if (oldName !== playerName) {
            setPlayerName(oldName);
          }
          showAlert(
            response.error || "حدث خطأ أثناء حفظ الملف الشخصي",
            "خطأ",
            () => {
              setShowSettingsModal(true);
            },
          );
          return;
        }

        const {
          topPlayers,
          name,
          lastRenameAt: updatedLastRenameAt,
        } = response;
        // 2. In the callback, update with the authoritative list from the server
        if (topPlayers) {
          setTopPlayers(sortPlayers(topPlayers));
        }
        if (name) {
          setPlayerName(name);
          localStorage.setItem("khamin_player_name", name);
        }
        if (updatedLastRenameAt !== undefined) {
          setLastRenameAt(updatedLastRenameAt);
          localStorage.setItem(
            "khamin_last_rename_at",
            updatedLastRenameAt.toString(),
          );
        }

        // Update local storage for other fields on success
        localStorage.setItem("khamin_player_avatar", avatar);
        localStorage.setItem("khamin_player_gender", gender);
      },
    );
  };

  const handleDeleteAccount = () => {
    socket?.emit("delete_account", { playerSerial }, (response: any) => {
      if (response.success) {
        clearPlayerData();
        setIsAppLoading(true);
        setLoadingStatus("جاري مسح الحساب وإعادة التهيئة...");
        setLoadingProgress(0);

        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setLoadingProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            window.location.reload();
          }
        }, 300);
      } else {
        setError("فشل مسح الحساب. حاول مرة أخرى.");
        setShowDeleteConfirm(false);
      }
    });
  };

  const handleReportPlayer = (reason: string) => {
    if (reportTarget && socket) {
      socket.emit(
        "report_player_by_serial",
        {
          reporterSerial: playerSerial,
          reportedSerial: reportTarget.serial,
          reason,
        },
        (res: any) => {
          if (res && res.success) {
            setError("تم إرسال بلاغك بنجاح. شكراً لك!");
          } else {
            setError(res?.message || "لقد قمت بالإبلاغ عن هذا اللاعب بالفعل.");
          }
          setTimeout(() => setError(""), 5000);
        },
      );
      setShowReportModal(false);
      setReportTarget(null);
    } else if (opponent && socket && room) {
      socket.emit(
        "report_player",
        { roomId: room.id, reportedPlayerId: opponent.id, reason },
        (res: any) => {
          if (res && res.success) {
            setError("تم إرسال بلاغك بنجاح. شكراً لك!");
          } else {
            setError(res?.message || "لقد قمت بالإبلاغ عن هذا اللاعب بالفعل.");
          }
          setTimeout(() => setError(""), 5000);
        },
      );
      setShowReportModal(false);
    }
  };

  const handleBlockPlayer = () => {
    const target = reportTarget || opponent;
    if (target && socket) {
      setCustomConfirm({
        show: true,
        title: "حظر اللاعب",
        message: `هل أنت متأكد من حظر ${target.name}؟ لن تتمكن من اللعب معه مرة أخرى.`,
        onConfirm: () => {
          if (reportTarget) {
            socket.emit(
              "block_player_by_serial",
              {
                blockerSerial: playerSerial,
                blockedSerial: reportTarget.serial,
              },
              (res: any) => {
                if (res && res.success) {
                  showAlert(`تم حظر ${target.name} بنجاح`, "حظر");
                } else {
                  showAlert(res.error || "حدث خطأ أثناء حظر اللاعب.", "خطأ");
                }
              },
            );
          } else if (opponent && room) {
            socket.emit(
              "block_player",
              { roomId: room.id, blockedPlayerId: opponent.id },
              (res: any) => {
                if (res && res.success) {
                  showAlert(`تم حظر ${target.name} بنجاح`, "حظر");
                } else {
                  showAlert(res.error || "حدث خطأ أثناء حظر اللاعب.", "خطأ");
                }
              },
            );
          }
          setShowReportModal(false);
          setReportTarget(null);
        },
      });
    }
  };

  useEffect(() => {
    if (!citySearchState?.active) {
      setDisplayedRewards(null);
      return;
    }
    const updateTimer = () => {
      const now = Date.now();
      const remaining = citySearchState.endTime - now;

      const totalDuration = citySearchState.endTime - citySearchState.startTime;
      const elapsed = now - citySearchState.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

      if (citySearchState.rewards) {
        setDisplayedRewards({
          xp: Math.floor((citySearchState.rewards.xp || 0) * progress),
          tokens: Math.floor((citySearchState.rewards.tokens || 0) * progress),
          time_freeze: Math.floor(
            (citySearchState.rewards.time_freeze || 0) * progress,
          ),
          word_count: Math.floor(
            (citySearchState.rewards.word_count || 0) * progress,
          ),
          word_length: Math.floor(
            (citySearchState.rewards.word_length || 0) * progress,
          ),
          hint: Math.floor((citySearchState.rewards.hint || 0) * progress),
          spy_lens: Math.floor(
            (citySearchState.rewards.spy_lens || 0) * progress,
          ),
          pro_package_days: Math.floor(
            (citySearchState.rewards.pro_package_days || 0) * progress,
          ),
          keys: Math.floor((citySearchState.rewards.keys || 0) * progress),
        });
      }

      if (remaining <= 0) {
        setCitySearchTimeLeft("00:00:00");
      } else {
        const h = Math.floor(remaining / 3600000)
          .toString()
          .padStart(2, "0");
        const m = Math.floor((remaining % 3600000) / 60000)
          .toString()
          .padStart(2, "0");
        const s = Math.floor((remaining % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        setCitySearchTimeLeft(`${h}:${m}:${s}`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [citySearchState]);

  const handleShowAd = (onComplete: () => void, onFailed?: () => void) => {
    if (adTriggeredRef.current || isGlobalAdLoading) return;
    adTriggeredRef.current = true;
    setIsGlobalAdLoading(true);

    let adFinished = false;
    let adViewed = false;
    let adDismissed = false;

    const startAdProcess = () => {
      socket?.emit("start_ad_watch", { serial: playerSerial });
    };

    let adSafetyTimeout: NodeJS.Timeout;

    const onAdComplete = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);
      onComplete();
    };

    const handleAdFailure = () => {
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);
      if (sessionAdFailuresCount < 2) {
        sessionAdFailuresCount += 1;
        localStorage.setItem(
          "khamin_ad_failures",
          sessionAdFailuresCount.toString(),
        );
        showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
        return;
      }
      sessionAdFailuresCount = 0;
      localStorage.setItem("khamin_ad_failures", "0");
      setMockAdProviderState({
        onComplete: () => {
          onAdComplete();
        },
        onDismissed: () => {
          adFinished = true;
          adDismissed = true;
          clearTimeout(adSafetyTimeout);
          adTriggeredRef.current = false;
          setIsGlobalAdLoading(false);
          showAlert("يجب مشاهدة الإعلان كاملاً لبدء البحث!", "تنبيه");
          if (onFailed) onFailed();
        },
      });
    };

    if (typeof (window as any).adBreak === "function") {
      const adTimeout = setTimeout(() => {
        if (!adFinished) {
          handleAdFailure();
        }
      }, 12000);

      try {
        (window as any).adBreak({
          type: "reward",
          name: "city_search_ad",
          beforeAd: () => {
            clearTimeout(adTimeout);
            if (adFinished) {
              setMockAdProviderState(null);
            }
            adFinished = false;
            startAdProcess();
            Howler.mute(true);

            adSafetyTimeout = setTimeout(() => {
              onAdComplete();
            }, 60000);
          },
          afterAd: () => {
            Howler.mute(false);
          },
          beforeReward: (showAdFn: any) => {
            showAdFn();
          },
          adDismissed: () => {
            adFinished = true;
            adDismissed = true;
            clearTimeout(adSafetyTimeout);
            adTriggeredRef.current = false;
            setIsGlobalAdLoading(false);
            showAlert("يجب مشاهدة الإعلان كاملًا لبدء البحث!", "تنبيه");
            if (onFailed) onFailed();
          },
          adViewed: () => {
            sessionAdFailuresCount = 0;
            localStorage.setItem("khamin_ad_failures", "0");
            adFinished = true;
            adViewed = true;
            clearTimeout(adSafetyTimeout);
            onAdComplete();
          },
          adBreakDone: (placementInfo: any) => {
            adFinished = true;
            setIsGlobalAdLoading(false);
            clearTimeout(adSafetyTimeout);
            clearTimeout(adTimeout);
            if (!adViewed && !adDismissed) {
              // Google AdSense had no ad to show (No Fill)
              handleAdFailure();
            } else {
              adTriggeredRef.current = false;
            }
          },
        });
      } catch (e) {
        clearTimeout(adTimeout);
        handleAdFailure();
      }
    } else {
      handleAdFailure();
    }
  };

  const showBusCompleteAd = (onComplete: () => void, onFailed?: () => void) => {
    if (adTriggeredRef.current || isGlobalAdLoading) return;
    adTriggeredRef.current = true;
    setIsGlobalAdLoading(true);

    let adFinished = false;
    let adViewed = false;
    let adDismissed = false;

    const startAdProcess = () => {
      socket?.emit("start_ad_watch", { serial: playerSerial });
    };

    let adSafetyTimeout: NodeJS.Timeout;

    const onAdComplete = () => {
      clearTimeout(adSafetyTimeout);
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);
      onComplete();
    };

    const handleAdFailure = () => {
      adTriggeredRef.current = false;
      setIsGlobalAdLoading(false);
      if (sessionAdFailuresCount < 2) {
        sessionAdFailuresCount += 1;
        localStorage.setItem(
          "khamin_ad_failures",
          sessionAdFailuresCount.toString(),
        );
        showAlert("عذراً، انتظر قليلاً وحاول مرة أخرى", "تنبيه");
        return;
      }
      sessionAdFailuresCount = 0;
      localStorage.setItem("khamin_ad_failures", "0");
      setMockAdProviderState({
        onComplete: () => {
          onAdComplete();
        },
        onDismissed: () => {
          adFinished = true;
          adDismissed = true;
          clearTimeout(adSafetyTimeout);
          adTriggeredRef.current = false;
          setIsGlobalAdLoading(false);
          showAlert("يجب مشاهدة الاعلان كاملا لاستلام الهدايا", "تنبيه");
          if (onFailed) onFailed();
        },
      });
    };

    if (typeof (window as any).adBreak === "function") {
      const adTimeout = setTimeout(() => {
        if (!adFinished) {
          handleAdFailure();
        }
      }, 12000);

      try {
        (window as any).adBreak({
          type: "reward",
          name: "bus_complete_solve_ad",
          beforeAd: () => {
            clearTimeout(adTimeout);
            if (adFinished) {
              setMockAdProviderState(null);
            }
            adFinished = false;
            startAdProcess();
            Howler.mute(true);

            adSafetyTimeout = setTimeout(() => {
              onAdComplete();
            }, 60000);
          },
          afterAd: () => {
            Howler.mute(false);
          },
          beforeReward: (showAdFn: any) => {
            showAdFn();
          },
          adDismissed: () => {
            adFinished = true;
            adDismissed = true;
            clearTimeout(adSafetyTimeout);
            adTriggeredRef.current = false;
            setIsGlobalAdLoading(false);
            showAlert("يجب مشاهدة الاعلان كاملا لاستلام الهدايا", "تنبيه");
            if (onFailed) onFailed();
          },
          adViewed: () => {
            sessionAdFailuresCount = 0;
            localStorage.setItem("khamin_ad_failures", "0");
            adFinished = true;
            adViewed = true;
            clearTimeout(adSafetyTimeout);
            onAdComplete();
          },
          adBreakDone: (placementInfo: any) => {
            adFinished = true;
            setIsGlobalAdLoading(false);
            clearTimeout(adSafetyTimeout);
            clearTimeout(adTimeout);
            if (!adViewed && !adDismissed) {
              // Google AdSense had no ad to show (No Fill)
              handleAdFailure();
            } else {
              adTriggeredRef.current = false;
            }
          },
        });
      } catch (e) {
        clearTimeout(adTimeout);
        handleAdFailure();
      }
    } else {
      handleAdFailure();
    }
  };

  const [isCitySearchStarting, setIsCitySearchStarting] = useState(false);

  const handleStartCitySearch = () => {
    if (isCitySearchStarting || isGlobalAdLoading) return;
    setIsCitySearchStarting(true);

    handleShowAd(
      () => {
        socket?.emit("start_city_search", {
          serial: playerSerial,
          cityId: selectedCity,
        });
        // Optimistically update state so the button hides immediately
        setCitySearchState({
          active: true,
          cityId: selectedCity,
          startTime: Date.now(),
          endTime: Date.now() + 60 * 60 * 1000,
          rewards: {
            xp: 0,
            tokens: 0,
            time_freeze: 0,
            word_count: 0,
            word_length: 0,
            hint: 0,
            spy_lens: 0,
            pro_package_days: 0,
          },
        });
        showAlert(
          "ارجعوا بعد ساعة ولموا الهدايا والمكافآت 🤩 وابدأوا بحث جديد 🧐",
          "تم بدء البحث",
        );
        setIsCitySearchStarting(false);
      },
      () => {
        setIsCitySearchStarting(false);
      },
    );
  };

  const handleClaimCitySearch = () => {
    socket?.emit("claim_city_search", { serial: playerSerial });
  };

  const isCitySearchFinished =
    citySearchState?.active && Date.now() >= citySearchState.endTime;

  const handleStartGame = () => {
    playSound("clickOpen");
    socket?.emit("request_match_intro", { roomId });
    GameEngineService.handleAction("request_match_intro", { roomId });
  };

  const handleMatchIntroStart = useCallback(() => {
    socket?.emit("force_start_game", { roomId });
    GameEngineService.handleAction("force_start_game", { roomId });
  }, [roomId, socket]);

  const handleMatchIntroComplete = useCallback(() => {
    setShowMatchIntro(false);
  }, []);

  const resetToHome = () => {
    stopSound("countdownBeep");
    stopSound("tick");
    stopSound("clockTicking");
    stopSound("bombFuse");
    stopSound("deskBell");
    setJoined(false);
    setRoom(null);
    setRoomId("");
    setIsSearching(false);
    setProposedMatch(null);
    setHasResponded(false);
    setOpponentAccepted(false);
    setChatHistory([]);
    setChatInput("");
    setHint("");
    setHasWatchedCategoryAd(false);
    setIsWatchingCategoryAd(false);
    setShowCategoryAdButton(false);
    setShowMatchIntro(false);
    setBusAnswers({
      boy: "",
      girl: "",
      animal: "",
      plant: "",
      inanimate: "",
      country: "",
    });
    setReadyPowerUps([]);
    setCooldowns({
      quick_guess: 0,
      hint: 0,
      word_length: 0,
      word_count: 0,
      time_freeze: 0,
      spy_lens: 0,
    });
    setIsPrivate(false);
    setSpectatorRoomData(null);
    spectatingRoomIdRef.current = null;
    isIntentionalLeaveRef.current = false;
    if (playerSerial) {
      fetchCollection(playerSerial);
    }
  };

  const showAd = (roomId: string, playerId: string, callback: () => void, onStart?: () => void, onEnd?: () => void) => {
    let adViewed = false;
    let adStarted = false;
    let adHandled = false;

    const handleAdDismissed = () => {
      if (adHandled) return;
      adHandled = true;
      Howler.mute(false);
      if (onEnd) onEnd();
      showAlert("لم يكتمل الإعلان للحصول على المكافأة.", "عذراً");
    };

    const handleAdFailedOrNotReady = () => {
      if (adHandled) return;
      adHandled = true;
      Howler.mute(false);
      if (onEnd) onEnd();
      setMockAdProviderState({
        onComplete: () => {
          callback();
        },
        onDismissed: () => {
          showAlert("يجب مشاهدة الإعلان كاملاً للحصول على المكافأة.", "تنبيه");
        },
      });
    };

    if (typeof (window as any).adBreak === "function") {
      try {
        (window as any).adBreak({
          type: "reward",
          name: "rewarded_ad",
          beforeAd: () => {
            adStarted = true;
            (window as any).adStartTime = Date.now();
            Howler.mute(true);
            if (onStart) onStart();
          },
          afterAd: () => {
            Howler.mute(false);
            if (onEnd) onEnd();
          },
          beforeReward: (showAdFn: any) => {
            showAdFn();
          },
          adViewed: () => {
            if (adHandled) return;
            adViewed = true;
            adHandled = true;
            Howler.mute(false);
            if (onEnd) onEnd();
            callback();
          },
          adDismissed: () => {
            if (!adViewed) {
              handleAdDismissed();
            }
          },
          adBreakDone: (placementInfo: any) => {
            if (!adViewed && !adHandled) {
              if (adStarted) {
                handleAdDismissed();
              } else {
                handleAdFailedOrNotReady();
              }
            }
          }
        });
      } catch (err) {
        console.error(err);
        handleAdFailedOrNotReady();
      }
    } else {
      setMockAdProviderState({
        onComplete: () => {
          if (onStart) onStart();
          if (onEnd) onEnd();
          callback();
        },
        onDismissed: () => {
          if (onEnd) onEnd();
          showAlert("يجب مشاهدة الإعلان كاملاً للحصول على المكافأة.", "تنبيه");
        },
      });
    }
  };

  const handleLeaveGame = () => {
    playSound("clickOpen");
    const isGameActive =
      room?.gameState === "guessing" ||
      room?.gameState === "discussion" ||
      room?.gameState === "custom_image_upload" ||
      room?.gameState === "bomb_party_setup" ||
      room?.gameState === "bomb_party_playing" ||
      room?.gameState === "bomb_party_finished" ||
      room?.gameState === "xo_playing" ||
      room?.gameState === "xo_finished" ||
      room?.gameState === "iq_playing" ||
      room?.gameState === "iq_finished" ||
      room?.gameState === "dots_playing" ||
      room?.gameState === "dots_finished" ||
      room?.gameState === "bus_complete_setup" ||
      room?.gameState === "bus_complete_spin" ||
      room?.gameState === "bus_complete_playing" ||
      room?.gameState === "bus_complete_evaluating" ||
      room?.gameState === "hand_playing" ||
      room?.gameState === "hand_finished" ||
      room?.gameState?.startsWith("speed_cups_") ||
      room?.gameState === "wordle_setup" ||
      room?.gameState === "wordle_playing" ||
      room?.gameState === "wordle_finished" ||
      room?.gameState === "connect_four_words_setup" ||
      room?.gameState === "connect_four_words_playing" ||
      room?.gameState === "connect_four_words_finished" ||
      room?.gameState?.startsWith("space_war_") ||
      room?.gameState === "puzzle_setup" ||
      room?.gameState === "puzzle_playing" ||
      room?.gameState === "puzzle_finished"||
      room?.gameState === "beach_race_setup" ||
      room?.gameState === "beach_race_playing" ||
      room?.gameState === "beach_race_finished";

    const me = room?.players.find((p) => p.id === socket?.id);

    // Only show confirmation if the game is active (playing)
    if (isGameActive) {
      let message = "هل تريد حقاً مغادرة اللعبة والعودة للرئيسية؟";
      if (me?.useToken && (room?.gameState === "guessing" || room?.gameState === "discussion")) {
        message =
          "تحذير: إذا انسحبت الآن، ستخسر التخمينة المستخدمة! وتعتبر خاسر. هل تريد حقاً مغادرة اللعبة والعودة للرئيسية؟";
      } else if (
        room?.gameState === "guessing" ||
        room?.gameState === "discussion" ||
        room?.gameState === "custom_image_upload" ||
        room?.gameState === "bomb_party_playing" ||
        room?.gameState?.startsWith("space_war_")
      ) {
        message =
          "انسحابك من المبارة تعتبر خاسر. هل تريد حقاً مغادرة اللعبة والعودة للرئيسية؟";
      }

      showConfirm(
        message,
        () => {
          isIntentionalLeaveRef.current = true;
          socket?.emit("intentional_leave", { roomId });
          let forced = false;
          const forceTimeout = setTimeout(() => {
            forced = true;
            resetToHome();
          }, 600);
          socket?.emit("leave_room", { roomId }, () => {
            if (!forced) {
              clearTimeout(forceTimeout);
              resetToHome();
            }
          });
        },
        "تأكيد الخروج",
      );
      return;
    }

    isIntentionalLeaveRef.current = true;
    socket?.emit("intentional_leave", { roomId });
    let forced = false;
    const forceTimeout = setTimeout(() => {
      forced = true;
      resetToHome();
    }, 600);
    socket?.emit("leave_room", { roomId }, () => {
      if (!forced) {
        clearTimeout(forceTimeout);
        resetToHome();
      }
    });
  };

  const handleUseCard = (
    type:
      | "quick_guess"
      | "hint"
      | "word_length"
      | "word_count"
      | "time_freeze"
      | "spy_lens",
  ) => {
    if (cooldowns[type] > 0) return;
    playSound("clickOpen");

    const hasFreeUse = (ownedHelpers[type] || 0) > 0;

    // Use card immediately ONLY if it's quick guess, already ready from an ad, or player has Pro package
    if (
      type === "quick_guess" ||
      readyPowerUps.includes(type) ||
      hasProPackage
    ) {
      // Actually use the card FIRST so the server sees we still have the free use
      socket?.emit("use_card", {
        roomId,
        cardType: type,
        serial: playerSerial,
        isAdReward: readyPowerUps.includes(type),
      });

      // Remove from ready
      if (type !== "quick_guess" && readyPowerUps.includes(type)) {
        setReadyPowerUps((prev) => prev.filter((p) => p !== type));
      }

      // Hint has 150s cooldown (2.5m)
      if (type === "hint") {
        const currentPlayer = room?.players.find((p) => p.id === socket?.id);
        if ((currentPlayer?.hintCount || 0) < 1) {
          setCooldowns((prev) => ({ ...prev, [type]: 150 }));
        }
      }
    } else {
      // Set active power-up and show confirmation modal
      setActivePowerUp(type);
      setShowAdConfirmation(true);
    }
  };

  // Update Ad Modal logic to include confirmation
  // ... (Inside renderModals)
  // I need to update the modal content to show confirmation first, then the ad.
  // Actually, let's add a new state `showAdConfirmation`

  const me = room?.players.find((p) => p.id === socket?.id);
  const opponent = room?.players.find((p) => p.id !== socket?.id);

  const consensusReached =
    room?.players.length === 2 &&
    room.players[0].selectedCategory === room.players[1].selectedCategory &&
    room.players[0].selectedLevel === room.players[1].selectedLevel &&
    room.players[0].selectedCategory !== null;

  const renderLuckyWheelModal = () => {
    const segments = SPIN_REWARDS_UI;
    const segmentAngle = 360 / segments.length;

    return (
      <AnimatePresence>
        {showLuckyWheelModal && (
          <div
            className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={toggleLuckyWheel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="bg-pink-500 p-4 border-b-4 border-black flex justify-between items-center"
                dir="ltr"
              >
                <h2 className="text-white text-2xl font-black flex items-center gap-2">
                  <Disc className="w-6 h-6 animate-spin-slow" />
                  عجلة الحظ
                </h2>
                <button
                  onClick={toggleLuckyWheel}
                  className="absolute top-3 right-3 w-8 h-8 bg-white text-black border-4 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 flex flex-col items-center gap-4">
                {/* The Wheel */}
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-8 h-8 text-pink-600 drop-shadow-md">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-current mx-auto" />
                  </div>

                  {/* Wheel Body */}
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={
                      localIsSpinning
                        ? { duration: 5, ease: [0.15, 0, 0.15, 1] }
                        : { duration: 0 }
                    }
                    className="w-full h-full rounded-full border-4 border-black overflow-hidden relative"
                    style={{
                      background: `conic-gradient(from ${-segmentAngle / 2}deg, ${segments.map((s, i) => `${s.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(", ")})`,
                    }}
                  >
                    {/* Icons & Labels on segments */}
                    {segments.map((s, i) => {
                      const angle = i * segmentAngle;
                      return (
                        <div
                          key={`icon-${s.id}`}
                          className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start pt-2"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="text-white"
                              style={{ transform: `rotate(${-angle}deg)` }}
                            >
                              {s.icon}
                            </div>
                            <div
                              className="text-white flex items-center justify-center"
                              style={{
                                height: "60px",
                                width: "20px",
                                writingMode: "vertical-rl",
                                textOrientation: "mixed",
                              }}
                            >
                              <span className="text-[9px] md:text-[9px] font-bold whitespace-nowrap leading-none text-center uppercase tracking-tighter">
                                {s.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Center Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-black rounded-full z-20 flex items-center justify-center">
                    <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Info & Button */}
                <div className="w-full text-center space-y-4">
                  {showReward && spinResult && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-1 mb-2 bg-yellow-100 border-2 border-yellow-400 rounded-xl"
                    >
                      <p className="text-sm font-bold text-yellow-800">
                        مبروك! كسبت:
                      </p>
                      <p className="text-xl font-black text-yellow-600">
                        {spinResult.reward.label}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-red-600">
                      جميع الهدايا التي تحصل عليها يجب أن تستخدم في نفس اليوم.
                    </p>
                    <p className="text-sm font-bold text-gray-500">
                      المحاولات المتبقية:{" "}
                      {isAdmin
                        ? "غير محدود"
                        : `${Math.max(0, 11 - spinStatus.dailySpinCount)} / 11`}
                    </p>
                    <button
                      onClick={handleSpinClick}
                      disabled={
                        isSpinning ||
                        localIsSpinning ||
                        spinCooldown > 0 ||
                        isSpinAdLoading
                      }
                      className={`w-full py-2 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 ${
                        isSpinning ||
                        localIsSpinning ||
                        spinCooldown > 0 ||
                        isSpinAdLoading
                          ? "bg-gray-300 cursor-not-allowed"
                          : spinStatus.hasFreeSpin
                            ? "bg-accent-green text-white hover:brightness-110"
                            : "bg-accent-blue text-white hover:brightness-110"
                      }`}
                    >
                      {isSpinning || localIsSpinning ? (
                        "جاري التدوير..."
                      ) : isSpinAdLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> جاري
                          تجهيز الإعلان...
                        </div>
                      ) : spinCooldown > 0 ? (
                        <>انتظر {spinCooldown} ثانية...</>
                      ) : !hasUsedFreeSpin && spinStatus.hasFreeSpin ? (
                        <>لف العجلة (مجاناً)</>
                      ) : (
                        <>
                          <span className="text-2xl">📺</span>
                          لف العجلة (مشاهدة إعلان)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderDailyQuestModal = () => {
    let effectiveStreak = dailyQuestStreak;
    const now = Date.now();

    if (lastDailyClaim !== 0 && !isSameDay(now, lastDailyClaim)) {
      const isConsecutiveDay = (d1: number, d2: number) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        date2.setUTCDate(date2.getUTCDate() + 1);
        return (
          date1.getUTCFullYear() === date2.getUTCFullYear() &&
          date1.getUTCMonth() === date2.getUTCMonth() &&
          date1.getUTCDate() === date2.getUTCDate()
        );
      };

      if (!isConsecutiveDay(now, lastDailyClaim) || effectiveStreak > 7) {
        effectiveStreak = 1;
      }
    } else if (effectiveStreak > 7) {
      effectiveStreak = 8; // For display purposes when day 7 is claimed today
    }

    return (
      <AnimatePresence>
        {showDailyQuestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[6000] flex items-center justify-center p-4"
            onClick={toggleDailyQuests}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border-4 border-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 text-center relative shrink-0 bg-accent-yellow border-b-4 border-black">
                <button
                  onClick={toggleDailyQuests}
                  className="absolute top-3 right-3 w-8 h-8 bg-white text-black border-4 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Sparkles className="w-8 h-8 text-accent-blue" />
                </div>
                <h2 className="text-2xl font-black text-black mb-1">
                  المهام اليومية
                </h2>
                <p className="text-black/60 text-sm font-bold">
                  ادخل كل يوم واستلم هداياك!
                </p>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {DAILY_QUEST_REWARDS.map((reward, index) => {
                    const day = index + 1;
                    const isClaimed =
                      day < effectiveStreak && lastDailyClaim !== 0;
                    const isCurrent = day === effectiveStreak;
                    const canClaim =
                      isCurrent &&
                      (lastDailyClaim === 0 || !isSameDay(now, lastDailyClaim));

                    return (
                      <div
                        key={day}
                        className={`relative flex flex-col items-center p-1 rounded-2xl border-4 transition-all ${
                          isClaimed
                            ? "bg-gray-100 border-gray-300 opacity-50"
                            : isCurrent
                              ? "bg-accent-yellow-light border-accent-yellow scale-105 shadow-lg"
                              : "bg-white border-black"
                        } ${index === 6 ? "col-span-2" : ""}`}
                      >
                        <div className="text-xs font-black mb-1">
                          اليوم {day}
                        </div>
                        <div className="text-lg mb-1">🎁</div>
                        <div className="text-[10px] font-bold text-accent-blue">
                          {reward} XP
                        </div>
                        {isClaimed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                            <Check className="w-8 h-8 text-accent-green drop-shadow-md" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {effectiveStreak <= 8 && (
                  <button
                    disabled={
                      isChestOpening ||
                      (lastDailyClaim !== 0 && isSameDay(now, lastDailyClaim))
                    }
                    onClick={handleClaimDailyQuest}
                    className={`w-full py-4 rounded-2xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all border-4 border-black ${
                      lastDailyClaim !== 0 && isSameDay(now, lastDailyClaim)
                        ? "btn-primary cursor-not-allowed"
                        : "bg-accent-green text-white hover:-translate-y-1 active:translate-y-0"
                    }`}
                  >
                    {isChestOpening
                      ? "جاري الفتح..."
                      : lastDailyClaim !== 0 && isSameDay(now, lastDailyClaim)
                        ? "تم الاستلام اليوم ✅"
                        : "استلم جائزة اليوم! 🎁"}
                  </button>
                )}
              </div>

              {/* Chest Opening Animation Overlay */}
              <AnimatePresence>
                {isChestOpening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md z-[7000] flex flex-col items-center justify-center p-6 text-center"
                  >
                    {!chestReward ? (
                      <div className="space-y-6">
                        {!isCycling ? (
                          <motion.div
                            onAnimationStart={() => playSound("shakingBox")}
                            animate={{
                              rotate: [0, -10, 10, -10, 10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="text-8xl cursor-pointer"
                            onClick={startCycling}
                          >
                            🎁
                          </motion.div>
                        ) : (
                          <div className="w-40 h-40 bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-4">
                            <div className="scale-[5] transform flex items-center justify-center">
                              {cyclingReward ? (
                                HELPER_ITEMS.find(
                                  (h) => h.id === cyclingReward.id,
                                )?.icon || cyclingReward.icon
                              ) : (
                                <span className="text-2xl">❓</span>
                              )}
                            </div>
                          </div>
                        )}
                        <h3 className="text-2xl font-black text-white">
                          {isCycling
                            ? "جاري اختيار الجائزة..."
                            : "اضغط على الصندوق لفتحه!"}
                        </h3>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-6"
                      >
                        <div className="text-8xl mb-4 animate-bounce">✨</div>
                        <h3 className="text-3xl font-black text-white mb-2">
                          مبروك!
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                            <div className="text-xl font-black">
                              +{chestReward.xp} XP
                            </div>
                          </div>
                          {chestReward.helper &&
                            chestReward.helper.id !== "bonus_xp" && (
                              <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black flex items-center justify-center gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl border-2 border-black flex items-center justify-center">
                                  <div className="scale-[2.5] transform flex items-center justify-center">
                                    {HELPER_ITEMS.find(
                                      (h) => h.id === chestReward.helper.id,
                                    )?.icon || chestReward.helper.icon}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-bold text-gray-500">
                                    وسيلة مساعدة
                                  </div>
                                  <div className="text-xl font-black">
                                    {chestReward.helper.name}
                                  </div>
                                </div>
                              </div>
                            )}
                          {chestReward.helper &&
                            chestReward.helper.id === "bonus_xp" && (
                              <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black flex items-center justify-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div className="text-xl font-black">
                                  تم تحويل الوسيلة إلى 100 XP
                                </div>
                              </div>
                            )}
                          {chestReward.tokens > 0 && (
                            <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                              <div className="text-xl font-black">
                                +{chestReward.tokens} تخمينات
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setIsChestOpening(false);
                            setChestReward(null);
                            toggleDailyQuests();
                          }}
                          className="w-full btn-game btn-success flex items-center justify-center mt-6 px-8 py-3 bg-white text-accent-blue rounded-xl font-black text-lg shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          رائع!
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderCheckoutPage = () => (
    <AnimatePresence>
      {showCheckoutPage && selectedWalletItem && (
        <CheckoutPage
          item={shopItems.find((i) => i.id === selectedWalletItem)}
          player={me}
          onBack={() => setShowCheckoutPage(false)}
          onPay={handleProcessPayment}
          isProcessing={isInitiatingPayment}
        />
      )}
    </AnimatePresence>
  );

  const renderComplaintModal = () => (
    <AnimatePresence>
      {showComplaintModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="card-game p-6 w-full max-w-sm space-y-4"
          >
            <h2 className="text-2xl font-black text-main text-center">
              الشكاوي والمقترحات
            </h2>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-game bg-gray-50 focus:border-accent-purple outline-none min-h-[150px] resize-none"
              placeholder="اكتب شكواك أو مقترحك هنا..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const filtered = filterProfanity(complaintText);
                  socket?.emit(
                    "send_complaint",
                    { text: filtered },
                    (res: any) => {
                      if (res.success) {
                        setComplaintText("");
                        setShowComplaintModal(false);
                      } else {
                        alert(res.error);
                      }
                    },
                  );
                }}
                disabled={!canSendComplaint}
                className={`flex-1 btn-game ${canSendComplaint ? "btn-success" : "btn-disabled"} py-3 text-sm`}
              >
                {canSendComplaint ? "إرسال" : "تم الإرسال اليوم"}
              </button>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="flex-1 btn-game btn-primary py-3 text-sm"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.subject || !contactForm.message) {
      showAlert("يرجى ملء جميع الحقول", "تنبيه");
      return;
    }
    setIsSendingContact(true);
    try {
      const response = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: filterProfanity(contactForm.name),
          subject: filterProfanity(contactForm.subject),
          message: filterProfanity(contactForm.message),
          playerSerial,
        }),
      });
      if (response.ok) {
        showAlert(
          "تم إرسال رسالتك بنجاح! سنقوم بالرد عليك في أقرب وقت.",
          "نجاح",
        );
        setShowContactModal(false);
        setContactForm({ name: "", subject: "", message: "" });
      } else {
        const data = await response.json();
        showAlert(
          data.error || "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقاً.",
          "خطأ",
        );
      }
    } catch (err) {
      console.error("Contact error:", err);
      showAlert("حدث خطأ في الاتصال بالسيرفر", "خطأ");
    } finally {
      setIsSendingContact(false);
    }
  };

  const renderContactModal = () => (
    <AnimatePresence>
      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-accent-blue p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black">اتصل بنا</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-accent-blue outline-none transition-all"
                  placeholder="اسمك الكامل"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  الموضوع
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-accent-blue outline-none transition-all"
                  placeholder="موضوع الرسالة"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  الرسالة
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-accent-blue outline-none transition-all h-32 resize-none"
                  placeholder="اكتب رسالتك هنا..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSendingContact}
                className={`w-full py-4 rounded-2xl font-black text-xl shadow-lg transform active:scale-95 transition-all ${
                  isSendingContact
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-accent-blue hover:bg-blue-600 text-white"
                }`}
              >
                {isSendingContact ? "جاري الإرسال..." : "إرسال الرسالة"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPlayerSearchModal = () => {
    return (
      <AnimatePresence>
        {showPlayerSearchModal && (
          <div
            className="fixed inset-0 bg-black/60 z-[5000] flex items-center justify-center p-4"
            onClick={() => setShowPlayerSearchModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-game w-full max-w-md rounded-2xl md:rounded-[30px] border-4 border-[#F2DEB5] shadow-2xl overflow-hidden flex flex-col h-[65vh] max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#4A2C11] p-4 flex justify-between items-center relative border-b-2 border-amber-900/50 shadow-md z-10 w-full shrink-0">
                <button
                  onClick={() => {
                    playSound("clickClose");
                    setShowPlayerSearchModal(false);
                  }}
                  className="top-3 right-3 w-8 h-8 bg-white text-black border-4 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-lg md:text-xl text-[#F2DEB5]">
                    ابحث عن اللاعبين بالأسم
                  </h2>
                  <Search className="w-5 h-5 md:w-6 md:h-6 text-[#F2DEB5]" />
                </div>
              </div>

              <div className="p-4 bg-amber-50 shrink-0 border-b-2 border-game relative z-10">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    dir="rtl"
                    type="text"
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    placeholder="اكتب اسم اللاعب للبحث..."
                    className="w-full bg-white border-2 border-game rounded-xl py-3 pr-10 pl-4 font-bold text-brown-dark focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm md:text-base outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto w-full p-4 md:p-4 bg-gray-50 custom-scrollbar">
                {isSearchingPlayers ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-70">
                    <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-amber-800 font-bold">جاري البحث...</p>
                  </div>
                ) : playerSearchQuery.trim().length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-50 text-center px-4">
                    <Users className="w-20 h-20 text-amber-900/20 mb-4" />
                    <p className="text-amber-900 font-bold text-lg">
                      ابحث عن أي لاعب باستخدام اسمه
                    </p>
                    <p className="text-sm text-amber-900/70 mt-2">
                      ستظهر النتائج هنا فوراً
                    </p>
                  </div>
                ) : playerSearchResults.filter((p) => p.serial !== playerSerial)
                    .length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-3 w-full content-start">
                    {playerSearchResults
                      .filter((p) => p.serial !== playerSerial)
                      .map((player, idx) => (
                        <div
                          key={player.serial || player.id || `player-${idx}`}
                          className="bg-white border-2 border-game p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-amber-50/50 transition-colors"
                          onClick={() => {
                            playSound("clickOpen");
                            setShowPlayerSearchModal(false);
                            openPlayerProfile(player.serial);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12">
                                {renderAvatarContent(
                                  player.avatar,
                                  player.level || 1,
                                  false,
                                  false,
                                  player.selectedFrame,
                                  player.serial,
                                )}
                              </div>
                              <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm z-[200]">
                                {player.level || 1}
                              </div>
                            </div>
                            <span
                              className="font-bold text-brown-dark truncate max-w-[100px] text-sm md:text-base"
                              dir="auto"
                            >
                              {player.name}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound("clickOpen");
                                setShowGiftModal({
                                  serial: player.serial,
                                  name: player.name,
                                  avatar: player.avatar,
                                  level: player.level || 1,
                                  selectedFrame: player.selectedFrame,
                                });
                              }}
                              className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 text-xs rounded-full font-bold shadow-sm border border-purple-200 transition-colors"
                              title="إرسال هدية"
                            >
                              <Gift className="w-4 h-4" />
                            </button>
                            {!player.hideFriendRequests &&
                              !friendsList.some(
                                (f) => f.serial === player.serial,
                              ) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playSound("clickOpen");
                                    handleAddFriend(player.serial);
                                  }}
                                  className="bg-green-100 hover:bg-green-200 text-green-700 p-2 text-xs rounded-full font-bold shadow-sm border border-green-200 transition-colors"
                                  title="إضافة صديق"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-70">
                    <Search className="w-16 h-16 text-amber-900/30 mb-4" />
                    <p className="text-amber-900 font-bold text-lg">
                      لا يوجد لاعب بهذا الأسم!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderFriendsModal = () => {
    const sortedFriends = [...friendsList].sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return (b.level || 1) - (a.level || 1);
    });

    const filteredFriends = sortedFriends.filter((f) => {
      const name = (f.name || "").toLowerCase();
      const query = friendSearchQuery.toLowerCase();
      return (
        name.includes(query) ||
        normalizeEgyptian(name).includes(normalizeEgyptian(query))
      );
    });

    return (
      <AnimatePresence>
        {showFriendsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleshowFriendsModal}
            className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-game p-4 w-full max-w-sm flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-main flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  الأصدقاء
                  <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full text-black">
                    {friendsTotal}
                  </span>
                </h2>
                <button
                  onClick={handleshowFriendsModal}
                  className="w-7 h-7 bg-white text-black border-4 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-3 relative">
                <input
                  type="text"
                  placeholder="ابحث بالاسم..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-2 pl-3 pr-10 text-sm font-bold text-black placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
                <Search className="w-5 h-5 text-gray-500 absolute right-3 top-2.5" />
              </div>

              <div
                className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar"
                onScroll={(e) => {
                  const bottom =
                    e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
                    e.currentTarget.clientHeight + 5;
                  if (
                    bottom &&
                    !friendsLoading &&
                    friendsList.length < friendsTotal
                  ) {
                    setFriendsPage((prev) => prev + 1);
                  }
                }}
              >
                {filteredFriends.length === 0 && !friendsLoading ? (
                  <div className="text-center py-8 text-brown-muted font-bold">
                    لا يوجد أصدقاء.
                  </div>
                ) : (
                  <>
                    {filteredFriends.map((friend, idx) => (
                      <div
                        key={friend.serial || `friend-${idx}`}
                        className="bg-gray-50 border-2 border-gray-100 p-2 rounded-xl flex items-center justify-between shadow-sm"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openPlayerProfile(friend.serial)}
                        >
                          <div className="relative">
                            <div className="w-10 h-10">
                              {renderAvatarContent(
                                friend.avatar,
                                friend.level || 1,
                                false,
                                friend.isOnline,
                                friend.selectedFrame,
                                friend.serial,
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-black text-sm text-main flex items-center gap-1">
                              {friend.name}
                              {!!friend.isAdmin && (
                                <Shield className="w-4 h-4 text-purple-500 fill-purple-200" />
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 bg-gray-200 px-1.5 rounded-full">
                              Lvl {friend.level || 1}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {friend.isOnline && !friend.isAdmin && (
                            <button
                              onClick={() => {
                                socket?.emit(
                                  "send_friend_challenge",
                                  {
                                    serial: playerSerial,
                                    targetSerial: friend.serial,
                                  },
                                  (res: any) => {
                                    if (res.success) {
                                      showAlert("تم إرسال دعوة التحدي", "نجاح");
                                      setIsSearching(true); // Put them in search UI
                                      setRoomId("waiting_friend"); // Dummy room UI
                                    } else {
                                      showAlert(
                                        res.error ||
                                          res.message ||
                                          "فشل إرسال التحدي",
                                        "خطأ",
                                      );
                                      if (
                                        res.error === "الصديق في مباراة حالياً"
                                      ) {
                                        setFriendsList((prev) =>
                                          prev.map((f) =>
                                            f.serial === friend.serial
                                              ? { ...f, isInMatch: true }
                                              : f,
                                          ),
                                        );
                                      }
                                    }
                                  },
                                );
                              }}
                              className={`${friend.isInMatch ? "bg-orange-500 hover:bg-orange-600 cursor-not-allowed" : "bg-accent-green hover:brightness-110"} text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all`}
                              title={friend.isInMatch ? "في مباراة" : "تحدي"}
                              disabled={friend.isInMatch}
                            >
                              {friend.isInMatch ? (
                                <Swords className="w-4 h-4 text-white animate-pulse" />
                              ) : (
                                <Gamepad2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {!friend.isAdmin && (
                            <button
                              onClick={() => {
                                playSound("clickOpen");
                                setShowGiftModal({
                                  serial: friend.serial,
                                  name: friend.name,
                                  avatar: friend.avatar,
                                  level: friend.level || 1,
                                  selectedFrame: friend.selectedFrame,
                                });
                              }}
                              className="bg-pink-50 hover:bg-pink-100 text-pink-500 border border-pink-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                              title="إرسال هدايا"
                            >
                              <Gift className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveFriend(friend.serial)}
                            className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                            title="حذف صديق"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {friendsLoading && (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderFriendRequestsModal = () => (
    <AnimatePresence>
      {showFriendRequestsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFriendRequestsModal(false)}
          className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card-game p-4 w-full max-w-sm flex flex-col max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-main flex items-center gap-2">
                <div className="flex gap-1 items-center relative">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  الإشعارات
                  {friendRequests.length +
                    collectionNotifications.length +
                    systemMessages.length +
                    likeNotifications.length +
                    giftNotifications.length +
                    friendAcceptedNotifications.length >
                    0 && (
                    <span className="flex items-center justify-center bg-red-500 text-white min-w-[20px] h-5 px-1.5 mx-2 rounded-full text-[11px] font-black shadow-md">
                      {friendRequests.length +
                        collectionNotifications.length +
                        systemMessages.length +
                        likeNotifications.length +
                        giftNotifications.length +
                        friendAcceptedNotifications.length}
                    </span>
                  )}
                </div>
              </h2>
              <button
                onClick={() => setShowFriendRequestsModal(false)}
                className="w-8 h-8 bg-white text-black border-4 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full border-t border-black/20 my-2 mt-0.5"></div>
            <div
              className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar"
              dir="rtl"
            >
              {friendRequests.length === 0 &&
              collectionNotifications.length === 0 &&
              systemMessages.length === 0 &&
              likeNotifications.length === 0 &&
              giftNotifications.length === 0 &&
              friendAcceptedNotifications.length === 0 ? (
                <div className="text-center py-8 text-brown-muted font-bold">
                  لا توجد إشعارات حالياً.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Friend Accepted Notifications Section */}
                  {friendAcceptedNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <h3 className="font-black text-sm text-main">
                          أصدقاء جدد
                        </h3>
                      </div>
                      <AnimatePresence>
                        {friendAcceptedNotifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                          >
                            <div className="flex items-center gap-3 relative z-10 w-full">
                              <div className="relative w-10 h-10">
                                {renderAvatarContent(
                                  notification.senderAvatar,
                                  notification.senderLevel || 1,
                                  false,
                                  false,
                                  undefined,
                                  notification.senderSerial,
                                )}
                                <div className="absolute -bottom-2 -right-1 bg-yellow-400 text-black text-[9px] font-bold px-1 py-0.5 rounded-full border-b-2 border-black min-w-[20px] text-center z-30">
                                  {notification.senderLevel || 1}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-black text-sm text-main truncate leading-tight mb-0.5">
                                  {notification.senderName}
                                </div>
                                <div className="text-xs font-bold text-green-600 truncate">
                                  وافق علي طلب الصداقة! 🤝
                                </div>
                                <div className="text-[10px] text-brown-muted mt-1 font-bold">
                                  {new Date(
                                    notification.timestamp,
                                  ).toLocaleString("ar-EG", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSound("clickClose");
                                  socket?.emit(
                                    "dismiss_friend_accepted_notification",
                                    {
                                      serial: playerSerial,
                                      notificationId: notification.id,
                                    },
                                    (res: any) => {
                                      if (res.success) {
                                        setFriendAcceptedNotifications((prev) =>
                                          prev.filter(
                                            (n) => n.id !== notification.id,
                                          ),
                                        );
                                      }
                                    },
                                  );
                                }}
                                className="w-7 h-7 bg-red-100 text-red-600 border border-red-200 rounded-lg flex items-center justify-center hover:bg-red-200 active:scale-95 transition-all shrink-0 ml-1"
                                title="حذف"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Like Notifications Section */}
                  {likeNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <h3 className="font-black text-sm text-main">
                          الإعجابات
                        </h3>
                      </div>

                      {likeNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="bg-red-50 border-2 border-red-100 p-2 rounded-xl flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10">
                              {renderAvatarContent(
                                notification.senderAvatar,
                                notification.senderLevel || 1,
                                false,
                                false,
                                undefined,
                                notification.senderSerial,
                              )}
                            </div>
                            <div>
                              <div className="font-black text-sm text-main">
                                {notification.senderName}
                              </div>
                              <div className="text-[10px] text-red-500 flex items-center gap-1">
                                <Heart className="w-2 h-2 fill-red-500" /> أعجب
                                ببروفايلك
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReplyLike(notification)}
                              className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-3 py-1.5 font-bold rounded-lg transition-colors shadow-sm active:scale-95"
                            >
                              رد الإعجاب
                            </button>
                            <button
                              onClick={() => {
                                socket?.emit(
                                  "dismiss_like_notification",
                                  {
                                    serial: playerSerial,
                                    notificationId: notification.id,
                                  },
                                  (res: any) => {
                                    if (res.success) {
                                      setLikeNotifications((prev) =>
                                        prev.filter(
                                          (n) => n.id !== notification.id,
                                        ),
                                      );
                                    }
                                  },
                                );
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* System Messages Section */}
                  {systemMessages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-main" />
                        <h3 className="font-black text-sm text-main">
                          ردود الدعم الفني
                        </h3>
                      </div>

                      {systemMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-yellow-50 border-2 border-yellow-200 p-3 rounded-xl flex flex-col gap-2 shadow-sm"
                        >
                          <p className="text-sm font-bold text-gray-800 break-words whitespace-pre-wrap">
                            {msg.message}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-brown-muted">
                              {new Date(msg.timestamp).toLocaleString("ar-EG")}
                            </span>
                            <button
                              onClick={() => {
                                socket?.emit(
                                  "mark_admin_message_read",
                                  { serial: playerSerial, messageId: msg.id },
                                  () => {},
                                );
                                setSystemMessages((prev) =>
                                  prev.filter((m) => m.id !== msg.id),
                                );
                              }}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 font-bold rounded-lg transition-colors"
                            >
                              فهمت
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Friend Requests Section */}
                  {giftNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-pink-500" />
                        <h3 className="font-black text-sm text-main">
                          هدايا مرسلة لك
                        </h3>
                      </div>

                      {giftNotifications.map((notif) => {
                        const helpersArray = Object.entries(
                          notif.gifts?.helpers || {},
                        )
                          .map(([id, amount]) => {
                            const h = HELPER_ITEMS.find(
                              (item) => item.id === id,
                            );
                            return h ? `${amount} ${h.name}` : null;
                          })
                          .filter(Boolean);

                        const itemsString = [
                          notif.gifts?.keys
                            ? `${notif.gifts.keys} مفاتيح`
                            : null,
                          notif.gifts?.tokens
                            ? `${notif.gifts.tokens} تخمينات`
                            : null,
                          ...helpersArray,
                        ]
                          .filter(Boolean)
                          .join(" | ");

                        return (
                          <div
                            key={notif.id}
                            className="bg-pink-50 border-2 border-pink-100 p-2 rounded-xl flex flex-col justify-between shadow-sm gap-2 mt-2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10">
                                {renderAvatarContent(
                                  notif.senderAvatar,
                                  1,
                                  false,
                                  false,
                                  undefined,
                                  notif.senderSerial,
                                )}
                              </div>
                              <div>
                                {notif.gifts?.message ? (
                                  <div className="font-black text-sm text-main leading-tight mb-1">
                                    {notif.gifts.message}
                                  </div>
                                ) : (
                                  <div className="font-black text-sm text-main">
                                    {notif.senderName} أرسل لك هدايا:
                                  </div>
                                )}
                                <div className="text-xs text-pink-600 font-bold mt-1">
                                  🎁 ({itemsString})
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  socket?.emit(
                                    "receive_gift",
                                    {
                                      serial: playerSerial,
                                      notificationId: notif.id,
                                    },
                                    (res: any) => {
                                      if (res.success) {
                                        setGiftNotifications((prev) =>
                                          prev.filter((n) => n.id !== notif.id),
                                        );
                                      }
                                    },
                                  );
                                }}
                                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-1.5 rounded-lg flex items-center justify-center transition-colors shadow-sm active:scale-95 text-xs font-bold w-full"
                              >
                                إستلام الهدايا
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {friendRequests.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="w-4 h-4 text-main" />
                        <h3 className="font-black text-sm text-main">
                          طلبات الصداقة
                        </h3>
                      </div>

                      {friendRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-orange-50 border-2 border-orange-100 p-2 rounded-xl flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10">
                              {renderAvatarContent(
                                req.avatar,
                                req.level || 1,
                                false,
                                false,
                                undefined,
                                req.serial,
                              )}
                            </div>
                            <div>
                              <div className="font-black text-sm text-main">
                                {req.name}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                مستوى {req.level || 1}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptFriendRequest(req.id)}
                              className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm active:scale-95"
                              title="قبول"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectFriendRequest(req.id)}
                              className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm active:scale-95"
                              title="رفض"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Collection Notifications Section */}
                  {collectionNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-main" />
                        <h3 className="font-black text-sm text-main">
                          مكافآت تجميع صور التخمين
                        </h3>
                      </div>

                      {collectionNotifications.map((notification) => {
                        const imageSrc = apiUrl(`/api/image/${encodeURIComponent(notification.category_id)}/${encodeURIComponent(notification.image_name)}`);
                        const normName = normalizeEgyptian(
                          notification.image_name,
                        ).toLowerCase();
                        const myCount =
                          playerCollection.find(
                            (c) => c.image_name === normName,
                          )?.count || 0;

                        return (
                          <div
                            key={notification.id}
                            className="bg-blue-50 border-2 border-blue-100 p-3 rounded-xl flex flex-col gap-2 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 shrink-0">
                                {renderAvatarContent(
                                  notification.sender_avatar,
                                  notification.sender_level || 1,
                                  false,
                                  false,
                                  undefined,
                                  notification.sender_serial,
                                )}
                              </div>
                              <div className="flex-1">
                                {notification.type === "request" ? (
                                  <div className="text-sm font-bold text-main leading-tight">
                                    <span className="text-blue-700">
                                      {notification.sender_name}
                                    </span>{" "}
                                    يسألك إذا كان لديك صورة{" "}
                                    <span className="text-accent-orange font-black">
                                      "{notification.image_name}"
                                    </span>{" "}
                                    إضافية.
                                  </div>
                                ) : (
                                  <div className="text-sm font-bold text-main leading-tight">
                                    <span className="text-green-700">
                                      {notification.sender_name}
                                    </span>{" "}
                                    أرسل لك صورة{" "}
                                    <span className="text-accent-orange font-black">
                                      "{notification.image_name}"
                                    </span>
                                    .
                                  </div>
                                )}
                              </div>
                              <div className="w-12 h-12 bg-white rounded-lg border-2 border-black overflow-hidden shrink-0 shadow-sm relative">
                                <img
                                  src={imageSrc}
                                  alt={notification.image_name}
                                  className="w-full h-full object-cover"
                                />
                                {notification.type === "request" && (
                                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 rounded-tl-md font-black">
                                    {myCount <= 5
                                      ? `${myCount}/5`
                                      : `5/5+${myCount - 5}`}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-1">
                              {notification.type === "request" ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleRespondCollectionRequest(
                                        notification.id,
                                        "send",
                                      )
                                    }
                                    className="bg-accent-blue text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors hover:bg-blue-600 active:scale-95"
                                  >
                                    إرسال الصورة
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRespondCollectionRequest(
                                        notification.id,
                                        "delete",
                                      )
                                    }
                                    className="bg-gray-200 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-300 active:scale-95"
                                  >
                                    حذف
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleReceiveCollectionImage(
                                      notification.id,
                                    )
                                  }
                                  className="bg-green-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors hover:bg-green-600 active:scale-95"
                                >
                                  استلم الصورة
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPlayerProfileModal = () => {
    if (!selectedProfileSerial || !selectedProfileData) return null;

    const data = selectedProfileData;
    const isPro = !!data.activeProPackage;

    // Check friend status
    const friendStatus = data.friendStatus || "none";

    const handleLikePlayer = () => {
      if (!socket || !selectedProfileSerial || !playerSerial) return;
      if (data.serial === playerSerial) return;

      socket.emit(
        "like_player",
        { targetSerial: selectedProfileSerial, giverSerial: playerSerial },
        (res: any) => {
          if (res.success) {
            playSound("clickOpen");
            setSelectedProfileData((prev: any) => ({
              ...prev,
              likes: res.newLikes,
              hasLikedToday: true,
              keys: prev.keys + res.keysRewarded,
            }));

            if (res.keysRewarded) {
              showAlert(
                `أعطيت ${selectedProfileData.name} مفتاح 🗝️!`,
                "تم الإعجاب",
              );
            }
          } else {
            showAlert(res.error, "خطأ");
          }
        },
      );
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9000] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              playSound("clickClose");
              setSelectedProfileSerial(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-modal-theme rounded-[2xl] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col"
            dir="rtl"
          >
            <div className="bg-purple-600 p-3 pt-3 py-2 text-center relative shrink-0 border-b-4 border-black">
              <button
                onClick={() => {
                  playSound("clickClose");
                  setSelectedProfileSerial(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-24 h-24 mx-auto mb-2">
                {renderAvatarContent(
                  data.avatar,
                  data.level,
                  false,
                  false,
                  data.selectedFrame,
                  data.serial,
                )}
              </div>

              <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
                {data.serial !== playerSerial && (
                  <div className="p-1.5 h-8 w-8" title="empty space"></div>
                )}
                {data.name}
                {!!data.isAdmin && (
                  <Shield className="w-5 h-5 text-purple-200 fill-purple-500" />
                )}
                {data.serial !== playerSerial && !data.isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (data.isBlocked) {
                        setCustomConfirm({
                          show: true,
                          title: "إلغاء حظر اللاعب",
                          message: `هل أنت متأكد من إلغاء حظر ${data.name}؟`,
                          onConfirm: () => {
                            socket?.emit(
                              "unblock_player",
                              {
                                serial: playerSerial,
                                blockedSerial: data.serial,
                              },
                              (res: any) => {
                                if (res && res.success) {
                                  showAlert(
                                    `تم إلغاء حظر ${data.name} بنجاح`,
                                    "إلغاء الحظر",
                                  );
                                  setSelectedProfileData((prev: any) => ({
                                    ...prev,
                                    isBlocked: false,
                                  }));
                                  setBlockedPlayers((prev) =>
                                    prev.filter(
                                      (p) => p.serial !== data.serial,
                                    ),
                                  );
                                } else {
                                  showAlert("حدث خطأ أثناء إلغاء الحظر", "خطأ");
                                }
                              },
                            );
                          },
                        });
                      } else {
                        setCustomConfirm({
                          show: true,
                          title: "حظر اللاعب",
                          message: `هل أنت متأكد من حظر ${data.name}؟ لن تتمكن من اللعب معه مرة أخرى وسيتم إزالته من الأصدقاء.`,
                          onConfirm: () => {
                            socket?.emit(
                              "block_player_by_serial",
                              {
                                blockerSerial: playerSerial,
                                blockedSerial: data.serial,
                              },
                              (res: any) => {
                                if (res && res.success) {
                                  showAlert(`تم حظر ${data.name} بنجاح`, "حظر");
                                  setSelectedProfileData((prev: any) => ({
                                    ...prev,
                                    isBlocked: true,
                                  }));
                                  setBlockedPlayers((prev) => [
                                    ...prev,
                                    { serial: data.serial, name: data.name },
                                  ]);
                                  setRecentOpponents((prev) =>
                                    prev.filter(
                                      (op) => op.serial !== data.serial,
                                    ),
                                  );
                                } else {
                                  showAlert(
                                    res.error || "حدث خطأ أثناء الحظر",
                                    "خطأ",
                                  );
                                }
                              },
                            );
                          },
                        });
                      }
                    }}
                    className={`p-1.5 rounded-full transition-colors shrink-0 ${data.isBlocked ? "bg-gray-700/50 hover:bg-gray-700 text-white" : "hover:bg-black/30 text-white/90"}`}
                    title={data.isBlocked ? "إلغاء حظر اللاعب" : "حظر اللاعب"}
                  >
                    {data.isBlocked ? (
                      <Unlock className="w-5 h-5 text-gray-300 hover:text-white" />
                    ) : (
                      <Ban className="w-5 h-5 text-red-400 hover:text-red-300" />
                    )}
                  </button>
                )}
              </h2>
              <div className="flex justify-center items-center mt-1.5 mb-1.5">
                <span className="text-white bg-black/25 px-3 py-1 rounded-full text-xs font-black shadow-inner" dir="ltr">
                  Lvl {data.level}
                </span>
              </div>

              {/* Friend Status Indicator / Add Friend Button */}
              {data.serial !== playerSerial &&
                !data.isAdmin &&
                !data.isBlocked &&
                !data.hasBlockedMe && (
                  <>
                    {friendStatus === "friends" ? (
                      <div className="w-full max-w-[200px] mx-auto py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-green-100 text-green-700 border-2 border-green-200">
                        <Users className="w-4 h-4" /> صديق
                      </div>
                    ) : (
                      (!data.hideFriendRequests || friendStatus !== "none") && (
                        <button
                          disabled={friendStatus !== "none"}
                          onClick={() => {
                            if (friendStatus === "none") {
                              playSound("clickOpen");
                              handleAddFriend(data.serial);
                              setSelectedProfileSerial(null);
                            }
                          }}
                          className={`w-full max-w-[200px] mx-auto py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                            friendStatus === "pending_sent"
                              ? "bg-orange-100 text-orange-700 border-2 border-orange-200"
                              : friendStatus === "pending_received"
                                ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                                : "bg-white text-purple-700 hover:bg-gray-100 shadow-md border-b-2 border-gray-300 active:translate-y-px active:border-b-0 target-add-btn"
                          }`}
                        >
                          {friendStatus === "pending_sent" ? (
                            <>
                              <Clock className="w-4 h-4" /> طلب صداقة مرسل
                            </>
                          ) : friendStatus === "pending_received" ? (
                            <>
                              <Users className="w-4 h-4" /> لديه طلب لك بالصداقة
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" /> إضافة صديق
                            </>
                          )}
                        </button>
                      )
                    )}
                  </>
                )}
            </div>

            <div className="p-2 pt-1 py-1 space-y-4 bg-gray-50 flex-1 overflow-y-auto max-h-[60vh]">
              {/* Likes Feature */}
              <div className="bg-white rounded-xl p-1.5 border-2 border-gray-100 shadow-sm flex items-center justify-between mb-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="font-black text-main text-lg">
                      {data.likes || 0}
                    </span>
                    <span className="text-sm font-bold text-gray-500">
                      إعجاب
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-brown-muted mt-1">
                    كل 20 لايك = مفتاح 🗝️
                  </span>
                </div>
                {data.serial !== playerSerial &&
                  !data.isBlocked &&
                  !data.hasBlockedMe && (
                    <button
                      onClick={handleLikePlayer}
                      disabled={data.hasLikedToday}
                      className={`px-3 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm transition-all border-b-4 ${
                        data.hasLikedToday
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-red-500 text-white border-red-700 hover:bg-red-600 active:translate-y-1 active:border-b-0"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${!data.hasLikedToday ? "fill-current animate-pulse" : ""}`}
                      />
                      {data.hasLikedToday ? "تم الإعجاب" : "إعجاب"}
                    </button>
                  )}
              </div>

              <div className="relative">
                {data.serial !== playerSerial && !!data.hideMyInfo && (
                  <div className="absolute inset-0 bg-gray-200/95 rounded-xl z-10 flex flex-col items-center justify-center border-2 border-gray-300 backdrop-blur-[2px] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                    <Lock className="w-10 h-10 text-gray-400 mb-2 drop-shadow-sm" />
                    <span className="font-black text-gray-500 text-lg drop-shadow-sm decoration-2">
                      خاص
                    </span>
                  </div>
                )}
                {/* Helpers and Keys */}
                <div className="bg-white rounded-xl p-2 mb-2 border-2 border-gray-100 shadow-sm relative">
                  <h3 className="text-xs font-black text-brown-muted mb-1 text-center">
                    المقتنيات والباقات
                  </h3>
                  <div
                    className="flex flex-wrap justify-center gap-0.5"
                    dir="ltr"
                  >
                    <span
                      className={`gap-0.5 flex items-center justify-center transition-all px-1 py-1 rounded bg-gray-50 ${
                        isPro
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-gray-400 opacity-70"
                      }`}
                      title="باقة المحترفين"
                    >
                      <Crown
                        className={`w-3 h-3 md:w-4 md:h-4 transition-all ${
                          isPro
                            ? "fill-yellow-500 text-yellow-500 animate-pulse"
                            : "fill-gray-400 text-gray-400"
                        }`}
                      />
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <img
                        src="/Takhmina_coin_02.png"
                        className="w-3 h-3 md:w-4 md:h-4"
                      />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.tokens}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <Key className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.keys}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <Snowflake className="w-3 h-3 md:w-4 md:h-4 text-cyan-500" />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.ownedHelpers?.time_freeze || 0}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <Eye className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.ownedHelpers?.spy_lens || 0}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <Hash className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.ownedHelpers?.word_count || 0}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <Type className="w-3 h-3 md:w-4 md:h-4 text-green-500" />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.ownedHelpers?.word_length || 0}
                      </span>
                    </span>
                    <span className="bg-gray-50 px-1 py-1 rounded flex items-center gap-0.5">
                      <HelpCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />{" "}
                      <span className="text-[11px] md:text-[12px] font-bold">
                        {data.ownedHelpers?.hint || 0}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Player Stats Block */}
                <div className="bg-white rounded-xl p-2 px-1 mb-2 border-2 border-gray-100 shadow-sm relative">
                  <h3 className="text-xs font-black text-brown-muted mb-1 text-center">
                    إحصائيات اللاعب
                  </h3>
                  <div className="grid grid-cols-1 gap-0 text-xs font-bold text-gray-700">
                    <div className="bg-gray-300 p-1">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span>🖼️</span>
                        <span className="text-[14px] text-black font-extrabold">فئات التخمين</span>
                      </span>
                      <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50 pr-6">
                        <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                          <span>🏆</span>
                          <span className="text-gray-500 font-extrabold">فوز</span>
                        </span>
                        <span className="font-black text-brown-dark">{data.wins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50 pr-6">
                        <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                          <span>🔥</span>
                          <span className="text-gray-500 font-extrabold">فوز متتالي</span>
                        </span>
                        <span className="font-black text-brown-dark">{data.streak || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span>❤️</span>
                        <span className="text-gray-500 font-extrabold">إعجابات</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.likes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span>🚌</span>
                        <span className="text-gray-500 font-extrabold">تخمينة كومبليت</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.busCompleteWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span><span className="text-red-500 font-black">X</span><span className="text-green-600 font-black">O</span></span>
                        <span className="text-gray-500 font-extrabold">تخمينة XO</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.xoWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span>🖐</span>
                        <span className="text-gray-500 font-extrabold">تخمينة كف يد</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.handWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span className="font-black"><span className="text-blue-500">I</span><span className="text-purple-600">Q</span></span>
                        <span className="text-gray-500 font-extrabold">تخمينة IQ</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.iqWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src="/dots-and-boxes-logo.png" className="w-3 h-3 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة نقطة وخط</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.dotsWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src="/speed-cups/speed-cups-logo.png" className="w-3.5 h-3.5 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">أكواب السرعة</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.speedCupsWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span>💣</span>
                        <span className="text-gray-500 font-extrabold">قنبلة التخمين</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.bombPartyWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src="/word-le-logo.png" className="w-3.5 h-3.5 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة كلمة لي</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.wordleWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src="/connect-4-logo.png" className="w-3.5 h-3.5 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة 4 حروف</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.connectFourWordsWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span className="w-3.5 h-3.5 inline text-center">🚀</span>
                        <span className="text-gray-500 font-extrabold">حرب الفضاء</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.spaceWarWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span className="w-3.5 h-3.5 inline text-center">🧩</span>
                        <span className="text-gray-500 font-extrabold">تخمينة puzzle</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.puzzleWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <span className="w-3.5 h-3.5 inline text-center">🐇</span>
                        <span className="text-gray-500 font-extrabold">سباق التخمين</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.beachRaceWins || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Titles */}
                <div className="bg-white rounded-xl p-2 mb-2 border-2 border-gray-100 shadow-sm">
                  <h3 className="text-xs font-black text-brown-muted mb-2 text-center">
                    الألقاب
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.titles && data.titles.length > 0 ? (
                      data.titles.map((title: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100"
                        >
                          {title}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">
                        بدون لقب
                      </span>
                    )}
                  </div>
                </div>

                {/* Frames */}
                <div className="bg-white rounded-xl p-2 mb-2 border-2 border-gray-100 shadow-sm">
                  <h3 className="text-xs font-black text-brown-muted mb-2 text-center">
                    الإطارات (أبطال التخمين)
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.ownedFrames && data.ownedFrames.length > 0 ? (
                      data.ownedFrames.map((catId: string) => {
                        const cat = COLLECTION_DATA.find((c) => c.id === catId);
                        if (!cat) return null;
                        return (
                          <div
                            key={cat.id}
                            className="w-12 h-12 rounded-xl border-2 border-black/10 overflow-hidden shadow-sm"
                            title={cat.name}
                          >
                            <img
                              src={`/frames/${cat.id}.png`}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400">
                        لا يوجد إطارات أبطال التخمين
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderMatchIntervalAdModal = () => {
    if (!matchAdState.show) return null;

    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FFF9F0] border-4 border-[#8B4513] p-6 md:p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-[0_0_40px_rgba(139,69,19,0.3)]"
          dir="rtl"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-blue-300">
            <span className="text-3xl">📺</span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black text-[#8B4513] leading-tight">
            جاري تجهيز المباراة التالية...
          </h3>
          <p className="text-sm md:text-base text-gray-600 font-bold px-2">
            شاهد الإعلان القصير للاستمرار!
          </p>
          
          <div className="h-[80px] flex items-center justify-center">
            {matchAdState.adFailed ? (
              <button 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-black text-lg transition-all shadow-[0_4px_0_rgb(37,99,235)] active:translate-y-1 active:shadow-none"
                onClick={() => triggerMatchAd()}
              >
                استكمال الاعلان للاستمرار 📺
              </button>
            ) : matchAdState.timer > 0 ? (
              <div className="relative w-20 h-20 flex items-center justify-center mx-auto">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="36" className="stroke-gray-200" strokeWidth="8" fill="none" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="36" 
                    className="stroke-blue-500 transition-all duration-1000" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - matchAdState.timer / 3)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-3xl font-black text-blue-600 animate-pulse">{matchAdState.timer}</span>
              </div>
            ) : (
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderModals = () => (
    <>
      {renderMatchIntervalAdModal()}
      {renderPlayerProfileModal()}
      {renderFriendsModal()}
      {renderPlayerSearchModal()}
      {renderFriendRequestsModal()}
      {renderAskFriendModal()}
      {renderGiftModal()}
      {/* Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp !== null && (
          <LevelUpModal
            level={showLevelUp}
            avatar={avatar}
            customConfig={customConfig}
            isHighestLikes={
              isHighestLikes ||
              (playerSerial
                ? highestLikesSerials.includes(playerSerial)
                : false)
            }
            selectedFrame={selectedFrame}
            onClose={() => {
              setShowLevelUp(null);
            }}
          />
        )}
      </AnimatePresence>

      {renderCollectionModal()}
      {/* Global Reward Modal */}
      <AnimatePresence>
        {activeGlobalReward &&
          (activeGlobalReward.type !== "tokens" || getLevel(xp) >= 50) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="card-game p-6 w-full max-w-sm space-y-4 text-center border-4 border-accent-orange"
              >
                <div className="w-20 h-20 bg-accent-orange-soft rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <Gift className="w-10 h-10 text-accent-orange" />
                </div>
                <h2 className="text-3xl font-black text-accent-orange">
                  هدية مجانية!
                </h2>
                <p className="text-brown-muted font-bold text-lg whitespace-pre-wrap">
                  {activeGlobalReward.message}
                </p>

                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 my-4">
                  <div className="flex items-center justify-center gap-2 text-main font-bold">
                    {activeGlobalReward.type === "pro_package" ? (
                      <>
                        <Crown className="w-5 h-5 text-accent-yellow" />
                        <span>باقة المحترفين (بدون إعلانات)</span>
                      </>
                    ) : activeGlobalReward.type === "unlock_helpers" ? (
                      <>
                        <Unlock className="w-5 h-5 text-accent-blue" />
                        <span>فتح كل وسائل المساعدة</span>
                      </>
                    ) : (
                      <>
                        <img src="/Takhmina_coin_02.png" className="w-5 h-5" />
                        <span>{activeGlobalReward.tokenAmount} تخمينات</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-brown-light mt-2">
                    {activeGlobalReward.type === "tokens"
                      ? "مكافأة خاصة لمستوى 50+"
                      : `لمدة ${activeGlobalReward.durationHours} ساعة`}
                  </div>
                </div>

                <button
                  onClick={() => {
                    socket?.emit("claim_global_reward", (res: any) => {
                      if (res.success) {
                        setActiveGlobalReward(null);
                        showAlert("تم استلام الهدية بنجاح! استمتع 🎉", "نجاح");
                        if (res.player) {
                          if (res.player.proPackageExpiry) {
                            setProPackageExpiry(res.player.proPackageExpiry);
                            localStorage.setItem(
                              "khamin_pro_package_expiry",
                              res.player.proPackageExpiry.toString(),
                            );
                          }
                          if (res.player.unlockedHelpersExpiry) {
                            setUnlockedHelpersExpiry(
                              res.player.unlockedHelpersExpiry,
                            );
                            localStorage.setItem(
                              "khamin_unlocked_helpers_expiry",
                              res.player.unlockedHelpersExpiry.toString(),
                            );
                          }
                          if (res.player.tokens !== undefined) {
                            setتخمينات(res.player.tokens);
                            localStorage.setItem(
                              "khamin_tokens",
                              res.player.tokens.toString(),
                            );
                          }
                        }
                      } else {
                        showAlert(
                          res.error || "حدث خطأ أثناء استلام الهدية",
                          "خطأ",
                        );
                        setActiveGlobalReward(null);
                      }
                    });
                  }}
                  className="w-full btn-game btn-primary py-3 text-xl animate-pulse"
                >
                  استلام الهدية 🎁
                </button>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {announcementMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-game p-6 w-full max-w-sm space-y-4 text-center border-4 border-red-500"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-red-600">تنبيه هام</h2>
              <p className="text-brown-muted font-bold text-lg whitespace-pre-wrap">
                {announcementMessage}
              </p>
              <button
                onClick={() => setAnnouncementMessage(null)}
                className="w-full btn-game bg-red-500 text-white hover:bg-red-600 border-b-4 border-red-700 py-3 text-lg"
              >
                فهمت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderCheckoutPage()}
      {renderDailyQuestModal()}
      {renderLuckyWheelModal()}
      {renderComplaintModal()}
      {renderContactModal()}
      {/* Incoming Friend Challenge Modal */}
      <AnimatePresence>
        {incomingChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-game p-6 w-full max-w-sm text-center border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] space-y-6"
            >
              {(() => {
                const name =
                  incomingChallenge.senderName ||
                  incomingChallenge.name ||
                  incomingChallenge.challengerName ||
                  "لاعب مجهول";
                const avatar =
                  incomingChallenge.senderAvatar ||
                  incomingChallenge.avatar ||
                  incomingChallenge.challengerAvatar ||
                  "boy_1";
                const level =
                  incomingChallenge.senderLevel ||
                  incomingChallenge.level ||
                  incomingChallenge.challengerLevel ||
                  1;
                const frame =
                  incomingChallenge.senderFrame ||
                  incomingChallenge.selectedFrame ||
                  incomingChallenge.challengerFrame ||
                  "";
                const challengeSerial =
                  incomingChallenge.challenger || incomingChallenge.sender;

                return (
                  <>
                    <div className="w-24 h-24 mx-auto relative mb-4">
                      {renderAvatarContent(
                        avatar,
                        level,
                        false,
                        false,
                        frame,
                        challengeSerial,
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 w-8 h-8 rounded-full border-2 border-white flex z-[200] items-center justify-center animate-bounce">
                        <Gamepad2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-main">{name}</h3>
                      <div className="text-sm text-gray-500 font-bold bg-gray-100 rounded-full inline-block px-3 py-1 mt-2">
                        مستوى {level}
                      </div>
                      <p className="text-xl font-bold text-accent-orange mt-2">
                        يتحداك الآن!
                      </p>
                    </div>
                  </>
                );
              })()}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    const senderSerial =
                      incomingChallenge.senderSerial ||
                      incomingChallenge.serial ||
                      incomingChallenge.challengerSerial;
                    socket?.emit(
                      "respond_to_friend_challenge",
                      {
                        serial: playerSerial,
                        targetSerial: senderSerial,
                        response: "accept",
                      },
                      (res: any) => {
                        if (!res.success) {
                          showAlert(res.message || "فشل قبول التحدي", "خطأ");
                          setIncomingChallenge(null);
                        }
                      },
                    );
                  }}
                  className="w-full bg-accent-green hover:bg-green-500 text-white font-black py-4 rounded-xl text-xl shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2"
                >
                  <Check className="w-6 h-6" />
                  قبول
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const senderSerial =
                        incomingChallenge.senderSerial ||
                        incomingChallenge.serial ||
                        incomingChallenge.challengerSerial;
                      socket?.emit("respond_to_friend_challenge", {
                        serial: playerSerial,
                        targetSerial: senderSerial,
                        response: "reject",
                      });
                      setIncomingChallenge(null);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl text-xl shadow-[0_4px_0_rgb(185,28,28)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    رفض
                  </button>
                  <button
                    onClick={() => {
                      const senderSerial =
                        incomingChallenge.senderSerial ||
                        incomingChallenge.serial ||
                        incomingChallenge.challengerSerial;
                      socket?.emit("respond_to_friend_challenge", {
                        serial: playerSerial,
                        targetSerial: senderSerial,
                        response: "later",
                      });
                      setIncomingChallenge(null);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-black py-4 rounded-xl text-xl shadow-[0_4px_0_rgb(107,114,128)] active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    ليس الآن
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {customAlert.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10005] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-game p-6 w-full max-w-sm space-y-4 text-center"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Info className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-black text-main">
                {customAlert.title}
              </h2>
              <p className="text-brown-muted font-bold text-lg whitespace-pre-wrap">
                {customAlert.message}
              </p>
              <button
                onClick={() => {
                  setCustomAlert({ ...customAlert, show: false });
                  if (customAlert.onClose) customAlert.onClose();
                }}
                className="w-full btn-game btn-primary py-3 text-lg"
              >
                حسناً
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {customConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10005] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-game p-6 w-full max-w-sm space-y-4 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <HelpCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-main">
                {customConfirm.title}
              </h2>
              <p className="text-brown-muted font-bold text-lg whitespace-pre-wrap">
                {customConfirm.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm({ ...customConfirm, show: false });
                  }}
                  className="flex-1 btn-game btn-danger py-3 text-lg"
                >
                  {customConfirm.confirmText || "نعم"}
                </button>
                <button
                  onClick={() => {
                    if (customConfirm.onCancel) customConfirm.onCancel();
                    setCustomConfirm({ ...customConfirm, show: false });
                  }}
                  className="flex-1 btn-game btn-primary py-3 text-lg"
                >
                  {customConfirm.cancelText || "إلغاء"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Prompt Modal */}
      <AnimatePresence>
        {customPrompt.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-game p-6 w-full max-w-sm space-y-4 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Info className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-black text-main">
                {customPrompt.title}
              </h2>
              <p className="text-brown-muted font-bold text-lg whitespace-pre-wrap">
                {customPrompt.message}
              </p>
              <input
                type="text"
                autoFocus
                defaultValue={customPrompt.defaultValue}
                className="input-game w-full text-center"
                id="customPromptInput"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (
                      document.getElementById(
                        "customPromptInput",
                      ) as HTMLInputElement
                    ).value;
                    customPrompt.onConfirm(val);
                    setCustomPrompt({ ...customPrompt, show: false });
                  }
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const val = (
                      document.getElementById(
                        "customPromptInput",
                      ) as HTMLInputElement
                    ).value;
                    customPrompt.onConfirm(val);
                    setCustomPrompt({ ...customPrompt, show: false });
                  }}
                  className="flex-1 btn-game btn-success py-3 text-lg"
                >
                  تأكيد
                </button>
                <button
                  onClick={() =>
                    setCustomPrompt({ ...customPrompt, show: false })
                  }
                  className="flex-1 btn-game btn-primary py-3 text-lg"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Confirmation Modal */}
      <AnimatePresence>
        {showAdConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 text-white"
          >
            <div className="bg-modal-theme p-8 rounded-[2rem] text-center max-w-sm w-full space-y-6">
              <h2 className="text-2xl font-black text-accent-orange">
                وسيلة مساعدة
              </h2>
              <p className="text-brown-dark font-bold">
                هل تود مشاهدة إعلان لفتح واستخدام وسيلة المساعدة "
                {activePowerUp
                  ? {
                      quick_guess: "تخمين سريع",
                      hint: "نصيحة",
                      word_length: "كاشف الحروف",
                      word_count: "عدد الكلمات",
                      time_freeze: "تجميد الوقت",
                      spy_lens: "الجاسوس",
                    }[activePowerUp]
                  : ""}
                "؟
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleWatchAd}
                  disabled={isGlobalAdLoading}
                  className={`flex-1 bg-accent-green hover:brightness-110 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 ${isGlobalAdLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isGlobalAdLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> جاري
                      التحميل...
                    </>
                  ) : (
                    "نعم، شاهد الآن"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAdConfirmation(false);
                    setActivePowerUp(null);
                  }}
                  disabled={isGlobalAdLoading}
                  className={`flex-1 bg-gray-500 hover:brightness-110 text-white py-4 rounded-2xl font-black ${isGlobalAdLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  لا
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Ad Confirmation Modal */}
      <AnimatePresence>
        {pendingClaimReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[20000] flex items-center justify-center p-4 text-white"
          >
            <div className="bg-modal-theme p-8 rounded-[2rem] text-center max-w-sm w-full space-y-6">
              <h2 className="text-2xl font-black text-accent-orange">
                استلام المكافأة
              </h2>
              <p className="text-brown-dark font-bold">
                هل تود مشاهدة إعلان لاستلام المكافأة؟
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    handleRewardAd(
                      pendingClaimReward.categoryId,
                      pendingClaimReward.stage,
                    )
                  }
                  disabled={isGlobalAdLoading}
                  className={`flex-1 bg-accent-green hover:brightness-110 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 ${isGlobalAdLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isGlobalAdLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> جاري
                      التحميل...
                    </>
                  ) : (
                    "نعم، شاهد الآن"
                  )}
                </button>
                <button
                  onClick={() => setPendingClaimReward(null)}
                  disabled={isGlobalAdLoading}
                  className="flex-1 bg-gray-500 hover:brightness-110 text-white py-4 rounded-2xl font-black"
                >
                  لا
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShopModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) toggleShop();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-modal-theme rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <div
                className="p-6 text-center relative shrink-0"
                style={{
                  background: `linear-gradient(to right, var(--shop-header-start), var(--shop-header-end))`,
                }}
              >
                <button
                  onClick={toggleShop}
                  className="absolute top-3 right-3 w-8 h-8 bg-white text-black border-4 border-black rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
                  <ShoppingCart className="w-8 h-8 text-brown-dark" />
                </div>
                <h2 className="text-2xl font-black text-light mb-1">المتجر</h2>
                <p className="text-purple-100 text-sm font-bold">
                  احصل على تخمينات للعب مع المحترفين!
                </p>
              </div>

              <div className="p-2 md:p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex items-center justify-between bg-yellow-100 box-game p-2 md:p-4">
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <img
                        src="/Takhmina_coin_02.png"
                        className="w-6 h-6 md:w-8 md:h-8"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs font-bold text-brown-muted">
                        رصيدك الحالي
                      </div>
                      <div
                        className="text-xs md:text-lg font-black"
                        style={{ color: "var(--shop-token-text)" }}
                      >
                        {renderQuantity(
                          tokens,
                          tempItems?.tokens || 0,
                          "text-accent-purple",
                        )}{" "}
                        تخمينات
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-gray-200 mx-1"></div>

                  <div className="flex items-center gap-3 w-1/2 justify-end">
                    <div className="text-right">
                      <div className="text-[10px] md:text-xs font-bold text-brown-muted">
                        مفاتيحك
                      </div>
                      <div
                        className="text-sm md:text-lg font-black text-yellow-600"
                        dir="ltr"
                      >
                        {renderQuantity(
                          keys || 0,
                          tempItems?.keys || 0,
                          "text-accent-purple",
                        )}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-yellow-400">
                      <Key className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-brown-dark mb-2">
                    باقات التخمينات والهدايا
                  </h3>

                  {/* Free Ad Reward - Level 50+ Only */}
                  {getLevel(xp) >= 1 && (
                    <div className="flex items-center justify-between py-3 p-2 md:p-4 border-2 border-game box-game relative overflow-hidden mb-4">
                      <div
                        className="absolute top-0 left-0 bg-accent-yellow text-black text-[10px] font-bold px-1 py-0.5 rounded-bl-xl shadow-sm z-10"
                        dir="ltr"
                      >
                        مجاناً (Level 50+)
                      </div>
                      <div className="flex items-center gap-1.5 relative z-10">
                        <div className="w-12 h-12 bg-accent-green-soft rounded-xl flex items-center justify-center text-2xl animate-pulse">
                          📺
                        </div>
                        <div>
                          <div className="font-bold text-[13px] md:text-lg text-brown-dark">
                            شاهد إعلان = 1 تخمينة
                          </div>
                          <div className="text-xs font-bold text-brown-muted">
                            متبقي لك اليوم:{" "}
                            <span className="text-accent-green">
                              {5 - adStatus.adsWatched}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleWatchAd}
                        disabled={
                          isCooldown ||
                          !adStatus.canWatch ||
                          getLevel(xp) < 50 ||
                          isGlobalAdLoading
                        }
                        className={`px-2 py-1 rounded-xl font-black text-sm transition-all shadow-md relative z-10 flex items-center justify-center gap-1 ${
                          !isCooldown &&
                          adStatus.canWatch &&
                          getLevel(xp) >= 50 &&
                          !isGlobalAdLoading
                            ? "bg-accent-green text-white hover:scale-105 active:scale-95"
                            : "bg-gray-300 text-brown-muted cursor-not-allowed"
                        }`}
                      >
                        {isGlobalAdLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : getLevel(xp) < 50 ? (
                          "Level 50+"
                        ) : isCooldown ? (
                          `${cooldownTime}s`
                        ) : adStatus.canWatch ? (
                          "مشاهدة"
                        ) : (
                          "انتهى اليوم"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Free Ad Reward - Keys - Any Level */}
                  <div className="flex items-center justify-between py-3 p-2 md:p-4 border-2 border-game box-game relative overflow-hidden mb-4">
                    <div
                      className="absolute top-0 left-0 bg-accent-yellow text-black text-[10px] font-bold px-1 py-0.5 rounded-bl-xl shadow-sm z-10"
                      dir="ltr"
                    >
                      مجاناً (لجميع المستويات)
                    </div>
                    <div className="flex items-center gap-1.5 relative z-10">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shadow-sm border border-yellow-300 animate-pulse">
                        <Key className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-bold text-[13px] md:text-lg text-brown-dark">
                          شاهد إعلان = 1 مفتاح
                        </div>
                        <div className="text-xs font-bold text-brown-muted">
                          متبقي لك اليوم:{" "}
                          <span className="text-yellow-600">
                            {5 - keyAdStatus.adsWatched}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleWatchKeyAd}
                      disabled={
                        isKeyCooldown ||
                        !keyAdStatus.canWatch ||
                        isGlobalAdLoading
                      }
                      className={`px-2 py-1 rounded-xl font-black text-sm transition-all shadow-md relative z-10 flex items-center justify-center gap-1 ${
                        !isKeyCooldown &&
                        keyAdStatus.canWatch &&
                        !isGlobalAdLoading
                          ? "bg-yellow-500 text-white hover:scale-105 active:scale-95 shadow-[0_4px_0_0_#ca8a04]"
                          : "bg-gray-300 text-brown-muted cursor-not-allowed shadow-[0_4px_0_0_#9ca3af]"
                      }`}
                    >
                      {isGlobalAdLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isKeyCooldown ? (
                        `${keyCooldownTime}s`
                      ) : keyAdStatus.canWatch ? (
                        "مشاهدة"
                      ) : (
                        "انتهى اليوم"
                      )}
                    </button>
                  </div>

                  {/* Keys Exchange Package */}
                  <div className="flex items-center justify-between p-2 md:p-4 border-2 border-yellow-200 rounded-2xl bg-yellow-50 mb-4 transition-colors box-game relative">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-12 bg-white border-2 border-yellow-200 rounded-xl flex items-center justify-center">
                        <img src="/Takhmina_coin_02.png" className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-[14px] md:text-lg text-brown-dark">
                          10 تخمينات
                        </div>
                        <div className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                          مقابل 100 مفتاح <Key className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBuyTokensWithKeys}
                        disabled={(keys || 0) < 100}
                        className={`px-3 py-2 rounded-xl font-black text-sm transition-all shadow-md flex items-center gap-1 ${(keys || 0) < 100 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-black animate-pulse active:scale-95"}`}
                      >
                        {(keys || 0) < 100 && <Lock className="w-4 h-4" />}
                        تبديل
                      </button>
                    </div>
                  </div>

                  {/* Pro Pack for Keys */}
                  <div className="flex items-center justify-between p-2 md:p-4 border-2 border-accent-orange rounded-2xl bg-orange-50 mb-4 transition-colors box-game relative">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-12 bg-white border-2 border-accent-orange rounded-xl flex items-center justify-center text-2xl">
                        👑
                      </div>
                      <div>
                        <div className="font-bold text-[13px] md:text-lg text-brown-dark">
                          باقة المحترفين 1 يوم
                        </div>
                        <div className="text-xs font-bold text-yellow-600 flex items-center gap-1 mt-0.5">
                          مقابل 100 مفتاح{" "}
                          <Key className="w-3 h-3 text-yellow-500" />
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-gray-600 flex items-center gap-1 mt-0.5">
                          استمتع باللعبة بدون اعلانات
                          <div className="relative inline-flex items-center justify-center">
                            <span className="w-3 h-3 md:w-3 md:h-3 flex items-center text-center justify-center">📺</span>
                            <Ban className="w-4 h-4 md:w-5 md:h-5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBuyProWithKeys}
                        disabled={(keys || 0) < 100 || hasProPackage}
                        className={`px-3 py-2 rounded-xl font-black text-sm transition-all shadow-md flex items-center gap-1 ${(keys || 0) < 100 || hasProPackage ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-accentx��}ksו���WX��@$%Y#�K�V�]��R2�Ѩ�&�$�И�H�V�H�Q�5��S���LFq$˖e�[���T��l~s���}5R�G�2Eݷ�=���~4��n���_q�k�w�h��"w;jl���eN'�'�w�,׮^��_��zU�9c�='|/��s:��Wyc�����������'5͍'X����?d�9v�-�����ɷ��e��;a��3pWj[�%�k,�����i�����j�4����j�gOίmF�?�/��|׻"�J|!�fw�썝�3�:L�'d?���7���3�;�}w��ث���K�ܬXIs��GnP�Þ��ʫiF;#�ZYa�Q�_��js��(�|�zX�fka_Wv��^W�g,���}w��6:���>�#o}���F[�;d#��5?�A���8;D���v�n��ݏO����p��f0�,��z����!��؀���;xL�(�>��)�Wԑ��/.��հ�ᙅ����M8���5Y�]�p��z���r���Bk�}���p�Z��F� � )��f���t��F8��V���>�{��O�O��������)|���T�&��txQG96 �a��Q�m�$�#�#ǋF�G	� ���(�$h#�e@M���5���3�7G:�X �����d�_��a����s�g�����j��ф�Cb���Nq ��k=Ǯvo�S5�b�a�W�o����H�9��O�����:��3����7w�[��8�2�/�����F/�a�XX�I@e��ʴs���[�@B!tu�����ŷyx�*֜�4젎��k%��o�a��o��� ���_�}8��R1����O��ǿe���'p�$ǇjG@ށo�F?6~����e�����`'e3�n�^�π_#&ֽ��C�:�A�������Uʫ�25����z.�c?'�5�I��`>(	���PI%QĹ��t��1#p\4z�c��?a�Q�T�5\��*����`+���(��bV��zk(������Ok	�r�o��b�7�Jޕ����̲�� �˲�h��-�� �8���]걑x�d��x�<w����ך� t�ڟ�[�gd�&�hfrѬ!�0@	�@ ��'L��Gpn�L�c�����2k�k?��� �ہ���|>~h�W�����OǏ���;�[l�1-�Onq�����-�3��k��iEښ��6męJ�L^��|�(c��13V1�24�K���!=��e��
U��f���Y�Jf�Ğ��H�2R�Ǝȯ�:�ݻ+�i�2P[#$^����fNb�+h��tx
��ZN��B�,b��Ӄ�8�`쟶����a�js��U�Ds�{%����f���ɋNίAr���7t�7���B�{���3�u���w�~F�?Yz.��=I����tr����New��pV�h�k��y�8�����7��^�&ˣ�m@-o�Q����v�(��v�l��?k�_n�Z�8�y��������	p��*l�L9@����|��u�K�ALܽ@�Jn��f1j�'�r����nЙ����h#�Z���y�.�et��BU��)5t����0�G�HFΆ��NH�`��y{YB`F��X)\KEN�h���dv�����+�~T��|�O��:fA��EǓg#'�+�GA�<�3s�ey�~�Ɏ�DT���e#� 9j.g��=�(��T6��o%��ז�]�m�H|�0[�����0����Nsç���>WѫY+�e)���F�����?�Xs�#���܅��K��!q�����|��?�L��iR$�i���mU�4����ӄ@Tq�m�]�(A�q�h�J�Bz�w�f�3ܝd: ^� U���ל@��'G%}*�(2f6ͮIO��a�}�ӗ�ؠ����	Gg{�ƿLo5���K<?g?}�Ux�a,>p:n� ~$qCs6� J��@J��eo�!wDw#�*iCo�d-�o�$� � �"�`_���r�D���yl5�k���7��F(B	 d2�=lŷHc�L�p���&�Nd+��-JW>*�
����6pv�Jۈxi<�>Db���|��r*�|	S~x�9L��F8�@�O��O�_�����z��q�@f����ĄE�#��0 �' ��n����� ���,P�/w��7<����<���X������w�g��>Ya��qr雛ҝɨ�<:��9�ro�v��@g�S�	o���
 �R��Wv�+��j7G���[f�;�~�RK�*�G��n�M�b������&��⯒��R�Įz��W��z��M�����c9��s�#d��mr�Z�� Z�GVp����)��O�Z|4���R���vF�O1�~;9�hE�����ǰ,4n 0t�b��p��L����8�gpЖ�<h0_[��v�&�3�^��kA��"h	���&���b��1f��CA=���q.gO�?��L�e�1�d�=QD��� z^����G�q��=�k��K- 1�گ����#?��1�b$b����,X��W:�J�:8�~����<��Z��d1��?#J��UEx.�Ǩ���TFKϙ������:<��X�g{)B �
'�(��g�Ԅ 
y���]�K%��M�4�*�e������	H��i�K�����0)�:w:���<#XF�������_�7d����@_���yY��׋�h��e���T�B6�,��.̷y�(��H���v�%_���\����$���	��#��ĳ`��$�U��'��U1X����_?}Zm$x]�i�J;v��'�+V���r�D	L�|?g��ɾHP���3�\�"nC��>*X�`I\��Z ��[��m��\������ɍ@9�Q�[��br[@8^҃�ש&�D�0ٝ!Q����a��8.�-��a-h�E����:�O�"����E0���8�8i�{k�y�=X�(�Cs��|���b 0�EV0-*#�O��ҁ֙�Q��Q	��������;~�{b	k�X=�1�oP�/,�ߟ��T�����|�{�k/ �N,������[ �։V�Թ�Ʌ��$:¡�!O�o��)o?���imV2�Z�`$�4�I��?r��S^���%��� GT��nDN���h����(�����QL��G<"��R�wV��|���`�%��69� U���ܯ�m�C����(b4�,x!n��.B��
]��@ꂹp1�i��![�d�7f=B-�OA��O���C�̮�^!��5h�5�LS��@������xbP:��)�-7���>��<[´ �yN(�9���D�@8�����0�-ij�HS�%i���Q�Mg*'8Vj��~����Rl[�E�nr$����Xbm��L�d
D��v����4f��
tPL���c��#2�����'�-9���}4g��Og��<�M{�����s��P�PؑgTz[��#@�/	�ǒ���_�0�n��g�9�=�1B���2F���&IU9���{KֶP�'�g��{�A�w���dO�����܂q���(����ݙ��ld�0U�Y�(o��6��J��	{	�`a)璅Y
�	Ԓ�@-�$P1�$$J�=k"���)���îxݮ 2eIV��	}Na��;@�@��LQi������c
g#�,�����{\��DX�L�����3V�DՆ�F��3�a���+t��ҦemZ~I�6�b7E�M`�,����A���:�7���W�C�d@�9���݂*�=qT�ч���$��>#k�/�Q�3t��%��,�hc����W)T�v���${�/pM�r	D��I�-�K|+��٠H�N����_Ln�v���K�����0���z�9�^#wv��11=�EXX�L���g�ڄ���\x���'Z����*�^q"'8�	o�;���К&RCc�	X�+m,�<YV�r���n*<����Gt3�Ɉ �e�+o���f�|nP�����>�LP"&K)R<T������!��x�l�Kr`=&�Xd1�σK�b(�g��-
.�K�	Qc�9B��4s��H�V��-����`�L,5Mu6�;���^H�kG]�u��Lc*���0�ӑ��1�D�V&�����F~=tO�����1J#P%�Jם�h�o��v�u�N�j�|T<�}*���k�^��ݑ;L!4��%+
q��(/ǡ{A��7f�����~\�#��Q��!�`����Q�#<�jh�+3�JcW�ő3��.���Lw�r��I�v������˚��WZE	w<�l��Z,�j��_�1qM��2��E,�1]-��>��I�\�����P��Q���V �Ҷ�{^*�2�K�	�Y��&)~rO�#J-�YcW���m��Y=��|�S�:�^R=-�yXcN>��\	������5U��5M�;G�(�$�O�ů6յx���K�8�Ɔ�<�p2���MA5,.��E����V��	��y;��} (�B�w������P;�����P��н��ך�Bh�������.��3q��t��.�l�wY-_јX'���Z�-�~"��<r@�b9�q�%�t�i�x�*��u)6	Y��f�X0TJ5u%*GV���k�ݘI�}���Y�T��jD�4!zy:Ԙ�TM�3�j9��9Jy�ێ7dg�u
��i!�;�I����y�YV$+[����y|~�����T,���>*�#;�J��c��ceOj/��7���9O�#eή�y����C����>��T�>Jb��?&��-*㛥�*��b>1�#�P�����V��h]t?���uv��O�]So�W�Ð���^������\�4���%F)��U�!���B^^#�B���\��O*=�< ��(��,�Cd���vR�CqF��H�mRO&�C�jeyr~i�МՖ�Y�-�h�d"�
]c��ǣr��m�ӵ�TH����"3J��q1/��7]�?��.���Q��N�~������]���_�*���x��N�@���ҔH�c�*C�2r���}w�	�!{�G}G7���6kI�y�|s���%��
�zK*�+ ���Ŭu^ؼr數"%���Z\���?���#)��3%6�bv�	��wB7TR =��S������U����i�F�W+���y�#�ۍ1�Z�$�Vsi>���uE1�L�R9��U"���gj�,�Z9�<t�ƴ<JKon���Q/~� ΃�����u���W��q��o�v����mO�����>��z���u7�je�F��)��g�kD�B`E�B�Xq
�4��ɋ[k��z�����L�= [��83�G����N	�/<�EP��]Ϊ���@�
�������'������ق���~����L�͊�.3v��`�����s)�if G;��/>ܻ�Q*�<3 _vg.ghjdV��r��� ����#ɛ�麈b;PÊ��Y��|�K@�A4�h+�D:k�(��☍�؀��낻�w.�z�HC7
.4�����H�[%�z�����]���^��C}�5���tڤd����&���Tރ���l@M�T�P�y�IUjP+��F+Q�� U~�����H[��lQ��������36Ϥ�K���+oeʣh:X�L��;�`�d��21\(c�P,o-v��P�|�Ɇ�WA��%ݱR�d5RP܏��7>�Fu�Ǣ��H�Î��c���-Uœp����<�Ƀ�;��aP��f��v����Ő�x����J�#ض�-ؗ��j�Z�t��fʼӅ�}��P"l��^�b�r����O��-z����exϤ��*r%�H�}�nZ�}��wڦ~����[Y*�֛�?1�j�,�K����/���b"��`�ꯣ`S�mdt:���o#�48�@tUwMQ D&rSIS�Zi��W�>)������6n�f�
�BeB�lӮ':Mc�m���z&<���zk}�Z\�Қ�P+�(M�3}E��$zX��B4u^�_֐m�g+HrMq��,�û��'!��ЕZΙ�X=L:X�2��K����h۵��㾻���#�v.YXg�������Kvə�]c2�7�)A�ҙ7N�Vg	��K�qo���M&���yCc�3��&�Z�X��қCG�,r�b��L �[�C�w�A���F�鵹��:�Y��0P�S��s�u�a����oF��V���A�a��VK;��-/;	YZ[,�Cc���O���T�,P]B�E}���(音���XO¹�a���8�}�=����NL)��l�'�Z�S���ޫ;�*���Q�@Q8�q�>��Y8_Ά�� \�v�������nt��AjsJ!����ͧ
��xZPv!.�cb֯w�H��"�$o��T��\3׎�X�.�,8��g	l��M��a�fX@b��v�:A���� ���2�j�N�h���ܥ*��� 1��a�hElE~"#0&�Z�qf�:��Ps�u�X%��B�~XZ���9M��;g�T)l�̢�b�>N.ϣ��R7��8HX9d��Dе�[M�u!�Cn�#N&���B��q�Xt�;�.���`CG@�F*���rw���x��C�������Y���3���0�w:bۣ�]c� 0������*�b]8�:Ҥ(��W�Z��3Z��l[��.��[�uRS����H����k̦�h�v�^s���A�Zf`�t"��-���W���h�q�5'h�m�]ȧ��@�(��MO�6���_��2-(�$��W��e����M���d��F����]�j�lu�!GX݀l�N�0�{���d‌|B�����.\ܮu�ߟ3�RozՌ\��}�#%�-�HE<L�E#/s�C%�ha�"M{AE�w��3H5�s}�~|��$��M{\a�Q8ǭ���<FD���T���k�>�9�*�UD#ÌFFD2\��-�m$W~�J�w�͛������X.��2p3���MO���/��b�1�7��?�MM|w�R��g�H�e.`u�7�^T�k��*�T}g����&�|��T��u�Ԇ��n
���P����y��f�ăhg$(���\q��@P�H2���kneQ~�^2f�m.&6�uc��v�����A�Խ��e܁������fE{�������i�i�6�oK���/��G˧�GG�'w�K�:v,�(��X|�����G�$���|�z4��X���ϴ-�Ўg�>����76u��N�u��7l����\��� ��մ֟�N�C�fs�T0(~O3�{00��@v�B���P�F�=��M�w���j�>�����"&C����ߢ��*It��ɏ�R�d8w�b|-,JC?B���r0�c�]�u�l�E96+��:?k�����qnu����*��4k?�=!���S�{ڭ��Y/��'���}w=����̷Y#R5�Η�0^,�٥���u�9Q6I.��h���-�c�Sy=��U��D��JXE1����Q'y˗:�PZ�S�)�uj�q�/���}��<"
�n/�D`5٤�.I��y�uӉ,|Ii��B�i,����v�-:���]�2�˾����V�����ڤ�Jү���T�UrM{��jG���w>��X�,�R�%^�\�sy4���to�j�\�m6U�S=��x������Q-;�~�~�q;�i�����dY�B9b�"��tӈ��o�2�c����M����R�`�Wu�҆����+0�ٲqc�_׻��P��O&���4�	y���uXQc �]E*����?����?b�l�������d�s��j ��}��8�g��?E�L����o��MO��w�������Μ�����*��B� �E����u����Aa=��~ �2������˝�~�▦O�xs�����O��n�������S��O_4��T��f0�YjO]��Ο���~|�ջ���x���׻�N��p�-<�G����2kfN��Y��ر��9i�n�WQ /d�bo����c�6�Z ��Z+������N�g��Kk���B��N��05���e���v�����*p��(Mʗ�;TD"cqh��*��4�gL�?�М�[R�R�3�A0�>H�zm���[ϐ��E��^����,B���u�'�PMä�TvS���7h��d✩�y&L8U8��e��%��'�|��$�4��L#�߁����_�^)������/�p[J�{:��=��2{J�מ����aO�_M{:e�ӾаE+V���B�(�읨m^���k�ƒ�����d����g��D_�;W�+���_�!��,�\9�k�ݶ��x!�� p+�lBv�N;�%=Cཕ��\Jr�y�c��.L��^�_hU:�>�*�~J@��*���:��\[����	�z���ۑw/%F�B�)u2ق4�h]�mA(b���ʧ��K|�&���2���I�UJ���Z�Ճ���������e�V��5�h.^��hD�KѾ t�-�)-�� �0���r.9�g�s�Q{���l�X�!ӯ�C�2�P|�u��vc�g�:�����,6לƄW�R����j���_h�:�C��<
�dv��Kv �+r�1b��o��"h}9�ģ)��nT�l��z�P��E���$�Y%���&�'�0��p��z5�(�2E)ȣ$O5ؽT�Rs�8�J��J-$�4�WLWuj�Q�Y	��������u��[<��dԐ�e�I]{[� �[�8��C��X��B@�-�ĢbB�hD�\�?�L.m�.�CRx���T�'Fg^�eF|4M��W���8Bj�����B_�����eT�:T�� 3�.��}ڸ-S�4�Ŕ�X�ՀI�FHd�i�aC�^�B��`��L#E+5;Y��@wk6�^Z*{��AAg[n�[���*�a����B%�w�hΐ#�1@�0�����Uʘ�����6i���&��1ؠ�#�bά�Cq��˂�2Kr��ق�J
p�?b����:[c�Z$�	mf�8,L�#;�A��òF��l5�(l�ӂa!a-ė�^�F�V�ސm��,K���4�E�&"���N��[�-��Qh�����58=�zU�
��7K��g��,��s@/ћ�uz���o�9k	�?�?co�l*EeZ�p\�����H�nj4�ox�9� ߼-io^H����Uq��6��J��O���[o�:w��w.��znU4�v";�=�د{C,f��Q�:Q3�����M�BC.���qμ��Jf�f@����>n�P:�\��ش�U��J]<T�����vSh&]����e�16#hl�?ع�ƿ +�k2��<J2}����,��_b�-��{��._�������8�)��%���t"��/�@�h8?�Mo��ovݰ��3g3�$Z��BK���f��zD ��T�?YCZ,�P�)�-W�WZ��^$��i�x������ae����<l�&�}O5jRm�P���r�A��r5T95I����f����uV-���6c�l�d(������s�p��n
K�s��ϻ�8��ޫ�k[<i�݇�-/yذO�)�ĤB�}G������Rh��y><�M��,r:UWw�Z�F�l-4X��\q/.a`������,��P���Sr��S$������l�#��/��wG��$�Yb%�J�[�N�}Paՠ0G��^�k�DC��k���vR���R�PT�լ8f�O�ωS*(�Ay�O�`�Pۧ�g�x��ż�îx��3��Xn�1����0���,˛W)�Vg��*,74V��!�0T8PҚ#_w�}	�вSŒٚ�� ���ij�����Ԥ��f���ךX���!�#�i��'~m젡l����nqxw�}�C�XD�o���]�~QC���K}��������D��/VU�_�Z,�1��I�����<��}����7U*��I�4���=��Bw~K5L���M�G�f{|�E�~�uݷw����$F���[�_�K�3{T9x��ǡ��"=�o�Cj,�����ǟ<'4�t�����?n�at��Q����5M*/�%m�=mJ�A^�E�kQ����(=��1|�� �6���sm���$�@fpt����!���T�Q4�k�T�[x���f��l(����ku���k�2�R����A��裧(���ӠY�gz�9NGi}?{���'��J���m�T���ߏ~������BFd�Ϯo�����6���,�1d(�I�*A2�f&�&1�W9ؓ�:?���#\eM/�\>1~{�������0tI�K����ӌݗ�,����Y8�\���r^����o�TG����Ǧ`4��ԡo�Rӄ�핚���#����#�]%@�/J�7:8��T$�t�w�b�"�̩��9��ô�Ⱦ�z���}��ץ|_�Bғ��Q�+�T�TALL�����d��A�d�҄q� �L_f�<թ�{e��i<s�Q���@�_~�����9�c�_p:��y�B�K��Xf�D�N��>���'6j����*9��!�
]k\��xr��I�2�ty�4FCn̢67����`>�ZlYb�[�0��Ɯ&V�A���^� �{;��D����K!�X�M��,K_?;�Ly�Q�j�T���ʩ�4FKz�U������-Aү���(p�˔����8��{gT�
sIm �!^)�:S���#��&ި��~.ѫX�`!�`��j�x�<�"��g�U�C�3Oz���;L�d�{�L����
��������G�r/GE�Du�������+�L{q`����[]�_���@�e������X�3���D��<�%±<~@}�H��\�w�'���h�Oꥱ����%Dr��]=�@ZEl��:��龣�K�U�s=�����D�fUR��Z)
zR k�޶4����^����j�]'��@�_��B��w�ūP�s/V�*�x?�d?�"�f;��*��u`����~|7eB�u���μX̵+�ըO��G���-�� �8�q�q[�.W$����*;��X=`��4nU�[���k�-�����&��p��c�e҅�?C]�{@�-�Od߲d�Y�����6͎OH��u:Vn�>�]�$����;Fe!}���WP����[|6�d��uJ!,�Mc�D��^������K�O��P:������*c�*�V� a�!�������{!I�����kd��I��/w�2��i�f*���B!�R����/�ow���v���m��$A9�v����#�;��.�Y�<�@���5�T�������gĆ��@����j[���zJ�P�'�Ƃ��Xc�����l�m�ݠ����vIpjc���,�#��}�מ���*��W�^���H�Xz@�,�E�bh��sivM��{%D�!ݸһ�
�;g3����j Ri��_��r@ח�~�n��}�����a.���⦊�L�Z0���d�H�^��P��g�
�OW�I��fj�j��O�v�=m,^�6/������}1f���]S�M����eqw%ƨ���sI�1*u�����r�:$8�L�C�l��C�\��a�������	b4y�P�"X�y?�?�~2ӗ!d{�=�[Vu���z����ʦX\���T� ��>hl|�/��Vm3x�Ā>��fo!�d��bTl�v6��.ts��,&:bצEL|�n1�{k�2�y7�����暑��sE#͚4�����x��4kL���z��� V]��r�����{��QHP��I|��i� ^x
2+Q��V��
�����u��3�2��vc���RE�����fȐ��7a]u�gi�BdH�/̥U�9�Uw�,%�W�Y"+ZXa�l�R��Au�^6��yQ(@���}EZ��~O��k˖S(l�%ѵ�PZ���ӌh\\�utN2�&q�eՉ�.N8s��Qy^"��u/T#�@�NT�C���o�?"������!t6`�K��X��5&%7ܽ��F����j�����.��+�����k�������ک&?oj�M����4�;�W�*�ך�������G�^���/��\��^	�xU�1^�b78+� >���%��`ݳ{�(�Rv]S]@L���L�{xa�i��O3��t m�JL/<n�}7��
�����:��/ ?����%�se�«���^3����<�������{��Óf~��xo��^.o�{~*7�Ma�����,���$�g��G��"����ǆh�?F�df+e�"�*��	rL|8�
=�΀\4����G5ء��=�24�`E�<T5�2�R?b���?�fw�^H��?e �|;��Χ�v�T�����9Mc/�ԓ��ͫҌ*�mo���8P+�J� 2&?�Y��j���1f����y��m�f�|��҂gם��<�0��yC}�4VBH��C�f],�q��qf]nH���v�SmÍ.
YO�K�^(��D�Ult美��Q��Y-�bp�1�	S�}Z��� ��ђ�Ӭ�r1Gw�����&�+y{�)-c��~z^�� 6#3ƥ����H��S���\��>6��JMyu��]5Wt���*Ə&����5���cSIN�2>ϸ6��GA,�-�j��6�dx'��̢�4hj��I��k� �j����,�����`�O��,�SAV���T�Lԓ*n7%�Q�%%6�!B� ���˪v_��@�S>��7��[M�8e�b����1(u,�<�B]�R����i�.��*%߈�݌�AF���f�r��zmyq=�D^PK�H�7ܾ���[rm ]̈�a���<*�#��s.p�^��^�_�(���&��s��'w��_HX�����M.��$�Z��v._��8a�0��,X;�v����
{���]����h���~$�Yx}��\��
K��E�J��a)*��]"gyc:k�"T�zr��3�����3��D?��GIEJ)e�V��d4k�Y����	��92�^�]q:;1�m&�W�"���Z�1_၆3.�N?�:y�H��hθ4�')6�ꇪ����:��������η���@E���<B#�N�����./ޒ�K6��Gr���sXf�̂@ �(]'���uT)"�[�}C(���!%���s�΁����`1(�:6Y��S-��B����l*'ה�}?i��� F��fZ|��yLUdD�NL��"�V�Z�&kL������M���SD
�!Ys���I��J)��r&�FG����Jh�#('b-�	~�!��6���]M��J�I�z�5E2��]v�u� �q�5SH��4�msܐ}�Pms��
2����#Ő�t���j�44���D\�ͻ���
gY�v�N�ѳg�c�{�άo����[�I���`qZ�V\�U���j�u}�����L�BRβ��f.�
[4#c�D�=��š� ��a�;��ޒ1���n%���-��m�Ч�m_�k��s#�T�T�b�@�fN�佔���!�;��LM�{���J�v"v8HD�Ŵ�Ei�)R�go�����!��ܮ�t�L��\/�%�� �3����,�
w�'�BQ�*͵ErHQR�;F��o���9L'�S��J�}Y����#�@�I��Z�ȖG���6�d���T,���X&q��}�){�.yc�?���?B��θmxo/�#J'$/� �z��H��-�> X��][1�{4�Г�uZθ�Y��s�9����.� ��s^R�в����ޖ��F��j�jTU+<���ij��z�D�\%ʄ�JL.ZV
���|��fx���N����Jt�`��Ԋ�|��V�vyrC���g�k	�VK���l�1��V��bJ�䏤n�������Zz�
�Yz�9	Nc�뺡b?u��;#��,�Ρw}��C�{&7(��8�M�OX��s�%t-#X����ܠ� j��s��^���3r�~�(s��t*Jz�Ї$"uA���R���("YW�h4�5���(�:�o��٪�������j,�l{u��C�Ħ R�����X�u���h���3Nu:�"�M���BщD��T�U}����9[�߹��K��� }i` ݷ��ި�ق�J�F�2�m{ywtVj�^8�bs4,��
������Kk�y�Ǡ{�=��t���F_���}�v`�t����O�j!�Q�)z7�����E�,�� �s�y�tLrho�W�͔haO$��(+4���䢟��t$��<L ��0C�!N�#jS���&w�
V�6��_j�\wD:x*p1��w��v:�=#���X
�L���[d�]'쥱F�t�făBQ��=��h@��Z�XT�PX�H�5"�b�LX�ؒ��|��B>c�R,<��S��,���vY��#�ab]����!���^8~u���+ה���������ᅰ;�5o8��y���P�����%��d	��H��S�Nȇ�V�H��5���zD��~��`��@X8�b�>�w����L}Q��f�O��+�Pkh9f�[:��.>��e#�1P0@~���X��ij.�lV"/���\>Y��XU�m�P�P�S>�H�RL�=���a.�b8@�ϙớ�F7�lu����H/2���&�P#r����=e��h����af��	^|a�m�⬛��ً�E�l/��7�bC�c�����A�6�d�b3H}D�!C����my"�È��8�gs9�������px���m��U�e1�h���������c�]ǎ�%w��:��u<���W�V��V��K>�w�㙶�����^?}���Ʀ)��C��w�!���"F3p�TZO�x�)���� �f ��N=yW3�ԥ�&�ss{C��C�~��c8��l6�g"C蠑��(��e��I�^x
�]�������ʛ�/�7-+hm6�H�g�ɛ'_>�\�\O�Zq�@��4א�h�W�OD��+�:~Ӄ`r����rE7�����H�]��^�?�ۿ� 0��p�@��+2�@�;�?�k9�⒟������᯷O��m����U�j\X���m������p3[lQ`�$9�
L�ul�ՍF<z�@}>�#�m�77n�u*�S�3���� �G����u���a��
��z�0�,-��f0�g��2� ��'�ޘ|�V�Zx����Nk�w�ըޚc�pt�mU^ɦ�kf���񧧳��cG�fiԵ� �`We�]M��q�40��R�0T��^����ᜠ܈��#|�EM"��!�}����9��8'W��Va���C����J���؞Rx��?��/
W�q��_�L[ݮZn�*���|�5�|��9�Y�4����,Ii,�-wL�,ܳ���������	����Z�=�y܇��(kC��c�d��~�G�/����ҘM=��ǆ/P�/)=���-&�.�/g<&�W����I~��PNL�^6�`r�X�3�.��>K��Xɒ�9p@��5���/$w��ޗV�¥2���.�_6��H���OVϭ�6I�rx�\�J3���W�L�ڥ���R��s�b?(���xi���4xo���]X�׽�i��-ʪ��T�݁�rC��,5)�W��0��T���/�	G��%)���������ׂ�*��*R�C@�� �;"~��-�G�_.�w��a��k^�3v�/X6������aVM��_�U��W��!M��T/I�x����z��kL�x��V�$BHG��n�j���O�u�������:nUc�[�( ̤��ּ�����}�;��#��h����g{�>��ý<���{� �/Zs�/�T#\�,��9ӭ�gm�l����U�S�U��E�"?�"��d����-Y��=8���%0�n!�}b��J���06u��<@΍��ûb�v���Ғmj_+y}>@�X�q8cl;n��z=Z�nb�Ҍ9�iqJY���D������ci��"�`PyD8~�}������4 vü��?*�f�Y���BU"��Ԣ-&`ҵ�-q�0�Rل)��q������`�e8 \�3̮����vO,a)+7��ɨH�JdJ^��@��{T���H�ۭ1MH&�l�0Go~��hM_;0!�ŕL�cb�D�	0��4E�Vk0Y�0-�x���\���Y�ĉ���I��+���9۝yI��^J��gI�*���_E�lP���:MI/�����n�o�TM(��	���+����~'15�VJ��iv��%�vS�����ݣ�C�u�y�D+�`ݍ:��3�~��y�e�ٌz�|:���q�f�s�u,iG/��v�X��.,��F!��#x�p8q�&��l��E^��͑�b��u��
P�#<c�X�exJk�PwȲI���_��"���R��K	o˭��ļ1IK�v� ))鎗����Zۋ�Qxb~~kk��q������̹m�5A!�)�KR�Uq�R��3S�5i���<aW�"��e͊�fEnw��^��=����sŅ}B��r�΂�)Y����Q�¥�]���Xu�g�c*�������~U�_%h�+r����1U�-��l�?\�?\S3��7��+Z�E�b?Ez���W�(5��$�+T̓�EU�})A�a��`72�=�s3�����ZE9�d;�U��{�SK�T��.�Mna=�[0��-��$�|��$vL���!V�P	A��c�z����6���:�D-eBJ�z��޴g�w!r(����x�2(B72�T�7�R�x}�
��+���:��E���ʢ��� ^J,ѕ�D����K$�^v�^C��j�����=�exM������3��`}cMA��z^��lU_�n��|��VS`����N
ԗc�0���⋃�Y��fߕ��2V,����
�m����'\V�',�D%*/�'����vq>�$Nh�����@�D��-�n�#�#Avh�*����%i��M�V�K͸E�VEU,e���
֬f�R���^]h�zK��?���ȉ�p�*�.��=*:`i���'����3�A�� �wQ���'�������B�-���[�i�����_g�e|c^���s������qE�1B� �1=��̭~�*}@?����_�R)��n�K!|�Um�e�U�������ѹc��x��V	عB�(������ �HO�V���<$����i*�@M�P]�t?N70>�e5Z^��w��<L��������@M���'�*���G��#�E>{w�ٛN��~��S�s霏��0|��l=�������s�����8�������7���Xi[`��N��]���}�����i^��b�_D'�E���Ë��oa��F���d��xyZ0>GTO�},����C��e�����By�-TW��0/�L:9�)�6����ť�k|ǩ��ӵf����(ug@�'����X���Sss��S?�֣Y��֢���B�[F;}����v����>l���kwx�:�n�	\��g�F_���s�.����y��'ƤeqSX�0��q<�1�u����IN���&	��4�+	3)�Hr��Z��#�$y9m�w���������@�g��\�rܐ|S{Uab�bp�L��EYc/|%�d��}b��x
*����#@k�۬�r��!`c�|K����+���L���E �場Lp0��K�:�	B$�Ô��sء��@^,8�H�2&6rn�w~ �����1�Y�n�HM���w�ء��_��i#d��$I�$�C)�@��I���"����K�
����[rMJ�	��-�p�) W�1��L����X��3�F`�F���ilMH����"1a:�>N�R�@J��Zݩ��8�����L��ȉ��nr~�t�O�<�W��~r�Z�^��6gl�[H�̸�,�����	�r������ZV� �7�ΰ�c�D�EM��$���������&����\vv�"�/��k8 O���<��9�TM����X/E=C��r�WN�����6�u%��: ;�dfĹ���d�c����+�y�~5�����PE�$�24`�'ߩB�N����9Bu͊)@�����UqXV=۪���ʵh�lo�2ϵ��j9����;q&�Qא�R�79�5����E�`"�a'���5'`t�m���������
���K�&�R���"�}χ��ܰI�ѫ��CV+"GG�GX�S���R'��GAyr������!��-��Sq.��m-\U�EY�`��H�A(���e�`�<���%A��/��/��-�����[G𿅹��!�s�╼S8�f�Y��M�P����\�x>�#��9�����|)"ىH��חB�QH���^�IZ1�l�s���$J��T)�yvB��D��K1�{#&��
ϩ�$f�<�J���NX�49,�N�/&k�����N��u/C�Fx�ÈQ^\�iy?���F�k�.=�Xǭ�ZI����<^���v�eb�s�ϸ5%'��}7���3�������V��Q'�*QK�P���j�|�*�(��ZBݛ�?���)e�^�6N'�F�Q��G,u�zM����x�	�����;�s7��~I	|i ���0�[����%Ϧ��Pq`̆�P�Sd��h}F_�V6���u�c���DH��rY	��Oɬ�Zj�+e�.]L�
�5i�v��|���B�gG�#uy�%����+��d%pi�t�T؃l�1� ߗ�(T� ��xCQ����s/,ߧ N�N�)���˟����aa��;p��2�-�����r�SN�"�c���s���4;�ߠ�:��6��;��u����&�'�'��� q6�g�m���m��0)ox�/:8L����T�R���i0�n.�����p�ޚ�]�2��pRWX&������/�Q���m����B�2��P웬Fi7����%�5�K�}1�_�Ƽ�\Pc@��^���%hy���%�k��ˋqeH $��e�N� O+�����M��3�(��&6���E��*MO�"���!e�n���93V�Jq�i ��M�kWo�$P�d]]DM��*���j�h:w@�����F�u�B���f Mg.o�G|5S�PA3ۉB�s��5ޏ5��]��   ���}msǑ�_i!���-^H�^a�6o%����i`c��is��� C�0%�����n��E\(V-)�EK�$������	W�U�]�o�U=�$�a3�]]]U��/Of�t��9H1�2VM��rD��J�8/�拧s�J�@�DӍ��vX-����'%އ��X����A�4{Z��*�|�PAP�k��o�V0EI��cQK琉2/�����H� H�e�[��;��Ԩ@��V�.IO@3��*�RIe/\�z��"�i]���M	p�
;ɶ:�y�����2��a��U1�ٯw\�D���/����v����kRbys��sjk�D���h<�����`&�܄s\��
��zٟ1�`/[e2�.��.D���c��w1?/��1����X��I���&\1�
x%�j*��
T ��S�ry��L��1?��7��t�57�C6�^����x��EC���{���&S4Y%v�|11�+qd�;~�=���I
C[�)�G��ߕ�������ۓO�p��pq��>Y��ΠW�eJCj�(-ut�	�H���<��^�lXBu#
n���*��8dy�2��\�̨$�wg�/M؝p�>f�D���5����i_U����cec[;6g��)"��]Eл$��Kkd �e6;�!�����|��;����[�썟���m��F��'�\+��>�.;��t�g�*�5|�d��F䭳9/Hm!���T�CU�)�Z\�.�w�ݘ;x�a��>�6��V3���m� ��^��I\ٓf%P� �$��������/n�:>��������:5�U�<��V���u��ve���2��׌H]~�op!��4�S3%K�;0��@��eM�Hוּ�T�a��C�����u������A9�}���<=�F4�v�?�73�,�2��|!��w��3W��mUã�iqjf�ښ'^Џ��w�nsE�5���Vݓ*~�� �8�B�Ae�jE��c�W��cQ�ˣ	��+�U��oף ��U4��}�f��9`�!\u����u�J�ð7�岸�Ø�jr�xQ0`�\��!S��$Páy7X��3�c]�@qi妫�n��Z�����%t�2<�mSԆ� C��Ã���V��#\ը�bE4�'(�`VW�:u���ă�5���1���v2-B��t+|�-�E،�[�pG���.U[*\Y�O�(�||eV٫&�������$�KCzj��\/��[2��kDCCYTL}d1�ʳ/N2˘���~T��E8���b��C&�����t����u0g\j�0��VX�J-���	�z/5��o��)7�������	5�SyD����lp��-��LEg��f�d�]�>��6���Ѐ�0�+�z��!���tـ�8k4����h<Gbg�	#ݨ ����WU[��+�jz����\X�A��5_ŮÚ��r1��F��[������!'��v��P� W��K3�p������e��F�
�6� ם���:�76m,��>SS-Qm%5��
�IϪii���[
�&������ˎ�v�J�OKX����`��6U֘X�6W]_ֺ�u���3V��{y���7"��N����%�m.+��K����*�,���Ѿ������(���l�4�l����oeXmӑ��荲~فM�l&��θ)��*�a�.6`������A����=C!�Z!7k"��&4?�þ<�6�KB��ʹ�?n���HJ>g��(ۍ`wm�n�]
	��`&4S�%�pUS+h���B��M2����B{y"K/��[��_^�Ȩ�ܥ|�qv�}o�]���t4�9�x����-��]ƈ�[�;q�1!�s]`�#~?OT�\��D�V0���%��1M.�F_�s0Y+���@�>)� �<�����:����R��E�4y¤�ۚP�ϐ�&�� ��_	_�"��؄���:2'��ȡ�s��F����(y�u�ow:A׻��Iǉ��-R���G�T5�!�=��{�ܝ���KLU3��T5��Y�^�6'k,~)LP��P�S��7��iRb��V�������Sa���g�}�9�W�]
�l����z��i}�5X�˪�Ñ�tA��l�����U�"����k��+G���"�p�_�s��fw᝴͊F$�`���S�\AQ�oVr��.�@�N�]Zq�B���7�,N��ԛ��x�,�M"��B/����v�M�J����*�_3ܚ<և��:�L�� G����Z~��1>��%���W���:����O�.g)�g�槹p���O�.���?���w�*{c\6�����?7n�~�xxx��iOe×���2_��ևL)�7[��v�GL+k�D�zٟ��a�9+fQ�T	��<G�i�F�'�	ǆ����{��R!��		��� =u�6\��ƀ���������Ļ�� �8�����$]�8�n�[N�=��l��l�]��rb+MK֒2��IY��<��%"g�N��r��T5-��^_b�a��?x����q�=��%,K��rf��lP�>�%u����P*U!]Dt88
�A�S�=�� |��sٕn0�<��L NR�d>�=������mv�0�}��Gv��f�eg.q8$�'�/����\�f��uf�\J��1(-��6жt�?����P�JT������&]R�/wm�sP��*�HK��L�^����b�B��.�"���B@�����Xe7��j3�E_�RϜR+�\��+lvu.\���y��W�--�̅�51��lo�P��cl>���8
n��|�G�ԥ�3�	di��ּa������;�Q�z��B���-����j��6{Hk����0�nw�p3߉��/D`�z��H����67O��@������Ğ@�ȿ|G{� ������ʶ��}I�xʟ|W��9Q��Ͳ�����=鰡ԗF�4`icY����z�����	�@D4�t�TP�#�9ж��2��U/��;�~�pS�,�>��Y9��LUk���j*�|�͋5H�>+��)����7�ݮ5cfl������utLWQ4N�.4�M��%e��+��R�g�=�*(����f�iӆ�rCb���#g�8O���?l�Q@�*;;C^:`#� �7������"Ն�x3)���wL�w+�'���W���ka2���q�� 7}�n�OU'�xmn��䒮���yRGs���¢6�{����4��si-N�C������;��]�Y��_����s���L�0y\qD�?�A�f��/�a+5����ǡ��_`��f�bB��V�%��:�;�ȯr�r�6Ƙ[(5\�F6]�[�{�=r����ɧ����?���ۦp\`G����őU9�!2�r ؅�uzA����eZ�d�����î�zc|c�B�[�A]";��N�v>���%޽�A�?�bku��[n�gJ�Dx~/�>�lת:C^�㦓7�1<H����;�R�k����6���,����	Ml#'��d#`�vYx)�YHU�:����#�5M��L��)3Y^��ĝbI�ٲ�h�B�݂�0�u������1��!e� �ͬ@�Sy�<��U������L�oВ��n�g�nX��I-�_���R�Pjn��i��XS�	�`��^K��F��kTz#;����F��Q9{�G�܃��$��y-Ű�=Y��1O�tsw�=�YV����iV�H�s��hb�ZX���u���ܜQX#�	D�����yIL`IW�Yf>v"��ʛ�1-=���c[�r�6�	�+B��.[F-hIca��d>$�!����x�$�r�hˤ�8J��AO�n#}�؏O�!@�R,_(�/Ֆ���i���P��$�y�1��0QC[��Wȯh�hc��~(y珖�܁Y)�]\t�:��#�6���,v�j��"K{}��K[����w�~��I�"�|�~yYy��^��D�b1�����bf�~b R���g�R�:���#ɊRr{�Ae�'@y�V�o?�<�D���0��=�?x���Տ��-�1���5�����}��JB͔��D4�n��/8�<R���x���%����(��כA����xR�̈́��V�80�(��?�E�7a:Z�1���}��jC�J��v�и�2�RlY���<��7r;��A�8��%g�wn�[2�hޱQ�lGCr��/猤6���M���m<�,����r�)�O��/G�Q�Z6���:p�^�Qz$�&7Rn��qb�'����&� ٕ�Dy�ߖ�̈�J�3_b1�-�P2M�0q�N��(EԿbQ(�NO�/.z�ȼ��d�3�Bs)9�Ďp�O$�AK܀���;��#���m�Kދ�����[0XoA��A�"�ҳ]�5��Z�#��*x�6͹��9�@�Mm�'G��V������9�W��<�-i������I�?���[K�������UX���"���_��,��*���Ur,�&�>a[����:�y�S:\��Ix���Nз����� +�1�]��5��(�^�,���R���H_�v��J��a&o#�X����ٍ��t������39��W�ON.߯&���'"���0�a�v�^��Ԧ>�[��A����J�D�V/��h�Kz��%�o�H��ڛ9���R5!�T�7\O�ߩ���b�k���6�E1��t�h``��B�_��\��yl�� }���ۓg���7�*2{�H��\�9�����N���끭`���q��BZ(�c�_�õ����]�zh	�
��񃚲���Br-�c=a;�ϩ�L��ń�h���(+�o�Ϳ"W���@�9, ��'����؟����wg��ڨ�vq���kG�T�P]���m1�q&�Q�<���Y���6=�z�1�p����!�ax0yd�ӪwY�_�u*���n��Ҿ��\;����
����f���Ĥ�a�{�[q��[��|�����c6�y�Zo�:~?��D�p�.�M�p�6�:s�5]"f6�5��}!����2������P�ni>eM�c�2�d�"�,��g�SBE�#�(�����u����7z�p�otF�pci�=#_J���;Llv�?����aW3)��ҏ�v�q�.��~1����3���7�6�>(�~�b&�G� /�^���L���?�Y� ���v%\��V��A�%"n��翰W�k���T�4�#EDO!z|
�h�`y����c�y�Ae����Tݣ'A�u�P�K>��|J�H=��`�$�=�Ѥ�^s�#�S�($:\�e�jF�ҼVf��ZR��Z汣Y[xrC�u�(O�|B�S�g|�𳌦'�G��U��À��<ci����Ͷ�	�V4,mq��jrbj��0M�tF��a4�����
#���m-ȳA @�[�������L���������A
&��r�7��1�AK ����+��l\��#BWoX
B��d�^9�1��K�/_;�/���MmZ��J��	�׽k*��h�z���8e����0���m����Y��F�9�>�-s��n�z��0>�"�>9��>�]S7�*Ca���fN��)R���k���" �̮3H���S���m���"��x�D�08�>�'���y��������;��a?���sCxB:e�ʏd,6Db7uN����:����<;�N/�b���	��L�!�H����̰�.,��=k����I~�M����]�zY |fw�]~"�*^qܛ������5 z�)��@-�l�������|�����l��.r����~�<�ՂR�-H���6�c��'i�L���R�}� �p� �^�r�,��E�� D�}@!��|ׅ0g�!q��!��`(��6��&9Vl����d+�'lefl�w�Wa�����G�.�{��í~��^t>�O��a�C�yo�� �5�"F�F��qn�Qx��쾀�M�f/'�{���g&�v��"�2S9�� �P�I�섵̔�pA�2�my��E�uW��㮟��׼qU�>��<D��� *)��Q5�����-u���	�!�cϛ�K�A��Z��B9G3�~��G�ʢA��;�>��W���O�L�ӱ������8	��.l�$�҄0&����}cơ�V
>��F�Y���,�7���dV#&:e�CD�:��=�SV#+�=`�{,���Ox)�0�woR�B�|��{���|�ho|�1�}V�9�a"�Ox]�Hٰ��<�_�$�>��-�drt�
{x�����n�;A�~�c[�.�I��;L�����a��PԞ$UK:�^�c���þ>�e����0�Q����]ܿf�Y.��0˅�*d.$SFk��v�l���C@b�)HgXdAy�:?c"c<G8�\�t�-|5C�a��a�\F���͑/f�.)��(�a^�+)���+��"
)���&��x����X��)����1S����`ȡ�U������ᤰ>(Fe�|��~Q	,D9	�X^����|g�(uvY�&��o�4A� �֤g.0�I�ZbuQ� ����m*�s��'���gxB|��Mʸ��ѕ 
�>ur`z��G�����F��tJ����t$� `�b0�gɘB��	��B���� �-Q����d�	��Hjp�U�&M| )����2�
r�D���m5�B&�O>��/C��j��悆�&�wݠ$�����Jص��ޚ�5G�^�dP���2�eG`�n���}����o���͞�
S��&�7��A��u �u@֤)IH����J���Z����6kM�,5��̚�TYENd�v�,�&ƳX���|�aZ���]�؜I�X�,$�� ��[AK¤�]�=E�����KY��XT��	%F��=hP7�M7���˒�tx2���䯐RW�����R���Ue��e&@]�C��	���c��]�FA߿EV-�ױȈi,yf�Υz����2��}	�w��l�8fhƄ���.�ϫ#!F��5;��Izˆ��"zO:�>��F�XdM�-��߂W#g�ȚS
�x�m�񶧦=x"kT��ʹ��fQN�Jx�������,0ۅda�Y�b��Y*��/L�Z�������k,��L	�!!(d#ڙ��� <іT�tW�uX�d���V�*lv!o�d��1�&�Fd�Nj#o�sM<�Rw����d(Y����V	.���:��Xղ5Q�yk����@]�M�Ցr���*����)�Ӱk囷)�.xkh����1�o��c ���"ns^���`k��x��ʤ�9�+�mb(�I1��T Fw�s�a��6��g���!� _4SE�+��R �.Zr�93j0]ed��ߎc�l#A�l�P�i,��+���,p���z���K*&��UP���!�>�L7�����bj5��rk6�YJ7evN[�i(�׀����$�<O�fr[��!9�4�w�ཥǳ�G����� �e�؜1lWڢo�T|����$`Ca$9�������vb�U�;L��O��i�7�`��}f��v��5�v��$�AA��eh��V��ޚ�[g�|�	LD\4�A!�N$���d�� ^��κ���y=Dʝ3�dxU�2�GaN,�s&�[��|	yD�N@�O��LV߳��\_a=�;�7�8Qe�
�I,/-�C�T:{�`��H=V`�
W��,L� >*�Rb�-�K�&��􌺠h6,V��d-�sӂ���T �u�5�����,���`վ@G~w ��^���-b�="W`ry�����}WX���!-��c�Ϙ'[v��v �n�~����fczhZ�-�M+p�Z�@z���n7& �8��i�u���+ �QI���nJ�����$�-6����^>'(1��I+��[\�(�x ���p� ��v2|qi�`���5�@��r_�=���U�>�U$���^�������;y��<=,��Fp3详oЇ�S[�����1����~x�*$�`�"�[ �T�)S��[��*r1����(�U�.�;=~+��j ��e��S��!���셈Zr�:��V�����X����~2Y���<���Ӥ;�y���v���?G�^)���fe�?j��eM*=B�����7�.8��:��v��s��
^��rfC�:��~~������P�頟�Y|r��6��P�]����%pߊ vRq��y��">��e���rc�7�ǧ\K~���kZ��2�!�E�m/�|��kc'?)�6}�"
@r=)�D�����S��1�WM~h;}�z��������z��*Kż�B�k&0pb���@��\V��xu��?�f�p��Z'�=pĉ�V�8���iT���ۤ,���|n���4
P=�<�jI%�Ǧ�=w�YS�5@�ct��H;��\T���?�|~��zs�������OU>	�p�b*%�ѡkJ�D
8S�_P�gfY&Q�%ϱ*;l���I�\v�!eUf͕GiU�\��Q�\j�⻸�>��ݦ�ܮ��U~�j+�@,b`�c�awC=��d�x�e�\��S�C��N�ә�0m�̷��_�t�2���p�%.1�k�+х}��z������.*H}��� �d�'�K�>�-Y��3�7� ���.�_�����!&����.o�=�W#��,�Y�s����1��J�'1*�A����`A���0���4��4�)���E4�В�H�j�y�'�T�ʁL-�5���HV����P�A=��ʨ�`��6�&ʤ��E���)�ฏ�z(ؓ�7�|Ғ?b��AB��#XB���W��Z�J2�@Xc��%F������A��"֭'���l#Ņ�k4a���w��UN��0)�c�.��F��>�|qp�g��ڤ\�� W�;����3!N#�@�Nh`��^ֹ��5����9�]ͺEZ�)f��� e�����ˊ�j�^��xWj�e��:�,���`b��&��>�H}��&�=hm����'�v˸�/e�~tcÿ�e�/4�<�e�+eI�a�~� ´;X5�����I%J�����(|�¤ v\ɥA�y�Sb����S0�p��]]etSaNĐ���B��k�M�]��/��r�L�(���!6��Hx��]1�GY�f�й3Fr_���|汳ﶬU!-D/L�F��A�#?X2��s�D"G?���y�˿�0�Na�6=�ꔮW��Q{��J��-��
BOǺ9��4}2
��U��&�J ��q4���n�8&�ǈ�w�:쀧��y�J�Gi�ųþx¶�ö�d[�{�}�6�G�b���s`�o�6���4K�eh�<��4'c%�I
I)+ΐK�R��;�:t�Q�
�ⵐ==b�X��X@�����TW�7���Xzi�t�BE#d�ws��0!���	6o'��$�c��)�&��u�LS'�G�� �X��D%3��󼦲��	�̉� g2��4����Oyq�<z������9��4����E$��3;��v�������M�<�?��I{g��U8�5	d�G����Z������_f"ȯ���k����)�C9>��i�ۈ�]E8����X$�|B��i��ZwȠ��CN���Q�W�AS^�� M��',Ҳ .I^P��1W�
�%��e4ǟc�}A��ìp��Y�P9�kC��LF��C9�+�;�_$ڹ8��G��My{Q�����{�@��ю�@�JkڹRS5#x�	Ք�iQ���XU��&��Ģ�_�"L�i+��ݢ�d�]���� R(w`�AWa�.�͖/$��IQ��P��Zy�~n����=�Dra zɠ��Qd�JU��R��َ�Q�0����0�S��� �0�A�*�O9e0������S8�J�|p�{n$�����"���!�|�0�7�@�F_�y���+��;��<cW��J��~�;�xt$c��a�����W�����0N`6s�n���ֈ綦�V���G8�i.L>��H�ޚ:$��{s��8\�/��fjn�U�f6���BI�y� ��ú��7�l����x���Cd�����|�bX�8����N��WOer9]>9y@��M+�9ס��5��S�U�m�$s�ڍ�.�J��� ��c���t�G�37���?��3m?`_��zaW=�X%��Ofa�Ƣ�ٮ�����x�+n�O]q f&D�P#&�����Bv��d?��l7�;q7�1�f4�� ��=�@�U��=��d�r�3�*�+��F�RF���y���m8�>�j���s����=�S?��#������/1������N"л�Z�&%��`Ǒ.�oD�m�n�O!���r�%2u#oL�_����;�Bz�JL�0RB�飴ܿ���p���\"_�2U�c�G�.��z�tz-)R�J�� 鍺L ���+W����n1������Ww�����񹋿�G�0<��i�6�J����+��U;N ?Fx}�Eq�᪗�����,�J�}�Q�����"y]f<�7g�$�>�s�~ϭQ�6�n]�7��ƙ5�P�O�r��R�M)W�r��E��9������ ���ǫ	<�����؉-��-���T�b�9d<t��k��ݯM�r�'��� ��0j'Aw"h ��/pj?�S�1��D,~�j��T��oV��f�TTUBêZ��U��e�
�{����N��ȷYn�&�����$�N�kQd��h�� ��qy���ϱ4ٿ��T��;��p���T{l钐��|I�ػ�K֣{<�(�Z��f�9����{s���	tO
��p�@_���;F�9s�,B�����bC�2mh����]%��I����B�"����.DC`|�L�dtr�BC(�Z��e�~f{o�L���!�0��Ӝ9�����ֽ��8���@E|.�
�Q�!޾ޙ��땉[��m�V����Bf�T;�µ�|�Oɋ�Vp��k�����tY�>����X_!i�)�p&>�"|��`��XL�C�b���p�>u�~�;	1o��e]��s��F��t>製�v��R�<��KWJx��N�m��;65��=l�u��0x�D���YO�e����	��y�{����5�S��O�N���Q�"k9Է�#^I2m��꧸em7?��|�ض�>�1����|A����k�N��B�-x���f+�y���ě����LK����o�8�8��< QLprڤ/dY磥�q�W��E���o�BV����>�e�uy��Lׂ ��:���ll���Ēża�bN�aשmZ��OZLOT'_S!@tb����-J�i� h�/��|�j�v:���Y�7(�8TH}�$*b>�������I���2�8�D��޼��DM�j�A�c�&������@DOLD&��hW�#��gԒ-=��kⴓ��
��+�k�����_̑BC�vn�~��&���{��@�RL0ת���s����O4�)���h;Z��V��VH7�6��Y7�b�����T���c��݅��Y��V�L�:�ͥE+����|j`�T3��y ͦc��nwu�֫�ތ1����J1B�۪w��<��Nl�Tis ���c9��"����V�2�9c���e�A�� w����,������>[�"����K�FW�Ҏ_�Z('�n�U��?Ŕ`` �jG��4<gW	_;�;�i�Y�F��WKt,4z����Jfx�N����ٚ`d�.`Ya��3��_+�ptOe:��l��N�e� j�_th)B���o\�z�i��j���04�aO�ۄ���l �8MZ����f�)�'k�ª�Am��΀���tZ�"��g7�VeUm..:#��C*NʒGJrI�������q拉���`"�|]�p2A���}��ӫ��VJ��V����V.3DP�h%`I�uJsZ�T,U�	(^Ze$Z��S󬫰@@4�����P��	��&e��&mU��5�k��Yiu-oˊ{!�R��j���R�LA�|
3��V��3֥�v:tL|.�D���gj�����&�b�(8��xG��S��b-�E���d�Lc�	%��Ģ�id3'Y�S���r�,�����mV�+۝5+�4r �xM~����oΕ�루lD|�EK��М�,�K4XCzT|�LA���P�?/���K�N%�����U��j�����0���т���Qh"?BaW��o��j����'۹�����v���1
s��y+���W+�ᵽ�Ϫ=� v!�[u��|�G���xmO�T�o��B�)�E�}��΍�����q(r��y���˾-�T�,��������I�b�.Zg׼��� �2
[k{|�㧪�����E�X9%�@|�1�\T��UĂAa7��#o�{+��$�	��9;?IS��5�;��xz�~t��X����D)�S��T&6�[�������C���΍p����޲2Ǚ~�ZU����(�[��$��AR��(����.`����n��Z�#>��b��T���B��\xJ7$(�D�Uy��F�$D�F��U��$�-���}����M��ta"Mr
�HD'".����Ŀ���>���H��k�[p q��#Q�-��C�R�0jE��6���L�z��ːaop�&�����`LNߑ�l��L6�@,	�R1�)P��|��R�V �T�k�S� ٟ������l���:���E,gf7�VO�'��.%6�*�{:C��?���f��l��_���f��\��a%��ǽ�7,�ewk���2�M޻����=C�/S� Z�Y�|C�Z|*-�z�n�=`G���=�<�eS�ǣ�>����r�3�`V�dӁ=Ω�&o2�����+�uz����ƿ�}��u�Nl�L�G��l�nK-+���i��T��ɜ�k�n��e&��FI+��w9f]E����
^��C�2��f�&�6K���
�H�m�@��"C��Is�d�����Q�p�t��lp�u������n~#�5�!�M����Z�(�i�7��2��ZQ�@�آx���5Y"ެ��*��`m�}�O�qY�/A[*C�K�7��J�RL�>-1tg�t�\���'>�39�(�od�7c�]�8:����7�S��Tn'<t�
Rv7n]qF��ٔ�-4�iJբ?�*�Yœ�+���ɸ��e��\NI6v:�U�Ct�V�ɚgٱ,���*:e�5�����sBc� ���BI^$h5؊��&O޷��+�U�p��1 m�Fn�GOAk ��n���N�pК��q��%�Z3I6�e�����A,�����M%�_ ُ�(nr����69��V��R��4t��i	�cx�Qh�n�S/S��������$�C��>5%�j
:�4�*g���ʼ��[Cv�7�0/Yd�՛5�17�)hE�]F�M��9V�7��<6mOf;0�{�J���H�&^��uv�:,o�iN
{�Nn�4���� m�KxU��v�4�8�¢�.=��`�~�w�w���)��|��2g��K�Q~	��l���%������, Bv
���X����!H����Z��[��k<o��3Ȕ :��L
 �eճ�	y��C��рnW��2�������0�5]�-��~K�ם
5�E�W�
6�7-y������s�q�� ��!�B�Ѝ�)v�v��Г�klE�����Q��9?��8�\w���'
�~�4eS<'����oƣ�6Ĩ ��4��.�xz<��J�K��&�7���&�Ι''O "�{����H�&_��B9q�'�s<b?} �?��`�&n?��0Ѯ�I�e�[�M��C4S��̤�>[{�T[�~Y�3��dŪ,�g2k�Lo�_"ڕk��9��X�ധ��p�C���x����o�<˃��|3�q/5N�Dn�6�g� "��p��Uu��+�5�z���2b2M���A6U(a�m���8D����X�<M�k2�E�Ы�9ߊ�ADr�!p��d~B�]�O�����"]s�z���'�⅝�&���WF�8 �q��m~�d��tLǞ~��E�9.�y���|Q�;`<?FC��7��Js*�.=U�Q��K3^�� �E�A9~4��(���A�	�	��h���xs>�_�d�C��R�e��s����#�jqL����yq�,:���T�Z�%�T��'1���)�����er_袢��=��p�qnܛ��!��m`�/䞉����uJ�����wHk���B���):�b�ݻ�hwXːJ/�"l��a@K\&���;F�P�����/ٰ���K�v��}�?�0k*���S���Nk~�&�v�� �C&���	�Y\���r�6��QD');���%�J3��H�!7
�k�D�\�����J'��k{L���E?��/uwͩ���U��6ƛ�(�z�0���I��j�q�ISY�=N�A�BQ�"&H(�=4BE�W|%�S�ċ�+�1-�+A3�|4����٢E�p�hj�Lu[#I��`�,ߴ��N�Zz�3��p���1���y�������jZ��[8�ǤD�YfU�ʫpV��5�j.+.�P1E����	�laY0ݜ��q-�tgal���:��7�ď���ظh�mo�s��  ���}ksǕ���#�o��d�!�Rd�Z�r�X�]W�*jI� <��V��Xv��w�n��V�'Ql�Zˊb�Y���_���	��~�t�t�t��d��"	L����y?l�f0��"��ݾ�')d��!e��zQ*�ވ`g]����ZBqr2�� cR�FiL��î�����S�gYnXxũSK�bil77���[���Ҕ��DU��e�ݴ9T�quiѥ��\�3�[Zl�^[�RL8���80�u��I��d��˷;�PƠ�2q�޻W���]��
��y^��K��RR A��+3ˉY 9�~^��7��w��hO]�*V����=��R��� �P���@I�=�Z�`�\b�N=$Kv9�J�����kW���)L�-�|��њ����l��!no���y�|��<&Zw�i,t���^R��FF_��":2R�Fk۠;����x�)��H��3Xf�5­I���9�#nL��/����	��ckn~�9�8�e��!F��ƒ�ߐY)O0ja"�*R�7�x4�
K�r]ǎ�ʦ���I���������J�&�,�ԥN@q$��P�t��sp���d 	�����l%Pƭ`��#�#��`�{�� L��8n��QV�0|I�z3��(>_�¸�!���}�+������x���m��C�T4�� ��l�'dڽV{3<�a�vF,B|�]� F��e2P�D��I1��k�|IB�>}}��"�Ƃ����(�Ds-�=�xHyq	�V�c�c�*?np!+X�(�����/��]�F�D~���-�=W���w�у�OF_�(���޽�1V�{��[�� df�LL�^���R)�,��ʍ��d�)n^��,���ZE�Lڴ	�����A�N��0���X.��$6:�x�tV��>L����Ro� ��LJe�;1i�J���� H��`��k
�OVeC��A��B(b�E�zu����'�򛃭�Q��Wc�O�n���W��~�d�sz�9u�#��>.��+'+i;�@����+���_���j������I���It)6!���������7R��=��YdR��l�da^�"��g�o��;��G��kݑʜk�jK�^h����^:,�#��e;Ն���j�;�J���ִ Ts;���@�:P�Iv�cK��g���M�������i�{*|X���QЦ�Gڦ���|��π�ø��+�gώ �����BH���E��Oő��,�6�a���XI^9� ��2y1$ݓ#B���V=�{l*F��0�A�s�C
�S���M��6�6�x�s%8�ڳ#6����ۺ�� �:Nᡄ��At݇y���7�I2e
w*�RE�ߋ�N����%K� �#�&��ڎ|��o��lҴ��J1�X�ۙ�Qv�k4J�T���b�W����V�����|eH�&
�G@��^��%�/����N���wUx*/�&�1�U��TV-hSY5mSYu�w>�*e������숮I�0������v:z�u�d['\v��6�Q�Ux��L���8��OP���a�wL��DNjÑ-|�	�����pX˔+�lm��ݝ�ғ���Qv""����2<!.��0	xL��{9R��X-��JQ�]�gv'��N�ѝ �;I&wLWfpټ���p��/'�]��-Kr�%���&�w8��~8�#�?;�`aռ�d:��B������/Z�p���UC՘��̸e$?��e��"~�3�?��~kF�ԙ-ˇN������W�$W�M�"��j4�1�hZ��FSlS�������HTi:6 ����i���3��t��;{ϑ5�/A�<�0���ω��o�H{9U���U6ϲv�ڦZ@�6��ThlS-`i-`B��= ��"q�x��R��[>5�?ܑ
�>&�g��j�`�<4%�6%�6%��a�S��`͓E��VT����ʵȏ���z�X�zѡ~����hl�`A�I�J�8e��T��[�}���|��/(�1j3Y��|� ��䚑��e���]��۝8(��L��?�!U�I�_q��?�+ʳjt�����(:�������lg�eÞϾ�]���A����g�ٻ���^�Տ������������=�~�q�j��y��������<Zv<�=kqS�{������rO��T��9ه &O�Ae@��;)@��8��1⑁Z�1d�S�q�׻~�Z�`	+�6�_˂{t+�[&c�1��[ۄ� pA��[ J��>I�'�D�n�� %Nhث�w�ƽ��~�V	��A�#q�HvԒ"���M��n�A3�����=< �ݘ��ގ퍽��`�=o���Q������fт��n1ƫ��̒O�;^�
nGa�5����ՏwjK�m,��M~����° �p��n�,��lU����I���-�h�T�bq���z},�@*4�r���2oR7��j���Yzo���4k�ܮ�W��ZȰ-��<����u'�K�Xz��IbbX)e/�Z�)���_>=��V$²�����B�Zv[�����7DE��	��$�R����}I_l�&��s��udzˉ�N�8������v�Wo���=:��-t��Xƴ��){y�U#<7���P�׹���m�:�
�q�]t/%}���+T�V��s�'��f�����2뚖����A��j���m|;�)�	[��j[	�H)�	C�ۭ}��O70�3��,8Ue&�t*.��q*K�c��g[����M8٩���_���en���G۽�����w��"_W�{/��"�>�e��o��`��m���>��O\����������(�1���FA��o�&qs��!^�v�RX7q���8�6�����J/��Kn�U�T2g���������]M7h�����*E�Wf��{�z�|P-aE�C��JkA�����6B����e��(��;Ϗ���,�W�4W��ǅ�5X�;o_�Prȉ�0�3;ۃ�k���k�ۢ?B��ۃ=�\�1��@`\n�5]�f�6-�^l�Y���㭠%�EI����EQ콐�[��3�RR�ѣ�tz�>�i9A�5f��FZh4��ois��2+q5߯����7&�����@���r%
n����e`@� (��� )\�~����qp'��3��ۊ�`
]�^_�uɬ�Y�3g3�NŞ�
�ng��fU'��7��}?��Gl�_�ĞFO=g�,���^^��x�.0�Z��Ddۧ�z����B�~��v����UN��� ����y�$�l_�b�K9�p9p�
�Bu@��%#�iK
���&/sr�$|�/ �w�~*D�lj������x�n�J��UCe�N�.4R������CH�o��Х+�wD�f�3R�6�2Ү~��:T�(K��E��]\�m�_۠vf\+���	�t��	[	?=AZ�󟡭˶���D�MPz���5�����������w������8)�6Ux;1�'��?�������i��k���eKK0M����>[��o�����b73�0�պ���SR��w������R��,����T�?�^9�p�}� r���B�owQ�$	���.��\�s�x�a��_�I�/�Ï>�>$G+�A�nmpP&'�4�9-i"^{�6Bѹ����8���'������kB����$���6���Վ<3�C9�:s�T.b�5�;u�[��݇tqΚ��9In�|��'Hz�\c�]�U
��/���KI�/�y�Φ��4�N�n�]g�D00�1���J��O:8�걂�G�������q�Y /�t>!�y���1 �);����*��!ix$��٪��="�pD/��9�ڹ�Q'8��~���cL��"�
�^��_:��ycIE����$W=�N���P�b����nZ�V|��q_��Y����"�N��Z���M���ױ6��V��L~*���b�-"��o�W;�ƶ�\q�6�%vZ�k �?ƚ7X�_��0�3��0{5X
K���Y=ir}f�����s�����[Z��j� vbvޣ�����\%Rz�)�˨�%%)��x����;��x_����c����-��v��C��
�/ws�+�ж�c���E@��� ��,�.���ya�oj�ިz��k� ~֒�E.�H`���-=�]mFa���@�
{�wL^s-�ۃ*��f��ɾW��\��k�DQ02p��+[w�|g⊼�����K܊�<Db��h��K��=���X��Z�G�m���Ή[$�3���.A	�6�� z��p����
�s�q��P�����	��7��u��Eԍ�Z%�cJ$�3L|�L��`�F�CSk���g�E�d޹x ��q9�y��V��6�,�PB��!�H��x?�Q��z��w�V��Ý ���A�l��z���l��126j�Cyr�KWA�R98��eO,��ҕ`��(e���*/���ۓ�� �v"+�c��v�c��t9�)�[���9$��~��Z����p���F��'[�O��B�:��|;�xI�=�Q�v� 7�A:�bFr^�c������)`�c�f��s8=a׽���sb��oSa��ӻ��1�I3��r<km0o��|n���+�)����dq+a��+�T �U�f��&�a�$�[.�/��wK�(�
���i
m�P�D�Ǖ���_�I4������Bx��-rn�/��R�-��d�..��K�Y�Ivt9R���R�9�+���wk�����H�9ٺ�8Gon�g��D�Z��i��dZ�9{�8£uB[���t*�Mޘ��|��b�s)��"����{*p��x���8-q��+*�2�T�gR����9��7�dU�j/��[u �VحθC*m����j��j��=rJ����T��H�����~���S�1���b/�^3l�}�b��Xe�*J�3��g����՘�;X��f��_v��`�����+s��Z�ŏ�zͲ�d�S?�cڜ��m?
�$: ���Q"��L|=��b��&yJ8g�p���]n>��(}T�D
7˸:G�=�eO���A'T����1_]��Iz�r�NۘN�iݫiN�1�Z�vk��Z���=I����Ԓ��-y/T��>����[Q�w���Nn��H����U�1��=υAK�����影:��+�;��wu+�!���@�芽6��~0��q�Ebini�L�"�K��v_���u)��43�A�Q�gcBKQ�q���GŦ��)}��T��6�*��	�Ty#�ʯfU܄�5�K��u�rW��V���c�V�D
�[;���/52�z�c�-Ը��"G���eI�qSG:�&�j{TP.M�H]�o���o}9�`@�.n�b�����U������,.���	J�u��%��TS�alK��o˳�#1��܅((�9��H����\�5a�'�����;���N��~�%��~c�,��<��M�l���>uƁ�\�xȼ��{2�%]'u�7%�n���Sr,�C�t�2#a۞3nr�!����`���K�T�%�N����R{�F0�/�����M�R_��6|����ٕ�n��f=��a���˻q�k������~��ߑ��L�t�a�>�I;"؇}j/@A#"��8ͥXI������������2P���8W鱹�c�n{P4�ho������Y`��?[Q؇O���n^�'��_[;������0���W����ѷ�ͮ��^�1e� 3�t q�����s�=��y�fJ'Þ�#Ok��c5��h�VZ��G�����Z�i��z%3J��4-�ǃ�����q�8"{wu����ڸ],����ؚHF��������C��x祋D�-{���7������̽�	�陬�TOᓖ��V?zxՇ�#��-���BF��t[�:�G_T����g�k7=
(�K�i#OHq�s�s���ɇ�ߒ(Ӝ��]p\��rDE�#�� �>D��N���+��0���'�<��m����g�-��'0G7/����gi_Kp�GSвyw��՘��*�ꪕ&>}��A��:�V����t��Z>�m�]Į�e��$~FDI�z4��'ƣ���Ⱦ?�^���}�4�h��}�d��.Y���ܥ��$�%�|#q]�5U�ĲX�V�c1�X�9�S9G�N�)<�h4�;����n��%��l��h��(�:R��H���,xC/�A��V�f�I<O���Ǫ������~�~vW�����$�[�e���lpD�����n}V��ߺ�3���fb���"�l�U����L)�f1/���ȮH0�/7G���2��}}�� /z'��#`�*<��2��Р0C�Mc��%�C��2��E3��҂��ۿ:\�}��F]�͏�~����n�V(t��d T��v�&�r�}b��w-�nn]�'.�,�m	9Te���!V&��L��ft5zү�.;'�n&���-`R5�?t˥.�i6���n�s
 �K��G��j����FN'M_��Ĳ�h��)����ſ�d#�����cx�;��-ܳ�����cu��������[�-$d�x,�x1�E�WD}W��Zo�l������c<�E�%D-�[ˋ_�
 �H|����x9z��_�Řrx��xS�n2z��j�G/1��W�`+�H3'"��j�-�/��;D�TÓ*���T�-�q�4�3���7�v�kQ�t��g~J*Űb�i�v�&�.;My�ꐲ5t6�8P�݃�)A����������xP]��>/�������ԫY|����3@����z�m'~9�'�>vXߠ=*ܲ1�A�tu��0DW�_�5��y�*l�20�j0<�$�WȲÏ:�r����!�@���d��R�7�|��t���8P<wz\;x& b0;�"�����ٴ.�)qǄ����_�&(��Nt�fq�t���֛�Z�#:bz���i�:���l���SM{@�]t=�6� ݱl�����!��� T+H`1�����H(Q�+1�����M��S��^��!��H ���.;Y� ����
�(�H�����LN��诣�8E��憘 ?���oo$�@:��Mj �
]�+�fq�[�^�M	���	\�2���t�t< �N;���F"}�Q@�3�������j_\�*�Wi~�Jcn~aq��+g�U�*�;������ೃ�<<��Ro��w�=�H�d�0������8��T�9��$	_p���WqU3���~��5��I_��_�u�6Gv��$���)�$M8;�$��i����{�#�y����A}^%��,��^0o��WЇ�^���8in`�`��eu��io�x���x��9���@-"~<�)l���8�6��*6��#��(d8�픶�R��������{5%�6`߈�fh���-�}���d�[�7C2�۞'�<7ϻ.xO$��'Y.t�'I8�J���i�d�R��c�=�M䠀 ��U�Ho�(��GD��	zQ �{�k<Cb����g$%&�7
�/��(���Ћw�HUg3"��@'1(XfȠ�RI�2��޾}%��0Y�&��G�	+a��9نꉖ���+x����*�@��8Uu�ꌍz\f�?�t���*I�jr�>��c���gY�j���J4Pd�Y��b4 EJU�;��A	�������Z8㵿�7νѸ���hk�Qн��������ߟ������u����:�d0Q�G���T����{ �.�<�Z���U^5�=����ҝz�6���<^z��d�I4U�Y��?���X���G�fG�m��W�`2��f�y�kD��W!���4�_?�5��2�S������d��EJ���"'��%$�����l�)D���5�F��ܒ�B��k���u�����6o���i�on�:+S�,����!LE4`��}��B{�����g�r��f!����4no]�@U9vV��*k�<���䔣R���mxًp�sH��=�����X~��W����J}�2�\q!�m��j$�i-Pf�s��A�:�Qh���k��*zZ�y�ow���3s���O��ç�
�a�`G`Z�5���q�ʴ)�Ta��2_P#���s�rG����4c}�,ԗ)���',�������H�c��
�7���p(� ���T��+��.%g\"�t9�L�>����rQ�û?��{`���/�]�j^�@�S,B�*��(����/!��'o�/�ns_S(������u��@3?�"���M�2 ax�������� 1�V+k��9�c~��4�,Qw߼}���*U�V��x6Gg�g��c%�
ꞗ�B�υTE'ō�s��J�%t��*m��&Q+'繣Q���0yXe��k�����Ͱ�[o���=��/o�'
�yIL������ N���9C*1ɡh�8�Ȧ7ItXĔ(f��D�����Ef��Fv�'�4ބ9�<�h."���T�VVf���.䊐�7_�|����/]{���,U)��\-#s���:*�'�������Y
�$<�iM���!q�h�K2���J�����LH�K��[19�V3nIV�9�Vl8m��Iז�VD�-5�f��@��lV���=���nK�γ��G\�;��^zQJ����<���0�,3��ɚ��k�1����N=+v)/V�_��A�B�
uj����L��@f;�7�x�8�v���g��v7X߀�x?����^����o�������n�����v��'�9��O4��!�ƶ�}}�<K!�e�yZ�=)�����]�Lnt?��Oa�붭��"�`sU�i��צ���T�F�ao�J1���Ͼ�?��f���W/�p�N�I�
6��TLyPi���%�4dgK��w
�j�c�f'h
�R�Ҧ�a�����Q�wJ���vJs�U�#��:��G1J�g�1�2�~3��4�'~��e�>%N�,���TS��D)��LB��,4�:lpc5w���6�sK���z,��g�8��g��i��!^K�C@y�(^������*�O��}G�?�7tn.��/Je����X儚��C�u�w��o�!�UR�4�Sqz��s�(g�X��R�ф�|�΢�P~����jn���N��;_٧f��b��X��#!�#g(Eh�ly�Ne�GW�I��)(Tō�i�f�nz_M��nG$�}D�=9�������)ك�V@X ����� ��h��~$��K� |�yf����m���)I"�V� l
��c��� sMܕ���k��U�f&��tt�2̋>���V&��g��|�w1�3h�)t�!���z�~�-|u��z���p���z�5�VM�8�M88�t�D�Gyz�	V�*�|H+k��.���x��*�܎9�r��C�5�i���Q�Q���Y��PI�j�:�>����;,s
ֿ�O?����ף?R�
�0��d>�HJ<ఙŋ����
��e��9��^�V���^��ka�i�<@;sHtq&a��\Ԝ�|2o���|��*�~u՛3Z���^cB,\~�~�J��P�WҮ��|Q�^�~Z{ag�_�ϩ����g�p��>|/��lˍ�Nbl�$��ߍ�rN�)@5҆����b�ʮI	��5��(V����E���6���Xզ~�$�'�i��|� L-X�y����Dn��2��ɪ�,��f,<�t"<�
��SaAI�T\ydY�2%MWg���KƷY�.�ڽ�0��P&6�����K�ؑy��	 &������^��v/�(u�&`�H���l��$���"�>'�vU��N�����g`[`��V;����< R���M�B�U:~-M�QVA2bʕ3a�-�Y�X�s_!��ᣩ'KJ�
�"�Ɂ@Qʰ) q�/ؔ�r"C�u�ҥT�nSK!E����W�d(H#pSuI�:��UE��T���l��
:Ɂ���d�]ߘ�\+��Ԡe�+O]�7�`\ȖpK�;�"�f�(��h�u�����3�d�[!�/�_Yc��*�Я���R_�`V{����ލj�F�����]�����Z�4��cn��rsmO�c��&4���]���˯_�v�g?]�µ k�Z�j����n+����:)�~TƮ�!�(��Y?�iV=5t9� �1C׹#1tQoq�3�q�Օ'q�g�3�	�wV#�YR�B�ӜK":f�a�t.�bs�)Ǯќf'�S@�`Zz��:��$��۩�:L+���7���l{ݮ&�d��1k/�`�ټ��m�X���h�� 4
��0z�.5����f1'��\8��(�q�"�<7 �͘s��d� (f��ȶd�üd�HF�g�67�2f1�7�jΆU�y��<^��{8��G߲?�R�����z}������� n���C�l�I8dZi�&Jݐ�~���F��:G������o�������1�~�;�!q��G2�?�%��|�4}�_I�u��?�����b����}O|k�c���~IZ�)�����$&-��i/�d4iQ���W�Y^1BkC�a��R�La�<_��SC6/|ʫ��tF�0¤�����^�����#��j�z��1���g4��$�)�T�Y��:)\��ƹ��Y����a[�������-iS�k���n�1Q%Z�Ne����b�owI�&�-]������zv��;2���$��:c��Z�$y6*�o�o�=�<u"�8X�[m��bh"݋!��&ME�dI�3?ΆF�X^�ZBbmN�(���F�3Ty/�=�U�3��� {���uT��*�̹��˼�:���r������Ϛ�����9zg^������%iKՆ��1y|��!S|�k00V���2��Q��Q�Ƹ��h�/���6SX�&�������I�8l�t.�];~n�O]E����N��I����
=J,� 4$��:$%G��V������jUƙi��e��?o#��ڊ�H���Zh���A��F0Ok:�:��U��"?�
���I&����;QǶ���Yx~�\���A���w޾�L)�[خ�}�#��g�z�U�s��;��Gƶ�ѡ.�@;���lLh@jX���{��:�t��ȏ���u�m�K�-
6�(
�+a���[�����f ��F@M���ؘ�:�FR\l�,
�*��ty\y�$'���c�D��Ynɟ����]F3Ci%�E�X\m�}�b6k-��MH�e0o1�&��,�D��âZEa^DWaS5���h�\M�T{V�ϱ�۳` �@��w��gvIg�˶e�����ˬ�W�l&o�c{�0�6�[���l�b���.u�#�f
�!=*�x�E����tW��\�'A0��p�jƤ�bC���U�#v��h.����3E��s�c#��- )[�r����AKN��t8�}4s�,�F����Á�x�<)��D�Y�aW���:�DEn��yc�?��p3\�ߪ���]�N��&����$ע�I�T��@�xp�}+���*iI�|����d��Ҹq�|��L�=�Ϙ��C�j*�WN�4���	عxK���#�iIw�}��=Q��vر� �^���5�Gm�a(;&�̡W�8v1�m�7a��_�i�p�6�q0�T Xt҅^�j�#�XAOX]�tB�v9_��6S��i���ǜjj /z,k��	%LK	�\Qiao6�Mo�Fr���m���W����J����O�}e1�����F�N�w��޻W��q��+�Sn�&�jJ/{���Y������4SGl�.6_!��/�(`��;��~��*���s㥠S�K�D�E�i�y��LE��h������46��r�[)tI^�2��M�rtx�Z�QN��J�4zZ�J��U�D��!�g�5$7ԅrn�b+�l����9����N[1�m�9��%CP��U��pVU�ի� h]����j�ďt~�Qv���?�0~s�����
|+�V��Q^P��c|�zް����-8qs�X���
�)��f,ώ���K�\�!z����g�h"�v�ZM����e#�J/��C��f�Q�����	����*cp���Q˛Iz�V�� �E���y�<�$�!�S�@"�̫y_ͅ�T�41� Xd�"��Ԣ���mpEW#ɦ��O�m��xВ����p{P�^�:�3v��l-�"�����!�Yu�Ƣpqw��l���+�2qL!�Q�췊ّ��eS�S&��i �'�=i@]� �'�,5nV�B�H��Jj]�੡���E�W@�{�ig�����c($�4ܛ\U}��Te�B|q�|DY��iC�Ye��b*�E]7�^��p#���=@�n,��ΠU
Ny����`4�­ ��9+�>��yl�ڳ:�B߸O������ˏ9�}=z:���)MK[���@�|��`���S�$�p���e/I.$�#���Eu����HT��<�#�	�����wذυ�	C<����!Q��� �S�M�Y���� 	}��|�����?���w�{9�+�`xǰ �Л0�2�N���ח����77���[�������!DZ� o�{����ט��O� ���v ��¥=���ü��*3h]�T^aE_�8��VDB�0LF&��!��{/�2A"��F˥�.&yy��4tU�!���%O4^ ~Q.ؙ�7�;U���1
M֍_�q�\����A�GrH5�b�K��"�n�QW�7&A�@:t�l��/ �O �}�}����L�3b�"�$�2�,��&"�Tu�H_G*��m���ƇRi�Z\i%3w�T��XB�:�!�'<?|�d5ט���&��)M%AB!;�,�(�}��	�\�D��gF.�cC�PΈV�����1ݥb�($`�e���)'Z�M9T�{^�"毓�!�#�QBx��ѿ�h"��GO������_�ȝ�Ș�F�"�Z)���
�Uq1U9U�AdRg��
aT��	��f�"�j7փ���YU���@,�asɇO<�$��F�T���}sp�n�c-w��G(�Y���y��_�{gL�Md��;"������q��:��&�v�/��x��6��3w-́Vz:�l�J^V)�܎כLc���c@>�P@����h�����l�\�~��c[��z�OX,�O{���8�v	�r�0N�
����BAuk�9f�����e;A/�ˇ�>"V��Gb/cx&~�2$)jr�0�
��?�v���2}e��p��)*�1�*%�,�e,��;Q����D7�I Cϱ^F��9�����ʫ��`�<SB����ST�}X�Zс��g�$ڒTW�>�aA���:���JN���j#��+x��2ɫ�6g�V*(�Ǡr��z+ �A����3��Ƞ*@�@��O1�ޏ�^�"�%~���=���Md��.M�A�)��2�uEGhA�5�T'�U�U���H*֠�_��ըc��I{)	ҹ���t�� ��֔��.bN���y<4��V�qt��~�M|˩�9�d��ѫ��h��!��^���bn��7��O���M�j��_u��I_�vR����R��$W��j�>��J
0�r��h|a�r :Q�m�Ioьc��4\MQOZ�'���B���șT��@-�IjL'�BKd�3t�
׋Զ����.<'����b2pH���E�_�Z���v�h}>^o��x��Wm�?맩q�Hl�y��r�{b��a����qf�}�����#rW�Q&��2���<Α�u���k)�j�Gc)�9��
輰������Ҹ�e?"�|>�3Wg���Q����ޯP�1���i�i��gzHQѼG���[���JY�6�<�V�'^B�R3km�\��i�HS�����sn�W�7�#%�������{cq�r��pj<��'��'A����l������Hרb�+o������$([�6?6���}��E�Z���즔���,�X�>�982k_iB�h铷���/;�I <S+����L+_��Xہ�t��F�G��� �o�T�@�<�ƾ���ޠ�	�~�� �0dp�% �j�֖�m���K�]'iM*3HH+s���߱�I�0�0+�Ӊ̊�[�IR٘ͪA6�Y��^��nG8�Xݵ���Ǜisc�a��i�ۨNsb�Ӵ�M����H�ū��Ǜy�:氇|r��]�~>����\����w����x�/q�2�Aݰ+��U�^�Ӻ�ͭ�a�������&G^���o[2?u�~��bb��@x���)���"�!�܁Ӟ���� j�6�Tn�?�?�듘��ba>����G<������^��&�yh�Y(;����Y({Qj��R��~����X�R�%����j{e�`�=��I���쓆d��e���Q��y�M#�и�Pv#C͓�bN���+~4�ː.�c�хh�	d���	���Uf�@4{�%�3o&*���e�LL�DT�
�(fh�X�D��F"��U�mjA�6q��H�D-��n��_�W����U�7$�;��2��������DC�7�0(�ڣ�!�3��;�����8"(^/eʁ�qs;��������<�B����q���f� ���SA�~H�
~�f��-5f�w�ǌ}��,Ч��ٳ�-t[b��y0�3\81.�nsf�G�I�w�.��ԥ��:A��%�j7��7��P
2ϣ!�ZKr]�4�C\���y�������XoI�{��a��a�����C����s6��D;:��2�0ٗ��\�Giw?��A7R����
01��"'�I{!��������<��ڄ]r}�j{�D��B�F�z}�����Doa3N"�[�T�FgOݡs�r�Ǜ��>�{�����d=$��X���UA��:+��%��
����[n�
��Bf�RIܜ	˕� ��G��
ww�$|k��o�����@�2y��2����4W4+Z��<���@;��Հ~t6;��%́��cESՄ�lp�����7�H���adu���Y&O������tA7��N�`p睌2�?v�B0����(��a|Wr"1�c*.�B1���+�ꊩ��d�e�R�00�U�x��@�����6��~�K�~ �ɡf�(9������A,�9�ʑ#ҍLB5RR3r�a��g\�r8���aн�,"; ~*�v�K'T٢H:u��l��(�څ�A�o���.���⮐��
�S��m��4�ύr�(G�	���$ɘ�eX��e�j��ZF�N�Z��ѰlS]�T3��Hm��y�t1�  ���}{sǕ���)F\;���,1��4e��ȖV��U��!0$&0�P$�˪�3�w��V��kko�6^������q�|��|��G�}N����t�  )JƸ,��LO?N�W��;3_��sB�%%G��9������	�B�2��2�kl�H�4���
�r�HJ�g�7=��Fd�������O�C"��� ����O2���̾~��%$��j���S�O,Y�S�Q\-��u�O�ۛ��L��kg�W<�%_�wLa�(���a3s��6��4��VqN�sL�s\9��u�m�i9����;O����&˲��C�pr��"N~g�5C ���e�^�����YD�!>KIsvZ�.�Z�X���3���Yp�,�� �R���J93�th舦�?c�����l��� 3t���]�񴠋��Ixq��/">{Z F������� �M`}`�.�� ���Y�3`ԙ��5�{�J^3�{fuϬ�au+�2f&�q�L��=3�g&��s*{���'�Ѱ���	2���S���r��gP?(�Br����m�Sr8P����%��&��-e�ڻ���qGKNa�*ZMym]��U��U�So���m]������%[:�6]�,�1����ǜk����"��B1>o�	���6�m�-�Xcl�i�G�3N'��?�^2Zᖸw/����2�����O)��rC0�D@"\��ә�r	���au}�����p{���E����P5�u]���&'��H������ݡN�x����a�q�e��t���C��/�'�7���h� �#���Hf�f��V���&��;2�sdz��+~�}bޑ���?�7M�!�d=�GOM�%���If~��h�}<%��|%c�J�E}½%:�����{L����X�:���k"�;�˧�o����s1�\��2��B�9��]�©y/��Kcz0�)�̇A�r��̋1�bxgҋ���^����pg����K��!)��J�?<,%��̇��0�����à7�S��8O����3B����u|<�����Y����1,N��p7y�əSC47�S���P^v}���x��`*'�M�����Eɘ��tN�p4vD��1�Cxg��y!�0������}�A�f��l��C��	��'*>h���F�nf���e���
�ޓw�R/�ů��Jc��$�.����o���U����&WT,�rko�n��a�e�3��hx/sû����H�����]�s��FЂ��4!�%�˰�����˼�+m�.ln�	g�w.֟�����*@+�Ic@�2v��NʸF{�mA�KCG$��^}+ �2cv#�o�ȂiƟ1��mz��������!p�����7S9V6#<w�U�^4q�[1>���l�1�;�>@Y�l�w��2_0N=��>�����[4��~^+�a�S�wf}��~�e���>�-.z|�z�b:���x���{c����.��3��a��6�V�B?�;�I+�i��%�A��۪^߿n��(�� )���a,^s�y����jʫjL7�)7B�C�y�|�m�]� 3�>ȷ�vp6�י���_Q+���d�ou����~����kp�(���W�m�|�^�o�~ۍ8�IPcݡM���Z�T*}�+R�xA; ݋<O�/��A��հ�,�W������6n�Q�F�Dk1�f�u���^%�c�aڢnP�*sb���-?�2{��C�s�{����S�R�Yp�Ң)��M�+�7�>��	}
_����~���-�L�9�S��p\Z��w�v��>%�v���1�6������pw�k>d���9�Z��e,p�sA���\���n�U%���u�$@��`��[�%K�/�k�wM���ak�D6��w&Ɨ�gG�TU��F~Ҁ��ø�ĨAQt�^Є����@�<�;%z�s��틵3�Y�.:�&Um��FX�k�v�1khȈ��./�M�Ttˤ��_�]X��B}�J�x�!���o�w <����[V��� �� �c;oح.5�J�z����r~v�gF�B!��&���ӌ��]��S0�;{�]�oo����ט��f��\v>b��t��D�)�n��V�޶�s��uyn1d,��T��վ����s@/�ʜ��w����2�s�3��e�2ER�V\T5=�=j��SȨ�[�Ӱ�-��f�$�r;�4�������4Q�,�m�f_!�S��yog0�y�1���}ul�����P���PR�w����^W�<�<���F��__�zu��6د�O]|b|��w�k�eN4��{t>1�	�||���s�:�ҵ<ƥ^.Zji���Jo��n��c��-/(r~6Hg� ����+p�a���;0��@���ѻ`:~��a�|��~�c��t�1�1�=<wc~6�#�n�'��F��@�f\ޓ\GY�E8��z2SOf��L=��'O�z�h��Ϯ� !�H#�n1O�Ft�w8�W�5j,t�ǈq��Q���6gp�3�U�OM�?��V)j2�Ӵ3�a��o�K��;ϯ<{���r�b5wJ���I�c��������j��8:r#��+�]zd��*����a�Z��+�L��]���X���Ii�$��K�o�Wyz�VMgn�EX���a}i,�[ԣv1n�P���حSK�`k��kcŨU��c&�{�nu�)k�z;ؾ�ɧd���ʖ��;I'���x��l�}H�wIQJ��o�sM��(�|5�����ߊT���1d��G��[�;����4���u��B%�Ŗ�����?� ��,d�@x��m�� Q�?�����?��[�C����w�5���w�uR�.R	��"Vz���$��[��U8�~��k�t!�����l#I��ͽ`+ƃAx�� P�w�j+����z߬4ٗ�H�oV8q��Dq��+���.� ������5/Ë/������pC3<�=���N5iA�C�r���]>���L�4����i���c<H@��}��?������y@����Z����7���1.�XIc[�%k�A){���j�U� �����	�i�z��jv��i�~�0/MJȘ5���]�Y�h#3"���bY�E0�����˄N�?��c���y5�G��U��jK��nNLLݽ�R�{��S��:�h������Ո`A��0r��5%�����efNc�'��}���L����65>[m�2���T��x�F7����[��H�g��[ڭJ"�g���M�wC�.����t6#�������9�*�]yf緙E�6}��f��*�I	��C��w<HR'Qc����"��.��q�����K�5�
ZeSl�oC�V����Pzet	٫݀i&����
��P��v].~��3f.�eSRog��:'-&�o�ޒ=�ͺ9����� A-Ff��mT�*�f�I�jJ'% "�G�3@,4]LH~Kg��f�kZ�c-
:Wd�y&΃L�����h�w@�����q�Z\�,Yzoa��R�!���mZ��T��JB����7-�d����Q�ѵ��}P�`z�[A��c�E�X��oZ)�������q�C Ol�	��3c���+���Ҵ��]�6��m|	a�%ZX��p�.���l��r�G���yJַ��$���w� ����v�_��W3��&z�l��Z{��o������[������L���/�o��O��0��{!�Y��R0�n����#�j�\Dh�����q�����q+�Z����0~��?[��_mc"���ͬ2�A�F�P�a����9S�r!_m0�/+�g'���iS���d��ϧJd�A�N
���kb�����씉�.?�{~�w��B�"(�9U0Ų�IP֥嬈�t��k*,��_�/9�o��q�Qgs%��f[*�Jm)�#�P��Q��\�n����G��y��I� ��	-[zȪAt��b�����	f�]^M�~�1"��F��;��1�H?~û�D�ʬc�"�&N)~b%x����pK��Vv)mu��Ul{?!�*Lr������������&� c�A�+Q+�oCmP����E��1�@	�B~�Qy��S�^�4I�tR�g����Fc%=�l��,���k��S�ۮ�¸���v����
1Տa:s�Ͳ�qϵ�#�I�Z2�y5���k��X�=-po��Z6?B�ǟ2���4?t�s� ǲ���� ��҉w%L ��*\��F=�
a��YT�I�����i��,�p��ځfZ�8���smɽ⤅9lG����4����@� ��`��ǐe���8V]�}�������K��e�DZ@1?H��n�N^��S�N���d�z@����4"p,ײ.Ho�F��DQ]ápd]e; V7�2��˸鍡���s�cm�������V��Ƕ"��x��i�'� f|�y�����N/���(�oԛT�yk]���e��$�at/�1`�������y������9ْ�h�)����������㣏�>x*ר��s��g?������c]�a�6��b�v���I]���$��?���0^��>����v«��Ǿ*ݠ�=��W?��"xNt���:��Ǻ4��i�*B\>�Uyy�x�#��Fy�5���(?��uI �����eq|is���e������b=�z��dqƄQ!`���B 1*�7�A��A���m�ݵ�Hr�J�;�m���r� H�Q�,��T����S�i쿿nK�����pU�я�A�Q�� �E;~+�lr�3�'Huѧ'��h�v�6z��z;I��	k�T���փ�I�<s?� �s��v��>�_��V�V����p�ϳi�f����]���FG��q]�4j����:�t�ܶ�p(>`ۡPY��=�s��}G����Y^�%�Y'�9k���W���	��ɸza���%{�7����o���W�n���dͅ�mf�^����Rͱ��=� �\F��'����?��t�b�B}�}��B�3��8�`����dl�Z#[j�5-�|Dז�`�G�x����J��1��y�	;*F��5�]!�r�x��v���^�&��y	���n޾6O�l��"��~9�_I9e_�������%�S~2�F�_[a�ˤ�HI��k����Щ0����f;`������,�R1�} z-�T�%�35��θ����\������`������'s�q��x�~�;���L^���G��!�S5d�$�cT�ĝ�3P�W����%�����S���)pY�A���O���YU��d�q��� J*��ŀ>�<��q�F�խj�K	^i��iL{T?�@�J~ǋ�(��+��}��t�l�]�ǎ��@z9-O�D`�(C`WJ�C�`�5)`q�L[�O��@f�:m
��<lp��r��maɢ��|t������#&�p|[vn�*Λ*�ϔa����؂��� -ֆ,_��&�W^+��V�	<d�����?�����K̳��6�^��}5��x��p�{G�v幪��ڶH0�(g�9�G#i
>r\D\��6�(uFk��s���ADB@�s��,�VKd��韆��5�g�8���ƙ�F��Ј��/)�P�*O�pR �qR#H��t ��#����cNa���F�{��ۅMp2K�޲������w#�2�+����p�8���ȷ�v"�C���	�� y��u<Q畀���'u�8 �RCxƀ	Ƞ�r�G�zǧ��J��`����
g-1q~l�ێ���E	��y��&	R�eX
��#VJ(�T-������wz�A�P��Hԇr�0�+��[Ѓ�3���D��h.�%��O�V�ҘY���`L$8eryu���lZc� riA�����tf~c��ʠ�7 K�Or��T)��&�\С�[aa��8N\ۜ�N��'��XݩO��ьu�B�ىW��zٮ9~/���b5��&�(���o��x`F"���lA�B�Y|-j�]`Iz�ҝ�xY/�#�}�J�τ�,���>z[�� ���<7���0��'��%BN�T�����;���ܴ�O��[()�N�#��GGX�%�㗌l���g����A�(���JS-�>���il%*������R	?���h��@�۟Y�
_���N�{.�EI�u��|�3Ɉ����Ҡ� �2i�N�:%"!�j/�;���b��_d�ku�ր�>�3jb������F�,df���'b�k
l��L}v�<��UtN���A��;�Gs�QǦ70$w\�F��"hj��U(=�[�7��W:�ێ���F5��F���t
��b�<��T*�S�� �����������|)]���!$=��ء����	���ŵ<,S�L���%19�6q��q߈�j�y�Uӏ܏:�0����睒`�ꉘIC>G�*�����۰�,�{���W-�`O�j?�)�^��-z^�ْ�}���>M>�胉IL�q��,]ݽ�\��b����p�ۢ�B�3��vK��-�x+Vf�r'�I��)�OpV�d����κ+�`��ԉ����˗z�8:Q���"�.ԉH%����d�ӟ80��Îlv�kl�1�Ne�0����8��F��x�l����#��_:Je9��A��M��Z��+a�>�g���c�uiZc]JƸ�Y����"�8S��隱�-�c�_��l�i�"�IF����Qݸ��.1{
���+�A(����d��2� B�������m��������iJ^/DM,q\$`\8�D���r<c�����@��^�;���� (���6Tc���	|���>?�Ά��J�G�If���\�!�r�}3�:�xxY�;��׻��c3�9�i)f�N��r��1cY��'G���^+�|P>8z��ã� �z�>Kq]��e�?)8�s�Kbk����w�iJ�&�1������17�Kg_��C<�Hr$�4G��x#�{~�M�K��0��l��7�ðjy���@��G����4�W`���.{j�?���7��W��������!���Q\�{Q���-z�F�͏�����~ի�o{-�3K��}�>k�P��~��Q��8ꒈ��
jʐ�[ƪ�� ������=`������g��������x�b2Q�w�S[�/˽�J�`G� ׶��t�arM�oRo�S��D �!�H�����qP�4e�H�P{ajS�n�~���P��є���<�^��ģ��t����L̚F�3^X�����3}i�����#��FS�ћ�k%� ?@{���9��PP��`r�_I5�O�q��1�pV�P�6�����G�i�¢��������УTJ�ʫ�	�C�a�����|���*$a)��MϯF��%���g���9�BI�_�L��<��!Q��	���n6(�G�r�c�X���F��7|�e�Gi�,��ߡ��;G���$W���?AC��^��Ph��vbB�<�t�R�e���-�3=� ��^�{s�o�Ww�G��[�%D�2��0��M}k�(���̜�Z��CjT�Q��iD�3KԞJZ��Nqؑ>r��7�*F1E}]^�1׼$��Wޢ�J�ף�<r$���]l	QC��$o~W��<v6�tZ�+p�T�����e�1-�3v��
���������3��i7��s�  Lm�;�)��<��f �)٫��Z���y&�8��q��zQ����\A��Y�5��S��d���r��b�9ۼ�/J�qV�ۻ���UP/�:997�z -�>�#̀��R1����^��r��� 2���-/\��E/��� ұ���}��ր�QY���\��J 9\���:��(7�C�����"�1��5rqoQ�\;`�l�-�Fs��x|��Q�b�;3c�If��q�L;�R����$pt����E�>-�������j["ހ�"�ؿ$�0s�B�8镔{��⪔d�pqFH%:��Dʾ�V�\����}k��R�iUf��r%E��m�s&R������*!�V�2W@xϠ��Ӊ�rM���VZ'}���R�{�I�������O�טZ�u*R�1`�+%x�� )~k�h���m?=(5�NN�/Sk����+L����/z�U_�8�򺲎;:ԎdJ"Oz�9�6US�ucmH�����Ԩ$9�պ^2;;u��BT����XW�����;W��l��;��2�e"4.�Jt"�� ��n�b��_d����u����W(؊��-�xk;dSuɆ��EG�Eۤ���y6��E�ǅ<΍�����5d%m�ꓟ��ګf9|�j�|V }�)�i�dou�i�T�g������v&2	����w9a鈩G�Ы�����<�HH<�� # Oχ�cZ����Z�>e��I+�*�
�L�����oG0@�Uw�^�ΒA�r��?g��e��M�Us������Xr�� �5扺li>��G�GA�y�����A`�ബ�YY!��\$�����&��a���0�Z�t��	�"�N/b�=�j2��{�v~ c4�GG�.���
,-[����͍7nl������?�UK`�[�ҽ�E~�%b�����>�`�n1I{#�]o�.���:o�4F�h�*(��9��ƸkOI2K�� US�����*DuHhE�i� 8��J7�̽��/1:�ы�N�-bDR���z��C�v�l�����ЈsSK���- �On����Ƴ�ߍ���0a@��~<�pGw���`|����-H��m����^g�V�}���N����a �S�$�Ҏ��a�'�.A�'+j��7x����$v�K���v㖲i��s�	uEas�\�$�	�W����J7�7K������0h��Q��>!Wj�\���i��l"�+{>�/.�Hq�]ߖmY~��`��*��p���p���p� �Oq���*��3N~�q}�]����$�'����O�Ir��,�"K�ӣ�CT]-�2+��J���`��5�]��<�%Q�Z�9�]���w�nw�����L����l���n�
� �7��%��Ф�B_��/8����C�(�Sek0!�X���������XU^��p{��f{���}�S���@),z�{����F�-�Sy��~����ebW��`G�(	��a��1-Q�p�ט��p1��hKl�N�}��S
���`����o��~�CS%��.�$kh�rB3��_s�9z�?c��__�zu��6د�O]|b|��w���DĬ�A�Y����/����5��R_����7'���S�#m�J&(�B��h0� J����\_���M-+���
dY�,E��Q�0��̾�z�(���������?�=җb̢T�ռvI}c9��͕�B����l,�k������A	XU��@���1�8�J�,?�er�w0�����ުwgt�g��^��w]�y��dc�j��h�z�ڊ+�/�?\�S3����{���R�<�]x����h�	��q�?�D  ��%R�K���=HD)Ze�S�`��Z���頔�Y��i o�i�a����1���v��q�I-�F+�<�EݒT!��#��� Ǳn�>u➺0O-�+�j}֎�:��#�ހ斔�����{J�v�"��\���;咤)��������kU��#�o�,��2^;�ٴ����X�l�|F0���y�(�[؏.��Vg+�vm��k;pIOj3@j��������S�(<��C�@ے�bڕ�"Fn��2�G�h��!�]3�O�q6"�;�m�H���h,�=�8��A�I���w��ej�ط�bE&��
�m&&bG�N8��p̻A+9"6�ΟNhS�ֈby�;�^v�
�t�.d�.�ht4��z荾�z<u�t�Yq��@���ށ��6,�֡Ժ1�EO��gjb<F�tȖ��2ׂg�\ŕՇYq�HS�o�燅�z��0|��ƌ|��0��̊,*����^������4��6���������]p���A|?��A�`�ɮ*&M�+���Y��E���}My�WC���`+�� t
e�{�������?���m38��g��7K@��t��=�7��(�_��Iѓ��6�4��fa�P�Y��X��ۉ��?� U���׏�%X���W�FU��7�f�q�\���ϓ�9z7�ѫ�'l��¿gG�u��������QN��rQ�J\#�t��^-��C�
 Q�P[Fۺ<.��Տ}��'�s��L���N���S`[�s�%�A�L�Te����I���e�	|�����%��\A�y����x�)າq�]� |�:2�"X�#(� �� �r�/x�E����f:]� �[�L��o���('�K�dZ@����S8�.8�.s�}�G�m�v���X9���B(�C��4Z-��c��n| e,ϯ굀x�$"n*���ч�@�� ᑇ�+M��9b�ܞ�"�p���%у�ld�v֤	29؈t�M-�(ߑ�C<��Q��F�~����� �yhߘ�=�,<RF��1�0��~8���7W�s"�`�]���psMM^�n$�ygh%#�.9	���Ea�����P����U�!�y�����-�
��`(t�����}�e�áQҙ��a�E���0��o#6A����K��L��.�'��Wqp����kў�"v*s��oG���y�Zľ%��/ �l�K�,^��Tz�O���S^��'I�6'���@=2��?YgZ�v��𷃵�&k�^ؿ| ~9�8���)d�\jel��N147���X�  �_(i�@��y��G�9A��1.D��ds�K�����q4�EZ<�Y���ɂ��Z��R�G�e���B�p����RY�F�w)��%�q�Z��iV�K�Z񧊡|Iƫ�ܾ?�fd^�[4e>U�@��?Y��oj�:� K��D��$|�Y �e��f����������!�aܙ��7�C���?��l�*>D��F���*h�,9>=Ҫ�;�[&x.	�&�����AR�~-;�$�V���8o�?m�$���S住iF���0���%v�yY,��3r�Y�ѡ��q2.��_������Z�M�K �@��JI����'��3>ഹ�s\V����ꐖ� ���n�ڴ��ƹ�K�̧ �,�t��،��V <*Hԍ�uOB����V��ǣI�邏#��\�*W��N��a��	��]�n{ܤg*���AB� Z�������4ڜ'mt��1���\���V#I?<����"��t��}3���va`/xu:�̸y������W��'��N�q2�a
xu�	�|Z��[;���ێ�A
Vw���p�lo���7m@=m/���k��x{���s����z��Y��+O�����+ ��
�ː O/t�K�U窘E�ZY�xZ�����X<�қe\p��?���Q�
^���X~��e�^Z�Il�D�+
gY�C�@�cL��Vh&�S�3Ϝ�+fd����7��Q85�oe�y��u퉃-�%~�˓�����P^h��^ێ���rf5'Q\�Y�O�y�З�����z
����Ul�v����D�u�V���r�{���V�>{��zU��,��j���2[�il_^ɲ����yN����|��>3W��>�^�E|���T��q�;���Ѓ��@x8�s�<�����O#�U`��ۤ,������HDv�b�����5\��C!��j�V��s���R
N���y���X���
��eN��}�AS-6$ԃ��փ�.|���;��z�-�Ԋ�	�|g�Au����!U>���u	z�������~Ϙv�����r��=D�4_�8�D�H`[a�mxƳ�*S�����F��0D&�/����@W�%9�G ��d2��������z��e�R7:��naU�4����������3�僲jmK�A槢�u�T3d��i�qG3ڧ���Q��?�-n���fBh�����m1�UՎ�4Lyq�fͧ������|R�?k�""��r�4'�a�}�P�̍�N��1 ���yFK��b�'�<�4��
z�݁���ؑq��:2wKխ�	^�H#�3��C��K�Jǅ	�C�R.{��!ݬau�FO����N��G$YA�fm�ٲw�
�ir�c"�8wYp��P��~*>1�2�d�V�6ˢ������'��Df"HI�%�Fc4%�S���2evS����Dd�%�Mκ7��8LV��#��~%Ⓩ>�q������Ӄ�����o�)cRc�
j�I]0�T�r��,���їG��(�� �<���`��P�pU���	�3����MX�D�F�������]���� �t�Z$|E=Ikq��z@ՠ&�^Ě6�^��W��T���<�F�ۉS���ߡ��	��t��+5e&��:�Ϣ1p��!�b���u�R�o��I�Qob�"J�ϟbeĈ�ש�Rba�u8Y�
���e3���+LI��h/��	�K�K�o�i 4Q��1\8pM��P����T������~Gʤ�"\5�ot�B9�0�[_���Gt�b~Yb��N��nc���ہ�����V׿g�Mk��O՗N��;�
���0nu���ӻiz�ˈe�W�s��O:�^T����O9��&��#�|�����Z3�"Q���`s�X>�?W�����������@i`mm�=x�ج���y [^��}|�+��9y�3R �{�e=(x�DP��=��7G�e�������KZn�g��.�ݡYb�eW�ǫs{��ފ ܡ����<�Ix���'Gj��m>w��No3�+8�y��^�N�A���k��KYӨͪ�h�C�T��G����=�^oڃ���)��G-�b��ڏ�އ(���(��y��E>ǨQf��y
����0��=6^��(�Ν9A$YDkBT���`�Dp��=���!ꏩ^h�|�I��k�"0Wٰ�<�n}��u���P+!c�{2�B�W�����^�����f�v;L��nІH؟v�M�����U�-�H���R���� p�^�dj3���a?L:��F�}���`��+a��D�M�Ov�����aw'֣m
�b���U��$��Y�	��{���-�������A���~{cK4m�%t�#��g��\������?���?�Y��	�}�H�+� 3���8�'l�=:�5`9�����3v�l��(�k,�LV'g��L<}'�S^�Z���7��~�Lt�V��g�.�����r�@����t ��~�#
^�-�ER�	vȖ��b��˶
����vN�����<M/~��>}~Ϊ���n�,9~��8��@�^3P2I��	{�Y�e�z�r�pjX1�ޫF�u3f3�zJ6C��S��q;�h�K܅C$���>
f��~�F��6�W����kد�'Ԡ��ݐ@_1�������d�0]S(��5��R��������j0�)6�@�YD;���(&��b߲x����y]��5�Tȝ7FH���{,#�k��"� MXv/`I�{��C޼lE1��{�)��tֲ�tev����z%�e�W��l�dÞ�o��x�K\ݱ���ߑ�U�_�W���tδ=q�-��6*��k�˯��p�AI��U�ߘ����&����1�%��X#���clY�-�p�S9_��T� kҐ	��fW9�(�<L��!���A�c¥��%E]��c�՜`��d�BЈ��y�$
ra��H��Qt ��ªp.m���A-��(�̭�=�m��z�Ƙ�2BWW#l�苋��[y�֕�y[��x���K`�&Rh��������J�(��"��r}�����g��å�q������'�鶀`�Pg������!�1�|�95nI;�-DB�`\��T#�&��W���Ѡ��L0%#�$đ^�'=ܚ{�/��������ʢ~��K=��h������1 �ͫ ���iRr��}E��Ơ�V�%��b�k�cǸ"�Y$��_�U��$%����s��ŋ+�&��xP=�W#�P�D�;ML�Js�u0�N�!J$4�;s�� ���H�au�73{�.|6N%3w�$~Lo�xla��%<�7����sעm#X_�Ex��y>����]�U�����7�R
� $s{�`���mj8�U(�K�9B���� [F�$�.�?nb�=t�I�}��T��_AZ�Ç�v��B|"���
��H!>��8��S.���<�<a�[?��&��wP�z� �`��#���;&�X�W��J�k�੏��gc��\?�Tϣ?7�Ț�%��l�2v����T�5��ĕuǫ�;yU�1k�N\Qw�+G��Ӻ����]G8��=x��}<\&�
ʕڽ��5q�ݰ�$K�B�'\h�{f �����}W���0iMXc,T��;I�mҫ�ֿ�>�ո=�5n�͍
~ĩ�kL��V&�)����:h�$�5�#`4 ����;_��~] �q�'��7����o�(�n]����h|���3{E�N4�j�B�M+��Xw/O4:�,^@��c����:zT�U��B\���D;���c�����T�6���P�G��&!N�p⇫"�*b���]Oʏ�'�<h���o��m�OG�0M�f�}Q��^
eL�㶔�Oc��p����TY}��~��� I���q_7��l�VJ�ʇ�
!2��%����H��= ���S�mp42������!b��Jz����dɯ���_eI�_c*�� W~-�%rBjS0���N�F&c�"A������!K��_�ʳy��9����k7�����ݝ��J�;�Dg@�?��R��v�P�|���.��&��7`R����<8��c�c�6�z\���#x�ƭ&P��*���o��V��uX7X�����ܫ�}�H(��74�����Ƈ�~s��. f �޸|��J;L�o,)�e��y<PZ��� fK3n'����ټ�Jc������5uP�p���t	�O{,�����3�'�D��F&��c��_��b���#md��ۊR��?�j�8+���L���[�/��]������*DeL'�,�c�x�E��R�[~����*���vx�r�al�����;8U=�d�L�u�̈ g�� 3w����&��]�<�����M�*�ꮄT0a��;��c3��K~l�b�{�{�j�v��}?�T��������wu���j)UCk3@�!��^�=C����$ǴK�����"�"���Ղx��to=�qw�0�}��P����y&x}��YKU� �oǴZ��7����y'����F\�t�捓"ʽ��"�Ap�M����'��9{:4ʈ�M Sێ��o�o��X��D�C��Wd�؋ �L��s��Ԃ���|�M���7X��	�����Ja�k�=*~�ϻ)�I+��ץ��T���ƒ��"\�<z�v8��Q��Q�:g�r`���^�1�cP9���|	�܌+1K��(��h ��a��M�Ñ 1��`@�F��H\&ē�6�OD�	�F�zٟ0�J(�Q��zm)�A���H��m?�Gm>��ztH:�Sx�	��'��S�<U����p)��V�flHG��޻*��;3��!
��ԯ	���f@���=�@̣�3��+g��+)Sȱ��@$_,��Ͳ�3
Rۀ~��V+�;�Zme3�̿�I۴[X5m�ә�	����t�$]��(�ks3�zUng���E�K�Bz*S:UX��i�Xq|&�*T����r�b�3�a{�F<|��rw�*���ݎ�gK�ow�q�k-�0�Ŵ�Tp��.~�cO5~�ɜ��;@��w�D��`��0u.jU=�I�[�ITY��M�'d�~�X�+��f���ĵ��1S(Dpbzҩ�������/x>����$�~����˧��:������[Ow�Z�����*�lIf��W84�]r���3��?,Q���.��V��F�O(� ��m�GXDK�W���d��[��(�Y&�9|�-������H�~��k��[ɷ���S����|K=�â߼��i�t!+���8˴& ��=j����!�p�Q��0�I� ��#�B, ;��^��$����-9i���+���}��e�k+<�J]�R�_�g�� @�qfT?��|RJI���-�Eɵ��F�(��3�H���?#�]�ka2���-\��Z�\�0���/�b�8[ʄ�	��/�a���������0�w����v4���:��%KD`�d�7ޫ ��U��ؚ��hg���@D�z-*r�u��(�+ ��ɘƃ��׮��~���o\Y��Ƌ���aA�莟����(�{>D�>-�(o������F��d�9F[]��!�,�*����(���Ʒ����w÷��������7�at����$���-H��/�j-췺;m�T�{���4�;i��}'f�b�b��'{��I6z��N�-c�^:7V�j^����G�	�b���YőA-[�fJ�E�SD���Ѓ�׋����K,!��9�=f�G��K�z��d`���/@ٍ�����(���;��a[�v�A� �&+ m�����}������?-�CgA��;�ZKfCT㣁��w?����c�5^�E�5+=L�LQ�wޕV�������#^�t���6�T�~#Tr�l�<��Y�jh��e����9�٢�J(p�*���K(s�Rq}���������§���`����P�\� �p�#�s�Al�`�3-����Z�du�H͔�*L�l6_��l�)�zQz���0荌'↲�3J���u�u���SԤ��`ŭ���zmAei��↜0LGė�}ˌYV�H�!���i��x�<���G�� vm�Zs.f���,��᎖_%y��Ap�D7:��1�����m�*�6�8����;�5����)æY�q:�i�����
NM<B��Pi[ae�3�h۲�������)�����$���ب[�O����q��-��{;x7P�%�-aS�?��Kɵ@M�G�p���y����۬C;����h��'��>��iMg.�{u��G=S��2fSs�g��v��W�Tz�%���F��>��'�Zl�ֵ�N��m�;֞D#�:9ڗ��]�N��0z�5n?��
��Py����w�::��h�dى4���yf�w����ܺ���n�Ӹ[ 5�ii������b���������~�۟;����WmZ�"��;_!?��z��n��v���h�:d>�^�z�(��SPG`�\��u�q�(Նq��nfv_ �P�V�e5��¼)�3�XΪ?�
��
u�^�^�X� �+˳R�p�Lqt�RW��ϕ�D�=�HH/g�za�>�2F)mL�X��)05	�s���t�����22I@" q=>Ղ
&���c��jN7-�78��"�� 4j�'�b��΅�!�73y\���:H�.i;��nP�1G��(" ���@3/愦cL%�;=�+]p.R0�]P�/����U�Ǒ�\�,�*�y��w!��/^���ߵS�͚�\4�K��h��R$�@���^>Y��"�n�����gp����"z-1�<���)�͇>M�y >k����?��.��\����K�_�~�(�׏]?�����q��ͺWe�+I�/�ʩ��B5�@���K��Ө5Vp�i�.�}��u���kWz$�x�d���v�U��`U�8��?PԎk,2�-w���P���oV�(����ͽv�_9;S��6,�~>�N��zb3=((�hg!�2L�0���n��ŴyKX��+"\�\���Z��L��ɚZ�	M��4�V�l�Z����zn��'0�T5����`���傲�W�qX]n��b���̺��]�i̮�I�]����K�S1�
�!Z�X`��v#ն����W�䭯ix�X9$������xXC��%�8M;�~vX���ÖJ�a�c�Ú.;livNq��T�tNќNyn���ܜPynN�<7Ϧ�,W�1"�����vP��DT�   �� ��t�x���v�ƕ ��{� -KI��̕���S*�luk�Vɒgx�T�� ��D@IQ<��JK��v�g�9}��Ɩ�Z���Y���kd���a� @D H��j���bf��ƍw�Z����z}|p�{��{��?,>��1�ux�Q�
짬�]	��Łuh{�v�rm?-^?��s���?�Yw`�>6���_ݝ̳Fת���~�Y�1�_ϝ�zv�TlT��[=w��F��v\�g{p��v��S����Яv�Q O�|���a�u�C;�}�ur��q` ZY�m������3����JW��l|Pm��a�^�?��钱'����:��Fe����ۃ�b�ً/���qA
,ɽ�"_��:�s�~�Y���H�D�Xd+y/G0K�j��X�l����'��u�#\���q>2���[��5��϶������߽{f��?I����������EZͧ���5E���w���gŞ����+ꆎ*�%��0;��?�6<�v�����kǵ���#�[�.��omm���%m�uݑ0�w }�KR�uF�ǁ�T���i��o{�5�����%�aY��n�|�8��� ���O?d�{����ei{���)8ʤƪ�v��� � +{���ɇq��@��u�-ZKz��k������1���L��w�;:?p�׶��֨7���#���K���۳�3!&\GW�	L����c��
��6s���� N۾���#�����Y���W=�x�S�/�M�Ņs|Ϧ_���{�l6��	�����
�_�{{;V����5�.��z;���g��Y�hWa���	wT����i�#�0��>P^8x1��h#Qr�B�V�r!�ޱ�}����T��s�)��M
ڜh��!w�����1��č/}�'����ٍ�6{mv�Mߙޚ~1�9{��?�ϧw�7�Oo/,jpkz��3{kzk�
��oe�3�:{kvcsь�x;��Q�O���xX�j��W3[*zB|_�-F�C���=#���R��S�c�]��<���o��������;����=�Ms�K�U�D<�k�]c�lU֓��9C���	�D���Pb�c���U�6%:	���@�=��zD�s���:RL֎�&@g�E��j=9q 4�0�?���JG��߈O!�q����&�z��R5`����u�=a�%���d51A)�l�����:�9�Z��h���ɓ8\8�AnH�Ȝ)8A�����t-�%/"���q�{��`u��܄ �;'�ų�����
0(��2i8�b�i�t����Qu���NȽ {�)0#�?sv؅�/l6�"j��=RX����" �
fTe�1�lz�M?&���+ ���/Oa�s(;B�G̞gN���'1�����%O6����P9N���nK���<xy��beF�8us�R���j~�)���㥊R�׆�.���; �Ǯ��%��paU�$ ���I�;= �c;6�_l�H���I�E�c�5��>���F�� �¯��i�D)��d���ܪ�v=w�����pK���\�D���v�\�inH������H��1.�֯c��2��B�S|nD�33l��k ,}�i��(�,uH�?��f��D��k\����/�����_~�@ֺ�o�P"����n��_~��������pN��@j��4�x�A��¼	���Y�M��^�7{�Η�_,��~���&�{^�L���+��0�z6�'�4�b'rc��okqxFR�#� ���:�Ѭ�4�/K�q�R�+�"s~�YN��#������Ҧ*���E�Q�	�UD��I,J!<�%e\(�X�2K|C$l7V��r�\��'�q�5�����t���8~�J?�P87���$i�k��- /��!7���%��[Y����*R�7�"�B]Rk�`��E�>>������<�z��>^ǅ��a�J5i0�H
����dG�iD�;���d��tOmȢG,���ه��J'g�����>T1�D�:��uZCR��м<F��n.�����{�b@­�� ��g����q����Z�:�+��+H���A�'��p�}˿��~����g[���'���JBw0 ���А�0���j�^�G~�ן��9�]C�d��ۃ1��{9:^*�Œt0y�EO�&�����"�0�����mñ��C>���.=�Tml?�`>I�+�:f]+��Yņi�+���^�s*�+.M�C�;���.0 .Q�=���������.�����u�1q����?׃]^A���)�%�j����!�s���g�������p8ߜ~F�����*&
�ע��g6^������"���l�:�@���+c�Ќ�w@�Lx��"�V<��d�����/D"x��O��&~������n����9��3��Jc�^��+:~�ƛ�^/���M�WĹ�	4��K�e&���"��W�/�yU��?&o�2+��y	Y��b�!�
,|[X>
�Y9����y����PgL?�~1}m���!���$�*H��Z�~�(h���}��Vx	VVع�g[�C6��� �OE�۲[z��\x�����n�M;�v=�F�o��10Gl	׻.��� �Ζ;��f��������[��|Z0��u)��Q�H炯-�hR��'ݚQ�����j������>d�۔��j�;���бu��<������17��WOSK�ia,-��L�?Ɇ7Y�/`����,jT���a�uzm���r���8M�з|�N<���#7@�t�ힹA�
='�&�'<���>}G�3�����x��
�=0��Ԛ2�.i?ޞ��?i$��g��c��@��뉷��Ȗ�Ӑ�� ��U�FK����Bƺ�u2�ƌ��2��q G�)����5��&F�~I
�N���5Z��z7��z��Vz2��q��%�� J	+]<I+� ���:�r�}+� /��f���HMp��'����U�y��P�'n�9�����_�/m��xih��\��[�g6p6m��-�{Qh4-��'�Q�,��6��*�ҙن���w�6 �R��V�O����j�IK�����5m��@�>��A��(��6�EG�L���J��!�1r4���b�G�X�L^ڱ����SςX�p�Kr��3�j�xg	�����W7ّ;8#�f��RGn��=P��:����.���&)'
��y���=���C�7�Չ7�����\����{KW��/9/�s�]���.�x�6�"���^U�I!c�Ʋ�I�rq�~��t�p�g8.�^�g֎=Ȟ�E"�ao��9��F=��&j��m�����2X.?�0ov.N-��?h�yI?�w�v5p��~��A�e��~�>��s9@B�o�Y�
{*���z5q=d�Cv�F���/࠾@Va���8�Af9�����|�]��L��L��)T��b_rϋ�f�sz�.��⡇&$2��9�=�/z�o����G�Pa���]�V5�g�g�n񖞱w���3�jp�X Ԇ��M����p�N�ؠ���N���ܗ�dQ�T���Z8@Eh{C���;�:D�\E��6�Ό��j�ID#H�6�yS|~vg�~Y�J!D��	�	K��?Uc�P��qt/����C�=�����w��$}��b�9�Rtr�9�h}8����p�U��g��/vu�πD�G��Yf���U�i� ��BA�^A�I��T����=8�DYC�ߝ� )휳W���eӿ�}iz;_�4U��JH��&�vWTg4��C�ñ8	�Z���`X���xϬ����r�B�ɕ�����=�g�8]6�w��\��ho���B*��W�ٵ����F��y6p[]���=�?����+{ˬ�á�k�g�g���f���8{w��������b��\O�B#���x�h��뜕k��o�}2Y�p�Tq���8�oEh�'�@U6{m��Zͼ��Lf�CǱ�#�2S��c:�^C��	ҕn��g�w�e�d-��w����^QA��g]�븮�G�. @q� }�{���.k��r �ۜ�n��O�*h�[��*S� C���Kd؝t��!�/�	r.�Trf��$��ĸ�Xj�M�09�9���1��\����x��ps@w�d�;�h�F��b�ݘG�DjhSf������W%��ϳ�ȧLq�����Tc����f=�܃�t �L�c��Z�%:��Dq1��xtjr8eߊ�@��g<��P�a�c������8����|(�|�8�Y~����Cz�S�9O5�)�����<��������C#��wڥN�gG�D�q=m�vE�ң���)BO�Ze����5�u	�=��H�s%4���6b@�g`�xQxq���H�8k��!�i| �]���ϝŇ�~�w��/	����{G�3<��"#?��g�'�Uxz�9�"�q�y�-iY O:�f7�$T3����%n��M�
Iq�xxX�<w��x@�:��*�F^��(])��O@s��yI
�������i�C]���ynD�3>W$�k��C���m��mhp��')�s$1�P�;�E�ow���fH:��ŉo?��>9�.��GW�8n�Ďyx�^N�����S�Z?c�DJ1��8eƧ�p}:�E�O,C
�冋�S�l�g���81/�q�����^`��H�徍�\�<��[?� �p�(D��K�E4��{{L&��I����7�0գ��CSl�D�ټOF�bw�_J�cmz�xn��hf���#9�|E�l�ַ\r��=Kv��Vš��_N�-�H�iOp�����O�q+����%L���z�{>�%�6y��3����������g>H���D���G����H���o�Ux1�u�a�g�]��\�&Sɤy�8�Ć��.8L/�t�:II�"�Y�	�њ �b�*g��Ձu���Z�禇���ҀŬY�;��{g���J����fK�o22�춨`zi�gt|���]z�iEڬ3�Z&_^J�"�
���}����dqz]̔��mFt�F� `U�R� �q'i�T�b��W��?n�l�9nM����&��/Z4`��ҏ��r�&�W��M?�~N_�#���ӏ2��ofy���β���+�*�r*�@�>3�.mBt��	܄^��w0a4)�N�75�>�FKt�sqM��|�Bwx�&�ą帄4�w�&�L�E��ޠ�݅��?u��鼇gV���7�H��,n���f��fA�)��4F��ސ���躃��%x'�k��J�^�,0��`��F������Ww�'��1��S�Ig��8�q�g⍄�:��$�Ao�Wș����^�p�P����p���e�y �{	�.�98�rq����0�ȻH>pm�`���a)�_�,��O ��6�:�#�gh� Lz�B;�P��Ze��fH�>��`�p|J����0Dr=�_~{P	I/�w���@�#��� ���*���۝6���o�B}�}c���wG#���w��n`*=��G�/X�Q7�)k�#��g��]��O�iP����<�����	�>a�.�3��R|%^B�=�=��e���jD�"@d6 �%�ĽؤϬL2�MA"��;w�YTč��e�?P ��;��_�S|%��0�QD��#H���צ�CSw,�> �K��2�*�_wf�~:{3�U��,��SBߦv@�0��J	�9�'x;���*ߴ����I*���8��c���Sc�y9�JK�h^i5������6�E����#��O��q��ί	#�B=��k]���Y�M�B0'��d��R��l8�/��J�
��m,3 pS�/*-�x�AO+�P�I��!δ��a��s����ˡ�����L�B�_�$ib�W������~�}4��=Qv��C��$Q�Q��PXL��Q�/t{'�	���%���|יH��^X�d.ĕV}�\��bx4�
?S�^��oL�@�e��>^��k�)�J0�"r��6�Jv�߳�a��2#hGG�aT��ۆrd��t�hC�B���$p�ȭ�]���"7�D�A��d�vG���pH��od�H��m��!m�:	<�Q&Rq�=�X��S�4x
�D]��xY��%ޟ`�xH ��I_��w���=[���|�Ֆ�<��):"D`lD9�)>�D��$]���X�b�9�(m��P�|��L�eb)e�檅�g�;�j���5��Z�y�ZpU� ������^�;w��	� S��Lڢ��ܭe]޳${�p�ݻ�4�.�N��F�*��TuI�]�T��cB3`���n���cC�v�9��f<Fu_ʖD����>[�ԥwE����E�����*���2����Mtǋ��Q�u��0l���'���vW�F��t��3�ϻ�������_������G}�ʃ�m���E����?�ˉ1_|����ğ�
ȋ&���>��̢����f�P��q�b�i���4��s? g��|���������pH�~u��%���P[�紘C9
�Kɡ@�h��>��?�����X7�_���ǿ=0�Ý��&7���s�y�,h�uÛU؉s+����	Q���j�od~��RL�/��!�ɖ�����oq�;���?�pN��7��J�ÓT(2�\��F0���F&�h#�fD@)9�.�	�D$���$�0k����,:8P�@w�56ُ���:^
��g��8)��΃8��z��k�le��%�J�#�Db�)�bۀG��m�Ek0X\fN��
�~����7
�ڤl�dL_4�&-��'7��rS�\W/�ޘ~R�e.��m�.=L���k$;*y���No�D��+.ѥ;{w�%���ȝb�J��<����������cw�b]�Q��TF������Ey���7Ҭ��/y�k��Er�߸h!ce?���I^Kƙ\��q���`��6�����ه[G�����,CN�F(�q\�6*QS��k���$pD�o�3
�W7�7�@G*\�ۏ¶L�1��;V����P��J�-��##j~�4������v�*Zm�H�����T���8/%�+�*ZJS�NY�b��V_'�|
v�ɲ,iQ�t���MvilwJ��cX|�ԏ�ƽ8�Q3ӽ�^N���*�a�
)D"l����sF���o)	����t��P(���yG>�R�l�� �D�
$9�si $�X��̫s��{�Q�Y9؆2j���e��J;&k���r�7o/jF-�-�l��'7�����^��q�q��;���,J�2q#ȋ�'�����@x����Sn@���;99x���sm�϶���[��[ٮԗ�k�CDm�!�,r|>�k8�-6��ٓ��������i�iq5�O4%��F���IH�bL�|y=����ً"ɠ�E~�wq�}Y[���{�q��^H�F�C���ܾD¹��~��#D8 �% �L���ǉ}>�C�z4 6��k�VI�^N�I*�+���C���W�	͕9E�i�5B�d#�ݸ���3�&=ۯD[��Ҏk��[1愤������]_�[�`򫓦��"z{�@�Ð��� Ʉ`�r��ys8���Z�+���4ǥs7�D-zm<���Ui���P�a�M�	Ca�����5?c����;�Z���l���w����]�Ē�'!?�I�袈��0���ٛ�U�_}���pp�g���5t���1�K��)��?�)n$`��%n(&�_4��a��{�'��P���b�^�PzczˈM¨QRd) �"��|�b�<�j��;���Q���o���pE���'Mm�C�,Sj���9x6za��B4E���i�#��(���
��G�hS�h�I�2&��;$�H����Ȏ���;��1�/R2�>B#9���a�If��U1��GбYfL��(q�s0�3p�;C��Z����� �ٕdh�ARhr�6��ӹ�,��0
~Jv۬�U
��-7�'���1���v�sAh�+	���ar� �Y�o�#�k�d�	x�EY���-����2}�C��*]�fC,�.l����������:͡ ��1D#��Dͥ")��+�x�}���*���\"���G$e�����l���I'~��ڿ?΍��T�|���μ"Q}^Ŝ�ĳ'Z�le�N�r�@�0	Q@)����Z"��|�b={�z�X�n�$���)�W��!ΧKI�k�g�<E�Of� ���cS��U�	�~��ذV�&Xc��R��נpEAYt�h����Uj�~�@�^z�~���fs�L6��gTF8�_m4Df�ea���A�G�d�M�H��-��A��8ƊS�+2���*�ڵ~n,�4 ����K�R*�2�^~�%^�����ô-�/kT"����A��ݍ�^j{V�d3Ng���O{]kF۴$��s���x�O��Kع�L��r� \���Oڑ�^����~��(
�b���q�y��T�K�dTs;�8]}T����%	>J�)����u�%v�*�P�޼l�W��P�i�Yĥ��h[�A៸@�bª.���=a�G�v=4O��9�p+�NY��tf�T6#���%DV���|�|�^f8���KmJ]�ƛ�GH�)���Y�|	���8�`���@�p����^�!�N��F<O�:b^֧$�e{xHP��9��|�|\O)�'焘g}�M;1�:3��B:䀂5A��ճ�k�ØK��1��?� [��$K�u!q�[L~�)�s�PT����g.�1kĵ�33)B?������)�P@5XT��*0�h�b��Rh#7��p��)ʯy����"�ɷ=J�������p]�r�|ˀha�݉}��ΐ0�[!��ΞQ|�O��f��nY�WzYT)u����J��~���-�W��IT�Qhu��J�R:�lp׷�<hO����[�{�.�[�B����H�dN�2`�!�)��~�O��g���H?�o�y�y v�I��a����� u9����C�NQ���}��V�����6��)ͻH:��ma9�Zy����g=w�?,��c�s#��*nv�W��V�w���-�WA�U��E�}��0�5�9�$ɶ��)ǚV�4��Y��u���L���j��TU�	����c�L!���TP;:÷"{��G����,S��X6�9�
?��K���d�#uyf%SQ)���rJ�(��<E��R�ߕd�G%�03ƥ�+d������_ڨ.����	�Us&�����D}�">�Ѽ7�U��[^�T	\^1i�]��J�
;r\�ɮ��S���=�--]U����LWQ�0�9��S�pV��.>~�����|*��S�KWz�-JO��+��ʜ�<4�U�=���J��$4�R��!5�:��:, A�Y�Z茬+]�]�7Iռ����]���MS]�E-��*9v�ya�-6{]d>�������x�_,�W�`�p�	�j����e��T/�ËW�U�܃����Q�e���0u���ո��9���3�� +H��V�UK�:ReR6	u]z��&�KЇ�i��򽲪� �p��*��M�N�`�w%.ӬV�-��e+�%
S�*�D����KQ�<�N'�����b�z,_7���g?����W�(t����ӻzP$j�t����X�{�to�b�<m��X������.���9V�F��g�I��ӻR"�l�����{��^��_w�72�p�<0Y��c�{�2�����L?#�z�>�0��f��n VF���-�1;*SO�6>�"�4��f��B�)���So������sL�<{�;�E�ݷ���m�l/x�s����.���6N�K�1Cd����uc��� ]?����?������0U4Ò�X�q�#��ײ���kT!�.����o��ޯ��˭O ���ژ^�Sh�Vj��	�o�f�>}�����+<�r��^�F]bb3|:���mj����4e��مS�>����ȱ,}4�lϧ>`>�F��p%�(����_Q�oP��|hxXFG%3<'�&������um����|xǜ����T	x�u�,=ጮ%�����;�^\$GzXxT�S3�=#y��V����FVfΎ}�S�f���B�o1��F#�_�af��_Uk5R���u��pVWƞs��.f���<D�)��yJ�4��ڟ�g+�7�p����Я�k⾨�L�����&@����=O�9�w��F�[�PQa�����
k�~0��&H�n!����9���r�0�]g�l�wy@9��L4�4Y�k��C�"�$����^��͕%��骐�#�8ѵ]`v\���4u�R�g�n�h^͎q���� 9�kj�8�ő�Q�0ݑ۞gk�A����t!a����kk��O�o��������0� +0~�sx��-j��Z����z������t�����`�cߣe��_�v�B�L�'Y��&��m,Y�\�}��O�^οX��=vݱ�q��pε���h.�����`PF]��al����Z|�Zn�7j�٨����O�kT�fmm��ڨ5;ϵ������j���,�?���?���Z��k뵦�֮�6����H}�Ӭ5[�k�Zc���`}}�n5��mY���>k�0�f��֯����f�@k��7k�z��Z���5�O����Z�0]����q�ؔx&�!����P@6��t�n)*����e��~HZտ g�`���a��G�)^¼�&���-��t�Hj���Hpe�2��
�di��c�W��� %3(�S��D��?�F=�Z�i�%{,���\w�l�PC�(����/�v���ya�>���o��T�T��ԫ[�W#;q&�I�X�\��3^I����n���@^)p�zJ1����)�Yγ���o��L�w�DR����Q&��Т��Ǜ�?���ظ�:y�fab����������2[S���5����*vAX���E���=�%������O�իpP]���XZ�,�A�H	wW����S���vl!��&��F==w�L2�ڢ%)�����7<|��9�)�#�
3��o����3��
�}�F؁=t�ʢg�bb��ڭsq���mr��i��������tmZ��}��'n����'i������m]�L�����,�����>�O��DYZdѿH`�i.�P��~����G�#�ǿ���^�m'��Jb*4�~;N6z	Μn?�l�����Sq����
�3���$��A�-_�1���<a��GI�q���R��p2�[����TsR�]��h�>X"{K�f���ڳ7�Չ7���)�-�W��xo����%����s�(߸�r�o�A���d����Jk�:��a���A�$ik#���
�P������p���r���@��֒n�b���YD�#β��d*L�����<�l)�?E[<o��={C~�*�>g͠�������@ѯ��	�Ev�\���dǵZ�}��Oum/�'���c㜣������/BS�D�ԧ���w��E�p$�S�)�^�\߿,�#�[�<���z!���SJ�@3.̢�ܨ�WZ���z'etL�ͻZ��bbw<�)��'�	G�V�=�|;#W����S�U�I��<%e���<���'0��?L��rjx��݉��/=�cvE��'�kR�x6���.��ʎ�t�$P�f��/iX�
z�rE���j_�=�WG.公����t`����Z�����;F�P��wzA߬�U��6.��~��2
ə&Ah6�����r�Z�*�mKk�js�����֬��H����z�6@���֪�v�����z`�3
эj����?�e���������j�-vj͵����F�V�6�ju�y���^m�q0�p�
?�-�s�u���t���@��B1l�Zcu�Uzvu����][]���Z���<�m�ѠWk0�zn�7���j�ѨmlT���L��-�:���/ `�-xs%����J��el��o�����Zk�ځYCM��Y��~������6@fRm���*@����:k4��j�ր^ֱ�5���j�	cX^P��`r�d��7�[�Z�f�N�����676��5��+��D��۰>�D&��Z�g��*|"ȮWk�f�M���7p���F�p
�.vÇuo6 ��N��c��V�]xi֬�ˍV细�р���n�a�;��$�8�Nۇ�:�V���5���v�7B��L�����@ �7p��po���Q�h/�6Z8D=`<�J+�l�:���b[��{����6bY�@m��
� )۸E�q�t%a��a5 GV�ڀb�������[�D���זWaES�� 5��uZ)@��el��
�PG�j5py�cF�A0��6p�&�EX����[���*b
t�@m�#���5��3*��!B��{��B$��l�%0�^���]���o�H`'tp��x���Ƈh���CZ*�1�ЭV�|M�t��6�Nl ��	Z�eX�&���� (W�w�U�; � �{m�������9�[0J|ATk��� �˴
�7-L�x��.�z�n M ��C�o��@ܚ��85�% ��I�������j��8u\p@�1�p>,׀ ��8��R�u�~0H��m�t�
��Ѧ~WqӴ��4�^�n�i�r#�|a�uP��A\6�>)CqJ@zp?5�[uBNح��-�C�������!�:���Os�y<ٶ����ռ��x*4�f�3)�Y�NxD���NX�P)���O�����{�����RZx��0������k�Q��%����ּr�~8� J>i��d|����\�q}���#�;������@�\}�v&�!N�l�s�����bm����7B��"`
ɢ�]{O�]k �W�h"�S�P�Z��+��T����[;���q��r�pĐ&�^&��&�E_P�|�P�e�Sh&A��������Y�PR(�	��8��,���{#���}Ŀ�9J$�S(�ȉ��j?�!�kS��s4y��'6�б�iC�Z����ٻ�d�mG�)��C�hcL�M�vW��%��n�,����Ϛ���ߛ�jT�K��e��.�ңa���Ѩ�?���XH�63��	܀=dp��C�L���!z��PS�Y��f���S�髱�����#cx�O�$�B�M��l����t��q&�ݤ��y���sI����69�5�$�S���_A�x�bH���Q�gu��i����Db�Jg��ȠD�-f}�uGa|��] �Y�؈����D�:|-5�@m�n!D�P�d�����B���#͏������n%#_��	"��H��]��\���ގU�n�Zc�r��1`j��bFh�1D��͋MD�8�9J*�'[]�oF]����Fű�!���wFɯM�Kn�m�J�0r����[�2
'�L������I�3���o1��>�~�JbIS�y%�:�)��]�Ԧd�]_�K��A
_/��Wh������Nu�'�
��UP��؃AA�3+H����6YL��	�
�m�y4-�M����U�k1]Yt�{��Ǝj*�,=�3/�E�?��k�# $ Q>�Q��d�U b�<�n�̍�u�du�w##���k��ğ&zҎ��$¤	Hfۜ�!=��a�� �5�VJ��h]VV؏��3�uXEp6 ��H���Ƹ��"˺�eq�&���E�Q�f����O�$�;p:�]g �T�tIAE��˫V� �P�t�e�jf�2��O�_L�k�����>�Q&�����o��d,�Q��\F:[���(f�b�0ԜO~�.�{�9��Ҥ-���Ҿ��i�ܴsk�[�3���F3�4a�N%W����F�X�Eu��'��c#��D�l��71Q�;ax��p�K�����������)Y<!�Ā��K]�P�bX�����0�k�=&ͽ��(��O������	w�F0:�sҰ�!)����N���OdVv�,'�`���i.����S��VX�=�����s��mw��W����+͠�QE�Qq��@zl8�((��8fN�Tb�{	�
K�d;��yASE<6ǧ����Q�*�.��7�G�1>ڌm�E�6�xr��o|�n95���L|D6�۵���%�Yy��Xb׽63��ƪl�Ȟ�^�����\"1@P5`c�G�w�tɑ�_�@��X�c�e��� ��%�bh�0E�$&�$��g_G�ޅ9?c��
;���1-��V��@5qoW��ŅE���j6�����cۥ~�Ѿm]?d@��	� �u�6\�)��2e�5����}X��۱��u�<<��yh��_�H2��U��y!
�f��̼ ˧ǁ3t��ɸg���v~`-���g���C�H��c��M8��A0C�_��i���ʏ��'�}��X�H�e2� ��ƇF4
0d��ݺlB���a�Z�(�A.�L�(�2n�j#ofL�;��e��J���ʹ��)^�=8��3�=��zv����Õ�z�?���h�oQ,~N'�fW�g��s`Wd��Zs�M2�����:�2���vwAje�d�z��
���`��zǖ�]x�����^(�$ф�8�S6���D-�����$L�GyU�};x6C%?���6���}�)�=�-������{
u�ίtK铢��b��CI�i�ZZ�0��?o���N�������da��[U&�GR�&}�����39g#^���D~�F����c�v�#y���/���I�bNHF�fI],9�^����IS#�cj�tL�҅v�
G�Y~����%��[�#�n����s��M�C��Z^�=�dZN��֚��O"��I�B����Pg,]21�[��v��繢~�d��o�g�7SyZ�Ú�}�6%UQ1�����.D����}��,�	D?�H�WQp�JRH ��F�86)�N�G������˛�yi2Z�a��O�x�BAY�\��4���:8�bʃ$��
��E�i�~`�[���<�c�j�R(@�ٔ��\܎���xLz���K�C2*�D����pK0n�U�J���t�����K���P�$cy�����b�Y�zF��A�d��l�q��ʥWV���$�}0X|����#��L�}�`n�8W-��c2��d��*�;�e�1T����I�
�U�O�'>�t��/1�e��ݠ�(JX�y�0��^�%��������JI^1�)��������t�g>E��] 2	u^�0��/�!�7cFy���,�{�i�"�F��W��q\Zt�I 䍲|����++�>)Y�����"_�nSS�o�$�&�I5��U8�It�!��ٍB3��"�����~B��I�x�,-��u�(��fR�:`43e!H����2�M(A���7)EL����(ǧ~�!,Í�\�S��I-?o����r#m��۹�Q��B�P%�橩���-uBjkl->���[�	�����������Rd|���6
@��m��}xXX�b�I�b6F1�D�a|ʌB	>��K�<��R��P(�H�äZ'ĥ&����H��coT3�V=��]'��;Z\R;�䦩?��_� �����Z]d�߹�'�Op�d��[Yk'3X�T?�����_�� �+V���1���Mߛi3�\Hq�g�X��H˒Z�
�Qw�C��g��,Q�>�v���
�-�Gi#ƥ���;����a�j���Qs�*�.k1
���%(��m��\tv:u�aN>��.�?/�4�c_݇�ڜ*�q�0_?�'��_�R_f��׫HX��V�KKǛEZ�^�>��U���R����ᙱջ��p*�e�X��) �M�j��Ҋ��T��Ō(��I�.E��v��L|K�*�u"5�=��mFQ��v��&�_;�׭O8X���JS�����³���'Y�+"6х��n4�P�:P�ghnXc����h"���p_Y��\��R�U�|~��Q��J�R�>�[bs|p����%���R����Z�n����z��朶ghY��d���K�u&I�sɥܽ=\��� [1.���N�§���9�]V��	V~�� �@��*����YJ�����v)a�.>��c�\���+?}ꉧ�����H�=�*���a�h�*�%���ߑG���K �]t�QI��3x7m�ұ��1
j����`�RH��TEL]L"�T�xQ�kخ3��!U��w!�'���·%{�Z�U�αL�v�=&��aY�oIJ�w��=c#��ܧ\@y�K4ȟs'rt_�8����b��;�[Z�%������&����3r�#}^Ζ&��y��n�a��f%}w���0����_�}�� �X{�ṁs�.�䞳|�O�0Tc��/e��2;z.�i�ԦR����������FN�*�bK�%㧒�/���*���*���*���*����GZu��{C�/�&�K�9�62!O�1��+J.:�H9ZWn��y�<��<�r�sϞ{��s�-ҍ�ً/fZ�[�S6��$�}ǿ}����[�̓�_R%���>d�z�|iK� ������_��Sw�:uUU�ZY�|9Y��x/[�<~�ԟ�T�"�E܀�Z5V�/�# ��ۭ�ty��'E�@B�ۄ��b���H�([��h�J�u��r�i�EJE�%�12�m�U'6#�D}u=��6�N[R�-S���[��� �@Z����W�:�YF��l����x��>ڱI�0i��Q��Ha8�f��Z��B�L:�����o����8�V��z�n�����ysM�B�C��+�6+���}��Uͥ�<:��2s�,����0���N�;\&�K�s�T����e����P�P���y�^w��'1��7���d��UNc%�q�X�sܳ����Iu�� �Z\�IW�$�����h�{4���9Ƙ��_�H�O={8FL��ϷYP�`9����V;�&�kSp��a�ZD{)�V�Te���T��OV|��6���h��m8��-��C�/��R.	� {�b���z��@���L���m�#sg����q:N�"7a�%��.�_`�D �JɠʥW�-/QNc!��ٚ��)�y'�WǓ^��Bn~rǶ��+v6_�Du����8(�C��0�Ѯ;���~��w&���;Y)(�k�=��5�X�<��p��L��y�����c��7�1ۭ&�>��\"���,"��N:�TFfVyRe�*�W)�(��PS�댒��9�F;r��	�N��]���U7`��#���]��9](�,��ٵ����Dm����4$����t6l�Z�qA>����p=��k��e˲04K:6"�T!��T�M��IhP⨎py�+^�y�b�W�����H^"�5_ö��'�p(�� ���.��ed[��b^�B�[i�$�eIԇ�(ٛ��oLn�aj*+z��֫I̢fG��Qǖ��-�|]�L����|��n�^�հ��ƅv�r���j��X~)qJ_�Y��ci�T������}�)Oy���(�z�Yoo2B>)L��y���:�����M4R8>��ө��t�]8�uc�6.�b�5�\�ZZڗygCy���g58U_V֞�Df��K8�yck��"�;�J�7��ՎRz1O%����r�:?�\wҎ٪9VZ冞DA�>k+8�� N`�nJl�)9�`vE�&5d���^�dO�27l]唨���hZ>���*J$=�wd3H��Po���0�/����L��XU�s�=���yY���sʃ��k4(3�=6 ʋ/Ɯlt�`LU�N��� W��M��;7y�[f9O�G-~�	��;N��8�Ҝp�������}$����=��_�u���}�vb��]�Dڲ��vNv"�욏��˭=R�Wr҇ϿgHҐ<�LoHC�θ��CS��0�9�cJ/����NoQ:¿���=OhJ�D�}��%d��l1
˲�Y��P�n"��2����i]��+�h�!����x~�4��ͱ�Lҧ�t��������
�J��D
�^�Ϣ0^Ɲ�W&����<��W�e�L�+o���ӻ��f/��4��(��`��2���eC>��C�ӗIAv���W|�����8E	�lL�P��"+�� X���/c�=`\�(�����.�^�Y��	���]d�޽]��I�����M�
S-&sx}����0� %���Z(���߃��s,�� �]z`��Bz�T ʺOIH��oT	*�zOU�Jf����i��i� �ӻɡ�*U�ڌ�sϑp���ʪ'�neC͕�j�/�8!+j0-I�a��3OoE��oN?��jŇQ(�7'[I���|��ژ̑X�E��Y�:���I�HE����ÿY�A$i"�ڍ<e���]i�J�y2[�Y	)��e��H[wme󉉼'���p#M�����I�o_-!�ӳ�N�d�A��"��1���Ež�>pT�p���y��_d�����U@���)���!�nj�\ucMY2��Tf�Ƚ�0�
uW����?�nޱ�8�n�L�U��P��֒;��fo`��w1�Ɖ|>{c������pf��*B�c+�[HA/��Z�tj�%,k������>)ǋ���p�������H�F���&$�|��xNQF6��ߥ����d�?�a
����s	a��S�k4��M��6�m��#�;�:��	x�Ct���Ţ��d�惓13[��{��z��+Z�����"�Tq�4	���-[�̬T��d�+ᤶS�p2��l4���7ݿ�f��}��*_IϦi�CV��(p�_N��^òt�&y�v����+H�_��� '��~S1�l�D�I'�]��	Ę0Go�Ǉ(��uc�O/�\�Q"�(��!rD��-�Ɠ��aw�J}Յ���G}e2�VoQa=���v-�W�����B�bɗ7���r�) �yl�u֣�l"KD����N�)�<a"�Sc��G�2�F�6�a����F��(��H�}b� �� �h�$/Y�I�tV��&t~i�%�ٵ�x�@ 7�,���u��U�,Lk(���uG��rf9M�:�8:>͐L�,�<�LJ�U(���
!S���t�Y���>T)�K����ԊN�8�"뫍MOSB��5�Яd^	F�k���5Ob�F�R<nr��h�='�����:R�s^�`g���嵗z�L�x�brY��Ж���
Jg���	�Yy>%�x&�fY�����7oP��0��s�(OU�()�kX�.��y|�׻aM8�TI�ˆId8���i�r����-V�W���]A��
ߞX�è�OW1<|�r$��Њ�U������)	gc���k4�:	�t�w�Rn��Z���c��6�㟧E�Dr���{�΄2����K�ˊ׿�jN�e?��I��3���$ȩ��!,�������GR���1K�C���<�V]ɯ�K�RHdI��D�!�c��l'p�jK�q�F���gQ�2T��Y~?���%�Y�l��j,�rI��6�R��!J�(��zW>�슏�̞�[��G<���ҡ��Ᏺ'ar�F��1nV�/@I��2��$�"�� ؘ������n�#�S�]<�>pl���G@�[m�-x�T)��&�?�t��EI�/z6V#�s��]wy�\��r,s����0U�3.��x>�ʢ.ѳrn	uK��I��M
n�Wɀ�R0�^R'j�:�+��,�S0!f�+����__����G��(��u��/�2�;�v��|�1R�qM_2*)���ʻb@Y�*2;+���gN����P�2�{��>�_[�S��:K�!�7���?O�:���<V�e��XvB�$w4�9c��1��]BK��I%��ǁ�Q
��jOL�8Q�����W��m��]�
�p�n�����g6��ӜHt�� Ȁ�S`ڧȔ�&�H�(��K�����Q�pئ��t&v�?7��mτ1:	��9��ص����F]��1��v�l{��ӯn�)O��+6�~z��Y� �i�Ms��bb����&����*��e�jH��v] �;	(y"i�O>8�!��J�lyReV�*pQ_�dq=w��l�"Ѧ�y�C��s�e~��ʪ'
=	OzeSA]���霬m�Zٴf7�]�$ʦ6S�ˤj���nJ����3r����Vf�"��SZ�J^b���oME�H?�uQV��]'�W!�v�
�S��s�05D����R ���z�IU�ģgz�V��ۚ���St(����=�y��G;	����o�K���ʝ�W�z�G͚�Mi�:�@�#�7��T����\Y��0Nb��ڞ�';�K�{&Ժ�p�ѩ�u�:+����F�ݮ�����ݵzu��Ө6�Zu��@ה�Z}��h6���CK��`����]���8�Tޡ�Hu�P��}���K]f1<�DV�ȊݮK�Y3�s����g�o����|9�32��
�<J�&/F�7�͂���`��d SzΡ��;�g�t�p6򶔰�*��U����_sz���:ѕ�Ɨ�:�[�)s��=���;P�pQ��B�P�G���_��fa��誈U^�|�2�����*dy�8aA��w<ۺV�~��'������W/g�������̜��A���?��T�bq>�� �N\��Cn"���?���j�[
�� wf�sÌB02^j�)mй�|�lb�D�K)��س��� S ;] �;G�Ss�sgd����}�Q ?�ts��5��i�7`��C�R�zc8�ѷ
I�q��G=,(�zFP�тlE�Ygk�3���L��$Kc����Ҳ�*W�G�c�{���$����fM'����أ4#�ڻ�d��19g=��}�����7CXUԔ5i~���cV�
��4�����p~�HY��&�`����N@���y�/O�W��'^�7Q��;�"v�8Ɯ���g[l����CsG�"Q�q����u�OĲqi7�A�K�&Xj5!(jJ�=�x������@Mr�V�dq�{ɊU6��Z0/IR�+샼�Ƌ��Υѿ��ڱa/҉PJ�MF��",H=g��KX�Sa'�f�����%�>q�����R�馂v�Լ�H��t(7I�ANC��)�f��?�Ó�Os�#Q`�]�{����B0:Ŧy/�����!�#,��[A�D�Qƣ6#�J9���wvh.��p>q�����<į9y!~���U�/�W>���#�k~N�_���i���5��D;1���wh�n����-���1�Y��
����2�i=�s�z�&�q��n�D���47sX7~���}�k�>6tۯ,��g��Ji�Iu2�b�x�Hg�p�N%}��si�Tu��^�f�2��(��1'�.p.L�ʃ�<�+���З	��D�T�s�'j��z��z�L{��g�T�E�J���x�8�|ew��P�]�&���<�Y1�ƫDD^)O9P�c.��V�v�c�<�myDt�TԄ�!/��n��Pb�
�<QGU�+|�T2Ae�U<�z��̛�r=v0+�l)���=J?w�挺�I��(�xI^��Rp�gQ\}�d%�⏛r�q�d�1�^UN�"�#����3�>���S�x#79��@Ă��p�����9pl��D��Eq��0
��4���.v���F� ��PZb/��i�N�/�9�U��x�
s��&y%���R�b4~,�� Y��a�TO �ɒ����1���7�݉1�yg�S>�yFkR�UT���C�Ԕۄ��4F�MN���gs�an�f�ȍ���x�͜��km*j/d�S�{M��Tz$LW%�ι�s��8u6$f�W��'��ջhM|�'*Rq�����������vޅ}<=a�����]�rF��,����Ϧ�ǩ,zBF���g��j=����,�=���bbM������������˫�z�e7@L�zFWŐ$`���Y�0Es��~����&�Mn�Ѽ�ʇU��>�*�R��ܮ��$�@�[$�d7�a:9�hj>5N�;���9����iާO��9��7T	�ѿ���88d�/&���<�}���E�/jޜƶ!<O1^<�Z �7�٘��B�����
a��&9R�G\kR�j��l��q�b��$e�>	O}�DY+���jU������na��a�\��ҧp��v����L��Wˢg�{2�rh����2�|��<���\�0 "��H���W�s@�3��#�F!	��"w}XI`a"�O�Ň+2'PE<9^*�^���o��1Z��͐���ձ]w�QE�����lm��*��&p?���M]	��%鄔��d&ӏ�/굤��?7����%����c>{�
<��3�*���-�7�;���k��U����&{cR��=��VؗWt��W��Ϡ-.��t:�0�q��8��JX*�\�I����%x|�_�ڑ�E�[ƕZc�����a����Ti,,��5V�i1n(��&eu)i2��Nz:Ģ�KC��cy�~ξZfX0�۟��<2��w��&7�Չ�_f�.��Ir?%j�`ĵ��}��CL$�y�억n�Ci_�-�3��L�Ӳ�[ݓ	en�X�a9�@����1���I���dX���a}��?Rz+j3A$�1D;�2rR�,He���s�P���"�@��]ng�bV��`Q� =�ޟI�<ֿ����I����O��dh.[Q&%��I�IId%�gμ;�h�V���\���{�
%2>h0F�_F�=����J~MB�rbPQG	ٶ�8~��lI2S�.vu(�+��*����Pp�� ��E���way��|/Ju���Ox�X|�;���=�.�ʴ((с|�.�Jt���Z?���Y�wt�<0p�=�C�P�aa��]���?w������{��X�'��s�����n�dC75D�h�C`�ſ�h
5�<
�� H�W��P[�H��<�0�5�;�-�^`�&��j��_���������8<r��fС�Xh�f%�҃-�n��o����2��:H�S��vX( b� ����ثB�5)�4�z�	�q;�|�qK�2$D����Zg	����@֞��P	DN�gN�%c/?�	=|�	��6��"4-�V~�b^�l��M�x"��h��)fΨ��2?���x��R+��%<��s$�KnX���{t5r�}@^sT����H����m�S���!1A�#�qw	��'~�rN{y�*���_)�gaǋTc�(Rn[L������ �f�s;!��h�*��(XC8T��}x�m����,�9.o�d@;�w�O�&��)	�蕞g�*��e&�V�?_ip�1��ȗgo$Z����(d�ȆWNz�R�H΀r-3e�c�͸�?��q\�N�h��$��+��[���rzXX��Ί������E��<���rg.�uZդU���"R|��BK�����i�Ȇ��%C䛾�H��7�����Q-NoL�c��hq��	Z���j�-h��9��f��c{����F�#�F�H68�w8�g��G�ʶ-�z��xc�xk�;��	�U�K�0/�>\��X0؊�w����k[�e�U.a'p:�'?�(�}�=ǧ&6�}Y�~�[pl����,(�b�=3���F`.�lޑ�O�3]��+�Q)�
��(X<���H&g1�r*�'F��]%�=�bw�5O��V����UDP����bz�8���fN0�������bs.M����U2�I��P�x\�z����u|�K�/��'@&���5Z�"1���wx1:ů8n��:ްRf�K�&���|%��	����釳Wy�O�"��:��ھo�a��ױxӝ�ӻ��Uq�Kɪ�eՠء�/�م�C��]r]�g)��_�^SD:���<�`�%߇-����o*�2��%Q�P\-�"�+�˾|\���zK�	!��]�)�%H^��]z���zD��/G�[�sxs����c^��8�W�\�����dN�_�W/<�x5�9e�압��j&{���W�38�t���5���6��r�|x�;�u#(,g/��|J#����  ���}{sǕ�Wi!�	����T�ߨJ.)�w���*	�$�x	 %R,V�$KVtS7��+�J%�J[�b[��c�� ����ӏ��~� $%G==�<}����e(m��e2�L'�fl�^�Ͷ�T�8��G�J��1,ڬ���\��w��U�M���e���g�ڮwZoC�#t���J+l���7R=�&�18�<bm�s|Գ��ʺ��ʼpF3Ә.?󍴼<u]��I�t�4�����Ss����d`D_d��x�Ɲ�~O�w��?��v���W
�~t�C��*�FP�]����ƻd��*r0R}��SJ��1W��%��h��B6��n&�x<R�3�~�e�X�R�c�`��~-kC��`1�2)",^�Č�������k�-7��~҄4u����Jl�dk@9u2����z|�R�-�,���M16N[�|�k'fއ�.L���+�' �m`����q��~�o���mnA	�h�
���+��:FC���tgS��LaT��Ӱ䗛4e�^I4<N�i;���=�4&	+֑��c�E+rֱH��<�M#f�de��ƖLuM��&�ɳ>�6��x�b�Dul�5:���XC�$暳���M�Z��E�$�^�)Jt���G���Y���9'��Gà�c���1���0��{����Wç�o��;�" ������;��;�u,�θ����-Ǆ*�ȕnt�Ogd��)�u=u(򞷌7F�m��8,�}謿�õ�Q��4�3͍��n�%�,����;�.�0N��0�T����,��f�c|e�Y3�'k�ru��Hy�v�1r�>to���1ՈoÁڎ��Q�ޟ��&m;����_�#�Ç���-��<����x�;��1D^�`�q�n����S��}��BK�{6Z��P+߮w���$��Q�d�p*�A]HS55�5���q <�ԩxx�V�K��O��}Jݿ�u0�n��
�i���oFuy�}���8G6:���-�N�W�F{u�؃;z�m�/��)�V�l����vr�T���`P��j���{^F�^H��=_`�U�Vm���4Ձ	�N+�P��,�O���&0�YJV�=���&��tY�IkL;���#�f}�%�V~jW�i��%:j��F?�[�/���QF��_N����r��k����������;f*Jc��'�Q�;H�0�[p3����i-w���M�� �h�R�i<C�r�1�I������xU���1X�Y����Ԉ�UK�/��6�X�������׀��b��th�6frhs�! ��yf�j7v����w�a�B��5$s�N�Sq˲OxD��e#��h�a�q6>�_R��,��E'�#��h�x�> {�۸���KI��B���li�#O��*=�-AV�د�HL'G{�}�3�V��ߣ��e�K���3�6G�KG�;|,PΩ�$�>��1�$`(��SY��q&���ҏﲯV ���{Wa��,�G�A��q�"��c���n��ϲRN,�QYF�P 
[�|ٮ�[���������3�RP�^HB��!`,�8�K�:��؉������D�0���m��H1��z9d�	@�Q�CB	r�f�r������@8e
��Kpdӧ �ؕ{>cΘ!�����;�".��gja��~5V;����d�es�>-n��@Fs�؟��H����Eq�{�ˊyP�9���*��~Fa��u
l���.��[�Vhm�E[Ȝ/s>-V�+}9�6�<Q��@�=fߝh���gD���]�;�E�6���	L�T�w�J�jd骀�R$�"��L�����y8�V|] v�����A���0�5h18�S��a:n���9/p*�Kx^�K�""��)d݊d
��w�:�"9A-�ሦ�ӈ)��FJx��A���kݻ@1�NUU�O�W��k�" b���������p�f�=�\쉣�*(mp���^�����l��70�w�,�0�z��*Պ�{����]�W_��s�.J�6J�����&H��7}�^@O�sHVs?|��{2��"! ������}z�T��&��e���+jY�:�=�nG7[\f�jP:ۼ��jp��5������o��yuK��[��ܸ�X��F�`�h����E9��}Ӱ��������0'j�d��~ԕ�����#3*)_�&�(��A�Jm�ۿ�{�r�^�Ν��Y3�&�>�j���aHpy��+~ 2��=��kP��t��w��gʱ�<W���O���z���$Ve�<�U���#e�}L��>\��Tِ3�0TQm�c���Ct�Z�v�,	�u���\6���D��q���V����[�m)@��=�	4�g�I��u�G��'f7F-�7��>B�ӂ�y}��I�W>��.χR��[�׎�?�"���צ����2���i�!��
���@�č|q�a�����R3r��1��$o
�k*閟�/��:��l���,S���l��D	��/�j�ԀՑ���y+�lhlo�8�B�$��`��3��pp�@Y�<���1*fK �1&��ә�\#)2Z�N��Ŭ/�6gi�9cs����4ٜ��Y:��i��G�$�=�h��Ұ��Uw�p�H�]�v�z )s�Y�沕V�/峩yݥu�|��+��S�.{7�\�;��p�%�����|j����U�.6�I�9Ň���]J�n�o�e9ɑ�P#���'ÿ���d�h��
X�������@f�L��8b�m%�8:/53�C��.�3����J�~�-V��Z���$^�:gv�0U�W,P�(�Y�5wǵ�T�s�������J�_ ;���_hu�O��c����]F ��:;�!��S���JŤdϥ4	�(cw-T�KAз�6j�ϵ�\�.��T���T�x��@ύ��E�ee�H�@ȳ��\l_/ P/;J/-����A�)|�W�ܣI��x�Ta�T�����h��`(�4|�'3S6���1���T�3'��(cA�^O�M���>b�A�o�L�e<�U���[&�I:�Z��2�	s�x���{R>c!#�Y�N����cϦ��`�QS�y#�A?�:�Fa��E���#%w^�^�����xAI�"���=q��p�]���)7Wȹ�A����q��Br�O΅qjC�\1χ|0Dc����'C�m�^M���9`NV���5#*�Q�
UR|��Z�����T�(%����-�.��_a����~���`ȋ{$�������5��}��#*D�C�>5���u�L��$hg6CiR'��QH�B*���_�$*t��4��YŤ*��ت���#��N�R���`s�� b=�i��+@<�OX}ګ�nP�	���Ź�	�F�z����HظȊ8�po�*�wx-�*�1��	׼��Q�i�a~��?+�����=<���k��Z�|��yB[:���oN��fH�#���^8~��"��7��HP���<)�Z`��7��A����
�]�1��o��A�74 m�OAF x9��e7i�jn	H>�4G:�������#<�xγ�YsA'.�Fp�B��c�6;�j�"<[�f���0SL�*�����)/|�)��-�	_rR�j�?�8cp*+Ƿ��p �����?£U/��[7��8�ʥ����W,b�B�(L7)ZM��&����>�j.Εj�����������F�R��o�l�Zb��1u���Q?�5��8g��{S6�f�Y�E�u�v��ڮ��p�����:M�����{p~��~���Q0��{�:���f9��^p�l������N��Z>���m���M�A[^����Q��Q�e;��!% 
���;8*��Pi�>B//��x �㝕�^
�aBa��eؾ�W�o�IØ��
�K�X��X�d]���1h3?J�PG���S���@�UnUg�H�˝���'�������i֜Yߒ>x���_�lvW���w�d"��5Z���.��l�/�)�ȳ�|�y�+�xc�)���㻽��㻵���IA� OkL�3FD�^(BCx�4Z���1y��!��h�U�!�#��#��h��c@��B�l�+�8MND��'�2�*��X��,���ء@
5�cI8�{)e�E����7jE\b��F�f3@>`�z��.i������
�'+�f�����:�/�Ó��*�U�K�t7x�҅��/?
����Q�&�ݛ�Ӆ"V�[8«<n�N�S��"ވ0
�wl�t'`�H� �������(�=|q�-"X�1���S��b�{q<I}���Z�m�O��9�S�o�Se!�6��U�el�7v����΋O/���h��� ������s�>�E}����:�V�u�Z�N���SH���c*6�"U#����ɈF�g��%�����;�7�MoE�|�F<�4Z���Q#,�� �V�\o��`{�AU��k��7aQ�4t���Q��Ȏ��%SN5�|�dx��@�+���ٓ��D4!s�BAJ�]��+S�3�ǃ�eNF�Ԕ%�`��|ڼ�ChA􎕽"|�!5�S�o%��������FhWJwP�.�`��pxi�@�B ;�N�).^������� H�R(&Y�`z2d|抦yM�>TV���-��!;�'��^�~_��BF���J�i��gD)�6����%[�nO�@|�X�n��ߚ��ެ�[@�O@GRI�(������ic��=%�z���C�No�� �L�7��ס��ey`"L��k"讉8���F~�2�Ϙ8�k"L�������e��\���c���qY�&� ���K���6��碧=�z�R�u�����{�2�� ��a4]�T�1ǰrA
���zt�=��ʴT�����΅��IWN8"e0����>��K)(��3��j��6�����f�~,]>U9�mm�=k��'�Ms����Ѹ��1LM�EMx��M6eG�q$�`	�r���uP���X(��t��H��- u�Ĉ�83R �J�fG��e�O����������x�������a��W������)���~1�]�>�>`=ȣ�V��w5�uò�p�������X�L��R�q4x>:���rT���ey�ZoY�r��=[�I�^%�U����~��O��~P��F3*"�M?,�/Ai�hHM׮@D�E�<@��Z�{���vJҮ�f!*|�/h��g���9��'az�����";����f��ѫaV�z�z#7�b�����:|��e�܉;d{��@H%�_�h��
��CX|g�ϛC���3�%G��^�	��c��'���Z��IĹ���+<��i>��A��:6�!���m���	�4�Mxe�p�=�a�v�r`���Y�A<��DУh�i�2)���)!����☡��:d�'����0Px����˪�plz4��Qg�n�zԜ\�U�R�޸��"/,t�ٟ�W�C���k�h�^�5Kwcd��l�K�(K�@2*�����%�<�����#!l�PK��� b�&߁&���1�)�����;�\����:fE�_�c�Q��*�̸�v�,RtK�.Ln�l7,�Tc����qM`x��':6��.i�i���@B���a�ٌx�5c�J���4-*Y[�<,�qM���1q�V�9���Q��~4��I�c0�������Y
���k �D契�ouTe�v/I���>t�%�͆	 -�	uT�Ep������ب�}Ebc0=V;�L��C ��',�XB�uJ��nD�xAU��{��LxJZ�p���b��~�;xJZs�2%��I144�����_"�Ǵ�k���_$�}�=B����WБ$V����WhG��t̲����Ӹ�4��Z���քGi2q=ܢ1� ܕ&Ł��6��
R�]I�Q�)���Z3���@Y�D��к3�h�V��7
 �a E��3Zd��e.���!�.;�F|�<��熒��/#�%�cK�iP掖�C_��ڊ�S�������y��j��A�k�4�5�*?�U����P�N�NxI�,@�jp}t��Z[}mM�P�����ӷ�5��k���V}����j6�jm�A�:AΟ �	Br�F:"�|��<���ظ�L#������Ø���	��E���������
_Z��ωP�(e;)R���e�m_X�־�'��c70"h�i��4�y� ��G�����k�/|<���}̩��q�������[ ����>��g��=u��N$����Xe*���N&3:�Z@A�H�q���M�����F�ǳ������_�E�������w(�6K�6O)���z��Te����5��x*,�V��"�Ns���/����T��UA��f���� �.����a!p�,s'�xM����E̥Ĉ�(�r'*��,����,�/>͂�jA�y��A	�iԷ�I{����^:�F��f���M�� 
ޮ5��A
����h�(�Nx���'c��U�C��E�k\�EzH�Z�$�)[���{��x���� ����ʤ�ۍ��Tns0����~]kv֖�?׫�*�<���O{5���нd.��P�6���]t?T���Ѫns���?��na�3X{��ej\�Z6=�O��m����4���K�t�ViKM���Z3����&9��n�˴��pv��q`( Z�o��p�Pu�wfK���twU�;i�|��V����nD�|h1/�E��C䠳U�̷��Fw�I�@I?h�+1��9�C	�2�����G$	Q�C|m�s��Z��G�{�XȾ8~P1$�k����	m����"zT��<8T���*�B�ȁa�HsS:׀9�ڝ��`{(���=5׎X��W-N�4�8�:�$/�ٕNU���5Z�q��^mUz�w�}�9X͡�o����,
�� ����,W=�u�c��v��)c��ڿ!٨�\�����=�3$u��x��v �mh��Tx�x�A9�ܙڒ��� e*@I�#(�|�J���;����hnD�Z��i�I7�io���q�;1V��k1�ZB76^�x.��e����7��"�C5���GV��čGq��Hx��/�
q��[h[��I /:���g�m��4֎�z�2T=fz8�F���>��h�H%�0p�����ȇF�i�����V�.8~��/��_����ſǃ��)�J�c�=RS�û�[]�ꏿ���"�w"�܃O֤:,5!��R�Dc^�,�����/���>8ّiI޳�+�{�1����n<���$�����?	}<���߇y��x?��	Wqő{��
O��� Q�8;s�.ϻl�~���cd9m]O����`�:7��,��^��ԊGI#W�'�w��t����Z�T7��v�0z��/iÌR�I�RR � M���5y�pe��}� ��Q�X���.�A˼���kN�њ�z����c�bU 8�����| 6�B��u�x�{��";�L>��:D�dz��Id��b�m�~���ꌁ�҃�pZ����	�h,�Or�s�7�k[Ч���dzTO�\Ή��]�7��7�lO;h�6��КJDk�"���;�|����@6w�C��}F<|�T�ii���9�RMU� ���4T���KU��Q�.�0>��^O����ѻ��w�G�f8�N�k���m��=�3(�v	u&8E:������e���c����o�}p��v���9^�1�� �V(d�?���44r�8�ZÑЫ��񘝝u����#Ql)H _�'k���/C������%��`ZF`�S1;�`�Su_k��$��B��'T�-��^�U+Պ/�� >�)��@6~��w�	������zJ1�B��CZ�����p�P�^��F��z��^�������u�/��CAM�݌�Sk������Ε~0������.�*��sV��'
\BE���[�S�������H�X�rZ;�z꺀UYq��9��pi�UC�~ĵP_i�G��ݑK��+dH%�7�q��ӳhE��ų�*�x��=����t�-%V݉�(%U���c&���~#�����3�����k�K��%K��� �:P�C2���%�h�~�c]Ʌ�J>ܕ\x�Vr!�J��aZ�J��B^a�:y0
y��>�'�z���p����%b?�|y"�1ֿ�!�n�Lsl�����s��+$?�ta,��ʾ.��W`VhN
^zKL�"�m,9}9G�7��v�WsR �II�d���X�����9�{��I����nL��'�zI�l�M>׮uz��6�K�3�����/SY��A�9�W����E�����  �,.�k�0��/��Bi�4S,�.­|�8S.�һ3 ������L�R�]�ID�fs5G}�,�`�wޅ����|�Rt}�*���+���j��*sv��
�8P;)��K!r�3?`�O4(�v�Ǫ~���d�_�k��aEu��gm���Jö��*��!!��Ǥ0[4Z^��Q?��XX��e��-��A:GO��] �6-P|/�^EC��a"amx��_ol����j"a��?X���x��v�����@������|��W8�E�8b��m39T��P���*����J!y���T9��"�(�Rx�N��Q�L��z;��aq���O ����g���0x��a�6��[�� �P����M�(�r�c�1�vu����Y[�2��t��^&����mhW	���^?�I1��?]���a��섕��/�qTG��J��8[������'�^tT@/� sy����"�S^(\�<ju���e��eX��l��{kEj�e�]�b/T��ҏid��:KO���H�|؅ՌhSp��*��E̅� d�����p)kͭ^�Ra�B!:�j<��>?[�޸~r�\\�b�GI��Z�+�zk�^��j���;�Oo5���aM��ִ2'v�A0R�D�_(�*)�z׫����Ohy���	-�\VZ���]S��f�疒�= VYwS�E��g�.A����h�JA
�b�w����{Wڟ0�3b⟳��[����moAJ�����_�z���_}���hhƑ�̒�Kn zTҥ<Ï�S���������#%b����fy�Θ�ˊf������a0A�������ÿ��ÿ�P���R#�y�!f_L�	��/1����t%�w������m�E C����s����	�=������S��p�>�2{�A&��1|A�oy�]6^?|����EG��f�0mZ��21�(oQ�ԡ-N�(�ȁ-������.��	���1ݔY��X��H;�6���e+ґ�p��/�൓�Z�w	�-��q�8�@�-�g�3ϥ���N��l�������nŒcOU ����Kf���k�^Z�,N��rǸ�oEL�cā���>�A*�P:�85}��� osvN�H3���� d�;n�!��]U^����e��ه��/WOc���蓩~�ӁًVY߬I�a�*r1����=�Ѣ>ŹR�a-�����/�{z_�ӑ��>�+�~y���	5lSƑ�#�CU�30Ty�B`���Uv.X���o#f"k�W``�:�61�F�������s@�:7����J��5�K0��%�	�ؼ����Z���[t�V��`3`ݠs�t�MvnqN��I�nV{�P���:���.t�@���F���h�le鱏�����O��g�z�̈́b)#]���.� �t<cRA!�*�r�.z���6X0����_F��CYUmu�F(9����vH}�	(U�r�3@��Y�!,��y���s|���} :5tDU�@1��X)�d��sOMnc��ƥ;��A�n�^�e\I�{��J�U�]��B	��O�<����<��܂�����:�io��^e>�u�;�6���������R����@�����M�и��3L��l���pe_�i�2�����~v�q��[�>fJ�/v7�ţ�f���}J�{A��Ǥ1@�kA3��3/-g��X?G���;o�
� q��g�M���4�4�}Lrw��{�S����0����Ty%a@Uq5w���63N�5O��H��cΖ鑂*j��.i&H�fOr	%�bD���Zu�T>9����f+ӗ��H�BI��(���H�`(�N�(B/�Y��?�~#�D^Je���L�-`yЉ�6��^��Mb 6�'��f������`�:�֦JC��N���GA��I�.gB�Mh"Ta�F8�N4
М������I���̏d���ʋ�%j��!�٥�3�'Ö���H�+\�=��q*�ʓ�)�n�+Qj��؜ec��D���.�| �p�k��f���v��q
u����.;���]Z�\�A�؇V}�Ոϛ�g!w��b���f�-D��B���Z��}x����+�%��4���DV@jxؿ-��B���%��c�%KMt����w!p9y�Q��x��̧�<֣VcJ�C��\i�^��C��W�5r�ӂ�#�I[}�ȌՍ@�Gk��	�!F$�أt����֫ހ:���,�F  ,�&(+��(�` �����߀�s�$8X��ߠ�/h(�X�؇i��I~)�}* �T����0���]f�{������GB��A]��%��t�h�R��<DXW���w��M���4h~N�5����+����}�I��'Q�	GG|����Qa��K�Q����G�P�oZeq I~�����hٞ
�˳�37��h&�<r����Y��1�Fk{6/H�i}�ڒ���� ��|�����n�� /
sK��,8f�S�����/�S��`��=����-G�!�߇��]���W(��M:�ܹ׺lP-�@d/�ٵK�(/�wV��I�i֢_v*�|
߷����0G4we�sW�S��66ŭ�(	U܁�W�&��ծ�0���"7�A��<��������Z�bL���(���aۑϣr����%�l���.�{d���s�FD|��?�"|��)��pW�?�5wjg��N�a |j��F+���.�$�NH�c��R�|�RȜ�K2�u1�QA]�f~�ǰ��Uׂ�*��G�@xfѩ�� >��q�[
	(��\�� y��M��>BV�B��@�]��lҏ�����y�4�N�M�w�Hd�s%@��G-�46d;C�2�mw��uP�9ǭ�"�Q̸w�[�����-gQ��$��Y@c����EG���L�B��t�I]�v��.`�ސw�(ST�w
�\Y��8��^�������A������s]�M�:��X�dzs�lD섢�> 
�I����׹��׫�wڅ�HcR���PѪ�Y�eg>CڿX(���;�m1��P[��*Y(����䣊K�G�]��ӛ�^0�O�-���^�{���E�Q�g��:��J3$W�����^i;"�\�2��S�d���d<TV��=9B)Mӑ��YI���!ur�����E%s���AHa�9E���I���WkD�O���5����<��#y(4�
}��p.��/�k���G������6�B|S���[��.�G����r��e�=3{9ky%�R�ܾQ�z�����:�� �'e^���p�Cc���]�LN����=|+hu1��L���j���U�8u\L]���N�`����zoz����jW�_�ׂ���D��}��J�c�yV����+�u$��@"��4�0cb�L]�a:l�����<DB��o"���a���[;,ë�G�րL*I��w�a@��%�ƑVf>�d*�e#Hau�,��"�4.K���g��g���%��r���Z�E��q��ə��j�am�T	x�O$�
WS�d{:]��X0����k�չ�hp@�˸��飜�}�ޗA�G�L�����Mh�T�\�J:���c�4�� �X8xә���6�Yó��.�����]vV!��vj�Osa4N`��C7�y��_�#�l�7���N/ޭ��^��Xf=˔l���=V��n]D�^d�W��.z8��mU{�0�|*�J��.�qOat@��X�b@�ɷ����.%<���ŧ2qK�~�!�A�ތ��+��i)�T�-V��IAU1�]*��z��Wsd�P����1Җ:.'[A�(���x-��s��o8hcȆ.z�.l�5%�Gγ���۔�.3̀r8`���|:��zu�9�������@��a7>����7�ğg���k�\yw��zC���aPc[4�&o`�`����d�����ܰ���Z�8��KJT��a����I�CAO�)��}>)�E��ܩ����
؉?a4 ʠ9���K����[�n��F�Ps:u�RyuFʦ�M��ҪӬ��@;����_9z�]��:�+Q�e�s�����:h�	ObN���f����<�v޴hU[�d[���#��-"vH3W
�(�É꼳9���=�%�9�(p��M�[�Uj,S������[F����s��i�w����J�w����Hu\��w`e@���ɈI�6�RU)UU���b��ʛx�����R�|I<_�����Y]���x+�M�N�(��&YD�^Їs�;7[�{�%{�&���4��<~&R����.�J�S�z�
�k��9��
N���ˌe
��-V�ϴ��4a;z�D{ϣ��*Mt��HS�fXD��Q��G/g@ ��]�v�R��\@x���U��G���lc�V�1��i�g�"[��iZ��p{��9��U������#鲻����0������«j�A���n�Ej��#����̩��E�,�N�	�����Ps(Ȏ�2�!LQ���!/�v���F\�=��/Ic_zƾt0c�Ul��n;�L�η[����"��	LO�k�:̾�G�^RA!LC�A�����������H�>�ñL�;�� x�_�MO�\���3�Fߊ�K�)͎�WȽ����ݹ���+��SC�1���ÿ��w�a�!�2tN�s���
�q��?6�Jw2�J�7���;!5wm��h/�ho���љ��U��ݩ����/���>M��gL>���:�w�`�;��=�m�g1��t��\�S�Vc�ͻlt���׭4�ཌ��_��^<�Ї���?��R�w^l��xMQ��nmpe��ջB����5�fX�u�ϰ�C�4�Ib@lg����!�-�(���VJ�Vw���=Y�-����ju�Q@�{7ъA'UD�@��Kv�
f�s�4��k�IE�+�U,�&��^R� `�6;7^i=&�Q_
V�z��b��C}u^�qk$�B8��=0�w|u�n�l�V)/�Z���uu^�e���x��N��
?>�K�MLb��ng\ex :W/�Ze��u��M�<��0�T6�Y��~Qɧ��l���ʹ�hTҺL/b�����z�K�B���"�/b�)�CVYmxt�A��e�hX�EÊQ44���0��8^�j���ҏ^_���L��+f�=�M��C��� ��U�A<OA�W,���#}�*|��n"��%_�{�I�r*mXJ�H]�@X$<�
��4w�xgCC�G\#+�%��� <I��	Rg�6�y��О��Fq���!��Z��Q��(J1;;krX&����A3���7:�$W_�p�F� v�>f�L��� �
v�#�T�x���m�4OGtk�	W�GI)�w����IIj���]�(��L��BI���{���ƅ��Sm�2��$W�bY�"3tgX5R+,���
w��v��z��n���y��w�C������f@���̶���nȹ*G�����*�ƝЩ�����m���!�J�l��`Kf$�����L�d5@[!8]�4J�2�ݢ�ƚ��i,B�"o�Œ�V����!h"�Ώ�%dtJ�u�����9a�S�:�ĢR�BkJnoڐg���k��)M��n��L)�L����k\G�IDYiN��n<�Yx�Ǝ٢۬�G��<|4qJ�%��5�A�^���������5�ԛ>�\\���@�(�N�^aK�B/��Z`w@حu���n�b/�dvI��b�&�-m �0W/9���%!)�UiU���uۍA�M!�sŧ�L�cL�#�I@���wf\���|-�'���:�ݤ�� ����j�/0!w��"p._#����k5x�1��
��2�b���ӆ��v�zc�:��fk�Fwëfo�`ނ9�b�\W(���hj��2g~������pG��y�:z� �*8�q,V�:�u�<h�#�)�?�&� �ad�����r�4r"��9i��� ܋{�H�!�+�=/�/AN<��3��IƏ��7]�_.O��Nw'=���s��!�o�a�~�'���Y�!� ��G�rc(�F��y�]_6�^@P@���4-���6�E9|1cYz�:�BKTt��V1�]�u�y�V!��Q��!:���&��jaoh�-I���#%�p�0q�EO}���1A��:G���1�sJc7p�.nD=꜇<Ӵ^�y����T���l�V�r�C�!puލP�'��S��+E�T/�)Ώr���j �Н8^�N�
�yK��,�P�$��s�Re�&lP�,R�5)>��:����:�8z�~XN��q�C�W"t�mp�]��-L��������K'O��k��*��T��DD�����O��BO5|14��KwPL����u������,vt���:��ݠ~Q>]\1{a���xc� �1�Jt�7��(�"��T$�O(��XR&y�|����0�iK�,).iQҨ�j��^��_�^��F��jd��q��\"sj��
�l�7�(I��a��b�t�<�m�m�?O34�]A����OrL�J��#��q��k��!v�Dv��F����=_�o,_j�O��Հ#괜|���s�~ݭ^����=�����ݞ�o1(�j�8?ɏ�{�?��!�뿻�`��n�/����� R� �%ï�� z3�^L�?x��Q��I~���7(h�᱃�gh�Cg�'��i8��G*��\q�)�F7��g4ec����1���]�Y*E{�]������Z���0��Q�H}�����ɠ�v�zFm��cۘ�������Y^���)�~��?�[v�T�tu.��m�T��o�\
'*ǣW9Jt1�i�4s�|�Ɖ�h����Di�<Ԑ���	;8�#L����証 �gb���77�P^XX/N�A}S3r���P������\��u8M���G�
r��`����>�7a����}p&����c�X����������Wm�U�O�41����+�N.M�?CS����Vss��Pk��љ�bľ�e�D6���n ��������o��x�A�ю��������r�?`VQ,���w(���W���2�s���N�E��p�D�-�>8n�p	n��L"l,3f�U�Ml �h|�y���Ri}a���|%����j�s�t]���'��g�ք!<z�P�����;a��i$:�űԄ�4\nu��?����62�hI�٭�Ƒ���\s�����	�ojF�������9+���Ç��tk��p��q��=����'Q�	��9��h���τ�3\�`nm���iu���������&c�0�w��3�&o��a�>fhF����	Gw��B��!
���u�C9a�.:dLC4���8!_4�o�s��#r
��n�ؽ�*>��^�T�TƊ@�]����Z�Nbl��������*m�-�u��;��ʰ�Dsџ��9#�������9F �	>I�;tۄ'$�p���p��kN�R��#�;���G�*�.U*�����Y|#_A\�yX�@����(��C�.�#�	�+xDfp�P�oP�x���	3x�� [\qv�Q�	C��	KH4,�C3a
�ĩ������V��ټF����w�,��|3xAm~��ĥ��Ԉ��+0�+P�8��Z7����?\ۣ�?��-r�@��x�=(QT�S`Dm'��0N�B�u� MXC�5a�&΀Ͻ3��f� w��h�a��;��g�8<� a�6|�g^��yA �	���sۄ�#�o����z�k�%�/�����Ym5���!<���4�����������	v�|�L��BᲟ�!A:����  ���}{sו���)Z�f:�Q�,˱w�Xc��l�XJh�=�+ݠH�Q���q�5��ݚ�-׎7����8v�(�E��6a�9������� (+ۉH���޾��>��Lfs��o��6�:�4י��/U{g�G��ӕ�psf5�B'����',�uV�:K�K
�?~<yhz9w�Qw�AM�שּׁ��ï5}7%���]�<��\��L��T��s��3)Os�$���#e}ڄ���U�a���:<wN� ���CZ�4��E��Z�$m�F�C8_�����l~���M�����҅t��������:��3ZYha��P�%��+��!|w¨w'K}�����Жy�ϩa���p�,��F@��!Q���&�����	[Ѩ9� �4�� 
W�<v;ȓ��v;�'��ڲuu[��3�B.~]R�����T�H*̬�+������p�T8�6���c�o�	ė���f尝�څ�z��3�{�� �0�5��u�˓����R'��3� 3c3��E��s�~��?j�����{���Jh��E��g{&���i"���u�t:oAqWׇ _���VϘ ��Oۏ��3�m�4L|;d�j�4o�7Q������B�u}��@��@e!Q�ð������ N�^������h��<��{"�I"tDͶ������ɇ���tL]�g�'��C83�3���3~�U���[�լ��Ц�Z5<���0]��>��ڈ{^n��
���=f��4�o&�m4*���������Y��]�J�fX��N���KS�;�W����2��D�&����.��[\�"0�Fs��/��]?��Ky!�v뷱�)�ʒ�H�K�		:l����?t�,��~;���+�����]�8��.�zژ9�˥R���EnW�nԳ����(Μ�͍�;Ѧ3`�>�|0�p�믕u� ��S�J�H�hz����\|N�UT�O��0�=�tѲ����'�V��������$�g��])pS��`tK5^�-3�%���������N��u��3��eP��y�d�s{��s�9��q3?`��k����
�{a+�1��
),fS�DA�J{S���k�mr���#�x�ļF"�5u/�^ ��BP �.�s���h]r Zs$Y���]�j���%�B�� 'o���t(Yl��j.k���ͬ
�I}��1ں��1}�j��9����d-�)�L;h���0�^���&����<�6!';��o�vJt��uYN�n���A���G�������\<馅���1���t��r.�A^��x�h����jǝD��&�֐>�5: �9W/�]ө���ZFA&�����.��tk�Y+N:�7B�Ŝ��W��?��~�g��lss&z)$�N�����4iR�
G�5�z�_��OY��㛧8��DwQ������a|"�?Σ���'��>5�ɼ��Ħ3�)w�Qf���&o���
�=�f��3j:|�S$�,	�Y���D-��F�j�7V;��+l�c����0���W�v���J��!z��o�-�˺�O�re�ng"�3'�ّ�N���\���˦!�L�(�i�o������fް*m
�klc����ф������ߦ�o���?��O,��o�����(`/I����Fl���������"��
V���R�aa/
����W1,�"8�����a�z��R����"������A���"z^/Hi���ě��Z�v�Eϯr&Q��"g�qW0���ػ4]p�P�����}�+a�x<z���������.����PvP/��ƶ��y����z]������k�	]��&t��/���wH}�k��������ǮTd�[��S����1w���
!a�7fJ�.a������%��(P�ʷ>����n� f�d�o����Dq�������>���Ek�6��Cj3K���e�����q���H��I\�u�d�B\���V�Yk�2�*B��/���"6�5m#U�SajA��sa1Z����i�Mm������ʉ�[�e'5�����в=m�.7eG�j7��������cX �?� q�p���;����/�.}��t��	G��`Դ�^�t��-9qdz6�k��]b6)�@���n*5�,�uzY�|W���>�-�C�t�p�������i��o���G>+ ��gx�T�5	Kz�SXǬT֤���ڭ�K��_��ô>�MassiOm����K�2�������]$�Kak�_��L�.O����Fd���=|�����Ar��G��J�:ѠW9�X���g���,y! \��N���?$�Y��!��.y;K+]Vג���6p��t����י�����#�u"�����e�����s���d�� "�}� �%p �_ay(�(�bǷ��N�'	n������L&�ڠJc��b@�6��-�$�!��m��x���ڷ1�����O�C�W���F��Sq���=�NO~0�͙QV�X9�!�d��&CH�;�!�w�E��?��v�
(t���u�.�p�a��;��k��#o�O�x^����� ��X����PB��w��!9���͵����"��b;{�q���0nH�-��"�)Ql�V�5+�M��X��(K6DI���;%�~�%���Y^�a�Zϩ�VW��lX�:`���b�x�$�X�?��i�l?�ַs��pG�L�)FtR_d����z����^e��MX���Y�Gr�D�{�;���;Ue�v���ҍYβ�ˢ�o��E4��ٜo�����Ӡ~ifև.�u��Uw÷�#�	܌��������������;a���=_yU��>�.�b��>������9�
��"�"��>��<�cߌ�{�P-�L�j�ߺ���/���@�<CR�~��|�_][g��W�����,H�7���p,����$H�����,+�u}Nd	Y1e0���<��'~`�9@�l(ٲ���zθ���7�<��yH��R �U�s�u0���HP[혠�<w&r8nD��s���0�\^>�ak��������.~�uSXkzˍ����k����Ս�v�޹P�^X�mT��B�b�Ѯ�����f�6��=���0އ�o++q�"��a<�R{��V���L�r-n�%�H��Ȗp4,7U�Ve����B�����}"I��&�@�YE);$����Lv�^��t�9ZWm+̲r����U������G�҂=�Y[
՛Y;�P���C�GF,:�ш����q���fZq62eP����au{c�/vP;Ag�Q�)9�Қ)o�J�	O��n��Sl��r/^}i���N!�_�<��*@�8����nv[BGˏ�*J�l_$��.Ix���f�5��U���O��?�0����n4J&�|�9��D�Ŕ�)$�-����K���ӛB�@���0���wo�(�����pDH.��s�{��n[4�2������C4�8�2�<��:���~;l��m&m����ȾqY�E��O���.i:0[K�Nat.�ds��~-��7wlO���r5����^8�tR	�R.��-U�ыA�?�*�*�Eh�^�P|�?<�FQث,R60?�59T�i�����~�δc"K`�d�[�?��M/���]2@I��m���2�l�c���`���:�"XO[D�Z@�#�����K1��^I��iBtc�.9�V��"X21$��4�^��;L�`�^n\Ӳ�a"F�L�\��@u�2����ӘH���JՅԄ�x~��m��AE�BC�|��u��֕�5e(E�⚲d��ݽVO��wt`����e�%khU�h��Fv�RI�[��V���p�����3���N�o�An��ά/�j���9��8�g!=����qٔŔ :J�2�<眃�v�0A�m(�b
NE�L��V�L�h.u4ˍ��Ř��QWK^ȣK��}@k��.J�����G���j�#_�R9wJ!�-C��GU�iX�R���M��n�X�/�U}�`$!ۼm�s�[:��2u�r�҈յ?8����]9'�[�i���8,�PU�%��,��}{�j��^Vt�v�,�[G賈s����$��<-�J��X�x���ӟ�s���
"�2���nxo��a��N��x���[��TP��h�@� _�����̽�*5_=B?��=%�YN�*�G }��x�\tl�g�,$K:>�w7�\����
fʤ75���F�r�����`@ssmw�WNGr���ш�<^֭��M��a��c�2�䕤���UM����c�4Nr*]j	f5yZ�dĕȪf.���¥(�r�ە �Ak�Kj���Fk<��@&?a��B�m*����&&�j�:���ϛeҊ�B�B�)��zR
vm���v-�(Y
V]6�?���&imnv�cU�`'�v�B��U�f�7F�*��Eޒٓw�OƏ�L�SIf5����HZ),+%�71H��(lyW�@f_=�!���>JnGJR�%ǧ�0����K'���y4�z���&1�Qa��Z��0���{=X���UN�<N���Rh��+�0��_ ���*l�9��g��|�ר&��xY� f��,H>�#79~��-����fxDQd,F�M������j�T�X���y�{m��Gm����	$�eq�R��
�+@/�^&�gr���."�!��n1�<�JgR����q��QIyh�/(J��)��ndvj�-�`�:�=���g&F��ņ������� ��m:Ŗ��
E#<j���j��O>x�� 5Sf&P?2��t䢚����o%�OJq���XUY��
{-	���o~$��qy�@*[��}m!V����v��{	�]N�%�<7��
fx��t��u[C�"V�E��l	3y0�|���G��K�����g�6fni�hbL�9D�(����c0�=�"?�嵜��2%{R��	�	�i��t���e9�~��q(���-o�nj(�CY�T2+���Y~�d���q^H�+�s� ��_UzHT)�H��x��0=��Ϣ;݆Z&G�, :�n�@hJ�Bۆ�Ul���$�a������6� �t��5�ĵ�x?�Kd)�$��j�p��/�R���	�+տ�������*�Î|;�=�����6���ɻފ$���笀:�����M�(g�:HH]�d9s�K�R��J�N*"��zQ����5����ܺ�" �3ip�E���4J�9��=�R��.���2V���Њ���#����"�<��*U,.� ũ�;a�y�1�\��z(�kjdqQtBq���%d�i��W"���������+.9�	��؂{h(t��i�����dJ3��W��p�݂V����^�8��U�^+�L�/_.��єʶG��+��'�Ew�fw.P"�~α���t�bFr%�2�������#PӣcɿPt�gZ�� FF}�J>��9L�H_�da���������Vc�-��v4\�T׺c-��C���[A���;�$�P���$K]|��ق�)S�,��i`Qw�����]]XQ�U��I|UR����Kz/���F3�⤹ieSC<8PSŘ`.9���'^���.�{���{��[���������!��4�[���{dn�?�J<2"�[閺�7� �̫���9g��@w����^
����x�zI�E7����s0L~���i8��]�:~(�Y�5�_�h��BƁ4���[^����!~���(��2c(\@+��h�Ț�m��
�\,e/���Lޞ<��G'�!�p��,�1�@����'�롪͆��aх�1��"���m���B���ƿ�<��&��0���������P����AQ��@�������GH�� T�������b�6�� ���1짮e�$nȨ�l�Y;z�yh��d4B�/�9P7f�T�.��p�ц����Y�C�A85�
d*�P�^{YT��4J�E�1W�N�`���@= f�3���@Y��zD�u^C�zъ$�ڿ"9+0:d�/S������_���ύU�b_��>�t�C׮@�KH|��
����O�p������N���W�K�_����S��(:�<���A���ӿNZb9��(��aJH��lp�x�/����.Na����ߌ?�& ��?�I1��i��0{�h��۪���m>���5h�J��L�hu�W"�G �5E=���⑳�'_`��FC�{�
8������g6�2�F�`$Q,wN6!�IJ�Lˁ8����?�����k9�]��m@����	1\�ᬊL�	����Īl�{:��X�������9��!��l7W%-�p��'��o#�&�"���)�Z�N@�t�M3�z�5S�Tq`Q'����A��~�c�N�,�\ٟF��|����7�U͸�a��j����?Z������I��?~)쎸��NCe	�����a�{�H�(A�^���j����;&z�g0�ؒ��,������i�}���a�@�W����Կ�9�AR�X
����O4;�\�����h��`E��^v`�j �Eeo�*�h������Z}'o�!x0S�b��Y�
�u��U�3{�Z��s�V8ZP�'*F�h:|��tW�&J��Z��u{h�u���S	�u��rS�Jz����϶��Z]�R:Zp�f���9�Fۃ��aajd�VC��ӫHc���'oM�A�-e����o��}�u"'¶��o[�KkL7X�O5,\��
��tz���}(<�Ҷ�S>�H��sI�*7�[����R4xT����ԉ��M�zy�iD��،J5��Tp�u�q�ß
�)���s���E�s[ X���Ҝ-,����C�K���?S��B�K�O��B�y��
��e����?S��B��A��B��t��e����K���e�@���%��Kz�����/(<�����O�/��;�<S��l��sH �s
�<� �P>`�T�|2 �9��4� �U�Jf@�܀�dL�0m��t9��ʱ�2��4�
\B����֚5��5�Yb���`��S�%p9
���{���4�h�����z"���~� 2G�W�h�G�I}7����,�u[���C��K<�qi�A�q����X�6�)
�n�	��>�j�&�V�jسY3l��N�^�����\h��	}��}r8�����6}ŰS���\���.AM_��'�*;������sҞ�B�T{�z`O��]�p����s������3V�M�����{��4�����*1qO���<y��2�G���u�f��U�������Z�鲔&rINq�^����ۼ�.Zx�Ώ@!é�Q�+�Z��^;�Lq2Kw��d%����I��Q�t���Ϣո:�UD�\��<�TU��y��U,��^�|
���&�a*f��2p^���A���ƴU��Y
��VF�U�+U/+Q���Hէ(�M]s *�*WJm.���ʩ9js,�V���aV.rl��jSW�Wy�9X�����\\˲�*�6�Rk�>T�rk��/�ϞGe6��]E�u�kUڨK��a=7�{�W�g�������a�$]����ǌ_#Ny9A-�;#h��X��A,�c����5k��L���5E�bqMY�X\e�ɴ���5kcq͓��{ͻ����EW���(��5"��DΩR���bM�[J���j���F��fkr�x��^�!��z�w��8Q�-�ka��=hqea��]b��a�-x��KѠG��5���	�< ��N
T�f�ў���+[t0�%�ζ"s\���
:�^)�mbg�
f���N)�2Y�-��3C�Էa^6��gb��P������{̫��W��I'l�q�����i)3�;�"���c8��li�11	�)�o'���-�Q�l6��+�UFƢ:� ���٦��%m�Rx"̝?���e�;%E)����˼�Ne�K�~�O�D�2�E�z3��ꎙ��l�AzW�1l2W'r�>�|���3��v������g�����ܚ�	n֑�&��r�	n٫��Vb��3�My�7Zp�D�	n
s	n�&��{�G2�bn��|n�[S�^�*�-�Ǡ16Oh�D�kC*/}���QDy�2l�/���,{����|���ۈ4�&�=HZ������4۳D4\������Ө���F�k�o �1��Q,PS�BA�D�(��
q
�x{܁���Mb�s(�P2nA�`+�L���R(7��ZN�9T���86��3��Ϯ��Y=�S��|V�eZ�s���yP�t�4H�7�L�!�ӆ\4GW�J�pu=]�S;��HZ�|_{�3�D������s�%���Y���K,6��ۜ��6e���"Z&_R?�w�>�_�r�8��rRy�<j1��A<:���bE�q+�K��J�W�/�d�E���6~�o�$�[��äL�����Z��������2��e�<E��|2t�f�^/H�i��hC���L�kV�P�D��L��$�U&ЮJ�5�T�[m�Z5�Ws��y�����o���0i��Z�k����b���1��>!���e�*��K���G���E���%ϾGh�O<�d69;WN��s�S������uv��eI�.�uF~��w���D]�F�џ����"UV�*dz2HW�Ϝ��!9a����F����T�*��Y�[��(�3'�h8I�LI���41[_gHR�t��i��9��������`�F�@٤��Q߀m���;�v����n��� ����y�()�+�6��(\+wûB��Ai��nVujC�'��:{�:>�F�}
K`��6��疲��F0,��-H��Q۴�UU,T-�+b��f�0ʤ�%	� ZXz�iMi��s�z!$�=���R�����z�.�������4ݷ@��J�,\���\?�%�p-���SCn^8�9�ۧ�Ψx��\�AΑ�a����eiW�[�eM#���]�P���6���c����'N����1�r?8�z����]����:ѠWqsC���魺�fl����C6��m�9�p.*�`��-<T��������vw��#Y(� SRWg)^7��~��AT~��cC�Y~�Գf�r) >�{��c;�6<��+�\&`Ta�F2��+�M�:%�$<n��+С��'Н4���� q����,� ���6��%�����W)��F��q��-r��y�}ז��M��ܾ�z�pK@;[���}*k�<[�g�nץ\q^J��L��|Lg�i4x��m�c�{���'�Ww�s3�z~��c|��7�4�d%j�a�ω���X�,,�c���b����X��9���L�������˗��g�f7uKi�ҙ�U�v�\#u�/y(�ǕS�E��A����Ak�o�X�f����,Z�k0+��,�� �A-��s
La�+��� Ԇ��/ȱ��;t�I�1<
|%�
 �b跄1���Z�� �S�6uk���y�२T����M;8D��yY؂��x�ꡋ9S����*�)V�\��k�����'
xw,��s�i�l�anAo���r�`�?�G7�:�O�4�F��X21��y|�����sOS��7���{�*�T"�oN�?�<�w��v;~f�VF������ �����Ңdϧ8b6���)�y�m�')�iX�M̕K(�攏�K��x,�q�!:R8qJ��L�/ɵ"�=��!s��6s>JdI%�����4��`͜yny�Xv�+Q�1� �*���{0����g'�)V.pH^�o�����%/,Y����qU{[���z��B'o�(|�m��Xbv��i�e���*��*yЄ�R!V���X�����*K
x��Eu��!��d�G�DO��&�_�G��a�5Ǖw|�u§.LYB����*ʹN3�Ԕk5�j��n('��ĜX^����CX^FLk�@��ж �b�^/h���u�Km�ف��ʘdJ<�7G��P)�?'�2�S��]��i2w��̎܁��/,rې�Q\�� ���ݠ�Ur;
�qu�P_�ȟ�����	��_��f���J�熴���oCa�{D�����Y�i����/�m�
(��$��2��.-��EJz��j)��툗N�����!v�z�5�����)�]_��;����^ue������ܙ��Mo[�ؒW�)C�JW�N�z�ig�!7�W�X!vt\n��dD>+O_�5�P��_�+e
�8����~��Į��J;^�W`ɻ���]�mpZ�>7�S�����j�D� T8Ȥ����
�I/l�U�,^��8�a ��-_V>�<��3���J��2���|�t	�i���
����^�⵪�T�Ru��5�5]8Y��^x'��[�tB>�	��*�~(��%��-��ܕ$<)sL�jP[��h~�
��@U'���K�E;��j{�;7�G��Fh�zFN��}������|�2�jH��͊�M����~(��b�#�=�ws0<z�=��۔�����ػ�c�U���q&Or�
;w7� ��V �
��c|���]�%ԋ�J�P<z�#_�-8�j��d��f!�d�EHԧ3�o����=�g�zO��g��_w������,	t�����d{����.� �.����R������,�~'���+��������ꅥzmmqG�)m��=ņ���%��@����6��Q�"o�(»�n�o����VLj��_Ɩa�Z�t�WE�~wti��߄�a��*N�6�^l�2�5c�^��X=�¢aB1�`J=t����ɇ6����㇓�JJ��R'kH밵\8�J�r�zW},�]y���0tF�^��� ����'����*{��h���-y�YЪs��M|�?�	�*O`��rt�9B�� ����ӷ�Yu���[Q��*�l�_V�:4�8����R�60e���R5���A��&�M>���w��������ʭ���������4� P���'Af*�H����V��V~��Y��s{ï�v���ޭ�@�<��y4\�B=�;���(i�u���v�M�Bl*� ���)j�i�z��q�%���o`q?�B=�A܊�!HaS�܎~�w�_N�Bb�7�x�`�7y ����}t����n ��|t���a�y�F��2�7��� �v�G�u����1�iZME(w�u9�x�9�M������p>L�rX���<?fXBlE\�#�ː��y؁�Nc9P�� iĝ��M��R*�)m��l�L��p�X:\���	���?c���_~�׽�/ٹ1�ɭ�������u��s]p�^���u�S�y�K��͠oX��y���M�:�M��퇮�T<*i����a�<�`�F"�������cxo0�C�rnVg\���r�E��Oi�?Q~����c��H��9M9W.,��2�EE�vA��TZ �����VC��hK`�_ɭ���V$�\g���<���my���ʸ���c�	0�Rep����Apݦ�����^]���G-iA70�7�\�򛠿2�ҙ��L-\�G\c51�+�~��Vǯ �E�G����z-h��ۊG�lK^���D߅��64��I���Z��I�EboZ�q�a�*Q���?���;��$����@��]?�_
�]ډ���0fK��Y��Rݭ��Ab��̀M�HZ�|��2��e��μ���¾ΐ��3�K�4����.��e��K&T�z���n렋jK��؂��B��:A�aЗT4͂��_�\JZ��J�fX�/ܥ���V�m�PQTi�z}RABK�H��V�*�%Y����T��\$Ab_��1��ϛ�� z}(ո೦l��
sx�z0�M�'=����q���s���<F����a4`��0��%
��/iꮮ���U�/��!���T���hq	��`��2x�1�����P/z슖�$IC��܌7��]fi.GB�͊e���Zb�������Y���a�Ȅ�>@�$/�3�p��Q � h�����U��Ŏ�&
�H�������%e��s�L�ƾ�yU�MɹCw���"^cA�P�`�3�m�^#�E�V�g�J�҇�ߔ�N�GR����dnx���P��x���WQ�W��W��eX��۰`����ϸyj�h�|�v�_x����	��z���1������c��9�������c�vy�����Z��B��#n�/~��ar��S.ǟ�!��{ػ��?RB5O�mNY�x��Թ�ҙeł����c��(�X6����X�պһ^�w���)dQ��ʒ���ah���5M]v�z
�y��z��<#�{��cEwSw^��c:�;�o(���*fw�bX�6���6��ү����͐g@#׼B=08, �?���Y(�7�M�6�#�:<���3��!I�-(��ƹ�R5��l)�|a��N�]>
G݀|4���ԇ�$��I������Y=�)���,a�
��N;x�m�5^ȫ��_hM��!X3d��Ej�˽~�띤f[��-���� ������+���q[���%xE=�,%�DM㰳��������������eX0[t�{��%i�>���V�e��$�߳t��K��Ucmx��ø���'m�m,V�Jީ���L���0	�?3��(��s�^�O��j;̽�ʭKS�J��EB������]��V`��c}���@�{@d�9}DЇ���t,�C���K��{tJka՜��?���ͻ�΢Y�n�6@��*p�oo&���!W��Y�D�~&
�����0�c�[��j\��B!7��ʒp��LB"�D���z}y#W��DT��(���c�vԙ�D]�36�'�8���]�-���W�)��Df�����`e#���D����(�z�T��L}]��ӎVZ)����/�}9�(��0�f����*KS��/++���J�8#�L��t��Q|7.���>�씮�;t�&�*w�~���8��01"y��q��{#l�k�9<rz�U�[���wb�E�7c�b�(1#e�ʶ���)�e|�v=�-������(�-VC����M�f���U�f��XA�ˇ��=��J��,�锽�R�5,*��:�݀�*�n0XT���6q<}i��^jkyhj~�wѫ�/OJ��荨���Es���K�z�kc>J8����Hz�/��ۓ�(ڰ2�Wd�}��@�y��%ݖv��v�j͏*�j�F��Mdpغ�72��_Ֆs2���$ߛ��4�HN�Kku�5�g%$+�%D�|�����㪲 �z]ΐ��2d�!�b�)*����; 3�.�:��~;��Վ�\P����y�f�����V�:�ѐ�-�اUF�PqZ]:5��,�~�В�<�ϟ� O2��&����z��Z/�ż�L�$	�
_z[�� �CY��֞��Iͮ:p?�p��<+�r�k�ɰ)���ә��VNoR\����<5��c���]��]B�� �2<���<@G�)�����^ߔ��
�AN2���ZȜ��K��<�*m�B���\"��@ؽ�xX*���E���Qc��Ə&o���/'oQ�_��@s��}��t�����ھ	(�1G�9K�-O�,#�V�۽��.��>!��]P��;���+��g ��XG��|�A�S>fs�NG*�.�v���tG���cO���p�������ϯp(0�?�1>�@sL��5v=y�>�J�����Ch��[���F�\�:�{�Y˯��}�M��a闼�M�|�-@(o/nS������ᚭ�5iB�ԒTK���iZ����N�e�֗�Zsq��P��+d�R��Eު���F����~/E*Q��L��zvn�]���rR��)�x�ًVE���o�R��D	)��(g1u]�x��}/��z-����� �8S���5'��%TǢ��i��H�i�0J����Ui�i��i�L��\�ӹ�ۃ�ѳS8��Reѣ�����le�HX�z��{�\6L��T��/V�Fj.�C&�5r7慥c����Zim���T(J�/7%���Y��GMp�d���ǽx�P8�*[�R�_�a�ޭy�KcL�cI�� "q.�A�� �e�ݕ�;Z0�����m����b��?��7L8����E�����<�X�:`	�Mv�G*C;[�ð�G,yZ�^pYoS"d���tl���OZ_
(#b�@@�jl���5�6�GϹAԍ`�S�`��cW��a��:�Z\�I:� �7M�X�#���Q2�Y�9��.-,�`�W��^��[��3h�j��&�pßGU�`4��A%M�g�F��a_׃Ƒb��l_g��#b���Y�D�8�m��c���Rnk9-;���#!G��ǞH�LZ�70�7���E���xo��s�u�o��EWyS/"6ݎ�;p�f1�d���h9
��p�)8`�����pF�&���7Р\���;��/�и�Nz
8)�q|���jj�9�z���ɯX�[X/�%s�Ќu�������6@�0�1����a&#�\ۆ������A�����sy��v`��1�L�\'
�~��*#آ.ə����xN�Ju�3��.�;r�Z��OƟ!���S/M�'p�ɻ�_O>Ddal�;�7��G\t�/������\�g�
�<U��������6ey�u���1���W>��N7����)H����o�pˎ�:�2�r����O@�=qs"��I��|{}g�M�]�����w,��-L}K�)K�3g�o#oF��3��L�=�zϤ^CgR��;U����M)ML%Ih���RJ~�M�p����|������i$�<vt�S���ҪZ���S�Gt/Pר����}�?t�v+:AL�8	�H���V&�!*��b|���zG rx�*)F+G8�_3P�x?�I,q�J��u�J�1�z��ЊjN�e���Z�Y���̘,Έ,���0�;�*lK�	/g,�#,�r��qe{G{���-����UB'���T����VK�f�
��fB����"������y5�1�K�*~|�oy�A@�~�cƆ����ׂb��^Fѱ�g!f��Dw�Z������pk[��c��,:�G�5.�?��Q�E-�}(�krsTb�UZN�7�de/��F%?T;�ٶ���f�����b��ð��m��1<(0�|謥����:g쁛Ѡ�A��(�4�E�#���;"�L�זG����Ժ�[�(����]���@��*vc�Y��A7�,���?��^��(!k��SS�����c�N��II��y�Q?j��X!�M�Ͱc��8h��Ye1���_��ׂx8@I�޶�Y|h�pdyB�@�ٸ�A̲�P3b�����&a�ZL��3GE��y7I����X��0g稨a4�<8]��h'�x�N�c��)V���UMq�� ��������,ɞ���N�-��V���Ea�<��h_VEH*#���Rd��@:]� U�l���g�f����ZK8ѭaDuX��'m%�6�,�����@=�/T/�����8�����uTj�e�UV�;�t0�dm����uT/*��H�+9*S�0�c��6��C�פI,�ڠ���B���&�Z!H[Y��=�E�y�3<��Xh�I���<m������t�#���V��ǔl4�og{֏ս<,�g�oT�i�����.���;8�E���u؞�V�}����i���M���Š����j��o��ĸ��J��HS7�(�""�hP�<�+�.±����~�{�?1�8�C�8����Z�v4�Ӛk��f}u��X��.,����2ȓXY��Y��F���y{��8���ѭ�˶O7��}��(�ˏ���V���p/$q�p����npX=�	S��b�^�ݙwvp�J�s����e��r)��v�ZH����ƚb�6w��.�Fi�(f,���/4p�t�i	 ^e�o���v�\��X�s�%J�� b��?R����i!���Zk����:�6��J�ؐ�0o�z�GO��toIe��0Xt#~>y뜧�>�_����:����Hf��qf�h���V%	+d<��3Y�����!��TH��YT��,x�r�j?�Dw���P(����υ�D��`s�+��e��:M*姥��ֳ���W�8��2�TC9�|y��C��j��<����C+X*���h#��!B?��='6�_,���=�g�:��KQ_禋u��.ʿ�xH���H���vS���#��&@y�Gf
H�L`-����K�uf=�\R�g�bܛZ�(DQ2E7�c��� u��Qؿ[M��q���M��[/���q�`�a}g����RBJ��d,������n��-�A�l�%�Q Dp���?~���<���A���{ ��w���E d��`eK��J����%��Ȋ��ǿ��qA��E���9���Ou?��"d�w)��Qw�7(K�Z���V�'*��>>.Nc��]O�[�A��5�����K%w��^ؿ3�}gHt�N;�{a�b굗�Qt�.�����s+�$ft�p��|::�!#a$�n�FmW�af���y�$5}QN��i�}�6ݿO�Wn*}tA�=�"d�np{�S\�E��Q�Il&�����Lr�VV��4
��
�hU˕�S�A��g� %<v9rS$�_����?E���g� B��+�6�b�����`t8��^čA��~}�.PP&��u7x��`=�R ���@a(2�����tW&���3bz�ZV�|$��C�L�ba�Z?y�����m�y����5] ��D���=G4�fD��4=K�+��uUY����0)uƄ7i`{Ͷ$�e��	;:��н^�t�8|6�J�~)!T��P�
R�`�c
���[�*��HPA��7�[�V#���{{��Ko@�6�M'�5�=��f�%R�4JCOp�2F4�e��0;��ri.c-k�?��=!��H���>��P�ŊRA���rwh��}Q�l��1��}���������ƒ�D�X]�0�5/;f��'oO�N��~�h�)�7���)�D!ce>yi�t25a�%d�k�ŧV�Ҍ����P��ʖ@�Z�褉���!�'�d?��+y�H�����j�6�QT��!S�TR^s��x�����DQ-%�I?����H[\엲�la���$�t�|�D�X�2Vɉb�^鏢�\{?݂���r��o��Qa{3��v}�**ϣ��x'~[��ר��L_����#�w���}_��AX�"�2.>�/�{�A<���Mo_�t+�@ؒ�+vX�;|�؏"b"���(
��I���v^�X#M��p��2;�QnG4�����#_�(�yQ"8���p�҉�)砏>�����E�����T|��7�@���/�gJ�h&2��p�+���^ę��)(�E�;���|/E���<W�|���R��vY���T�l���h��І�����;�ЖF�����C����'�6��P�
C����g��E�g���a�.e�(���-��A*��>�
FU�F�!u|y���/
c�~L�j�W�:;���m����7��U�����T-�vD���0o�ΛeΨ�F�LAs���%Θ�5��ܽ'�L�"c���� Sܬ6�#��Q!z��H��z����4J4���Q��@h3��N��3q(����(�}4]|�z��&��(&~8�*�!>�։Ө�f�!�d�6�쬴�{�!{�8��4c�!���ᗁ3��$0���@��.���
�%E*Z6���5Y�O�l�]P���E��b�Ժ�Iѝ�_�0����L:+����jJN�%��o��C<����bFn�"$[���|zy��+���3�c��Y ��Q4P*ט,�c��S��=���������H������/��D/CEr�#�m�Z?y؁n�Wq����䢅��c��C� �i�K!�>[3�Ae�U���w)��SkDd1���S�}�万i;w�ؐ���5�Д�i�@5ZX��#
���e�ҽX�up��9�*������y���^��>�/y@F�.��$�����P�Β%y�c�z���5���Ĭ��eIivzoO�3�Y��^��}�1�{-�g��W��%q����J�x-b��<c�E�S�X��?��OP~�=Y�?OmǏxR^|��ȑ��)n��K
+�O�̽0��b��1h��h�ń�
��K|�{�7���DMX|M`c��������������W;��A�j`���$�⣯�@;�&�e���7�ӷ׺R�ݔB�$��}�n��7�>�yY���D`ĺ���V�˵��!߃�/����14w��:��R��A�UL��#���hqNx���v8�����w�<��.���A���<�<CwӠ+�5J��ED����^�9j���"q��%/XL)�]�h��-yk	������}��aw�&��}�ù�Y~tW�[�i*d�"3�n�h��m|��I���^(!�$�e�O�ڢL��b���:���i�����|>�@q����
��D�9�+��!���,wv8�C���y؝���f�2�^Eu)]�E>"4_����CUq��1�(��Y�+*'f��x�N�a��M�ַo��iz�<\{�����JB�6{�%�p�,h|*���H}�1C��E��Lw���w��;$�[粤��f��K�H�DF��H�}>m�.���-ITL5��a|��6n�K�(�Z��i�R���.���W��-�ӳ�Mm��
�p�F,�<��ө��Ȫ��[6�X��;u�ˎ'ԋ�����P��L},y��m�"���L�׼��7* �e��9�(f���[��aI6jt.��g(U 0��YS����=.�$�r~��tr;Њ}�!�6�8\h�P^s+���#�h}(�����x����s��aDF�Y�ΊK��88�k{@��s�p��C��@u��~��`��}�̂(��8ˢ�0�1��9�)���د��wj�  ���]_��6�*��$�%��{9��Z(���O��q����7�ˀ}��q�Ӿ�}���%Q����0���MQ�,�?�T�b�3��2���w>�2~�,�00��f:�Ԣ��5��$\+�W�8�ޏ��hN��c��놭���qV������B�DT�����N�Sp��`+�eP�h���=�,�Q�3�{�����͋'m�>�i8'��cپ�po�4�B�u��"�h���;�&���7�]5ly�j�a����e_P(���_�1�,��>?������nP��S	�$�b?O�o�Oi��C_�n�/�����x�׹�	녍�.8Q��Y��񽎗1�>�j��^Rq`�5�2$%ʌ���	r!������k{!1$b,�Y!�a�&�BqW�=�藜1�]�r��1���e����39��6;i���d�J��Z��20����w��N��y��Z�'��,�u�����C�+"p���� ���-t�:l}m�a'h<���MJ)WL��Fc�(
ߦ�S!LRDꇣ����+����0��5T��{�5#�)�Ǳ�c m-Vy�U�j{��W����LE�ްd�>�2	K.T|F���S�0���Jt���O-�U��b1TbP*�uF�_$y�����`��H(.�A�E���b�F-�`���=��Ő�9��;�����Hq��6"�R^Ê/پ��ґ�f�z�)��&���+������T�y��U��#�,�H��B$I��}k��P�����,���Tn��{S��V���v[>�B�,-^��9�P^�RXBH*)w0��(I�6H��#!s���	ʁ*�f	�J��|F�
�ߖ@�:������R���.�3[�b�~����q�{���y�S�,�Q�eW��5�rwR�JL��,">x��!e�b�UyUو:H�͎`~1oE�&<�/1p�~�d�V����pQ=�A�	���~�:��h1A�zS�Q��R�
�8�l0�͔FW=�+-c�m�n��3Ӹ]���*�K��J�R�-�JV�
�eh�Qowˮ��7 8��nx���8؞��}p�`�}.���;�fR�ޮ���x�-�CG�d^�)�p��0W�]\�R��3iߢ�E��6��@��(���V�I�a�~��h%�dJ���Ë������b{ ��t�*Z������\�J�`�\Hu#�'�>��7�n�ˣ�Ma�"͊�k!���G�:���W��簂
��u艪<�g��?A3ys���0)L� �l�=7s��ԉŎ�u�U�GR��.�+�^q5�=C�����x�o��1b��Ru��韒�Њ嬕�`�P#��Nsu���7q��c�	���0��3�9�A�.���Qญ?�T, 5�\�ֳ�_8��@��7+�a���X5G^M��+gL�>����4��	#��>`���3L���]<�f�hV�թB�$  �� �:_