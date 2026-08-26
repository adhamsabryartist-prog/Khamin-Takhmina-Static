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
import { getSupabaseClient } from "./services/supabaseClient";
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
  useEffect(() => {
    try {
      const supabase = getSupabaseClient();
      const checkAdmin = (email: string | null | undefined) => {
        if (!email) return;
        if (email.toLowerCase() === "adhamsabry.co@gmail.com") {
          setIsAdmin(true);
          setAdminEmail(email);
          localStorage.setItem("khamin_is_admin", "true");
          localStorage.setItem("khamin_admin_email", email);
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          checkAdmin(session.user.email);
        }
      }).catch((e) => console.error("Supabase session error:", e));

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          checkAdmin(session.user.email);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (e) {
      console.error("Supabase auth init error:", e);
    }
  }, []);
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
                        className={`px-3 py-2 rounded-xl font-black text-sm transition-all shadow-md flex items-center gap-1 ${(keys || 0) < 100 || hasProPackage ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-accent-orange hover:bg-orange-600 text-white active:scale-95"}`}
                      >
                        {hasProPackage
                          ? "مفعلة"
                          : (keys || 0) < 100 &x��}ksWv���WXmNIIVD{iٚѮ_ei&SQTRhmh��)�C�*���hf+���J%5�(=lY�ck�� �o�v~s���}5R��v�"�����{�y?���|��\f����9w���Xb��R�Ϳ~��0ŵ�s���s��p��Vc'Xm�hrm�lrw�IM������(�K�?9���Ⱦ_H�ٝ�{kg���	ُ�e��
{��L��f�nD=�:k���ҹ$7+V�\������4�V^g�K3�����
����fT�S�0pF���Ӡ���_2v��Y٥�{]����.���m�o��CX�h3����ƚm� �����v��F��4Z-��î�m�����_q�����5F����(p��y�����~�@ۍ
�ܾyWܚr�r��n
�u�_v���5�g��e�,4����oF.kD������z��߈���B �#w;jl������������-k}x;m�F �D��>�����ᠦ[^���O��&7Ɵ���������3��W���M|����2rl8 �܋�l5�@I�G
G���_� 
��Q�I�Fdˀ�>ˍk.Gg o�t � (_��%����[�F�	.��(�������s�	m��~���� NG�z�]7����j��xî�v�PI듑8s2����{��+�u��=g���on� ��:�=pxe _<1I
��^4tð�����2KHeڹCT��p ���
�j����A^ǽ�Ɵ7'7
;�c���b��cDX��[�}7����@kMn�T����������o����)�� ����w�[�яƟ��*�||�#��)6�I�̠��W���H��u/�Z�C�:�A������۽���	�Y0�-�s��9�v�qLJ�AI���J*�" �}D�;�O��:��#Fs�x���D��JP)�pQë s��>����0�Y�g^譡\�3��#��?�%`˭��3���ް+xW��Z3�6�h^,�J������r�
@�S��ޥ�GLfj�G�s���|��
Q>�����O�U*qF�k��f&�����>d��?�s�tr
�-
hl�Y�^����0��p�5���`�@�~'(��|6~��| �ܙ�b�O������To�[ |grs/0�~��Ҋ,�5b)mڈ3����j#�dQ�x?cf�:behL�N��CzT��*3���^%+����
B�/�$��v� �u����]�OS������12���I�z%�0.��t���<�P1��&�c����4�<��m�i�iX ��\�d:���^ɇ'�>·Y�F�y��C��"���
�a�M,���^q���p�g��]���O�����c�EO҃y�d:����!���_��e>�U/�9�Z�j g�M����hoP��n� �#��?
�ÿ���'���/�[���zG�~%�<�76�n��
۩ SPa�黰��kG��]Zhb���Wrk7�Q3 �8A����v����\'Gy�:�F��vA-��M�"�O��Kt�m��?F2r6�G�pBJC�����3j,�J�Z�(r�E[\T'�[^�O]/X����7�s~���i0R%O-:�<9A^�<
��ќ�[,����Ov\$�b\6/���(Ps9d���@1o���#��.~+!\��d�J�hsF�K��j�Ug�v��� u�>�����^��Z�/Ki$=�4ھ������ƚSo���.0���=��m��G|(��C�˘&E���1``�,�VK��I�:MD���ص��珶��.����lF>���A���
P�~�	$�}rTҧ�"cf����Ln��g :}��
�9y� ��rtf�'m���vP���c�K��P_�g������!	�G74g�����J\��rGtq7���6�Kւ�FIB�����TS[������j.�^��o��]�P� �d {؊��p������M���V8�[��|T�`M 
�m�축���x:�G}�6Ĕ�������T�������p�p��8��_���!��<.}7��p�����4 
Y{�	���#��0 �C�hB7�Lr�x ߁V@�񗈻de�����A��pM,n������삳�t��0wp�8���M�N�d�H����s�7��;僀v��3ǩτ7�Pha�Y���+�؁�]l����J�-3v՝N?Z���e�P~���3�⛰�Yv��:p�w��mD���䨡T"��£�5~����n��x�~�D����Y�}���r�;��D����� b}�Ɵ�+������ �᷷���]�Ѿ�S��N�(BQ������	,��  ��ؤ+?�ɑ����s9h�S4����C�}��R��χ� �Zy��Iwu��n1�v���á����8����F&�߲���[2L��("�}O=��A������]ǥ�O��p�����	F��x1��v�}���t���up��:��#�yB=��I�bN�����\ΏQ
��w����3��	f�5g?tx
vW��*�R� �'N<�3Q�#�:�	� 1��ȗJd'1��Y�U*.ˀ%�]�Q���B���=� �7�{C�aR�u�tPK�yF��`�������o�j�ŷ����8���o�K!������˩��l.1X��]�o�Q��������J�6���-��I[�!2�	�#F�i�g�<gIF�:eO��3�"b�9�?�&~����H�L)Ҩ�v�4�COW�\/�5�Љ���~�P�}��)X
g�#�E܆8�}.T��#��� s� "g����(�����Q3c��rƣ��^��䶀p���oRM��a�;C�����a��8.�-��a-h�E����:�O�"����E0���8�8i�{k�y�=X��)��9ky
>��g1 �"+���'�^�@�L��(�Ѩ��E|�����?
ӂ����O,�����7(
�����bf����fvr��=wص� x'��w��v˭�]�D+G�\�����P��'�7�Ք��x�h��6+d��y0H�פ������)/����	P�o�#*���
7"�[}{4�^_a-���{���8�	��G�_j�Ί�O�Z`���"��F""����ܝ'�ڍ�f?�鏋"Fcς�FI�"�����z�.�S�6O*y�KP@6�qc�c��Q��8�$��?B��Z�UR�\�VZ�4�n
��l@:���'������q#<��p����%L2��2��X�J4	��� �^�͠Os�ْ���4�_��
�%��q�"q�c�&N��8�o.Ŷ�[�8�&GB,>m��%����dN�@�?hw��M�7�Jcv����@wQ e�d�m}=6�=&#���l|�ВӰ���Gs���tv���3zд����Z�;��
E���IF��%@�:��� mp,I��u��fH{_�s#�P�I1*c��i�T��Y?��dm+|e|r�p�[�w�H�qw1��N6�D���q��-��΋�h̟ܝ	��+�Fv
S���]o����O��W�@	�r.Y���z�@-���+��HB��߳&RK/�R	H9�W ��
"S�d����V{�T@
dAk����Z ڨ��>�p6�bQ�܌����NJ�e΄N��<g%NTmxAh��;S�hϾFW�-mZ�Ѧ�W�i#.vST��̒<-��)�z��\�J\s(��hv#Gx�A�[�C����"��s�|�#�����dM�U9j{�n��m,ѹ��*������b�d�=��IU.����i�%p��<�(I�)�sQ���m�n��~�}���0ߌ� �x�k��Nx�:&����k�)y=���,W��t7�O���DK���@e��+N�� 1�u��:�Z�d@ja�4Kp���'��R��V�M�g�����nF;���/a�MuT��|�/J�_ �P�'�J�d)E�GJ��1_ �P��b|E�'��,�c�yc�B���|���C��Pc�?!j,�@��P�f���JԸ��5 C�������&pG"�B��b���������aL�q��~:�>�Z����D5rW���Y|߷?Fi��]���C�S^��κN��U�����'H�7�{-���\�?r�)�fX�C�dE!5��8t/�W��Ƭ�>��ݏ�r$U:�U9D�,X� �r䂧�T
mte��Ui�*�8r既������T��<I�.�����rYs���*B�(�G`��rC�E]
�K6&��� T�T��5���A0؇Z#)�ː��ۡ�6>
�6�
`V��v�K��]�u�:a5����O�)~L�7k쪼 ���{�����^��K���=k��G���+ ��4W�4V��
����Bq�H����ɳ��¦�� �>�{i����ց�N&��h��)�����V�}��p �#��!og�0@"��� �a�@��n#���j��U��ʀw�w6"�F�S�3X���\�>ӥڂz�!N���ۥ�m����.��+�$aH�m���0��X��c-A���H���U���sxH�I(Ȃ�x6Ǻ��P����(Q9���^���L��+���*���GW#��	��ӡ���`�jz�YU�Q]�Q���u�!;3��S�dO��	GHJ�x]��Kϲ"Yٺ��Ő��-�~�
��b)�_�Qq�IW�o+u+{R{9 ��	4.�y2)sv�c�̀��̨g
�����iP�h���1�\nQ�,5Ua,�	�2���7��<G��I�E���|*�*�zý�\W�J��V/,g[�đ!���Pb�ҟ]��~�I.��e0�,�[h�u���3�� �ma�bH�b>D��o'�{1DAg���ԡ�&�a�?j�V�'7���� �Ymٜe��2��I&2��5!��q<*�نZ0]+J��Yi�-2�d(�Rm}�%�����)����J�������u~������׊WO�d� d�P.M�$9f��1�8!#Ȟ?t������p�w�q�:�k�!��D���7'��^�K!�P���¾�_X�Z��+'q�a^�+Rb�<�oĵ�)����ߒ<<Q0Sb�.f��P�{'tC%��zA|0U�^oI^YE��
�Q��k�x���_J�w9"��3��M�i5����?1�YW#EF��t��h�2ř=K�V5ݭ1m��қۣ�@ԋ�&���A,�>� b�����'�e�5�[��>9>x�S8�=`>��$��n/wݍ�Z١���A
����X���8%V��"��t�����^�:;/?�)Sm�Vd#���7p/�S�KkԼh���f�-��Bj���$p���{ s9��`�=�_z8��;Sb����̀��~ �,Ĥ���\�s����"����.u�J3�ȗݙ�������a�&E�+i��H��.b��԰"}pGA�'+ �R���fM;��5��&�&B@�8f��#6����.:ǝ�'�Ѝ��hd��8��V�£�����d{2����P�%�1�6),s����a+9����m1P�7/�rcCR��
��JT�8@Շ`�j'��"C3[�`h�<*};�����3�!ǒ-��
�[��(�V ���7�3��>�Lʘ{'��[��}&�$_{���UP��'Iw��&Y����ϺQD���h��RhŰ�x��e�1FK�B�$�Dx4�#/xh�;�΀1g���ƀ������z1�8)^j�%:�����-b�%�Z�V2�0���م2�t�m_,2����ש�ص\��=vē�d�^����r�3����E�>Rj��p_h坶�߯�c�z�VA�J8��&�ÏD���;(K�R�o"�K�}�����u���(��|�`���H)
κ]�]S���T�Ĕ�V������O�e��u������ل<�B���P�5۴�ɂN��s�C��|(+��	�t��Z߭�������Ԋ=J�L_Q8a=����M���5d���
҂\S�k���nf�I�g.t���s�?�E�D�̤��`s~>�v�o�ﯯ�����K���>eh�E���]r�oט��MnJP�t���Yx�c�O�3D�ɿcg���i�	�V1����PÑ.����m&H�R��й���~����uzmnp���nֳ�4��?��ny��f4>��Q=�U�ib�sX���Ҏ�u�K�NBօ����И&-�SC��-4�G�yQf9�J�l�tr=�Ӆp�~X{0:NeA|�>lw�S��<��	���T')���N�ʬ�}T#P�bܾ8pΗ��6AD<W�]�9ox1t;�]�x�ڜ�RȄ���j��2��]��gĘ���])Rk��=�`3U� $��̵�3V���N��Y;�`ӥv�z��`�ŻN��9�6 pAx��ڭ�:g�<#w��_��0@��a1Z[����I��V��e�����4Ԝq�&Vɇ1�P����cjxNF$��>U
�+��������(��
�?V@Y�7t-�V�{AH���爓I,Ṑ�p\3��Ŏ��`~B-��Q������ų�Ɲ��2^.����_����`aꊙJ�W�ӻ?����.��~��vWv��WL�.��?iR���+U���-FT��RQk�-�:��U���f�����5f�z��:Q����� O-3�b�CЖ	���+NPo4�8�ƚ4�6�.��uz \��Ȧ�}����/�f��[���+x�Yv����F^��u��	v��.m5p�:А#�n@6�u�؏�=w��]2q@F>�
ڌSH�A.n׺���y��7�nF�}ž�����"&㢑���z����?G���0T�����ػ�����>[?�tz	��ڦ=���(��VX�H#"��|�rt��
}��y��*��aF##"�.^��6�+�v����Ma��qڌ�~�,�sx��hsW����y�YZ���_��&�&�;M�G�3I���2����]/��5�bn������s�M>�N*�r�:�jC�x7��Bs���U�ͼ�h3R�A�3XMr�8�M �f$Tz�5��� �� ��6��:�1AC����� �����2������� N��=����fsw�4�W����W�����⣣Ǔ�⏎%w;��u,��xr����ג�^�?ZM>Z=t,���Վg�Sh�3h{�����:k
�N��:C�����o.�с
K�w��jZ�O~�y�!F�9C*���=T��e ;S�@օK������&�XQf5b��oa�����`�oQ�@������G{)n2�;W1����T�o9����΁:p�ߡ��݅e��5t��h~Ѐ8���YKm��k���Ԟe��)�=�VY̬�b�h
�H꾻�LD�o�۬���o�KD�/��RD�O�Ⱥp��(�$I�4��˖�ĩ�[_�*fl"JC%���A�z�ب���K}(��)���:5�8��N���x^���>�BI��g"��l�t����ǌ��D����t��4@�rr;���hn�E��e��}Oy�Fy�tm�b%��ZY{*�*�����_�#[]�;��X,�g�R���`.�<�\�n�7E5\.�6�*�)��r�f�z����ۨ�E?L�ָ��4KE�AWD�,Q�1�wET��iD���Ղ1Xd�����Smnn���P�?�����fi��~_���lٸ�ٯ�����vH(�
�'��R��ń���z�:��1
��"���[t�	��O���G�KсzK��:��F~5��>Hu���W؟!\�P�u��Y������p�ps�^GugNK_UK{Tt��C���Y�:�m�� ��F�	?�I���yF����V?�qK�g�t�9\}��ù�[r�>�2�����/��L��f0�YjO]��Ο���~|�ջ���x���׻�N��p�-<�G����2kfN��Y��ر��9i�n�WQ /d�bo����c�6�Z ��Z+������N�g��Kk���B��^��05���e���v�����*p
��(Mʗ�;TD"cqh��*��4��L�?�М�[R�R�3�A0�>L�zm���[ϐ��E��^����,B���u�'�PMä�TvS���7h��d✩�y&L8U8��e��%��'�|��$�4��L#�߁�������Rn�+����^�鶔&-�t�
/�{Je���ޯ=! ;�Þ�[���t�T�}�a�V4� ���TQ��;Q��.��ׄ�%��]�����6���^w��;W�T��QC�Yֹr�׮�m��B���Vrل�$��vtJz��{++*5
��������]��׽
�Ъtv}~U��:���wU๙uz�1��:M�1 �>�ӳ�#�^J���S�d�hVѺ�ۂP"�$H!	;�O�=$��M�q��e"by7����4'�㍜���%NM����h�.�k�\��ш���}# �[0DSZD�+2 2`�G1��\r�/`�, ��d��ل�(C�_ˇ2e�%&��z�J��ƴ�ubg���Yl�9�	��~}%!�z�#��|u�u�Ey�����@�W�xc�|��x�E��r&�GS ���$
 �" �-��*�6a�f�O�I��J~W�M�
N�?`|�(��jdQ:e*0�R�GI�j�{�2��*q(<��/�ZH�i����Ԍ��"k�;�V)+�pu�x|�ɨ!?��&��� ��Al�fqM�P�fU��R[2�Eń��6�����\�V]B���z۩�O�μPˌ��h� W�
1�q��+55
��j���
�˨�u�:_Af,]8,C��q[��i�)g����T��ȆӨÆ�؅�u�t1�F<�Vjv������lĽ�T�J���ζ��q���#UN���1*�J��М!9Fhc�a?�}���1
-��m�t3$C3L
�c�A�'1ĜY�������e���-Ƴe�6�����	Iu����HB���qX�4RFv
�Du#�e)���j,�Q�٦��B�Z�/�� �����!�Y���i@�6MDr{m�N��.d[��Ш��u7jpz�u)��
3�o�*(K�IAY,���^�7k���O�ߑs�>��7~������T�ʴ�;��\����
���h����s�?@�y[�޼�
wU�=��~?FmBu�
N��z��w�>u����]|k�ܪh��Dv6{n�_��X�{�-t�f�����_����\0E��y�Օ��̀��7�k}���t���!��i�*U��x�49:X�����L��W'��clF�ظ~�s��V^�d.8<y�d
�P�1�Y�����[�}%���]�kIE	nq�S6EK2���D�3�_���!�p~
�ް���a��g�f�I�����@���f3�@ͩ*�!~�.��XH��Sh[���d�;�H`-�R��g����ʀ&ӵy�bM&;��jԤ��Qm尃��j�rj�Rݙ��2����Zj{�mƌْ�P&q/�=��F�����f�0�w/q��1�W9׶x�,�#l[^�a�bSf�I�6��v3ۏ��5�����b:xΛ��Y��t����p���Zh�*b���^\��r�Q���Y ����U��LW�HY�-w���G�=_���4:�I���J�6"�(@����ªAa�pݽ׾���'��^9$h���,7��L��2�Y�Yq�<���TP���">?���$��O�Ϫ�^o�yχ]�:T�g
���"c(�o��+Za��Y�7�Rp�,�$-$DUXnh��)"C�Ea�p�(��5G����6�e��%�5G�A���$��#��I�5��ů5+��%�C�G@�8/O���AC/�Hc}����0�⷇�����l)n�����`iݗ�
_�����ˉ@�_��*�"�Y�X.5b�1.�R���y^��6Q�?l�T��i��_$z�����j�R߽�D�������������I�z�[�$(��W�g��'�r�<(�OC7��KDz��Q��X"K53��� 4�t�����n�at��Q���4M*/�m�=mJ�A^�E�kQ�����(=��	|�� �6���sm���$�@fpt�-���1���T�Q4�k�T�[x��f��|(����ku���k�2�R����A_��g(����ҠY�gz�9NGi}?{���g��J���m�T���ߏ~������BFd�Ϯo�����6��
�,�1d(�I�*A2�f&�&1�W9ؓ�:?���#\eM/�\>1~{�������0tI�K����g�/'X4H;S��p*�h���!w=\ߎ��h��/��M�hrc�C	�p��	58�+5M)�0rG0@���GԻJ�b_�Zntp�֩H���D��Ej�S7�s�f��i_�}��%��h'!�K��v��'!
���W������滛��y�6��N�6	�	�L�: ֙�̂y�S)��@s�x�,����������_r�ƾ��t���&�`��̊����Cd��Ol���UrRyC�=�2ָ"����Փ�
er��i��ܘEmn��1���|��<ز�
��aH��9L�\���)½�6�v,
�<+6?ڗB Z�Z���*Y��~v^����j��-O�S�i�����8ם�W�[��_�3b�Q�:�)=[iq���Ψ"Z��@^@�R�u����'��C&ި��~!ѫX�`!�`��j�x�<�"��g�U^@�3Oz���;L�d�{�L����
��������G�r/GE�Du�������+�L{q`����[]�_���@�e������X�3���D��<�%±:~@}�@��\��㧬��h��ꥱ����%Dr��]=�@ZEl��:��龣�K�U�s=�����D�fUR��Z)
zR k�޶4����^����j�]'��@�_���B��w�ūP�s/V�*�x?�d?�"�f;��*��u`��O�~|?eB�u���μX̵+�ըO��G���-�� �8�q�q[�.W$����*;��X=`��4nU�[���k�-�����&��p��c�e҅�?C]�{@�-�Od߲d�Y�����6͎OH��u:Vn�>�]�$����?Fe!}���WP����[|6�d��uJ!,�Mc�D��^������K�O��P:������*c�*�V� a�!�������
{!I�����kd��I��/w�2��i�f*���B!�R����/�ow���v���m��$A9�v����#�;��.�E�<�@���5�T�������gĆ��@����j[���zJ�P�'�Ƃ��Xc�����l�m�ݠ����vIpjc���,�#��}�מ���*��W�^���H�Xz@�,�E�bh��sivM��{%D�!ݸһ�
�;
g3����j Ri��_��r@ח�~�n��}�����a.���⦊�L�Z0
���d�H�^��P���
�OW�I��fj�j��O�v�=m,^�6/������}1f���]S�M����eqw%ƨ���sI�1*u�����r�:$8�L�C�l��C�\��a�������	b4y�P�"X�y?��?�~2ӗ!d{�=�[Vu���z����ʦX\���T� ��>hl|�/��Vm3x�Ā>��fo!�d��bTl�v6��.ts��,&:bצEL|�n1�{k�2�y7�����暑��sE#͚4�����x��4kL���z��� V]��r�����{��QHP��I|��i� ^x
2+Q��V��
�����u��3�2��vc���RE�����fȐ��7a]u�gi�BdH�/̥U�9�Uw�,%�W�Y"+ZXa�l�R��Au�^6��yQ(@���}EZ��~O��k˖S(l�%ѵ�PZ���ӌh\\�utN2�&q�eՉ�.N8s��Qy^"��u/T#�@�NT�C���o�?!������!t6`�K��X��5&%7ܽ�
�F����j�����.���+�����k�������ک&�lj�M����4�;�W�*�7��������G�^���/��\��^	�xU�1^�b78+� >���%��`ݳ{�(�Rv]S]@L���L�{xa�i��O3��t m�JL/<n�}7��
�����:��/ ?����%�se�«���^3����<�������{��Óf~o�xo��^.o�{~*7�Ma�����,���$�g��G��"Ƈ��ǆh�?F�d
f+e�"�*��	rL
|8�
=�΀\4����G5ء��=�24�`E�<T5�2�R?b���
?�fw�^H���?c �|7���g�v�T�����9Mc/�ԓ��ͫҌ*�mo���8P+�J� 2&?�Y��j���1f����y��m�f�|��҂gם��<�0��yC}�4VBH��C�f],�q��qf]nH���v�SmÍ.
YO�K�^(��D�Ult美��Q��Y-�bp�1�	S�}Z��� ��ђ�Ӭ�r1Gw�����&�+y{�)-c��~z^�� 6#3ƥ����H��S���\�>6��JMyu��]5Wt���*Ə'����5����`SIN�2>ϸ6��GA,��j
��6�dx'��̢�4hj��I��k� �z�9���,�����`�w��[,�SAV���T�Lԓ*n7%�Q�%%6�!B� ���˪v_��@�S>��7��[M�8e�b����1(u,�<
�B]�R����i�.��*%߈�ߌ�AF���n�r��zmyq=�D^PK�H��ܾ���[rm ]̈�a���<*�#��s.p�^��^�_�8���&��s��&w��_IX�����M.��$�Z��v._��8a�0��,X;�v����
{���]����h���~$�Yx}��\��
K��E�J��a)*��]"gyc:k�"T�fr��3�����3��D?��GIEJ)e�V��d4k�Y����	��92�A�]q:;1�m&�W�"���Z�1_う3.�N��:y�J��hθ4�')6��Ǫ����:���������w���@E���"B#�N�����[./ޒ�K6��Gr���sXf�̂@ �(]'���uT)"�[�}C(���!%���s�΁����`1(�:6Y��S-��B����l*'ה�}?i��� F��fZ|���SyLUdD�NL��"�V�Z�&kL������M���SD
�!Ys���I��J)��r&�FG����Jh�#('b-�	~�1��6���]M��J�I�z�5E2��]v�u� �q�5SH��4�msܐ}�Pms��
2����#Ő�t�
��j�44���D\�ͻ���
gY�v�N�ѳg�c�{�άo����[�I���`qZ�V\�U���j�u}
�����L�BRβ��f.�
[4#c�D�=��š ��a�;��ޒ1���n%���-��m�Ч�m_�k��s#�T�T�b�@�fN�佔���!�;��LM�{���J�v"v8HD�Ŵ�Ei�)R�go�����!�
�ܮ�t�L��\/�%�� �3����,�
w�'�BQ�*͵ErHQR�;F��o���9L'�S��J�}Y����#�@�I��Z�ȖG���6�d���T,���X&q��}�){�.yc�?���?B��θmxo/�#J'$/� �z��H��-�> X��][1�{4����uZθ�Y��[s�9���[�.� ��s^R�в����ޖ��F��j�jTU+<���ij��z�D�\%ʄ�JL.
ZV
���|��fx���N����Jt�`��Ԋ�|��V�vyrC���g�k	�VK���l�1��V��bJ�䏤n�������Zz�
�Yz�9	Nc�뺡b?u��;#��,�Ρw}��C�{&7(��ax������������i�%�PnPz�u�%�K������9�N�R�9{�]:%�r�C���V�N��q��\���f4���Y�t�u�7��lU@G��upI5��e����]�!uEbS��H|r�S��:s�k4����:V����K!��D���|*Ȫ��@Zߜ���~Ǉ�Oae��20��[t
�`T��lAR%\�}¶��<�;:+�y�l�9�BI��J
N|i��5���c�=A��K�^Fc�/Is��>r;�t�{C{�'Q��è����Te�"y�^����<N:&�ڛ�Uv3%Z����9�
M <=�藨)� ��>��2�z�S����?A���ɝ���F�Mn�%���
\L�|��b��pψ��=��5,��v�	{i�Q"�ż�PT9qO�lZ�"d�V&U??Rf�H�X8V.�$j?����B���*���*�������]֟a��B�X����f�B�@��_�e���5�v7|��~�nx!�n�[N�h��**����}Ic�9Y�h�Ө�Ԯ�a��+jj�牢���a���o'X�� ���A�O��nr #S_T?���S=�J ;�ZZ�Y��e��Ϡc��Di�_�n,�e���6���Kd�7�OV."V�d-�?T��'�St�*�@�<G���sf��f��M3[],�'ҋ!ᭉC��5Ԉܟ�g�eO�x2Z:���w�fn�_n[�8��k�"n�7���d����PG@}�X&�h�3FP��.��R�`�P��o�&f[���0b����N��\N`���l�.��~��[:}�~YL>Z>->:z<�+��Xrױc�G�]�⻎'w�?z-������գ�Gǒ��]�x�m1�v<���7O_�0��i
!�P��]gH�k����\2��S aJfz�1�àHn�SO��A8u�������P#��;�Nn4�M��Ȑ:h����
�ymY79m�����|o�A���zt��f��M�
Z�
���yl��ɗ�'�'�ӲV� P�4�5�=Z����F��İ�
����� ��&c�\эm���	R�Dׯ��������+6н��9<��N��\N����缿�G�a`����~��.�j���tr[d����>b��[X+I�c��hu���!P_L�Fz�����́x�
�l���)���!H��j�y��6k����ꠞ�vA�-K�n��㭌%���ɿ6&A�8��]�O��r���aM����[s���.���+�r���?�l�ǳ���ر�v�4�ډa�K���ͮ&G�g
�	Hl�H�IK/ˊT|�pNPn��g��ע&���������p��+�x�0_�~���SI�D��]zlO)<�p�SO���+�8�[������nW-�r�\�e��ښ�c>{��O��h��[RX��4�ʖ;�T���N�KKC��~҄ODUp-ٞ剅<��]
o��!��d���X�Qn���#������ҘM=��ǆ
/P�/)=��-&�.�
/g<&�W����I~��PNL�^6�`r�X�3�.��>O��Xɒ�p@��5���/$w��ޗV�¥2���.�_6��H����Vϭ~x6I�rx�\�J3���W�L�ڥ���R��s�b?(���xi���4xo���]X�׽�i��-ʪ��T�݁�rC��,5)�W��0��T���/�	G��%)���������ׂ�*��*
R�C@�� �;"~��-�G�_.�w��a��k^�3v�/X6������aVM��_�U��W��!M��T/I�t����z��kL�x��V�$BHG��n�j���O�u�������:nUc�[�( ̤��ּ�����}�;��#��h����g{�>��ý<���{� �/Zs�/�T#\�,��9ӭ�gm�l����U�S�U��E�"?�"��d����-Y��=8���
%0�n!�}b��J���06u��<@΍��ûb�v���Ғmj_+y}>@�X�q8cl;n��z=Z�nb�Ҍ9�iqJY���D������ci��"�`PyD8~�}������4 vü��?*�f�Y���BU"��Ԣ-&`ҵ�-q�0�Rل)��q������`�e8 \�3̮
����vO,a)+7��ɨH�JdJ^��@
��{T���H�ۭ1MH&�l�0Go~��hM_;0!�ŕL�cb�D�	0��4E�Vk0Y�0-�x���B���Y�ĉ���I��+���9۝yE��^J���I�*���_E�lP���&MI/�����n�o�TM(��	���+����~'15�VJ��iv��%�vS�����ݣ�C�u�y�D+�`ݍ:��3�~��y�e�ٌz�|:���q�f�s�u,iG/��v�X��.,��F!��#x�p8q�&��l��E^��͑�b��u��
P�#<c�X�exJk�PwȲI���_��"���R��K	o˭��ļ1IK�v� ))鎗����Zۋ�Qxb~~kk��q������̹m�5A!�)�KR�Uq�R��3S�5i���<aW�"��U͊�fEnw��^��=����sŅ}B��r�΂�)Y����Q�¥�]���Xu�g�c*�������~U�_%h�+r����1U�-��l�?\�
?\S3��7��+Z�E�b?Ez���W�(5��$�+T̓�EU�})A�a��`72�=�s3�����ZE9�d;�U��{�SK�T��.�Mna=�[0�/,��$�|��$vL���!V�P	A��c�z��-��6���:�D-eBJ�z��޴g�w!r(����x�2(B72�T�7�R�x��
��+���:��E���ʢ��� ^J,ѕ�D����+$�^v�^C��
j�����=�exM������3��`}cMA��z^��lU_�n��|��VS`����N
ԗc�0���⋃�Y��fߕ��2V,���
�m����'\V�',�D%*/�'����vq>�$Nh�����@�D��-�n��#Avh�*����%i��M�V�K͸E�VEU,e���
֬f�R���^_h�zK��?��
�ȉ�h�{*�.��=*:`i���'����3��A�� �wQ����'�����F�-���[�i������d�e|c^���s������qE�1B� �1=��̭~�*}@?�����z�R)��n�K!|�Um�e�U�������ѹc��x��V	عB�(������ �HO�V���<$����i*�@M�P]�t?N70>�e5Z^��w��<L��������@M���'�*���G���E>{���N��~��S�s霏��0|�Wl=������s�����8�������7���Xi[`��N��]���L����MӼ2���ȿ�N��.����AS��΋�����
d�.�$�`|:�����!�T0���G���T)�Bυ�[�
�.�a^��tr*Sm5Vs9�K��:��S}?t�k�$#ߡP�΀�O~5�5
��:����
�~�G/����EeM}5�<�:�v�4����zÍ7}ؼ�	����J=t�݆�N��d������'\e����)�O�I��6��Ra�Q�x�bN!�z�5���"i�-L*f!i�WfRp�䚯�X�]GDI�r�"���5�[���φ���9i�>�!������b��ڙ��^�Jt�Ri�Ā�T`O�G��v/�Y?�&�C�����\75�kV`���G�@Z�Ai��"`���nu
�H�
�)so�C=��Xp^��eLl����� 4�S�#�c\���"R�� ��,�CUݿ���F�*�R;H�I �R�ny�*�Mj+����\G��w䚔�2�[�S@� c6ǙT��㯰&�缍��W�|)���ؚ��;�V�Eb�t}�̥�!���鵺S}�p&g)HIC�,'��
i���6��� ���y��-���$��-�d�Om�آ����q	Y
)�	$ �����?�_kY���r;8�J���2�5}
�0B��o��>���(����`~����y�����9��)�je<��z%��
��׸r�C��/���+Iw$��'3#����'�5�o]�]�[����,���$�*�H'Y����<�N�t��w����kVLR�������ò��V�<�W��@�e{˔�x�m�U�yle݉3���������Q��P�/�F(�v A>;���9�Ǎh��mlΨ�Vn�T����_�0���ZW�f��>��MJ�^
���Z�9::>�j��8l��:�\?
ʓCu�~noin����sQ}lk�r,ʲ� �G�B9�/.�{�Iu�.	�|~i�}�o����5��:��-�](E��~0���A5C̒dlJ��O��:ŋ!�D�i�l�+�ND�彾��B�V�JLҊIg{��� $qP�ŤJ)γ��'"�^�I?1IWxA%1�AT�<v���a�t�|%0YLo�}�t��{���4�F���JO��!<�02��XSv�iĚ8n]�J���g���E�[,��}ƭN,9�_��At.�!�����/�r=��8yT�Z��ڕ�(US���W�GI-�������4%O)�����q:�4���t=f�3(�k}L�ŋLX��Lޡ���5��+J�K� ѵ�����.y65��� c6��B8�� ˼G�s���t]�K˄�$BJ]��JȌ}*HfE�R�\)�u�bV`�I���[��kF^��8;R���c�.Y�X��h]!�'+�Ks�3��d�O)���@OE�z���H��xCQ���@��^Z	�B9
�;]�D[�/�޺�%������ʈ8l�Dw4#��
N9��h�=<�n���Z�����}�n���ڜ:��LH���Ƣxx��8����ξ"����
���߭�.ä��E/���0�#��oSuN�B#\�9�8��"@3�	{k�t
�<��IM�a��H�'���o���F�R�%4�Jg�KfX�ʨV"C�o���ݘ��ĉ^�YS��ٗ��%
�k���JA��x��P���YZ������@�Q��)BT]���r���/\����4>I�*�zobo����$J��e,7�*R��ڨf��3c��A��D���@���&�2EiK�UH�d=��@++yx��s�퇌,�7� ����T5iHh:sy[>j嫙J�Z�� O�V��άaM[!5�� ����ru`Q�_P�yc4G���U�Dw��91�'��7B=*�!�?   ���}msǑ�_i!���-^H�^a
�6o%����i`c��is��� C�0%�����n��E\(V-)�EK�$������	W�U�]�o�U=�$�a3�]]]U��/Of�f���E����r��pU��
��\s7뷂�(J�v�[z?e�А��-p<������T/{�6���a,���j�W�VtI��A'
\1M*{��$��M���-mJ�یP�I�X�ɴ�C<��Sǧ��)�����~��+�#Z������{�ُ q��{��W�uP[[&�M�A�Q�F��o�01e)��j�V�l@�����[x�*�qw�����p!���v㿼��y��A�ŗ�ҥMR�69���T�kUS��YT�q_�
�˛��`�����������?�����>����ǋu,
r5/��,]0����*���k�����#[�(���,�|�NR�RMQ<�@P��<=e7$'Bߞ|r��4Ћ�_��ɲx�*.S\��k����MhG��0����:g�b�Qp3v�P	��!u�AX�reF%Q�;�8��i���1['�`���q0�0�S�r�����+��ڱ9�N�$�*��%)��`%pZ#�8�ٙ���T����a]����eo���?l�_6:=?9��Zy���Y�p�y
���>�T9��&�70"o���yAj�	٥�����aO�J��w��������S�����w���i�]o+�����O�ʞ4+�b�&�W������5|q;��q�_�ߤ��T���j�7���ş�#�+#����)��fD�r��}�i������j�)Y2ށ�jڤ.kbGzg���z�˝�l��߮.�7���
�����N�6��h��3�Ἑ�f���߷��u��+�������@�o�-M�S3+�V?�~���t��k�ஹ����T��٘G$B
*X+�v��*��
]M`Ld��\~+�qo}���I��6��[�r�n�sV����,�EX��V������{�r$_
�����%�jͻ�x�:����K+7]�]p�
<am.�����Ht��6d,"7��(�'����F�+�2=Ai��
թ#�<�%���h��֯��iZ}�[�{ l�,�f����>�w�u��R�ʪ��Z�0@��#-�_�0�\o<��-%�_�S���z�ݒ	e_#��c�c�1i�]�q�0�Y�L�^����,��W!��2���W���^����R�a8��
Uj-�M���{�!_x�O��� �
�4sOm����c{�Ԕ�S~�m��(d*:� 7cF ��j�q�Iݖ�t�)\���~�u������Y���\�F�9*;3M�F����m���*�_YV�{.���º �~��*vV/ז�	.7J,������9�6��b��t�l����4YO/�/��6J}8�饸�L>��Y���icy������j+��UWj@LzVWK�����R87a$��n�]�^v���4|Zº�x�
���U���Ģ���8���
����䟱F��˻���tu�4]$-ImsY��GX<�&��=�P���e��x���%T��;�Ea��g;o��d�e�4 �~+s�j����Eo���l�f3���u�MY�U�
y�� ˝��?d���-��
Y�Z�Y��5��	��9����X��5n�m�qm�hE�P�9SuF�n�k{�u;�RH�`��3��B,1��ҘZA��g"�l��Շ���Yz� �ܢ���FF
�.������{���������O��	Ǜ\oq�\�2F<�܉Ӎ	9��!��y"�� �f(,���y@&2W,��ݏir	4�����Z�F���I���I�?����Qf���
��Ҥ-"��&
�ք"~�|6��,�f�J�Z��&<�]�Ց9-GM��7B�M�Dɣ�c'�x��	���X��L:N$on�"U�>����9��ye�c�����\�`��!>��9>�Z�ʷ9Ym�Ka��l�Ꝫ��aN�"���|>�L�N>��
���>���Ѿ��R�g��>���C�M�{�	�r\V��<��үf#M]���w��Y'^8_�]9��t_�����C%7��mV4"i��U����
�������Wv�bw���ӊK_�<����G`q�+g��D��c�`��h���xA��H�;mzW�vTl0P������>L�8�A.`j9�G��S4��4,Y�7�� f6��<5�~�p9K�>�4?ͅ˗�
v	�@�Ȑ�1v~���V������7�q�q#إ�;��{��dv{*��=�E�����>d�H��٪�?bZY'�����<
c��Y)0���H�o��h8�nH�0=IL86���7/�?߄����
�NH��M���ӵ)���6DL��=�w~�$�%&������^'�:�v#�ފp��ag`#�f`#���t�[i�X�����Nʪ����/9u��;=���i�u���s�{���[���p��Q�.a���g�3�_g�
�y.�;}G7��R��"����Q`����q����`D��ˮt�9�
dpr�J'����w�&_Wo�����?��Ę\�0P-C8s��!�=	}�O��4c?��0k���R���Ai)�������)�̍���V�z��~��6)p��|�k㜃�>UGZZg
�jg.�3��t	��W�E���z���XW���-�ڔ�x�Z��6n���Xa��s�J5�ϫ�ZliIPe.�.8��i�hxe{s �JDEc����Qp�M��<��.��l��0N K��uH״�
��Մ����َ"��U����ol��(�-�W���CZs���<��w���c���N��h}!{��FZ����yR?� ��Ut�$�zG���;��`������<ָ�����K�\�S����Ή"\l��]�פ�I�
��4B�Kˢ� �=�m� ��xL�" ���#�Z��A�́�����9��zih���Y�[��2e`)��@�P��) ]g�zX�X�VSI��n^�A��Y9\M��μ��v�3c�'LWo'L�0��c���q�t��n:_/)�5\a4_�?k�yn�hPAA��tD0�O�6ė����9�yrPt�a;��W����1���7��l�6�ƛI�l�ؽc�[y>�vȽ���W^�]�+���t�}��8	�ksK�%�tE��s(�:���3%�����}ȟŤٖ�Kkqr�����m���ʟ���֗���e����#���q�:6�}	[���w<<��� Ӈ6c��"�P��/��?�9߹E~�S��h�1��B���r4����"�#/葃�&�-N>�ܼ� ���0��6��;��vǀ,��(����ٔ�.̬�:76G�(�"$�%\v���[j�:*�ٱ%v���y�&(��U��	[��<�rs=S2&��{ɠ��Qd�V��27����A���������J]Kn���Нd1ߞ7Nhb9�'�3���K4�B�r�)�E�a��iJlg�_N����5%�K"ϖ%Ec������˧���Έ��
) of��X��{�_��z}t�7VfR}���e�w�>t��Mjq�"�^�b�RsC�Hk��ǚLXc��Z�}85j�]��ىE8L�7�T�����<:x���$���P��h)�
/��b$�yZ�/�#����Iϲ����0uM�G꟣LE���
lT�E�����YM� �5Dԕ�KbK���2��a�Uޔ�i�qN�#��ؗK�O�\��(w�2jAK���&�!�
�%�� ���6@[&��)P�Wz�xp��~|�b�b��B�����@H��?���$yX�����Ɉ��}�B~EK�E3��C�;����J���s�La��܇f)��P+tY���<^�ؚ|
�3��8�4Lr����$����+���%����%L��3��C��&�M>[�R���IV���#�*�<��2~���&bM��������h��~�w(l)���䯙���6?�^Uj�|P'��t��V�1�Rė���4-q��G�����☝����ē��h&<���rƁ�DA��,��	��ꌱ�����UBT2l�ۇ�ͦ�Q�b˲�e'�i����IZp��.9ýskޒ�F󎍂d;���v|�8g$���m��
n�!�g)�זS�H�~b�~9ڎ�ղ9%�Ձk���#�6��r���<)�f7�� Ȯ�%ʛ
���fFlUBp����	�h	��i2���tJ�D)���Bivpz"h|q�E�^'�Ȝ��K�%v����x"yZ�\��߱�a,�o�_�^dotx�g�*��z�6�h������y�תI߅V���h�
�1"�hj�<9��~�"�]��|�Gt�)n��X���oI#��gƷ6��K���֦�Zz��<�N��:�������'`��U�
����c�5�h�	�"��ց�3���GN�C�v����p쏘�X��i�B���8G���g�핲=�F��ⵣ�w`P�
3y������nd�����f�^�����B|rr�~5y�?u>���i ��o���6���"eJ��~PU�%
�z��E�\��.��D�n�����n���a�����z��N�.��^�����I/�yU��F,��B���m4λ`���#��ߞ<SL����U��#F�,��Qw��ȽHUt��`��^lK�Ș���c��BA S����흥����CK�Up7ЌԔ��@�|��k��	�N�e�T-&v@�0�DYI}+`�h��z4���ai�?���W��4�w6��;K,�F]p��s�o];:�����Z�&n���3I
�*��
�jW
~��i�+�)�c��&0
9Ã�#��V�k������S��ev[�5��==����.>�W�'�4���'&���ޛ܊����= _��L]��鸐̳�zc�����$
�[v�n�������q�?�鲘1���qȴ�����A��f�v�BuK�)k{�Y&c�f�7=#�*��F�Lf���6�xտ��C�3
�K+����R����a�`��@���������I�g�~T�ӎt�����7����ɷ��AI�K�3�@>�xQ���Of2����=Ȣh�?�+����"w�.qS<����]#�����q)"z
��S�G���v��{�S*���Ϧ�=	訃�
^�YV�P�D��\{$��)�&����ᜲD!��B�(kT3*��2��גb��"0����Dy
 �j�J<��e4
8��8Z�rD�����K�@$$m�5N���Y`i�{�P[��S{,�iz�3^��ŕ`إ`W���nkA�
 ��z5�(f�_x觜����R0a�4��i֏!Z���\AF�`�"-�z�RB�&�&��)(����-]
|��	|��ljӂ/W�VOp|(��]S�|G�;��(�)[.�� �o��5��26����	n�ۯu��K����<�������OU
K�0s��L��['_3�e�dv�A����l}dh���)|�#&����9}89|��k��o�
�q?��U֟��)�V~$c�!��s����@�y�/0�����=pz�;�'O���`:�F����ܞ�`�ta��v�Y��DO��K�k"�������3C�������HW����'��OLĨaЫMɼX�Zh9g�4�4�67�#�W<�fS5�/pш�{����呭���hA���n����>I;g� /�2�� ����
/�ke��,�%�� � ��
9���.�9[����/C��a�6�˱b+�/&[�8<a+3c+��@Ǽ
�̔���>v���k]n�ø7���(��~bt�ϣxs�����007��`��p3�~g�o�7{�8ߣ����<3!���_琙�1p��"N�f'�e���:��l{�ȻG/�/���$��w�$�HM�捫�����!Rt`�QIQ������,�o�#�|L0�{�_������,�9�y��<�T
�X���q��tؼ���}:g2���'���o�Ix}wa3Hv �&�1��'��3��R�q�6zx̒�fټi��%�b1�)c"��1�����	XI�c��cYm�|�K���y�cx����C4��6����F{�[��0�R�Q�}��PDʆ}���&9��Ѥl%���T����-wC�	����2v�N��a�@v���O���$�Zұ����������,� �Ŷ���������53�r��Y.V!s!�2Z�<��d�es�LA:��"�;���i��9�A�z0��l��S�C\�2��&/m�|1Ç8pI)>`FY�z�^I�=�\�QHy$E7����뜴��:O��䏙���Ee�C��2��l�#'��A1*�#'
8��8�J`!�Ix�����h�]�;�G���6)�|��	���&=s��M*������mSA���>�0o�|<���lR�}7��Q�����c�x>����'n7Z��S��tŧ#	��1=K��d�N�
R/�_H�im���$�N8dGR[�C�R�0i�Hqp��w8X��U�� $�/n��2�~�M~�T�44<4a��� 	6Ħ�x��P®�]�ּ�9���&������-;�}p�}=�3�n�_xku��;l��W���6��=
�
Ԩ٬� �&M�HB:��$6V:v�����,�Yk2g���d�\��*r"k�eq51��j��Ӳ���B��L���Ĳe!g5���
Z&}���@�(\��X�^ʢ�45��r4M�(1J��A+����n��/�\0]���Ó�L�&���� oo�>萒��E�*SL.3��"�N����{���_5
��-�j���EFLc�3�w.�K����7�CH���df��1C3&\�w�|^	1���NL�[6L��{������72�"km!F��9+D֜R���m�=5��Y����l��<7�r2T�+4Ԅ4��hd��.$�̲C��R���}aj�Ъ̍���O'_c��gJ0	A!���ָቶ�b������&S5䷺HVa�y�%3�7W��7�7"tRy��;h�i�����%%�@�b����P�Jp�Vv�ُ�B����:�[c����o��������T�O�4N�=X+߼M�t�[Co܌�|�7o�fq��z��[Cvƻ�W&���\��h�CiL�i��1����
�7�I�=����
����*REXԕatђ+̙Q��*#�$�v�d�zd�rOc���0]�Mff��o�T�Ћu�^R11?��J����f�1,�mVS��`��[���R�)�sڊwMCɿ��&�'!�yj4����Y��Y���-58�-78E��W-���a��}��Ⳙl�E&
#�ȉTE��`�g��x����`���~�GL�;��3�M�Sg��I�s�&َ
z�`�-C[��
����$8��:{H仸O�`"��
�w"��}&;?��jw�u�\���!RX$ë�ؔa>:�sb�0��
���Kȓ �t2|�-f���]����
�A��ĉ*�WXLbyi�����C��\@�KW���fa���Pɕo	^�4��P��g�%@s�a��P�. kў��L��)����d�fiȈ����:���� ��voK����{o�ܷ����D�xMi��@}�<�ʰ�� v3�[�D�6��C�Rm�%hZ��ע�îv���0Y�)Mk�{�5^��2H�E~vS�e��'�n�����9A��-�MZ9ޢ�zEA�h�憣������K�妯��z����a�O���9�"ɭ^�
8η��Ʒ��c���a1�7��A5}�>|��+آTX��a������T!����O�N߂� W����]�E�2w����[�D\Px/�3�^����6f/DԒ���E�:���5�ƚ�(`�Gn����n�a���&��Y���O��U6��8b�JI��5+3�Q�/kR�"��ή���p���`ա��̝{�W���3׹4��+'�g�Ud��B�L����4��O����>Ν,��V���[�}̻
���-�p��om���pc��>>�Z�뽀
\Ӛ�0��9.l{�e^;��H���Q ��HAh'"�5��zƎ��j�C�����г����Dv�[��PY*�E�[3����Ej��zg8ūS}�!�0�C��:���#Nd�r8�i�M�2���&ei��_e��p�8զQ@�j���1TK*I=6]�{͚��Z��<G����j�0
������֛��ߟW޶~��I؄CS)�/�]S%R��Z|��B��83��2��/y�U�a��M��)�2k�<J�����RK����!5�6%�v-�Ϩ��+U[Qb�����qD�%��{,s�e��pgw��Τ�i�d�Uo���|m�C,q�i_k^�.���V�k�=T�_wQA�ˇ�� ��'?�\��Imɲ�����Ȟ����w���?��1��m�uy;�y�1U/�`Q���ˀ���Y�W?�Q��pBlM����$@Ȥ���	N��.������D"V#�3=��rTdj�%���ܰE��m<�:��q �WF� #�]��5Q&]�-:�O�g �}�X�C���L��䫐�������B@��҇�zW�Q��/1����܍����n=A�'g).ԭX�	+�.��G�r��I�w9�7���䋃{<37�&�:��Z����D��q1bvBST��Ε$�yn�&����j�-��N1-�(�m���]V�U���%ǻR�(-�}��e)<�+l�0�|�h��8@����d5��P�Ah#̧d?�[�}})����� ,3}��)-�X)K���c�����l�/eOB�(aPJ]��E)�[&9��J.�j��õ�T��a����(��
s"���_m�,�+^�n��r�|I̔gJF�߿����E�3�����8�r6ȇΝ1�������3��}�e�
ii za*�0�h}�����	
��%9�ֿ��k]�݅yv
���U�t�Bg���mUJ�o��Vz:��	��Q0��*%4�V�m���`�lt�x�1>F�d���a<�#T�>J+�(������U�$ۂ�C��S��>B3φ��|ô�'6p��X�-C#�A��9+)MRHJYq�\��R�ޑ֡�rTXn����[�g����*`�v�Ў��
��5��Kˤ#*![��㵄	!̅H��x;!�%��M�5	w<𬫐d�B8y/<�HeyǺ%%*�Q��5�eUO8eN48�!?�QTV��xʋC��������O�Ω��)���/"a���ّ�E�ce��l��m������xL�;�m��I�I À<�t$ߨ����F/��2�@~=`��^���$O�>��ylN��F�h�*�a��h'�"y�
�Os�׺C]�r�\��j�:��RU�h�=aY��qI��4��B`W�.!,�9���rLf���ͺ��q�]Z$e�0�ʁ\��Y�"���a��(G<�n�ۋJ7��Z�v�h�VZ��Ր�����sN���M�j�DĪ2�X5��� ��ra�N[�@P���e&����쯎 �B�{�BKouQvh�|!��OʈB�B���s�M���)�&��K���"�U�r��2��v����(��\�Y��
����%j�P�}�)�P� �[�N��aT���ܓp#9\L<�	@<�h���놱��R�0��
�s���w��^Im��'���2/V�|���aǣ� +����D�P�8��h���쌆q���Kw�͞�F<�5�����-?¡Nsa�q�wE����!tޛ[���"<x17Ss˭j7�q��J
8���'օ��W���`3��~�������"��W�g���B���W5�v*g^�z*��������un2X�Ϲ�x%�	�؟�
o�$��S�n�wV�>~�����>�C>:x��������=�i���#/���)��*1�}2�4�v���4�ƛ]q�}�13� 
�1�& �n��C�%�9�f�y`߉�!�5�y�a,��h�P�Juh�
$c�;�0�YU� _)G�6��2B�<���[��
m���T��ϞCH>�������B�)�1���>x��t�ׅ5v��}��6)(Y�;�t9}#:l�t~
AD�Е� .��yc2���V6؉�e�cTbR���L���%o��{�f����� �?vp�;~�x׃��kI��U�Io�e��__�J��^�w��	�t8E�@���;�x�޾��]�}<����FNs��T�U�^����q�1��-���W�TU�oG�`�U��ێ����F��2�	�9�&Y���s��xn%����v���5�0ά���}��D���oJ����@-b7ι�UOw5��U<^M������}�Nlq�|l!w OM�
�S�!���^C��~m���?y��`�` ȅ�Q�8	��A��S�)�ڏy&(%b�v�mTK�����*�7ӥ��Vբ��
���-�W��+=��w��F��r��0�
m5�=&9tz^+�"��Ds �(/�˛ܟ|����='�Z'��C�ߧ�cH��<?�K2G�޵\���F9(��6kϩ=ݨޛ��N��{R�|�����90�Ι�fҦh&,Z�iC�_D��*��N�u|<:�6�uyx ��d
$���B)ֲ��C/so�3�{#d2�
�����I��\Ĵ�m��I�x�M*b�s��P؍�
A�����$\�Lܲtm���]ut2;�ڹ�����0�xJ^䷂�L\��T��������^���
I��O	�3�!ᣴd {��bR2����#��C�C��I�y_E.뒬��|7�]��A�-�Ǘ�X�>�]�R��Vv:o��ޱ�	/�a���3�]���%:W�'���z-���7�L(�ƸΫ���X�m�����6w������Yˡ���J�ic�W?�-k�����Ķ�!��gdE��
�LG@_�vJ�o��T?O50[qΣ\�&����w�gZB$xW~���ƙ�e��b���&}!�:-eߌۼ�
��.z�F��Z
&t�h�1-c����x}4`�����܏D`�`3��%�,�
s��NuhӲ�5x�bz�:��
�3�\=x}�lQrOs�@�~_�s�Pc��-��Z�AiơB�� Q�7�$F�f/@N2���)eX�a'����O&�h�VSb#4�4d���"zb"2� X��G�JO��={��l��g]���� �P w_A_]kΏ.�b���s����4���}�S,��b��V
0�ϞÝ�8}��N���F�Ѫ7���
�B����A8d̺A���?,ǥڮǷ��.,����gb�yo.-Z�,-��#�S����T�i6��v��#�^e�f���V�*�V�k���!�wb��J�� 9���	��	].�*�	�˟5.��-��.0,�`i�p��V��r?��O&_B6�Ҕv���B9��v{��)�{ �W;�����9�Jx`��	���N����0�ؼZ�c���%��W2û�ur�5��� #�u�2�9<�Z1���x*�)�g�vj/�@ P���CKr�_|��ՋN�lU�7������
{��֠�&4��(g`�iҚT6��0�M1?Y�V] 
jk�v<����IuX<�	�*�jsq�	uRqR�<R�Kj����䕔�{'-<My��b����.���Ke%�^����R⍵2��w�pi�!�*G+K*�S��Z�ݠb��N@���*#Ѳ��Ҙg]��!�=�_��B�Oh5)���6i�Ұ.�^s$��J�3hy[V���"-TC=����d
�S�x/�����.��ӡc�s�&�;?SS�֖`|4��G��4�;�d����8k1�(2�D�%�d�O�(�L� �O#�9�*`�R�W��gI�Ƞ�g��o��^��YI��� �kh�]�T|s��^E�`#⻅(Z�W?��e�,X��ҫ���f
�?���2�y٤�pXbt*���4=ͨ�TWsU��L��E��^�0�B�
��d}�DV�s͏�?���mh�&ǰt��d4��Q�s���sXI}]��bX)
���V�1~ ��ߪ����<b�o�k{��~���M�/���own�����C�[��U�3�(�^�my�fq���ͤ��N�Oj�7p�:��M�oQŐQ��Z��{`?U��8l��-���)!o�ˏy墚7�"
���y�[�x%qM@@^��Y�I��)7`������K��}��v��d� &J��2է2�Y?��%��xD����un�í����9�<�֪�p��F�?��%����*�?D��o�u��7�8w�E�2v���]��� ����S�!A�%����ʛ
4�$!�7��zL%	n��d
���L^��n����i�S�E":q���
�8 ��v��|G�G_3w�Z���4\��m9����"��P�(�7����^f��;u\�{s�ۈ5�T��Ucr��e�e�A&X bI���YO�*HF竀(�e0�2��B^�ܨ����������x-(�dcD��!�O,b93�!�z�>du)�9U���j�Q�6�f��Z�<�7��"�
;(��>���a�/�[�_]��o��]��&��~�b��B����Sh��{t��;"}���y.�b?
�)>G����Q�\ ��'��apN�4y�!8L��_]	��ӳ�M�6�싞G����wb�/`z<Z@�+�f;�v[�kY�dwL�m�Z�M�D�X�p� �,3��4JZ��Ϳ�1�*:T�GW��b��o4�7��Y:��V�D�n���*N��'k.�W'�ڄç 6e�ӯ�(U��ou����Im�g���G�M�@X��햡��֊� Z��{em���f��V��#h��s�Z�˲	�R�]��YV�bj�i��;��C��0uGw8��yDI#X����2�с6��I�b���r�8ᡓ�(P�����p��324̦�o�aOS��YT�͚(��_g�M���-� ]�rJ��������L�<ˎeY]]V�)�ح��4��� XU'J� A��V�}6yz�]�\٬"�k
�P�h�6r�>z
Z��7�vS$�v��ּݎ��.�x֚I��,��]�u
b���]m*i
��~�Eq��\'��!��R���t��#LMKh���B�u��z���<��Ը'�ڴ��)iTSЩ��U9�U�V歜����a�y��"��ެq���L�@+r�2mB�αZ��N��i�x2ہ�ދT¬�FJ7�'��3�ay�OsR�cvr���U�5i�^«b<�;���I=w��,_��cоӽs7
�L!�t�{e�9#l\��K�hGe�5=�-��T�׀7`� �S��p�(�
~��}
A�>����2���}]�y3N@�A��%F`R� a.����H�ӧ'�Rm�@�t��l�(��e���w͞��x��hє�[j��T�y/
���W���hɻ���]�c�üP~�i�n4M�˽��
��L�Xc+Bh5���̏j���!`���i溳��|?Q����)��91L�N3��!F��P�y�(tq���IW��_j�7��9/m�0wδ8y8y)�C��L5Gb~0�
�x�ʉ��=��������GC�0q�9��v�M�e(�"m������e&E��������ˊ��&+Ve�8�Y�ez�\�Ѯ\������z�==� ��*�%ăU��] k�Y��)�{�q�%r��1�>�h�}p�c�=���^!�Y��|��i�Ў���B	l�� ��U6(@��w�i�^��.2�^=��V�
"��+�H%�r�R}���5����C���8A/��6yf�2������m��&<u��c:����/��q	���0�������1���V�S�v驢(�r��^��-� �/���5E1$,jN�M�GcD�ś�I�J${x�ǖ�.�[��!W�cz�@�}΋f�Y}�����,1X��B5<�)$\Mѷf���f@�,��Be��?}��C��sp����/h9�m�|!�L�0m��S�\�x$d�CZ>�r5F(O������ME��Z�T�{�a�Z�2�O&�1jx���lg�8�|�Ȇ�ָ�^���$�{?���YS�����vZ��6!$��.��2��gL ��]�c����":I�q���,��P�1�E
��Qp]�$b���zݼ��W:Ѩ�_�c�D�(�A����hN-&x�Z޶1�lEa׃��Q&fOtW��+�O��J�q
��"1ABq`���*Z��(1��$^�\	�i�\	�y��ɷ`�<x�-�DS�g��I���x�f�����v��ҫ���s���@܍y�ͤ��8��vL�pW�*p��©=&� ��2�BU^�����YTsYq���)½��Oxd�˂����ky�;�`�\����yp-^��'~�Έ����E;n�x��cu+H� �����VH0,dmsC&�Y���  ���}ksǕ���#�o��d�!�Rd�Z�r�X�]W�*jI� <��V��Xv��w�n��V�'Ql�Zˊb�Y���_���	��~�t�t�t��d��"	L����y?��&T,h��κvus�.���d�7�9 Ƥ��Ҙ�Շ]���=��uϲܰ��S������nn+W��A��)�剪�%�ʻis����ҢK}!� )f��.�.��쥘�p2֥�q`�����B{�d�ow���A�e�
��w����������M�
.52��@��Wf�� rT�(���o����ў$�JU�R35�{>�����¡���9���'zH���.��֝zH.:��r�B�0�;׮<==�S��[l%.�8;,�5��=��ޥC�ޢ�9��^�*��yL���X�"�=����4���p�Etd�8�ֶAw��=.��S<|ёx[g���k�[���'xs�Gܘ��_z���	�%� ���Rs0=p,ˀbC�Z�
�%ſ!�R�`��D"�9T��n@�h�� 庎K�M�ׯ��'4���ѣ|o�zM7X$�K���HD�q�b/蠹��"ys� �����6�2J��[���G�G����FA�}q�P���\a����f��Q|���qg'B7�#�fW9�X��7���)�TW�*�h,X�At���O0ȴ{��fx,0�^�X�����+9�*[�d������4b��3"� �����}<����E0��-qQ̉�Z�{��$���/�����U~��BV26�`Q��
 n�'^�Q�u1�6�,܉����[�)z�Da�r���bQl��{�c2��d�1�
��A�������`��+�R�Y/�y�:�9Sܼt�Xf?2Pŵ�x��i���o��`���ab?ꓱ\Ilt��r�V�}�����ހA^�����wb����=
��A�6���`��(��ʆw�h+�P�v!��=���
�3N��7[٣������(�����-��#����s��G(Q|\ƻWNV�v���;��W���C+�hY3��5GS드���RlBbwq߭��]o��{p�ȤJ��>¼�E��F�§w�ӏ�׺#�9�B%Ԗx-��j�+�t,&XGf��v�
7�Մ1wƕ��i��v��(nu�h���ǖ�����#(���3��˥��B�T��nSᣠM���M��1����q��W<ϞA��q�	X����ы �ݟ�#��Y�m:	�z)�(��r,A$e�bH�'G.��:��z���T�81`l!��D�"���u�
m*8�m*8����Jp9�gGlH��u�A�u��C	����0�� ɑo<�d��.T,4\�����@�oK��&/F�M8:	���x=ߊ��.�i{/�b~�T�3���6�h���$!����zo���z��-�-��ʐjM
����;|J�_�ɗ��ʻ�#��T^�M c*�Z���ZЦ�jڦ���|.dU�������]�TaJ!�5�t�r��ɶN��z1�m���������q��q�u��h��t�(*͉�Ԇ#[�vd	,�~�,��)W���$�;W+�'sW���DD�O)e<>xB\p&a��/?�r����Z.#���H%����N�՝ �;A6w�L�,���y����0'�_N��,�[��,K���M��p���p�G9~v��0ªy	7��td�^G�ҝ�_�����
���1���q�H~�%��r�E��g�~O�֌��3Z��*4I[�ɯHI��|EJ4�h�b�ѴnS��ئ�I������tl@Xo��4x�gZ5�X@w��#kj_��y�a�#���o����r��+�+�l�e�L�M���m�4���ئZ��Z�� =;z@V�E,.��u�.ǥ�K�|j62P:�#�}L,��2�
:�8Ty&hJ�5mJ�umJ؟���4�=��'��������k�o���t����C�\7�m�������\�Lq�䡩޻���Z]��:�_Phc�f�f���A<��5#u�� 㷻� ���;qP�ř$sJC�����}&V�g�<��W����Qt�9���7��-��xˆ=�}ɻ��7��{����.l�wͿ�4�_[�Ë����{5{z����Λ�:���$�y��x�z��>����G3�i����d%�V�	r�L� �ʀ"MwR���qkc�#�Rc��.�\�w�~���V�m�=*����V��:L�,"bj�p��	��,��� �0w}��Nԉ�x[J�,�6�W����{��	��fE�lG☑�%E:o��|9܆�(f<��{x@�1�����{���`'z�Nm�:�5�ߝ͢��
b�W�]�%�w��܎��k0'�=��Ԗ��XA���F]�a!@�QG� )��YZ٪�q!s�25Z��ʩH��o���X��Th`�xieޤn����������}iֆ�]��@���a[:�y�۽��NH����[���2�R�^�3�HSF�y��|<z��
�H�e�٭���8��:����o��ħ�I�(L%?-����hM���N������9p��m��
���ί��F{.t �[�d	t1�$�i�S��Fxn>qW���s��?�u�n���^J�$0���W��V%�O����6��e�5-�ۃN��za/8�!��vS���`7ն��>R���[��ٟn`HgV�Yp��Lf�T\^7�T"��i�"I�>�}�ӛp�S%�u���)���w���{�m4:��3"�RHE����,"^\�	E�}`˂- � ZE��?ږ��}�����3��T��	fIQ�!b�����?h��M8�>�<�C8���X��n��i��q l~����6^�ٗ�:�ȩd.��[M����5���n�j��˧U�������6��ZD���=�ւ^-"2*�m�N[���|UQow�{1�X���i��9���k��w޾L��=�=.`�fv�������\+�E� 1�{�c������`k���BlZ�������[AK���X�/5'���{!e�fQg���b(�G��<}��r��k�|)���hX������eV�j�_iw7�oL5W�7��26�T�J�n;��3�����APx�AR��
�v�C����N@�gJ3�W������Y˳pg�f̝�=����(,sͪN\o �};�~�W��N�"�=��z�Y2qK�����]`ܵVs�ȶO��έ�	�Q����[�ؿ�	Z�.�H;��f�%r��NI�sپ�Ŭ;�r��r��ꀂ�KF�Ӗ|:�M^��~I���^8@�� �T����&,j�C���*Pq���0���]h��!yo�1p�����9�KW�����g��m6e�]7�h�u��Q�6��L�/�����$��A�̸V��^�l��~6z����?C[�m�������>tK�Qk���;%7wI=7��PuM�qR&m��vb�O,R�����3Z�>�/>����˖�`�6�?L�+}�0��>���3�0nf<a�B�u�ٹ��0�	/a���r�Y�;ދ�\$r�r�S�>��A�r텤���I�K	|]����� ��rٿƓ�_��}b}H�<Vf�����L N�i^?rZ�D���m��s_YkiqP	Od'.���ׄJ���I���m:%�3t�yf2�r&u���+�\Ĳkrw�,�&G���5�s��(?��O�,���ƒ�n�<W_JÁ���_,��M��i��0��L���9�``6�c:��	����tp��c)��-�5~?L�_/��|�@^��|Bh�"U�c �Sv��T6�	xC��HL��U[�{D�^2�sX�s=�Np~�_kǘ�Ex��..엿t�-�ƒ����I�z$j��U����\K��ݴĭ�h�㾢��?��E��B׵(lG=�8<��cm�nk��T�eŐZDv;���v6��m73��m<K�<� �q�5o�οx�a�g��a�j���?j��z����t% ;�3溫�5��>�:"��A���Gf;(��2� J��pS`�Q_KJR����?��w�5��^�ۏǔ�)�[����E�7�>��R_��,W^�m�ǎ������H�Y�]��Y��"<�>���Q�q�,,��.�%�\"��^��[zػڌ�N�9�2���ZطU��� q�}�f�
�ܭ�>��`d��W�.�N���y5��wϩ��y��W��Y�p@{,=%�$;R�ڏ���� ��HLg��!~'\�xm�������$�3�Q]��9��?����o���~s��/�J�ǔH�g����u����$)���r�=�'Φ�ɼs�@6��r��<4����mY���ƗCґ���~��ң���鶴>/�;Atя�j�܍�v���ncdl�2���J��8�*�rpJ7˞X$ݥ+��'�Q�D�7zU^��%�'ѕA��DV�9ƺ9<����r�Sz��!�sHli�V��XE���2�� a	N�4J�*/��u���v8#�{,�=�>��n��t�Ō��;�nsDk�S�n�<͞P�pz®{��[��Ġ�yߦ+�w;#cȓf\��x��`�
�܌��W2R��o����V�;�V�
�@�;�H%�R��L4,��I��\�_<���)Q����ڸ�,z�ʏ+	�5ƿD�h9W�����[&��2_ڻ��[8��$]\r3�������r� "���s�-Wp����P{?'9��s�u�p���r��M��V��R�
�W��rs��q�G넶bW�T��1?��<ZE�<�R��EfXu�T��.�1�8A�qZ�V�WTze2`��)����?�s��oɪ�^���� ʭ�[�q�T�t����V��/{�xM9�g�/��L/�����;Q�zc~���^�f�
�y��Ű���bU��g��� q�*�1-w�4U͐��� ,��j�㿿W�챵�2����e��2�~�Ǵ9�{�~�It ~˽�D�l��z@��|3M�p�<0$�ѫ��|sQ��L�n�qu��{xʞ��
ڃN0>���+��c��ӓ�.�J��1���&�WӜ|cF����XE�J�-{�GoM�%��[��^*� E}�)=���v�V�)����ݑJi1���c��	z����A{;�{cuD'nW.w�%��V�CH��
���{m�8`�%^+�ދ����b��Ez�^���NI��,R`Sif�ΣR�Ƅ���� �1ʏ�M�kS�ڍ�B�mU*oP��F�_ͪ�	�k$f��!6�����dqI�T���p�vF
_jd�U��+��Z:�qk7E��7J˒��2�8�tM�����\�ʑ� �J�1��r����]��&���aū�0RE���X\��+��"�N)4K�é���ؖXcߖg1GbP{�#PPsN��`���Z=j��OL���!*w0�)�ߝDA��K����vY��cy�9��*�r[�}�#��3�y��d(K�N�<oJ8݌�/9���X>�����eF�
�=g��#B *
9������ї��K�	}[����`._�'�3U�̥�έl�J3��+����z�;�7��+�(�w%
�����o�0xo�-�#I�+�~����}ړvD���^��FD��q.�K��N[Yk����Yy-�e�!�q��cs�ǂ���h(�,��
ZIe
�����~����lGI9ܼ\Oh1|��v�u��/��aW���6
�ão�]E���cʢ3 f<�@��	`��N{���͔N�=?G��>���jdQ��G��H1�l�wk;�.��3�Jf�t�i4ZP�a�
�����.dqD���"�v��q�X3k�5��>!��ON�����K��c[��E;o��냅��{���3Y)�2��'-=_�~�.�=�G4*�[dQ~�����'u�����Y=�Z�nzP���F���	���|����%Q�95����^�1䈊�G�=�}������W��SajOGO*�y��rIG�Ϙ[�O`�n^X���7�Ҿ�ഏ��e��Z��1%�UT�U+M|�b'����t���c���A3�|�����][�\I���&���h�O�G�%��}0��fw��>i����&���]��HU�K3oI8K�
�F�r5j�<��e�����bޱ�s<�r��� Sx��h\w(�՗��3,J���"�ф�QJu�zM�b̅Y��^�3��g�-��#̲�x��'A�U��A��!�����0��_
�IV�:��~8���4��.jGg���>���u��f"���f��E������Y�RX�b^8%ɑ]�`4_n�N��eP)����^�NģG�=$Tx��e�=��Aa�ܛ�404�K����e,�f<Lۥ�u���& �������YC'h��[� P�&�)�� �����M`��+��ja�Z��ܺ
O\lY��r�,��!J1C�L������j��_�]vN��L~]�[��j"�	~*�K]��llq�*�@�������a���N�
����ei�45S1!�/�8F�e?D����w��'Z�gc}	��������������R[H�
�X�]�bF����������d�<12��
��x&�K�Z:7���� �� �����r�N���1�����d�0��$�^btQ���VđfND�	
�/Z"$$_��w����'U>�3�	R30�T[L�hi�g�z�[oD��ע�*1���T�a�r�0��L8]v��0�!ek�8l@q�$���S���Fo�m�v=}
^ >B�.ŗ�W��d�	�g�r�����N�r*@O�}찾A{T�ec���,a*����Nk���>U��e`��`xI���e�u����5b2C:���ɺ���o����钿�p�x�*��v�L �`vJEh!��)��i]�S�	�@I��MP ����Y(������o�7���Gt�􈅝�u�-�;��/�����$��z�m�A�c��ק�C,�9��+:A4�V��b
�����P��Wb#	��#��ǧ*��
�C�%�@c�]v�:/ �5LWDQ���ǣ'����_G�q��7�
1~S	����$HP�t��3�� ���EW���`�����5���e9\� �x ��v��?��D�֣��gL��ٵ�����>+T6���T������ҙWΞ��U~w���?�?���g�<8xx�E�ކ���lz$����a�/����Gqp�7��s��#H��N�ï�fX?�U�~�k�o�� ��t�bm�2�[I0AS�I�pv$Ib��f/��G��^ �� �J��Y�?&�`�
zE��9��"��q��
:������������;���s����ZD�x
�S؄/0yq:m��	Tl��GҳQ�p(�)m���%���m#
���jJ�m���e#��X��[p�����>��do�d��=?N8yn�w]�H~�O�\�
N�p��������
	���z.�Q��AA���Q�������� &����Cy��'����HJL�o._�e�Qg}�����fD(��NbP�̐Aq��^e�=�}�J.&
a�$M E��V� �s�
�-���W�23%UJ�9%p��X����~��j�U�f���}��Ǹ���t�jG��h��\����h& 6����wFg���cuQ�p�k��o�{�q�+��棠{=ѧ
�9����?��ť���(�+Zy0,t��`����鉩@}C��@�\�y0� qW��jp{2�+�+��K�;�~mN_�y��+�
�j�h����c~�����Q��̎��2�ͯ��d\��~�׈2�ɯB O)iҿ~vk^�e&�4C�)R��k�����EN�BK$H8��٧��SS�zeek���3ѹ%I���%�������m���������uV�bYʿ�?dC��h��]�Zy��~�x�Ϭ��C�BN+���i�޺n��r�F{U�&xx��)G7�����>��R�8�{�I����l'�	Q}��Re���B���w��Hb�Z��(H��),��u���p�cO��DcU����.���'g�0���ɇO;���������k9�m���i1R����<e��FhG���m�ց�+�i��2�X*�/ST_o7NX �->mR�#�����$o(ʥ��Pbԑ��TW��\JθD��rR��/}����� =�w�������_ ��ռj�*� X��-:T�Q9R��_B�=O�N_n�8�
��P ��+y=r��f~PE~��Z?d@��`o�$*'sO� b�V��sT����i�Y��y#
�d�U�>�V�!�l��2�&+�J�:�=/;����N���vܕ�K�.�U���?L�VN�sG���a���5��V���כa��ޘ��{Z�_�44OH�	)L��!A�C]s"�Tb6�C�Pq�Mo<�谈)Q̶��"��C#��p�%���Oi�	s:y��\De�7����(%Q]�!�o�~���o�_���[WY�R@�ZF�Ե�#uT�O6�5��S��&�/HxJӚ�7�!�C�:J�;�d>Oɕe��љ�֗,I)�br��(fܒ�bs"��(p�$�ѓ�-���6[j��*��H�٬���{fC�ݖj5�g�!��Rw2lQ��������+xv�a�Yf�Ǔ5�Eׄc:�-�hk�z*V�R^�\�D���!� ���h+L)��j��v�o��q��^���T�n��[�~`;׫�pg���2oms�?���j;�)\����1O�sH��h��C`�m'���y�B�����{R$;��5��:#���~g��*��m[��EL��&�`ӈ+*!"�M��c�n��ޖ�b��})n�!��1�^��*���rl�婘��d�w1J�i�Ζ&�;���j���N�28�*�Mi�Neuӣ�����d�RG�S�uP��b�"ϸc�e��f
�iFO����}J�,�YTc/`��p'h�R������Yh�u���j�|��mj�& ��X����qfE��?����C��>���hQ��!L!���U���,X��*R�o��\�_�
���Sq��	5I��Jg�JC�'��
i���
v��(Q�������	���Eߡ�"1����|w���w��O����TǱb�GB�G�&0P�2Ф����6�[��:��}SP��5��i͈����
�MݎH:���R�2zr���YOKS��
�� ^��
�Aح�<�7�H�)f�2�z'��z����ReS�Ḓ�= �K�2?�'{��<�+�!��׺��1�LHS=��\e�}����L������t�b@?f��S���CL����+��[�������3|ᰭV��k$R��V%*p(�;�ppV�`�����4�>&�U��$&V�z]]����=U|�r��V7(��k�Ӵ�̣P�����Zm��Zոu�}"�SawX����~��=��G��a2?L�|�x�a3������;NC���#r<�4J�6����vk��xӎy�,0v���L����.�9�a�d��w���U���7g�:�w�ƄX�����;��ˡ��]#���������0�"�S)���e�$���}�^�!|ٖq���* I�)�1圼S�j�
+4)e#��֕]��kֵQ�.o׋V��mni� �M�fI@O��,S�B�& Z���^Eՙ��,eP�U3Y6��Xx\�Dx�Fϧ�����ȲveJ��β<��o�.�]��{�a@�!�Ll.Qic�(?�#�8�@L<g�%/���1�:�^`Q��	?L�b�>#�
�I:f��E>}N0��,O�bϷ�X���6��խv S/6Ay@�:bU!��=��3�t�Z��Z���d�&�+f.�f[l�����B.�M�GSO���E
ȓ���aS@�R_�)A�D���$"��K��ݦ�B�
g�ϯ�C�P�F���%u �����J/6���dt�U'�ɾ��1?�Vv5�A�.3V��o /���-��v6E�x3��Q(��4
��2��g�)�.��B�_����B�Uf�_��ӥ��+���B����ܟ��黬��뵵�i���LO)��ڞ���M2hZ�ɻ��˗_�x���~��څk@�쵪�&���Vtc�8}uR����]�C4vQt�~�Ӭzj�r6tfc��sGb���Xg2�,��+O��όg
��F���P� �9�Dt��Þ�\��4S�]�9�Nr����"� �u��Iha�Syu�V�D�ora����]M���mc�^R���y��۬
�����h�a�(-\j�ӓ��bN���pLQx�E�yn@8�1/��ɪP�"A�m�Їy!� ����|mne�4bPo�՜
��
y���p`��e
�1�@��1�1����ۧ��Hg�1 ܤ��%�*H�ȓpȴ�.M8.��!���ߍ��u�>���������[L�+��w=bV�w�C��g�dB@K|���i������ta}�����GC������lY����Sz_���ILZ���^|�hҢ�*ׯ⳼b�ֆ��0��6�A��y���]��l^��W5��za�IG��i�����V�G:��4�r'c\���h�IS��2�8�uR�W�s1{����w�ögK{u�[ҦH�,���.c�J���ʜ���Ŏ��^M�[�ܷ�?j��8�Z[wd49EI��u����I�l
T����{�y�
D�q2����O��D�CT1<M��`���g~�
�̱�����*�`Qޱ�$+f��^&�{ޫ�%fv��A�1e��U��s#61�yS9t����#��c�5u
es�μp#�'�J*Җ�
�Wc� ���C��&�``��aRe0����~
�qC	��@_^/�m���M����7l��q؊�\:�v�6�$���0le��^��:��z�XXAhH4�uHJ�A�r�����ժ�35�R�!�F�7%\��$K��TA���m7�`��t>u�-Ϋ<�E~X*/Hg�6Ll3���w��m�����,���/�^3l�}	�"RF�*�]3��G8f�Ϥ��7����wX��mףC]H�v���٘Ѐ���Ǐ�z1t��ʃ�!���z�Ɨ[lQDW�N���Z�5��� &m����'�P�1�u������Y\U�����zIN�c�x�쏳8ܒ?ga�׻�f��J�&*��ڬ���l�Zٛ�@�`�b2�M$YЉP�E������¦jp7��?�,�����c�9�g+� X��y�������J�m�ލ�٥�Y7��-�L���� �a�m��d@yٰ�fU
]�)FV�CzT8T�.�&%M鮂�:O�`T��ՌI�ņ���}�8G�
#�\YCg$�ȃ�|'�F5[ R�`�*���)����i��p6
3�h�|Y�T����.yR������ ��1/���uP��"��w�����f0���Uw�9�H�.�M$?��II�Eϓܩ��7���r�V"��UҒ6���%��J��q�8�a��{�1/+"���T���iE�,�s�(6VSG�Ӓ��H�{�f��c���Q�k���>P�PvL��C��q�b��ho�j��r���
m�#�`p� ���>�|G@�����|鄜�r�.9m��	�;��
X5�9�� ^�X��!J��¹����l��ބ��LS
�F	���ߗ	���+�����<b>[��❮����w���r/rW�9���M��(�&^�R[��E�M�i���]l�BD�_8Q�JUwv�� 	U����KA�`�h�24�> ������1���ц	N8OY�ilN1d�P%�R蒼�	eb�C��{[����%�h��T��8i��
��ɫ��&qC�ΞkHn���P�V �@3;
s���)ڝ�b�ۈr.�K��̩���8��N�W�Aк�ݏ������V�0���a��Iχ1�8�Vح$_���4`_����&�a}��k�[p��
�4��4Sb=�X��彗��FC���G! �;�D��^��t}��F��^0C�:��̈�^�o�GyuU��D�	 ���7��N�6�AX�<����y�IB�D�D�W�����ibv��LE�өE!�-T'����F�M	6՟��Z��%?�aI���"�*�u�g�N�5�ZFE?���vC�}�ꔍE���2g��;�W�e�6B����o/&�#g9�˦��L3*�@�O�{Ҁ��9Q�3�O�KYjܬ΅��
M�Ժ��SC�
؇�4����4��bA�[�PH�i�7���Xo��l��������ӆ��,��T���n����Fl�A{���X>�#̝A����������hԅ[A�VsV�}"��$�"�gu���q�x��w��s��z�t���S���&]�5�> �������w�Ip�4���^�\H�G���0) M7��(��y$tG�(?鳓�a�O�x��B��5-ڧ���ὃ@��|%�۩��S��r>Wz���aAD�7"`�e�� ���/yU��5on%H������[=B���A�P��;�ǣ�1�
n�� �'�/�@�1�K{��y�Ufк����&�� qf���2�(a��L �C�Y��^�e�D.����K]L�8��i�)B~%
�K�h�@��\�3�7oJw��5xQb:��=�,*㒹`)_1(����jl��E~����oL<�4�t�ٚ�_ Ɵ �� ��o���}��g�*E>I�eY$y-LD��đ��T���$����Ҋ���Jf�"�`���u�C�Ox~�$�j�1qo'LB!S�J(��Bv�YBQ����H��ό\bǆ���1==�c�K��wQH���>��SN���r���$�jE�_'�B(�G$�"�������D�� ��
|�����;ߑ1�>EV�R��y«�b�*6r��Ȥ���¨Z�8U��1DN�n�yc峪^�X>���x,I:	����+�K9������Z���0P:�>@����1�����ΘJ��1�wDU�?T�8~�t8cMB�0_���gmT�g�Z��:�t\70�f���R���7��|�o�ǀ|D��l{�n�i���?َ���B+Ƕbc�ȟ"�X�	���C-�q
�:�
a�4j�l�������s�(G�)6
v3�v�^���}2D�`7��^>��L�>eHR���aV��B�
���;d���I���ST�c,UJ�Y82-�Xd�Qw�nY9��n��@��c��.is6�9g��Wu#��y��qW����1�"�<&��6�A�ϞI�%���}�-�%Iu�����HK
�F��W�e�W�m��e�TPF�A����V �^��gN��AU�\�n+�b��+�D
D�K�4
_{n�'$�Ȳ�]�4��S��e늎Ђk�1.�N���֧��T,�A��?!��Q��/��R�ss�k��`-Aꏭ)�i]Ĝzsg�xhv�%������
-���SWs�-���We+V�$=�C�O��#N�����o�o���=����R%��������ϧ��I�:J���}���`(V娹���(�@t�zۢ�ޢ�25ti�����ZOF?�"�$%�3�$1�Z��ԘN8���27f�,+��m��4X5]xN:OOS%�d��V/G	�6���x�����|���!��+�� �OS�4̑� �~���T;�*�%�3��̈�F�I�G��"D�LdF�iy�#��<���R��p��Rjs���ya=5�K7$#�q��~D�|�g�����=�h��9:�_��c6[��>�4����&��y�5/0�(�=��m,y�	�PO��ʥf���O-�2*�Ӛ������~��o�GJ��������b��S��x@	�O��O�������'�3n����Q�*?V��'�3��O;�IP�Nm~l���O�*5 �4��M-~�M)e�Y���}
spd־҄���'oU9;_v��@x�V����;�V�T=����"�����A:ߎ�R�Ry
�}?��K�A�6���Aa�0�K �ʭ-���ӗ0
�NҚTf��V��Ϲ�c��f%`>aV§�ѷ����1�U��l(����9x#܎p*��k�ߏ7��Ǝ���T�Q���6�i��$
�?����W���7-�u�a��Խ���|R��߹����g�����&F_�e���aW�O'2�½J�u3�[o�&�����M��j=��߶d~���D����g����76 STEIEzCl��=�1���A��mV�ܺZ\�'1i��|��͝�x
��#���
�M$��سPv$CsͳP���$24
�V#���%��f��K9���$��@�N{����	�E�'
�̛�$�EG�N{�F�q'��F��'��,�4�ݛW�h��!]�/�$
0����-���a��̪�0h�VKtg0�LT���ܙ� ��8�Q��Z�n��!�D�����Ԃ�m����Z���jC�l�&ȵ��*oH�w>e u��9%�뉆�eo�a
PV�G�Cfg��w:�۵qDP�^ʔ)=��v�p�[W�y<�<
ו�t+���SA~�������<��� ��[j̞#�
,��@uY�O/5�g�u[�Ē��`Hg�pb\
���n�~��3�&�]�'��K=Ou��%�KZ�n�go(���d�GCR���.ri���(�[������7h]�4ޒ��Z_�bG�B/k7�b?�	8:��lzˉvt=d
a�/IO��9��8�~���n�|s��`b.��gE>N��B87'?+��Qy"h]2:�	�$��$���y%�n	������� }}���f�D̷�>8���2��C��'�d�7�%�}��:7;)��z*H���̓���B��U!uV(IK,]Rgi��|Ro�� ���9;�+����2���I���	2�
wK���e�(��/d����i�hV�4�yDE;*�)�v�3����lvt5
J/J�!��Ɗ2��	���$���}�o�`�$��4�L�Z#c=���4�n�����;e�d�`�Y=�Qe�0���DbB1�T\8�b5UWL�Su���8,�Ha`�3��fg�"n�n��m�����n�@�%�C�TQr�'_?b�XR;rB�#G���j��f�X�8��/ϸ��p�97�à{�;"XDv �T
���N��E�6t�Q٢�Q8��\߀72]��M��]!������q���)i�)2��LQ�����I�1U˰6U�L�2S����$��D��a٦���.f����T3��$�.��  ���}{sǕ���)F\;���,1��4e��ȖV��U��!0$&0�P$�˪�3�w��V��kko�6^������q�|��|��G�}N����t�  )ZƸ,��LO?N�W��;3_Lv�_��������S���Bߋt�X�E�b��5�[�L�IyG�	9�s$%�����\#�kfd|�E��!��v�P[`�'��OBf_��%$��j���S�O,Y�S�Q\-��u�O�ۛ��L��kg�W<�%_�wLa�(���a3s��6��4��Vq��sB�s\9��u�m�i9����;�o��_��M*�e���t��p[E���2-j�@sE� ^?�(�㳈bC|�,����H]�!�|oZ�*� Z�g�5���DK�r{BP*��xҡ�#�*��1�B�n��||���w ��Ef�"?t�Ɠ�.�Z&e�EĽ
����I�+#Lb���"\�6��m�Q�lo4��gyπQgf�w���0*yͬ��=��χխ�˘���53�g&��䞙�3@ϩ���o�ZF�~Th��[&�`؏�O]؏��YP�A9�P�N	ɁNWP蚶����P��"���w���ʷ��[h���'-9���,hQ4�y�u%SWe�V=O�m\c7�u�v�7vs[�l�<DP�tœ����6(oO�p����� z���a'��ڼn��c��!�E@��8�\��z� h�[�������h�GP�?�t�
�4�S�p9&�fJ�%<>���a{�z����QRv�N��C�p,�u9�������#uwL,K:<Rw�:U��;Ro���y�{�eӥr:r����ޔ�3p�)D� Z�#�}�5.�Z�?B�DV���Α�}#/����yG:��B��4�����|	<5��Do`�'��IN�O�Q�y�h�?��+��{�-��UO�o��c��4�����y�g^��) ^>A~Ԝf������<��1������{1�\Ӄ�O�d>��� �f^���;�^���\���;�����X��(I�wp,P����`)�vf>�'Ї��4����0W�x2�.vh؝��>����	Vl΢�܍aipo����LΜ��ɝ? ������8�Ɠ�]�(S9l���|
'(J��<X�s2���� :f~���;�~��ڀɥ���H�C?ڷ�-fv �N�CD=Q�A+����x�w3c|�/�-�T�����Wz,~�uU[�g$�w�,�~+�z���6�B�b��[x�vc��4([��~�F�{�ލŦWE��D�}�����x�G0���	�.�~X������~�
�_iw�p@`s�M8�w���}���WZaN�����pR�5��l�_:"�n��[�( ���I�GL3��q�o҃`��
7�_g}zA}3�ce3�sw�X��e������h>��vӺ3���̖|��pq(���г��C���ȾA3���᧵���8e~gַ��[Mo������. �c>[���(�	{F� va���.��}��������LZq8��H�.�
����V����p�F1�H9�v�c񚫤����p�7WS^Uc��m�@"�+�+�hK��A�A�����I���d���Z��n�Ǹ �~�$�ܶ�;�Խ��X�kF�f�p��n��k;��ev�m��&A�u�6��k=P��ٯH��� t/��<���Z5/��>��^b:�w;�F~۸�OD�q��x�9�#�9�S{� �iR�i��A
o�̉M2��8������f�����NI\KU7d��J���f6Y�����&�)|V��^�$��3�K�\Oa\��qe1߹ڡ��@�Qk���Xی��b�݉�������+Q;H�����u�g*r��
���OV�p�GZ�9�^�]�� 9\���[�m\o
�,�~�����5���٨K�ߙ_���SU!�I�_����Eѝ{N*�^����8���	���/��dg��X�T���a)nDۑǬ�!#v��6�R�-����viAR�+i�⁆t{C�=߁�DzoYY��p,'�c���a���d+���W���u�ف�Q��Rn� kHW�^3z�`T�O��]�o��u����W��_c�>��]�r����ӽ�Y�غ)[
{��M��չŐ���Rm��V�������_(s��ށpΛ�|���h�Ak�I�SXmpQ��d���O!�^l��N�F����������OԚ�D�̶=��}�N=�'F4��� �[>���kF��!�F{x'�Cu�CI]�e��Az]5����`߃��z}�����`��?u����ߑ���f�9�������&������O)B�4:H�z��z�h���n+�G{�j�m궼�L��mXl�, ���8���/�����o�.xLy��o�������
��-��'��Ƭ��r��܍}���`���X��"Y�qyOrem0���f��L=��'3�d��|OՓFs��xv��V�w��x�4z����ᠺ�Qc	�[=F�����*�9������:j���<�J�P�1���	
��~\J\0�{v���pm�+��[
��6HJS���ݮW����ё[Y�_����� �dUI�\��ւPd�X�eZd�h���te���X��LJ�&�X�0\JӾ�ӛ�j:ssn(�*
&����KcQޠ��q����w|��t�Z�[[l_+F�%3���{�}��5��`��'���*[*:�%����f��!�z�'E)�bL���Q4%S�T��(��r+R���ǐ%��[,2l�z�k×Ҩ_��3�T�[���s2�7 �<��f �Ⴗi;��!D��<�6�#����[o
�`��M���U�I1�H%�
�X�6`�3V�t�×�������Ѕ��Fg�벍$}�7;��V�%����N�/�V��^i�/瑼_�p������W?��],4*0��6�1k^>�_F1|w����fx�{����j҂8���*�)x�|��˙�iXI�G����x��
ǻ`�����/��>��ѧ�Z���o��hc\��ƶDK�0�R�V)�ծ��-Uu	d�&����}��0��^
��a^���1k�/6ٻ�1���Ff,D�-HŲ�`hue���	�D2��DqӋj��b��
'Ԗ8`'ݜ�����-�f���;�R�u����w)m���ؿf���9jJ򙓑��*̜��Ol�5�t�;ԙ!�i	lj|��e�#h1�~��n�?62N7��,�:��G�w�[+�D�϶����]��5?�lFP��I��ms:U:'��>��o35� m��W���UP�F��0���x��N�ƒ��{-�?D��]r'�����!W
�k��ʦؠ߄h�B�5�������W��L�y��f��@;�.�\ ��ug�\f˦���4�-uNZL&�ߺ�%{v�us����A�Z2��V�ۨ�U��>��ՔNJ D*�hg�Xh�����Β+h�v״��Zt�Ȅ�L&\��>}�bo����ٗ��Ejq��d齅�jKQ���K�i
�3P�F(	E��b�_�L�e(��~G	 �F����AQ����]ҏeoI�bIg4p�i���{�/�W^�ƽT<�MP'���Ό��s���J��ʷ��X���9�E�ha��������0����}el��)Y�Fʒ�b���Ch��M~Y�_�Xv���-<�h�垿8n���o,b��v6�SY�k�l��?5������/f��K��{�lJ���j�r�e?UT��Y��Vƭ0k���
�{�����l
�~���,b�J4��<`A9C��ɺZ�L�ʅ|���� ����^�M�|����7?�*���:)��K���_�/_x?�S&�������}�U��`�,T�˂'AY���"�ҽV���H*~�C��<���ƽF�͕�{�m��*����lC��F��se�M�&�r�>瑿']��'�l�!�ѵ����Ov|'���vy5��]ƈ�g3���\�gL/�t#��
�je*���T�8�����U.�-E�Z٥���V�9�����0�5��z�C��Wx��,\��)�D�ؾ�A
�-D(v�X%\
�UxFU�-���NY{��$�j�I��E�7����������_�]��O�l��
�V7�F�
'/ +�T?����7˦��=�V� &ij�t�d:~�a��bM �����Zj��Yʸ���W���
p�)�Z��g���K'޵0�p�R�(�-�sdQ�'�r�ﶧ���lx��Zj�i��T�C�Kε%�����"�o�D����i��J�i�B��[�Xu5w�!V��o���,v�iM �� mG�b8ymNNA;�/'��.�-2~Rӈ��\˺ ��y�Eu
�u��X���l�/�7�^��y�������S�Z9 �ۊv�A��͟ނ����#.��;�^��7ZQ�ߨ7��K�"ֺ����ʬ�I,�h'�1`��}%Q��tIa�,�s�%��S�w����� ������{"רu�s��g?����;����0�[L1|����}]���4��%?���0^��>����vʫ��'�*ݠ�=��WO�E ��V	��u4�Oti:ᓺU�&�|������.G28���dkd��Q~�� ��).�������v/�0x#���z������	1�B�t�� bT�ov����0�i7���km��
x��w�d���@*���Y;�)%���>����K�}��᪸�����<'��v�V����§�O��OO�����m��;\�v��.�r���	�q��y�~�A��P��l}X��/��I�Vs����g�8��>��tG���}$�uUҨI/�����s�ʻ¡��m�Be����T�����?WxNgyU���f�笙�'_9�fP' V'��aDzߗ�yv� �������+_л���5w��{#�r(�K5�VS��@r�c�h��X�Ӊ��K���i�5�`l>_pं�JG��j�l�	ִ<�][ʂ ♊�W8*����k�e&��׸v���A��	���{�ېW�%�O@޻}��<���
�@.���<�%�Y|u��^��O���m�q2,�&#%����V��C��oFV���*���l�fH�l�e��HR9�R���2:��~D�bs%�[�\����+����-�"��*�@��3yY������7NՐ͒��mP�6w2�@M_a{O��VR�3OMr&��e��6��W>����JfU	֒mǃ��(��vS�����g���k�V��a.%lxY�AD��1�SY��=��*�/V��/p?@��?���iv}@;Fo��<��ܢ�]e(�Ⴍ�֤��13my>������)P��e�<�w�}����%�NL����겧JO���_��mٹI�X8o�0>S���c�Z���Xz�|����^y���[=�&�%�MG���ՏF�c�� �~��i��E滋�t��ǆK�[82�+�U��նE��E9��ȱ<IS��"₦�qG�3Z��p���
� 
B��`���X"SM�4ĸ��I<Sũ�e4ά5��F$pHG~I�Ѕ��Wy��K�@���bA��hE���ws
�ĸh54���\�.l��Yz����60U��s����\��UԆ��y�0UD�E�9�V�\/H�W�E��:���h�?���� ���+0L@%��;?��;>6T��#���`T8k���c{�v̸5�/J��ϋo�6I�
/�Rȕ�RB�j�����U����b�Z�pG�><�+��\a?߀T�:do�o%
�cEs�.i'}���0���6�& {`"�)�˫Ӭ=`��K�|�ե;0��DU��Y� ��x��G�Jѝ4��:��
k��qB����v�e?��e��N}���f�3��N�|m��v��{�����	�5D��.����3���|f�
���+Q��� Kҫ��<��z	!�3UR|&tf����ѫ���<�չ��P��	�?A@��/�p�����]����8��}b���BI�u��<=:z�".	�dd[d�=����@��G1|�U��l���7�`Oc�(Q���t��BH��umPD3 4���̪W��v��v@�s���Kj��6���IF�W%���m�8��H�tR��(	�4P{��������"��\�C���Q����?0zd!3�L��<[_S`p�d���A���[p�^�����q�=�ȍb86���!���6R�AS�'�B�)���YǾ�	�v��7�I�4��Ϧ;P��������R	?��I�}�ņ_�-���K�J-�!�����_ΐO���
��a���҅.@�(��Q䰉�� ���V�TӃ�s���~�~�	�Q|e=8�#UO�,H�9�U��/��,߆E�dِ��(���jQ{raP���O����n���Ζ��{
��i��ELLbZ���g���䢦[��gP��������Ķ[
��h��[�2�;qOk��`�x���${�7w�]��f�ND7^ �X�� �щ�F/��t�ND*Y|�H%+��āI'vd�3_a��	t*�g���=w�t4����/��P��pd��KG�,�6hW��^k1z)L�GL�!r>r"�.Mk�K�6�_���ODg��c�f�z�{�`�X�W�%�c�C���h���G>eT7�S��K̞w���JC/BD�j��1�+��'��80.��� o��ab��k��F��WQK	;Q ��Ϙ���x��%���ߩBvg��w �֢8܆j�w�;������S����S����U��H1�̚���� $_�o[G/�w<=�z7�x�a&=3�8-�L�	�X��0f,�:�����g�ke���j�{�����>Bo�')��׼��"Gu�dI�`����<MiӤ:��p��1�f}��+qp��I�D�f��uoq�ﳉ~��F�M��ZvA-�~λ�p�h�2?��}�
�R�UOm�'�}q �Ƙ=�R�C���q���!$�Scr=�+y/��E�Ҩ3���w����֯zu�m��}f)���§�*�Pߏ�;Js�D]�3@AMRv�X�>$��R�?��vY������S���TL&
��sj��e��QB��H��V3�5L�	�M�y�؜ �"��T���}��ꗦl�j/Lm����O:Z�bJT6�R�7B����+7�xt��N2�ޑ���Y�(�a���x�>9ӗ�[�_��=��>`�1��Y�V�
���O�ߙ�;5 �OL&���T �W���
gU�i�x/?��n�6(,
����z�=J�$��ʊ��<�����'��q�B������j�_XRO
q�x[�B�-���u�t����y���>~��f�bzD.w�0���/o�[|Ç\&���B/���u�kOHr��4�_����	���l'&T�N'/U�Zf���#��@.�7���F�Upwz4X�E]B)�

#9�Է���(��̉���I�1��FU�;�FD8�D�١�U��G�!��z�bS����us�K�y�-����~5��#w�"���ѿ�-!j�{�����?�����&�N�u�
��8 ��u#���a��Q�a�����9��v��<g	 ���Þ��_ʳzoP����(���
���abN�# )a����+��o�T+y��Xs}�?f��aV��-'��'��͋���g��AZ�j���síЂ�:���*�c�K���5�!G�>�"�����U(�X���
"[A:�^�g�n
�����E+���o�n_���؀�q�?,?�[�-R�8]#��1͵F���Bl4g͡�7�(6�33f�d&y̴#,�:�^�MGʽ�^d�ӢYi��a�K ��%�
�+B��K23�.Ջ�^I�G�-�JIgg�T��K��;ku�U�ސٷ�.ջ�VeV�,WRPD��e:g"�:��I��Bma�+s��J��1�x(���a�u�ѧ��-��ǚ�[q��o��4|���_�"��C��a�R�':	�"ෆ���Q�^�����R/���2�l�M����~*��9��0[��s(�+븣C�H�$���jS5%�^7ֆ$+�^��O�J��hP��%��S��+D��}0�u�����s�����^��Sm,C{P&B�r�D'��81���!��e������Qo���|���8���Ǳ�C�1U�l�Xt�F�Mھ�@�eyVD+�q\����N�h_CVҖ�>��몽j�ç�V`��g҇�"��H�V7�6K�}��HYx�*mg"��P��l�֑��z�1�ʺ�o1M�㌄�Ù� 0��|�>��>[A����P&���r�B�p̄^�m��A��n�ZuW��,4-�0����q���Y6)ٔ�Y5��]��%g��_c��˖�Ӏ�~�~T�˺+HFN�
��Bi�� Ar��)Hn
F��� ����I�Q`��*B��"fq�S�&�	�Co�{2�@�}p��K��0�Ҳ5�u�/��x���k�޸���;���+�]�Y"��`\�s0�������=�E��
|k��I#`$����R��8�C�,a�{��$���
P5�8�n���AT��V���	B�S��t���s������T�"F$,б��۾1�j��fz�`�
�87���`�����6�x��1j<����Q������	wt�O^
�����ڂ$��f;��UfAn�܇�L����z>���A2,�hqjK�~�����V�~�
��\AbW�0j�l7n)���>C�PQW6W���Hr��y��;��NP�Y��Y�f>�5fX
�A�|��7�	�R3�JMOO[�`9_��i�xqD�����l���
�kW�u�k���k������|��`�X�XT���q�C�����<.�&>���$6L���g��Ye���ji�Y��UB<�xkD�	������,�ʸ��/0�����w�@-�ư �f�`~fۜu�N08�i4-a߈�&e������x���Tߍ�� �r:U�2�����]�}bn�UU� y��)j�����W?5����"l��i�wˏ�i$�9��i�w�8
_f!ve�yq4����v*��ؑ�p�C������4ݧH8�?��P�.��By����':�1U2<��PI��&� '4J�5ǘ��3��������j������'���~G�7KD�:$��\7�0x��_�xa(%�Y���}s��X=5Q�?�f0��d򷀢*d_�������-^����A�Բ��˩@�5�R$�!�j�웨��RH[y�iyO���#})�,J�_�k��7�3��\�/4����B�vq���,���U!}
HYC��P�d��cX&g�z3L/����z��@zzn��e�y���kL6����n���׬�����`��U85^}�7`�-5�S߅�^��F�0hG<�cH "�Q["�d'ث�C
� �H�*S������ג�oO�4�:NyL� C�5Ʀ��`?ߴ��Nj!X7Z��.ꖤ
ɯ�n` 9�u+���ԅyjy_)T�vT�q�5��4��,hE��h�$��Sr�A(��z� D0�)�$M��%�^����_����`�E���qϦ'/>�
e�X�3���W�+Dq��~t����:[a�k[�^ہKzZ�R��f��8w��Ȝ�G���9�
�-)_�+�]I*b��Y*�}��F���5��T�g#�Ȱ��v]�4*+�Ƣ�C��$��$Hk z�^����}�: Vd����Q;І`b"v��'���#b���6�j�!�'�3�e'�0_@g���A���FGM�G��s��QwN'��hDi8n�h[kÒiJ�3Z��$O�q�v ��O�l�;�+s-x�U\Y}���41E��z~X���I
�7I�a��n#�ʬȢ/x���Umϋ��IcA{l��x�ZP��
,_����:���$	���쪲`���п ��|�_D�.`��ה�|5�@�)��@A�P�_�������/���?�6�\~�Y�z��$L�Y�3zK�a�ry��J�=9�niCHcLl��e�����h8��S%(�!qz�(\B�%�+y�iTEȊq�i&�q���,�<���S��` y@�F�b*�;v�[p���
?ѭO��)E��5�L'?�Ւ�<d� �_j�h[��Eݼ���O��d}A�C�ɜ�� R�)��y
l+pN��c�d>h�����By�;	��,=�o�u�u��4�+H?o\>qo?\W6�7��o~VGF��C+ye��t�Z.�%�ó����L�+�}k�����v��{I�L2u�}����e����ۢ��q�+���C%��a�6�F��#1y,�эo����U��D�ME<��8�н(�c�&<�r���@̐��V�n6�_�$z�����ݮ��4A&����%�;ra{��0<*C����O��Ԗr :��b�G��Gj���0����o�ǰ�\���sN�|L��^�n��ɋԍ�4��D�`$�%'A�ßӠ(��2ǳ��*9~�i��j^%v�yvK�B�6
]f(G�f�C�h��ph�tf fX�rQ��k�%�n�ۈMP��)���5�䦋����A<��;����B�'����\���Qocn��oI��@@��c��?����4����c&3��״G�I�͉`?4P��'�O֙������`���Z����_� :� #~� �Z�ۥ�C��h7-�8� @s@ ��C J�3���C�UꑴEN:v�&=�\���9?m�a�q�e�`4�q����ֆ����Q�Fi����&��蹤T�,���]
�}I`\��cځ����V��b(_��j,��?��W�M�O2�+��O�`��Z�N7���1p"	�dHsـ𧶹�m`�_�03�_dEHqw����qÍ���^�<��[�
���`������
�(KN�O���*����	�KB��~ ��rpa��Ħ_�ǎ)ɵU�� �4��_�O[;���x�y�c�Q|�	�g�y�]wQi��\}Vath�z����旸b�1�Vu�p���15�RC�3p �������8m����izC�G�:��!@�����[C�6�"���q!����=� �K��2C$6��� O�
u#`ݓP��/�h��A���hR�;����"W���A����&�s t~n���7����wA��)�V.dk���/�6g�I�,�CLk*-/-��H��q(����:"]=h�����@�s^�#3nF;A?�?p!�j;�AR1��A'���W7��ϧ�	��������$�`u�A���
���&l1{�����"�Ϻ6�ʡ�?�\->G���wxD�U��Ѱ�TM��J@��2ȭ��	��B���]u��Yd����U�.���c��^�g���Z�G��uQ���.�Q�z���Q���J����p�E;�;���Qh��aR=u?��iкbF��N�!������И�a|# ([n�S���hOn�/�;^���(�GD��B{��Z�vl���3�9��`̊|��[����hD�u���S���=�b�5���g�%"���Z|蕫�l��*O��?zګzOV�g�T�h�?���
?Hc��Z���h-�s:J����o�����
,�+�%L�B8����S�9�ą�ñ?�����m>���x٬� 3_�$e��
Ο�F"��������^
�]��Pk�����ߕ�Pp2����G�ĲM?tT�g�r�|�3
�j�h�!�L�X��t�;����p߻jq�V�O`�;�H
�{���h���A�֮K����wn��v�{Ɣ��d~�U��!B�����ġ%F�
�l�3���P�NO�7Ԙ�!2��9�����p.�I<��'���@���7L�{�%(#�����t������-�����=-���Y,�U�hkX�
*0?}��[ ��!C�NK�;��>��(��z���Inq�h��4B��-vFn�ɭ�v<ݠaʋ�4k>�U�����
�Yፔ��9���ۆ�enlu��ԍpP_�3ZҼ�?�牧)]U�[����Ŏ���ԑѸ_�neN�hE)�I2U]B��P:.-H�ꦐr�S|�f
�C5zzpTUv�?"�
Z6k+̖�o�T(L��v�Ź˂+}����S��1&���Y��%'?�?I�$2�@J��.�5�)a��>@��)+���"�4=�x%"����hrֽI��a*�:u�+�|��菣G�����Ϸ����D��TPN�y���[�`a���>?�0-���@i�p��	���*��J�NH��)&��n��$��0��T�-�t��-x��v�[��"�+�IZ��˕��5�"ִ1�ܟ��?�j%d�4"��N�J<sH8����oM ���\�)3I���|��C�Q㮿�aJ���b&�F��2�(U<��#�X�K�����d*��+��Tvo�0%�S���r/l/xX,�>�I���D��p��5��B�κS!V�k�e(��p�dp��e��do}�  H̓�����e���:���-6#o�~��G{[]�ޛցߟ�/��?tw�%Fo�a���{��w��b�����t���PS���r�;rLB[G��6v?J���f�E�`l���t�|n�tG��5�������)����ڠ{�r�Y�a��@��(����λs�g�@�wP�zX�2�*�8�;쁯��J�>b�}���	T���0Ϙ�}�#;���a��j�W���sW�+ �C/&�-��&y
���k+�O��b��|�����fWp��ޏ�F�P�
�o����S�� �Q�U��2���ϏV��!�{�޴�S�S�9�Z���F��Qp_aQ�w��7q�|�Q��y�D�S-xav�;l�:$�Q�Y�;s�H��ք���+��H���{l���MC�S��Dyϓl� E`��a)y@�>~�����8VB�j�d��V�������aM!�""�v���ݠ
��?�F�~w�-J�D[���j-�.+��A�ڽ��<�f����~�t(_�~5�����^�=�¤&�|�v���[k_���n�G������v'I������xM[ y�3W郈���Ɩh�"K�.HGΥ�����
�a���%����3����6���
��� f`��p���V{t�k�rd{���'��_���Q�G�X&��N�09�x�N����v�ڷ��A�Lt�V��g�.�
����r�@����t ��~�#
^�-�ER�	vȖ�k�b��˶����vN��7���4M/~��>}z�����n�,9~��8��@�^3P2I��	{�Y�e�z�r�pjX1�ޫF�u3f3�zJ6C��P��I;�h�K܅C$���.
f��~�F��6�����+د�'Ԡ����@_1�������d�0]S(��5��B�;�����c5��S���,�]�IP��Q�oY<F�E�.�Ȃ�^*��#$��=���܌��f�Z�&,��$�=��!o������ͽ���q:k�d�2��Ku~��1ҫ����C�a��A\<�%��X��g��H�*�/���U\:gڞ�ӖDg�Pʊ�5�����B8���[ª�o��K�m�M	��ߒ�{���J�	�,��P8ʩ���n�x�5iȄ�`��e�{�m�Q^����1��
z̒�������jN�Fc�J!h���я����J$~ю(:����naU
8���Eݠ�qW������X=IcLP����P��E�Ո��w��ϼ-PD��Z�0b)���ꋏl��o�e%c�lz�A�^�>�`�FC�3�����8jdxqlǓx�t[@0T
��RO�}��ڍ�b>����Q���"�l0.�@��`���+ƀ��hPef&���]�H��n�=�����?	TB}�XeQ?TϥAa4��X�\~� �����f�4)9�䐌�"�xm�f+������5ıc\��,��د�Bf���]�9����o�mG<���n�t�ѽ&&f���:�S��%�9�Q�Nnh��:���=@>����\?�7�?<��0���w���չѶ���"<��,�%��K^�.�*k}H@�Y)�A����j��D�65�*
���%��k�}{X�-#tI���7����$ҁ�wX*�V�� -���Æx;��G!>jqz���N��Rj|�)��SDP�0�Н��t��j�V��.�:��� 3�.����5����/x����'XA�1��{,���ύ�0�ff�*��L��'����uͭ:qe����N^Uw̚�Wԝq���n�v�_t��k��]�oy����d\A�R�7��&.��wN��.4ʅv�c⻩o�ѷ%
m^�ք5v�B�����&��l�;�Y���[�v��ܨ�G�J���he2q���ή��OSXC:Fb�^������g~I}��/^���ڭ���ek[ߊ����(n=��Q���D��v.4�ش��u��D�S����>{���GEZ5�( �u?N�cyx8�nnmAL�lC��
�j�H0la�'~�*�Q�#6�������p���2QɃ�Oo���Oݶ�x�5�Tbv�g;Q�$;nK��4vY�`��H�շ?�$l._	����uÝ�d��R�V>��P���/,���F
����V�n�������n@��;�Uҳ嵔%K~�M��*K���P�5��h�,�SR��! Lw��62#	z��l�/8VY
��"V���D�ɵ���]�}B/��4x�%W���� :��������؟�C�*��{6���ty?�05�?���j6
��y���Y��j$,���5n5��3�(Pa� nx+���n�C���
u�_=���^���@D"@1�M���Hĕ5>���op�0x���C��p8V�a]x}`I/������|1[�q�8	\e-��%V��8,�����"���u�K�~�c}���q>	$2�62�_�g����1h#s��V�� �%��Uc�Y�PW�xd����}Q��h��,�_�&W� *c:�e��Pŋ,�Ŗ����,VV9����k �sc[���������KKo��[�Ɍrv�2s��Q*:�c�.��u����?,�$���JHf���/<6����/�Z���'��lW�=��J��y����j�=_��MΩ�R�0��6��\��3T{�nJrL�4���hA�))8Z-(��/�M��Sw�q�
S��Jy��J�g��珞&�T����qL력�zs��11ݝw� 8��k��UL���:-��X)R���`�~B���@�gC��(_0�혙�6�6)1��:EJt�;�}EVp��q��  ȴ�;�J-(�~��܄�^�z�̘Pa[��������ݣ�N)�R����p]�_�@e.K�m,9�/�uH�ӑ�h�3��	�ů��q�_ � )�e
�<�c��ʗP�͸"����0
�Э����:�C��`���eB<�m,�D䊐`o4���	C����o�זR0Y�����j��e�գCҁ�vH(�<��ȝ���D�KI4�R4cC:��Uqo�ؙ9�,Q@�p�~MH|;}�h�b�_���uX9�W_I�B�ŝ"�b��l��O�Q������ZQ��֪h+�qe�mOڦ�ªi�P�����M �..�{8�&��@9\��a�Ыr;K$,�\b�S�ҩ�
� M��j���0�V�Beդ����@�ۓ6��ke���PW����v�>[��ˎ�X8\kAo���ϧE���#�Xv��{�������� zgK�?
	S�V��|�$�P�D�%��A�${BV�'����AhV��P�@\�?3�B�'��;0����{B�ϧ���Dݏ�����lV'"�Г�<4`���U8�u�B%�/)�L�����b�K��[^�t���%jT��%_c�J�"�h�{J�)@�t[��ђ��g�&0�V�-�~��7G��|K?��"�?"��D���1����V�-��?��+�'$�RO���7�9p��)]��J��e9�3�B��	���c��Z�bDdh"\aT�5�~�#�����m�׶,	k�<wKN�" �
�p�l/a���JO�R� E�T �׳Ye% ��D@���g3�T�RRxr�uxQrm0���0
&�L=��1�O�d��F�y�~e�g�&71�|>;�ˤ�'Ζ2�f���`h-}4���Kf�?��WI�p7��#�В%"0m���e�~���+l��^�;L�v �Y�9�:yn�
	���dL����7^\����W7���]���[���bt�O��PH��=�X��L�����rҊX#��Z2����?|��@N��B|T�n�m���Q�������a����0�y��~Tlq�$P���u��[��6T*�=� �h�����ƾ3A1L1��ᓽ��$����w�A{�Ŗ�1�/�+J5���f����Z1\������Ƞ�-f3��"�)�{A�A���Znp��%��M���
3�#Q�%�5�C2��OY���F�_���v���=X�-
{�_� e�e�� �6	�c�G�>yS������衳��U��q�%�!*���@S�;���o�����"����K����J�Vxi������b��T{�x"��*9Y�M���ڬ��54U���e����lQp%8~�W��%��|��>�{�x�Z�Vq�S{�V0lu�w(O.x��쑁�	���� �A�Ǚ���Z�f�:w�f�W������уJ6ǔ�S�(�R��F�qC�����޹�*c�P)jR]�M���HXY����4D~qCN�#��վeƆ�,�F���U��Ac�h��X����~P��f�9�
R�H��pG˯�<[� 8
K���f��V`{ζd�B`^�ώ�'�Llo�a�,�8�4�r��Vg
�&!�D�������f4�mY�EB��^c�cl��ozSl�-ا�K��Hٖ���
�[(��0���w��Z�&ӏ�v���^����p��^f�m�!��n�f�O�VeBy�������ʽ�L֣�)jd����ݳ�R;MëY*=Ԓ��`��F����O-6i��b�i���kO��]��K���~�^}�5n���
�Py����w�::��h�dى4���yf�w���xMGn�!��b7�k�/��4���xJm��K�ar�n���玪l)v�M�\�u�+�'�^o2�m�Ny�
Z����+Q�c�t
���+��n1#Ν��0�[���n�  *Ԋ��F��P�7ex��Y��=^`T������Kk�AzeyV����)n� ��]�������]	��LT/���[�(��	K�9�&A}�����Q4�rVF&	H$��g�ZP��b�~��^�馥�G�{C����F����Q¶ܻ�6$�f&���_�i��%m����
j0�Ss Edz~� h�Ŝ�t쁉�dp�'�~� �E
�^�Kʡ���{�J�8�R�k��P%<�ƃ.�6����˕>u�v��Y����|�n
:Z�D�0���'K���PD��y<���U��YD�%&�G7г!Ec������i4�gm������|��eZ��k:��q��+ӏ%������u�~�8I��Y���[b%)���@Z9s}Y���P��\q�����
n3�ӥ��U����z�J��O�l�U�����*����q�E����}� ʓu��
%�����N�+gg��؆��ϧ�i=qYOl���,�_���Au�
���6o	Kr7bE�ˑk�4>uS�>��U?]S�>��U��Ԫ�OSKs�[������f�
��4���l���\Pv�j<��
Wlq�#��Y�u��9��U?m����]"�v�y&fW�1D+ܗlcY�n�ڶ@S�������5� O�+��D[`������k�3��gi��O��o����vX������[��S��!���S4�S����<7'T���(���<��@���!��T,�*r:]�y)՘���  �� ��s�x���v�ƕ ��{� -KI��̕���S*�luk�Vɒgx�T�� ��D@IQ<��JK��v�g�9}��Ɩ�Z���Y���kd���a� @D H��j���bf��ƍw��:��ɨg��A�`��A�����s���hd{l��z�w�lw`�?ծ;`N`�j����'~���_��1�3�m҇Zg�����3=�:�,���[��}T�����
�m������3����JW��l|Pm��a�^�?��钱'����:��Fe����ۃJ��/�C�󷛗kc�⋬��tl�
L���"_��:�s�~�Y�����C��js����,	�}g�s`��K�7��� #,ԁ�py߳��ȜSl�� �<ۺ�����z�$��kv������_i5�9ok6�xGy�h��ϊ=c����G�.������Je�m=̎4��
��-���m��q-����H��*�[[[l4��]0�uG~����/Im��RzP1 �2��k��9ր�S��e��K�����p�\��?��5���ߦ��Y��^�Ǧu�����c��&�� ��|0l�ak.��g�q�֒^:��Z��xv0�F��3;� pG������5�
������2=�����L�	�����.Ν�=8o�0ҁ8�m�^�����}�׳G�#1�lqg�zh�f�^_d���Y�=�~9���;��['<����+�]����X��2��X����'�}�f5�>|�]=��7'p�Q����]���l��@y��i�|�v��D�u	x[qʅz��m{�O�S��ͦtz�6)hs�U:��A��s�Gǔ?,�7���d��wf7�w���
6}gzk�����U��L?�ޝޜ~<���X�9���x�����+x���i���#��ٍ�E3��U�`,0Fy?���^j�a�[�X|_�l��	�}���!n���ϯ"K��#N�N�vi�W�b_����`�~�_��:`��6��/IW�n�Юyv�%�ITYO^�Wk���'x\��rB�펭�V�۔�$�G��-��ѵj="���S`�� )	&k�w�����A����8 �I���g�#@�oħ�8�a��X�N��n)�0��}��玞�w����X�����d6���KE�|��s-�g���q��I.�� 7�y^d�� ʿF��d������x���=x@�:Itn�	�����Y�}�KqD�Sc�4�K1�4s:�x���:��c'�^�=����9;���6J�Z�),g�`ub3���Ә~6�˦����������0�9�!͂#fϳ '���ѓ�yu�����'����G(�'�݆q�%VZ�L��pb�2#I���j�{JB5��S���RE��kCP��؏ �c�@��E��*{��c�$�
 ��/6�i�Fqr�$�ֱ���c��c#kg m�W��4Z���Q����n�c��;Lb�
�[�%~���H"^�@b;�.	�47$�ZL��_�ҋ��I��1�H��h��)>7�ω�6��5�>��u��@��	$�_b�W@�����5.J}
�ٗ��l
��/�g k݁^��P��cx�W7��/��A�HzJ�g��ey 5�@O�� Hwa������Ŧwg/ޛ��r���/�W���|��=/a������pV=�o�@����z���8<#)Ց} �~u���O�ؗ%�@���g�9?p�,'Fց�u��V��Vs�r>UV��=</
X�rN��� bn�HbQ��.)�B�`��Y�"�`���0?4���+'�ZT<1�����榓h�O��,��U�������&I�_�@Mnyy�M����f/����������@V�ڼ���ʐZ#��t-���qgwf7�����s�6���:.,�h�U�I�aGR`e�&�8JN#2��	�%��{jC=b�ut�>�W:9�� _�����y%��4����">���1��dwps	�=g�G��n
. �=��g���<����]m]A�teZ<)v���[�E��3�>�>���<�_�W����vO���Y}�W��=�������bh%�T����@����R-���Ƀ-jx2�5�m�%�y��8,��m��$�q�_w��jc��� �I2^�Ȉ�1�ZA��*6L;_ٗ����S!_qi2Z�a%�&v�q�2�9��5�pE,�w���O<�+��K� �-8�������ΰN1�(qTㅦ�������]8��d�>�_�����3�U݌�T�0�P�=>��*�L�V��mgk��)�ňF_[��ftĸ�f���y����&�F��N&~!�k5G�_�0�v�O��\tcEM���g���U��2/fhX��3v0�d�bx�?oJ�"ΕM�aE_:.3��` ����}�̫25D��[1��KȺV��
�U`�����Q���,��m�s=<��:c����;h;H)vn&�VA��"o��EAS�h��3���K����
<���1�t ��x*rޖ���n��۸�.�u�lڹ��	6�|[Ԍ�9r0`K���uQ��hv�|ؑ���7�g|�����V޲/�ӂ�d��HY�����@E:|m�G��<�֌�57GWC�L�Ut0��!�ަd�T����9i������7��_����D�z��Z
OciIe��I6����� ˏ�PfQ�⇍���kw?�m��UE�iꅾu�[w���W�"��o��
�U�f-^�Oxxͯ}���g��M�%�����{`���5e�],�~�=306�H���j)r�7����o�Y�-9�!��Ax嫪��"�ͣ��uM�d@���eL�� ��S0eSk�L�^	��Z�Xy%k�H��nR��&+��$0.d���;K�K��V�x�V82�%�u����V�A^��^�鑚��w��O �3Z+�9���:��;N �(lslu1b����_��5�7�&��j�ԡ��),�l�*l�*+[
1���hZ^�ON�fYV+m&CU"N'�3�
UF��m@~�:���'�^�+|��쓖4����7k�4/�} {��Q^�mr�">��6@m�fCc,�hLّ�@-�7��1��$�c1l[�y�����$���:Ig�n�� �;��g�n�#w4pF6�!襎�<��!z�H�uF7u�I]�i-MR���T�v՝���0Bx�84��5%�N��t<o_g8��.�g֎=��E��a�m�Յ�|ި���DJ�����N��V�W���N����;�� 5/)��ЮN ��<`���k�l�ק�p����3+�Va7"QS�&�����x^g��x��^�|0x�#[pu�	 �h�ւ	�i�ԫ�B�/�%߹m�<�G��R�0/hB"��ߙs܍��g���k��|ĭ����àfr{���-��3����wFp�X����0PU��`�a��A�*<�/6�E�k��(:3�%-Y���8��P���P`"�����W��G�M��!<��.�Ҧ����_��Y�_��9Q�`�{�p�Ѫꏼ9�mh���ff��vG��SsJ�B�8�����K���p@hL����7�ձ;8�sG���Y��ˀ]��3 Q�~�����tU�z���P��V��v�{t5��B&�f��4Q֐�wg7@�D#�� �w���@s_��ΗnM�>�� ��I�]�O��'�x��p,NB�
�5� V ~>�3��A �p�]Hu��r��5p^��9��q�l4� �����������1��k����A�F]�l���vee{���ۗW��Y��C�W�������?�ޙ�q�����٭��Ś��(�ޅFj�{)��^%�s*�l�3�
��dά4�>X�����+p�ߊ�O~��l�:�k��y�eEI�"�8�$.�aXؘ��48���ZO�"s�h�<��� /��i��ʿs����0��;4�?�����>�\�[� ��߫�/�u���'�`��\tc��c�<>��t�_Pӑu�B�0^"��ۯ�}O��s����3å( �$�:�h!ɉ
�1l�ƈ9>�گЩdG����K� ����G�7����� ��Mi�H&H],_�lR>Oq"�2����>�Qy��:ښ��r*�X3�m�k����9��W�!���0��@F�0��1p�tV�J����>�a
��1��� nq�!=g��ۜl���8�{�
I������fo�!���;�R��3�#O�㵞�莢""���P:Qm��B�
��i��ƛ�'�t��i��lh1 ���*K���Q�e���rh���Z�h�c_�W���sg�����?��)�P�<��Q��Mh��>�OK�ɫ�ɼm��eN��`F�ljK:��Nľ���"3��|��%������{I���k;0���a2�#R�PAU��ȋ }"�*e.���jhn�9/�@�,V�T�<�<Mx��z=�'�a��dA��h�\�yټ

^�$%��$��c��[������I���8��g�M&G����
�͑�1o���(r�1�<v
[�b�H� �w��t^Cg��m�e�B��pxv�����L�_T&��8�~0\p��,���ܷ�J�V&��N��sr���@��woo�A�yX�2�c2�pVn��zhŌ������V`���Ş"F��b���̎��(@ѤB�Gr��<�l���гI�k�9Jš���-��B/�˙6D�F{7��O<A���o^o*{�m�4��G��x9ϸ�Sc�S��O0����74>�G�-$�3L�"����V��`���՞�w=g�rY�L%�͵��z۸�0�D�.̈$嗋�f�&t�j�$�����=�A���k9���Z�KNM�釳7(���ӛan���/â������UJ�v鱧���k�Ts)���*0r���!�����ři1��_�����Uч���x���wP͉�>^�/������{��4��w�|p�ho��~J?��7ȣ�\_�~6�h�9}�{���O?^Ƞg��A�q2:�sRȂF�ث����"<��ȹ�v���	&p~xo��~Ѥx;�V���O�4����cLc5���%�5�ś<��b��ޝ���J0��z�Fv"���?�S�Y�KX�#����>����!ݧ��+�mM4�CΫ_��\���*��u�(�
�O(	`Dl{y��D'��f�T�?�_��@��,rcOy&�8J�Z�ў�7Z��6��}}^!?\�^b{m¡B]<��f��mFމ�灤�%���S��	�����/����#�"���}�U���ljJ`�s?u�H�͜�|�ȟ�IJ�0�
�<B�Op~h3��!��Z��.��)�ӗ��y�p�}��A%$�,D�=0�Wd-Ȏ�w0y��«hDFGqڌw2H��}a�!L���K�r��@jc܉G@��Y�xM�`�G���������Żw�?�A�gO8�C��hjb��h?$��4��D�?�p2P?DH�x	i���8��)uƫ�� ��l ���b�>�2�H7�|F��LlQ7��!\�@���`�|�����|�GK�
b� �rAH�^��Mݱ@����/u�Lȫ�ݙ�@����,W1V���O	}��=,�(#(�Zf�7���L��G�T�
n[�ŨtJ���.��ǲ.��g�
� +-)�y�մ8��� �/�']F?͒�q:�#>�t��ۮuyʓg�7�
��/����IA"�����*Q�( ���� �M�7��\��=�|8\�B-'���8�jз�qj���g/�6��uP%�*]oE](Ev���_�W��;����|��D�6]V�D]F�Ba1U�E�\l��(������V��]g"3)xa��iWZ��Ӕ
�x+�L��Tc�1�UBl�7|�h���S�ETXE�GWmj��H�g��(�cFЎ��7:)�'�S
�=��2�9^Mц����ê5	\6r�~�s��F��4�������5n	���,�	���^;�-Q�#��'B<�Dk��#�0qj�Oa��a��V�����	��~�/�ˤ��ؽgK'��0�U��52�.��u(v�Ba�(�8�֕H�����VK�5�V�"�-Btu�T����L,�����\����w�X��^KX^��=X2��#J��@��
,ع�pM ��.g�=��-�������x�[�����p�u:�5Ty茀��K��U^��s-}��Y�Oʵ��Yh4��i(�R��hT�`��J��Z(�t\���W���\H��+U0���o�;^7u����vH5UK�S=�U��26R女�����v`?/U������}<�W,oSw-����_Nx���O�&�܏P@^4�h��7��p�_dMM�5���8���3����?��Y͞�	 9�=�{ݭ��U�ņC����wϭ�G{�I	�|N�9��\ʫR�(@�(ȭ�����m��Oƺ���j�>��a��\���0�����x��dAӬެ�N��[�.7���M�:��U�{ ���b~yyL���o�F0�ޱ�n��sb̿y�Tj�����撦���Ғ62E7#BHɁpa8M�y i���"I�YK�
of���������~l�l��R`>{���I9]v��=�sl_�e+�.IT�}A&M���8bNo�-Z���2s�Q��߾�(�k�	�1}ќ�[��B��ԯo�Me�D�4{c�I���<'����0y�C����s�w:�]�/�⮸D�����؃�#w��+I^�D��Wr��Cd#��]�uq�F-�S)�Ϟ.62]�Y���H�FK��iV�E�ɹ~㢅�����N$y-gr�6�ƕʮ3�
N�ԓ�B�fn��jN~*9������q�ڨDMa�t,�an��
����߯n o���T���m�(c&v�J�a3�V=��Z��GF���i�1�)��0˲� �,)�1d�9�J�`][�W4˲�D&J���(��W��,�N�� �ړ�XҢ�)�<>�������:���ǰn��׍{qX�f �{e5�'m�U��VR�D�>%W��:�"!_5�R~�a�=�
ӡP.W��|\�ل;`A��gHr���@H8α~i�W5�\��D�n�r�
e�{��${�vL,�2%�vo�^ԌZ<[�B�On�7��M��n��,��,�w��7�Y��e�F�AO.�#
Y�����c��܀m<wr�Y�$r�;��&�m�ѷ5��]�/C�����$B�9��8|>�p�[ld�'��m'>����<���j6�<hJ=׍ ���؏�i7Ř���z���?gEϳE
@��8���x�����F�^�
Y��%y�`��0���}&��s��=��]G�p@�J Z��+c���cD���h lץL�������TW�����������>��Z�
�l+j���F��q!��5g�Lz�_��(�s�D��b��H3ͫ�I�e���ַ����L�
|E��r�R�!�Б	�������p*|u�V85�=i�K�n��Z<��x��s�˛�LÒ��y����s�
j~�E=uw���-M��;����m��J�%�OB~�9���E�I�=a���7
՝���7���:��8y�k�楥c:����%R�:R�H�d=�	J�.P
L��h$ho���NO���0>����)�~�������Q�$��4R PEx�'����y �v=wXI?�4~eI�*Rk�ኂS=��5���3��R���I9s�\��R�lh�� Y��G��7P���	40���Ѧ���w�TeLp'wH��8B���/3�w��c�$^�d�}�Fr@5�����׫b\���c�̘\!Q���`�g�Vw<�hW���C�u�R�+������� m(3�s5rY8�a���YW�B[n O^Oicܱ=����lW ����A�/�"��G�1�|���0����[l%��cer_9��/U.���6�4X�]�6@	�E��)Rp[Qu�C"�c�Fx?�rEER��W>�*��P9EUV-1�Dze��H�8
5mE�R�דN�4{��57�b9�`�*1�yE��9�4��9/�gO��
��X刁�a��RY��D��
�&-�z�f1�,� �IH��SȯUC�OWa��"�ϔ`� ��v@˛Ǧ�q�H@-�ӱa�M�Ƅ��^U�A�&����b�r�)���)�l�X-����TC���$3�lNϨ0�p`��h���
��H5
���ɾ����M[��#�/q���+Vd�7�U�k
��XHi@��4�e�x�T�e���K�N_s7�i[_֨Dx�h�-��b��Y����l��f��P���֌:�iI6�����*�:K��s	!�
%�����#����[����Q H�Dk	(^��ũ��2�4<��v�q����7y�K|�ZS��#��TK�U��Z�y�0& �2����h'��K�|Ѷ���?qm�ńU]��7b;z���zh�$�s��Vt��N���lF ��K��\�3���%>:�Bo�-��ڔ�2�7�����S�"�[�����*E�����׸���92����(/kD���#�e}J2>Y����Y��)�������yrN�y�w޴�3��)��A(X4_�]=˻v:��t�3�����
O���+P�����b>
E��
�x���F\�=3�"���Z������"T�E�ܰ�c��+��/�6r�����X����z���.��|���dɪ�@~�p���(G˷8�fޝ��+�	c�eO�������`��E��E�R�;��4��?��z�ڞ�@��P����)�#�w}�˃��hq�������e*�H�ϋ�M��-�b������t >y�{�������`����^	.�P���N<t�UI��7;muެ��Ikso�Ҽ��.����3��W8�Z|�s���R:�0f?7b��f7~e�o�|��Yݒ}�]%�[��
3_s�C1O�l[�r�i�H�� ��I^'���d�?���NU�ꐠZ<o?����
�N��3|+���}$����2U�e#O���󚺤��J�;R�gV2��{�.����1�S�)*��]I�{T�	3c\�@�B���/�N�z��K��p@[5`R~p�iK�)���{�]E���E�I������u˫T��#��>��8,��أ���U��]��tE
C��L ;u	gUY�����o/jϧ2{@;�t��ڢ�T��B�̙��C�QU��ݓ;��/�4�0IB�*E��Ps��ȩ�D������Ⱥ�u�ѕz�DQ��Yʾ�u����40եoQ��j���c�����b��E�S����������Ų�z�f	��ЫV�.^�ZVLL�"9�hp%]��=�*�Z����P���]�;����:�}��D��aUJP���#U&��a�Pץ7Jj���}��6�*�+��w
"Gi�R�����VW�2�j��ҮZ�2]�0u�r�AdHo-�����t�h+��!���u�Xq�S�
}��BG�L�<��E��H� /�>{���a�wJ��&/v��~�e�����"�c�j�\~vQ�t	޺1�+%RΖ�
a����o��
�u�p#c�
�����8F�'/�������3­��xm���b�g����݂��2��n�,N����aI�!���!^0�V\�x�� >ǔϳW��Y��}����������g=��
�xk���O�$3D��k���Q7&l�r���j�����Nώ�SE3,i��w>�y-K���F��"��
��L����P�ܺ����',����?��n�6�-�p�6l�����z^P���/���Ei�%&6çӏMݦf��*LS^�]8�3Ό���Gc��|�F�h;
W�����������������etT"1�s l2K���glqz[��f��ʇw�	�|O��\����Z2���.�#��a�E�qĠ��G�:5��3�';iŚ?Llde����;%mf(j+����n4R��1}f�l�U�V#��Yם= geqe�9׭��bF�+�C�m�bm����Hc�ȯ�ix�"q{���)|P	�:���&�*�TY`�J�o8��0���C~g�!m�׾U`��X݀+��&�7,h�t�rh�P�P��.�/wC�u���|��#Ix��DsO�u�v�>�+�K�;K��ik�\Y����
�=Ҏ#�]��a�u��LSg,%��{��V������o-^�3�����3�Z���б�y�&$�)L6m����v�y�D��!�J����
3X��X�1��h٢��u{�ݮw.�l��@�m,ܡ;	&;�=Z6����h.��Dx�E�ol�ƒε���G����`a�����_�c�{��`k��\���:��J���Ua��k�����'���f}��Ѱ��z���,���F��l��֪��Z��\��Qk��k�6k�β�O�����z��x���^kZk��js����ԗ;�Z���֨5֟��ח�V��ߖş:ﳶch�k��9�h��֡�z��ڠ�ۭe��^]�������. �u}o~W�M�g�2J�)�	d�I�������^FU�p�v��������%��|a2�7��*Kǌ��	��W&)�άp�K��x091�~%��R2�R:�M�?�k�êE��]��R�m�u���V�5T�a�B�-lm�BlW�H렟'�C�����voqI�K{J���x5�g��d����U��0㕑d�;�
�g��3i�����<k� ���$Q|��O$u߮_>ebY-
��x����ً�K]���Ja�&�诡쯙ꯩ�/�5����WS0��zޡb�E=��_D>�S_����^]�x�$}P�
�5;8��e�����pw�
J�<���i����i�{l�Cq�s�$C8�-�Q���Am��{���{ᝳ��:r��0���|�=c�����g��C'�,z�/&�\����7������&-�0������0��Nצ��x�ozY�
�-��qz�O��u����;�~�B�Q8���ĊL��E��V������W/�x�?��q������v�_��$�B#�g��d�������͆��N=7M���0<S��IxT��������FOx����>� �x'�l�hO5'U��E�a�&�,}
g��;`0�T=�nBu���H'���NҼF*�,JC���B�������w�Vq�&IO�%�* ���Y\D��g�UQʔ
�~��kd6G�����*d������a�x��3�f�y�x���U��WEY޿����"}�?.#��n��Z�ƾ��������uX�q�N���y����	�n����L���W0���郶�;��/����*υ"<�^��$E6AS=�@3.̢�ܨ�WZ���z'eL��̻Mᱛ�����`�L�`T�]+�O���wbp��u}�*�$�s�dMq�h�8O"(�	��k���J]r}wb0�K���]D��I�n��ԝ�';���C��L�N3H�^j	��V������FPi��uؓ~u��P^���j}B�n �ߨu�����cD
խ}����z]u�o��������i��a��Z�l,7��խ���q�֨6�jk�k�j>��Z_��7�~k��Zk��lך�� �W� ֢pۨ�k���\FY��X�m�/���b��\[�x[m�kuhs�V���x���v
w����2>��_7�(ණ�
�� ��6�5V�Ap^�gW���:������Z������k��
z����f}�i�V���F�Ѫ�������7`��0��� �ѷ��5��7Z�;
���x&���뵵�2���6:�v���������
��iU�km�̤�n�U�@�ݩu�h*k�V���c� �wV�-���� *L�l���r�]k�,��3�x��X�f����FӁu�6��v��h��^��4\�O��j����l��U���{�h��N!���n���� �ݩvp���j�/�Ú�`��^c�Ѫ�|�10�5ԙ@��#,x�� �d�i��Xg��j��7�]�f���.�Fh�ހ�6�p~��. �r��-Z µ7j�eB�F����gVi�
\���@l��bX`�x/0��F,�b�E���_�� e�"5n��$�4�9���*`_PlUG0:�~�h������*�(bJ�6@s����N+�����<V�r@�./|l:F���c�Ā��UX>�~�Y]_EL�����uēV��ơF5D��"xo 8Z���;�
��� ��kw��k�߰�
	��� �Vq[��
[HK8�����:��	Ё.ס�҉
��:A����x�� �*�
q�`��֭���aQ�P�֠5G�{F�"�j��D=`�Va�ᦅ��w /<��QB��
�	 xq���M��[�|���ò4�r�q�6pX
a���B}#�p ��G��@X��t{B��������3��B��5���*n�Q���M0
\n�0�/L�N`J�B2���'%%N	H��r�N�	�q��������U�� <_C'-��in?�'��b#{5���S�H�R�,s&�?�����  U�	�*��X.�IUrY|x�6Jբ
��	�<߾0p��2�!S��V�ݚWӯ ��yD�'����|C �"IB ��l�z��Q�V�A�,���Gw���W8���~�S�[���z�Xs4�ơ��P:���B2"C��n�H������ú�&iև��
/����������i!Y���1��d��jB��g��9_(TY���ԖI�il $d&!y�=��y��F���<�t��[���H@n��:��D��*�1rBg��eD��ڔ��\��C(���M=t��kZ5�!��儩�{��5r�Q
y�F��:P���e���)\I@�[� ��
Դ~�4f��dW���X��/3�w	�
��F5��X��BR���� O��!�c�d��+���B��up[��M_%5w�����~�&q"o��;f�����ӎ3��&%1�'|��KjU1���i��Vh�rz��
j�# C"�U���>��K�ʗ���^P:8�uG+]X1�s�;
���x���B��FDl�5� ��k�hVj#t!�n�:$+��'���g��~tu|P]E
w+��-y�F��������J���v�
wG��K�Ӽ�S��3z@��!ڨ�o^"2��A�Q�N9n���x3:誇��6*��
1e<�3zH~m�(�q+l[T�8�� 8�}��b�P8�g�:���VNҝ��J��>���STK���+�׹2)���6%����:^�e�Q�`�ո(5�Geli
0h�k>�T�-�Nre�
ڄYA�dl�8���d#��(ȵ��Q��7�/lo۫��b��.���66;��6TnY*F8g� ��rB��G 8H@�<5��(��8ҫ@Ēx(J������j�FF��U��?M��?N�I�I�̶9�Cz��A�G2�VJ��hM�++��Xy�:�"8}q$�Nbc�^K��[f����B����(�\3�\C�\�'d��8�ڮ3 L�T����M��դ` ��~�˲M5�M���^ʏK�k�����>�Q���ȶ�o��d,�Q �\�9[Z���e�b�0ԜO~�.��9��Ҥ-���ž��i�ϴsk�[�c���F3��3a�N%=����F���E���'��c#���D�j��71��;a���p�K�׆���������)Y� �Ā��K]�P��E�E2O��5�����t��'ր��|���;b#���9iX���G���\�o�$2+;N�og0WR�4XI�
��E	O+������ 	��_�J3�;���CXxXsҕf�����8�E =6����w�{3V*1�=�]�%o�^����"����`XݨK�Li�ѣx�mƏ6Տ���\<iNз>]���]da&>"��Z�����<]i,���^����$�ocU�pdOa/[���O.� �����u��H˯{ �~,�1��yT�=ȩ9ɹ�,L�&�	�'	j���Q�wa��ػaN:��/�{L�����)PM��U�gqa���0�
k�3p��v�l�o[�� w��-g]�
W8-F�3�L�r�A����(p��r�v�u����pZ�=�W1���E}u;m���)��53����q�`��l2�Yd�A��X@�G�;�ٮm�0*i��s{N�}���Wyvھu��c'��dG��#�G#q��<�p���نc,A�.�&lC`�DC�V%
z�K:�3J��[��ț���N�q��~�#��rn�*c�UhN>��vρ~����&dD�p廞㏁6�c �A��Ӊ���U������y�֜n����ş����L|���]�Z�7��k����;*X%��^���t��8x�
9I4�"N┍��)G+A��E�$I ��Q^�p����P�ϯ,�M~��p_m�s�y�D����B�D��+�R���*�X2�PҀc����'L���[�1�S%b`����)Yج�V�/���I-�h?�L�و�*!�w�+r�/�ذ]�H^���nmt�5��Q�YR1�׫i�uR��H�Z*��t!�Gıe��%{=�-	�m����[m���\�aSFO�f���[O6����?��f�/�����;DҢ��%)�0�YK��I�*��C&=�y�����*�=�����G����k�MIUTL7;q8��.�s~�~�1qb�)�UܥR��x��$΄M�pP��F?vv$��n^���w���S:�PP�"J�<�$M�l�N N��� �����DQ$DZ���k9 ,#��������x6U9�#��d�=+޻�@��搌
1�����\�r��R)2Ѕ�0<0s�&�"�X9�u:�}��wּ�ѽDv�8�o;[�ww�ri��>5Il����Hg&Se�*�s7�!K*;Ř�a�| �<����r�ba�cA�|�F�b� xN���0���K��DY�f7(>��b>$�%��~���q�>�l��R�UgJ���A�1{��)��IQ�zW�L�E��F$�r�KlH�͘�]�:�K�^h������F#a�]vy�,�y���Ê�OJ�dx8ꃹ ��WD�[�Ԕ�+��Dr�}abNbr[~H�av��L󸈥�dʹ�P�d�9��>K�15{�<
�a���U�L�R��z@�LiJP, �MJ���c2��_m�pc5��TmhR~FE�[9g�~u��H<e�v�q�*��=Tɣy�hd�jK�(�[�O�{n�Vbk0�5>�u>��tU�T_�l��4���*���q��n���Q�9t�2�P�
*�R9O+��c!
+E�0��	q��'v�D;R��؛ �ñU`��	<����3��㏮�	 6q���V��wn�I��&l�V����,Տc�!��<����=��`��,�&�a��f�̇>R��-֨+ҥ����f�]�.�Y(;KԢϰ)���oK�Q���ƈqi����k�4U�&�jq�ܯ
���&�����g	�'i[%<���@bX��Ow���6M��W���g��r\)�׏�I+��@��ԗ}����*֮������f��׾��iUc����)�bxfl�.a��Js�-ֳ�C �@S��)����#7%'F1#J6{�2�K2�ݨ+��J{�H�g���h�Qޤ�!�	�����B�}��T��t����,�G��I�抈Mt��|�M+��������՘�%ź4���53�W��*.)�a�$�_�i�=�R�Ԭ�A��\�����鹱��oEy�����=�j"�9��ZE�=�@�,�ŒCf��A�\riwo���=�V�K�f�ӧ�kx�g�U*
v��C���7H?�l��"�7s�� �+��]JX��O?��3W~z��O�z�����RdϮ��:�BسZ���x�=���w䑠��Hd�}�E�#��M��t,i�`���(86�SR�>U�Ry�62^���0wHU4G�]H�I�a��mɞ���:��s,�}�r��>�lX�G7�[���ݪ���;�)P��
�����<�gxf0�X
m��斖{I���{���6�;���H����ɭ{�-�� }����YI��'9�4����C`�$H>֞mxn�\�6�����:��#�K�}��Z�Km�!�i�Ԧ���7Cmh62��S�ʺ��k���d��%�J#'���(�J *�J�+��V]W��P�Kv����xΣ���G��oL.�����R�֕��)��>9��{�ܳ�9%��u�t#�⋙�����
g:	m��o�:�&��r���Ti���٣�;f�"_�R���}z��5�����]U��V�	_N��n(���_2��4U��l7 �V�������v+.)^,�I�6����6�o;���t4R2��<Z�Rui�}��z�t�Rqu�y��t@��m�I���{Q_]'�x�ͰӖ�k��k��֩G�g@#�,�Ǹ�ճ}V�t=��!z6$�<.��vlD&L��cԼ1Rγ�l�֪��:�N1|<���d�e8�ƶl�����2��n�E^\\SW����b�Jc:z�� `�Fs�2�N���:�4:p5L����ɂ����'Ud?"�ayu8��;�'���E���+�A�����ͮ��eu���D	k����콥�:gR��#@��kŕD=�.���C=0��M`�r�1�"�W>��g�S���1|��mE��)X��騬�Σ���� F��^ʨ��U����Ԧ�<C��i�.5�q-rK���K&���K�0����Xc��!7�:� �(�w���}9�z��S��M�GI�K��1��R�+���}�K��XH={��}��	�����6����ܱ�n���]��x+Qu�����'J��uG#�j��N�+��_�흉��AV
J��xϾn
&V0ϫ>�*�Spy^e��v�j�����(��9�E��v������%W��=-*~Ȼ��6���U�T����U
;��1Ԕ�:��oz��ю��dB�S�pWc.Bb5���glh�,zN�"˩�gv-`�t7Q�����"M	��簴���
[ǲVw\�φ@a�Ch \O���uٲ,͒���1Uh1Uf�}�8��\^ꊗ_�X�U�i���;��Hg�װ-Bn��5�*- j����Cm�~������VA�; 	oY� ��;J�&l����j��ʊ����j���Q�xԱ���E�/_%�#��5m�[��y�3,��q�ݺ�`r{��&V�_J�җY��E�Xڟ0U@8���ae��SޫA�,V��a��Ǜ��O
�#�F�s�{��?��`��!�t*-"�cb]!ר��k�3W�ƕ�e��Y�P�G}��Y
N������-]������E��ڥ��������m���^�SIy��������Ώ:ם�c�j΅�V��'Q�F��ڊ �d$�X���rJ�0�]�I
���c�� ����
[W9%j9�<��ϭ���I���)(�[�`��'+�'S$=V���E�*`g^����`=9�
�̷F�
Ȇ��1'�:Sբ��k%��nS`���M^��Y���Q��q������;N�4'm�9��x+��zCGI����czF�Wx �e_�A���kj$ц��Dx�ǻ���/��cr�rk�����!����4$�?�[Ґ������T38�|���$�?ǻ�[������p��R3~�a	Y)/[L�²lw�%E,Ի�H#�L���kZW#��6wE����&����
}/Ds�<��)5��bx�;�r���;/�¦��(���q���	a�)Oq��o�?S���l��������7M�/
��8��|�g�xِO%�����e@R�]0c��rp'ǁNQB ;����
����-�=,�˘e�G�!����6����t��uB�{v��woW �GRj=`5p��T��^��iz3L=@�o�������`}�K�6�;D�^X������$����Sb�U�ʽ�SU���.��#~Z�~�1@��nr(�JU�6#�\�s$ܡ�!B���ǉ�[�Ps%���,NȊLKwخ���[Q-�ӏk�Z�a
���V��fG?����6&s$�@ѣt�N��y�,R���m��oV�n�Iڟȡv#O�#)ybWZ�Rg��V�lVBJnGyD�+��B[�|b"�Ijd%�Hig�Cm�"��WK��,���y't�(��h�c�:|Q��U*ܽ&Dc�a��Y�C�?��`���kJ�)e��Z!W�XS��(�Y,r/#�@�BݕrA�~����w�!��[>�o�$*�����X��]L:�q"��ޘ~,����2�Y鷊P�Ċ�R�K���6��x	K���c1�D�F�O��"*�E�=�.�y,ǠD�8���!�Gğ�	�� ��>�S�����w)��-,�����k�B���?�\BX�a�����dAS8��uŤ�H��Nv�N�w�]~%q�h�3ٲ���d�̖v�^��^o���`j���H U\/
B�˖%3+�0��
A8��?��;�n��
B�����`_���J�WGҳi�U#/
\��;�װ,�I��_>�]�:��
R�go-�	��T'�1Qk��cAW~�x1&�ћ��!�h��D�X��ǋ$k�9J�h��5DKk��i��R_u�iwx��Q_����[TXO4~�]��U�E��v����A��
�t��a
|�m���,�����&Ɔ�p�2O����X��<��Q������i#k���4J�a;Re�X8Hq0�>�#�K�v�9�U=�	�_�~�bv�-�9�M$��f�2�dU0�J���dݑ���YN��N ��O3�ӤK e �}��eƥBȔ�c<bV@f���U
�n(mD,�"�S/N����jc�Ӕвv�>�+�WD���|sF͓��Qc���ܵ~�lω)�/´���W�4ؙ1�sy��^"S/�x��\'�6�%j�����t���D�jV�OI-���Y�$,�'����:��3�S�7J
����c_��nX�F-U�C��a&�eZ�j�jGe��㕬*BqDW�q�·'V�0���A��ɷ6�b~U%�5���zJ���88�M�N�3]�]��C$���k��X/³M���i�/�\'��޳3��i )�R���/��Sgُ���A�5��g�7	r��5Db�%&�с��G=u����k.*��UW�k���Aҥ?Qg�-���	ܧ�Rb�g5�Y�Uu{��O�*nIh�$A����\�k��~�T��oȟ�(��ޕO5��c3�g��)�O~�6�t�fi���I�ܬQyp�����F�v�L�'I�H:>6&g��:8���+Ɣcϡ�%����V�y�'U
��	��2��9dQ��������ܪd�]^+�#��˜x?y�9L��3;�Oà��K���[B��da�=)G���U2�ǰ�ԉ�����=K�LȅY�
�3�D��W��?�Ƒ�;���e�%���L��{0}��f\ӗ�JJ��ƹ�P����Ίlr:�Y��i�0��L��䵏�����<����g�<�Mz���ӿN�`!�`.%և���#��'A�؂�1y`r|���RzŭERI�� �q k��)��5�C� hj����)Fn~W��<��"�51���/�4'ݧ92 �p���)2�I�")
c뒮hA(�b�&�i�0���8�ύ�}�3aD�N<yN�*v-��=;�Q�3s��(�%G�����G�Ӻ��M?��^(~~�b�p�ܲ��'"��ɳ@bE(�
�,C�(�R��]���NJ�H��S�Nx�駒'[�T���
\��/Y\�� ��,۪H��~��P-�aE��3���B�G^�TP�$-g:'�FۤV6���f�>������2鄚<-c���R���7��� �u����«�+����}v�[ӻ�@=�O2E]ԟf}�	�UȪݷ���*��*�D
�*�� �����R�3�hAř��'�&�m�
ie�{�u}��NB>+���� b�rg�ն��Q�fjSZ�+�����F>����A0�7WV&>���&��������	��;\it�k����Js}���h��뫽n}w�^]k�4����V�h4�5��V��0�
�:���e.�a�>} g��',�w(/R�(ԧg�/c�R�Y2��"�b��a���܅=xw��ś�z'p5_N����_��'�ҹɋ��M{����(-�e:���s��-�N���$�1���-%���{{�>p�ל�1|�Nt������|���x��A*��1\T2�=��)��W��Y��?�*b��;߿��:w�G�
Y�9NX��϶�U)�_���<z������n+�9�xD�(3'%`P=<��-U�X��$ ���~H��%�F�Op��G>Ɩ{7ȝY��0�����zJt.#_��b��4Q�RJv1��*��(��NH�Α��\��Y�g�gt_��pH��ϧ ��G�tͺbwZ�
�0�г����g��BRf<���QJ��{� [Qx����e!3S?&��!n:���*������|��1I}g0�YӉ;��v��o�6�(�ȣ��5�xoL��YO�sG�D(�2��V5eM��e"������;MwF45��D3�߹"R�Dm�I����$zﻓ ��&r��S���鉗�Mp����� N�1g���/k�����z�Hf>m�B��l\�
m��ҳ	�ZM���e�?�)�>&:0P�\�'Y���D�b�͂z��K�Tx��� /�񢡵si�o��vl؋t"��aC��A��Rϙ����T����Y�9�p�bIC�O�en���T�f���])5�9�R�-�MD�t����|J���h������Ӝi�H�a��ކx���ĺ�N@�i�ˬ$b�dH�����V9�lT��ǈ�R�v����� ��Ǳ2�O����?�*��kN^�_�8"~�����v��H���S��i�w��qM�:�ṆA�����ۡ�nzgz�~oLo�j���9�!�rZ;�s���Is\!�[;D{:�7��֍��!}��Z��
���+~�����RdR���X%^G*���,\�S�@�����\:U]n�W�پ��FD>��f�I�������&�@+C26�e¿"Q#���Z��޺�ކ4�Ǟ|���.�|@�R����5�6N/_�]�).�wW���G�7OqV��*Q�W���S�T�K�@�����X>On[��=5!�yȋf��?9�X{��1O�Q��
�=�LP�gϡ�u;�f�\�LƊ*[��>y�ņ��]�9��`ҳ�7�;^R�?c�\��YW_$YI����*��W�Ӻ�G���?/��#z��T*��M~2���:?\w?b!t\E17Q�sQ\u=���'�g񱋀ݯn�Q4�f4���41DڳS��i�wf-^���\Ʀ�I^���峔���a>@�0�o�|*��|���5�jf����
�hwb�}���}�њ��GU�%��;5�6��;&��d���-���s�[�Y ���9!7^n3'!c�Z��ڋ��T�^C��>�	�Uɨs���c�N�
��է����?o�.Z��T\4�<���>?�k�3��wa�OO�zt��+gW���2�iq�c{���i�q*���Qy���-�Z���<5KlO%B���XC{1G8�x��A�1r�����j��g�
�a���U1$	�))rց:Lќ�_�lba��Iq��v4/���ad���
��$��m<	y-P��$�Mm�NΆ1��O�����9}����x��)��8}���
Uf��}l8�����.�cA�f0�@Q拚7��m�S�O����
s6�����8���BX캥I���ךԽZfF"['b�Xd.IٴO�S�,Q�
����Z�FG��vq�[n��5�y9���)�����a��=���ղ��L�"G�#���F%_h3�'��w 4�H>/R<E��B���L�8QF����]VX���Sd���	TO��J��������_̄V�l3$A0�Caul��AT��m1�<9[�uF�Je�	��!�4FS�B�;rI:!�:"�����ǋz-)j��
l��F�&0����^�BD�ǌ�J�:{�M�>D'�Z�v�dd?a��ޘ�B{|������d�3h���3��.�x�3N����
:�mR���b	_�׹v�j��ߖq�����g�b�@�g��,Uci�U�mZ��?�IY]JG�L?�ӄ��(�Ґ��X^�����Lz��'��ߤ/�L|��h���vu����h{���OF	�{'q�>eߟ�������D�+�e�[��C��c��03��m�V�d�G�[.lX�>9��}Lh{�qҀ)�0���dX_��ϟ�ފ�L�y�N�����G)R�!`�� +�9��1�iq��Y���j�=X�?H���g3��o����x9���/��V�I�?5FRY��ـ3�N?���q8z �ps����B������gO��?��_���T�QB�-*��hg [�LÔ��]
犺�
$f��%\�;�5~-��]X^�*ߋR�k���^��N?��oϥK;�2-��At ߧ˻]0i���m�i���B?�s�P#��oX�az~���������";���v�o 54��[/���B
�$���Cd�o$�{�B�>�y�7�C���-Ԗ3�+���wM���o��x�I���i�W�dh�2w��#+��''��~�t�- �Y���`����j> �����T#�
��*��A�r6���dM�#M�^�qk܎%�n����	��o����Yb�q7����$T����S|����<EB_v���B����M�����8[�ayS,��)/�/c���3*���O��D,/��Ɗ�h	��I��V��+{�]�\v��U"y��"�$�)�`��T.�vHL���]3������^ި
���W��Y���"�X1����$�|��<��<�����Ax$Z�Jc%
�U�#{^g[p��a�,B�˛,PĎ�����ɸkJ��z��Y����~��G6Áq��W�h����������_8>)
�-�ᕓ���$�3�\�L��X|3.召`W�S,�&%Ih�������,�܃���"f)�} )f�r=���ܙ���D��V5i��=�H�0��+4?d�+�ap`�����,R���wu7� xjT�ӛF�n+Z��~�go�Z|Z,uN�G��������8p�Q�H�Q!R�
���N�Y"�Ѡ�mˣ^*4�0����w�~E��R1��W ?j�"��d�d�ږ�|�{g�K�	��N�	�.�c_q��Mo_����F�&Jx����F�'���5�w���L?�pTJ���q5
���:���B������)mW�j����Ah͓j醕k���_��+7���)�(�Ǡ�L��~�����ǜKS(cx|�d�/$T%Wx���gkz����K���	���2z��x�Hn|�^�N�+�vG��7��Y�R���~�!_�+p,.}u���U��H��N�����[{���u,�tg���.z�|FU��R�jtYA5(v(�7Dv���o�D���Y��FE闳��N�&, O��m��aK�Al��
�>�kI��+WK�����/=����pB��zWx
�bI��0t��@����}���F����\��C� �׬<��;���8y2��W���&^�zNY-{e�������e��U��/��xzͽ{�����)^�No�
���K/%���
��EG���i��9G�W��Zʝ�����@�'6/5
A�s�ʤ��  ���}{sǕ�Wi!�	����T�ߨJ.)�w���*	�$�x	 %R,V�$KVtS7��+�J%�J[�b[��c�� ����ӏ��~� $%G==ݧ�O�>��Iw����z��G[%��i�X�^�~���z��6�;Bg	#W�ÆzI#��kb����#��;ǩ�m�W���W�3���t��o����2���M:�+�A�teo���cO�&� �"��wh�y���|G����o��|���G�9D:��l���(�۟0�%�~W����CE�RZ`��R��.	��Ek��Uvh0����R���.�X�Œ�B{# ܝ�kY2�)�Ia��2%f����/?�3^+o�����&���+X�ŦVb���Q�x��ܞ�N����K�X��2�7m��|���J̼�U�F��W2>O@�5� `�=����y��0��b!��܂�!2����+��:FC��t{S��LaT��Ӱ䗛4e�^I4<v�i;���=�4&	+֑]�c��V�c9�f� 6Q���Y�-�Ꚃ[M��g3|�6��x��T�:F+C�N��=֐;Ɇ���)4w��@K�<I�,�+:eA�N�^w���q<�\Q�Թ��d�a�h�aa����?�0�{"f�}��~4�j�t��1{�]����0{�4ug��ŀ�W�0S@~��1�� r���Y��u�h]OG%���}��׶�D����N:�ꁂ�Z�(	�J̙�F(�n7�'�,���Ohg��x�T����YT
͈��ʧf
9O֪�������J4rP���A[��jĀ��@m�k�(W�O�qL���{�`������_�>��<�|��x�;��1D^�`�q�n����6�&���兖��l��V�]�$v/7�It9�(,/�$�T>&����j8jkX!0�G�@x©S���!�ا�K������}�݇V+L��d�'��0�����
7��>����\�l�u��Ro5ګ���ܹ��`ns�{�>(�H��2gC՞���+�8��n^��=�P�����2j�BJ���îJ�j��Ř��Lv�=�<�I�)���d�6K���2�ob�O�%j��ƴC��Ym?jַY�k5�v��ư�_����m��5�r���a�/��ı]zYn�0b��7��H�o1p|��c��4���B������bfu��6��6ѺI�c�  ���! ��3t-{S��k�^�����Q����5�Հ�O�
�F��^�4�b�l���ky��kL|��)�(A�C˵1C�C�c�����3�W��4��<��-
ѯ֐��;=N�%�>�	3�Q(*M�<�.�b|"���@�Ydo�N�FG7���A�Ȁ�io�V
/%5v�\�DGK�y
�?p�in	�
���~m�Gb89ڃ�#y�Bm�eW�,�]:�g�A�9Jw\:r��cA�r5e������%�@A�����W��0��'�~|�}���(��޻
��`�=2����*J;9�z؝�����,�!%qbi��2:�P���v���2�0l�E<���@����2�BR��`c)�!^jՁ�Y��(�:l�Eq	�K��_�f܏cI����,� 9
�pH(A��l`bP@nt{���8�L�q��)�=v�͙0������bPą��L-Lsѯ�j~����0m.����ō�(�h�����`�5�]`�(�yOY� �����˭B����0
k�5�S�?���v�&x�ڰ�0Ck��.��B�|��i��^��i��_��:��1��D�֟=#z�U��)LZ��]`�Hp`B�:��gW#�HW�P$@�"a�?Odj��DŘ���9��0�����x�v�`?]v���נ���N��en���9/p*�Kx^�K�""���)d݊d
��w�:�"9A-�ሦ�ӈ)���Jx��A���kݻ@1�NUU�O�W��k�& b���������� ��{x��GgUP��u/Խ�W�A�+�4�'o`����n=��Gt��T+��1�[Ww�_}���ٺ(q�xbg�Šר6�d/}ӗ�t�9�<a5�Ç�'c�
-r>��yLߧ�Ju�o�:]�=����孳���vt�%�e�8���͛����[�dx���vK�PV������,�[�E򷱐�*���G�t�pL�	Y��Md=T�s����03'j�d��~ԕ�����#3*)_�&�(��A�Jm�ۿ�{�r�^�Ν��Y3�&�>�j�7��fHpz��+�2��=1�sP?�t��w��G�1
�y���e�&s��F��I��yd��5�G�`;M��>\��Tِ3�@����c���Ct�Z򍶖p�ĺ\Bq.Rpl"x��Aw���|����� i�Ʉ�3ޤEw���#L������p��i����Qפ�+'�������-�k���H��|�kS�Y[cB���9�+���"15P3q#_�sX��-��ƌ\"{b��\��ˊ5�t�O��U.tF�1�T17=��6�Arӗ
V�Fj���e���l^
<[�2���=�&2��y$]D���E0����Kq��P1[H�8~NgVsQRd�ʝ�׋Y_,-��dq��,gi�8���t���e��I�{Fj���0��Uwʐd$�a�F=����Hs�J3ϗ��ԏ��R��K�uS�k�)�
�=�N��t�f8��쿿_x�g�5��M�����U٤8ENq�~�Ki�m���,'9�j�|�d�7�~|�l�z_�h���!�����l��gB�]���G�f��v(���rf���]i�ϼŊZ�{~`���[��.�
����%4����j~��d���8=��Zi�d�z�A��n��|��U��D`��Rg'7$�u*U�R���칔&�,㮅�|)8�֢A��
���P�х2�
Q>؂j���⹑��H�̣L�y6�P��� �ˎ��KK�f�e�n���>�h��[k�}�0C*̀�x2�p8ʄ0
���̔��3�{��$|+U� ��7*XP���k�wp����k��[x&J�2Ӫ`s�%y�$�^-Kf��s�x���{R>c�CFZ
�~����$�M��
���<����F,��~lu��ª���)7�=GJ�½h#	�񂲐E�o��1!{�J/�����=�Sn��s#�x���q��Br�O��qjC`_1χ�1Dc����;C�m�^M�!�9`NV���5#*�Q�
UR|�Z�����T�(%��֢-�.��_a����~��Ѐ��=�GC������guʾ��#z����|j0Y��Z�v�A��l�2�-bN,I��*R�T
������T� r�i
�=���AU�˱Y!�/G���&�ֳ.l���er�����R� �>a�i���Am�&4���'��.��#a`�f +�k�E�	�t��̪�Ǡ
'\�z�Ga�	�������ç�_������k��5��	m�lw��9�ۛ!5�@{�x��9��E
lo@���̑)J�<)�Z`��7��A�׶�
�]�1��o��A�74 m�OAF x%��e7k�jn	X>l�4G:���
����#<�xγ�YsA'.�(8E�o�1`��Z�y��n�P�Y �;�x�W� P�@@Ɣ>���Ö��O9)Q5�ʟW�18���[�}8�B�v~��Ѫҝ[7��؄ʥp���W,b�B�(7)ZM��&����:�l.Εj�����������F�R��o�b�Zb��1u���Q?�5��8G��{S6�f�Y�E�u�v��ڮ��������:M�����kp~�Q?��^�x0��{�:���f9��^H�l������N��Z>���m���M�A
[^����Q��Q�e;��a%p���wxL�Th�C��wd�����p�z�wV�z)@�	�M|��9`�^��L�hvW�T��Ď�(��t6ѕ���6��u�'�18Ei
�[�vQuf��SS�p�
��8�f����-�g����v`w���{�H&B.]��{��2��(����b�<��W���ҹ!���c�6E�z|��7s|��w�?)�i��rƈ�Eho�F+�"�  v^��/"�yj�#�{�68�$�-Φ�"Љ��D:�,ӯB;�����5n;H�F~,��^J�g��E+�Z?�CU#U��0z=tD`����}�������ʴY!����N������)yx�*�O�t5x�҅��/?����q�&�ݛ�Ӆ"V�[H�U7[��S��"ވ0
�wl�t'`�H� ����?�iv��8�1�����)�N�ӽ8����^�C-�6§���)�o��Se!�6��U�el�7v���h�΋O/���h��� ]� ���K���E}���0;�V�u�Z�N��VRH���*6�"U#����ɘF���%�����;�7�MoE�|�B<�4Z���Q#,�] �V�\o��`y�AU��k��7aR�4t���Q��Ȏo��%SN5�|�dx��@�+\��ٓ��D<!s�B�J�]��+S�3����2g#Yjʒl0SJ>m^*!��z��^�̐�����`[��
��#�+�;��J�O0EV8���@��@�ݝ&S�4x5r�c�?<'��@�6�
@���	��'C�g�h��$a�Ce%��o�b��s}R��U��E�1,�h�N�6�����X�J��A$[�nO���D��ݶ��53 �Y�7��韀��:�ؿ��a�۞6����_�!�8�O�7�� �.or�_�z�.�&ǁ�q��t��8�N�Fy�
���q l��8098/~�R|�L�U��},�?.���8�/��R!�
b��i�޶r8d�Jx���L��*@�lM�"x�1�\�Bf,��q��2-U"|b%�s!frҕ�H��*��j8�R
������k��y����K�OU|[�d��b�I{�,(�k4�kxS�dQ^f�G�M�Qu	�3X���&�ic��4
�?%XY]��.����3#pp�kv]f�d�������q�~����[���>���~�����_�" }���ïѵ�#���C8y��
���f�naX� �:\;�!q�˙ɶYj2�ϩcJ,-GU��Y������.��ѳE�TK�U�[%zk�����ĩ��7��H7=Y�_�Ji�h	��kW "�"c&�'>�����������+��F�
�Z0��q|!�I�^��f�D=F���@?��q:-��;x�j�խޫ��Mk�������ÿ�a�?w���h`R	�%ZD#���k��E���h��|�Ѧ��r�c������	&.��>��Dq�+��
�@h�cp����
�&��`���n�+
|^� �hd�ݫX�p��E>.1�(y��L�n�}J�'����8f�'��	/��.+^頠�*;�������5'qդ0��7�9�á�~�g��z��q�y 
��c͒�n����-x�re	HFb2�_1������9�yR�b$�E-Ԓ|�T 1h��@��b����������\����:fE\^�c�Q��*���A9�^Y��V]�(�8�n	X`��6?VK���
�O�m�]Ҁ�&�-��7��1�B��k���-**-*iZT���I<,�qM���1q�V�9���Q��~4��I�c0�������Y
���kp���Ie;��2����i>���a�
�,7&��O��-(�3l��?���Q��+k������g"v��?a����d�FĉT�_\�gAɍ�����;q+8-F������9+Sb�������Y{�%��GqL;�c�� :�EBQ�؇�J�/8YIb�a�~�A�~�v$]K�(���<�`L2�J#���:HbM��&ף�-��`�4(�6��(M7U��*�JҎbO�m��b�������':�I��t���U [�Cn�(��f��0�h�����T'�0��lo��0�z�J���x�$��-!�A�;Z2}��s+�OU�z��+b��V:�&�@�Xi�s�U~h�̝�á�1�:f��'5��W�룻�����k�hjG��O�u��U�im\ˠg�հ�+O�_�hV��T�hS
z�	r�9�H�#5���kD���	M_&`��3���G<_8�c�~�'(��	�~�ʶG>�~x��A�O����l;E�Ӹ��#���3���D�z�FM���7��?��<Os�h�63^~�~�⅏�����9��C0N<�8D*�x�@#��ϡ���nO]m�I��b7V�
qFP�^���p�H�q�����G-B�ǅ8�{+��%!�h�.HE+����,P.m>��<�<�:�>r�erb�ר[㩰�[A���g:ͭV��L���nPD�W�ߛ�
�����ޛ������̝�5M�S�R'0싘K	��(�r'*��,���Y�_|�Ղf�lk�2�Ҩo/��Vk
#��t$����F��#�0��]knՃ�T���8Q�����O�����jG��׸f���~�"�I�S�8�G�b�$����^l�*��o7�S������C��u��Y[6�\����C:>��@C�����~|C����^St��p	��F���u���溅y��`u��û��q�j��H>���5tڎ��`?���c�`���дJ[jR���VךA}u���0��w�_�E�І��j0��@ ӂ~���{��{�3[Xz6�����I����׶��0ox(�t�p�ʇ���w�t�j��V���n5i(�M|%ƒ;I��t��-�@!D��.zD'!*w���z�Y���b�r���*�$y����:��gk��/'7Ui��&t�
F��|(���Dtss:�^�N�������fO͵#�o�Y��.
"� E�α���ƈ�J��Ogh��
߸�~��*��;޾������7�ivh��\ �[ϵ���:��N����1qRg�ߐm�p�G��é�=�3$u��x��v �mh��Ux�x�A9�ܙڒ��J}aп2����l�`��Iͅ�O�Sx47"}����ݤ�����ȸ���(d�ܵ�J-�	/�W<q��g����7��"�C5���GV��čGq��Hx��/�
���ж��/�.@^t��	���q��i��,.�e8�z�.�p��=	|�"�,�0J�a�p��g�'���b�{-��m]p�x�_���������yst�9��{����w巺��9�E,�DP����Iu�Ԅ`�K)v�y=�T���S��G#���G���=^��0�3�Tx�Jֺ�PUI�A�p��?	}<���߇y��x���d�U\q��\�N�&�P%��3�����h��F��e�u=��J"���ܠ�2��z�x�BS+%�\
�<�
�>е��k�Rݨ6����]��
3J�'�KI�4U���������G�b�R_��S-�2$�u�I�Fk:�eow?/�يU��X����X,����q�{�&��?d�If�!z&�˵N"���l��խ~Pgd��,��­=L�F[`!}���(����\ۂ>�Ww$ӣ���rN����l��F�xZ�I���k*���<������f�s��e�^���=Rq�����
�d�J5Uق S�i�n1(W����\]�>��^O����ѻ��w�[�f��N�k��������a��:��|��W������1`����>�D�_��r�w1H�
�i�>M��/�4אzRD���YW���>'���	��`
?�C�e��s���d��B��y*a'��b��k-<8�b�8^œ?��-��^�U+Պ��� >�.���6~��w�	�����zJ1�B��&CZ�����p�P�^��F��z��^�������y�/ ���&�nF̩�Nk�
�`�J?lu��SRAH�T�9�
��'
\BE���[�S�}�`eq�X�{�m9���f�
u]����Y���vH.���j��S\��6Np�A��TȹB��QRzS7����8=�V��x�TE/�&�Ǧ��A�κ�Ĭ;�E��
8�e�6�ُc� ��P|bf�0$�6�$\�d�J� ���>$�=���\��H��?֙\���ÝɅ�k&��d��5�D�+�fN��WaQ��p��"�7z�{��\"���W&2mc��2u�d"�c#_��Ο�f�X!�A�`��V�ua���Bsj��ॗ��4-��ƒӗs�z#��jg{5W ���K&�
��4�ҏs0�J��Ճ�ݘ��N(������e�66|�]��zAm �8VF���_�gY^���t(_�V���E}5�������F
3��2�/�fK3���"�ʗ�3��,�;�4�Q�]��Wʳ���z��\�Q�5K)X��waB���8_��E�ƬJ�9�a����t�jw�9
�˿V��j���m奅�Й0�'�;�cV�B��d�_�k8�aFu��gn���Jöa�*��&!��Ǥ0[4Z^��Q?��XX�^e��-�A"��;��.0d�(��v����H�0�07	<�Q��7���Tiz5�0���ZZ�
<yx+�M��v K�d�s,����+��"/�n���l*G��HS�@v�ggb�]���U
G����xv��qG)<_;
����L��z;0�ar����Գ�c�ѯb"�iچM�om���b@�7���D�ŏ��FXխ�jfm!��ҕ�r{�\�f��]%�.~z9��'���tٞ�r�U�>�V�V��l�Q
��*���l�2#p�~���{�Q��X��ITX�J��Oy�p����'R���˰���6Z);�֊Ԧ�лR�^6�����V�!t��X�ё1����Ѧ`�.�=T���@̅� l�����p)kͭ^�Ra�B!:�j<��>?[�޸~r�\\�b�GI��Z�+�zk�^��j���;�Oo5���aM��ִ2'V�AR���_(�*+�z׫����Oxy���	/�\V^���]S��f�疒�= VYwS�E��g�.�����E�O� �1�+BY�ɵ+�O��������A�\sܶ� %[�n�ׯi>���>�Sf."�8�Yr��u�
D�J��g�1w*tC>>>~�C?\��,�=�3cY��̸Y�����#�"�պ�s��7"�p�7j��^j�?�>�l���:A�%�5?~�.�d����c�0�ͷ`�?�}N����#���>��}J0ܧYfo#Q��a�L�1�
|���2z���oo�����5�´h��f��Đ�h�I�uS��8a�<^ �H����z��
'����tCfٗc!r �|ڐ�k��HG�Í�� \��Nk�Z�%���ߢ��@/����<�b.:q^�]�3�s�c/�K�=U��*/�=<7��A{iI�x8q
���v�1���?�x��Ci������=����9�#ͨ�.c����%��jvUyf�˖uFڇ�\=a�a�GH�O���NF/�e}�&��I� ��<z�C� �F�:��JI��P��K�f�`\��}MOG.z"�h���I��'L|԰dLG�R����g�T�T!0��h�]
V|���(���� �TG�"&�h�Z@�3ؒ�qX\�q=�Zi=l
����|�l�?6�Gh�|���p����@�2�X7���z��[\� y����>�����I���C�J�z��Xk4�le�ρ/���ޥ�j�ԛ	�RF���.�m:�1��Bv�~�Ts}L��v��/��ѡ����P#����	�l+�>؄�*�9ڿ W�,LIӱuxa�9�R��> �:�*n�LV�r��ی��&��v�z�ҕ�ӠZ�./�2�$˽Q^�%�*�.rn��_��hH�ȆiO�vLn������L��7���G�w��A���F�͖p57�4m����3Ь��7s�.4�w���9[#��*\�Waھ�-0h袟]j�����V�������� �uq���,���^Pm�1ip�Z�����ŋ�A�Y93�O����|��۳�$@����sS�0�:�:MlS��~��G�Բ3��!̡�$!U^IPU\M��;І{T���c��'�f$]�1g��HA5�]�4N�fOr	O��
i{kթR�����W��L_VS#!,%)��X� �WB��+���pf!��h�5��y)�)�39�D�΃N�������t��d����s���pRG��Ti��	b�xиt�˙�f��0ac^'hN���P@�$w��ov�G2Rx�@i����U͐������aK��Y��.��8S�I�b7���(��kl̲�]
G��b}u�p>s8�5\3��f��
�8���GIX�zA�.-U�ߠqF�C����j����3��;Ya1u�m3��V�C�7I���>2Jz�ɕ͒w�l�@z
�T"+ 5<���|�y��͒W��Œ�&�Z_n軌����(�M<Ka��d�Q�1�s�!�@.��4j/��!��k�9�i��?�����>yΌՍ@�Gk��	�!(�t�Q�j��i�_�Uo@�nx�# �R�cb�f0�j�&o�7��1	l�7���4�l�c�ô��$��> P��~�x�O�yg�.��=Eu�w��#�ԆՃ�.f���j�v���S��<D<<����w��M���4h~N�5����+��A�}�I��'Q�	GG|����Qa��K�Q����G�P�o�eq I~�����hٞ
�˳�37��h&�<J� ��Y�
�ڄ|��=�$�>ym�T]y�y �E���{� Fm�[h ��
���d�K3�)�S��_˗I����`��=����-G̡�߇��	���lP4��?�s�uQ-��d/�޵K8���;+t��
k�/;R�&�������$��]Y&�ܕ�e�
�Mqk'JBU w`�����m�kx�r_���[z�L݅��RRs�F1v���(���aۑϣr����%�l���.�{d���s�FD|��?�"|��)��pW�?�;����Q��0 >�vg��|RJc'$剱LL�b�w��E)��%ú��A]�f~�ǰ��Uׂ�*l��G�@x�S���| w��Pr׹����
v��e�}���N;�K���Z�ѤM�ǧ��,i���,��8-��P�J���Z�il�v�>e���8���s�[�E^��q��>�[΢*I<����L0�!��&U3��/�S�t�����;�]���!��Q�*�n�@!�(�Z�q�S��JY�E���A������s]�M�:��X�dzs�lD����: �I����׹��׫�wڅ�H'cV��PѪ�Y�eg>CڿX(���;�m1��P[��*Y(����䣊K�G�]��ӛ�^0�O�-���^�{���E�P�g��:�
�J3$W�����K��ON�	���6~~t6*+M����
#����X������
I�����rQɜn/mR�h@NѨ�bҤfD�0���-4�d�A��r�G �{$���A�oßa΅���=�ڻ��%���1�
����{������j`�C9��2Ş���5��W�riߨY�T^`LG�43�A�W4�\���Xo�q�,���=arO��
Z]�8�in���er��#NC宥C7�:����ޛ��j�����`8f�=Q�n� �R�Xj��:���v�38�ȯ:�4̘XzS�{�}�1o=�����#eX�*�6����*��e�5 �J�\�;�@�38oɪ�� �̇�LE�Lc)��e�V��e��y�l��l�>�$=[���Z˻(!;�6:9<P�=�M��"��^�l
}�lO�K���Z��W`�:��
6�`{�;}�3�/��2h��)X?�	M�����^I��X|���Ѣ�Ĝo:s|���F7kxץ��Y����*�×�h���4?����w�8o���wĝ���F۝��Ż�6��\ˬg����2r��j��߭��Ӌl�j��E����j�#F�O�R���e9�)��B�+Q� 8C�m��:�KϪp�d�츥f?ɐǠroFI��V����~��+�䤠���.tu@�[٫�
Yx�	���1Җ:.�$[A�(��P���9_̙7l�	2�E��߅M������yvX9z�J�e�P6��6�G=X�n5¡2�T����hU7��G����F����=q�ϕwG@�74ڍ5�E�o���P3?Yaj$!z47��x�9Ϊ���owX�z��d����V�}>)�E��ܩ�8o=��h �Asa?�;n�nu��N=B���%N��)��6yK�N�*c��l{��_~��v��T�hD}���E����&<�9�7,��z�����yӤU����%�\ծ)�,9�C�R�����؜��;����ۓ]�3���� ��EjQ����1eޫ^���et���?�\�W)	*���yW)뻊T�� ���hTx;1��f[�*���ѿP}]yO�x>_��/����s�\A��������� �ԍ��jo��G���}���s�ջ�]��n�Y�LC�Ƀ�g"%�=�>U�wѡ��пvJS`Z�� �f,S�4n�28�5ͥ	��{x�%�{%�Ti�{�F��6;�"r����?z9�L�B�{�rG�" ����^�Ked:�O�6&nu��V|�+�EK�VѠ������ϡ��2p��'�Hd�I��
mG^��lTlg��^U��
t�,R3�ٕ��fN��-:d�pҥH(����ܴ7A�-� ;��H�<0E�>��`Z����{l�/I�/=�/����8b�m[�	��v��� �H�g��s�Z���瑠?��!Lä�D�aws���ۣ�2p���2��h����u�}�7=�sqH����i7�VL]Rvi�%��B�n�� .�}�Ν��X�Ԟ����������#�����1�+�}�~+,�q
?���(*���*a_�g���Dܵ����<��]�S�Fgr�V��w�ff�⾔*���4��1�x*���5�I��d��p��՞�,cӍgs�N�[m�
6���ݫ._�� ��2��L�x̡�O�V/f�$N8���Q��Z�����zg�w�z�92�kp����x�a�_��oci�I� �=���Ӱ�ĒI�P�N|)%J�+ruW��,ϦF�$�Z�u���ʹbL��9�kƭ��ݼ���3M*�aRQ��z˽	������L ��f��+͠�d��`��7z-V�1�W��Fb)��l\s~�Ww��ͦk��B�ʋYg�Z���~��?�ty����;���$&Z�v�Y��s��B�YƋYg�۴�3>�cOe�H�j����>=g'�� -4*皣QI�4���ޮ���'�N5��l���J,��Yd�1�ѽq4,ێ�e�hX1
ͮ�:�e ΁�C�Zj ����~�p�5v��`Oz�����=�wz��F�S��&���A_�
_=����b�W�^�jұ�J��%RW(�	�B''��](�ih��+`de��=���p uT�kØWH	�9�k�aK��P�Q���!%<������f �er���4��{�SO2p�e�_`�bW�a���c�ʤ_�Ъa�:��@E��o��fO�tD���p�y���y�a��?���v<�٠Z����dx+��ӡ��׹	s\�k;նp)�Irv(�aq.2Cw�Y#����[��p�q�own�7��*��G�}84k�z/nZy�l;�Z톜�r��^���kܩ��Z��?�=�F=l���϶i� �dFR}�(rʹ@V����X��,��-��a�):��"�(�_,il[�!y��&����QBF�^w:�oɑ�:u��H,*u�'�����
�q�o��_��$9�&�X͔b�������u��D��fGI�+,���c���ml�-J��Jz$i��G���[��\���(0�`�OC�6�[�O��S(�5ژ4O�b���6E/�~Юv��Z���6b�{�&�KBO��g0�l�l�zɁ$�.	I9��H��ϧ�+�n�m
ѝ+>5�dd*cb9�Mz��3�rl�s>Iv�d���&��� `G�l�V�}Y@��]Ar�����w]��+�^Vh�����>�6������A�7[k6�k^5{�c�����B�0�]FS�ޖ9�T���ր;RGϳ��3V�Q�c��ܑ���A�~�L��Q7�S#���e�Ӥ���h\�Ik��^�KE�	]���yy~	6�p��7��`/H
~$��r�ry�Зu�;�L皳�9}ۨ���s����̚6�� �9+C4'�P����e��J H�?�������(�/f,K�Zg[h���C<�U�Ev�{�nޥU���G�����Xz��joh�-I���-%9c���"���LRΘ D_�#MF���>%��$`�4�nu�M�iZ/�8w��t\��wr�|�x��!��:�F�ՓtV��L����G��l5�|�v�t'lм�vu��](h��ʹe�2C�6�V�
�r����BN!�r�O=BO�S��.�ty%B�X�W�u���¤������tʤ^x�l���M���LL�O)�y>��t.�T��Ccx�t���{[��/x/��b[g����|�
����%�v�]�7&02�ëD�xø!��VD�C����	ρy4��I�%_-��x�L����|R\Ң�Q��6۽�S$~QxQ��ʫ���Kr��U���7|(<ȳo*I�2E�A+q@��
�����iH3�*ɏ`�$iW���'J�C�-��٥�=���|�1�|��>��W���r�}n��!�u�z�fL���L���bFw{�ŠT���|d$?���|:�"����H�#�2 ��B��Q ��4|K�_#�S �n��@1������	iP����7��H�CQ&�"i$��)�NT|���r�[r��3�����&s���P�~���,��=	���h��^V�Xm��\WNv˨k��>���z�dPX;T=�6�뱍&c�,�Jzq�W�~`ʽ>���ǖl�#��K#J�4�����1����U�_LH�2Ϝ(}�8�@�\9MԐ��C
	"!�����S<��`EA`ߍ��*�{&a���|K�充��D�75�4�Љ��?Hi�O��Q�A�Q��(x�� �	1P�ʉ�C���G4���ę�~��O�c���o��>����^�YWe?q�$��ߟo�XX;�4��Mm�6H�W[���4�C���Fg������ل������n���ڿa"��F;.&�js�*��A��EE1��*+�ߡ�_�g@Z�,.-
�:�}�7��FZ�8i�p	i�X L"l�0f�U�Mb �h|�e���Ri}a"�ɀ|&���/j&�K�t^�U�'��g��D <z�P7����;Ӓu"4���X	5 
�[���ˏ!&����L<Z��Fv�Apd�.<ג��b��pr"9ꛚ�v��l�l�J�� �!�"��7l���~G/�E,1!�I�r"�yq"���7�L�:�5Q�ֶ�Wj�V��><Q	N�h2v���1=#j�F�@�v�c�fD�>�HtG/�)�0�pʉ\�OʉhGt�!c"�D�3\�4|�ľ���
{��)��e�"����{�R�R+MvE"kke;I���3���k\(��鶔׹S�*æ�E�P��hV��w�O$ƣ���&�Dd���E��LH42�h��H��kI�R�.#�;���G�*�.U*�φ���Y|#_A��y�������(��C�N�#�	�3xDap�p�oP�x���0x�� �\qq�qщ@�&�D$$�pT�L�B�5q��w��~���=h1��~7&�����?>�^P�_:9q�345�����>�?0��M�D?j����z��hnˇ�'Pd=���G/JU�qۉ8�KƉPH�n�� �D44\Ѱqm���;�h�a1r�Ύfa��S?{���Vl�g6��^����Nd?�&2��|�f"���� �4R ޺��f��hO4�/���pB?�����K�v�"��O&r���a2Kd
�˾�����D�XB�����  ���}{sו���)Z�f:�Q�,˱w�Xc��l�XJh�=�+ݠH�Q���q�5��ݚ�-׎7����8��(�E��6a�9������� (+	ۉH��޾��>�s&��3Q�_�<�Ao��ЏFǧ+����j��NN;��XL��u��;���x���r��Y�>��2�YY7U��h�nJ�ɻy<3��N㙘�w�2AgR��Iʛ�YG���	�S����0~
X�1tx� @T%B���hi����I�p���p�����S��'�(���q+����a��	��u��g����_�:�Kr�%V:�#B��Q�N,��NVga�;�-�J�S��s��YB퍀4qB�lyMaQ=VW��Qr�AFi@-��y(�v�'��v�O���e��. _gd�\���,�2���T�H*̬�+������p�T8�6���c�o�	_�K	��U�r�NV��A� �|��=��S��?��r�:������?X�����O���Y�"���}?~�����UXƽAt|�
4WۢV��=�܀�4n�غz:������C�/��Z�gL y������ݶ�q&��i5N�7ӛ��FV
	t�ъU!ܺ>�a�MU�����a���[�Au 'u/�zGU�`4p�Hf�=��$��f��Mgc���Co���K:&��.�����!���d��?~�*EN٭�jV}whSv-���xp�.�t@���m�=/7�	X��wh�3�;���6��w�NBz��ܬs�.S%�3,�qJ'��쥩���{XpFp�c�eo��
T�U��
�w�^��������ȥ����x����X�aeIW�ޥ��������:lbe��n����c��wخPۇb�=m̜��R��^q�"��m7�YM��mgN����h�wQ\�`�N>�|8��7�:f�⏩K�l�pZ4��nuu.>��**�GQ�����hYpxv�R�L�x��x�s�ó������q0���ˋ��C{N�uVggs}�Ň�ʺ���B�2(�ͼ�M2͹=��9ܜ�����X��^�nѽ�ԘLr��?�)c� z��)���5�6��j�M<��@b^#�����M/vl!(�t��9C���FM�.9�9�,a�ᮏ�p5JN���sD!�v��7�v\:�,6ku5�5���ͬ
>I}��1ں��1}�j��9����d-�)�L;h���0�^���&����<�6!';��o�vJt��uYN�n���A���G��7����\<馅���1���t��r.�A^��x�h����jǝD��&�֐>�5: �9W/�]ө���ZFA&�����.��tk�Y+N:ן�̋9��IQ��]�P�d����L�RH3�!V%)�iҤT���T�u��?e���o��~�E)COS�J��M�P�8�rs����D'��:��Ħ�5G��36����b*4�L|�}~�D��t�YN��$Lf�V��'a�U�X�������q��+Ä��^��y��+i(߄��/_=[��u����ʲ��D�gN�#��,?��'��MC:��Q��<��^��#��}��$�aU�����ʇ�ѣ	�{'�{�M?���"�Xj�!�jkE|Q�^�|3ύ���=&л���E(��u��q�$���^�=��bX�Ep�		� ���a�;GċD��W�!��y� ��b�o��ka�Et=�ʙD����e�Q\���c��t�a̿B�n�:�������蕞��{���p?�^�gk@�A����r��nx�{�u����wLV\��&t9���u78�t�V�!���iRH蚏�Ǯ2��R��n�gO)/���N+��]2S:}p	�ܗ�%]�.Y%G�BV��!�,8�v� 0;� �|RW��'b��Xϟ$t]N�I�f.Zӧ�R�Y�}}-���ӟ�N'@RG�O�
�;&���<�ߴ"��ZCސ	V�7��B��K�*�`���6RE=�dM?C���|�����ƪ�m,\��( ��\vR�k�-�Ӗ�rSvt�vSʊ[9�:�Nx1����s
7
����#P
�����҇nN�]NؑpԱyFM��U�A�+��a�G�gS�6��%f��; �Io�R�ˢX���`�wE����ܢ<�I�ǟ��9�[���p�v�K�x䳱 [~��I5 OY���7?�ep�JeM:�L��:��K���9L�s��67��Ԧ.��(��,cII��`��E�&����J����Ԍ_�mD�j��!)���D Ǹy4N�D�`�
z��eaozp֘��Β���x�D��CR�Uo2�钷���eu-I��o�a�I'i8�{�I����?9�_w!rq8�[1�._�<����K��>"B�G
�^P��ׁr��R�/v|�8��}��\*O\��d.�
�4�Y.��jcq�!�R�O����֨��zqJ�}����>���>�y����l`t�>W�L��3�����ڜ�ee��3�L��m�g2�4�3B{�\d��Zl���B����^��"����� ��־?��ĉ�%�Y���bȉk�(@(%��x7��)	�\�/o =.2[)������`�t�"h/��Vh�\��D~�z�����dC����S�GX��A*��U����lu%�φ��� Y(v�A����s����j���l};��
w$�$�bD'�E���=<�Wယy��UJ܄�[���{$�QN�n�w��'��@�SU�lg��(ݘ�,���,���	[D�;����ͽ�.:O9
�ff}�^�<_u0|�>���͘>��Ma��n��~ۏ�����m�����W�^��oХZ�C5�G0289��XA?>@Q�v�U��s�Qx���IZ�a�[��^|�ŵ(c"�gHj�������k� ��*r�U=�������S���]�)s�1"�e�;��o,!+�f�A���u���:�H�M�%[V�Q����oǟ��1	�P
Ķ�x.����	*�b��������B�탨[yn4ƛ��1l�c��^8�?��Oฎ`
k�Ao��V��va��rs�B�bcu����n�;��+��j�\�^l4���z�B�ӂ�lԆ���w��0�me%NP�|9�G ]�c�rb�
uY�	^��MRb�D)w��F8���Ѫl�q�Z��y<����@$I7��H8�(e���<y�ɮҋ���N��#G늣m�YV}`���*v[=�a�(ZZ�G7kK�z3kJ�r�Ȉ�B�#?3��3u\�L+�F�
�T=�no���j'��?�6%g�PZ3�
RI>�)��Aݭs��B\�ū/m\]�)����GQZ(��7w��nK�h�q�PE��d�%	�:�, ����7��)vA�%
s����F�d������J�XL9��r@r��0
����8��	=�)��[m 	�~�6����=�G��R�>�w���Es)3�-Q
.�}<D��C(��I�ë��^�Ö��a��h/IY����aZ�����풦�����FA�I6���ׂ�}s��4�-,Wc��:�텣K'��)�"�
�R��t���b
�B\��A��W�ÃQm���"e����P�sA%����)����L;&2��M�n��#���ron�%C ����v+.S�K��<f
F��j��(���@ī�>��*����?�i�d��&D7�Cm%,�%C�{L@#��:��ô
f�冁Q�5-+&bT�4�<i T�*�ټ��9����ɩT]HMʁ�gL�V-�4P4)4d˷Ѱ�[���`]9^S�RD.�)�@&/�)��k�ԈnyG�y�X�Z��V%�;�6�ldG,�ā���n��L��'ؾ�� 9��������^�̺�RPΠZ��#�S~��sZ���MYL	��$+��s�9hn�g�� $܆2/��TD�D�am�0ʤ��RG���X���u��5�<�Ļ�W$�V�?����ꯌq��Z�f?�E.�s�r�2zxT���/u��؄����U�b�w
F����<��+-S�/�,�X]���k��ߕsq򻕝f�i��ò
�P�\I�R�ܷ׭6��e�@�za7Ȳ�u�N:8�]�I�q��Iҙ��Ӳ;�����u�g�1�1���0>׉�� B*c������&�VI��ڍWo_�U�aK�:��&��U]m�� ��{0�R���'����S���t�yD�i���@��~��B�ġ�{wc���i�`�LzS#m� /��=471�qwz�t4!Wܿ����eݪ�߄ql��1*��.A^I
�zX�T�n�>�J�$�ҥ�`V���NF\I��j�b
L+\�b��+׸]	`�����6;�i��C�
�a�F�+�ߦ����!kb򬆬S����Y&�)�*�,�'�`�6�+m�R����`�5`���s��j�F��f�?V�v�n�*T
Z�j�zc��z[�-ɑ=yw�d��@�D�@0�dVs��\���²R�y�T�h�w�
d�ՃQY���v�$�[�q|�
�+�^ؿt��O�G��?o��6��e<��K��׃5�~�r���p��=�B��XA�q>�� ���Wa+���@_|<3拼F5�����1K�gAZ�'<r����AزP�-_�h�GE�b�����0��K鮦M��um ����G���Z~��I�@"1�Z�,u�� ��+�e��{&�[��"���@�3�#�t&���a�n���6�����L�Ff�V��b���I�SMm}fbd:Zl�~,�Lq,/
��|ЦSl	L��P4��
o����9R3ef�#_N�A.��`�M-��V��$�G�,n�U�ź��ג�Q��G"</�g��%�Y��be,��hnǸ�����d[r1�s����ذ�`��L�-oX�5��*b�^�(~Ȗ�Ƀ���_�?��\�W4u�>˴Y�0sK�Fc����X��!�F�%������)���-��l�8�)�ÐZG ML0N�%�����,+�����0����@!(x���my+vSC	���Y�Pu���%�`���BJ�X�����
��C�J	E����#�����}��6�29�f��%pۿ BS"�6���bS�%)��$6��A��L�y%����)�^� KA%�W3�۔�~	�BԽL�]��=��OǏ<V!v�c؁�1䦿��'oO��V< �_�m?g���'X@�\o�D9����CB��$˙��XX��r�u��U"vR�LԋB%������W ����E��I��-���Q�����:�v��%��2�G7�x�V�%/laM��n9��W9�bq1�)N� �	�ێa��U�C!_Sc ������5.!{MmW���-�m�]g]qɡ\Hh���CC���'L��܇7'S�!p�O��������u7���*�!����Ze�|�rٽ��T�=�-]�?q-��6�s���s�
�����3��+є����T,�e��K�����<�*E020�U�� .ϡ`��@��%��/v�fg��s�nY
���"���k�e�-��
�w��ݡ%9��hO�$Y�����LL�jf�NN��{n��&��ª�
�RM⫒����\�{1��4���'�M+�����*�s�A~??�*��uq�ӌ��[�����<��
���Po�*���܀�C�xdD��-u�OoFA��W���cs�걁�z��5�:����K''��*����nzu�q�6`���PC���p)�vu�P���k.��6�r{��i��?���5d!�rC���!�QΙe
�P��V2���5�۪���X$�^u��=y0y�N��C��}[���$!ҟ�>y_Um6�o
�.�)���濘x0l3$�jǝ7����5������o-��Uu���m-��`��DŌ�W�>B���^E�>{��?��^fX�a?u-3� qCF�f#n��ѣ�C�@hh@? �z~� ΁��0��v�4��6ܨ\p�����©U S9���ڛ�˺�*�Q�.⎹:�w¨�e�0� &��A���z��� ���*ՋV$1����m�Y��!C~�G�,�b�X���X���o�ѤK�q�
����7	�0����4	g���{�D{�~��D��k�;��#��s�q+t���9��%�#]�rH��4+���g��r��M�����jq�j��7� �/��9Ob�����O+��كE�e�V�l��7�O]���DM��D�FQ�{%bx�^�Qԓ/�(9�}�e�n4T������!�jP�kqfs)�k$�� F"��r�dR���4ȴ�������lQ���܅.�fD����l.��eΪ������L����c<����?��(�3HJ�vsU�"Y	��{BY�62n�(�ޞa��u��A�^���4��G]3%KuBO]�D]��?�����Ε�iT���Yx�z3YՌ�_��q�������*;,Οt����Y�40T����@j����4�4�5Ih�����.-�c�'Ë-���r��M���q���
�zEY)O����i�c$������+]��D�#���̑�߈�V�h��`ƨrzQT��≶�<����X���
9fʽA�6�R���tfO�C��x�
G��D�(M��^��D��]k����C�2`ͺ.�q*��1\nʡ[I�?|���6�9@�k��]VJC��,=��h{p4�3,L���*bh�rzi�<����;�ÿ��l��>���ý�N��C���m�{i���+󩆅�7\A��No�7����S�Vvc���7~r.	]��t��Ax�^�o�jq�9�:Q�IU�#�?����Q��8�
nc?�n�7�q�S��8���1N����|n� +�\Z����O�?}h~�����g
ПC�~� ����]?o���O!T�l����g
؟C���F����?]�~�.�0���%{�:п|��`���%��(B��
�)���ӆ����B?��?[�� �0�$�y��O�" �@�c��:M:@�@ճ�P>7`>���L�!0]�@�,�r�c:����l{ƀ;��f
��DMa��E��86X��s	\��c>��^s�"�=��<=���'�_7��Q��U&���bR�
�i�20j�V���e��dDw�k�au��h��z
�¶�k�!����5}��S�
+_5�٬6׊a�R/l���f.4i��ф>���>9q��Q���bة�s^��qa���/��S��f��Y˂9i�L!C�=C=��_
�.G8����9EBNST�� �&�OQ��=�x�Y���~����T�k���\�J���Fmt�:_3W�*]�k�
_d�s-�tYJ�$��8m/�Ǝu���m�B-<p�G��������g-P`�[�8��;[]��U���$C�e:�u��g�j\�Ό� �w.\V�~��e�<��*��V�l>�i��a
�03Us�8�R�㠋��rIcڪe�,{a+�ʪە���(\vb��S��֦����I�+�6�bj����9�T+�qp�0+96}i�)��ͫ�ڜ
��\bm�
.�eYJZ�g�5W�[�5���gϣ2^Ӯ��:�5�*mԥ�谞�۽��3��Up���_�.�yjw�cƉ�����4�~��� ��1�Z��5@b���⚢F����U,�2�d���⚵����IK��]�X\�+s�
N�b���U"�T)��}�&��-%U�p�T�p#�W�59Z<H�F���D�Ȼu}�(q��ǵ�������0�����
1m�0��ҏ��hУ@�Ԛ�rx܄o X��'�s3�h�G�ɕ-:�Ò[g[�9��|W�k���6��H�X��H��z�,�����!P��0/��\�31�N(	|���ͽ ���ޫTP����8n�\��봔��xw��G�1�EE�4䘘�ה巓�_QӖ�(r6����*#cQ�mD\�l����A)<���x�US�2ϝ�����\�e�Z�2�%f��'v��ߢ{=����xIu�L\g6� �+�6���V�[�C	[���f��e����3��_ψ�VnM�7�Hg�h9���UVp+1�g�়ۙ�OZp�D�	n
s	n�&��{�G2�`n��|n�[S�^�*�-�Ǡ16Oh�D�kC*/}���QDy�2l���]���V�h>����m�?x��$-������H��Y".z��J�i�Y�M��
�7P���t�(��)`���h�]�b�8u<�=�@�?��&��9��g(���O���i�qje)���_-'�*W��]��F�g��쬞�)mw>+�2�׹pg�<(n:w�$כJ&uՐ�iC.����Z�^����.��s$-�
��=�s�vՊLg��9l��FY�,���%\�m��Q��RQO-���C�/}9I�K~9�<}��O� �YOL��¸��%n}��+�Q2�"m�|?ŷW
���a� &�^��H�g��~����2��e�<E��|2t�f�^/H�i��hC���L�kV�P�D��L��$�U&ЮJ�5�T�[m�Z5�Ws��y�����o���0i��Z�k����b���1��>!���e�*��K���G���E���%ϾGh�O<�d69;WN��s�S������uv��eI�.�uF~��w���D]�
F�џ����"UV�*dz2HW�Ϝ��!9a���
�F����T�*��Y�[��(�3'�h8I�LI�
��41[_gHR�t��i��9��������`�F�@٤��Q߀m���;�v����n��� ����y�()�+�6��(\+wûB��Ai��nVujC���\�=Bx��>�%0OSG��sKYSc#�ۋ$���mZ٪*�����L`3yZXeR֒��-���uܴ���k��@��
��Yl�JF�w�U�MW�qju	c��[�O�A�p.J�Bb���n8�tZw��!7/����FgT<MC.� �Hf�����򲇴�+}�����OI�.c(ecr��б�Yjz�'�hq������BM\�D��j�hЫ����I��V�
R3�W���!���w�D8�n0���~ly
���o���X�l��,�p�)������h�Z� *�Iϱ!�,?_�Y�s�����P���tE.0��h#�k�ۦ~�x\I�����U��N�F��^��ar�zT�Hbei�GRS�ǎ뫔J@�S�څ��9�ȼ�k��ͦ�tn�q�l�%��-�|�>��l���~��R�8/��Z&���N�Lg�i4x��m�c�{���'�Ww�s3�z~��c|���i(�J�؎��e;M��YXLǜ��Ŝ������s\M���%lE}�Ǘ/5����n�Ҝ�3y�.�
�F��_�.P��+���3���!����֠�v�T͎90?��Y���<`V��Yp���*ZLs���&W$s�A�
(��� �:��Э'E��(��/(�ȋ���t�>j
��(N��������肗�Ry�C0B7��q��Uda8
����.6�L�s��|�X�sa$���'��M>�|(�ݱ4��᧭��[���-�ʹ�i����ՙ}Rn��4:�Dƒ�������\ޘ{�b.�х�8�3U��|sz��&�YϸÌ�;��3ý�2�5�
nѽ��X�ݕ%{>��yF�Mi���mK'=IyM�j�hb�\B�4�|^u�c��>�{���SB�g2�xI�����2�Oj3��D�T����I��0�̙��e'�%�c	`���x��O18/�~v"�b���e�ƩO8q��Y�Uz��W���GY���m/t�6�"�7��V��%fw��]��o�"���M�(�b�>�P�eyAo8:.Q���Ѐ�9ZTg��2+I�ztJ�h���z�l0�_s\y�']'|�%d�J��L�4�JM�VӯV��rB^:A̹��e�*;��eĴvDm�)&���vZY���V���I��szsD��2��s��,S8����u.�&s�, ���xM��"�
��� ��
�Q%���gPQ�
�M��I�@9����_�e*�afh�h�DnH[��6��g@��˹�.���yi��bئݡ���Nb�)����R�X��7I����܎x�M���bG\��^���J?����%ܽ�]Ln��UW�밹��+͝)����Ս-y��2T�t5�����vVr�{��bG��
J�A����Zc
u8�y���R����8٘��G��L�*9_��#`��|V���i���������U�<w���'Q62)�%'�Bl��nU'�e8NqH��n˗��,O9��L��a��R"��a�!,_(]~�"𰂮%񲗽x��*U��Tv{MlMNV)��I��V0�Ђ��~�.�����*d	 uK��< w%	O�Ӷ�V}&����+3�C�	:E"��D�G���ڞ�΍�p�Z����~{�fǰ9?m#���ҫp��qS&%,��诘�Hy�D����kAd�6eAf�5<����{D��ɓܺ����( ��ȣy�|�os	�b��.����o�����)�*<�YH!�A��ꛨA���A������2ę!��ݠ��c���*K��<|#:�^if*�(�˭�4ŵ+l�~�~ˬ߉�v�Jc}cicm��za�^[[�QhJ[aoO�a�u	�,��聤
�zԭ�By��.B���۠�:��{m���@��e���,~�h��.-�^��08,^����ы��V���f��X�G]X4L(L����>��&��n�p�"�CIi�d
i���9C	^�C摒�+/� ��hѫzD��c���dqRQeO��MzYõ%�:Zu����o�1AU�	L[�N6Ah������w�t=��Tv+�P��-��
R�&��ڝ6U�c��L���"Q�f};"�|2���ɇ����?Q��PT�5���� V�AY���q�����v�$�L�	�����
�>��/{<˃�un�c�ՠۮ���aһ�H�GC�2���Z��s��%
�;B5�.�����; ���r����f�v���	�Qb��������V�@
��`e�v�3�r��w��Ǔ�w���6'���3�4��{����w���/j�]���j���`��>��s�E�7N�U`g��Z_����i5��e��8��7-L�C�b
B��|0y�a�rK�d��a	�q]D��.CRs`�u`
g�:M��@5g\�w:0�7�K�৴��y{0y{�����b�p�&��/���;���[�{�_�sc^�[��a��ߵ/L�؟��t�D��낧�����A߰P+�8+-<��u�<��]שxT�<��Ɵ�1x@��D̏�����A���`��(��ܬθ Q#�2�8W��&0���*���k����s�r�\X&|�e>�Z'�D_��@�%��9���2Cі���[U�'"�Hȹ΀/yj����3z�q�5���H`���������M����O����Z҂n`o��*�7Ae:�3���Z�����0jb��G8^�PI��_@���|����ZЂӷ�"ٖ��Ao7����8(lh$BϓD�M���!��U}��޴p1�(�U���!
~t3�w�wTMIv����x1�~�v���U��]a̖&ٳ����[z���"��h���0�,YeR��4�y?��}�!}]g���i2;u9]��@c�,L�4�-�:�W-!F?���AՖ�1���) �
$�t��à/�h�ǩ�*�����w��Ͱ�1_�K��ӭ��#�2���������Z�����U�K�B[M�lG�H�ľ��ch;7�A��P�q�gM�.��8��H�`��Oz��}�o㔇��b�?y�F/���h�~�%`@�K��(�]]��Y��_<�C*� ��셝��~�`��2x�1�����P/z슖�$IC��܌7��]fi.GB�͊e�}O-
1DIVa_�w����
F��sZdBk ��n8��( v������̪a�b�Cl$c�}��}����[�9N�Xc_ɼ���܀���Oeb���{�R��H���t���"F���3F�o��w�o�G��#�l�V{27<j��Z(LK�|��j��(�+[�+��2�l�mX������g�<5~4�>@;�/<B�k�Ԏw�����|����1��Gz�����1h;���[h���-Ly!��7��?Q�0�Q��)���ѐ���=��Ҋ�)��'t�6�,�k<�	�E��?v�̲b��
�ކ�1
�Ff�y,�^hㅁ_��j]�]��SFF���JIe�nm�0��dbMS�]��Ă��<�f=U}���ݽ�α���;/���1���'ր�a��s1���?R�l�|m�GŀOo�f�3��k^��~��,���&U�[����А���\�܍�Q���rR��S��0����.��n�	>�\tw��N�]h�$UUKJc꬞H���
��G��W�?Kp���6�/�U��/����ߐ���"���^���NR��-^��b؀]���v�������ظ-���<�"�[����q�Y����n���dlAA��f��2,�-�l��_˒4d�|F�Բ�u���Y:_�%N�*��6�j�Ǉa�Ӊ�͓6S�6�o%�Tp�r�
��M���GBщ��9D/�'�D���qS�֥)օ�v��"!]V�BL�.�K+0G�1�� ��[ �= 2���"���{�t,�C���K��{tJka՜��?���ͻ�΢Y�n�6@��*p�oo&���!W��Y�D�~&
�����0�c�[��j\��B!7��ʒp��LB"�D���z}y#W��DT��(���c�vԙ�D]�36�'�8���]�-���W�)��Df�����`e#���D����(�z�T��L}]��ӎVZ)����/�}9�(��0�f�w�)U��&�u_VV���J�8#�L��t��Q|7.���>�씮�;t�&�*w�~���8��01"y��q��{#l�k�9<rz�U�[���wb�E���L�L���2ue[�����2>B����z~�JO���!���I�&o�K�I�*g��x����C[�S^�]g��t��qJ)���F��n@�]m7,*��E�8�����l/��<�5?ӻ��I��'����FTZ[懢�9���%���1%����	$�������[mX�k��>�
w_��<����nK�pYd;{��Gf5s�#�&28l]�RM��jK�9���n��M�ti$'�%��:�᳒
��a�"
Z>_�G��qUY�o�.gH�Q2�H1���`q�D���Y�qwy�x��j�o.(��j�ü�a3����uC+F�h����UF�PqZ]:5��,�~�В�<�ϟ� O2��&����z��Z/�ż�L�$	�
_z[�� �CY��֞��Iͮ:p?�p��<+�r�k�ɰ)���ә��VNoR\����<5��c���]��]B�� �2<���<@G�)�����^ߔ��
�AN2���ZȜ��K��<�*m�B���\"��@ؽ�xX*���E���Qc��Ǐ&o���/'oQ�_��@s��}��t��?�뢶o
q̑tΒt˓,�����v�c��OH$|��?D��ߌ7��{�?�@�9�Q��?�|P�Ŕ��\�Ǒ���];����&����a=>?Ag�7�
��+
��Oq�0���~��]O^�O�R3��'��{�l��/����h���=ykAS{sX�%�h�C)�u��ۋ�Ը6�n��t�fkl�D��l��dՒ�|k���1<�SgY��%���\�)$Tv�
Y���j��*�=�Q2�-����K�J).~���t������T�uJ,�Ex�"�U����ۿg-QB
_�,���/���%�R�E��Dg��C�����X�B�P�7M�	B>mF��|��*-?�a�5��!�I8��x:Wr{0=z�c
��"]�,zԾV�c{��L	�X��~oa�ˆ���w��j�H�%Bq�$�F�Ƽ�T`�4��>�P�"���YYXP�
EI��D�'+9���	n~�,\����
�Vek�CJ�K<�ӻ�"�yi�	s,)p�D$��A7 H���L����xG�Y��-�bR"�\̃Q�����iG�S���2���؃��R,!���Hehg~���%O�.��mJ�L�0��
Tc��#�I�KeD��HP�
�����F���97���}���y��j�=Q'U�7I����v��r��7JF3�1G���֥��l���j�Q�;z�A6z
[M���n�����9��	�L�H�#?��z�8R�_b���L1aD츚=K#���ͼ6�p��\�m-�e'ִr$��aw�ؓ)�I����F�������/�μ.�M��*o�EĦ۱w.�,��,?�<-�AaV�;�z��SΨܤ�����#�K��{�|c^	�{줧���w�W�n����Ӭת���5����Z"1W	�Xwl!Ƚ���lTC(�݁э^�a2�˵mx:l�\�����ݠoz>'���	hf���T�u�0��Ω2B�-꒜y?�	���T>3h��#׭��8�d����?��d|G��;���CD��ƿ�~p�<�y�E���R�[?������S�/����n^:1lS�Z7�ɍ����p壚�t�_N�m���[J��n�1_]f�R�`���H�g"nN�6�ӑo���L��	��sp���%�����o�2e)w���m�͈�u&��I�gR��kh�L��w�ʟ0��)���$	
�[[�@ɯ�	�2���W�6�@�0�DB��ǎNr*t�^Z�bAk7�b�����uq�>�N>�nE'�i'A��@�Q��ä=D�Q�o��_�DO]%�h���kj�8�%N_�3�n=Ti1�U���� ZQ�)����qR�1k�����%WFp��C�m�;������`�� ^�� :�l�h�u��EQ�Q�J�D6����y|�ji`��C��"ЌA�~"�qYD��Z#��8�uIVŏ��-ϼ6���v��00�󵠃�a&��Qtl��Y�Y9�7�]�Vp���/��ږ6�������Ql���p�vQ�t_J��\��Xt����
:�A�Kj�Q��h�m0�������&�0�ct�qz
L7:k�v78��{�f4�qP��;M�cQ�H�i��N�H0S���Ƒ���%��Zw�b�݁�6��}�:^��n�3��:��������~�c[���!� %d-��a�a��5c�[�s��z�3)I�5�6�G�}�+�i�v�p�8�,f�p��~�Z(	��5�� M�,Oh��}�/ �| �YV�bj�A�����AC�BY>��#LZ�)�q�(X4�&�ޕ~� +z��5����P:�� ��)rW:"Ū\=�T��)�7� �����_��%��/�U���@�ž֊���(̗c�=�˪Ie��QV��3H������-u�ߣ�,��l��>Vk�'�5����B �����f��ޒ8������^��]հ��J�V���J}q'�����vPs���E%p�t%Ge�F}�~�f?u(��4��V�?S=T�u�ڄ[+i˂ +X����=��|���-4�5���u��M�T���a����td[~�3֊���������l��������l���5
���}8؅�UvG�������ʽouvw;�U�A���>Y��w��V� ����7=XiQi
��R墶CD�
���y����E8��B_�{�?���!��rHG~�Y[��ގ�tZs��Ԭ�.5K�څE]��Z� y++�9+��Bڨ]�3o/`��_ �\��;�ur������oq��v�Q�2��
r��$�n������#�0m/&y�ߝyg�׭;���QV|n ��j�a������_Ѿm�)�mcqǀ���l����b��ݮ�B�Hw�� �U���k�l7�e�J��=�[��[n ��#U\������V;��Y��i���
��p��Wx�D�M��T��	�%A7�瓷�y�����0��1@�S,�8/�dF(g�i��ɫm�Q���A�c��09�0�U�Q���"��H�dz�EUL�ɂg,���JtGZ���"����\(Ly(L8 6����.^f_�ӤR~Z
	�g=���~eP�3	)�H5��Cpϗj=dO�&�̓x��>���"Ȏ�6�a	["�c+���sb��Ų��iޓ{��Co��un�X���+���8ɋ��~m7��1�>Bym�7�Zp�`��$���R.-���Q�P�a���� %�x�-ƽ���BT�%Stc>F9L�Rg������g>M݄�����ױv�wV�;�*%���^AF�b�9�O��Z�fZۂ���_"B� �����G��ϳ*�N	
�b�Apz1:x1Y@F
V��ԁ�Y���_�
��� ~�x���OD�\D�x�M�T����-B�x��>uW�b@Y� �2�F���<Q�g��qq����z��
"/���N�^*Y�������!��;C��w�a��S��,��u1E�L��[&1���+���a
	#�t�6j��3[����'��bp��O�����}�rS�J��`!#w����
.�F��Ob3��,�Nf���r�"��Qp�U�D�Z�Ğ���<�(�ˑC�z ���w���)
`W�>C��� �^�QD�d����At��"n�~���p��2A4���$(�y�؅��
@���Du��2�^���Բ�#9�2dr�c����KD-u�lC�˗G����%r�^��9�)P5#*e��Y�^e����TńI�3&�I�h�%Q�(KDN�щ�o���j���ᛰ�V��K	�*�B�T���S����ܒ.P��E�
ʗ_�o�Z� s(�����<�.�q�H6��O������H�(
=���0�9����rʥ����A��t����h��%�����|��-Vt�r�o�+��C3���f�͏O�c�?���w���%�0G�7�$��څ��y�1�|=y{�vZ��G�w�Hq`_��YM�&
�+���KK����	[-!ӴXc�(>�b�fD쏌�Z(��U�2�jF'M$�I>y $���_ɻG����Vs�Qo툢j�������� ��cE�f'�j)iM���L�G��b��ek7��'��	��	}by�X%'�m{�?��s1�Y�t��JȽ+{��rG���L���Z��<�����i�^^�>3}\�ۿ珰�y�v�y�~a�_��C�|]|:�_���xt=�ě޾�׭ aK�_��a���b?�����[�(��&}�?O��@�i:툆�h���r;�1ݎh<���&wD�΋�����{�N��w��}��Y�oJy��W�!j�d�)���|e��=��W�7����3�SP��Hw^1��^�;y�D���5�#�&)����1��ټ�7��~e�
;sA]w¡-�����!�����O�m��������[��Y�͞q������a� ֖����X�Z��*T�Ň���3�(���1a��z\���� �C��)��3��48�V�{X�S�����V�¼�:o�i8�>M3m��Z6�8c���7�r�N�39���ւVLq��0�\;��F��a�G"�od덦Ǝ�(�|�jG�0���GT:���R�ġT6�ϣ���t�e�-z��c�����l�(���Z'N�z��<��ڤ���������?�ӌ���_�����p'�c-wC���g\�*|��\h�x���dM>Q��rtA
���'��S�&EwJAp��~���0��j���)9喬������7�Ӌ9��[�`�l1����v�dXjj�,0���g� �GU�@�\c~��Qd:N5�V��f��º��"Y�2j��gP��Q���Mj��a��q_q��..���J7t�i���
y�(��.���l�0�VN�ߥ,�ׂN�u��쒇.O��9������bCR�;�`CS�;��ha!/�(��N��K�b�����Q���ݘ���8elu�����y�2�w�g&�&�N�zv�,��[�s�
����]$fE�/KJ��{{��Y�"���Ӎ��k�?��xX��2�/�c�0�T|Wr�k���.2�ĢH���ѿ~�����r�yj;~���⓮@�$�>Hq{�/X,)�|��ؙ{a����c�vGѠ�	�����N��o򍽉�������!67ko{W4HR���2�@1�!����<���� i찛����o߸N�^�RH�wS
��������A����L�id
k�w����c��[�.׶�;�|��8�a�;8��ܵN�x�J�}V1�R��ǢQ�9�5��� ��������r��8^>���Zo��\��M��,�(��pe�w{��2����疼`1i�@w5�eӷ�%���w�S�叆�A��r����6��f��] Kl!�����<�U��+�+^H��1�'��Wx��t���)~��E��['��]�uD�9�������|
��r�3h����s0�W��;C��;��Y��p��
7|�;���Y�|rxեt����|����[U�ml��L���f����ݖ��;����7
Z߾u��7v��I�p�}���+	}��͗�ù�h��<�+�#����e�2ݱ�;LX��o�˒�5�/�"��#����X�rS�$
P1Ռ���۸�/Y^�Hk���}J=�� �g_9ǷHN��7�Q�*@�e(�L� �N�Z~"�RH�Gl٬b����M/;�DP/�
�ӺB�3���	N�)�L�gF�3_�փި  ���3攣�	�n�V��%٨Qйt"��T���>fYL��{~� �t�l����r���@+�ц �|P��p�ECyͭx~�X�!d�����r�/���^����Ԇu^d�:+.=�Up��య�-@ -:D�]��zIL:�!�����=�
�A3��j,�,���H.�p�c�(��sc�ƟO����F�}
7��l��$+��}�2�%3�ɘ�	Ӗ��|:���_���'"	s-�������4RD���K���zmeq�l˛�r�(�]� ZOB�XT��s�,%U�sZނ���T�6�c����d"V�H�服.�uxZ��  ���]�n�J~�5!M��i�
 $$�T~����5`�$V�1�o�tޅs���M�8gf�ovm'p⦍wǳ�3��η��Ɛz´y,���ƛ��T��F(��XZ��wq��@��s���7�jXy�b�c����u�}
@���o�����S�r�����w�
7h� A��
`{�����s���A�We���Y��7D���m�u�~�z!���{�¦:���4���r���B��ËC*�r�Fb^��D�󗜘"A.�� z��z/$�D��>+�2��*w����~)���QQǨ`�(�B����&��L��f{�RU��Ta�;i4�/K_�΢��¾�VAo?�X+}@������-]�L��"w:Z��q�]B�Nö��fov���	���PJ�b���P5>����]�p�P�8B�$E�~8���Yo�ޅd1
�x
]>�f�i	�ql�@[�U��}u���^C}W(����Gr�"�M$���ϸ�����xX+J~�k�F������0�*1�Jl��OIި��@r��	�e8�\D�-�z�2�H��ڳ_��K1��ḋٌ��:��V|��ut�nX!yj�G���.ib +]��N�@�o��Be�UW^�=�ΓL��n")�Lt`��Q�m�0?�����ҹ}S��O�ߥ�奝�z"�4*YZ�\�s��������TQ�a�5Q����%�GB$��U�M	5J��|@�
�K |E~��{�`)�B����qv?�lx��8���Uj�<�iD�Ȩ貀�H�����?�;iR-&}�b<����u��B^U6b���([�/�hۂ��F.���l�iQ.��9�*a6~؏_��&hBRo
>
�!Ũ���,�t�.S]�O��e�m[n�x����J�W�]���*V�o+T���U.K�5�n��ze~�Û�7I��������(�g�w3�Q�0ǐ��v�U����n�:�$�L�$�I��\��p�K�Ϧ}�^�:;@�]W�D��
X�:���|�JP;Ȕ���΄?���W�b{ ��t��E4Oc7��?A����*��BO�|��ox����LoJ��kZ^�
��<B��p:7�q�l��+�KU����ypK�34c���|�<&�I�/ ��M��5*�:Q��\Sb�n��b�H*�%�`e�+�Fzb�gȕ1f1V/���u1F,�"&U�5a�������X�F�� ��b��4W�)�7���>���a>�#��lN�zPu��#$8.q�Ɵt*����/�ii�/��J IoZ�֭0�jz��#���īژVs����izF�D�ň󣇘R�����m�
���)�S�@I�  �� ����