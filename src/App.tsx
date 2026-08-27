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
import { getApiBaseUrl, apiUrl, getAssetUrl, isServerlessMode, DEFAULT_CATEGORIES } from "./apiConfig";
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
        src={getAssetUrl("/Takhmina_coin_02.png")}
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
        src={getAssetUrl("/Takhmina_coin_02.png")}
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
        src={getAssetUrl("/Takhmina_coin_02.png")}
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
        src={getAssetUrl("/Takhmina_coin_02.png")}
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
        src={getAssetUrl("/Takhmina_coin_02.png")}
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
        src={getAssetUrl("/Takhmina_coin_02.png")}
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
  { id: getAssetUrl("/assets/avatar.png"), level: 1, gender: "all" },
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
                  <img src={getAssetUrl("/speed-cups/cards-back.png")} className="w-30 md:w-40 h-auto animate-pulse" />
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
                  <img src={getAssetUrl("/speed-cups/cards-back.png")} className="w-30 md:w-40 h-auto filter brightness-75" />
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
                <img src={getAssetUrl("/speed-cups/cards-back.png")} className="w-20 md:w-28 h-auto opacity-40 grayscale" />
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
    Object.entries(SOUNDS).forEach(([key, rawUrl]) => {
      const url = getAssetUrl(rawUrl);
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
                        src={getAssetUrl("/Takhmina_coin_02.png")}
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
                        <img src={getAssetUrl("/dots-and-boxes-logo.png")} className="w-3 h-3 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة نقطة وخط</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.dotsWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src={getAssetUrl("/speed-cups/speed-cups-logo.png")} className="w-3.5 h-3.5 object-contain inline" />
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
                        <img src={getAssetUrl("/word-le-logo.png")} className="w-3.5 h-3.5 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة كلمة لي</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.wordleWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src={getAssetUrl("/connect-4-logo.png")} className="w-3.5 h-3.5 object-contain inline" />
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
                        <img src={getAssetUrl("/Takhmina_coin_02.png")} className="w-5 h-5" />
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
                        src={getAssetUrl("/Takhmina_coin_02.png")}
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
                        <img src={getAssetUrl("/Takhmina_coin_02.png")} className="w-6 h-6" />
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
                        ox��}ksו���-�v�  �����%+Ѯ_e*�k4*�	4�� 4��)��U5��G�lMe��T�f*��8�eK�,;�\���|����=�����j �(��e��o�{�������˻]{��9on��{?w���tv���Œ\7��zNgy�zn�>��j�Y'�f���w� �y�n_�7�(���}gy��p��`
wj-��6�S��Y�� ���`+t��ZзB�n�z����YA��x[�~�Z�9ۖ:���v��[��ִL�zê�m�6|{�� ����%�����_x!���r:�=`��U5��t�+�>f׎F#mua^���+Ή�m���kK���d�y]
��̴��Y��������'��*�OXE���_Y'�� ��U�j�V��X��_�o�n���C����'ٳ'��6����~r��^}ſ|�;�#�����m��'�~4/z�n���gs�=g�v�׭L�*�K|�d%�u��W�".�Y˯R�Ý�cZ^�*C߻8�U�d#��a�q�4h��x��¾.���ݎ|��ǰR<Dm���S[s�-�XC��5��8>U��D����������e��{N�����0�vmf`�N��c"GY�ဝL@�����΀�}q��h-�e�44���m�ѭ���S�Yq����:����fc�}!M������5c�o&�+�WT��kt���磧��������9|�+��d�&��Tx����.h�e��l%�	^�o=̐)6�?	�-�Ȍ�.C�oU 1 ([���榿�{[�Z��/k��(���Ͼ87��v�A��:�)��tt���q������`��[�7��J����>�1'͜����D�c�
�E��a��+����H��ntÁ�f3#a �Y,)Cq��Q*QAM{�b�<�ݶs�}Q��젊�k%��o�a��o��?�VFπ�>ߴ1���GOG�G����GO�H�U�����~8�b�T���!HH.��Y!9b��/�_[�7u�R�T^e��i0M��(���h;�8&$����$T�ZL%�D�>����'��:��C�0�����3~ 
ݕ�J�F��D^��w�}�J��9"�ت��
�5��<����ٟ��[K���Ӌ���#x���\��&�hV,KK��V�԰� �I�gz��D�ᓙX�Q��	vFy ߨ�}D�+���J����d���E�� � %,?��Y��?�s�t|
�-hL�Y�^{������p���x�(мg��8���GO���;�[��S2Z��bTo�@����40V~��҈,�b(m��3����j"��QF{�e��v�9�1:]��QU-��T�:\4{���4��,�@��vDv%�ZC��N�36B����nf$f���6�K�' ]od4%T�"�N��1�/�c��ij`jH 7WKY�J47�W������������� $��y�wg�vbK9*o;W��uv��Y�x���O����c�EO҃9y�d2�������[�ݵ<8�n�s�jXW� ��;375�79�n�&ͣ�m@-w8a����v�(��v|o�l��ÿ��_j4�8�Y�������91p���m�L@���W��l����I�
n��f0j
�m��0�|�ޮљ�b���h#�Z�[뺝�et��B���	5t��;� ��H������NH�`��Y{YL`���H)\KEF�h���dzˋ����˕^X��x�Ov[*
�)T����������Q�%�f��|Yn�}�� ��Z󢑁]���5��A�}�f"�?�����m	�.�&g$�D���qX�q�0���j�N3�'���>�ѫcY+�eI����������X���#�_s�B����85t�D�_6��0�X�4!|�ŀ%�Œp[e,M�'��4U�nKa�"JЭ�?ڸҽ������z��
2m �ׯ����zk�/@�Â>K)3�bׄ'f|������W�ؠ����)Cg+�~��j�7 b��x,~i}�>��¬�D��qH ���
�ج
(��)� %.��
�#:��OTJ�kAo� ��p0���RNm$R��c��Ty�/��?wBZH x ��a+�E�dڇ���h;�p�� \��0+��@�[��mKm#���tȏ�m�)�G߲��˨�'�%L�	��c�p�p��8��_���&��<.|7��p����4 
�֢�-"���@c-@�&�I���;�
�5�q��,p��h�8����ō^�}�^pz���.'���.ܩ����3�X��/w����Ny ���`�q�3��7$ZA෗w7�p% ��~�Z���y�
˼�hՇ���T�(�y��l���Jrvd1>B�o���� +=�~�?ѻ��m����䡐"0��?�[o0/J|Z�8z"�|~,p�49�
2�b���r"���SlA�F��+��9�b|؇��᷷$���]�Ѿ�C
�ߎO,�EQ�b����	,m�  ����$+}6��~/��-Mx�`��b��M"oH��N�$H�-D�&�UM��e�s>�F��Ȕ.ǹ�y���s���ފ�	�%���������4>J���![�u\j���>��w��L0t�ة����5���ߨ�,�kj���-�ksdG���|jٓ��<k�Q��VY�gb�j�~HD��ɼN0�g����əa�JD8+�K���H�D�D��H�bVw�/�N$bp����\+��w�G�(�C
%PCoY������NWy�AKd�0����*�!�T�����'�qdŋ�̿�"��{��{���\l���ۜo�R��������R�6��-U�I+2�#(DhG���Ϝ�ΐ���ў�;{XFİ
��|F��y���u�R$A,�ȇ���8�X�^�kȡc�06���jJ ;${"A�R�ΨG0��
q��L��� Kb�u���݂go�X$�*w�����Hl�ؒr�;xŗ���ђ��N��I��j��gVF�����"Uւ\4<��\'�᩵`��v���"1C�g��M��\��5z���,���١9cy
>��1 ق��4J�O��VY�-�HG���]M���3s�L���ub��'d�AQ��\��?����q��������a�Z��5O4�g�w��vK�}�]�D#C�L�d���P��'�7{唷���p�6#d���?H��$���8��)�o���	P�o�#J�s4R���=��^_�����	Waq"��!8ɿT���14�7մ�?~�D浍XD��C��yy�$ss׆��  �>.��Ԃ�FA�"�����8 R̅�)�H�'�<���$( ��1�j�rR����dv-q2p�L�AK�d�B/
|h6 �F�1���LLIo;!����=����
��L�0��M��>��"3�S��k����"M�W�i�aG�61�)I��XɉS� '��
¥ȶx�'��H�Ŧ�T����-�������w�)�&Si�.2�=�.
�0Y�b_��b����~8���l�/�М��?�{�r��7�Yx[�=�rY��!�#?I���hAE�^�
�%1����a�i���=�1`���RF���&�\9���c{Kڶ��+'g��y�A�w��Iǡp��=�U��~��y^G ���3!R?l�Na����Q��nx�J���%	ga	�E]r��	Ԣ�@-�"P��$��=k"�x@��L@�`W��n���$+��>'����R Z�?� 5��F�^�)E��@�j�f|�<��pR<Js&tju��8^��Ш�v&0,ў=CW�)mZRѦ�W�i#�}�W�8�̒<-������}Ů9��@�4��!<ρ ����"��SG�}>`�Jbi��&���=C7�4�Dz�FKt����R�r �;,��$�cJ��5ɪ'��&	�.�-����")Y�&�9�M�M�ޯ���!��(���c2�ǼF���c�z��0F���s�g������X���u(�$u�*�\�C�?�	o�����٘$!RA#�	X�+�5U�,#K��[e6����~�#�q초 ݵ��"��)����/���D� ���>�BP""K	R<�����p�Cb<z1��9��j,X�σ�1$
��A�B������t�PC�,�5Rҿ��q��k �,�"KuS�M��@�υ��y��Q�=�)/ŖJiL�q��~:�>eZ��JE52W���yt�7?Fi�^ẳ�A-�Sn�c�:���-Ɓ��'H�8Z�V�`e��:�B3,�!_��.�����d�^0cVdZ��EE:��"��̍�E:2�SQ��2�2U��0v���K��r��HU�KU�`O��kͿn���ris����C�(�E`�bC�A�
�6&*�#T�T���5&+�A0؃�C!�K���Ӧ��&>
�6�r`���v���]��u��'�gD���S��RnV���z|l��t�_�>�9z4O/ʞ��<,9'�뵀�V�kA�g�z,����#Qp^��'��
��R���y�[m�]�{8�h��ᆢ�`�"X�������~D���r� ���>�u!�ʽ
=�G�s��+%wxW�nKS�ӽ���uF!��`���su��l�J
r�i�8at���l�5�w�J��1�N�H��X0��~"��<�A#9�v���t�i�x����eI6	Y�WSp�r�%��<��##���5�nL%�BX�2Y*Yt�"i���$(�0?h��Zg��v��v��wlw`���)����\oC$�W܎�e�gQͬtt�'fE��fC����X�W�}d�Gtҥ���J�J��n@�?l��r�GJ�]N�ΦOZYf��t�
��(�A�[@��|.5��o���0���DԎB�ϋ�\���q
�8�"�ٵR>�y�L��\�&��z
T��ͥL�4����6%FI��e�#���B^^#H3�QK�C�'��q���sCJ�!2yux;��!
�8�h_�`�6�6ɧ��1P��<�����h�r��,��i�J2a��O�\�㑹��6Ԝ�ZR*$�J[j�%E٘��h��yh��N�u�Wb��>|��t������U^F���z|'� ]��
p)J$�1C�!�	9@����e���:�Þ-�T�]��$ڼV�WIf�b]
�H�B�E���|s!m��6���E�y)����Ŀ�&���k��K�D�T�ͻ��wB.�P
�K����d!{�Eyxe%~˷�y������JvIa�a��t"�,6	ħQ_B���D�d]R�(տTL�U��hŪũ=��V�ݭX�~��׷�W���?I����G}Nb�����Q�K���I�;=򃰦�p����|)f��Z�8s��#}M�#��SѾ�%A�T��	���pޣ�5� -�b�Vu�~I�M�kS [��83��n߹�N��/=�y���.&Y��[ y�Tv�}I��rç s1��`f�_z8'�<b����̀�u �̥����\H{����"�����:
��g�����E��RF����ą��f%qK@U��\�*\�:�#'˓��b1�HB5��mdZL��y�!�T��`��m:�q����0�#�Q�ڜYt�`�e�򨣪�,�ɞ���>TG_cy̮�+�|c�^c�hN�L(kjL��d-��B
ddW*S�Zb���r��,�W�D�hhf�VK�o������&9�X��mg]�xKSIK�d�T�v�S�	�RH�t��9=�X:�X��1������
���?�{g%&�r� ��~��!�%����.H�%����c���<U	��p����H�~g�}#�0Fy���)�$� ��z>�8�
^h	��������C
�$��\�V���0'߁�"gu��_$2[�v�ש�صL'�)��pC�E�Bx3t��tǓ�D )5��M�7Yn����Q}���+���h$�)w�����O�~��-"�k��.�:�7�F1Gg|X��6RJ�U��+�k�z!"��*���
�^�R�I��]��w��q���GYH�59�f�4Ai�4��@h�zg#[1F�lp��37p�zN����W-���`kg��1��������>�� �,��T����:_[�練G�f"Y*qtg�cU01�`~XHT�.6g�l��֎���z��H���a����Ft�/�%g�v��L�� �KgO���N���(6���;��[P��u��¸�ɢ�����g�6�j�tQ�T�p["��o��+.����v�R������f5
H�@@mNyC��T���oFヷVcZş&9��;
�(J��@�$dm6�6
�E#���f�d	VK(h樏*
!t��r|�������z��s�\���`�	�ʂ>��|��pǦ�y��|�7�)ORt�U�h�YC��B��rɸ=p`Η���AD<W�\��}wp1pھ^�x�ʜ�R����J����R��]���Ę���])Bk5OE�`SE� $��̕�[V�L�S�?aUW	l�9�*�C�2M��� ��7ޱ�X/���M��Ҭj�N�h���ܥ,��� 1�Ahъ�e�Ќ`YB��U vig�[UjN�n�d��^��fS��S�s3"�wN�B_�Ee�pu�\�G	O�j �q�r�jh���+i��ޫB���?��LbE�f��1͘���;"���	udCG@�F"����b5��k�ꁇ����������hJ5_nN�|8���˻��`��Y�e�^�0�*w�8Td,˭W�ҋ�3J�(m[�/��[�eS����P����J�&�i߱�n}��y~
��PXv�:M)=� ��b��Z��3���~mmc�B6{��E>��lzʷ����l�nA�%�����.�t��oP��%[n'잰.ޥ��VrĪjP���2T֏,�{�������6h3N!�]8�]�n�7����������R�[���x��F.V���J~�hA #MӠ"߻}��d�j�:y?�Tz	�nۺ=.��(��V�H-"�v}��t��
p}��~��ʣ��G#-"�.^Ŏ�&�+�v��j�����g<�]X.���p=�殚MO��.��b�1�7h���?�Mt|w�ʏ�g�H�E.`yU��:nX����J�T={�ɔg&�l��P�eu�T�ܱ����P��+�����f(Ńpg�)���\�{�@P�H2�t�kndQ~�~<fթ.&��u
c��vy�7{�~�T���e��������fYy�����n��Wk��3W闅���3����㻢���w;}�u,��x|�����^�>Z�?Z9}t,���Պf��ShE3h{�����*k
�N����k�J6��;�G6,��RQZ�;�1��P���=������
4���L�i.�>�:�{;�|�`������c�zk��-�����5
TI�k����s��3D�knQx!J����a����}{�mʱY�m.������C�ęսn5�Vy�&Y�I�	����n���z)����ЈX��9�!�D�g�e�2!U�l������]�(�� YΑe��"(��F�lp�b6�8��#�k^ŌLDI��QC>�X-ku��=���U5�@����hG1ѩ�2��>�ǘ�#� ���LV�M��T�>���Qs��������5��z(_�oG߼1�M��(���k��)��(nw��MX�$�Z)kO�^%״;� �+wd˫|gs���R*ucb�yy�G���\�&/��D�z]:)��C�ҌW��ny������u�d��0芈���#F����J�0�����ϳZ0�L��$x���,�!
���"�h�X�`���x	F>[6����b�j���v��I���d`Y�@�v�^VT�HsW�Jb;.:�9�d����{l���t�V�� �����_5���R������	v���׾��w��6��;�ۖݙ��W��^	���� D�pŷ������5�@#���������E�k���W?�~Q���t�W\u�o��gsQ���}Tt�)�)���/kz����p��,��.�i����A?>bU;��x�����z��a�8����х�Ʀ�.Ԛ�-ss:v�nN
�[�C�@���w0(���X��%�������7��)Bs����A��RZ.p>��w�[�')L
Gx}�x�~r�:�P�ef8�ʒo�&��K�2"��8��
�ru��&�_`h���Ըr��r4����ZY�v��3$髨]W+m{G��0����*q��JoJ�|�͗�L�3�>O�	'
U�L��T�8���s��Ā���)��;��O����7�ʭj�tovt��{/ݖҤ�����dO�Ԟ��{�� `#r�Sq'XݞN��'4l�����{��*�9��
��X������!p�+?[9���j���U�
�}��B���琛e�+G@z�8ۆ�7@ n9�Mh�ķS���@qAOxodE��!���w��X;��p;W�Z�ʮϮ��]�b�&,7�J��ז�)��F$އhz�v��Kq�Q��{B�t����[�q[J��)$a��黇8���	;jy�DD,k�F�v����v��q��=����C�)}>xi�Յ�<��U���ts ���hJ��zE
@� ���;�IN��d�ހt33�0i��k�P�����]o_�Y���G��Y��}��Oc�+C�__�I����.4_�:΀�(�>�������o1_�7�b����bє� �ls*I� f
f�J�Lآ��ST㬒��r�H����-��p��z5�(�"�	��8O5�i�LɹJ
O����h�+&�:5�������ǣoF�Hee����5�sIgRW�?���,N���#֌�PjK*�(�P4��>���"�۪J��a�cw�����*��EO��U!&3��Zb���B!�W�9��vU:6U��Ɍ���Eh��qK2�bA>�,Ҁ35`��puX���.�*f ӈ��r���V�?Rݚ��ցJ_�r��ٖ*�� X����>F%�P��� �3$�e�&��Þgw�2&G�%m6�I�n���h�N@!�k�D#��3��(��Y{QP_������x��,��\�{li����a+�AX�$4.�ͬ��I#�`���1H�7b��Hq��Z�"�H�@�b�B|)��h�ld�
�8Ȓ�?(MJ�0�)��P��!i�B�#�:
�Z�1�_u��g]�B��P�0M;g�������bz�>�%j��J/�t�-9��c-�{��g�폛�M��LJ�3
����z� )�\���
K=��䛷��)!p�5ܣ*��"�&T���t����~��S�ξ����+�Vx�m;4��3���;�b�*h���=8��Zg-$0���.z`���.����T_�N_��%C�E�M�[Y�����B�����:�N'�f�E��;*Y��kc3�:�������.��r;:s���ɢ$�Ї�x�9��
�%&��+!�����HJ:Hp���2)Z�jTM'��B���pT���SXw��f�	�<s&3��U�-�� Z����ɠG8�(NUѓU>��Br��r5x%%k��E{`�����X}��:+~O��a�5���SըI��C	���a��+��Pe�$��3�?c�Y�������fK�C��m�x3m���wX��L|޽Ĉ&��^e\��I��>��y�Æm�u�%:Z�;�Mm?v�V�B'��t�h�7�3`�Ƚi\]�9j�5���`e�v}Ž��=����b�3@jM1:��Nʙ�N���ig���ֻWk�*tZ�,g,�*eDn^�:��@���B�{)�}O�2�i9$h���,7��L��"�Y�q�,����P���">=��$��O����^m�y׃]q�T�g���"�)�o���[a���7/Sp�(��-$xUXfh,�)"E�ya��/)��4G���z6�d��%�5G�A�����$��#��g�5��ů+0�%f�C�G@�8/K��-젡l����nqxw�~�[�Xx�o���]s�~AA���Ku�������X��.VV�_�,[,�1��I�����<��}���6Uʋ��I����=�Н�S
S�w�葸���~ѣ��睝��uo?�Q7~��e����̞��U^��i���D�g�-uH�$��7T3���B����3�|��æ��*uo�AӤ�R_Ѧ�Ӧ$�\$���ٿN���ٞ�X
 k<��=�FH�
�a��G�N3�Ϗ�$�����0^��Z�ܻ�4K��C��_H�]+���_3�֔:	E�zP����$C�?L�vDm����8��}�̇�� �a/�wI=�V.�\Q��r��O��BFD�W׷����R��[��h�$�$y'�Q3�t��t��L��N@�!dWZ���$���ߚh��c%|�.�x�^1�1�<e�e� �)g�vN$M]�*�rW�����{"���&7�<����+�P����\Q��Bg��{x��(�E��Fg4`����yv��_$�9U�8�m������PO_���V⺘�k�Kz�� �?*{e�j�J���i����WlS8�l�@3��}`�����<�rZ���g����3P�����c�}�h���/�BS`�}'��FSl�ب�2�+��(S��ָ"����Փ�
er��i��ܘen��1���l��8ز�
��A@����L���	½�6ww
�,+6;ڗ\ Z�Z���JY��~z^���)�j��-N�Q�I�����p�;��&�	��c�
B߱/S2z���0���aI���%��@���u����'��g�<?�@�W��A3�`��jj<C]�ĳJ+
����)���; �g^=S,)m����3��0�`��M����P";{��PIk�D�i�G$%�V���3�H�LU�S�ѥ+v�$#��PғG�D8�OG����d�]�e7zj�-Z�s�z�m�-�"�j1�J�l��9V�6�@e}:ӳUyiY��|��w}~0����,KJ���T��AAO�a
�ۖxG�+S~P.ѡc���>�ZH�NX�*���
PƜ퇒�G}Ax�l{�Z�ac�l��	я�&L�0.P�֙�v�����{(��U�� �0n7j��P���>u�_i����F�ƍ
s���*c��eq��҄�e��hw!f�P�.Pm��,jn���t�;A�����T�����v&	!=�����:KY�+(�V���M<�*v���E�X:�.���j��|���u��:��L������F�Ҽ�(@Xj���3�F��=���RL���52����$Vy���A��4`=L�@��)�`B�ۛ�۝m74:-���N'NPN�#�������c��vT����k�2r`���DN��3bCT� �T��j��&=�|(��w"�u��Xm�����l�m�%ݠ�����VApja���,�#�}�ۚ���,�FW�^��fH�Xj@���E�bh��s�wM���{)D�"ݸҽ��;5{3����Ri�
�_��2@W��~��ݮ���u��↹����*�Z�ւ�h��%u��@��B��� �� U({��M���XX�6�z��m�jc�*��xi6/����1��̚"ho�e�XM-��K�0���X����Q�˔<�O��!�ɥ��
zÈ������ç%�4�N���
����<��!|��񓩾� �C�y�0���.���&V6��2�5&z����Am�vu��*��3$�1F6�x�'}���bS��1�u��{�g1��6-|�g�¾��G.���w����Qk�zoc�;�7Ҭ�~���J�g�2@3�4�˗��
`�%+�Jw��.�����U͟�g�П��
��� 5����jT=1�+�q��x��,0� RL�����.Yt(kq����h�����ƭ�Ng�v+@�t��\Rn�^v��Rbr�%���%FKׁ*D�jT��eR\�]���$^�W$�,��D���l9����]c�q�e/�;M���% QG�$3k�\F����Sw��g%�An^w�~92T�DI9�c=@���)��r.?0,A�.{F�4��e��QcRr����jt��>���F�CO�-�������l`.��m��)��j�˺��T�`_\A�.�3xX�2|����
�X��E�o����E���@�W��E/v�U.���� ҃uV��(�v]�]@L��=ؙ`���b�0:��z��nښ���_x�Vz�_�u	1]vX__ ~T
��������W	a+�f"v���y��h2��v�zV�
T��{���z����wX�����^�����$��d��5�\��Je�.L�8}��^�)�5譔ŋ��,���14��+�;r�į��r԰-/O1�Ь�-�PyԸj9X��sd&��{~9�c�B��d��rͷ�{(�|�n,Au?�Q�����4�~�SA=��ܼJͨ���V�	���m�� e�î�ہ�6��cf���5X�&l�ϗй-xfݙ�̓5�(����Ib%d�T�;oV�Rq��2�����d��L}�l8�E.�quI�e7��Ҋ���WQ�4S"�2#>��\�=�1aʻO��� u<Z{�v[.d�α�s����t%k�����O�*� �fdڸ��7�)>z���ֶ�}��ƳL�)�j����f���!\\�����軨����`*�)���i�&?��(�e��m��A_���}�o�;�YԚM��;	�>k�� ��F_ �-�����/��h�=m%y*<�jv Ӑ�'��zRE���5�����F7D�} ءwY���p�z��ro�����l\���B������(���n����i^��_���q��pdD[���(W,���C��� ��;���Љ��Ґk
9�`Ft�̾`�Q�	�s�tK�����G�D4k|�:'�a|>����H��)��RKFª��N��Ŷׇ�ɂ�#���#��Tn/51�����:�q��H��ه
��@����W,��58��d�XĨ$��;�%���c�������].+1sN�S�|T����D`�F�l��PD�,��"2��9g@&���+v{'� ��ME��Z$��`�[7�h8�<��1���FX�Gqƅa?q���?�Ĕ��9��/V���v��(<��(b�̓-�T��ዃ��o��xK�.Ys���M
��a���"$c@�t�����֑��`dn�+�5������,��2x��v��:���#ƿ�Š���diN�ԛ	7ӧٔN�)`�^$ҔK�6���ͤ��w�����$H����(�E(�'�L'kL������I���SDr�!is���I�"Kɭ�r&ֆG,��ʕP�GPN�Z���c���[�w��K�F��QZTɌ�f������L!����qC�QB��A:*H�[���Cr�=�����Ҕ��Kq�}6�B��+�J{��ux���=Ms�Tf}��UI5آMj�
�S3]qQT���s����)ж�s�g�љ����e���\��h������
��Twm'�{��b���d�J7�G7�C�X�}
���ϵ�R��������R����d�3�e3�Ke����A?�����&He��E��f�L7\p�t���3�x-�0��ꞇǦ�)܁��rE}�4���!yI����-Ug�0�dO�KI�E)>-K�> Q&i�
��.�Rj�m���i1_bEV�L��c�jR�D^��PL
p1�ĝ�r۰�^�GNH\xA���	�^�S�}@�h1��dJ�h0������r�[ճ��"s���7�)��A�7�笤9�E+#a>�-~7�0�U7ը�Vx��S�$g���b���	(�X4�.���
���w�UI�p��A�h;]�
�_�������Vgvy|C���g�k�VC��ko�KV��bJ����n���܁S�Zz�
�iz�:	>Nc��8�d?U�ńB�;C��,�Ρw}��C�{�7(��(�M�O�*��c�%t-#X��K��ܠ� j��K��^=c���N���9{�]*%�2�C���V�N��q��:("WLi4ɳ���(�:�o�ٲ�������j),Km{y��C�ĺ R������uf��h���SNu:�<�M���DQ�D%��d��}��� �[�ϝ^ۃ�O`e���20��w
�`T��hAB%\�}i¶ݾ8�;���X}%��������v�P6d�;�^�\P�r�Y/��wN�����R��KR伵��6,	}����
4/��0�$5�F�0s#�H��6 �<f��q��g���Ŋ^�X)��">�5[Z�	d�� &�� h�gQk�	Cq�P��'h��7��շ�@��ҪĪ$��S��9��:[�J�
�4�����
��~���c�$�(�"V�x���{�d��?HAB+㋪
�I�HB-�	#�[ğ
�of�PF�j�Ò.6�BcSuzt�K�7tB]�ܾ���������l�^�����m���
7����9m���	*�B͠�fΘ$���%.�1����:!;�b\����4%�
Ԋ���~;a �y�aiD��q��&0���c��>�u���C@��e��j�<��p
:��T�F_� �%o�b�i�(�l�Y��D�{}5e�""�M��\D
O�|,�
1E���s�r�������jj��U��"��b��tPA��Jny� m1MFIg�h���b��xхѷ9�j^��/�u�I�t����v�w�U�;m@����!���eo�&(f�Պ@HB��{��ɀ=�̟�������Wk��3W闅���3����㻢���w;}�u,��x|�����^�>Z�?Z9}t,���Պf��ShE3h{��������vϱt���1�C��j�#�Խ�\Y`�1h���T�w�Njv�477jd��#� ��z��>)�@��b�#�'�M�} �-�&��9�u�S���6��N�\���YNk3!\@���,�,�����zR劁 ������KkX�b�=Ҩ0>���0���M��m��'����F�GO��? �~
����@`\��p��A��2 x�u��?�K1/��_������Ѱ�O�rn㻬�U�y�[���m�����p��Р8[A�H�h�6��G+/�x��z0�#��76���K�S�3��8� ��+������a.˲U���glXi�w�M��ho��X �??����3(�XՎq�'^i�Sow��z�Y	��9�f5�.���-��uM��O_���|v�<v��,�q�fb��h����,�Ff["���#Ԓ˰@�6���!��A��5(Q�3<����*<?��#��u���/~?ed�D�#Q�=�[
�&������e�
,����ٔ�`�R�f�sK�\f�P��y;��GO��Vy֡°B���W��1e�4��;i7-�Џ�K>U���[���-w!�Qԕ42�����Z��z�����7�Hc&��6\_Rͤ���GZL�l�\NyL�>�������񡘧��L�A�t1 �g�]�b�"��B)K�c����k��}�K�䷽/,*��Kir��`�yP[4"ݻ+?[9���j��e�����z
Iٯ:�2�K-jo��G�J��P�E�)�����VC�û�*�s�"�y�Q���j����^iXyRH���cU����'_�16#`UL�U"��.69*�ͯeU��U�|���y>�wD�qz�?Z��(<�\2o`���׬tg�o���Ģ���F=��a��TĜ!M�>U/I�t���[���ט� ���Zq������֕4����kۡ���;�uܪچ�R�N?���~g���=�3��C��h���ggSLT��4�c��T ��k6�I�h����3g;e��)���X6��u��qX��p�C�'Z����X��!�5`���^��Pು &�-��G,ր[ɂS���^��1R5�?�˧m&�Q�*-٤���gT��k���6��{ΫWУէ��:F-L��RO)iV����׵�>��F��/"UK���W�������NbS0L3���zl:�5��J.T%�/H,�|:]�ܒ�[<q*�?�7=j�6�\UZ�4�I~��u�~���a^,%�f�b12��b��U��P�A�UȻ6��3�v+�"$�]�|��7�YO�&/%���N�J*�1�i"���`����D�+=��M�R�Na;�n�
m�&q�@�^9����d�tg^:�5M����"I]����k��� �" �ޤ)��P-2��V��
�5���'Ŷ0_�]*`�s02��Ħ��+@��2�N��D�nJ0�E��{�{H��"O>/�h%7�;a�[��.Ke�_��Ͱ;Ϧ3��A���]gP�
w�"�t�Q����
l���7�g4�G�Ü�f,\�š7��-F[n'�.:�0��5���Vy�,��A7V>RZ�!��|����H�N�tX0�ΰ���
�xIO�ʐ��J7��������:��z��ϯ�W0�?��L�$/A�VɽRq�,�LB_�)]�/��Y�S�W%,b	����}�
	{Z����ٱ���	�v�[)֕�*A�����K1�*2[I���\O/ǔ0O��&�~e�_)h�Kr����6U�<��l�?\�
?\�3��6�O�
��H�� �V��+f�
樓�%*��懺��ܰ�a|��)��ʹ�N�ۻ���P�d�a�=�%+�g{s�Ʒ���-��c���x?	-�b&	���>)K��=dBP�Y�|!�@~��m�oc�
q��4!�\�AzBm�3ɻ�9=]
B�
��K
�Ǜ}eA�~p���RՀ�K��o�"�j�x��DQj/)��*
"ɾ���/3M/�!ZU�5P��F%�kj���U3�^�z��&��-1��^O�Kz���
ҍ����*�
�5�x�I����&�F�|��%?��9�`�����|᤽�z��%i�IT���r|�:Yn�3	℆k	�G��5�ź/}�r$�5Qž��$lص)��
|�)�h��*��%LxsM�l[Hz����7�DX�s&+� ���HG�Z�:ݣ� ���yxR2��)?�I�|�x�kXq?{:z����
n���hN�E��}�*��-�y
wW9��Z
r��]��kL�$����\0�r�&,���~~o��w���Rz�ݸE�Bx�Tm�e)䕼������й#�"ޢ�	�Ȃ�(��J�c/'�O�V���
<ī��`i*�@=�P]N5CN60:�E5Z\R߆��,L����Շ��@=���'�Jv��C��o�
=뽡3�޲��ǛN0;���y8�Fy���/|�ٺ�4n{�̲_��������+�`G��x��|��K�|�c�iZPp�b�]D��Eq������oaWƏ��J�d�*yY4>}GD��}�y���C�LP$R)�0��u�QY�u�
�"�̤�S�P(󩱸�*.�Zi�;N�����q���@�3z>����('��bM/����ǟ�������/�4�11V������ ����v��6��`��'��vW�����l߱kl&k���_؎q��F�ڪ�{1"-ۘ�Juڇ��	��/���
�ԎS��m�0g(���0g	xK�c�i�ְz�:"J����i(ͱ�W�u���rm8�+����o*�K,.F����8� j���D-U����!�H���x(q�"�sf?\�n�UU-��`e ����4����.F���F�0F�$�`���V;d�ȚE��'i��2��s�����e W�3��r$Bq�<Cd����Yh_D���m�P5,PG!�@�Iu���RKM ��6�ѻ�-9.��<��?�#�)Ϙ΀&E���+���k20��E���ydk����e��11�:�M��R�@*��:ߩ����3����H�⸊䆤5o|~d��O�,�ז�~2
�k-^��'i��K�L9�e����q�r���o����R���6ΰ�#!
$�E�8ȅ�������o��r�,���E�_[���<E�~����p5���dj���4����mLW��Kz�ZX���=���𓙒��B]�ύ�uk�7�t/d�{ՅX�,�o��Ai�(�JӭU��'\:y��9�`AL��O���-��(��2j�V�<DW�9A�Jw�)R�L�_���؊Z�!U�{Ku��\��oFf
Q�m&�|�}��[�}�3�
}�����b,\��SN޳�ݔh�����Ԫ�7��~��`�]'�S��o}��U)�)G7�'X�S�-�aǓ�~qr��������m��Sr.��M
^e�EQ��cX��WI(fFE�P�,���%N��/�/��
����fWG��܅B\����}�J�V45�,A>�P��t�=�)�x��4'����D$3)��JH�
I���+1I)&�v]x�FHb���I��g'$iODt��~0b/�p@%>�� *3a�������D�����N�0����'�2��Ć᣼����^OF2k�>�XE���NR�<^���V�JE�gx�vk�OKL�Wz���]{�e+�]����F��Q'�,�K�}��%k�|�*�(�F��=&�Ie�N�&N'+��^�����D�>&��E&,����PF��|���%!��Z��o��C{�8׎�EEI�~J��Yf֣�}�{�`��ׅ�EBv?%/�e$dF>$����V���t0I��V��`�-
��E^��(wR�6��r(/YgX��h]"�'-�3�S��d�O)B���|OI�zO��N��R>�X?=Ȟ{i�>�wj�v�N��N_����u��U�����aq؊���ޖ㟲��z؝���5����������9y��ـޯ�G����p<>=�=�����
�����V.ä��E7�h�0�#V�&릢�F�Hs�qTs�G�f~��k��w4�\��"̰H<2�ǆQ9N^f�dy
ӲF�4�e4�g�+�!�7Q���n��ы1k<�r�X�ym)�ƀ8Z*�=ԷJ��+A���4���7@"�����0@���+vy?��Ƨ�)QQ��Md؍�9��@U����%he�D�Z]���9SV�Ra�I ���jf�-��  ���}msǑ�_i!x��-^H�^aM�6�$����i`c��is��� C�0E��j/���~���P�ZR)��dI�%�����2�����*�z I��"f�����2+_�̬�$�TZ��&�DBW!A�U;hLӹ�D��=�#ޖЭ;�zV5�R\h6��R}X޷f(�5S�9亿ٚ��Z����")dTF�i�aN��\i���|�t.V���i�Q�����ѵ�������B��fO��CXEPH
r�����ƣ(��},y����BC^������ X��q�8�c����3�Y\���%�hf�4z�XH���3�[�7�뷶<�)=n3Ba'�V`A'�"���O�a֦<^�*F8��⎫�Oh7?�E�����a?�dNJ��a�^}&Bmm��?6�G��A�z;��)s�W{��d��@�gL/���V���K,wƅ�Q�����]���x�x,�4�3m����WL�^���
D����T�\��|S�c��g�=�g�����v���9|n�?^�cQ��+����e��DMV��5�@L�JٲD��u�`A�u��Жj��/��w��)��!9!�����#\�� \�:�O���3�Uq�Ґ�<JKG�nB;{��5���9X݈�a�s�J�>Y���"�+3*�����y�Kv'\���:�k�w��!��y�ڗC�,}��X���֎�Y?u�H� yW�.IA�+���d����gȷ��2u4���_��_�������6�e����?��g�M�E����[���K���j��#�.�9/Hm�!�t�T�CU��)UZ\���w�ݘ;x�a��>�6��V3���m� ��^��I\ٓf%P� �$��������/n�:>��������*5�U�<��V���u��ve���2��׌H]~�op!��4�S
3%K�;0T�@��eM�Hוּ�T�a��C�����u������A9�}���<=�F4
�v�?�73�,�2��6|!��w��3W��mUã�iqjf�ڊ(^Џ��w�ns��5���Vݓ*~�T(�8�B�AeQkE��cnX��cQ�ˣ	��+�U��oע �]�)�wR����Oms��C������뜕0�ao2�eqU�1���!�`�^��WC$�>8cI��C�n8���g@Ǻ܁���MWs�!�Ob�K��%&dx,�ߦ�
�ȍ�w16�I�d1G��Q}ŊhLOPZ���Bu�/p�k|3{s����dZ�V�V� [ ��#!���"�|]��T��*j��?Pb��ʬ�W5L*���9sS�헆����^6G7e��׈�������b̜g^�>d�1��/�QuF�𫎋�Z�����I����q���0�[a�*����&P�Ԑ����g�`|���^�/��7��N�=rjʲ�)���V2����1#�Aw5���ۤnKC������y��0кz�eRh���v�wF������t�|���6\Um��,��={g�sa]$M��|�+�k����%�nu�_��_��T��?@��\�:^J�d
�Q�����S�f����\w&_��z�ش��r�LM-E��Tܪ+? &=�������o)��0�V7ԳO/;N�
�>-a�G�ӆۃ���UYcb��\It}Y����~�X�n��݃F߈l�:I�.��������#,(
ZD�|��w���"D�*����������ٲg�B��`�MG��7��e6a��|p�:㦬ҪԆ��L���{��Uږ���,j�ܬ��ƚ�����C�`f,	A�7Ӷ����Z�"Q(���b�l׃ݵ=�v)$d0N䃙�L!���UiL��Q�s\6���C���,�t�VnQsyA#�r����Q�	����viR����'����
��8H.v#n	���Ƅ��u����<�QMsY3U[�< ӗ+�p��4�}���d��#YH���x���n`�(sPX�RJi����	��niB?C>�|B��x�%|-�@�b�.f�Ȝ��#�&�
�!��&J���װ�v���q\�j�n|&'�7�H��fAR�`��o��2�sw�wz.q0U�S��g�z�ۜ����0AI6C�N�vް�I�GZm>�O&O'_xL��nr�q��h_�7)��yv�O��Φ�=�`9.��G��Q�W����#?��8E�É��lEW�+"�E��v�*�P����;i��HZ9iս�칂�&*߬��]��؝������ugeo�	X����Y�7���3X<5�Dfa�2^Ps7R�F�ޕ �T4�8f�5y��=Nu���A���е��c|"
KV�
�6���u4OM���-\�R��>�Os��%��R zd��;��
t��q���o��8ܸ�R���=�]2�=�
_�ܢ�|�v[2U���l�ډ1���A�ev���^��E�Re$�7�`4I7�y[��$&Z��[�/<߄����
�NH��M���ӵ)���6DL��=��~�$�%&���l��� �:�v#�ފp��ag`#�f`#���t�[i�X�����Nʪ����/9u��;=���i����%� ��'����)9�'ܣ�]����!�(g!����\Rw��n��	�R5�EDW����!<�������;�]�s�C��� �N�[���M���f3�'~d��1��a�Z�p��Cr{�"��J!�5i�~Za�Q��$���:j# mK���S@�y
ŭD�9�\�mR��%�r��9e}���������\�/f,�;�*�	�($�*���Uvsq��6C�[��)u��)��%m��c��Σ΅+�|>���j]���@��0��&�a����*u��gW�G�
6�o𨞺t�uF�8�,M�7 ]Ӛ7v0V>��vg;�X��(đ�_�b]QN[�}���o����໹y
C�q'
��1�(?��B�����j��os�~�Ԛ���H�	��k�w���0���˹y�l��O��W$�����wſ�E��,��گIۓJ}i�N�6�E-A�{�7�H������	D@DcMGJ� �9�n�m��k+s*Y���j����7e��R裁����S ��T���:�K���ΗݼX�T�r��}
�y���Z3f�vO���N��aPG�tE��B30�t�^R�k��h�*~���� Ѡ��(�'�`f�60m�/7$[k�7r���A�Q���0
(^egg�Kl��&��:�]��0o&���b��	�n����!��r^y-Lpt9���/�
����$��-��\�v8ϡ@�ȂcΔ^X�r�ې?�I�-=����>�;:��-��3�����?�eݭ/9�?��$��Gd���tl�?��2Q3��xx:0�5�m��)&D�h%�_��s�s��*�.��hc���R3��hd��E�G^�#+�M>_�|��y�A��#>a��m
�v���Y�QP��"�)�]�Y�t�o�nR�EH�9J�>�ʫ7�׷,Լ0��Kdǖ�	�^��7�@�w�z�O��Z�閛뙒1��K�_�"۵�ΐ����
`R�~(���>�T�Z�p��Md��$����qB��I.8����]^
�AR��N)�(B��EMSb;��r�L��)q�Xy�,)�Po� ,�|]>c��7pFLmmHY8 x3+Pe��T�3��ze�룫��2����(ý�٠��hR��Wᵲ#����@Z�>֔`�2k~��éQ�����ND(�a*���z�F������{P��D>�BB56��'��<�iῄ�`�n�'=�*?C�O��5�j��2=M�V+�Q�.q��3
kcd}4a�h�QW>/�	,i��e�c�!�*��)���<?F���/�h�й"dIQ�eԂ�4��M�C�2	8J��)A")�m��L:�S�������w����: Ţ�"�Rm)��o��6zA�iI�:��'c]�5���|�����6f�퇒w�hY�����E�3�8�jS��R`��V�(��7�y��!�5�(xg�Gqpi��!"͗I����W���E)JԱ/3K�\M-f�� "M��|�*����>��(%�G�T&y��ke����MĚ�3
�����\�R���Q�R���_3Q��m~އ��$�L9��ND��1���c�#��/�Ǐ0piZ�Ϗ߁{��1;��y�'��LxLoa����8�SYTy���c�����UBT2l�ۇ�ͦ�Q�b˲�e'�i����IZp��.9ýskޒ�F󎍂d;���v|�8g$���m��
n�!�g)�זS�H�~b�~=ڎ�ղ9%�Ձk�<��#�6��r���<)�f7�� Ȯ�%ʛ
���fFlUBp����	�h	��i2���tJ�D)���Bivpz"h|q�E�^'�Ȝ��K�%v����x"yZ�\�w߳�a,�o�_�^dotx�g�*��z�6�h�����ox�תI߅V���h�
�1"�hj�<9��~�"�]��|�Gt�)n��X���oI#��g�77��K���֦�Zz��<�^��:�������'`��U�
����c�5�h�)�"��ց�3���GN�C�v����p쏘�X��i�B���8G���g�핲=�F��ⵣ�w`P�
3y������nd�����f�^�����B|rr�~=y�?u>���i ��o���6���$eJ��~PU�%
�z��E�\��.��D�n�����n���a�����z��N�.��^�����I/�yU��F,��R���m4λ`���#��ߚ<SL����U��#F�,��Qw��ȽHUt��`��^lK�Ș���c��BA S����흥����CK�Up7ЌԔ��@�|��k��	����˴�ZL쀶a8�����V����+r�h�
ę�Ҽr	i���i��lqw�X����l�ߺvtJu�յ �M�Sg�U���ծ�`�ӪWS�`�L`r��Gv=�zW����[�ҩ�춠k,�{zp���]|��9N�a?h&�}OL��1�7���{@��7�� \;f�q>�g������+I����De���0~Z�e1!bf���i�����/����� ���S�4:�,�L�.͢9nzF:%T�?B�2l��~Qgmo+H��q���[s����� ��Q8�XZi��[��T����aRh��A? r�.^!v5�.��n�$3헓o��>������W�'&&��$��Ek��D����{�T	�;�ܮDOc�߉T:h�D N���
w��R��z� �)�O!=Mh��?p(:�@��~�N<�"|��Tܣ�*8�gY��|���u
���� >���k���c��DG�$RͨTZ��,X^KJ�S�<v4k�VnH�.��)`�O�u*�����4�&��h��u����gh�U�����8�֊f�-�1[|mAnC��������hx-��W�a�eaz!w[�n����p0:��i|�q<��r^�^Z"H����@���Y?��h�+>8t�c���|D ��
K�쪀/��"TF�t)h�'h�4��M�\	b=����wU��-v��^^� m����{��v�B� �(3�w�'�en���Z/��gX�ׁON�܆2l�f<Ue(,qp�̩R3E�~�|r�0�U���u��~�j������?Zd����G������Q�5�ƕ8t���2��?7�'dWƭ�H�fC`v#��4�_���0_o�ɳ�{���w�O� M����q}��>�ń;���гV?9������D���E���h��qW��������ǽ�O,ߟ��Q�Š�����~��r�ViZY=lmn�G.��z�M� >�E#B*V7�ۯ�G�ZPٓ�i_���{`�{�$휩���\���pn��+�n��Pb�H�@��c�(�(��#�
��l9$��#0$��3І1��/Ǌ�\��l�����̌��>s�)q]��h�žb�uq���޼����G���=LsH<��͕^��&^$��HܨZ�=n��8
o���P�I��%�D|�V�"��̄ҮYD�Cf*�P���8雝����.�\���"���c���c��c{���`#5��7�J��2���؁�DaE�2�&�R���t�����1�8�{�ys|I�3H^K�Z(�h�9����3[4HjQ�v�ݧ�a��w�#���|:����'�݅� ف�P��d��ջo�8��J��q���1K~#�%���V@�̊a�D��y�SǬ�w�J&`a��A��U���	/_���Mj3�ѼcO�P��0��o2�ø�J9G1L�	_�"28�+ O��0���&%�(����/,�h��NЮ�ؖ�K~��� �����tx:�'IՒ���|��X�����`�,���dT�((u���9`�$?Lz��
�ɔ��九&�@�(����'�Y�\P���ϘHØO"׃9�e_͐}�Rv��Q�7yis�	?āK���0�r��C�J��a�
%��B$)�	��4^礭-��x
eA�'����(*{.rh}��>�`{�y8)�jS�89���w� *��('�Y�K��z��L��.kؤ�mr(H�R��D&6�\K,6*�A�Vv��q.�ĺ�����O�W�I��� �D�ߧNL����h��ϟ��h�N3 ���$�S���SH�a;�6TH��~!�8��%J6R�l;�Im��ä�!��]�z��`Q&WA����:��f_���'6�f�WR
V�\��Є��$����]2B	�6w�[��h�˚J��Vf���������Ϙ��������^aʚ�d�F�4(7P�d�Ț4�"	���X���^�׷��f�ɜ��ޒYs�*�ȉ��N����x�QОo0L�V���3�b��̖�D��d�~+hI��٣�w ��H���n��5�ij�E!i�PQb��ۃVPu��t�_^�`�,9O�'��M�
vA:���C�!%���ZU��\f��9D��P;�?�����j���d�"}���
h�\��x?�-!nއ��y7�̖�c�f̿8���\	1���N��[6L��{������72�"km!F�6�9+D֜R���m�=5��Y����l��<7�r2T�+4Ԅ4��hd��.$�̲C��R���0�zhU��[��g�o�^�3%�����hg�Vk܃�D[R��]es�ae���[]$��م�ђ䛫�ț��	:�����4�K��F꒒q�d1\�SO(Za�|+;��Gb!T��D筱R�[u�7YeG��Rh~��f�xN���oަh�ୡ�7n�p�ݛ��7k3���y=����!;���+���hx�|s�Y��4&Ŵ�S����ц���$Ξ�ZX�T�|�L�"� �J�0�h��̨�t��]�;�Q��l=��B���pho���&3���G�{�;N/����VA��z��ra3��6����a�[˭�@g)ݔ�9mŻ���_�X�Ǔ��<5��m����V�,�����ϖ��"��+��Ucsư]i���S�YL���"��
��|�D�"�0�3_ۉ	<Vu�t0��
?�#����`���&۩3��$�9S�lG�f�Ӗ�-�[��zk�w�{H仸O�~"��
�w"��}&;?���jw�u�\���!RX$ë�ؔa>:�sb�0��	���+ȓ �v2|�f���]�����A��ĉ*��XLbyi�?5I��7��	9��c��p%��¤!�ӡ�+%&���i��jAϨJ0��`�bE�,�]@֢=7���OR\7�8P���y�ҐyV�t�wbq�A�U/��$V�#!r&��ގ�o����%����©=6���y��aw)n �f��:m1������KдǯE��]/�v�aa��S:��\)k%�|�3^�9�R��~�n,ky�/�"��jߠUw�-
�QD<�vmn8Z�_Q;�
ܸ��0_}��m��P�/�v�Ī���*���e���|wyi|�<�X&C3��W�7��ǩ��-hՁ��v~��m?
<A�}0ّ�<�*h�)��-�2��QF]�*s�����J������?������mc�B1�n\d����z�l�i
�j�?��,�v�o�i�!=N�d;^e��#F����Y���5~��&�!�y���K��~
V���>�T�wxA/^~93�qLC�r��V[EBy��T�/�,>9G�t��.ͅ����oEJ�x��ǼQ�Jl�2-�����
9-�1��S�4���kZ��2�!�I��/�|��kc6?)�6}�"
@r=)�D�����T��1�WM~h;}�:��������z��*+Ǽ�B�k&0pb���@���\V��8y��?��f�p��Z'�=p�y�V�V���i���ۤJ
��uv>���S��F�LC�Ld�u����)K"��5��S��K.����N�8��k�5���y�m�*��M�w1�����5�S"ş����+tH
;�4�����XU!��e�$.;���*��ʣ�*}.��(w.�b�]�OQ�pS2p�R����R�e\1�ʱ&찻�GY�j��2�.Q�)��!qv'��LJ�6��[��/@v_���F8Ċ������me���CU��u��|{	��q��3H�\��,��	�H�쉿�}ѯZ�c������Z�����S����?�X{�ޘuy%���� ���$� @q	A�H�L�Z{����^�"�Ih�J$b5�<�L*G�@��m�[q�
[$���p�cΠ<��e0�PfXe��ޢ�x�|��ǌU=����[��
Y�1юh� �z�,!0��+}ȴw%E �1Q�#�Z�]�� |q��Āyr��B݌5������y��'�Z���1x���|Q�N�<��uc�R�c~�+͝_{J ���A f'p0Eu/�\�ٚ��i����f�"K���RN����Y:�eE[�ȶZr�+%��*�G�m��Sq�?��F
�7��A�d¿LV
���6�|J��N�e�W2�?���_
�2��A�ҲH�����0]?ua�,"�F�R�$����Yz~Y��uaR�;��R���<�)1\KN�V��׮̈2��0'b�_n��V!΂����.Gȗ�L9q�d���ˈ���AQ$<�_q���,g�����#�o��L>���wK�������#�� �����\"��b9�Ͻ��ߟ�g��z��YuJ�+t� ��V����i��cݜpn�>�э��RB�j%��8
��F7�a��cDL��}v�S��<B�������a_<a��a[uL�-���>e�cD1���90ͷL�|bG��%�2RRDj֓���$����j�eL)u�iY:�(G���ZȞ�|,�l,�Vh�	�h�+؛KYS�ĴL:b����9^K�R�\����X�ݱ��X�p��Z�����{�D*;�;�-)QI�j�<�)4�z�)s�9�����������S^+<���?���tN-DM)E�|	c��Ύ<,�+{���n�-�Og�cߙm{NbM�f'�V���7z-�����;.��Z��/!�
��P��csZ������ �`'�"y��Os�׺C]�r�\ˎj�:��RU�h�=aY��qI��4��B`W�L!�/�9�s�rLf���ͺ��q�]Z$e�0�ʁԙ�Y�"���a��(G<�n�ۋJ7�>Z�v�hjXZ��zHMEԌp�9'TSަE5N"bU�Z,�T�_T�j�9�0i��t (st�2�awm@��# �P��ރ���[]��-_H`�2�C��������bSk{{
���A��A����z���᥌��ţha<
q?Wa��bC/A>ah	�`Th�r�`B�/������p�8��8�$�HO�E�1C"���a�o��T)� ��� 2����WR�w�	�yƮ̋�:�xw���.H�
.��l%;)�$�%:9;�a��l0���f���mM)0�"iˏp��\�|�]�(�5uH����-��p������V���8��3%����ē���ƫ�p{�D��^���h��U�+�3w���a!��시_=�3/����>r�|r�t��V�s�C%^	k�'��0b�:�.I*��9�]�����C^��`q�萏n37���?��o?`_��zaW=�X%��Ofa�Ƣ�ٮ�����x��u�O]q f&D�P#&�����Bv��d?��l7�;q7�1�f4�� ��=�@�U��=��d�r�3���+��F�RF��罟x���m8�>�j���s����=�S?��#�������/1������N"���[�&%��`Ǒ.�oD�m�n�� ���r�%2u#oL�_����;�Bz�JL�0RB�飴ܿ���p���\"_�2U�c�G�.��Z�tz-)R�J�� 鍺L ���+����~7���Kg�sP
����q0����E|���%�7r��M�ҭz���oӎȏ^�m�G��~�ꥪ"};�K��~�v�緽Y$�ˌ'��̚dчv���㹕 �Ҧ��k�f���8�Fj��W�yBJ�)�JRn���8�~tV=�� W�x5����O��;��!�܁<5�*`�AL] ���N�{5����S��ڃ݂ �Fm�$��C
�2�N��xj?晠���/���P-՗�_�ժ��L���JhXU��*����_a��0�߉��6��:�6��������y� ������8.or�V*����j�|ǻ�~�j�m ]���/�{Ws�zt�g��;ڬ=��t�����h�w�ݓ��3%��h'�΁�w�\F��6E{0a��вL��""fW��wҮ��йH=������'S �\��J����{�{���ޛ!��~�h�/���4gN���"�uo#$N���{gl*P�K���n�n���wf&�ze▥k[D��E������9��E�pm.����S�"�\c�Z��Nex���I
N�j��^�������PGR>JK��[,&�!C1MP�8b�:d?T����7�U�.����w=�e:���b�p|��U�sإ+%<me��.��=���6�:�U�]�s�x�N�'�2J{�ʄm�����U��ȩl�'q'��ڨ
]������$�6�y1Tܲ���o|>Il�arΘ|FVt[����t��j��>��M��T��<�ek���]zO}�%D�we�7`k�y�[v�(&xrڤ/dY磥�q�W��E���o�BV����
>�e�uy_
��A�k�u �#� ��u��y�:Ɯ�îSڴJq
�����N��B���&W^�;[����:Ц_���\'�X�tD���VoP�q����)HT�|�
6��������eJp؉�q�yœ� �������� ��[T=1�X,k�]����ڞ=PK��賮��NFo�O(������5�GeSڹE��r�`��>�)�K1�\�����Ns�>�t�|�z��h՛[Y�[!U�P� 2fݠ������Rm�㛌}�w��guX�31�uo.-Z�,-��#�S����T�i6��v��#�^e�f���_+��o��ULf��;�IS��}���S����o��.�[˄��������]��#���?��?X��l�����'�� ]iJ;~Ej��|b�=V
�S�=�ܫI���ɜ]%<0|���h��f�Z
Zl^-ѱ���j�+��]�:�ښ_dk
��ͺ�e�����~���]<�锯g�vj/�@ P���CKro\|���E�Y��	˛��HP��=Q@kPl�RR���0�4iM*�Cs�������
�.��5Z;W�i	\��:,�݄[�U���茄��8)K)�%�rH`�r�J�ƽ���&��<�u1�A�P	Lo���L�#?xc��9v�ݭ\f����J��
��f7�X��P,���H�,�E;�4�YWa��hȁw�W/��P�ZEM� )�Mڪ4��k��I)���Zޖ�Bd�H�P�?�,���f�˭*�g�K;�t��\���A���Կ�%M���Qp0M�2��j)��Z�#�*a�"���S&J<�9�E���fN�
X�'ƕ��Y'2h�,ﻬ�W�;kV�i�$@����jW3ߜ+��FQ'؈�n!����O�9GY4�h���*������%��^6i�%��J"D�3MO3�6��\��1Sad�����+ƣ�D~�®4Y� ���\�c�O �s���1,��8
�?a�\%~�VR��^\1������?��? ؅�o�U[l�]��7�=�Se�A�+���U���;�w���š�-T���oo/����R��^�fR�F��'5��;����-�oQŐQ��Z��{�~�z=q�^�h+����/?敋j޼�X0( ��~�-xo�Q��5y=gg�giʻ��܀a'�cO/y����K�]��(%r�T���f�p��x��qu|v�2�׹�v�[V�8��OZ�
��UZ�B��J�T!UJ�r��j�֫9nPq�&��e�0��k-�L�-,A+̅�tC�2KtˁQ�7h�IB�o�^��J�$��P�發^�ݴ�?A&�$��1�Dt"���.�q,@�+�+����4��f �i.�0��rZ9�!ES�Qo|as��̄����� �k�j٫���)��	�d�L� Ē)��U��^�����T��
d�
yMs�b�d#��E�~~�kA�x$#b��~b˙�
���	 èK�ͩ���P#�����4������1��h6�l�A	'�qo�
�|��Z��|���:�7y���+��x2�P���@˭ރ�n��3}�8�s���h�O�9:�\�G�����=�t`�s��ɛ�a�D}t%�N�6���W�/z��N"މ
����h��� �m�eW��1Ͷ�j�6��bmp�-�P�̄��(i��6�.Ǭ��P]�t~�UF��L�d�f�?<Z�7�l��P�pҜ=YsA��8y�&>� �)�~�D��g���Hm
|Hj�<C���8
nX��
n��,�V�`�"�(�+kkM��7�,��m.A[l���r\��KЖ��������S�OK��%*W��;�É��L�#J�����XE�1���1�M�#�'��	��G�����
�[�#���0����=M�Z�gQE6k�x������t��)��N��#p�.�*2Y�,;�euuYE�,b�>�BдzNhL`U�\(ɫ��[Q@�����m�Z��YE���Іm�}��1o���H\�$
�y�Ǜ]2�5�dSY��(���x���T��������!��Nn�CXm�
�!��LCG����8�Z���V?�2��yl>�qN�;�i�SSҨ��SMS�r֫����9)�5d'~��EF]�Y�s���V��e$ڄ�c�xs���a���d�ӽ��Y���n�eOXgg���f�椰���FK���k
Ҧ��W�xlwN���*,z���Y�
�駠}�{�np�B ����,sFظ��pю�vkz�[r����o��"d��i��P����m
A�>����2���}]�y3N@�A��%F`R� a.����H�ӧ'�Rm�@�t��l�(��e���w͞��x��hє�[j��T�y/
���W���h�;���]�c�üP~�i�n4M�˽��
��L�Xc+Bh5���j���!`���i溳��|?Q�����)��91L�N3��!F��P�y�(tq���IW��_j�7��9/m�0wδ8y8y)?@��L5Gb~0��x�ʉ�������C����C�0q�9��v�M�e(�"m������e&E��������ˊ��&+Ve�8�Y�ez�\�Ѯ\������z�==� ��*�%ăU��] k�Y��)�{�q�%r��x�u�4��>�ñ�TՅc��,�i>�ˈ�4MhGO�T��	�yN��Q�* `�;�4y��p�B��|3��
���o���)9w�>
����t�a��!�b�S� �vj���_����ɿ˶�-�	����~�1{���񗸄�wp���E}P���
���lj+ͩX��TQ�vD9ă\/�x���{������ܚ�5'�&�ϣ1"
����$~%�=܆�����<�����G���^!t_��YtE���<K�P
Ob
	WS��.D?��7���EEY�{��C�;;��a��:�7�Ci��8_�='Lۥ��,,	Y�ւ��\��St~/�:F�wS�!��^�E��À��L,�����b3��'�5_$�a�5n��~g��}�G?�0k*���S���Nk~�&�v�� �C&���	�Y\���r�6��QD');���%�J3��H�!7
�i�D�\�����J'��k{L���E?��/uwͩ���U��6ƛ�(�z�0���I��j�q�ISY�=N�A�|Q�"&H(�=4BE�W|%�S�ċ�+�1-�+A3�|<���٢E�p�hj�Lu[#I��`�,ߴ��N�Zz�3��p���1���y�������jZ��[8�ǤD���   ���}ksǕ���#�o��d�!�Rd�Z�r�X�]W�*jI� <��V��Xv��w�n��V�'Ql�Zˊb�Y���_���	��~�t�t�t��d��"	L����y?ܲ*��*,q���QU��
���տ�+ǈ�̨nm˸�ݩ͡�r�~�:������]�K�q1���>��bX��Qd��w�#��]:��[/Jł��kW77Q�B(NNzÜ`LJ�(�i[}ص�W��s�]�,�
�8u
a�`_,���ưru�tZ��]���_����6�*:�.-����b�qK���k�^��g!c]渮��!)��LVq�v���Y��!�`�{�ʱ�K\=����tɠ�R#SJ
$��wef91 GՏ�+ }�f��n��I��T�*5Sӿ���@�� �X���(�{��T�]�Klݩ��c�.'_)t�� S�s�ʣ�Ӄ;�I��V₏��2Zs��3��]:��-��A?���D�.:��.�߃�K
z�A����\DGF��hmt�~a���o=�����u�̼&@�5i?y�7�{č�����8~`� �^rb��/5g ��ǲ!6Ĩu��XR�2+�� F-L$�ݑCE���F_a) R��رTٴ~�:)`x�A�9�=����!_���q�E���	(�Dt*���{�.�7��� ] ;���a�-�ʸ�|�A|d��qo�����
<��&�/	Zo�~���[wv�!Dp�>b�ov�����5��y���q�Muuh��*�Ƃ�Dי-��L��jo��3��ΈE���K������Lj�h�?�@#F�<#b
"�/I�ǣ��Z��X���Ŝh����I"/.!��Jx�|�Q��
.d%c�X� ��~pB�e�]�k����ܼ嘢�Jv��9z0 ���+�v�/޻W8&��qO�s��[��l�����v޽R*%�e�R��ב�S�3��KW�e�#U\���I�6��~���?֩_�&��>�%ܙ�Fg/��j�ۇ)�Q\�
䕛I�|'&m_�ݣ0Xic���yM�����l�q7��REl���C�.�9�P<�d\~s��=�q��a���؍���J����<��qN�;�n���'�e�{�d%mgA��S[{�p��=��5SM�]cq4�>��>�.��!$v�ݚ�>��FJ�w1�L�ԑ-��#̫�>QD0�l�-|z>�q�;R�s-TBm�����ѱ��K�b��qdV��`��p3ZM3qg\�Pޚ�jnGQ�(��V�6�N|l)��>=����=8�\z<-tO��6>
�T�H�T��ρ��p~w�{����D�����AI��b���8�ژߦ� �����"�+�D�Q&/��{r�B�?��ت'x�Mň�#� �"�qN@tH!r*8X���PЦ�Cڦ���|��C{vĆ��_q[w�^�)<����!����!��f��#I�L!��B�B�U�h�{��	���d	`�bل�� Zۑ��󭸜�B���R�!�Ku;�8�ns�F	�J�X�����?تw��2�B�/��֤ @a��0ߋ^�������|Y ީ�{<�
O�e�2���u�ʪm*��m*�����BV���y����5I��q\�NG/���l�ˮ��F;�
�a��}7�X��	���<L����Ҝ�Im8��O`7A�������k�r���Mұ�s�Bz2w�?�ND�����R��'��a&�����c/G�X��2X)�T�����DX�	0�ds'�����.�Wy>qs�����ҼeIβ������g���GĐ�g�#���p��OGvP�u�� ���E� ��߰j�3~ј���G]R�,7Zď~����o�Ț:s�e�ЩB��������ʰ�W��@S�f�!�M�6�h�m�ќ�{��Q�*M�����:MӁ}�U��� t�`��9���%��g�=��9����i/�ʿ���Y��T�ThݦZ@C�j�m�,�Lҳ�d5Z��".\�r\�t˧F`#���;Ra�����,3P����@�g���]Ӧ�]צ��y �J���y�H{ߊ�?�^���ּ\Ok_/:��u����-,1�U��L��{+���U�����6Fm&kV��3�\3RW�0~���Z��Y�I2��4��1I\�+���gaEyA̓~�z=E'�s8�}s�\т팷l��ٗ�K]3�������6{����K�����=��<�W��ׯ�1nzA��9������@q�Gˎݡg-�c�x~4�V~1��Z�IV�jU� '���	2�(�t'hX�6F<2P+5��p�2��z��W�,a��Fأ�kYp�n{��d�"�!��wk�� �"H~@	s�')��D��Aэ��d��m{��.�иw���o�*aV�!�v$�ɎZR����ɗ��m8�bƳ�_P����s����񠽱W�v�����60��\����,Zp�٭ �xU ߕY�Iqǋ[��(�s��C���Nm	��%�ɯa��^u��͝�U��
27)SS�����T,���Y���H�V�w�V�M��\�!;:K�
�ߗfm���
[�����ݛ��t	KO�5IL,+��=S�4e��7���ǣ����DX_[��Z(Y�Î`�#8���&��H|:!?��^��T�Ӳ/鋍��}�T��L�a9q�	��Y��;ۀ{z����M��a��b@���N�@K6 �?e/��jd���w��:���>��`P'[�6ξ�O#z}`~�J�jUr��D���as;^f]ӒQ^�=�{A�����A��o1e:�ovSm+a�#�1a�z���a����tf�����d�N��u3N%b�v,���c���<�	';U_�+�����m���h���vA���>#�.u�T��
}�"��5�P���,��
�U���m����˹>S��A���`��"Q�(������ۄ#�cΓ8��ێU
K�&��6����7�A�Zi�E�}ɭ���J�⬽�a�����Z㺫��vػ|Z�(����l �yo�Po��%�Ht�z�Ci-�`в!"�r��@贵����W�vg����z��|�ʘ�J�����x���J9у��&�o�ag{x��{���b[�Gs{���8�{��
���,����ދ-`1K[~��$�(����BQs�(��RvaufYJ*�"z4�N��8-'��̗�H����-mn\f%����vw����QsU~�(c�;@U�D��v��Z8S���7�$%����o�<ԛ9��y�4s[qL���K�.��<w�l����^����2׬�ĵ�rݷ��G����+������̑%��˫���]k5���l�tY�@��Z���U(ۯ�Վ�������c�`\"�=�$<��X̺c)'.�QAP�(x�d�?mI�W���eN����x��O��Mm���r���>�ٍ^��j���مFj���w����tE����l�qF��fSF�uÏ��^��ei��������O�k�Όk�<>;��v<a+�g�'H�y�3�u�����	J�C����߻�Pr�w��s��? U�ה'eҦ
o'���"���|p���=1�5�3��C`
�|�li	�i�����4��g������?S�a��/�Z��{J
��.��V�Y*���1�㽘��G"�+G>D.w�^H��.*�$ᾔ��E��K}�8,��k<I��ay��'և��ce6�߭m��$���#�%M�k��F(:������Dq�8^~M��8��d\�ݦS�8C�ڑg&s(g�Qg�\@���E,�&w��rkr���.�YS�9�!ɍ򃯑���B�k,��Ja�s��4x)	�e1�"���9�f�	��ʹ���fC9��}�@�ޡ�a�I'[=V���(��0Z���4��r;�7�ř�'�6/R5; >eg���p�_ �Ae����7$
���9[�5�G$��%S�8�U;�3��7я�v��X�W�����~�K�P�"o,�(���G���_u�^̵T��MK܊��;�+���8���]��)t]���vԳ�ó��:�&q�궖��@���\VY�Ed����jg���v3�+��Ƴ�N�s
`��X����Wfaƚf�K�`���:�'M��LWP�S;�`���QsK��#Rm���N��{4`����� ��DJ7v���$%� ���}�X������xL�b>��?�\�c��y^!��n�r���|�XZ�h0�T�%�E�U:/�#��Mm�UOwm������Z��%	��Y������(�t�#(Sa����k��}{P�]�7��jvڀ��z�(
F��{e����L\�Ws�|��z�[Q��Hlp-�u	���#QK�#U��(����9q��t���w��%(��f�@�!ZqnA?#��[��cn8��*p1�:���F��7����R�DxL�D}����)\w�=�H�bhj-�ڃx�l�(��;d�`�!.G9�C�qڊ_�� �eJh|9$	��G?*=Z�>�����r�D�8����Xo����V0F�F-s(O�t�#�BQ*�t��E�]�L~r�L��x�W�E�\�~{]D�Nd�c����naL��.�<�w��:�Ė�o�[�Ut�.ә���dK���R(\���o�3/���B�c �C@��F8HZ�HΫa�c�6�@��~9�v���9 u��!�w���xN:��m*,�rz�32�<i��Y�g�
��ѐ���|~%� �~����,n%,�c�a�ܐ
���T�,��D�2�x˥��S�ni��o�Qᡱ0:M��ʢ�����p^c�K4���sU_�X�۹eaB�-�[ʹ���L��%7s�8+;Ɏ.G
"�;_�a;��r7��nm��s��8� [ט�h��-��ܴ�hU�!5����A+7gGx�Nh+6q�N�����ϣUT�s.�=_d�q�UwA.���T�%n�]qE�W&�����@��@Q��=����j�A��[�`���
��wH�M��<�\m�[- �GN�ה�}���B��R^��o�u�7f�Y�A�a�k�����/]���,VE	f��78���rKS�����R�V:��{e�[+�}!���^�Yv�,s��}L����GA�D��;J������4X�7�$O	��Cn���͇1�/�ʔH�fW�h�����zޠ=��jٽB�8��1=I�R��iө:m�{5��7�`Tk�n�UT�t߲'�q��T�Z�=�%�壟
P����x+j�n՜��ɍ���s�*;fy ���0h	t����7VGt�v�rg_�n�;��z�]���Џ�^�� �Hl!�- -��_�w����Կ�"6�f&>�<*�laLh)�8�������6��ݘ*T��P��6�*odQ�լ��0��Fbv�b�.�A�^�J�tL�ʛHwkg��F& \UO�b�^����vS��|��,I=.c��HGѤXm�
ʥ���T�/���MQl"��V�J9 #U�|���eX��<A)��B��;�jj8�m�5�mys$���0�1�4�	q�����à&,��ڞ�r����Iԯ�$����ol�e>����鯒-�5ۧ�80�K<�w1~OƁ���������czJ��#y(ޑN]f$�`�s�M�8"����{@��>}�*�$��зUjO�����|b�?S���\���:���4��>�2�
�ݬg�3}#��2{�ryW� z�@�����v����V��;�4��闎?�Aا=iG��O�(hD�;碹+鴕��{�Y�����RX
��*=6�},�m�����ݠ�Tv р8̞���g+
���v���������kk�]W��B&pU��*�o� 8<����U���<�,:`��$n�� ��~�{9��L�d��s�i���|�F-~�J���V��S�2�>S�dFI��F��x������>�BGd�.�ya7[���0c�[��3"0��4�t(��t�h>�e�_��}�>Xؘ��<�<=��*�)|����
�G����zD��E��W����n�}R��苊�����u��Gia<m�	)N�`��79�P�[e�S�X����C��hD�� ���݇(XЩ�}>��t��b��'q�-�t�����1�����}�,��a	N�h
Z6ﮕ�S2\EU]��ħ/v�8��A�j�>�N4�^�����ص��5��ψh")_����xZ������kvW����_�o�L>�E �}�T��4󖄳�݀o$�+W���C�X+�ъ{,��9�s*��	0�g��u�RZ}��^9â��-�M��TG��)v�\�o�E9#�|���
;�,;��~�X5\t\����������du�ù�W�C`8�M��vt�X������P�[��/`&°��LlV�pY�M�*��9��)��,�ŀS��	F������Z���/��E�D<z,�CB�g��_F��fȽiLC�Dx:Z�r��a�ô]Z��p�W��o�A ڨk��Qۯ�5t��ͽ�
�nb����?����Aξ�O�����ͭ����E����-!�ʢ��3�ʤ����;����FO�5�e�����׵�L�&ূn�ԅ<�Ɩ׭rND~	\��>Z�����餉��;�X�MS3Es�����c�^�CT��~}��{6֗�Zx����������+�����e�/f�(����[�M��#�?� q�g�豄��scky�[ 	�� ��1/G����+�S�:o��MFsXM��%F�jlEi�D��Pm�%BB�x|�ȚjxR�#=�� 5�J��4���{���w!��F�z-ʑ���OI�V,7
�n�τ�e�)SR����J"ܱ{�>%h���a�v��v�k�ӧ��#ԑQ|�R|�z5�OV1� (w08_���/��d����G�[6�0(���2���*��fa�>�S�
_fZ
�ǐd�
Yv�Qg�@N�`Z#v 3��Q���[
��]���.�{_ ��B��a�@�a��T��]��;��E8%��q������ىN�u���,���A>\ ��z3Y�zDGL�X�9�Q'�R�����y�iH���'ߦ�;��~}Z>�B�3 ��D�j	,��:��%
%F0�0���=��{|�rګ�?d]�	d0��e'���XÔqUA�Ip:z<z��	��ut��~���G0� ���A�H'��<0�I
 ^�]t���,v+�K�)�^�?��^�q�Õ����i�[���H�o=
H~�T��];�]����Be�*�OUi��/,.�y���Z��w�?�����?|v������_T�mX���6�G�lf������~�z��8�<�$��>�*�j���_��W��6����K�.��(�T0��	gG�$;�aV�2}qd9�U0 >�«d�ᜅ�c�᭠W�
���K� ¸'ͭ�������>:����[�3/y='���EďG��?��M���Ӧ��@�fzx$=�����v�_�]�=`Y�6���zo��$`��q\6���[���:Y��zK�fH�x������y�����$˅���$	�XI{�8
��P��`�z̞��"���*�
�8��h�?A/
`r~��0�gH,q"�������D�F��E]vEp�z�N��lF���$�W*�U���۷��b�&K�R��?a� p;'�P=��}/s0SR�(�S���U��Q����瘮V�X%iVM��g���Y�L KW�v�Z���U kZZ@l�f`�H��|gt6(a�?VwUQg���o��ƹ7���mm>
��}ڀ��X_���?Y\�[��������B'�&
�蟞�
�7{$9��Sw�ʫ�'��B�b<�T�S����u��Ko�B؀�6��J?�?��ٻ� K��(����-����L��a��7/{�(���*�&��g��[frJs0t�"u�̱�HIxz\�ě!�D����}�
<5��WV��٨<�[�T(Z�`am�����7����M��8����\ge*�����C6����lߵ��Wh��~X����Z?�,���ڙ�����*��j�Wemr����rtC*Y_��/{.u`���G�t1y��v��W�/U��+.$�M~Y�$6�ʌ�tnњ�"�]g:

w>�xM4Ve@O�<����~rf0�ɘ|��SA?� ��O˻F��!޶0?N^�c!%�*}�S�j$�v��V�ax��f�/�8����2E��v�����v�!�9�l~]A�\%@��J�w�|]���K��� '�I��G��].
�cx���~o l{~��^ͫ�r
�EH�"�CE���#U���%��������c.��k
�����#��[h�U������CF $���@�r2��� ��je�Q;Gu�/��f�%��7¡�OV�^�*��jU���,�l�r��_�C��S񹐪褸�}nW�]�����X�͜��$j���<w4*?�I��6V��0Xe��k�����Ͱ�[o����M��1m(ʧy9M��2����>Ni��9�F*@��h�8�Ȧ7�tXĔFf��4����QIf���Iv�'�Rބ9�<:i�)���T�VV��r�.�J��7_�|����/]{���,s)��\�#���鑲*�'�������Z
���?�YN�,��$��R4ĎC���y%CY$kt&��%KR����b+
!�$�؜H+6
�6yk��kK�g+"�͖c��u Re6��u���Ph��Z
�Ym��#�ԝ[T>�(�fa&���
��D��s!��dE�5ᘎ:� �Z����+׀/ѥ�b!z�*6�
3Lh��D ���~�e�i��jo��3�A��o�V����j/������[���ig��{
��b;jv����'��Xc�ɾ�g��3�<-Ҡ��ks����&&7��ɂ'����wۖ�vS���*�4�J���Sk�X�[#ư�e��B�'cʟ�a3}���f�J��\ly*�<�49��(Ǵkg+��w��j�c�f'h��RuԦ,b�����Q�J����JS�U�_��:��5J�h�O�23��4�'~��f�>%>�,ȱ�rS��D)��L"��,�;��op�5���D7�sK����:0�k�������i��!|K�R@y�(|�����҅.�O���]I�?�Utn.
�/�e��x\�D���C�u������!
�U��4Tq���s�(g��X��Rrل�\�΢+Q~͘�kn���N���b�gj��c�Y�7$!�#g�(Eh�ly�+Ne�GϝI��)(Tō�i��f�nz�M��^H$;�}D�=9������)���V@X<���� ��hZ��~$��K�x|�Oyf���Rn���)�
"�Z� l
	�c��� SOܕ����k��E�f&��tt�2�F���V&��g����w1�j�)t�!f��z�~�-|u��z���p��Ůz�5�VM�8�;M88���DOyz�	V�*��|H�+k��.��
�x�2�܎9�s��C�5��i�
�`�Q�ɹZ��Pɴj�:�>�l��;,!s
ֿ�O?����ף?R�
�0�fh>�H�Cఙŋ�ހ��
��e��9��^�V���^��ka�i�<^;s�tqba��\�Ԝd�|2o���|��*��~u՛3Z���^cB,\~�~�J��P�WҮ�J}Q�^�~Z{ag�_�ϩ����g����>|/Ԉ�l�
�NBn�$�ߍ�rN�)@5҆����B�ʮI���5�R)V����E���6�҇Xզ��$�'�i��|� L-X�y����Dn��2��ɪ�,��f,<�t"<��SaA��T\�dY�2%kWg���KƷY�2�ڽ�0��_&6� ���K��y��
 &������^��v/��|�&`�����l��$;��+�"�>'�vE��N����,o`[*`��V;����< R�ȐM-�B�Uv~-M�QV13b��3a�-�Y�X�s_!W�Ѥ�'KJ�
�"�Ɂ@Qʰ) q�/�T�r"C�u�ҥT�nSK!E����W�d(H#pSu9璲��UT��T���l��
:Ɂ���d�]ߘ�k+��Ԡe�(+O]�7��c\�VtK�	;�"�&�(��hB�u�����3�d�[!�/�_Yc��*�Я���2a�`V{����ލj�F�����]�����Zˬ��cn��rsmO�c��&4-��]���˯_�v�g?]�µ k�Z�j����n+����:��~TƮ�!�(��Y?�iV=5t9� �1C׹#1tQoq,;�qו�'a�g�3�	�wV#�YR�B�ӜK":f�a�tj�bs�)�ќf'�S@�`Zz��:��$��۩�:L���7���l{ݮ&-�d��1�/)h
�ټ��m�X���h�� 4
��0z��15��ɤj1���\8��(�q�"�<7 �͘S��$� (f��ȶd�üd�HF�g�67�2f1�7�jΆ�y��<^��{8��G߲?�R�����z}������� n���C���I8dZx��*ߐZ���F��:G������o�������1�~�;�!q��G�?�����4��_Iv��?�����b:���}O|k�c�ʏ~IZ�)����$&-��i/�d4iQ���W�Y^@BkC�a��R�La�<_��SC6��ʋ��tF�0������^�����#���z��1���g4�ќ�)�T�Y��:�c��ƹ��Y����a[�������-i3�k���n�1o%Z�Ne����b�owI�&�-]������zv��;2���$��:c����$�6*
�o�o�=�<u"�8X�[m��bh"݋!��&ME�dI�3?ΆF�X^�ZBbmN�(
��F�$Vy/�=�U�3��� {���uT��*�̩��˼�:���r������Ϛ2��*�9zg^ǃ����iKՆ��1�|��!S|�k00Ű�2��Q��Q�Ƹ��h�//��6SX�&�������I�8l�t.�];~n�O]E����N��I����
=J,� 4$��:$%G��V������jUƙ�i��e��?o#��ڊ�H���Zh���A��F0Ok:�:����"?��d�I�s��ۘ�ƪ��ݘ��g�%�}a��a+x��K����U����?�1�~&˷�Y�A�<�3��xdl��B
���Ƅ�6��>~��+���MW-��I\��6�$آ`#�� �v�ͽ�J/��l�0ik�$]��p���9�l$���΢લ
L�Ǖ�Krr+8�Kd����9���e43�V�_�0Q���f��-�`����ބZ��l")ȂN�?��U�@�Et�6U��)�F��eѤH�g�����=[�
��{7^�}�g�tV�l[�n,�.�̺y5o�f�vp=��3l3�% �K�-6���R�Lm�j��ң¡�wY4)i�Jw���y�J� 7-nL�/6�l-��[�9bW���:8#QD,0�;1f0�����+W�L�O���O[.@��Q��G3��rhD��+�0h�wɓ��Ld��q��y�7��JTᦿ�7��������n?g��%����9)��y�;�v�&�� \n�
bC��JZ�&_ ���1Y%�4�A'#,SO�3�eE�и�����"��(z�v.���j���{Z�]b�sO�춃v�7��0�~��Q��jʎ�1s�5�]{�MX��WnZ;\�MpD�  �t�ק��(�V�/���]��%��TE�|gZ���1�����˚ 1DBE�RB8WTZ؛Msӛ���i�c��"����2�|}��Sw_�G�'c+4�Q��������bv\�E�J1ǔ�������^j�c���h!�i8������W�h�
'
X��.�$�� 5��x)���X�f��s~|8SQ 9�0���)k<��)����V
]�:�Llyh�|o�ް�m��j��'��V�3y�6�$nH���s
�
u����
 [ hf�a5�55��V�y�@��p��9u�#?�U�i�j?Z��1�?�#��j�]�>��:���"��0Ʊ�
���k����_�ބ7�o�{�xN�\0�&���fJ,�˳#����7�h����(�c�ȲݫV��o�tو��f�P��q@�k��=q�(��J��h3d���f�ީ�F"7k���<y^"?	�@H��(��#�j�Ws�6�_=M�. ��z:�� ���D\��H�)���Sy[k;"���>,)�T�WŃ���i�[˨H⧹��nH�oV���F\�]�,[>cG�ʰj�F�t�6����Dv�,�|����bFe��	pOP�;'�y&���{)K��չP0R���Z�3xj���p���P�f�Y,(}��
I=
�&WU�-��_�uQV�r�Pq�@�����JtQ��M���2܈m0hн��~��3h��S��>�_�6��p+w�JЊ�O�{�[����7�ot��.��c�s_�����1r*��֤��$�=}>��!	.�&}~�K����b8~Q&���&ž6���r�'}v�6�s�i��`�? CH��%@��}S~>�w�HB_x2���p;�O����^��Jo �1,�(��A����d0��%��}���͠i����o3�b��G��C=��s�x�5��mÓ| ��d��?��pi~s�0/��ZW1�W�B�$�l�Q�%��	d{a�9��ދ�L��5��r飋IG�a1
]"E�ï��u���_��w���M�Nռ/*B�BG�u�ǗE�\2��+e��R��X�Rb�ȯa�����G��&��![3���@pd�����/S��X��'��L"�$����H#U�8҂�בʷ{�$���TZ�WZ��]$�5���pH�	��$Y�5&����I(dJS	E�PȎ8K(
t�p�)W8Q ���K���B>�3�8����pLw� ���.
	�C���zʉV�qS��W����$�C���$BT��:x��� �����d������<r�;2�ѧȪV�8=�BxU\LUE�FNU}����BU�w���@2�ȩڍ� o�|Vի�!��c�\���%I'�Q0�%y)G�ܡ���@�|��Ag��<y�<������Si�#�C����>��j��5�g�I��K4=�ᬍ*��]Ks�U����۬��U
7���&Ә�����π(��@�a/ڭ<-?��'�1׼_h��Vl��SK7���E1N�]B�\!��F�m����@�B���~��h6��F��`F�N�K��a�O������������I���:̪7�O�]13w�L_�:�:�0}��r��J�0G�E�,9�N�-+�6эr��s���%m�� 笳�n$X:ϔ"��3F_�Ǥ��Ft h@��3��$Օ�ϹEXP�$���<��i��ڈ��
^6�L�*�͙���
��1�\���
 b�k����i42�
�+�m�SL��c����H{����kϭ��d�Y��K�fuJ��Lb]�Zb�%��	t}��t4���E�5h��'�~5��e�^J�tn�xm2�%H��5e?�k�So�lͮ���s��_�E@�r�jN�|`��l�*���tH��W{�i���>�
����gr@�Z��W�#cҗ������� �UG)�Z�ϴ��BŪ57_��NTo[t�[4�X��.
WSԓV���'=C����dr&�$&PKt��	��Y���e���"��������I��i������(A����o��� Z����=$^��z�U���ij��9`�o�܃មjgX�dp�p�q��?i�����U�h���a���"�#-�sdt�����Z
���XJm�r�:/��&�z�db�4�|��H �����Y8�G�w2G��+�z�fku�g�f���DT4�Q���%�ǢRV��%O?�ꉗP���Z��%WF�vZ3Ҕw���C������H	;`�=w>���X\��}j�Z �(��I��IP?��9[��}�m2�5�X������qƱ�iG:	�֩͏
7��i_C�`�����/�)�,~2�1��Oa���W�9Z��*g�ˎq���7��y'�ʗ�'�v`9�@d���Q��:H��1U*P*O���Gqp�7�v¦߹:#�t	��Z���w۽u�Fa�IZ�����9�wlvҬ�'�J�t"�"��u�T6f�jП
eV�4o��N%Vw�����f���q�<u��6�Ӝ؆�4�w����G?Rw�j���E^��9�!���wW��Ojr�;��~��읽�~:���K��vP7���DfU�W�n~s�m�du�~��b�ɑW�Gx��ۖ�Oݹ�h����l6^���`��(�Ho�-wധ;�� �:�ڽ�*�[�O���$�#�X������O��|t�𴗡���d{ʎdh�y�^��D����j�����<>֬�}�!�6���^(�iOCCus�<6��(��!�ys�ľ�h�i/Cu��<4�$���PC�$������{�
�2�K�Ř�Ft!Z|���b3;,r�Y5��j	��ƛ�J�4{�; �3�Zk�-Q4��H�r�r�Z��M���"�7Q��[m������� qU�
���g��n�:a�u=�м��9LCʪ�(p����N灠p�6����K�r �G�܎��~���4�����r�n���y*�ot�T�����߽D�sK��s�]��1c�.��Fc��nݖX�zb�N�C���m��oA�x��ĳ��d�u��NP�DI�ڍ��
E�7����hH�֒\�E.
�%}k�{C2=;��+��[R�^�kX�hX��`��P��0G�Mo9ю���L!L�%�)W?��A���AptЍ�on2�L�A�A�����	a�^����`eu?*O�+BF�6a��\����;��-�н�C�^�s��/�[،���� ���Y�Sw�\���������^�f'�C�=YO�u0�y�sUP����*��
%i���B� 햛�Bꭐ�T7gG��r%0���Q&��ݝ 	ߚ�3Aƛ@�nib2�L����{ �|>�͊�&5��hG�5E �uFt5��͎�FA�E	s ����XQ�T5!:B��v �o��!�!c�Y�f#c��Skd�'?<�F�
"��b�y'������>��3
�lߕ�HC(Ƙ��P��ꊩ�b��8�a��)�xF�"��,P�mx��v�
���B�ҭ��Dr��*J�!~���GlCKjGN�r�t#�P��Ԍk����׾N0��Fst/BpG����J����	U�(҆N�"*[�1
��va~���&B���i��+dr�B�T39n�?<%�4E�s��)ʑq436I2�j֦j��Zf��ѷ������_4,�T3��Lu1��  ���}{sǕ���)F\;���,1��4e��ȖV��U��!0$&0�P$�˪�3�w��V��kko�6^������q�|��|��G�}N����t�  )ZƸ,��LO?N�W��;�5���|1��3_�����9=����T�����"�:VhQ���B�{��)��vR�A�yB�I����F�G3׈���3B��i{H5�$���I&������w	ɨ��(y��K�~W��Ac��S��fa.����ل�s�W�S�)
B�2s��6v�
�(M縡U���ߜ��ןC��~k[�AZ��;3���ۿ�Wjj��eY��!]89�V�'���G��!�\�2��/JF����,�ؐ�%��9� -Rg-�[���3���Yp�,�� �R�ܞ�J93�th舦�?c�����l��� 3t���]�񤠋��Ixq��/">{R F������� �M`}`�.�� ���Y�3`ԙ��7�{�J^3�{fuϬ��au+�2f&�q�L��=3�g&��s*{�����Ѱ���	2���S���r��gP?(�SBr����m�3r8T����%��&��-e�ڻ���IGKNa�*ZMym]��U��U�So���m]������%[:�6]�,�1�
���'�k����"��B1>o�	���6�m�-�Xcl�i�G�3N'��?�^2Zᖸw?����2������(��rC0
�T@"\�����r	���au}�����p{���E����P5�u]���&���H������ݡN�x����a�q�e��t���C��/�'�7���j� �#���Hf�f��V���&��;2�sdz��K~�}jޑ���?�7M�!�d=�GOM�%���If~�S�h�}<%��|%c�J�E��{Ktl��'���-M�3��u�Ǚ�D4w
��O��5���b�0'e"υ�sL�0��3�^L%���`�S6��j�<ȡ�c���Υ-�2�'�� !)e1�z5�CR��2x:XJ����	�a<F�M����Ao�'̕q�z��vg�������pǅ�ہ���'wcX�ƛ�n�<(�3��hnr�������<�6�ĵ�$z,J�TN�8?3_�	��1=����h�<���b��ΥB�B�6`r)x���������`�ق����QOT|Њ���(���_��r�50�'��^�_c]���I�]0K���
��^}�c��M��Xp��ު���2
�Vg����^�wc��U�d1j?x�z�2^���;iB�K��a?,e����y�W��]6��b���]�?}����U�V��ƀ&e<��)0��q��:ۂ����H����V&
@�e��2F����ӌ?a��� ��M���YG�^P�L�Xٌ�� V�z��=`oy��8���ƴ�� e-�%�f"\�|�85��s�P�#6�o�Ld#x�F�i����-N�ߙ��'��E���n����=����V��"�w�^��7�]?`D��6v�m����~"�}w7�V�/��Kx���9�U��� ���QL�R��&�X��*)��=?��ՔW՘nt[n�P����J/�R�`f}�o���lү35٣��Vd��1.Ⱥ��	=�-�'u/�3���Q���������Np`�~ۭ8�IPcݡM���Z�T*}�+R�xA; ݋<O�/��A�����,��������6n�Q�F�Dk1�f�u���^%�c�aڢnP�*sb���-?�2{��C�s�{����S�R�
Yp�Ң)��M�+�7���	}
_����~���-�L�9�S��p\Y��w�v��>%�v����1�6������pw�+>d���9�J��e,p�sA���\���~�U%��u�$@��`��[�%K�/�k�wM���ck�D6��w&Ɨ�gG�TU��F~Ҁ��ø�ĨAQt�ӄ����@�<�;%z�s��틵3�Y�.:�&Um��FX��v�1khȈ��./�M�Ttˤ��_�]Z��B}�J�x�!���o�w <����[V��� �� �c;oث.5�J�z�ս�r~v�gF�B!��&���׌��}��S0�{���]�oo����ט��f���\v>b��t��D�)�n��V�޶�s��u��ik	k���[�[��.�p쩋i�;�:�3�}�,�L��%h.�%`?��_�!�W�<O�g��EU񓹥F�?�;x���;
3"l�K07{J/<Qk:(e�2�lv��BV�`�
]�v� n��V���6��1R�;9Y����Q��/����!�����h����ׯ/x�����O�����o�S�̉&?��(&F���}JB���A�փǸ��EK-�t�X��8��W{l���e2�o�b�fa
š<}�1$>~fp�c
���
9~,ɯ�?�o��oyL[y�8fLf����p��OFS.��ĒԨ�ʍ˙��,k���7�Vf��L[�i+3m���V͙���� �[i��Fc�g�聎���F�%`p�2�-�>j����*Nz�ނ��쪩�+�T+�IMƇ�v�4�w�-p8q9q�ٕ��S��]�K@$�n)[� )�L9��7w�~\���GGneр%��S�L �U%s�;�yB�][b%�i	��c/ӕakcپ2)
��c�p)�M�*Oo֪��͹��4� \#�c3�Ey�z�.�
j�����aZ�lm�}m��j��̤d��U���֬�����|�
hp�$��t�^/�7��F؇T�ap����2�F?e�tN�Ra�ף����HՒ�R�8�To�Ȱ롤�_Jc��z\W�.�Y��l9	�O��܀ I�BF��ަ������ N����?��o�58�:H�i{7YsH�~WY'�#��+(b��ڀ`�XA�=�_���rC��a��6�����[1��ӎ�:�C�P[�cd��z�ɾ�G�~�{�'�@��"��b��	pJL�	���Z��!��2��k��Ϗ>4;�ܳ��_�T�DA�,�PO����m]�4M;K<Zꏎ?�cT8�c�C��M�1��!䶍>��j�_~��@��� 戴�%Z�!�2�Ji�v]�?ph��� ��7��P���V�ݞ��R�
kӤ��Y3~���Վ�AMff�BBqU�T,��
�VW6���I�'s}L�>��F) �����
줛Sw����`���TC*��?}3�.�m5^X�׌�?5GMI>s2�qC��������÷F��z�:�!$>-�M��V9�L�-b�o3��
��F���<�%R������vkB����v��sS�ݐ�=��'����C�)u�mN�J��Wއ��n�F�M�y@�
jR����8���I�Xr���E��x�u�K�~�� 2=��J�rM�B��V����U(��2�^]Bnk7`�I?�v���2h�e��_cz��lٔT�������J���[��dGo�nΡ��y�HPK�р�*���ڢf��NJxD*�hg�Xh�Ԑ��Β+���״��Zt�Ȅ�L&\���>}�do����ٗ��Ejq��d齅�jKQ���K�i
�3P�F�	E��b�_�L�e(��~G	 �F����AQ����]ҏeoI�bIg4p�i���{�/�W^�ƽ�U<�MP'���Ό� s���J��ʷ��X���9M�ha��������0����}�l�g1Y�Fʒ�b���Ch��M~YCc�Hw���-<�h�垿8n�o,b�v6�SY�k�l��?5����0f��K��{�lJ���j��r��?UT��Y��Vƭ0����
�{�����l
�~��i.b�J4��<`A9C��ɪ Z�L�ʅ|����\����^�M�|���E??�*���:)��K���_�/_x?�S&���X����}�U��`�,T�˂'AY���"�ҽV���H*~�C��<���ƽF�͕�{�m��*����lC��F��se�M�&�r�>瑿']��'�l�!�������Ov|'���vy5��]ƈ�g3��\�gL/�d$��
�jE,���T�8�����U.�-E�Z٥���V�;�����0�5����C��Wxr�,\��)�D�ؾ�A
�-D(v�X%\
�UxFU�-���NY{��$�j�I��E�7����������_�]��O�l��
�V7�F�
'/ �.�T?����7˦��=�V� �pj�v�T;~�a��bM 3����Zj��Yʸ���W���
p�)�Z��g��'S'޵0��p�R�(�-�sdQ���r�ﶧ���lx��Zj�im�T�C�Kε%�����^�o�4����I��Y�I�B�[�Xu5w�!V���o���,v�iM��!mG�b8ymNNA;�/'��.�-2�Rӈ��\˺ ��y.Eu
�u��X���l�/�7�^��y�������S�Z9 �ۊv�A�'՟ނ���E`��w:���o����Qoҡ��E,}�3�ϕ!�v��N�7B����J����R�:�&X��dK2��
�W�0�c�� lˇ���D�Q�����)2�~����w�]�a�6����f����2^�i��K~�9�e�c=`�v�?|2W%�!*�W�`O|U�A{h='���.���9խt�h����t�'u��p�TW�Ń�]�dp ����Nw��,88�%�S\�����N�5o�8$v�����y���"b��%;,�x�������a��n��w��"�-eg	��>�G>�� -�GE[��yR)/R�N�g�����,������UqG?��Gy���4����݇O�� �c����!�/����wx��$=V'\��J��Z�&���ڃ����"��"��~8aZ��Z����[>Ϧq�1�}`���>}9�H�A�^�w�a��綕wEG��Έ�:keg���%�;
������,?OMB�Z3�O�rd�4�N�N������/���A���E}#�W�2Tx�=N�k.,�2��F��P'�j��4��Y4�2�ǌ?ф?"�?�+��K��j���|���IE�N&c+��2�Yz�#����& x�7%�pK
����kR�13�7�q�
���Ļ��M?�*�!��K؟ �w��yBg�U�����y��J�)�p�,�_��>!��!4���
�dX&kFʡ5^+u�0�Ό!��$1�y�
KT4M'ݠ͐�	��ˀ�k��rjd���ft������J��E�l�
�W6 �=�[���U�#
P�!+p-f�&��?:?Ap��!�%�p�m��dځ�����?.���g����U��B
�x}�|����L��%ێU U����i衟�|���0 �nU�\J��H� }Mcڧ���z(�k�;^�D�
_�~�d���e����<v���iyR%�E���Pr�['-`�c&���RW�2a�iS(���aK�+xL��~g!KR��6����eO��19��ܲs���p�Ta|�����$�d�в6�a�7UQ��¢��zXz�Kf��~?�#X��>Ǵk���A���Ռ�U錷�
���pdnW��4��m���rFI�dyp���#�E Mo�Rg��8��� �1 �:'>\��p��E�:��i�q{[�x��3��h�Yk$
P�����2�%L��$)� #��''�4��/��*D��m�2��n�U+���"��va��ҳ��������C�@��
}������㇩�-��H����zA��:H^UjO�y٠� V���I]?N ��^�1P2d9D������)�R�>�Ef����YKL����cƭ�xQ�4^���IbVx�B���� U�/l�z���f;�b�;��\f�
������!{�}+Qh +��wI;�S��A�4fR��5N�\^�f���X8�\ZР��.݁��XQ�2����酕�\78�Z���$����VXX�=��6'�Ӹ.���,#Vw&�$l4c��uv��k�^�kN�K>�/��@M�� ��w�V\%�4�Q�H��3[P�P@��&_��~׆_�^�t�9^L`�q����3�3�?����^��8������΍>��=L��	�����8կw���&|�)7����$�JJ��������qI��%#�"���F&`��e =�Ѥ�Ҕ�g�(P��1�~�E���匿��B�k�"��)@��gV���ä��  �K�~^R{�9���9"�*����h;�ƉLD�����@=IȮ�B�o�����-�}�Z�5 ���ZF��-�����#�Yg�<����ۀ#$S�?-�d݂��ewP��ќ@n��)�
�׀����Z=qJ��h��:����C��0RMꤑ�6݁�l��2.OMw�(�����8H�� �(6Y@�^�+�;��'�;tt~�!x�\�ÚvO�] �Q���a[A񭈩�W��Q5�����(��zp�)�M���Y�5�s4���_�iY�
��ɲ!�7`Q�oyբ� ����E�ޢ�% �-���8�Ӥ׋>�Ŵ'{����/HMM/���ϐG�-�/=���m�,}�⏷be�+w�֚����|gEI���o6�N�8�n�@��|�7@��5�^/R�R��T�����JVt���N<��fg����T&�
I+z�3�h�%_2���-�Ȧ闎RY�KoЮjN��b�R�����C<�|�Db]��X��1.l��b���4��/�t�X��������K��4�
C��$��q�|ʨnܧY��=�t핆^�(��Z�c2�W�N<�qP]la��A߶�_��RO�
E�4%��(�8.0.Xv��|S9�1C��v	�Ł�S��΢��: ʭEq�
���w����a�����O�@������b��5s5׭AH��o���(^��x(z��nd��LzfqZ���<�\/a�XVu�����ϸ��A_Ԃ���9~��|�ޮOR�Wts��<Gu�dI�`����<MiӤ:��p��1�f1��+qp��IL�f��Uoq�ﳉ~��F�M��ZvA-�~λ`q�h�2?��}�r�R�UOm�'�}q �ǘ=�R�Ci��q���!$�Scr=�+y/��E�Ҩ3���w����֯zu�m��}f)���§�*�Pߏ�;*u�D��3|AMRv�X�?$�R�@��vYp�����S����TL&
��sj��f��Q��H��V3�5L�	�M�y�؜ �"��T���}����l�j/Lm����O:Z�b
X6�R18B����+7�xt��N2�ޑ���Y�(�a����x�>9ӗ�[�_��=��>@�1��Y�V�
���O�ߙ�;%�OL&W�T��W���
gU��i�x/?��n�6(,����z�
=J�$��ʊ��<�����'��q�B������j�_XpO
q�x[�B�-T��u�t����y���>~��f�bzD.w�0���/o�[|Ç\&���B/�J!�u�kOHr��4�_����	���l'&T�N'�\�Zf���#��A.�7���F�Upwz4v�E]B)�(
#9�Է���(��̉�,�I�1��F"�;�FD8�D�١�U��G�!��z�bS����us�K�y�-����~5��#w�"���ѿ�-!*�{�����?�����&�N�u�
��8 ��u#���a��Q�a�����9��v��<g	 ���Þ��_ʳzoP����(���
���abN�# )a�J��+��o�U+y��Xs}�?f��aV��-'��'֠�͋���6g��AZ�j���síЂ�:���*�c�K���5�!G�>�"�����U��X���
"[A:�^�g�n
�����E+���o�n_����p�q�?,?�[�-R�8]#��1͵F���Bl4g͡�7�(6�33f�d&y̴#,�:�^�MGʽ�^d�Ӣ�Yi��a�K ��%�
�D��K23�.Ջ�^I�G�-��Igg�T��K��;Kw�E�ސٷ�.ջ�Ve�,WaPD��e:g"�:��I��`ma�+s��*��1�x����a�u�ѧ��-��ǚ�[q��o��4|���_�"��C��a�ʂ':	�"ෆ���Q�^�����R/���2�l�M����~*��9��0[�ju(�+븣C�H�$���jS5%�|7��$�^��O��hP����S��+D1�}0�e�����s�����^��Sm,C{P5B�r�D'��81���!��e������Qo���|���8���G@o�L}�.���$ɍh�4��q=����^�ú���������
_}-rOV{Ռ)�OS%� ��ʧ1c8
��n2喊M���h�sڎH&��t��v/�.�21m�Cz�u��b����
	�3yy`����0}L�}��Z�ǑM�;i]QEZ�
��9ں�s���H���k�h2�Z�p6Be����JU�lR�*��j�7��������<Q�-M��ݪ �?-}W�:���>++��KE��0]S��6������AK�.�8�8�U���E�´�\Mf"|����d($@
����%�Wa��ekx��/^���ڭ��^�qs�gwj	�1bV��������<x��`�
�&xoE{���-��ִI�mQ�F�H<Y��qx��Y���JFc)��lJa�ݰTE��	%I9� A YaǕ��\�&F2z�ߩ�E�H�_�C�]/�}cHu��fj�`�
�87���`�����6�x��1j<����Q������	wt�O^
�����ڂ���f;��UfPn�ܥ�L��#�zM���A2,�wqjK�~�����V��~�����AbW�0j�l7n)����>C�PQW�=W���Hr��y��;��NP�Y��Y�f>�5fX
�A�|��7�	�R3�JMO�b�aH_��i�xq�D��`������
�kW�u�k���k�������`�X�X� ��q�3������?.�&M���$6L�c�gy�he��&ki�Y��U`<�kD������餉ʸ��/0�����w�@-����f�`~fۜu�N0t�i4-a߈�&e�4����x���Tߍ�Ę�r:U�2�����]�}bn]U� y��8j�����W?5���y��"l��i�wˏ�i`��@��i$x
@
_fwe�zq4����v*6�$�؁�p�,R������4ݧH8�N��P��=��A���D�:�J�]*I����f|)��s������~���Wm�_���� �����&C��Y'cf���F�$/f�k>�%�2��3�oN,�g**�G�&��L��T��k�`Al2Tv�����?��ZV�q93Ȳ�Y�D;���aT��}�RQ
Y,B?��	�{�/ŘE�6�y)���r&W�+��f}y��X��.��78���T�� ���z)�cHqٕa~��,g�`��%��U���BO�-��?ﻰ�r���2��ލ��]���W�_�
�f��\�����y����a� ��~y@�9�K�|��{�}�D8Ze�S�`1�Z���١��I��i ��i i����!��v��q�J-�/�<�EݒT!����
� �n�Bu � P-�+��j}��:ֆ#��@ꖔ��
���{J�v�"��\���?咤)��������kU��#�o�,��2^;ڴ����X�l�|F0���y�(�[؏.��Vg+�vm��k;`JOk3@���������S�(|7�P��%�kqŴ+IE��>Ke��p�H�C��fR�
\�lDvXTۮ+�Fee�X�{�q^���5�iID��ի�X�oU�L�=8"J	� ML �p{�w�V�Dl�?�ҦP�#���w��
���,V]:��]���h����}�y ���$���0
�
�mk�X2�C)}cF�:��2"�Ԏ�x�p�<u6`e�����+���^�&�(�PO��2�b�&)[�!�a�#V�YT��{����y�q@i,h�m2W�9�q���Eȃ�Aw�$���]UL��W	�ĳ0�����������=e�V��d���8�����_����g�fpb��6�Yo�8�d��6�{Fo�=,Q=/�B	��''�-mi������|���=��7���a��1$N�S(�%s�//F��Y@n2�D�0���%��#���u�v�W QF��[̌�~��1C��)��	��P9�h��F���g�ZrՇl ��Kmm�򸨛�Z?�i��/Hs��s�n8er6O�m��I��bH��-3�R�V(�b'AV#���'�ͺN�N��{�荋�'.�M�@����fUB����Ȩ�r a%��,�/�XK���ux�;c���t%��o-;]�����t/��i�D����఻฻́�Yy[��!Vf���{~�D<զ�h�}$&�5_0��m���<���������G���hpl�ÄGR�41C�r{ڊ #��f��66����5X�&��`#ҕ7���|G.���Ge�`���I���R.^�}cB�����Hm�� �4_�m8�V��\�N�}v�&��G��暚�H�HJ���K$HFR]r?�9
���/sx�?@���W�����EcǛg�T+k���e�r�j<�i�FIgB�e�<��Z��濍���"/_3In�蟨_�����<�!b{�pة��~��6�汈���j � n�96,��x\�KSy豏>f2�Oy�{�$Aۜ,D�xB�d�i��Q|p����^���{a����@��2B�8�A<r��i�^Z�1��܎v��A��	4@|=ܤ9Ț?�]�I[��Cɸ bғ�(7y��Ӗ��i�Pf	FS'�kjm��K9%J��V�
m�󫎞KJ��"l�����k:�gi.-Fh��*F�%��r���p��yenє�T]�0,�d	V����t�-'��Mf�4�
Dj��!���%p3��EV��qgn�7������c,�� �����ٺ����������lo�X�$��pk�IMl��x옒\[5^�L�������,�ޏgN��>��w��|����ue��V���gF��'ɸ�n~�+&�'JW7	WJ.�Q+5`9R�\|��8`����qY��7d�CZ)��~��i�5���*�/h('.�3�j ��~�-3f3J^Z,5((Q7�=	dN�2�v[d��&忓N�l.rE�\Y�^;�o:��I'������q�����z	�hu�B��J����sf���͒;Ĵ�����r[�$��g��j���#�Ճ��`Ϗ�	��=���02��a���7"��$��N�q2�a
xu�	�|Z��;���؎�A
tw�����lo���7m@=m/���k��z����s����z�G�Y��
+O�����+���
̫� O/t�K�U窘E�ZY�xZ�����X<���e\p��?���Q��^��X~��e�^Y��Il�D�+
gY�C�P�cL��Vh&�S�3Ϝ�+fd����r�(�����7⃲�<U�:���������aj�z|DD(���n��m�V�X9���(�
Ƭ�'ؼU�K�G_�^n=�����*6_;�{�["�:h����^���vX�����������aE}�B5���o����4�/�eYMo���<���x�`>Q���k�^�I��"��Z�d*�����8�C�\���` <���yY�����ˉ��ͪ
0��MR����Yk$"�A���QH�������U��V��}������]�'���<�DI,��C�@x�*��>Ӡ�����če�AO�CL���
���gj��F���Ԡ�GYk�搈��k����{��l�gL	�L�YPU�Q�"����KZ�a$����6<���Q�*��Q��y�A�i"������ǋM��璜�#�Xz2������|�D��X��r���I�����o������L��Bܙ��AY5���%۠�S�g��B�2����ĸ��S\�r�����7�FKI3!4��bg䶘ܪj��
���M���[�X��?O>���5P�H9Y���0�m(y_��V'�J� ���<�%�k1�|�x��U������]�ȸXO����X����Q��ҙ��!S�%Ď��҂�ޡn
)�=��nְ:T��GU�a'��#���e���l���K��4�h�1�^��,��G�xy?��c��a+^�eQX`Yr�C��T["3�
�$�^�1��)�ty��z{)�N�ӍW"2�Z�&gݛDn��c�Qǿ�����8zt���o����|����O�1�1M%�.�g*i���v�����������	TJ~l�@@8�O(z��tk���َ�b���&�O���N��r�A�Q�w~�k��o�����5��\I=�JR�Q/bMs�����S�VBV-I#��ĩ�3�����{���w�Yʕ�2�TN�g�8Π�d��w:LC�7Z̾ݨ7E�"h��ҟb��\�Sq��:q��h���G��3�&.�sVX���^T��<,�v�p��@(�ܭcxt��n���GߩL+Y�˵N6�I
E�j28�貅rDe���x$��5��������e� G����7w?�������c�M���O՗N��;����0nu���üiz�ǈe���s��O:�^�����=����#ܚ����[��"`���`��X>�?W���h�������WΌ@i`�mPEx1٬0��y [^��]|���9y�3R\�;�t=,x�DP������o�E�����jOZn�g��>�ݑhb��e�^���s�ފܡ&���` �<J�{���'n��q>s��no3�+8�y��^�NhE�Ch��KY�ͪ�h�3�T��'����>Dbo�c��@*��1�l����߅����d��y%���E>� Rf��~ʥ���N��6^��(��Ν9A$Y�kB���`�D���=��Ũ!��^h���I��k�""0Wٰ�<�p���v�ćP+�$C�y^��3��%Ɨ��{�ÚB2��D���0�7�Acڍ6��Z[&V�� @�7�ZH=X�Ccµ{�z��췯��0�P��l�]?���{��I/dJ�t�v��
\k_���n������kz'I�����xM[\y�3W�s��� ��Ɩh�"K�.H'Х�"�͹�
�a���a�����y�o#�� ��~��}g��m�GǿhG��}�n����E}�ٍe��Z����������+Qkg�}+���TA�i�Z|��� *T�:�������0�g;����Y$�`�l��f+�����ǐ����ti�!~��O�l�w0��ѧ�z�������7Ͼ�sQ���u1%��ɜ�'�Y�7�&.���s�j\Q7crê�$7��	E?�T�S�Y�v��]8b2*
�`V��z���`3|~Ϗ����~B
J:��	0��=�{8Ћ�O��5�B>_��/ā��m���>�!�9�X�"��52����S�\t��"�����5�~�1 = �c��X+l6�h²{Z��c����`+�٨��|H����M�+ѫ�T��K�#���]�;$�<k��Ð_���-|���d���Ҿ�_ťsf�;m9u�Q	��hX�_~M-��J�%����L�t�6ݔݎ�-)����$��`��o	���ʁp;力X��L�6��QF鰧e��嵨�.���,i��Z�K��k4&��Fl��Ȼ Q�J��@�툢���P�ـcj[^�
jAGqen���o��uГ4����a�L_\�^���{w����Eī��_�x� 6�C_����v�~��^VAFI�	5��3Vm4��s�$.�����jpx��L��F��:+�4��
�݈�(�gΩaL�A�h$!���	E	\пb迍Uffb+I�%���>����s����� � ��U�C�\�!d����	�n^=(o��̚�CP�`,��m�R/��~+_CX;��D#9��
/2d�$)A܅��1-^^�6ن@q��꡿чJ��kb�V�J�c;u�
Q1�qљb- �\�F
�#���t�q
���'�S{��3O�!���$������܍h���@�e�y����%/B{��?$������	���^58e"#�~w#�C`c�����=J��/:	���ɶ��v`K]c���;,�j��W�4ǫ�aC�Gb��L���8�2}��R�O)DG)��C�%P�0�ԝ��t��*�V��.�:���� ��.����5�����/x���'X_�1W�{,���ύt1��f���L��'����wͭ:q����N^sẘ��۝q���n�v�_t��k��]�oy��g�d�A�B�7��&.��wN�/4�ex�c�⻩��ѷ%�p^�քx�`�����&��L�;�Y��[w��ܨ�V�J�ƴhe2q���ή��OSXC�b�^������g~I}��/^���ڭ���e+_ߊ����(}=��Q���D��v.4�ش؎u��4�S����>{|��GEZ5�( �u?N�cy�x8�nnmA��lC��
�j�H0la��'~�*�S�#r�������`�<`2Q�c�Oo���Oݶ�x�5�Tb��g;Q�$;nK��4�Y��@��H�շ?�$l._	����uÝ�d��R�V>������/,���F���p�V�n������n@�� ;�Uҳ���%K~�M��*K���P�5��h餑SR��!�Lw��62#�z��l�/8VI��"V���D�ɵ���]�}B/��4x�%W��� :������ʏܟ��*��{6 ��y?E85aA���jB6
���}� ��Y��l$����5n5a�3(_a�� nx+���n�C���
u`�D���^�*�@&@��M��񧥄ĕ5>���op�x0��C��p8V�a]x}`� /��Ã��|1[�q�8	\E/��%V��:,շ���"���u�K�~�C}����q>	B2�62�_�g����;1h#s��V�� �%�U��Y�PW�xd����}Q�uj�`�,�_�&Wi!*�:�e��P�,Ɩ���ӤV�9����k �sC]��������KKBo��[��rv��9s�Q�=�c�.O�u����?,�$�ү�:If���/<6����/�Z�q2�E�tٮ�{�Ǖjӂa1�r{��.���S-�jaQn�7d����g���;ܔ�viXB��bDS�R�;p�ZP�_�8*/���/x�*���:O��=M ����m��AK_���5cb�;��p�W����._�uZD�?�R�0.�)2������>�`φFQ�Pk�13�m�mRbku��� {H����ba�{1@�iw��ZP����/�	�����1�¶=TYi!la{ͻG�/�R�y7�8iŵ������\��Xrg�된�#oюn�=�~=�_eC��@�;0S�˂"Fy*�X_�/���qE�f)��c
\=,���u8� �4X(��h�ȳx��X��H!��h^/��\	�?��R�-�6(<`�	<���;���.�G��9�'�P�y��+�;�S�����wn�hƆt�;뽫���3spY�`��J����v�;0����#�<~�|��+�r6���A��;D.�r��,;�8� �
`h�o�޸��U�V6���۞�M��U�V�8��a�� �]\j�p�M�5� �b�67ø�W�v��OX���.��2�S��A�����ȗab�B�J�I����b��h�FK|��bxb+p��ݮ�g+t`��q���-�
]���"�p$ �~�cOD��S=�����^�li�g�A!a�Lժ��/�4�*�����?(��SP����1p�#&�J��Ho��c�P>���}��"~0�o#
?��uӓB�(��_~�/���$C�"z���s=۽j�N���B ��%E���_��]Lw��tˋ���O��D��f|��k �[	W�-OI7����nK>��"Z����$��J�% ��3����o�X�Gę���3&_��J��@��zE8��[����	��8��tX���h�y�]��0іx�P+]���A�+�F�Oz"8t�B؁/%�����j�y*���E �@�x�>^�㵕�d���H��g��JF `��83ȟ�f>���� ��
��`
y-aL̙z��C���/ɍ0������V-LnbT�|v�I1O5eB̈́���0�Z�h�ї��8�w����n4��G:4�%iD@�d�8�� �U�Wؚ��hw���@�z-*��u�(D3 O������7n��~�囯n\[���+���aAy鎟����(�{>D�>-�(o����d�F��d�)G[]�
�!�,�*��������Ʒ����w�7������7�at����$��-8�0�j-췺�m�c�{���44<x��}7f�b�"��'{��I6z��n�-c�^:7Vk^,���G�	�"���YőA-[�fJ�E�S���Ѓ������K,!���=��Gb�K�j��d`����AQ������(>��{��a[Tw�1� �&+ m�����}�շ���?-�C'E��;�ZKfC�㣁|��w?����c�5^�E�5�SLTQ�wޕִ�����#^�쫩�6�D�~#�y�l�<��Y�jX��e�����9��" J(p�*���K(s�Rq}���������B����`����P�\�% �GE@'$����gZl/�Nk����܁�)#\U��3,�>l�6F*�S6Nm��J+��72���V�(�����Wk�GLQ�z�zl�������!ҍr�0 _�P.36d�Y5@�G��]�!�%���"z����P�5kEB��m��F� ��;x~�x�ٺ�jX?}�`5�� ��s�%;�� ���~v�<��b{�g��f���`���;��:S(t5�� "�me���4�l��6(�f �C�c�̃ӛb�n�>E�[��Eʶd���h��B!�xw�L��31%�5q����ݞ�B���Î�2c@l�idu��7�}j�������-0��W��e� ��Q#�M�%�ݗ�i^�R٢�hc}4�d�Gp�xj)J[�;Mk�-�X{N�����_��w�;����K�����5߅���h���ё�Xu 7'�R�Y�v�3#��~�k:R����^�~��pg��.��Sj�5^xs�w�;�h�?wTeK�SmZ�"��;_!?��z��n��v���h;d>�^�j �(��TPG`�\��u�q�(Նq��nfv_ ��P�V�e5���4*�3�X�jC�	,�Fu��e�^�X��+K�R�p�Lq�t�RW��ϕDH�=�BLH/g�za*?�2F�m��X��)0S	�w���������22I@"q=>�؂�&��c��jN7-�7PH6g�r5��G1��r�Rڐ���<��K~�
C����n7���#N���	pO���zBӱ&��Н� 
4�.8)�z�.)�����*���Ku�I��������/W
����ک�f�i.�q4�h)M ��t\/�,u��BI7����s8Wy�g���D�@φ���C����< ���������?�iuZ���Z�)ϯL?n�ԏ�'��]�q�$��fݫ2n������x���e�s\C�GsťF�k�+�ʹO��?V��~��+[�_D�d4��v��J��Uc㤃�AQh��ȴ��O��@��YA���sBT�ک���L�ۿ<7��:��5�i������˰��8�nC���S�-QJ�F�xq9�
Zʧnyէ���ky�'����X^��iy	b�2�Y�#���R֜VW�c2��M����_��a��A�
0��s��n�5����m�5R+L��.5��
+��h��r��,+ߍT�X+�c��7Ʀ��d��h��~vٳ�d
qă�Y�,Ͳ�i�e��Y�T�,k��Y�t�eK�c�����?�c��t�s�t����s���  �� �x����ƕ(��{�jƱ�I��kߢ��,[�g|�H��sziIh�DD �����,{2�dN��Κ5�|��Ŗ[v��y
�_`�g�]� T@v��d/�I�ˮ]��}W}�ow�{γ����r����[��o5.U}�s�~�[�G�N-w�k���'X�o��s0�͒����q`�
���`����a{��z�p׮4j5��A�}��UVX����kw+;�~����}����t�a`{��c?pv¯�ʾ�v�aP��[��l�������{=h��=���U�{���R�T2O�������@
l4��zm��
����O���;�j��������^ek-lH|�����Y�
��It�OFd�y�b��W+�ʶ���7j8f�"���A���3�<�������q�FtٵF��@��x��hM^��u��^%���Vc�}@��A�V�?��E�g���a�8��zy�������b��+������ޓ��b��s�~����H�@�(�弗#�%A��}�#6}uzc��C2�B���<k����0�G��q
p�����!x�~�w�Z���h߹jG ������u�V�KR��5E���w���g�. �bOw\��euC���"�|�j���P;������Z^���-g��÷67��墶�:����݇>�%��8���@J����G4��`��5p1��Xԍ�����&�B<�釬����6�,͢ow�6G��XE�Αz]`]`e�>6�8�5���IkI/��dM�|<;{Cf����q�C�q�g�N���a�v���#{���=	��u�V�|&Ą���8��p݅�v#�[�s�f�5����i�s�]{�9S>�J���}�ٮ�Jl�~��r��Cwh��vxxo�F��������ݶʵ%���x)<�[�N>{8��J }�0@�r #�oN�Ê��_1M{6���Lc�R����z�:��&�9ݶ�=����T��s�!��M
ڜh��!�ߍ������Ɨ����c�������9��&�MnM��ܜ�����{���O&�J��ܚ܁��Lߙܚ��'�;�F�L>��ޙ^�(�q�b� c�1��)}��wcV���B�P�W2[����Vh���f׈��*���;���a����`B��w�[����˝[��ߦ��%�*�
"�5Ϯ�D6�ɾ�� -��$�]��Y'8� �)�I��\�Z�9 t�"r��=ֹ��`�4���A���$�'`����� %��Bx�(��3�e!Lڵ"��j�����k�;|��	f���'�"��_`���RA'�#�\��-sx3y��:�
i��3'��Q{8��1[��"��mw��V'�Ψ/���X�ş��GT�A91�Iù�N3�ö��
+ 
]vL�؃���L���`��d��P��Vs�Haa83���+�Q�:��g�{lr��7��/�����<��ϡ�i1��8Y������+}��Ϊ�՞X�%���[0��J��Ƀ�N,Vf$�S7W-�@I��wA��r�_=Z,+�!zm�B.�������k  v�� \X�=��2w�N� uٶ
���4R�89D�w���~���⩡�݇6���w-Gܾ (�up����$�q�-���z@�%����5��Z��Y��Tz��0i���])�M<��z�913�Ƙ�	��'������R7����l�:�P@TnL���}�ξ��f��~�=Y�<���B�p��˿����F�3|�pZ��FH��7�� �̛�p>~Țlro�����k(w�6�b�}��?�7���f�H��\�aų�>��	;��%�u��R?���TG��{�5n�Ycib?��.���,2g�.�����0�6�
�J]��8Gv���*�0��2�4��3Rƅr��,��7D��V}%a~���!WNȵ�xbgaYX��1�M�����9�oV�Jg���$
~������!�|r�oN_�_Q�u�����@V�ڼ���ʐZ#��t��J����-x��ܧ
:|��
K7��B�j�`ؖX����"��ӈ/v�Eɲ��ڐE�X~^����v�&)����}�b^�Ƶ9�k'����ϡyy����\Bs����ɀ�[��@u׮���Ӏ/6�՞5p��E[��8]ޅ���� {���}����g����'��+�JB��=zDh����z5p��C����o�ޮ"��3M����Խ-�bI:�<آ�'Y��F~Qo�WЈ�B�ٶ�XK�!��w��:��K0�$㕋�x��tz�lô�}�O�l/�9�ǃ���ol�(���[�Wtq�r��\����☸D	�ނ���./� ���kÎ�j���t��9��Mއ��m�f��
8�oN>#[���N	�k�c�3�B�Tl�
a��vp�j�B ,E4���:(4�C�6��Ȼe��7�5<(t2��^��c8��B��_��~�E�+j��pο�l�\_���b��?c��
V+��x��f�WĹ�4��KG�L�����E��/o]��U����gY1�͋Ⱥ�K��*P*���|Ƴ�h^�϶��%�Θ|<�b���?C���I�U�F�U�~�(h���}��Vx	��ٙ�g[�6��� �OE��Y������6�iϴu�lڹ��16�|[Ԍ�9r0`K���qQ��hv�|ؑ��7�k|�����f޲/�ӂ�d��HY�����@E:|m�G��<�֌�57�WB�L�U�ߗ�!��d�T��)� e���ӏ��7��_����X�z��:���q�	�'��&���#,?�B��E����̾F��ݽ|�A�W���ֆo���^e�����57hV��D�������ڧ�|�z��\����� ��-L�)Sl�H����l���H#!�?���C�z�N�J��gE�䜆t�ᕯ�6Z��72�5��5fԗ�b�a�	����5��&F�~I
�v���5Z��z?��z��Vz2���%j3��V�x�V82�%�u���1�V� /��o��HMp�{��ǀ�)��U�y��P�'n�9�:���_�/-��xih��\��[�g6p6m�*[
1���hZ^�GN�fYV+m&CU"N'�3��
UF��m@~�:���'�^�)|��쓖4����7k�4/�}{��Qޠmr�">KL���J��!�1r4���b���X}�L^ڱ����SςX�p�Kr��3�j�xg	������76ء;�;C�f��RCn��=P��:����.���&)'
�}y�6�]����7ؕ��/?r��v�O�[i�{�\�U>�---^Y�^��o�:�aJ��.�*x��V	�tb�*w���1x�����T�\YO�z:�8
�3�%��穾�m���s�X{��[�a��^�c��~��FB�=){��W:���S�w�͏j^�X�܁]	� 6�x S����#�(oM>�|�ɻ��{�¾�!�EJ�^M\Un��bǀ�����k����E��s��M�Y0m)Z2�j�P%=�a/F�]���?��>̋#����\x���>�پ=��j(rӅ�+?5pq[UM�v����[�`��
g;��#-�A�g�C3�^��x�N/_���@љ�/Ur̭RO,��Ծ��D��"��"m�p�p�Fxh%T�$��M���)>���V��W��xA_���̥U՟�1r��и����r�쎮
ǃ~�G�{�L%=��b�9O�Rt�'::o=8�Fn�`��k�g��/v��πD�G�
�Yb����i�"��BAg_A[I�ՕT����}:�DYC�ߟ^�-��ׁ��c���}ur;_�4U��Jl��&�v�Tg8�����8	�z�kVX���t�l ���{�B���e���
�>�=�gm;6���\��p����BJ�k�i������Ҩ��
W�./oM�Oez����+wqh�������~���{�?Nߟ~0�9�5�]�:����h����sݵrm��^ ��a���	����@'�M_���V��x�Teӷ�z_�V���dF^�qdK:F-ð�%�s:�#H�5���!����y�yg^f����8��ur��ck,���%=�}��Q�P��@��^�v�K��B� ���+<�'Z��:���l� ���1��vǝ^e ��h�ܟ��.FI� 1�8�ZeeA�LN@B�5%5FL4�W���, ��'��]b���M>�ވ.�ߍ����6����#���U���*�)S�/k�c(���#��Ys-���c7�l�c�C�� �Q8㫎�')�S��8VTڌ�H�
n#�Ns<�n��>L��cvT����
p�u�P�s���Ɋ��O�K}�������H��`�Nr9м�/u�] y=���Nw�S���Oii�#z�#��H�%T�,<}�C.Χ��Qˈ��"���G}�];�!�򬶋�y�񵏌x��?wJ�����)_62��� ��zB�E�8~B�O{=N�m��<��D�f�C硶�w<iG,S�U�t�dx���1 �f6c`1$U&F��a���Lf�yD��2*�
y���d"y�
4TGͭ!>�%Z(��+�m��J�I]��jy�F�3>W$�k��C������mhp��')�t$1�P<}F�gw�n��fH:���ط_@���ã+|7Gb�<�	@�M/�����SdS�ʑ�C�8����,ܣNm��Ѕ¡��"�4Da�6�xN̋q�`�?�z�Xb5Rg9ϙ.IH
��#
�	'�B�:��ZD7!qh����� ���y�4�1Kx�s>�=4�FLT���xD,v�1���B֦�LgA/�=�,�H��_"���-�A��%;p�d�����A�ɨn�޴'8�l�����ʕ���6�`���Ž#�f�<L���p�o�k���1�3����ƙ"�h��ÅDg�IU$L�s޷�
��ޠҵ���P.K��db�V�gb]o���HL����Dzڬڄ>k
�D1��3DSk����u,�s�CSKyi�bf���	�3�;�A	�ޚ��{
Ff�L�N����oP&��O=�H�u
^���K�U$U���7����8�G���lz �fD��' VA���`w�q���C�*�4y�����&��s��K��m�w����&z�~�����4�\�1�l���s���L>�|��A�^#�ȣdt��0��X�7��S�E8����pi#��L�&��޾��
�I�v�͸�ɟ�i4c�s�'��k�+l�K:���7y�.t:�%��?�3��`-�G���<D>��L�F<�<z���)Fzgq�|6}7C����,J�M4N�C^�_��`���*��u�(�
�O(	`Dl{m��D���f�T��?� _��@��ty#Oy&��;J�Z�ᮉ7Z��6����^'�c�^b{m��B]<��f��mFn�嗀���E���S��)������/����#�#������O��b6'�Y���8@$/nNu>G���$%@��B�v�֧8?����͐�}��V�O����0D>�_~{P	I/�w��u�@�#��=��N��*��#�6���o�B݅�ޘ���g���6v�{��n�����V~�
|�,���o�Y�{��>?
�?{^��=2�GS���@{���~���H�9�d��EH�xi���8��(G��� ��l �W�b�>�<�H7�|F���m�yQ7��!\�@A��a} �s�����|�G4�:b� �r�DH�ޜ�Mݱ@����/u�L��ݙ�@x�v��)Y^����M풖a����J3
H�v&��CUNj����T:BfmqJ���cY7��3�r���ѼR�JZ
��˕-�j��K��f�� ��Fمz:�?nW;<����J�`N^�x� ��p�Vi�(6 []_b ��҃TZ.�|��V>.Z���>��i%�ك8�Vó�B/C�.,#�.��";H�Ā��*[k�k��Ci�?|�4
�n2I�.�����*A�vh6����7^��ˋ)���)X��˔̗�ܬ͟��P���[�g�����I�b���q�ǋz�>E[-��ExզVɎ�{�8�[f����FJ�Lq@n(�)G��Óy�6�)D��b��
݊���~2r#OdT� L�lwx������F����v�Ж��P�!e"]7�Ñ�U�85K���H��0V��~+_��Yv���J?����|���3Ta���"�0�52�K�C�(H��o�(o:�ΐ_:IW��8�2��0bE�%J[����)��'")S{�XJ�gG�j���α��5�=���މe�b�D
�����W`��\��k9.��w9����<l�F��,Ҟ�33U\�a�Nt�U8C`�j�6{�r��	̀��>^ܭ|�'�
���欨��!5Ԇ��ljT�`���J�.�(�x4K�ԯ~���J�b9[*�����Dw�@��a�퐊��T7��ST����H�OW���Yw0�ہ��Tb��w��W��]y��Mu���,=�31��8���χ&�<�P@^4�h��7�p�_dMM�K�EB]_̧���F(=��iV��~@�`��^g3)��U`���ط�J��uE�@R`m��d�5`.�!x���؇�ȶ�gǣBࠇ+xZ����mw�}�������1�}��2�ش���V!4
���V�w*��E��5�%�K1�|��<";pr�7s#���o�V�w��o�:���ǩ�d�����`(G��j@�H�܈`R���\���K�#)JR���{қatp�b���o��Cۃu�X��egqRN��Qv����j�f�|�$G*e?� ���X�-B2���JV�_ZbN�B�~����7
۠l�d�/�s���P@����u��L.�W�7&�k�˂rۿK�'����K^=wx�����"10�K���ޟ|IAA�tr�X���&O�_%�}= "�z�*S��}7j���W��|����#���F�5z	H^j�Zt~���7.��A��n�lJ�Ǔq&��kT.�8}�उ=n�����!o���ސ��M��#稍r����&�&	� �[��{�u��֑�������/e�d����]l&�ȧ��Kz�� ��&<
#:�#8���V/�u�1�,6%Uh�},�K	�������Dy�S֨�tk���ױ�(���]{�\�ZT4���wc�]���tw8��� kT$�t��^��v�
�p+
�D�s������ΦHA�;��3�B�W�z�0�����,�"'
rP${�B(W�&	��9V7-/�N���|�I��l���k��$k�v�,�2C�vo�.iF-�-����(7�����޾�q%�q%��;���Jf�e�d��A2�_
�Y����c��܀m<�r����y�;�*�m�ѷU��]�-A�����$Q����8|>�p�lh�g��)m'>����<���*:*�hJ�׉ ���Đ�x7Ę̙����ݿhEϳWD�C��8���h����G�b�
Y��Ey�`��0/��u	&��s��]��]C�p@�J Z��+c�c���D��h l�L�����\�T~X�������)����>�����l3j�4�F��q!��Ug�鏻�_��(�UEU�b�NI3�+|J�{���ڳ���WNM�
|E��R�Z�!��(�	�֥����p*|u��V85�]i���n��j<��h��r+@�˛�LÒ�S�������
j~�E=uw���-M��;����l��h�%�OB~�E��ђ� ���0����mC���Wwc��n��s٨��eZ:����p�H
����O�A��l0A��f�/	��0�3h�(�O�p1|
�_(ݘ�2b�0��)2� T��>o�3����Sď(�_^Է����Zx���T�J�
�����~��H@R�</��r��)�B�,�ȡf�u����	u�"�y��x4��$U���(��%�|dGK�����r�)x��PM�0��6���W�C��,3&WH��:^��m�!�U,��P~]����J24� )4�O�����\Nu]%�m��*�P��ȓ�S�wd�;� 4���s�0�.������ȡĵD2�<�#��ls�[I��H��X���K��.y3��!
��E�@�
0�����h���:�� ��1D#�tE=�"���+�xɹ���*���\"��J]O$e���6�,�[k����:� �ɚ��q6�`}01�yY��9�4��9>�g�����X��a�R'Y��D��u�&-�Z�f1��a:U��6p��_"�8�.sЯE@�)7>����<�7�L����, M ��;Lǆ5gh��0&���U�n�((�.-W��]�f�"��-#��^��j�ٜdf�ͩ����U�u��N�i�F��0�x�?��i0BsDn�%��bA�xŊ�f�xN�v����)
��'��^�)�3�^~�'^'����ô-�/kT"�>���A��݉�^j{V�*e#N����O{lkF۴$�닎�l�yR��Kع�LE�r� \����ڑ�^�:��~��(
�b���q�y��D�K�dTs;�8M~T.�<�%	>J�)����%v�f�P�ָd�W��P��Yĥz�h[�A៸xp)aU����؎���[���I8��]���D:�B*���f�"+���>d�Di�6/�}��6��L�Mvƣ��$���H��(p����$jW���| E�ƍ��M�͉���'Fy�*
���MY1/�3#�e{x8Q��9��������x��b���7��<��lF�d��V͗vW��c.��G�w�裬T��7s�B�Է�tS��B��6@Q��\���|qFefR�~WsչCR䡀j��`�RT`��x�0���Hn�=��>+�S��_�@/6U�DR�oz<-Y<�on�����'���c�a�!QͷB�	�]7������̜�ݲ����R�|?����Ð[�[^�Xۓ�������|0i���^��j�y%Z+��n�|���n�
���i�H}ˀ�� %n��?�O<�Ճ����%�<�h��o�3pP��\[t�c���B߾�i��u��OZ����]$rŸ0��bͼb����;�̤���s���*n��W�pW��i6�]���v�dw%����0��9�8	µ�-G�V5~�Y��y�qi���ߩ��"T�����xBX�[��xt�oF�z��dQ
�⏰��1r�~^SKUU�tG���r�
Tt���2Y`�y
IE姿+#���HaV��H����]���)�^+\0J���k+�Q��0�� E|ܥyo�+h���(�������fy�Jv��#�]���E�{�]\��2�+C��H1+s�
d�.�ʥ>���vI{>Ͳ�S�KW.�%�e��+��ʜ�u<4�U��=���P�m�$4����!5�:J�:,�ʥ/XW{gh]���r�!$SM�I�n�5�3�a�4 �e�Q�#k�2����f�bӷDV��������������k~	��AW.�>[��"���E�ѠN��_�E�W<���[Oѡ��C��T� RyF�D�0;@�*��j���\&]�a�P���7)X������;+|��gnh8�c��&�&w����i�˽�v������p4<���3�&�ߗ��zXoO���9����`A�����{�G_�2��;�?O��A���'E��oM�d�ZX��I�����t��cay�g?;����X{嚟�קs���O�I靳�C�+*	�ze�����$�ݳ��)6�Q+�׿��|�7��p띇`g� ޜ�>��X�%��}z�`o>�0��GX��f�u,�t��Ch3�5,C�6`ꭸ�3��&�|���������{�7���홾�/x�5��۳�-���ɟ`I>a���7�հ�nL�:�砫����w�'�����#�mX�k�#�|��f���}�j~�C|���-�؇Uu�w�u��	D�OX*��߇�n�6�-��6l����G�_P�����	�E��E&6���'�nS3�m�)l/�.����FgR<�l�'>`>�F��p%�(���^W�7(7�u>4<,����� a��O�?c���:�6C���?_*�B??P�9�E��3���;���H{up	a��a)U�l�����vZ��Y��;�&Oɢ����Ÿ�����zL_�M6[QV��Hi;��5g�	��s�Y��,O-�C$���x���"Hc�H�}?<[��ݠ��v
T*��aX����jV`�J�o8��0��䋐C~or�6���*0���N��WXe���	�YA�w9�\(d��a��;���8�����CՑ$<�h�����_�j�e�%���T^̴�h���-uWj�f��� ���Wu��S��x�<{gs������o�.�^Us~��o��.���t�.tl{��	4�:]
Æ�M[߫����k\:�6�\���V�g�ҡ X��,ؘ��lQ�׺=�j��玷nOG��6���m�-�h��Z�s�jd@<΢�7�oc��j���#o�aZ�0�s�����k������Y��9�j��v�QR)Qw�~�"L�z
�Ȃ#��Yz�Zj�֫�u�Q�Uk+K�O
��W�Fuu��\�6�/6[���ڙ�J��n/�?���?��U���kՆ�ڪ�4����Hm�ݨ6�K��j}��Zmm�f��mI���>�k0�F��ګ����F�@s
��5��uz��\��U�O����Z�0]�v��q�ؔx&�!�Ԟ��P@6�Jy�n)*Ȑ��5���%��_�3��~�1����/b��s�~��ٖW^<b$�^Oxe$�2I�uj��_����ԉ�����N	������<%��X�.�R�x{�;@��2~��
+'�las�����&\g�[B }h�:~��UYZ��ԫ��W#+r&?J֔dՙ3>I����n���@^�p�VJ1��6�)�Yγ���
o��LE��D���ڥ�Q��RhQ`����"d��/v�N)�C ������F�������TF�73�_I�(��%��hu=k���}�����ݛ�����I��z��vp�֜�1)��	��x��!Ҏ-$���]�԰������p@�4�$%��<���Ow�;�3e{��Can �-��;�`����yo��'(�<�c�.�n����%vH3x���A0�&|���u�6��ӱi�����ś^sß�EKwx���3�u��1y����#76�(?�,ei�E�"5���F@i3���'���w���{�{���l+��Ј��8��E8s:�d��o�SO�M�?���b~��ճ|A�G0>:;����%��}��/H�#�ɼd�6�U�I�#tw���`��-���k��`W�^��HʦޣP�����GhR_��$��y٦�k�n���]�m�M:�Єsܣ
Sc�R)4T'�?�����$���"��Za�+�!�a��h8�MX����4�Zb�Z�!9��#��ivE�v�®� �&쑱"U�}�Γ9�L�ӷ0d�7V���4�N�G�� ��"��%L��Y�qA�?�v�W�U�կ���^LO�ץ���yI1,���_'_���������w��F��$�S�D�Zk_ۻ$�)��+<����z9���W�f�h�W[���ju��2C&���}��$N��������`��c_3��������bpˬ��}��%O�̙��;�|r��_�@��V�	8}���{��`�_�1;����� �;)Q=���N�(J��t�D1S3HH��
,\��9��H�W�����+C��r�_U�ڷwX�z��}E���!j�n�9ݠ�o�j��=�Ow?����L� F��j{}�ނ?�N����z��Z]_]ZmT��d��Zu���� hW���F��X[{�0���z�Um���Jٕ�Zu}mi�Z�����R�J�U�A�������\��j8h�]�V��:���@ѺUY����1�a���"�
=���?�P�@����UV�͕%�]��Vi�+U�H�	7k��O}�R�W��+�fum�����x
�Є֗  0�&������&��j��%l�
��㇕��js�ځYCmM��^Z�~Z���:�n7+k�@fRi���
@��jW۫4��J�Z�^ְ�U���J�cXZP��`r�d��7���j�f�F������*67ֱ�U��+��@��Z�>�D&��Z�g��
|"ȮU�m�f�M����q���z�p
�:.v݇uo�Эv��c��VZxi
֬	��K�f
绊�Q������a�ۄ�$+8�vˇ���f���5���t�7B��:L����[G ��q��po	���^]o-�֛8D=`<�B+ߨ�:5��:b[
��{��6�6bY�@�
�
�
� )[�E�q�%a��a5 GV �Z�b+��������D��
�W�V`ESj�� 5��5Z)@��%l���PC�j�qy�cF�F0���q�&�EX��������
b
tTGm�!�4�U��3���!B�&�{��D$��l�%m0�^���]��ů�H`'�q��x���Ƈh��hEZ*�1�٭T� |
�t��֑N�#��Z�%X����� (W�w�U�;u � �}-������:�9�[0J|ATm�]_'�˴�
7-L�x���z�n M �k�Cu�oj��@����85�% ��A������ê�[8u\p@�1�p
>,W� ��59���R�5�~0H��-�t�
��Ѣ~Wp�4��ԑ^�n�i�r#�|a�5P�&�A\6�>�GqJ@zp?5��5BNح��M�L���������*���6Ps�%<�6K��}��j^N�@�O
�̙�4O]<�"�T�'�|���c��'zTI��=�цX�)-΋�v�����|�\ߵ��L�"[fpvk^9H����
.��Fb2>�
p�
��D�Ǹgduѥ�������qt v��<r;������>���x��j���tr�0��S����g܎՗�+�4� R�P�xZ�ë�t�U����[�}���s��r\qĐ&l&*$uǞE_P�|�P}g�]�u&A��������i�XR(�ɣ�68��,��W�{#���7}Ŀ�O${T(��I��j?�!�kC��s
4���%6�ؑ�i�C�f�����;ָ�mG�)��c� jc�M�vW��%��n�,��V�Ϛ��,��JTq�K��%��.�ң������?���XH�62��	܀=`p���L���!}��Pw�Y�Њ���S��+�����Cc8�O�$�L�M�l�������q&5ञ�9�/�sI����68�5�?�S���_Ay�bH���R�gu��i-���hb�Jg��ȠD
K;f��uGa|��] �Y�؈����D�:|�)�V���B����
!�q{�	�kc�L?�2گ��������B���#��V�rk���y��V�;BԪ��Ki^ǀ��k�=���m��7/l�|���(
��luP{�t���V�↘2��=$�6X����-�&D���
��^n1�(��3�*C|3'��V��(#�@�dr�Ē�8�J>�uNTJ��F�M�1˺��u���_�G5��F���,V<4�5�@*�V\��m���Ѭ A2�[��d	K2�&�(������7�s@�޶Vp��teMЕﭯ׷�۪m�ܲT`q�<U���O p��D�s�GQN�=r�W-��%7�X�227��U:���ލ�<� ��
2��I+~����& �ms
�t���2.l�����:
,/�c5i4밲�l@�őD;��p{-F�v�*��
ML]���s��su�su�(J�w�t�;N0�\�6u�WȂ���.gm��m�h�?Q2���m{p�F�k���
�!.���G!Tr��l�4��a���Ps>��Ӻ�7��:H������
�M����[��ܲ�b3�k4R�E��T2zH�n�yI!�T�+y��=6R���@�V�xS'��~���Hq���r_Nn/���ퟒ��NhO����~�-�u�H2
��j�#"�܏��b�������p�l�C>'
�b���9�k�-� EfeGɒt��Jj��+�A/�(�i�5�Sx� ��A<�+mQ='pǝ^e kN����u'���������Oc��ry?&�������M�Ë�4U�cs|�u���"
|=zO㣍�ц�Qtr��g�	z���k��Q��,��Gdû�n�����E�wݫ�1��m����9�e3�;��%�U6V�|�N�i�u�ڏ>F]�b�s�hr.�&S�Ib��I�y�5���]��{'̕�W���i�^��?��{���,.,��b�am��.�.����l�����#��2��Hy��)e�ݯ�ޞ���ٶݳ�9���1�cK�g�*F�A���ا�Q0���f�u X>?
���P��G]��<h��h��v�>۱�.:F"�ynw�I����`��Y�?v�����9Cb}4"���w�(��-8�t�	a�6�I4TjU�����3=�t˸5*���1���T�X��+1�+�6�2������c�``w�����c�BFW��9�h�?�Q~F��9�H�M\���s@*ρ]���Ej��6��K_��.���ط�����y�!뺶?|,��c���;�[Nw�A��������D.�$N�H�q���[�N�09��UD���l�r~�g�m��F��jC�{�[&JG�
wM��$R�_�̤O��B�%s3pL3����	��y+�/�p�D�@�T=%��ߪ��<�26�e�ǜ�9�\%$��cE����km��<�~ѭ�v��sB2
5K��̡�z%m�N��)SS�c�.��8V8���d���)a
1�w�m6�gkؔiT��Y��5�M�e��j��K�$����(�qQ�ru���%��H��l��I�q�+ja��Jv���xFz3ő��:�_�CnSR��@��B�K��'a�B�a�.Ş����T�BxI��ĩ�I�
<����N��/^��͋����2�J��
�R,�����	�-�	���P$<>P���(��H��� s�b�	�e��U�TϦP�4��v�$�ˣԻ�=]��Q!&���\�Z��XBrCn�T�%E�G bbR؄Z$�#��N��O&Ϛ�3���'ne���N0[:f��OM[����_�����d�|\����lIe��9 � ��W��Q.Ɍ��|,Ȗ��(�Wʬ φ?�&p�|���(_��:�GQ
S�Ą��D>�/�?N>�lqw�UJ���L�DU4���)���ի� Ȥx�yiD�,g�Ć�ߌ��SV�4q�0ھ_���qi�e'��7��A�?;?=�ȇ�dMƞg��>�B�|Ed�UL
���,N� ���[V�$�������4��X<J&��	e�O����S��ȣ��I���̔� �:�S�6��"ߠ�1��>&��z����Wr�O��&�hTh��s�U֡����SVo�G���@��Z�������e����f�w�ͺ�'�
�Y��Y��YK/K5�q�Ϧ\L��(�2��7w�aa��q�ِŜB�RV� B�_�gi�s�"�QaAbU�!j5� Op�ʼ�c �a\����:�G�aiQ�K�����J~5��*[�5�&R|��Ķ�i����l���`����,&�����=�:��9ۅߤ�l��H[��C
C>���5Eޖ�"��Pތ���%�eg%Y �p!)3�K�`���Ʀqq�������|Y�*f�jr�ܫ��Kk�r�����i[%K���^bX��Ow����6M��W��-Vg��r\)�׏�Y+�UA�(ז}������.������F��׾��i5e����e�lxfdu/b9�rc��j�:	��<��CZ�����/%>ID�å�ڪה�q�P��P�ƳG�O}4�(���ۄ��b�&%�-���h��t�?�
�E�Y`��,�$��������)���347M�1
M�u�7��kd��,�U.\R )¹I.���({j�T�Y��K�1ڿ������t}1S���o�����*��9��)ZE]@�@�,�łDf��A�<����..�5����V�e�O�_���.�T�����?�p7H]厧'ӷs�� ��>�]JX��Ͽ�ԅ�?=���=��ٿ�X�)�gW��;%��A�T�-��7��<�\�����Iz��»i˖�%M�Q�c��:���Bjԣ"d�j٦BƋ^�v�!���戾=�C��%�7V�X�Rw�e���C�1ч�
˺�FxKB��[����v�>��;�A��[8�������p��(���6�lnxy�4����h����ȯ��{9[������;	Ї������>:��L���?��ς�c�چ���U�`���NP�Q>�3�P�@<R������ԦR�FHmڰ?�3Ԇf#S9�������-�B��a�����ɯ�(ʯ�_3�+��V]���P��v�q��xΣ���G�GcoD����R�Ɩ��)��>9/�y��g.��v�B��?{�L�=�Ά3������o��Ky}pkL�F����I��3�k�L��}z���˗���m*n]QU�V�3_JVЮ+���7�_2���\5�l7 �X�e���}����V3�|^,J�E�G�w7�o+���t4Rn�&�<���yi�}��z��R
xɗ��v@��m�NG��{Q_]��x���Ӧ�k��k��֮E�g@#��ȸ-ֳ|V�t<��!�6$<L��fmD&,��cԼ1RΓ�l�抲�;�N1|<t�`�%8�F�l�������n����)phv�5E�g�����x �r��x��\^b�E�&x�H���uɥ��G��^D��*�pU�)m(��#�{�9V�"�
�wӛ]Wt2J�*g����8���>�ڻ�Wt����G�R-.���$�����h�{4���9Ƙ��_�H�
O�p0BL�hϷIQgd9�����;.�kCp��a�ZD{)�V�%Te��"T�ʏW��y:���h��m8��K��C�k��R
� {�
b���z�@���L���m�%sg����Q:l�<7a�&�/��`�D �JUѠҦ��,/Qoc!��骏�)�%'�K���/�mn!7?�m[��e��/�V��G����O���C�1�ю;�.���,oo���w �R0S����kVl��Ñ��O0Ś畸��X�D�ۊ=�2Ν�n�,l5��H{cr5��Ӣ�����S�Y�Y���x����lMm�SJ�����GJ&t:�<�"$��a��x�vբ�t�-���{f��Nw�ɺ{л/�f��j|k|��ٰu,ke��l V/0�µd� ��[�-���,�؈S��&S%:A�'�A��<^�奮x衋ea���\�Cy�t�|
�"�ƟX��(�v���>Ԗ�mᗊyi	�n��}��$	Pͣdo�ƚ�1�������izZ�&1��me�G[�[[���uQ2=� _��f��r��^��|��Z�K	&��k(vnbu���)}�g^�뒥�	S��CW|2KuyJ���U��3�z�x�!�Ia����{������l����!�N�E�{��A��(�q�r�q�J�Ҿ��9��ʳ���=�����ae�jkhf��D�3�x�s�viʢ�#,5}}r[�(��TR^�:0+�!����5'����sa�Un$J�"�#�V��Ħ�
$fWDnRC����%H��)s��UN�Z�,���ski��D�Z[6�D

��+�� c���
��X�eG9G|�s�
ؙ�u1�j:�<X�ϱF�2��c}����J��F��GT����Z	p�����q��,�y���8aq}�	��'<3'm�9��x+�g�GI����c��F�Wx �e_�A��ثj$ц�
Ex�ǻ���/��c��rk���l"���I�ǟ�-i�"Wyh�F>pL��؟���-�N�W��z��	M���Ӱ����<&BaY�;͒"��M��_�U��5���|E�;��Vx�sOw�裆��9�@�I���NP1����l���w^"�M��gQ�/�N�+��3U��v�+�2�L�����ɽ�;���o��^s�?V�H�V�!�Jxɑ��ˀ� �`��>�U��N����@6&�)f����[{X��0� �0.Cq	��l`f^�Y��1���d��]���L�����u�Z�����O��a&ʃ�7�P��� ��\�m��Gt�5���	�9HR(�^<!!!fp�Q%���U�*���x�O��O3h��M%T�*�fd��x��;48DHU��8w3j��U�|��	YQ�YJ�[5��xr+*
~s�I�Z->�B��9�K����������܎�B���N*Վ}=��T*Z ���.��j�
Z I�9Ԯ�){$%O�JkV�̓�ʐ�JHɭ(/�H�Eںh+�^L�AI�l7�D���_�������<=K/�d�N$�0B/㘱,_T���#��2w�	јgXx�VoS9P��X����JyJB�V�U7֔%;fJ4��F R��J� _�����;���-��5�
��Zr�r���?z��`�����ODR0UV�S˽f*�XQ�B
z�T��fW/aEXu,F�hV)��l��
m�q�CigcP����Ȑ�#��y�P�O��)J�F�������\��l��ML!�r��1�eX8�F��k�`��n#�F1)>��������:D�_I\,Z�L��`z83��޾Wo�՚ݢ��ij+H�K��p�}�o�*ef��� &�_!'����Aw{�ީw�A��6����L�Ց�l�F9d�ȋ�����M�R�j���Oa׿�������;p�����&PԚt�X��0�@�	s�{z�"��1QF����"���3�%x4D�������x�4�U��:д;���/�G}����o��l�
�`� d*f�|y�/m-g���VKg=��Md���`cC�18E�'L�~���bP�(1�����Y#k���4J�a�R��X8Hq0�>�#�g,�$s:+z�
�;�:�����;<s ��H�YͺeR˪`�5��ų˺CWQH
��&G�@�f��I�@� &%�*��ˌK��)C�x:Ĭ����C*�%�PZ�XjE�^�\���Ʀ�)�e��}��3���#��5��挚'1O�� )7�k��ɟ	Rf����R�s^�`g�\ϳk/��z��;��8O��-Q��u��>���S�V��|Jj�L�Ͳ$aM<9uoޠ8�a���`���Q��7�6�=���¯��q4j�8�����p0�-Ӓ�P?��v=^�"#Gt��|{b��>] ����|kC+�W5���VNH8!�]���Ip�kv.��9�u��l0֋�l�9�YZ�$׉���L��4��q�tY��Ϩ�S'ݏ���A�5��g�7	r��5Db�%&�с��G=u����k.���UW�k�*/�Aҕ@Qg�-���	ܧ�Rb�g5�Y�Ev���K�*nJh� AsI5L�$Wo� �bߐ?%Q�g�+�jv��ff�ԭS�#��HmiS	��Gٓ0�Y�j�7�� �$�r��O�x�t|lL�D�eqh��W�)�.�C86K�� ����<N���ɋ��g��sȢ$��=���Uɮ��t.G|9�9�~��s���3.��x6
�rI��Y9������${R�&7f�Y)�A7�5F���{��)�����gr�������#wwsu˺Kė����[�v>��͸�/���ۍr�]1�,A����tĳ�S�Ma(
J�ƽ�K!��/�-�)xXv�%ϐyԛ����'�|�B+�2\J�;&�G�;����#�����.���%RI/� �q k��)*�5�C�@���	�+�S�6���by8n7Ezkb�3�_�mN$�Osd@�)��0�>2�I�,)
c뢮hA(�b�&�i�0���8���=�3aD�N<yN��v5��];�R�3s��(�%G���G�Ӻ��M>��^(~~�b�p�ܲ��'"��ɳ@bE(�
�,C�(�R����J�H��S�Nx�駒'[W���
\��/Y\�� ��,۪H��~��P5�AY��3���B�G^�TP�$-g:'�FۤV6�ڍF�>������Y�	5xZ�py7�D��o���v��e��WV�)���W}v�;�{�@=�O2E-��
����*d��YzJb�rnf��h��C�_`_Y^�?�ʙx���LOފ�y[��6{��������O>�d;!����xi1V�3�JK���Y3�)-S�Ht��F#{��c� ���c�Il�_�u��x�pτj�,�۵��j{}���Z_��Z���n���Z��6��z�^������]��t �:֝{l��0[�>������;��f�ӳ��b�RW]2��"�b�j�a���܃=xo��ś��'p5_N����_��'�ҹɋ��M{����(-�e:���s��.�N����$�1���-%���{{�<r�W��|�Nt������|���t��A���1\T2�=��)��W��Y��?�"b���߿��:w�G�
Y�9NX��m϶�V(�_���<y���ٕKn+�9�xD�(3'%`P=���-U�X��$ ��:�~o��H��%�F�Op��G>Ɩ{'ȝY��0�����zNt.#_��b}��4Q�RJv1��
��(��NH�Α�T]��Z��gt_��pH���' ��G�tͺbwZ�
�0�����g��BRf<���aJ���� �Qx��*��e!3S?&��!n:���*������|��1I}�0�YӉ;��v��o�:�(�ȓ��5��xoL��YO�s�F�D(�2��V5eM��e"������;IwF45��D3�߹"R�Dm�I����$z�� ��*r��S���鉗�Mp��.�� N�1g���&/k�����z�Hf>m}�\
��l\�
m��ҳ	�ZM���e�?�)�>&:0P�\�'Y���D�b�͂z��K�Tx��{ /�񢮵si�o+�vlЍt"��a]��A��Rϙ��"��T�����Q�٧p�bIC�O< en��3�r�tSA�Rj^sR�dZ:���$� �!D��H�������9ӌ�(�î�
�J��u!�bӼ�XH��ɐ�!�ѭ r"r٨�QOi��v��9;4��c�p>q�'���kv.�_s�B���#���|���n�_�sJ�:��N�?9��_�ډy4�t׸Cv;4�M�Lna�����j�Z�6'8��AN�aǝc�ѳ6i�+dtk%�hO�����ú�#�?��[]k����~y��>�7UJ�L������HE:����w*����������m��5�w�!Ԉȇ1Ԍ9Iu�sa:�<���^heHƆ�L�W$j�B�[<QV�[S�ېf�ԳϿ��Ū(b�kp�6������+�8Ņ��
5Yy���)Ί!7^3DT���q�:��,P�aEm�=�O��ۖGD�pOEMq�Y��O%�ި`�uT��wO$T�Y�s�w�ʼ�*�c㑢ʖ��O�Ca���s��ΰ�wma���U��l����<���$+�-��!�7g�?F۫�i]�#b�и`�����<�ʁG0r���D,h���݋X���FQ�MT�\W]�`kI�Y|�"`�*[�
�
�%�M���T�r��]�Y���0���l�Wr�v�4�-F�G)����
�O�z�O���FX͌ѝ����v��/9C���3Z�����J7�$z���&tuǤ1�lr��%P=�cs�4
`~}~�7'����m�$d�XkSQ{q ;����h�ܣ�#a�*u�t_t�=���!1�����>���yk��]Q���f�G7���tm~���.�[��	[�y��r�3�f� -�mO4x:m>Ne�2*�?��Vj�5��f���D(V�khb/��/;�_ F���_^m��,�b:��3�*�$;%E�:P�)�s��˘M,4)nrӎ�P>�����!����V��'!���"�$��
���0FS�q��q<'��ԕO�!�x�'����J����O
F��1�<��y,��F(�|Q��4�u�y���)��1�a��\�:�w4T�]�4ɑ<�Z��W��Hd�X�����%)��I�x�3��±<Ck�V��Q�]���A�g�5^Np!}
G��aag�?y�$��,z�'�-���Q�ā>)�Q������� 
 �ϋOQ*z�P 9�;S<�;�h���>.rׇ��!��)=^�9�
������*~����3��+�I��PX�q�~Uda�L>ONWw�a�\m �s@-��Ե���\�NH�N�Hf2�x�II�%E-���
���(���@��T������QT�_��`�	��]tB�V�W@0HF�V��I-��� �[a_^N�~^Iv?����?�����:��*`��s�&�N�����~�kG�i�mWj�
x��b�<�g��XXKk�2n�b�P�QM��t���s:M���Y]�V���r��ÂIl��
����ߍ&��lW��~�q���'�9�x�@����!��S��q*1���J乲�֚�=�}=��� 33aN��FluO&x���b����"�� |�	m�3N0�&������w��ә��6Db��(#'5q�QʂTvX>'�
}�+rdZ��v�f��v�K����Lb��
U��O/Ǿ��ECsي2)�G�O��HJ"��|6�������bE��%ܜ|0�H�P"�c�q�����U�SɯI4�T�QB�-*��hg [�LÔ��]犚�
$f��%\�{�5~-��}X^�*?�R�kxc�)/���'�����ҥC�e� :����]�.��`Z�6�4k�n��ιp���7,�0�?����������Ď�zⰝ]��K
Mn��K6t�PC�!���{�,��Ds�Z�9��a ��:!@rh�����r�}��}��)���m��:@ � 	�72����]��?xd�x�����6���BD0+�lat��|[���y^�Ar��'��BS�p7(UN�^��Iq�)׫0N`�۱���cX��! a �����K@,<����\��J bp�>3p�/y���H���N8xT(����i���#�g�0,o��1�E[�eL1�pF��i����%��X-ᾜ�#�^r�J�xe���+���#�J$/UD��<�lS����
�	�ᏻC`�?�3�r��U��4�Jq>s8^�+F�r�b����Ԟ�4���!OD�U.c�D�¡�ph���l�=�4l`�E�qi�%��Q�s|Z_0uaMI`��@/w=k'Py�/1��F8�"���J�c�af}�|yv0��������Bf�lx��I�P�ef��X|3.揬`W�S,�&3�����,�x�=,,@O�E�R�� R̢�z��A�?�3�͉:
�j�*q{V� )>`t�%�Vh~�4Wd�����!�M�+Q����u7� xjT��M�	#w�-N�:F�ӷU-�-�uN����������(p�a�H�Q!R�
�z�N�"�Ѡ�mˣ^,4�0�*���_r�^Y��b1��W ?i�,��d�d�ڒ�|�{g�K�	��N��΋c_q��Mo]����F�&Jx����F�'���5�w���L?�pTJ���q5
���:���B������)mW�j����~h͓j醕k���_��+7���	�(�Ǡ�L��~�����ǜKS(cx|��$_H�fx\�z����u|�K�/��'@&�K�5:�Ebp���bt�_qܰ;�q�Ay�U�.���'���W&w�o��w�&EjMub�5�}����oa�;��{��Uq�Gɪ�eՠء�/�م�C��;� :�/P�7*J�����t26ay�-�hg|���}S���X`�5�
�ՙ_�xE|�/=����pB����y
�bI��0t�<����zB����6�5�P�2��x?�Ǽf��^�sA�^��'�9A��   ���}{sǕ�Wi!�	����T�ߨJ.)��v]]�Ck��)�V�%+�����+�J%�J[�֏Ȏױk?�����G���c�{�_3 II���AOO?O���Į�3��M,�uFY-y%��L�$�A�/y�>���$<N��'[ݟӝ��Jwz�Z�-'/��<��y�־-Ci{R-{��e:q5c��Rn������=�XVj$��a�f%E����l�c���n�4L,k/E?{�v��z����
WZaC�������5������1k�㣞��W���W�3���t��o����2���M:�+�A�teo���cO�&#�<3�T�;4�<�{R�#U�iַ�F�R����"�VA6�z�J��?0�%�~W����CE�RZ`��R��.	��ek��	Uvh0����R���.�X�Œ�B{# ܝ�kY2�)�Ia��2%f����/?�3^��p���'MxASW�
�M���O�D��Q's{8y�Ǘ/U�b�b�ˬ�c����pR;1�>�va�?^��<�h����?�{����`�~��l�oKJ���x@3T��5^iO�	�4%�L�;��Ld
�^��%�ܤ)��J��q����!�ﱧ10�HX���|�.Z���E:��l1k$+d5�d�k
n5�N������ǣC%�cce��iu��r'�0ל=��09hi����{E�,)�)R��n�=n�g�+j�:�p��;�
��#,�y�����|_���,���#�F_����=fﰋ���V��f�l�ֱP:�Jf
�O��"W��a?���O_����tܡp�{�2���e"�,|��_�����
�rWI�V�`�47C.t��಄;��x�@�8�?v��kLP�
������f�p��U�Ս+c��Jc�}���mmb�ކ��գ�
�?��1M�v�%�ѿ�G���[ayf�y��w�`�(����1�f�6�w��6�&��兖��l��V�]�$N/7�It9�(,/�$�T>&����j(jkX&0FG�@x©S���!�ؗ��������}�`�B�&�&��$���0��w�ͳp�lvz�1[x�4�/�[��ڐ؃;{�m�/��)�N-�P�g���
0N�:�����v/2��%-j���ڽ��{�������*i1�i���V�"�CX��mM6`a����9z���M���D
�֘v(8��GB��&Kp�&�Ԯ�3��+t�ܿ�~��G_��0��
��ۥ��
#�}�_��#�-��s�T�ƒ�����w�,a2n��fVg��Z�i���=v
 x�9���x���LcJ�~��41@��>�2Q?c����IW=�#֫�F_̓m�{-o4t���}4����rm����X1(B ��'���Z7v���Ǉ�E!����|�����e�'<"a��JS�Ȱ�8��/)�f�ۢu����
4�W<H	�=�m�
�Cᥤ�Q���Kt�4�g`���� +���׆$���=��>�w+���Sr��*��??���q��ґ��s�)�} �x}�$	
��4G��v\�I�?q���C��
�~�pbv�L3ԃ����?Q>Bt�k������t����߱����KsT��)��� _�k��)�ac/��i�e�����b�CK1�R�<d=v�t�E7�ex.>Lqx�q?R�%��_Y&Ar��P����Ġ��*��@��q<N�����)�=v�Ϙ3f��o5|��Π�}�Z��_���F�!"Ya�\�ǃO��א��7���?R�kv��bQ\���"�AԟFh�~.�ʠ�F�QX��q������K5��ֆ-�Z�Bw�2�˜O���J_Ψ��O��G�x��w'������@�b�NaѺM�z �D�2��!_i\��"]�B� A��]��<��Q�cZ"����)_�!��ڃ��t�=��Ƽ-gtZ]!L���?�2�N�{	��s�XD�`�70#��[�L����6U�Q$'��E3��a1e�H	-���|
�{(� ީ�J���`�xͻB�A��S�1����g�̼���=qtV�
�Q�B݋|��-}���������X/��X�Z}��ٺ6d�eZ��������KA�Qm�d/}ӗ���9�4a-����#c�
-r>��ELߧ�Juگ�:]�=����孳���vt�%�e�8���͛����[�xx��vK��W������̍[�E����iTF!���?��X��aM�7
���z��*�;�
3q�KF��G]I�AIo?:2���%ia�q�r�nԯֶ�����.'�%��Y�5#l�K�s/w�1�����j�� �O��0���M��|�[|�ˀ�s�Π/�4�m4�
LbuP6�#[%�@�<R��D��������IK�
9��A�	1��/<D7�� �hknɒ�X��A(�eC
�M��:�n����P�5ݖ$��#�A�}ƛ���Q7�S���ƨ��?<@�wZ0=�o�5i�ʇ����Pj5v��1�'R$�^��Tv��X��p0m>ĕBRa�X����/.8�P��]
cF.�=1&8��M�b�$����pW���sјe�����w�(A����U���:r���R6o�
��mGZ�d��y&]��k(�`��3��#&B�l	 =���s:��k$EF���������,M7�alΒqs���S�9K��9mq\���D�gM�_֢�N��k؎Q$en<+�\����|6�#�����o��x�Z}���e�ᆓktݦ��$���?���O�=tS�?��f��F6)>"���~�Ki�m���,'9�j�l���o��0�$�������#|�_�h1��2�m8N��F[�=��K�̻�P6��G��.?�3�Ҫ�y�%�V�������Ι]<L��#Jh|��q-6��\�Ŭ��qz����������Z���+����c���r���NnH��T��R1)�s)MB5�X�]�RP��E����s�!ףe(�|��2i#P�s3y�z�G�"�;�l�!�� �ˎ���+�f�e�n
��>�hD��u�>S�#f@b�x2�p:ʄ0
���̔��3�{��$|+U����7�XP���k�wp����k��[(%B�iU������@�N��-�Jt�\<^a�ڞ���C�H�A֯��"`}��ĳ)���s��ߔtވvЏ�N��QX��=�f���HɝOq/��_Bq��$d���xxLȞ��K�?�P�gu��rnd��t�D詐\��sa�ڐ8D��!Q��8'C)�ɐ�G[�W�&D�b��S�d����Шl�*)>{D�ى�O�BE�F�NG{іY����0���CI?�Lh0��=�GC������guʾrQ�c*D�C�
>1��Z�Z�v�I��l�2Ҥ�-"N,I��*R�T
�����IT�r�i
�=���IU�˱U!�/G���&��VY���*9�zz��)W�xΞ���W�ݠ6xցg��f�������0�q+�q�5�ބU���ZfU�cP��y�ӣ����
�N��ç_������k��5��	m�|w��53�͑�G����p���%
loB���,�:�yRt����o&'���m�
^C�1��o��A�74 m�OAF x9��7i�jaH>�4G:���
����#<�xγ�YsA'.�Fp�B��c�6;�j�<[�桾s03L�*�������)/|�)��-�	_rR�j���8cp*+Ƿ��p �����?£U/��[���%8�ʥ����W,b�B�(L7)ZM��&��l�>�j..�j���.��������F�R��o���l�Zb��	u���Q?�7��$g��{S6�f�Y�E�u�v��ڮ�sp�L���:M�w���{pq��~���Q0����:���V9��^p�l������N��Z>F�Z�*�7��l���,e
�`7�	�NPOCJ@���w(&pT*�����;2�����p�z�wN��R�
��-s��
���L��자T�\b�R���$����O�A��Q�:����
����­r��:�D�_��L4l8����i6͚�/�[��7�˝���J�N�L_�Nk�`��ebߑ��e�c5�yV�/3/w�sSab�E�v|�ۛ;>��]�O
�yZc��1"��b���ʧH$@'��+��MD�8�A
y�<�=E�gS\��r"�?AV�W�����|daͅ�R��K���)�,<�hE�q+�;T5V5[���CgvI��~0S�?Y�5+4מ���x�����W1�B\ʥ����.�n~�Q`d�7i��x�.�*��^�q�u*��
�F�Q(�csf�8[F�1�T���fG���.h�Z�,����[0݋�I:��U<Ԓo#|�,,����؜*��y'�׸*�X-;��tUG�u^|z��g�F�T�`�6v��ǟ���.�;_�^������Պ��uBؿ��B
��S����*#�7�h�HF�0�?=�&.	����z��lz+��6���j��a���)���F��
�s#ꨂL_{?�����˜��⿰Dv�(�/�r���3&�˜�^�>^͞��� �	�s
R��°t^�r�>�P�r2���,�3����%�B��w�������|+�o���l��L-0F�R��j�t�Sd��K+�v�qw��pi�Z�Ǵ('��@�6�2@1��CГ!�3W4�k�����V�h��X
ٹ>�o����2�2z�e'P�M{�=%B0H����$,�Rwg����Rw�n��\� �z����:�JFؿ����mO���)�K�&d���tz�@`���<`�U�!�Sq`*x^Sq@wMŁtl7�۔�~�ā�]Sq`*8/.p.>.d��'m���O�*6�ŏ]���A==�a�ۖB��lP��S���P�
��Z��9��RȌeף3��a*�R%�'V�:�b&']9ሔ�x�҇���B����Π>���ڼV잷/�)��t�T����-��q,���7���r�F�n���P05M5�e�p4ٔUǑ@8�%x�i���A1��Nc�p���#�˷���#���H*ŚEF�}��`�d�.�����c��-�`Lm�D�d�B���կO �>o����������!�!�@}��輫�[�5�����G}H���rf��������1%��������\�z�R��x����"M�%�*���G~x��}�T���7�Q�n�a~	�HKE;@j�v"R.2���'��vx��u�S�v5�Q�~A�<4��!D>	�+��얨�(�����4I��0{�^
���{՛�Y
�s��w���#5,�N�!�
B*���D�h��x�]��;����}��/9��RN@x���@W=�ą���`�H"��)���<��$j�c��	/?�&�����J߄W6'��ix�K������%�E#ϒIѭ�O	��פ}'���!�?����e���+^Ve�c�[��|�:Cvcף��"���&���u'x8yn����,=p�2�'l\@��"�YҸ�#c�g^��@YB�Q�O�W�.9��1}�gހ��	a���Z��M�6�.4��L���p�m�܉����,��@G����q��0��^ŕ���E�niׅ�����j��sa�4����D�&���6�n$D����͈'X3���lQQiQIӢ��E����b�e��n7:�au���jJ�8�G�X��:C�j<[��U�`�Ͼ�O�N�(��VG�QFo�␤��C�!�P��l� �"�PG%ZPg�J@�����W$�0Ӄa��OE��}�}Ă�%�[�d�FD��T�_\�gAɍ��g��'q+8#f����g�5+Sb��CC�����K$��1�<�Z����	E�bv�P�~�d�t$�Շ���{��ڑt9,�lF�� �1�4.(���� �5�Q�L\��hL< �Ҥ8���ƣ4�TaB��+I;�=嶱Z�af�"(�#��TZw�����r�@�7#�H}�yF�8|�̥:�8�A��m�Wp�ð�En(y0�2�Y�:���e�x�8����=U��!���țWX�V���J^c��C[e�\E���1�ǐ�����Gw뫵���f�Ԏ	��J�:9}�^�ڸ�A��a�W�J�jѬfө�Ѧ��S��)r�� $Gj�#��װ�����<���O5�~��l��;�)�����OQ��(��+�q����A��%�qN�R��"��i\������a�{"M=v#�f��~ٛ��Ls�'�9�x�3^~�~�⅏G����9��A0N��?�Y<t��U���P�����6ۉ��P��L����dF���h 	2�^���|�"�z܈�x�r:�X����T���:����f���)��Qo�������F�O��Z]��=�in���Ur�t�� Z�*h��p���ōެ=,��U���i���#uþ����eV�D��e�]����gXPQ-h6ϵ6)A�#���*io��1�KG���lt�A=�	�@�۵�v=��@������	O}�d�����I�v����H�W+��9ek��q|v/�O��2 5�b�T���1ؚ�m
��Bݯ�������zuP��g������,�\������{M�E�@%h���f��mo�3��?�ձg�Z��u�e�#�ĩ�����v4����w�!��.�B�*m�I�"[]o���1��a��=���L�L�
g��`�2 ���	�U�|g���l@NwW%�������oW{a����A�ʇ�[d�;D:۵�|��nt��4��&�cɝC�9t�� C!X���zD��;��V=玬��xqt�g����C�����z��f�(�GūɃCU��	]���*4���D17�s
�ë��~
��b*��Ss��z��K��3H��sLR����t��t�v������jk�;������Z=�}��f�fQX�p��\g���A����k�O'u���F
�p��<H��A�!�Ktųg^���lCܤ�ˇ�K��!��Ԗ���+SJA�V
��\��t<�Gs3��*�O;M�	�x�x͌�߉�B��]����q���rx�3�-M<�q����L<���'n<��D��U(�c��@ۂ��L� y��'<>{�m�צ�vԳ�H��"�1�У�7R�|��7�\@�E�@p(����
�=@>\0�N��ﵴbx�u���)���o��.�=��M�U��:ޕ���V�-h����A�|�&�a(`�	��R� �zd�4-G'�Fp��Ɏ�J�=^�ݰ�3���L��u�U}$�� �'����h�Q��9�t���#&3��L��+���Wx��G(����ؙ;ty�cc����#�i�zڟ�D�׹Ief9� '�҅�V<J�>y��}�kU}%�r��Ym���ѻ4|If��O"���h����˅��ݝ��ߏ��z��~��Z�%dH\�p���t����~^����=�><�C�1X�O���C�{���?d�If�!z&�˵O"��;l�����~Pgd��l�3­=L�F[`!}���(����\߆>��w%ӣz��rN����l��f�x�A���e��T"ZCy
����f�&�����3��{��p�J��e��P�j��%1Lͦ��Š\]�Z���ruu��I�X/��dz��8^��UL�+<��7��v�\�l�m���q�A�K�3A�)����G��}E�,�||f?}��������w��Z��.It�B��C�OS@#��3�5	�
)���yW���>%����y|�F�ҩ�2T��j\�.A�e�<��FI1uP��
N2�*īx�GU��l�Z�R�����c��,O�d������0��-�'�+�Ak1��QM(
nЋ���:i�_����!���0��#�{�
j��fĜZ�֯��v����v׈<%t�TIE�q��PL<YP�*ZMD�
�bl�'vw�E��ږ�Z�9`��P�E�ʊ�eXx���K���b�#���J'8~���\*�\!C�()�)�}��D��G+�E.�%U��+xHF��e%e��n%��N�E(�Nd3�Mo��+ �<� ��5\^.Y�X�m���R����p-�Es����J.LW���³��YW���T"��3���˰�aPȫ e��?�W��\���m}.���������Myt�d"�c#_��Ο�V�X!�A�`��V�ui��Bsj�P�Xb�Qnc��+9r��|����+��MJ�%�M��<4�����K�-�F�wc28�@�K�f�Wl���v�����x\�X}���w�~�ʲ��
b��P~�[lY��Z�5����
�N
s��2�/��Ks���2�ʗ�s��<�;b�(̯��+��e�D��h6�r�g�R
v~�mXP?*//+Ew�71��Z�*������V��1Gaw�W�@�Q�������":�F�D��a�x�ꗨ(Lf~�^��
+��>?k�U<@P�
��Lq	�]?&���т��l�������(�
mi7�yz��
� ۴@�4���"��D��$�8Fտ��	�3��=�D�'�ji5;������17ہ,��ϱ�
^��p���qľ��fz��"-�9U����O�B�T)�r�{�y8Q
���l�(�����y��va���F��@�Y���W1e�4m�&m�7�zAp)�
���[0�Q"����cc��Vu5�e�
��Q��J.w�;Юt?�~ʓbx��b�Q�˪�
�
+�
+�
_�먎�A�PCq�X��8I?�O�言.^���$*��?�e���T�by�����\�˰Vɹ6Z)��֊Ԧ�лR�^6�����V�!t��X�ё0��0�ՌhSp��*��e̥9�d����p)���^�ra�B!:�j<�Ӿ8_�޸qr�\\�b�GI��Z�+�zk�^��j��׻�Oo-���aM���tjA��`���?W\U
R�nT��)-����5��SZ����\Wa���.����-%�{@*���.��(G��]����
�>��(�0�e_'���?a����?���9s�q�ޒ� ly��߿�������@?2��L"�%�YY��@���Ky�s�C7����ǣ/F(���O-l�'�茙����`f܍,Pi���c�"�պ���`�7"�h�7j��Nj�?�>�l�˩:A�%�5?}�.�d�.���c�0�ͷ`�?�}F����3���>��}B0ܧYf�ࠠ7��0=ƀ/(�-O�����wg��V�Ϭ��M�4�6X&�E�M"��:��	��9�E�~6�փԅP8�ҵ <��2˹�iӆ|X^�jE:�nT��%��~�X+��.��%�=�h�%�,t湼sщӒ���1�{Ӹx٭Xr�
�Py���	uw
�KK��ÉS�^������}�8?��އsH�I������m��ii�uw��,w�-1dU���˰�6Y��0��>���	c�=�@}2�ou:0{�*�5	6LZA.�у:�a6Z����PJ:����·��vO�kz&r��G��/Or�?a���-c�8�v�z��y
�� U7����+>���cd�Ld
�
�TG�"&�l�^@�38��qH\�q?�Zi��b	�w�D����#4s�B^	p:x���J���l��c������-�I�<	��jo���� q�҅.��R���7�M��,=����9��]���@O��P,e�y�Ud��gB*(�P�S��E/՜C�f����ht(���.�%�v�9������
�B��oH�<�!��غ ��B}����@�����(�+��l�6c��m���޸t��4�֭ۋ��+�r��W`B��
���_*��)�2�a��ӡ�[pi��1 3�;�M�K@��'~ԠNsw��f[���[\��6UJ���9h�����i7:r��𜭑t}��0m�R�4t��.5^V�}q��G�L����V���x��
z��O�r/�6�4�w-h��s��% 嬔��hrr>s��Ya N������)ua�f�&���C��rjՙ���PR��*�$�*��!�.��>զ`�阢���s�.瘳ez�����K�	����ӆ�\FI�X����^�)�O�-������55�P�b)�%q0Rx%J��.��g"돦_�?��RY�<�K�AtⰍ����{��
��N����z���2��������0��*�Qи|�+��f�U��/��4'hhe(�a�;`�7;�#)�l����|�ڪ�Hy~�ʜ�ɰ%h�,��
Wl��s����b
�B��G���56g�خ�#QE����K8�5��?�Y�{����n�B]�$������W*7n�8#��U_�t5��V��Eȝ���:��~Q����=�Vlj%=�䩭�w�l�@z�T"+ 5<���|�y�ǭ�W��Œ�&�Z_n軌��<�(�M<Ga��d�Q�1�s�!�@.��4j/��!���9�i��?�����>y
d��f��5x��#�t�Q�j��i�_�UoB�nz�- �R�cb�f0�j`L^�o��9c,��oR��4�ll`�ì��$��> P��~�x�_0���=f�{�����׏�Rv����Kr���
�>B�P�y�(<������·_���ݻh����kh���Wxn���&h��Di'�m��?��F�e�/�F����B`l�i�y�$Q�����CѲ=ԗggn��Ly�(�ٳ'���1�Fk{6/H�i}�ڒ���,� \�|���	��n�� �
+��,8f�S�����/�S��`��=����-G�!�߇��]���W(��M:�ܹ׺lP-�@d���5$|�W�;+t���
k�/;�M>������I�#���L��+�)�`���N��� ���+���n�P�|_���[z�L݅��RRs�F1&��z�[̰�H�Q����![4��}=��;���䏿_�z
�!��7�<G͝��Y��v �Z���)�|RJc'$剱LL�b>w��E)d��%�����.3?�c�|��As
����!z <���is�?��8�-���u��e��u�ݦyYj!�F����R ���Vl6�GS����<K�n��&�;�$2� e���{����O�v:N�:(���i��(f�[�`qG���Ö���EAO�,�1SLy�c�IU&&�!�T:ݤ.g��s0io�[q�����;P.���o�T���@Vy
�N�`�\ލE��.	צ�b�P�\2��H6"vB�g �פ�`����l�������T��1�MNr�h��,\��3��!�_,��~lu�նb�
�-��Y*����䣊K�G�!�����H/X��g�V������s�m���n���F����rv�}���W�N��'����0>��&B�_
!����H������͐:9DE[����9�^� �0р��QMŤI͈~a��5"�'�h�����1� ��H
�>�B߆?�4����{��{�%���1�
����{�6�����j`����� n�b��^�E^��T9�oԬ^./1���43�IYT4�\���Xo�q�����=arO��Z]�8�in���Ur��#�S宥S7�:����ћ��f�����`8f�=Q�� �R�Xj��:���v�38�ȯ:�4̘XzS�{�}�1m=�����#eX�*�6��.��*��e�5 �JR��}г�nɚq���Y9��d��RX�9�,��S��g�EǳQ���l9zVk-�"�`����L�@��0�6v*�<�'z��)�I�=�.YV,�o{�^�5����Z48 ��U\���Q�ؾT�ˠ��W�l`�`�:4a��nx%Cc�1Zf�~sV,�����vWݬ�Y�\������8�_�A�5�0'�Oޢ��r�/�w6�mwb���j�l�gp_���eJ6�������."O/��j��N���՞G(�&���R�+r�S�>-W��8C�m��:>��gM8C��T&n���3�1�ܛQb�`u���b;#������39)�*ƼK]P�V�j��LJ4�!�?�6F�R�E�d+���Z]���q�s�
mb��E��߅M������yvX9z�r�e�P��6�OG=بn7¡2�R����hU7�3��~�N�v�?�p
�+�>�Zoh�;jl����
l�P3��05�`=��v�����꾤D�;��� ��>����瓲^$�˝}��;�g��@4���viޡp�t���v��jN�.Q*��H�Ե��XZu�Uch���#���+G�K\�zE#�Lu.4?�X�6�I�I��`��7z�V��.��*�cWlkU��Tb�E��i�J�]q8Q�w6��'�4g��5���u��ԢJ��c�4�W�QT{��t��ɹ8
��R<T~WI�R�w��+� _��hTx;1��f[�*���ѿX}]yO�x>_��/����s�\1<kk��=o�	ԩ%^��$����p�s�f�w/�d��ĳT������OEJ���ES�}���C��]��4�@�Z�1t��L�Ҽ������4�&lG��їh��8�J��4�T�����sTm���Hfz��5J�� O���j���ta��mL��4�:��,Wd��0��Ak���ߟC/[e��OX��;�.�ڎ<� S٨��J�)��64���&Y�f�=2���fN��m:e�tҭH(���ܬ���[@Avd��6i`��=|y��C,�7�*}I���0���{�b���#̄ �|�E88.�����\������y$�%�4D$��	;���vn�Fʀ�� �ez�Ѡ-������lz���썯�i7�VL]RNiv$��B��!.�������X�Ԟ���~�?���#
)���srO����8WX��~@���U���U¾!L���	���k�7�;F{yF{�F������zGgff�⾒*���4��1�x*���5�I��d��p��՞�,cӍgs�N�[m�
6��ݫ._�� ��2���z�<�C�B��^�JI\p�y����5E�����Ս�v�*�sdV�<��a�#��>�ʿ
����8&���.ҟ��'�L���w�[)QZݑkC�{�<[�!	���Q@�{7ъA'UD�@��Kv�*f�s�4��k�IE�+�e,�:��^R� `��:7_j=&�Q_
V�F��b��C}u^�qk$�B8��=��w|u�o�j�V)/�Z���uu^�e���x��N��
?>�K�MLb��ng\ex :W/�Ze��u��I�<��0�T6�Y��~^ɧ��l�U��ʹ�hTҺL/a�7���z�K�B���"�/b�)�CVYmxt�A��e�hX�EÊQ44���0��8^�j����^]����WL��� {қ8�-ԇ��A�ӫ�7�x���M�X0��G�U���a"��%_�{�I�r:mXJ�H]�@X$<�
��4w�xgCC�G\#��Jα�Ax��_���qm�)RB{���}�Ҧ�0ToTkan���GQz���y3��*9F���U�֩'	���G��1r��а���1Seү�·hU��[IF������ﰧy:�ۣ���<JJ���0]şLJR;��jP-@QDf2�J������܂5.�ص�j[����$�:˂�8��;ê�Za�@�m�T��x޷;77�շ�\/"���5u��
��g�X-�vC�59bv��T�5����N-��_��o�������4D [2'����f� ��
��b�QrX�A���0�Lczy�/�4��-��<]
A	u~|t�(!�3
�;��η��	C���y$�:�3ZSr{���8�wF_�/Oh��t@�fJ1g�}D׀^�rM"�Js�����p�1���6v���f%=�t�ᣉ�P:-Y\�q��B�.��/A��ۣO��S��5ژ4O�b���%�D/��~Юv�a��mu�`�{�&�KBO���0�l�� �z��$�.	I9��H��/��+�i�m
ѝ+>5�xd�cb9�Mz��3�r��k>Iv8d������ `G�l�V�}Y�	��]�s�����\��+�^Vh�S)��;|0mxiWo46��No��lt�1�j�f��
��f�u��a,�Y��f�ms�g�8���w���g�������bU�#[�ʃ�0"�2��n�	�F6	���*�I#'��Ѹ���L=������������d��ăo>��Y�d�H�}�����ġ/�tw�3��=gr��Q���gx��ߝ7���
|�)W0�"h$�P����e��% ���A�r�OksX��3��w��#�DE�Ooc���^��wi�k�{�Koɪ��6ܒ���8RRgwQD��W)A���s���8��0v��Fԣ�y�3M�E��N?���K��nΖo/W;dW���z��*<5��R�I�r���(�_��݉� ��Ԯ��KM�X9�,Ufhr���J!UX��C\^��)xX��G���:ty%B�X�W�u���¤������_9yR/<_6UYƦR�`&"ʗ��<`~:z��{��1<_��b���}����Ed��3MT�~��K�����;ݮ���ވ�U��h�a�E����"�|B90�ƒ2ɳ�e�ȄqN[eIqE��F5W;��H��&�7
�W#�%�����P}�Hx�g�1FI��S��xc��i� o�d�Y����

��G�~�cW��!>ȍ;�\[�#$�K�5z�H���2|`�R3}Z��Q����ܜ����n������x?�sŌ��0~�A�T&����H~��S���tY����=c��p�|y.	�nF���-}�8 NЛ��b���#`��L�3�F&�AA;�|�8C�X:sx�<Q.H�)�?R�X�g�kL�7�9G=�)��l<�	��'���R)ړ�?��(��`����:�u��d���F���nnTN��C�3j-���d�eVN/����L������݉eC�HW�ʘ�&M��h�N̥p�r<z��D��L3��G�a�j ����� MՐ��C
	,!�����3<��`YA ߍ͎��{&f���ls�K奥���75#7�ȉ��?Hn�/��q�A�Q�Ӥ)+x�� ��	6P��)�3|S��hؿ�g��.?֏�OY��p��_�
z�f]���M�'~���ba��ʔ�34���$�^mm�^�����{͙���<������wۛ��=��~�l��aE�Dr��og�_1/
��j��I�9X������X�e��R�ǩ��S�<�eg��2�>�7e��yp�̣���?0?��<X�0L���0��B��,�������Ҕ%�7���e�_<�P�揘A��|���"}� 9���������l�P�)ߘvX�<$��5Nt�����r+#�wv2D�<X.�qK+2�n�4��ץg��\\�T�NNI}S3Z��oO�e��Yi\�>ă@�ۣ���OS���y��$&X>�ZN9=�A�2xD��Md|�|���	s�����N��l=�j�@5��Qʿ����15y��'���03�؎O9����Z��Q(唯��)kGt�#�)wg�&	x���};��e��S�=v���ET����J�Z�2Q|��<����vc3q6Vvo-��0Vi�m	�s��r�-'����S�d���p�o]�r�G�1M��HZ�ܡkئ<!����
̔4\�p��Z�s�����?*�au�R�X~:ŧ��kp�嘇U
$j'��?��
?bA����
��q���F�����G����Q��r�D�!�;4S�pM}��� �_�mw��k�ߎ�|x�����6��WNN=�M5�{t9�q9J"l��N�?j^���Z�h^�G�cPdL�r�G�JV�2�)w�;�S�h�'1@SN�pM9������3�*�����*ȝ>7��X��N��)0O"�X���ٔ<z^Hh�D�:��\�6�����o`������K�⭫ooU[��Ta��)}C�?   ���}{sו���)Z�f:�Q�,˱w�Xcɓl�X�&� {�W�A�4���[�dkf类55[�o"ű�q��Q�� ��l>s�ݷ��P��� �q��s�����p�����_w�\���Mo�������a2+(d7�tM�7X1��T}�5�9�Й��9�T5~��|��;C?����ęQ����&(�k��uV�8+�K��?~4}hz=�q�$<���&w�N�����7e���^�=�9�\��L��Te�s��3-Os̤��p�#g}ڌ���U��0~
D�1<��9���J��i�r;N�huӴ�a��짧��9�N6U����VaK�	��E�+<�����B��0 ���Λ��A/x'�zwb��wz�:K�	��+m�xN7v�����jo���g�+h�
������0����32FZ	`ppC�Ce��2i?l��~b>8�-[W�u�:�+����%ci�P�M퐍�;ͺ����!Ma�!N��6�c��?��vn��G|)aY]�ZV�d�.�P�ǟ���?����Q/��_��������8)ߞq��Q4-�ܟ������~о
˸7������j�5�l�Ĳ4`:M�� ����y���>�B�Z=��k?m?���P�
�i��vȦ
�8i�Lo�z�($H>�F+V�p�����6U��B���a�7%o��ة{��;����KF�03��'��=P5�.a
���&x�w�_�6y,lٟ����a�
���O=��s4)r�n�V�ڻC��kQ�pG����tI_�
��vX�G��rS�@Y8D�&�z0ÿ�~�0�o�S�}�$����:��:U��0�"m�t���^���Q������a[ :6y��(��tY��ު�zA�5�;�����q���\��;I��D�M$M�V�<�̻�NH�ad�F�ЁXH��v������s���U(��CAE�AO�3�z�Tk�W\���jۍz�RuzaǙӻ�Iy'�t&],�'��'������0��cz�R7R-�^o��:��Si�S��(\��_�]�,8\� �	���`<�u<�9��Y2�n&t�n����e���p?'�:k������CGc�i�̠w�f~�Mr͹]��9ܜ��������^�nѽ�ԘNr��?�)c� z��)���5�6����]<��@j^#�����-/~l�(�v�؂9G���Fʹ.90�9�,��ᡏ�5JA��RpD��v@�7�v\(yl���.뾡�ͬ
�Ic��1�{�c0� �Rs2�%&��ZiS�>0�`�ëäz�s��GF%r�d۔��PN��.х��e=y��������ÿ��s���r�;����Q;��\t��>���5ѭ�ջՁ;��!O��!�kt�
s�^���3%=�U�]�N���9�]&�%�֨n��8�\��k��_��������麳�͙��f�B�JJ�ӢI�g}�(T�u��?e���o��~�U)�=����P��q�8�>���Nf�:S��Ԧ�1G��SL6���uq�{�>�>?g*�t6�,�H�Yb��^+�Z���ժo�vZOW�J�8g�aBKy�L�y��+i(_���/�y�T/�"?Mϕ���T�gN�#��,?��'��MC:�NP��=�'���K���f�ް*�#�|�]�_A;a���m���/��}�$R��V[�+������Dnyw��2@�>?ߖ���U������P{Q���̿�ai(�a�'\%����
|vΈ�7���B`.��zA����l�g�¶��,��*��_�,3��
fv��.Ml��+�y���C�g�+a�x<z���������.����pv0/���m�
��V7�����vc�;&+�J:��M�_:a+�P�@�4%$t���cG��
�^�̵����c�
��Bo̔N�\��%q)�C6�Q���o}
1KΙ�", �$�ԕ����4��'	_��}�����m����fVr__��{����Ӊ����{����< ?iE~"�ʆL�������.�ȃ��G�H
�T�Z�-�\Z����=r�~S���FX�X9U d��&68���l/[����љ�M�*n��h:������5A�4�B�wF��(��Ƴ�˾Ks:�r¶���͟`���^�t��-m�pdv6�k��]b6��@���n&5;,�uzX7�|W���>�-�C^t�p�������i��o��LF>+ ��gxXT���Kz�SXǪTvK�����/�R~���Ɯ�v��-�=��K4
�.��XJҿ7Xv�T.���~��0��<5�{QžZ��EHK�v��1n��+\X�D�^��cU؛��5�0���� pu�;1�G�5��*���t��,�tY[K2��d�07&�
g�י�����#�uW"�Q����U�����s�k�d�à"�}� �%p E\ay8�(5�b۷��N�'	n������L���A��2��$��m,�9[*�$O�Y�%�{�SA�[X�L���'�!ͫ�|uc@����f�Ǟ���?��L�(�C���g:�l�?�!�ѝ�ڳ�C��b;hT:n����Gq������q����7�'A</���^`PCN,X[FB	(�$��`tHA�$us������(l����j���>&
i�Ep�dJ[��s��&��"Ŵ�%��P���x?
JPq/��0W��ԅԕ�>�V�NXrd�ܹ'"	 ������_X��7���\�+ܑ<�d������p�^�
j�)rT8q�o=�@V�H.��h݂v��'��@xPU�lg���ݘ�,���,����XD�;��9���^�����K3�><�^�"_u0|;Y]�fL��Mi�(n��~ۏ�����m�����W�^��3�R-��#�N���t�� �(b;ꓪ��9���(���R�$����kk/���ڎ
�1Q�3,5��� ��W�յu֐}}%˪z͂�x��"(X��.h�T9
t�eY����#K芩��Fn�ip�?���� �e���Ȗ
tD�s�%�t���g9�@�C&���:�K���<�B��� �c�>�0�]�X(�}u+��F�xsy� �1G1�텣��]��������k�k�..77.4.6VW���V�s�^���ۨ6����F�]]��/�;-�@�Fm��{nq�a���V�U̗�xڥ���'֭P�ř��Z�4%�Jt�s�-ak�#Dnj�������GE��$%���.�pVU���y�<�_��-�hG��G�
�� 4�{U|l��	<�G�ӂOt��7���@ic�^a�X�x�G#���ơ���k��ɔA�����퍵?�A���Gզ�Fk��A��'2e,���CN�}BHʽx�����;����Q�vJ�!��]v��:z~\'T��g�"��vIó�w�q&���
�|�]���9�wu�u�Q2]���Y]%R,���L; �niU�\r��܄����ܭ6���}�{F����~�#Bv)~���;��tڢ���ŗ(%��>�K�!�Ɉ�,�����^�Ö��a��h/IU����aV�iw��5Mak���)���%�l��ۯ�����趰]��Gp�`��.�T����6DOU�b�����5�
qZ@�ڃ����(
{�E��퇿�%�J0m����B�߾�3�X��
6�����lb�˽��B�
0Үf�[Yp�\
F�Xa48��ZQ�ik��GX}�/�ߨ�R��;|'��W��v��X�K��l��J��1��������*���;F�дlt��Q9�07�P����慅��iL���N��Bj�P<?���Zq�`��K�!{���M~w�����=e�D�⚲
d�"ܽVO��wt����e�%k�U�h��Fv�JI�[��V���H8�vj���b/K	v����^�,��PpΠV��#�S}��sZ��X�-YL��&+��s�5hn�g�� $܆2/���D���am�0ʔ��JG���X���=j�k {t�w��h`�`�E�{��_?�H�Z;�R*N)Զe��J5
+^���	��
���ž*���$䛷�yqK'QZ�O_�X�����z��+���w�8�
ӂ�UʩJ��T�Z�o�[m���*�n��n�{��t.�@���6c��3;C�ew C�U��xcXb�s�a|��0SA�T��a���
�
P;���ɵ�޾v�I�:��&O��U]}�� ��{0�����O觛��d3��P�`/�O]*���ϙ��2����M$�s�����6�M�~<�1<\�g�zhnj�-�����hR�x|=P��ۺU��
�, ��1&*��.A^I�z��Tn�>�J$�֥�dVS���F\Y�lj�r
L+\�c��+ws���5hMqIm~4�h��4����'̞WX�M^cS�C�$�YY�V��y�LZ1SH�(6X\OZ��m�Wڮ�`%[��{�f������$#���ͮ����nU��j���\���[R {�������!����a*٬�|��Y+�e���&&����-�J���8�8�G��H�J���x5\�Wڽ���r�2��/ބ-'*|�[˸F��"�k���*h�g�I��PJmP�b�����~|V^R@��D_|�3�拲F5L����1+�gIZ�.���sH� lY���/x4�#�"c9Jo`�]�XͭtWӌ�Bƺ6�W'�("�k{-?j�⤍L"����S�:\W�_z��2��=SP����pi
�u�
��U9�JL�����\7�J�CNY�OtH�r#sP+
h1���$蹦�?3	2/6L?6W�<���:h�.�$&��(��P�&�7�r��ɋ��
3����/�� 7�\��h*OJ�9I*�Q7��b5e��+�Z���3���H��e��l�T��7���R��
2�혷�z��|K.Ny��3ov����i���e��ع=��%�������/��F.�M��2o,�|�e��	�k~|,d�u��R_��t�et������rvh˔�aJ�#�&(&���(���nx����AwDt���!(y���my+vWC	���y��u����`���BN�x�����
��C�J	G�~��X��h���tj�I����H�/�Ҕ(�6��.U�|P�R����Mrs�yET:��7��~�����T����9ܦD�K�����e�J=��@��d��cҁ"�ː����F��5y�[��~���5P�_�`�rO-����R��Yɜ|���RO)ZwZ�_%r'�Ľ(UR����y�B�.���\�mQ�D�8��uN�tO��ɴ�<(���]���#�b.ya�{��v�ȹ�?=�A��E%�p��N�x�vL;���
��Y��P$׼��1m�]�H�B��Sܣ�*8C�CN�BF;<����=ᚤ��>�9���C~U�%�f�`����=�G9	�ե�
8��˗��>�Ry�[�2��XtGmv�%���n�O�+f$!W�)K��Q��X��03=:�����yfU�``�L��'��<���?m�s�,,6���9��n=�@ܲlG�E*u�;�r��[~�t�CKr
�ўJK�4ė��-��2��JN��{n��&RuaUDV)�&�UIRRyl�轘�SͼE���f�M
���Mc��� ����x����H�4c���q���/O�AgIC�i���*���܀0B�DdD�2,u�9OoFA��W��1bs�������kzs(�4�NN��ML�%������}��2������<R>�5�C�������HT��r�`�7~��J�A��8Ot�
�+^��F�`�)CZ�(�FD��n�W(�b�({a�]`L`�����]����������H�}������C�SJ�/"�1�`�fH�+ԁ;o���<k�_
�N?�ZN�����Z.0%ú
���y�x}�D
���(/|.�nS|  �̰�~Zf!�↌+���P�cD��6���:�瀎F��8�F�,������_�p�r��;�?P�N����!է���_�W! �R|)���	����� ����c}s�(�U^��H�54��Hb0���۠���C��2��X)��(�� ��X�/����K�>�y�
����7	�0�����4Ig���s�D{�~��D��k�;�b ��k�q+t������%�#]�rH��4+���g��r��O�����q���So�>�_��3^�`Q#m��VX
s�˞��ZJ���3�O]���LM>�E�NQ�s%fx�^�QՓ�)9�}�a�n4T������!�jP�k�gs%�k��� F���s��RƑ�2ȴ�c|����|Q����B��l�"�\R6WtH��U��Md�u\&QeK��	&b�x����G~�$
	%f��*Y���d�#���66n�(�ޞa��u��A�^���4��G]3'K
�uBW]�D]��?�����Ε�j4��?�p=��U3��"͛�Z
v�飅�*,Οt����Y�40T����@k����6�4�5Ij�����.-�m�gǋ����j��M���q�I�
�zE�)�����i�c$�P����+���DC��fn�Lί�
d+*��z@�1���_����x��� Om�m7��;yG���joø�ϪT­{��29������&�C��т�8Q1G��g/Iw��j�d��5�\w�!L��f]���8��_�.7�Э��?�?�l���5���+����Tj�N��sj�=9���Fi14�A9��4VL��`���m����T6�jO��Ə���'r����|��^Zg�8���|�i�z�+�2����8���tJdew�|��z�'��U�N�zD��h���Y�����>�8�ӈ<߱�j����6�=�z㚇?<�S.���甏����@J��٥�v�����O�/��?cz�L	�sH�/��?]����w?�D�SH�/��<�t���琲��H����K�/�)ͿD�~ɧL��_>տd��Dϒ	�_���r��sJ��{�����"�����3%�ϖ�?��9� ̳`e ��(��㘣�NS�mP��T��
�Ou����VLW#P�J���(#�N���%5�^1��m�U)8QS�%v1( �
6�9�Z���XO�Jk^��g#�^�������9J���T=ZL��<-�fAm۪� ���_�L�Hr��=�n_�-@���(l��&����>`���ğ�oX��a�fϰ�v;�~a��6s�IS�&�1�W�)������6}ǰS�搼R����/��W��f��Yۂ9Y�� C�=C?���
̮G8�����9eBN�T�� ��O��˽�x�Y���~������k���\�J��Fkt�>_3w�*��k�_�sm�tY*�$��8���c1<��[����,r��/���
�c�4'�<�֗�dW��=��;j�Nu_"�^�:W�s�*����G���k�����e��+�Occ{��;L�L�\� λ��<�b��\ј�kY�J����h���v��e%����-���kn	DebR�Z�ͥ�ڟB;5Gkb�-��D3��e�M�Zm��j�j�6�k3�X����k[�R����j�5���n�q�e����̆Ǵ�辎x̡K=�ut������u���sp���_�/�~jw�c&���������}[��A,�c����1k��L���1E�bqL٫Xe�ɴ���1kcq̓��{ͻ��8��W�&�8��="��]"��)�}���)%M�t���pc��P��8Z\H�F���D���z9q�-.�ka��=hqea���]oĬ�äZ�J?>���A�	Ro���qS�y`������=-'W���KN�mE�&�]�t�O����E+����G:���t����S߆y�t�j\�9�&��A;�/4��Ws�W��I;l�q� ���i)3�;�"���m8��l��caS��N.~E�[*���m0�W£��E}�Aq�Mg�K��'9��DX;,�VMʼvJ�RN�r��yo��1���Οؙ�e|���f��%�3y�ل����ex�\�ȵ��R�J��7�a���;��7~<#�[�59Sܬ#�Mq��8SܲGYŭ�$�)ng���o��ƙ>S��ܸMi�H�d6����5��B��
<�iU6_`!�AblJ�� -����T^�T�#X�0��U��_^�wY�2|[I���]�'N#����,� kɞ�/F�lϒ�p�ۇ�S)O�Ίn��8������4�HX�6����)��vQ��������~�B"��9��g(����O���i�	je9�[�_�'̜*W*�C����Ϯ�9X=]P�|V�eڨs���~P�t�47H�i*���B*g
�X>��j�y�z6����!��d(��v�g��:T+*�@/�-je�ӓ�Xlp]�9�@m*JE?-D�L�����8��I�\��I��˨�|9���zZ`BHƭ�/p�P˼�~i%C,�6.w�����A�潵?8Ln���W�A4Rۙ9��~��*Cм-��)�狡4��zA{L��e-��bW�f^�6��&zt��Ѯ2�vUj����z�j��Ԫ�������t�
�p�։\L�V��E������`F�c-��zO���o� p�?~�O�_P�#����w	
��ǯ�g��Ik�s�[�U��5�u��N��,i����o��.��k��,�sq�^��ZU�JO�������#� �t�a��l1;`�j[ep�3ky�vE�wfG}'�)����&�`���@jܐN_3��� G
1�"P��ڈ(��|��@fky���k7^�}�+�p�ʊm]���鲢k��r��rw�+K�����U�{���vWg�P�٨8O�	���Ƒ`��S����E���I�>j�V�����e~El �L�F���$�� TkC/c7�+m�^`.P/�Ģ��Gt[��1��]o�q�5b�z]���}0)���˂ҡ��{�b�0������t#�(>9�ӧ�Θx�����#�	ʪ�����n�!���F<%�0������m\����=l�=�1I����	�c`0�~p�3�
��w%�V�D�^�-�vʦ��֐���a.�̇��� ¹�t���7pQ�;�c�k��o�=�����B� ����K���k`��r�t2���5�K�9�븞���� ޯ�+r��!Є]@�\K�8�6=ש�Ǖ%�v{�^�6]Eށ�i������&��ɂK�l#/\�Hk���q}�Rh��W�0��)�7ܩ���l�N��G�ˆ[��b���SY���Z>�g�.��R��e"�_�t�c:�N����o���KF��8	���㙛ɣ�79�7~vCIQ�u��J��4Ղga1k��s�j��q5�n���Q4W_�Լ>'��[Jw���:�+䚩{ɻ@	?��z0,z��Ƈ0�6Z�~��S5;����fI�R�Y��f��`�l1͙S`
�B�,�&�6D�4�|A�u��aXOʌ�Y�+I\P �S�%��4|�tQ���;XK�>�`^�J���ô�C�ݟW��-X�(������3m�Y�r�f�΍�@���?�`�w�֘?����Vn���|l*
&��?��ՙcRn��4:�Bƒ������\ݘ{�b��х�8�3U��|sz��&�Y��Ê�;��gFzag�k��
�{a+����+-*�|�#f�0؛���mK=IuM�j�ib�]B�2�|^�u�s��?�{���SB�g*�xK�!���
Y�'���yP�J*I]����yv�k��s�sǶ�_�����W�T<�߃�'���H?;�p-�r�C�2q�4&�|�,ya�.�}���:��������:EE��ǌԦ�Y
u���t�-�d�u�	�<B��ѧ*�,o!�
G�%�U�T�8G��,QBf5�R�N��@M�������W��J�	��1e	��ҫ4�:͸RS����U&�����Ns���w���2bV�*�����zA;��{\��f�#�)q��Q*C�La��  �4N}6�w݇����~*@0;rӿ��mC�GyE����w�vFU�Q|�*�JP_�ʟ�
���I��_��V���J�玴���oC��{T<����Y�k����/�m�(��$��2��.-��GJz��j)�����N��<��!v�z�5������)�]_B��bq�e���^⪮�4w��ߦ���ْW�)��Jw�N�z�ig�!7�W��!vt\n�`dD>kO_�5�І�_�+eo�q ;+Z����%�KUv����*�w�,q�^�༖}n��2��˵�>��I����P/9��^�v�:Y<��q��@-<�|[���N���[�v(R����-�i+��/{؛ת�R]�K�a����<��+%=�?�4�\'�����b�w��
]X��+�]IƓ
��^
�W}&����+3�C�:E&���D�G���"�r��y8�-���ɾ�o�c؂���O�[
�U8YqsS%%,���X�Hu�D����kAt�6UAfμ5<����{T����ܺ����( ��ȣ}�/|�ok	�j��/��r�O�����V2Ux��B2l�!$���7у~Cу��3T	�'fm�3Cȯ���Y�T��UV��e�F
t����tJP̖[�Y�k)V�v�N��Y�����������Rs��R���������ޞ�`�u	�,P���$x=�Vd�Pn�"��0�v�&h���oŴ�^[ �5al�}Ђ�ÿ*n�wG����*��W��u�8�ڰ3Ԍ�z�b����Š�)������& ��;�ߏN>P�v(9��K��!���ra7g8��Aw�]��}w�� ��-zU﯂h�r`�:���"N*��it��K/븶�YgA�α�6�M� &��<��c���� �:�@ 8 ��:�N߮g͕*�nEq��0�~YA���PX��b¦�x� �I��CX$JӬcG��ǿ��;�`������aU�[C?��
b���%:^�A.������<#6R
4Z!t�GZ�e�Wy���}L�t���:Lz��-�h�Z��pQ�|�����F�E����{�f��0�`SI��:�.\�虦]�}�5F���ƿ���t��tq+
�L!� X8��o�������mo�����o� ����=�
D}	��6^:�E�@E�߯�Q��L���5��y��8QWA�Qyk}�w���T�r�Y�C��wX�޴<0�i�)	����M�U�-͓�c�%�V�u1=ºIρ�ׁm(���41�
՜q	�G�����P,傟�?f��`���c�%�S���
<䷀_>��31�.���z�������;]��}aZ��<���%�-\�%\�
����Z��^i��4�� ���Sq��w��7>K���H421?V��g��{�9o�`�}�:�r�F��ˬ:�\}BD�`�y�U(?�׎�;"�?�4�ܸ�L��˄c�N���Ri��K�s�[
u��/�%~%��VOdZ��s�;^��Z������T�
v�}?F�  w��A%8(��ty���ԫ�oc��QkZ���o�B��`�2�2���Lw�����0j��W8^�Pɬ�_@���|��z-h��ۊG�lK^���D߅��8�lh4BϓT�M���!��U}�$޴p1b+�*Q���?���;��$����@��]?�_
�]��u���0fK��,�a��֦^� �H�f�&Z$-�>K6�T�2�Bgޏ�bza_�H_׹�%t��.�ˠ	h���	�ƹ�^���%��'��:���>���@��V@�@Ҽ�CPq�%M��8�W�m.%w��T�x3ly��R~�t��Hz$A�U�ޞT��R+�{cF*�Q��$��t���(I����}������a�>�z\�YS���
ls��z0D�Ý{~���8�����F��K��0�_h	��%��4
������(_<�C.����셝���%��2x�K1�TuTJ�]vE+q��a(jnF��~�.�4�c!�ۊe����(�%[�	|��=��7��ȅ�>@�$/�3�p��Q � h������U��Ŏ�.
 $s�}����%m��s�L�ƿ�yU�IɾCw���"^cAwQ���3��=RZ#�E�V��g�J�ҧ�Pܔ�NGR����d�x��
�P��|���WQ�W��W��eX��Ӱa����O�{j�h�%|�~�_x����	��x����1y���h�c��9�������#�vy�7���99Z��B��#��/~��ar��
K.ǟ�#�mջ�t�]��H	�<�s�9e5\�X��N$,r�����,+��P^�m��phF�˲���`�0ȋU[�+}��}w��ȱB�U)�,Y��C��L�i�kԓ\P����nֳP����ݻ�+����M�ә��|Ci
�V��;��Z���!�,�{S�-��������y4J�ˠԃ��b��o�ؙ��}3�ڤjSr���N^!
7��ق���9c`V��f9-[�)�@k��T���Q7�].�3�� '	�3IUݒҜ:k$�!�wý��%�U���
܉����F^�����X�r�5C�OC�ּ�����I���k�RXl	@a���`��^i_����d�6��I�ز�x� j��� Xx��QO���l�\,Âٲ˶���,EC���g�J+�'�����e�X��bkëF�}�=��<k35hc��V�N
�,{� 
ބ�HX��q$L��ߝC��~�M\�a��*�.M�.<)���6	鲆b
va^Z�9�q�����)�i��]PAN�e0���_��h^�?�ۣSZ���7����h�i/�-+� �j��������N̒C�5��a	-�60h�L4�1_m�a�1�"�,;ո��An���-��Ù�:dN�"�����F�GW��*O�(�{�j	�3����ufl&nO�q�f[���=n0RX��,~�٧���Ft�+։����P��62�`����Ng���Ra��_6�r:Q�vSc���s�UV�&�u_6V�T��qF$3
�*F�"��n\R1=:��T���Gv�D���t��r��\V�O՗� lck�9<r��U�1���M��t��o�6�2SbN�4�m��3�S���Q=�-������(�[���&����5&����ూA�Om�{Nu�v�Yz�S��SI�ְh�6�hv2���dQ��.����m$�������:��L�bT'm^��>�/�QkmY�.�f��x����z�p����+���_�߷&oR�at�/�+�;�}�����2F����e����ZU���?������@��72��_�Vs2E�ݤߛ��4�HN�Kku�5�g%$+�%T�|����F�Ue���\!�[eȔCb��72T���9w ff]�u�����[�W;~;pAy�^ÿ�63O���n��ц7:2����ʘN�`K���#��%�Ïzr�����b�I��$�ۺ_O� Z�e�X��鞤!Y�Bo�3;��`(���+�6鶫ҏ�8bs*�Z�H�5�dؔPq����o+�7)������<5��c�Q�]��]��2����<�F�)�����oJ�� ��'�ct�J-��@j.U���
�p�b���e`�ދa<,UĈ遊ڢB�<�Qc��/Ǐ&o���/&oR�_��Dş}��r�����־	(ıFҹJҭN��,#�V۽��. �>&���P��;���K��g ���G��l�~�)�z��j�$��D]���A�?莨0�������	��o�_�P`��c|���X\�kt�z�}L����?���݋�d���r��(�F��_��{���7��_�6=��]I�.P�^$�͵v/��5[ck&ʄd�%h���+XӲԍ�ѝ:�J�/����N����W�r��e���S�%c$y��.Q�T�Hq������`�ce���S��.³%�������8k�R�q�b��"[�^�*�Z���=�A�q��]4kM:�K��E)4
�~��7�AȻmè�3��T��'�.\
aO��\�ݹ���t�Y�)���t�����ZM��y�2i&,&`�L�݅E�&�oj���Y'5��&�����RA�Ӏ
t��E^A�YYXP�
EK����7+����	nq�,\�z�7��V�k�CI�K<�ӻբ�yi�	s.)np�D��A7 H���L�`��xF�n���A[hդD�������q�
����"}QeF+�9@����R',!���H�hg~���%O�.��mJ�L�0��
T���#�I�K	e���hP�
�����Fz��:7���>�F�:vq��&����ŁD��q�ijĪ��0獒��j�>0D�FWb��8��<z�?�������QV���j�&OxßGU�`4@Z�'�3'����sWh�*v0Au�:όF7X3�iiA��T�a��Ckͥ�9QI��#�V��Ǟ�O�2[O*��]Z莢r��_���9��7�ˢkĩ��n\��L������Ĵ�A�Eb8�+���vPyt�r���O��G�� ���9��y%4Ѳ��]J��nu���uN�^��k�+�<��K�$k%pcݶ1d$��C�
�D�A�F7z}؆Ɉ/׶�갽s�v�w�����~F�'�X4fL*S]׉ �6Ǫ���$L����&,�S�R�͐��"��8�����2��Kk�	+a���ד�B�����M� �&]z�K2o��&7���lU>��?�y��@��L�n���"���s���K5��M9%�y
Jp)����m��ͩ*���j�Px�4ޜ�+<V���^����k�wW��x�+9}�F�M�Raͥ�[(��L	>S�ϔ�3%�p�3%X�8Uu���M�ML�Ih���Rh~�M�pV���"������i�2�<�tRq�3�ʫ)ZKD�~���#:�k�E�-|����%E' j�$A���@�9��ͤ�D�Q�~��_�D�O]��h���kjQ�؉%v_�=�n�Ti��U�X��aQ�)㹬�q��m������%םFp��C�m�;��������6/��hW�w���ݢ�Ϩ_%�"J*H�n�>>h�4�n���uXǠD?��,��s�N�ϠWKú$������g^�{�A;fb~|-� ��	�e[zb�����.p+�U^߿�a�K����ڃEg�(�f
��~8JQ�<���5�v�"�UxN�7�deo��F%_T;�ٶ
�\�f�����b��ð��m��2�(0�|��N����u��7�A/����5P���q,��<Q,(0� f���t@�`��������DAw�M�z���W������A-`	87�����	x?D���N�w�b�z{��Ww|��LK�?��"���>h���4�3�A��*�h4������j��{���W��G�+4� >�Ѝ{>0Ĭ(Q��� �����`!~�l�a�&�Ŕ�8s�,�w��	�J�Op=L�vΙF�̅��/�u�E��a9&3�aU�[OjQ��#�|8@r���%��/�U���@���֊��ӳ(	��j�=��zIM��9X�z4TH���ʨ����Q���a-�M{�tA�Fԥ�{! ~�Vh��roI����c�B����y/��ݮj��e�V�Q�Xe����+�h�V?���G���互s6u�>��n�:4�Mn��X�?S�Tx�v�	�V�HV��Oc�{a��S"�pK�(7]7��W5L���NG���{�N�3�#S���}�~���c�=��zM�3nx������-�� ?�ybѹ����n��
3�5�7k���6��������+/J�Pa�\k�J�v�x]�A5��T�"���^�n�Α�8Ċ�\��b�o7kkQ���4Vk�՗��եfc�^���ˊ_˴'O2iE@6�SrH��J��,��s���sG�N.d��5ߝ�]���G
Q��2��$+N���
�G0a*�^,�#O��`����8���QV}n���^�a���̀c�6�t�X�1�>�%�9����5^h�)�i e�s�6�v�\��#X>r�%��H a��/�Jݴ���d���ٍ�
�MĿ�R�6�2�{�9Q���<Л�-�	�Z�a��&o���ɨ�+�aQe�]�Y�s^�̌P7�� ��7�j������ǂ�a
�a������=ķ�
��0�������LX����z�#�E��9��P��P�Pl!]u�]<̱\�I��0�Oz6uU�ʤgRF�j#螯,�FȞZ�֛��}�6� ?:���%|E�ߏw���^1�D�/���M����h��+`_箋uQ�.�ò|H̓�H���wS���#T�& {��fHbL`�-U���K��
u�f=]Z���bޛڊ(dU2�>�c����x��Qؿ[M�Ap��M��[/���q�d�Ag����RBK��tlŞ���驍n��/H@�l��U �H��?~���<������{��������ExdD�`MM��>�����%���Z��ǿ��IA�E���9H��Ou~@'�I��P~�Ǣ+�o��.ɵ���}��O�Z�}\���p1����F���j�]��J�����gl�ΐ���v��8���[/��@�jS��VFH����t�XC��H �$Bm�T�Ah���yp%5QNM�Dv�3����{J��g����`%w����
.�F��Ob3��,�Nf���r�#��QH�U�D�Z�Į��x6
P"b�c�0����oK��ST���}��!@�A��o�.6���`�F���.�I����W�:�epZwH0��@���	
�(P�
�:�]Y���ψ�q��$�X2dz��f���KT-u��C��e����
t8-�����5:�<YBfe������i�3ֿI�X�%1��JD.�ѩ�? ���Nǋ�7��V��K)����B�T���+����ܒ.P���D�
ꗿ��j���Pv�[�/yr]z���n:y����9�7C��*�Qz��q�a.s����Ks;]�"�������G��O=��)|��-�{�j�o�+V�C3�|uՆ�#��G�*�O��o����p��p�8H�{o&��e�����[i{�M�#Ł�?�w5�(b��'/m��N�&m��N�b7�E���6#rd��B���%p�V36i�����擇G�o~����{����j5W�֎h��ϐ9[��ڲ�+B[<W��av��Ӓ֥�#d�?�z)���nޙO�O'0{ 'H��e��jN���J
�r1�Y�tK��Jo�{WvyC�
ۛ�Gl�wj��/=:[�g��sy����u�l��?�n��������U�~)R)����a�r��ģ��� ����O���-������k��QdL$��5��n�l��T^P��M�N�p��F�h����t�x���*)��Ë��ā��{�N�O�3}�ُ�G�,�7�<���W�!&j/�^Sc3�����@�_iߌ�B`��O�@�,b�yÔ�{)��T��m/���4I�n�՗�W���� �W�@����Ҩz�|0��x������Zq������gV�E�g���a�.U�(`�e�� �\K�S%����x�:���c���R?&,�P�+�X]`�H�6E�t����֪�|;t`��B�nۊ]��Z��2
gLH�k�`�9BY��gD���m��'�L�#c򵠗 Sܼ6,"��Q!{��H��n����4�4�:�Q�� j3��M����sq(����(�=t]|�F��%��(~8�*�)>��Ө�b�!�d�6������!{8�4c�!���f�;��d0<��X@��.���
�%�1V6n���5ْO�l�]0�?�E��b�Զ��Н2^�1�?DO�
�t֐5��՜�jKV
0��{�x�����2$_���|yy��k(���3�c��Y`�Q<Pj�,�c��S�=ҙ�ϭ𮰱H������/��L/�Er�#�|�z?yځ�>�+��:��(��t	C�Xƫ|��n�4���Y_��`����n�T��ZЩ�"�]�0䩍>gj���>w�x#�ԝ[����ˎ�k��͗GNw&�ڥs�%�� 
s�?Tl���cLo�a�2�u���T�y�6��g&�&�N�zv�,��[�s�
����H̊<_��f����5��E���ڧ����癵�Â~I��)?�ּR0^��h��t�� E~����cԟ~O���R��#���W�t�r,)�E��#����J������],Q<kw
�X0_ad��)ݻ��	{-a�5} ���+nHZ���2_��b�a ;9|'�/}�?< ��a'�/[/߾q���֥���2�H���������g�fְ��Y!0"�{��r����v}�p����?l�nw��>��R쎃>�r)�ԃc�(b��|�p ���C�
�^��)�[������h�߫��+�-&7�K�
*�5���<^D����^�9�'yZE�sK^�ޤ��5Cgs��%���w�,;G��ML:;�^t8��5�C�: a�BT!�9�t�GD-d�xi���"�`!%$���S*\��A�Yj��k;�܄͉2��(D��B�\�Zq�($7�bB��^{g��z��$���!~Q�䀓;�Н���g��b]J|������{a?���W��f��4J�Ӭ���4*^��q��|Ӡ����V�Ǝ�4]i�����sz%�p�����Sw
� U�s�u�g�6C<�E��L���&��r
)$o�|�Gp��K|IbKFN�X�}>m�G,y�)Z���j�����m$�K�(2^�����  ���]mo�6�+j��v+��yk�vـb���4��m�Y��/��Ū�/�_���>�d�fwG�<R�ݮÀ"�H�x���=<�#�q����n����v���Y���0��5JM�	Շ��������겶�!Ew����G��ˣB}='/�/�c�S��	�Yɚ��o]��'��~[��r.��,��Y��Ew�T\?]�1d���O�f����v!��t;w%HwR��0W� � F�(�{�hE�5���G}b�2�L}k^����v�������R�~.�u��O��;�_L�&��	��E���
*��S��j�zY]Їbq�H-m�P`Z餅_֑ꙻ�ٽ�.b���Y�(����A9@Q�6���aV�ϗex�9Y��L&��uK��^��^I���u�������~��u����aS>!��m�_��WԵg�t>��4���U~us�n�tU)��J���-@�^�3p�I9��͋u�����J蛻�}��*��B�
{�@&�5
�Ԃ�.�^�w|��ѻF��ˊ-n�L3l��N\U�נ����T�WF�7�Ǉ?��2_٨��[8U�Lb_/FI�B|HDz�@3.��ǏG"��s⭖�9W?a�06��<�#7���2d!$B��Ó#J�t*��y��_��	|!�'�r��y��DLÌYH���_J'��ʫ�U�rF�b4�}��^a���Ug�R�jT!�P7�HP?���؛yś��f���ޤ�J?#��haږ�_��wD`N'���6.�3h�AԲ�"�(�-�SPyt�rfH��2aG��I[D��Q�)��T2�
��D�������N
�o����¬�!M�=�
��k�˓�nuX�j�oK�T��K8g"r�tz� �㨠B�[���V�����+�Fa��ɤ�j�Blm��gq^+��ÂJ��wMh*�nAE�o��aW�ZF����Rz��EϿ,��%H�]�f�87��3�h��a�'��ëd���T;Qu��;����t��;�Bݿ1{	��R=����ud���R1�,YR�g���a�/��7�3>�ހ 8��S��L��=5"%7*�Z<��q�!���Ԅ�T��C��+IL����?b2'�H� ��f�P-L�[8(��d��������L�� nt�I�a�sH��\_��oQ�T�"��N-�DJE�LE���g�v�I�lҗ*v��;��
�j�ǵ/���y������t  ��	���'�;�I�T���Y��DW��Ǐhl�T!�7�(�(����F
w�R盛�o�`$�t�tk8�K�n���xإ�_-b%��B%K�Y	ᲤY��6��W� 8|�^x#b��fK�;أ@�����9�4�۾W?@���byp梈\����\����S�.��.�u�A�N�5qJ�[P�V�`��ߦC�	j�b>>[/�ދ�:�H���}�O��$�p���}�c�����N��e3 ��x����ʴfm��~
�g�G�1w$����uz��T|�a헩����"����j�V6��$o*���4�)DݠBąLToX�)�\;����$���Qغl�B�4���3W,r+�a���Jm�$+D�4ޡ�������Z�6 ��\��hX���6n��*��3�0Ͻ�uӞ�P���4��o��:bpFՌ���`m{9��N@$��R햷d9�V��X�x1V�뫹!�[�4�Ƅ)V��1}�F^�[1�pk��/,���T!Q�   �� �O