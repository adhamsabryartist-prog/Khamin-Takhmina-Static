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
      const checkAdmin = (email) => {
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
                          : (keys || 0) < 100 && <Lock className="w-4 h-4" />}x��}ks�֕���W;�̨��&)��^Z���U��I�V%�� Vw� E2��F�������~���Le2���-ɲ��r����ʷ���O�sν .��B�II�e��.�=���~����v�n�a|�/���33�sfF�WF�Ʒǟ�\�+����V7�8�.���\ǿ$��!�fg�G�[���>���ќ��;Q7���~��y�����4a�5�\қ+i����k5n�u�_w�F�=������0�aF3����Px\>
Z=,^���\���w��~Gw��=7��w����Z�ۢ�F��7�e8oD���]_��M�8�����/���_�Cw�>�l:a�1�x�zk��t�K^x���q��p#�<'�A��~0���^F0�V}f��^ύ�Kތr�ra�N�eu\���K3�_���	<Eh��Q�ۈ=�������b\�z�� x{[q}�/g���o��9kܲڃ�;�-�����hm��\r;�f=���V������ѝ���'��������|�K��T�&�fuxQG9�] �a��Q6��-��?282��G�Z�PH���O�6"� j�,7��m�>�9���l��� [��jl�7�h�{2{�t�~�V�/ύ&�q��8�>����;^��!�)L�x��?Z�����֧#1�d�s08����wjD��������FnQ�tX{�� _<	I
��n<�>?��P�E�2��!*�Vԗ�_N��5���� 
C��]vF_4��
;�c��b��cDX��+=/�k3��@k��;����ף'����9㫣'p�=$�f����~0�b�D���!v.L��n�f����:?~��X�B�Y:�N{#���>b#��:�S5U���B=����m�ǤĐ3��JPK���(��ET����!p\4z���=�w���m%��k�(���9B�s>����(���O��_E�,p`�9��}��:KͿ�5��k��#x���Z3�6�h^,�Q@u�i}���A�S�����Ofb�G�s'��|���Q>�ę��o~�T�,�$MM.�6(a����p:����`74��X�-z�!�a�X��)����10P�yO�?p
��?��#,��-��7��g�c�F�o0����
M |k|}70�~��Ҋ,�4b)mڈ3����j#��(c��q�Xu�8�,И�.�����U�*T,��*JVd%+���_�H���A.���ܽ�����!Uɍc"d������J���pp��FN��B�,b�����8��`읶����a�js��U�Ds�{%���F���鋎ϭ@r��C/�m/���B�w��9�k��^�q{����\26�Mz�,��ǳ���� =���Ύ�Y���cNӹ���ޙ�i�x�����aD�oj��ȋ���s��w��C�d#D�y��R��<g��A��ӯ�����z�K�#N���
0� �ݞ�k�vȁu�J�A��=O�JnM�f1� ��v�]��n��Lo2�uz��G����w�N�2:�d�*R��zDǽFC`$Cw�Ex�
'�t0d�,%0��R��f�"�[��EuR��2����L/.}S>�ǻ-�3/U�Ԣ��ӱ��àKΙ����^/�d�C"��u�d#� 9j&g��=�(��L6 ��o%��ے�]�m�Hr�0������a�!z�I�f�O���}��W��V��RI�.����M����֚����s��ƃq���C�����?�C�c�eL�"�����X�n������E�&���mi�ZD	��������ӿ]w7�����A�
�
�uP�^o�
%�}|XҧR�B0�ivMzb��{�: :}��
�9y� ��0tvO��W����"|�����>D}�aB���8�H ?����u%W ���E�.wDw#��*iCw�d-譗$���a@��*�K5�Un��?��fci��������Eh!��L����i�i�����D�¹�t��Ҭ kz i�ng�����&�!?��1 �\}���6���0�ǀ�`�E4¡��|�~}6��P����(��폓�i :�E�[D�r�@c�� t�$w��{�hd�}��KV��I2m�|W��F�,��]����e��77�;5�Q#yt�3��n��Ή �}=�9N|&���B+�����\���mX��f�1��4�2cW�����찌��o��z��:l�}Ga������&�\�Uz�P*��U��y���ט�$=�=��:?8�H�o����D.pњ�=��[�X @�����3x�]:85��Y����4�+0�Wx�����EC(�X�|<=�e�q� �����l���S9r���~.mi�{h��=C�������@+o ��0�n���
��3FY`8�۹�r�����Ʉ�;'9&�����E$��	��8">*���[�U\j���>��w��T0��ԋ�������`��_�+�/j���
tdsdG���zj��"b�3��(�3�*�39?A5@�?d2Zv�Tn&��S�~���|%2�U�%�w�)�x�g�"G�ytR(�bV��/��N"b4���T\G K»�6���!�"��{,Ed��^ݤ���頖�`�w����� j�ŷ�����9Y��7��]��.��.��.e:���`��w~��BF�zf�*~��(��d��J�TG'��* ��QL�	�OJ<�9K2Z�){��a�)���)��g��G��eJ�E���Iz�b�z��!�N�����g^� �!�	*���pF=��P�m���eB�S|X`��@��<{�"5W�w?h�!�(g<*x��_�or'K�7�:Ӥ�(F�����N
F������ւ&[����k�����Yp@p�E�����3N�:NZ-��=D^r��G
C�`�Z^��7z" #[p
�Ee���_:�:S�c�hT��"����x掟�i�ށXⴎ-�����7(
�����f����fv|��?wص��x����w��vK�}�]�X3GjL�d��c�PO���6zՔ���x�6+d���?H�פ��{��	?l���	P�o�#*��u/&�[mk8뼾��7�w�O��(&�'Cp���;+bh>Qj�a`�%�W�S9� U�e�<�׮7z@L\1��7Jb!�T��� u�\���yRɓ��D��q�����''��'�>� %�+�W�Ker
Zi
 ��5P�C����OJGS1%���xZ?�#�����K��Cd8/e:��v�h�wAؽ��A� �\�%M-ij�"M�;J���LE��JM�Z/q�^#\Jl�7�q�L��Xl�LK��ߒɜL�H��|���3���" #�P�n� � �E����(���l�����@KN�6�|��z���v:��~ӞӃ`s��^�*=�v�ǂJoK�th�ZgX�����M��,� ��*Fȡ��a�`��i�T�â���[D�
B��9���)h�mL��%�p���U��~#�</��������ltN`���Q���/���u+(��2�%��P/�E�Z|E��II�{�Dj�!R*)�]�
$�]AdIV��q}Na��;@�@��FQi������3
g#�,�����y\��xX�T�����sV�xՆ�F��=�a���)��miӒ�6-��M�I����Ʊe��i�� O���������P&Y��Z��<�t���J�COx��!<x�E*ɥ�/Ț��r����	'24�X�3a0�V
���b��6���\��\��o�`K��ry��I�)_0Q���M�n��~�|��$0_��A<�5rg'<p�3�X��5ʔ���qx��MX��ʅ'�Xx���J=�2��%7v����֚Kr曓d@ja�4Kp��y�'��R��V�M�e�����nF;"H���u+������|aP�����>�\P"!KR<P�����!��x�|�+r`=&�Xp>��1_ �P(��10�[\5�����
ei�!H�V��
����b�L,5Mu:�;���^H��kG]�yu�5!�1�yR��HK��i	<gK�jd�:���Bݳ�o0~��TI��u�?ڃ�'�x�9��a�[��>ʟ�!��h����s���d�b
���8�P���н _�����V/�ʑV�(V��u�p`a���ʑ�JR5�ѕBy���Ujq��/E����E*�]�;x��]g�u����	�y�+���;�Y�J�
-u5L�/٘��F�P�~jLVK�`��4�R6'���צ�6>
�6�
`V��v�J����u�j�ǜ?���!�\�q.��Z���z~A����u0<��z���Ɯ|�s��ZMsMcj���k�*w�DQ�yI��<�_)l�k��;�pn�u
x��t����뚂jX\�݋`U�'V��	�HyKp� �V?�u!H�
�G�s�R�wpG�n�P��ҽ�1�7�Bh����������3q̉�0{:�v
�:3����:IX R�`[��X:�y�.'rF�H��� ���tU&��Pl
� %��X�0TJ5u%*GV���k��($�BX�rY*yt5"i��4
j�F��יU����<�=�8���u
��i.׻�I�%��y�YV$K�{N�ļ>7�T��`@*�B�Uq瑝t%��RǱē��(��
�qy�#p$��r��t6B�r�2��5Ч~���'AI�����'�s�Ie|Ej��X*�P;eX?'olUy��E��h�Dg7J�Tؕ3��w	>��,��(P�譞_[�$��^oSb�ҟ]��^�I.��e0���[h�u���3�� �macH�B>D��o��{1DAg���*�Ԧ�&�a�� 5P+��kh�ˊl�欶lN��n�F�$V����8�˿lC-���B����&�Q��ļL[�����C�4v
,<Ge�2;��G��w݅����2�����[B ���ҔH�c�*C�2r���#o�
;��
{�<nPGwm0$ђh�Z��$��Ku)�#
uU�W@����u�ۼr數"%���FR���?���#-�����1��Z�;�*-���b��B������*J�f��4]�ǫ���R¼���$�Y-l�O���4�IP
Ⱥ�/2�.G��DD3(�)j�,�Z9�H�wfm���[��@ԋ�$�s�Ạ>wb�����'�e�5�[��9>X�S8�]`>a�$��j-u��ٙ�CC�&A
����X!TH�+N`��=:yIk
P[�w��ܔ��`+�����{��(���5j���YUS�&�Z@!��^_8�d�]����?]0���/=����	�YQ�ej���? l�b���p.�9M
��p���g���:J�������M��JV����䕴�v$y�?]�BljX�>�� ˓��b�� �b3��n�H�����P*��h��
���{�Q���ǉ4t��B3�Y8�d�U��g���+���j���d<�Ӧ%�e�0u71l%��T�-�5yS�|)�11$U�A��>�D��T}�V�v"m-24�	��ˣҷ�`L�<�r,�򮷦`��)���`2q����]�	�Cb�P��=�X:�\��1�($�ړ
����?M�ce6�j����o|ڋc�<4�E��|�B+�'#��,#�1Zj&�O�I�G�;�&�;S��@p�Aɻo( %����Ջ!�i�R�/��|G�-[�'��j���>�9��.�y�m���D���?�y�j�]��Z�eG<nH��U�n�.��=��w��]��# ����Y��f�i����;f��oUd���Zo�:���x�����.����ߋ�D�w�����_����$��dKU�FJix���@�L䦒&�t�Ҷ�.�>)������6n�f�
�Be"�l��'�:Mc�m���z*:�����=�Z\��Қ�P+�(M�3}E���z�x!�:��/i�6��9��8�ז��;��Ӑ�\��LΙ�X=L:X�2��K����h۵���}����#�v."���>eh�E���]r�oט��MnJP�p�c��"�|��1�����?9����i�)�V1qVzs��H�EN]̶#H�N�����ÝA�h��!uzml�p���n�D@js"�^��<�|3�����*�41�Y���ljGѺ�%b'!�|�a�E|hB���!y�Ւ
�꣋B����� %��3z2����\8W?�=m�������;ܩ)E{���_����{u'Ze��>�(
�\1n/ 8
��]� "����\�}p>�ڡ��x��Y��	\����S�	��]��bL���������
�B9 �E>s��S���N8��6��M��a�fX@j�;�w�0�Ksm �<�bV�S't4�byF�R��L�a��(vhEβ�DFp)x�*��3�ל
5k\��U�aL/�������Ӕq����Ja{e���qry%=����A�
�!k��&����jz�#Yr�22�%<�s�iƼs=�u�O�:� ��2�x������m��<��������,L]1S��rsz�gCgk���a��x����eS�q��φ�e��JUk1yF��m�T�����{��Njf�`���k6?�X�٬�{n�m��� �eV�@w �R .z�8{�
k�zg^_u�����|�N��b����o�;8�e�,ӂrK��xϝ�e��oPl�%�~'�s.ܡ��VrȩP��úSΏ�{���`����i3N �]��]k~�7k���������J�[���x���F.V���J�>���HE�v��|��	��:j���l����$H(�k����.�p�[aq#y8��������7
(��}<���U���F8����d:�x�[0�H��ڑ��3g
;��f���a��cX���]�@��l7=M���Ҋ
���`����0612��IJ=J�I#]@�����e���q%����pS��U/W��l�1vRA�IԙgPrǺy(t�C5���o�����!��j�s��m A5{ ɠ�E���E�͇�5���ؠ�i�	���m��P�nf������G�:p�e�i�;�?7v�O�N{��~[<y�~YH?Z:�?:|4�+��Hzב#�G�]G����wM>z-��䣕�����GGҏ�]�d�->�V2�֑7O^>7�����0�{�;��q��l���a�R�rff�֟�N��C�fsT0(yO#��00��K@v&BхK������&yXQf%v>�ĩ��EL�&`K��EMU�&����Ť�p�\���[�A�Ri�	�`���:j��z�rl�w�t~��]���A���^w�j�<^������(+wOP�i��b��S�@ShD*P���d"�3�r깐��V�D���ba�.E�d���Ȉ�Ir��<@#^>�l1K������b&&�,T�*��D����:ɻ��чҪ��O�ϨSs�����xY��L�c,�Q�tki*��&MwI�P�{̨�Nl�K��O�Oc�/�7��oމ�:�Z$�.��{�Z5��[gk�+ɾ����W�5�։��������b1<��J�Xs^����*vӽΫ�2��P�N	4���4�K��C�F��(�a�&��&Y*"�"�e�
�Q��(��L#���˴��"��7��hssK}�����[h�6����(^��O�����X���o���ݠ}2��/dX7��=�W��'��e������N0�)~0�{d������@�'�_h�Wa��Tǩ>���e�]���oz����
6�^�Uw����WAE�j`0 �.^	�U���F�#�kQs�0)��=7���z����O��C��� kW�{}|6閜����=<�;��e�O�tQ0�o����ԥ:��Yz9�Ǉ�Z�P�Ӵ�Z���b}�b���s��B�`S�Wf�D˜Ɯ�9l��F�V�0�B�.��J�q�=���f�������`6��)Bs�FީA���Z.p>�w�_�')L
Gx}�x�~|�9���en8�ʊo�&��e��,-��R�\�&�	���{KjZ�j9��;d��ͬ�z���Ө]�f�8>6��=aic�+T�0m"%nJ�^�:͗�L�3;3��J^
-1�=�/`��#�(3�i�d��l�c�/����r�^)ݛ]���K��4i��Cp1�S�K�S�{��� �<{*o�j��	S����-XѰ�~�RE1g�Dm=�;�@�&�/���OWά|t��L���{��޽�P��:K
9�fY��!�^;ޖ�/Ə�F�[�e:�����;P\�3�[YQ�Qȅ4���>���4��e��V��볫�`ׁ���ͬ�{����i
��� ��!���y�B`�/��Q'�-�@���e��!&A
I؁|��N��Gh�Nz,˛���]��9�o�\=x=.q��hZ�^Fku�]#��b?�F��@��yC4�E��B �9 c/��/咓~;g�7@�^fƢ�~-�$�K,L@�����>sԉ����g���4&�r����T뽏�B��i�0eQ���,�/ف������-�A�KB��,@�PI@�@0[0�UBm�-����������'�̠�=���ի�E锩�0�@�yZ���ʔ��$��T�Tj!��Q�b��SS��%D4�>}3�F)+�pu�x|�Ȩ!?�K&��� 6�Al5�qM�P�fU��R[�ĢbB�pD�\�?�L.m�.�CRx���T�'F/�2#�?�&�իBLf!��JMM�B���s~��VU:.U�+Ȍ��eh�5n
�池�r�h��0i��l8�:l�K\XL3�i��xy��NVs?��*F�K�@�W�t�����e>�r�o�Q)(Tr}G=���1Bds�ɰ����QhɘMn��+p�f���`��O
b�9�j�5k/�KN�_�O�UR؀�=L��� l�=k!�������0idq
�Du#�e)��l���(���i�����KQ7D�g3ooȁ��A�$�AkТ�M��^[�S�b>}��c��F
NO�.�^U��a���Re�9)(���}�K�fm�^���[r���Z�wF����۟v�HQ��p�:�ku�ֵR�����z���7oJZ��RA�j�GU<�%�M��R�������'Μ����o��Y�͵���f�,�k� �Y`oT��n܈���l�k����Ѓs��5�3봺,���|����
Ȇ�M��w�RU�끅J��u��Nʹ�@��t�L-4�f�
������}��`�wL沐��EIf�������[�Kl�%�WBp��a��v�Tt��g;eS�D�LM'�& �^�S8*F@��)l��vo��E5�Y����*�&Zb -�6�l�Cq4�� ����b!�N�m����5��<�=�HK�뿟���+~�N��a�5��軪Q�i�2D�����W���ʨIFu��7?e�Y������1fK�C��m�x�lx�Gsw2X���L|޹��&��^f\��I��>��my�Æ}�M�%&��;��[[kH�����t��7�3`�Ƚ�T]�9j�����`U�vsŽ��=���b竳@jC1:��Nə.O���[ޚ�ы����~0��&Y�Z+	Tڈܢ u��
��9�u�BR�&0��gX�吠�Ҳܬ�2���8�̌���I�9qJ��//����-L�j�D���������M�{&p�-2��6޿�ƺ>�ey�*���L�B�W�e��J�"2�CE}E�'�9�M�ד�	-[0U,��9�R_��e&)L�IM�h�/~�Y�u,1k"M�<�oa
�`#��Mu��;��oHc�q�b)f�����`iݗ�
_������T��/VU�_�Z,�1��I�����<��}���6U*���I�4��/=zD�;����w�:�#y�=6���G?�;�{ۧk�~�n��,	�/��>�I�<������ѷ�!5��F�P͌���/
:�ޠ���^�`�-��M��K}E��O��`�Wr���Z�g�:#J�Ag{`5 �
p+�\�!�#
(P����z�9~ށ��躊��xM�ju
����,�B��R~��v�lt�`�\FS�$U1�}�%��A�#k�L�7��(��O���)`8��நG�*�k#���_�v��qA��Y���k[���b���w��M�7�� =�^�If��Dla��Ny��]���0z�U�4�����&wα
�
C�T�x��ߏ>쾌`� �L���]F��
`�ܵhm+�:�ƞ�>6�ɍ�%����M�A��Z�є�bo4��{x��(�E�5�Fg2`����n\�_��9u�8l������P/Y�G+
q]���+$=qq����2L5H���4�ۈ��+�)tB�I Mg��>���e�S�J�[���sg����SP�����#�}�h��M/�B�L����
�Cd��#6j����*9��!�.
]k\��l|��I�2�ty�4FCn̂67����`>�ZlYb��� ��ƌ
�V�A���^g ��ۖ�D���
�K!�X�M��,K__��P�]@ �V�����T���hIo�� �5�jrK���=F�(=�"%�����Y��+�Ua.�
��+�\��X }J��w����/$z+�',uX�ϐGWD4��D���8󤧊z�3��H�WO+J���
�0���xC��(����x1tҚt%�i7��C��X�k��)�I�[������J�;S��Xa��ɣZ"��g�{�g�{��.㲿=qZ����B�4��|Q@��H�}���H���6�@g}:�suyiy��|�wB~0Ea��jV%�xaq��⠠'���mK����镩?����qC}�s-DĿcN�
�<wc�b�H�CK��� �o��E��1_6�����w&tX(u�b�]!�F}"��$
]h�? ����I�27uy�<�O��Wف<��9 �U�q��ܼu��XclY\��5᥇s�9b0Z�]��3�E�T�؂����E��������ѷhv|L�0���ӱrc����$!����!�A\Q�g)�|e��n��f�N��]��b�4&&ڥ>�Bm�'~D���~��աtd�����U�0
7R�&�JC<����3��y�$�b��\V�&��K�܉�pW����@�B���
�n�W��m���Т��oy�4AYL;FZ�	�!�Ny��y�,�@�s���U��������Ć��@���!�ղ�G�s����!�m7�$���O%���&6��9�*��+�A��c�ử���°�	�Y�G:}�\�5}wmUdM�"�^���H�Xz@/�Ech��sivM��{%D�"ݸ�=�	��uw#���JRiÏ�_��r@ח�~�)ܮ���s���٤�招*�:�ւb4��s�P�]��P���
�OS�I������#���"^��X��m.^�
Ƌ�A�|L���]S�M����eqw%ư���si�1*u�����R�:$8�L��@�l��C�\��a�������	8b4X�P�"X�Y?�O>�~R�ː�5Ğ�M�:Z�B=��nbe,.WXc��C�l46>a�U�~��<Cb@kd����}�k'�����e����=���صi�x����?rz�~ߋb�?�G��F����<�Hs�
�o��+-��� ���o�^��0�U�����*�@$f�3T���ClR*��a�A%�s٪zb2W.��Z�:n�Y`&A�<�c��\��P��"s#��9���[W��iڭ��s�YU�Ix՝7K��Up�ȊVM�U��5�n�eS\�]���d^�Wd�,��D���l9Á��Z]kep��/�;͈��% QG�$�k�]V���℅���ʳ� 7��a���w��ʱ �}���)9��Y��e��#]��2�w�1)��q5:�`,�W�ߢ'�v�x �]�_��l60V�&����w�N5�EC�l*_�/��yW��",P����~��],B�<�7~u�<��J ƫڌ�{�i.���,��uN�^��K�uMu1��9�`{����M��\��F�
hkWb�x�q[�yaeT`��t�y`}}1 �a%�.~�+�^��욊�%^ss�O��dX]�����:<i��&����j�a豆�g'q���&۟I0�)���+�^�*e��M�y� ��A�)�5���勔�<ަ�14��+�;r�į�+r�p,/�b�)�Y+��PuԸ�xX��9sd&^a5��x!�~<������p>G������(MD�qhs�x�����_m^�fTal{+�Ɓ��m��@0�a�̒��VM�X�1����,m6��+�\�<�������A4���d��@*��7�b����pg�����T*�k�>ͬ{�y.�quI�e'��D�Fw�k(@�)e����	.3�0�ݧ��(�>-�=ݖ9�s���ܧx49]���L�h����Ye �،��V�Fr"�GOu6�s�ڶ~�x�)5�����u�\��"�˫=_}�Ԁ{6z�L%9���<���g���w�u�5�K�� �a���p3�Z���~�aڧ�y������ܣ�-������So9Y�
�ڇ�5�
Ig��TI�)n��()�1
y�v\T�������6�A'�l�8�)C��v�A�c!�ih�r��|$7M�v�s����|#r\�`#��Vzk�5ʕ�����yA--�#���z^�%Foeȵ�t0#:�qn_0�̎�rΙЍ��zQ~��\"�3�A��0�
�R�Z�L�nr�%'aʹ�^���vЇ���ɂ3���ˇ,-��^jc(Eׅ;8�a�#=�fj���c^_��#��%c���$|X�J�1��i֘����_�o�o;ppY���p��`棤"�
��2
g3t�2���X����	��92�a�_r����V���H0��F��n�S<�p�y��#�����̏�K�~�b���
��
�3^؏�����|�Qxt�Q���/"�0R�m��^p��a��
I�d��$7)�?�e���,����u�
n1[G�"���3\��s���7�d��c��c����9�,�\��&+�p���TH��}�M����E"M��`�(�]ϊ|7z"ρ�J��( ى��\�ҊuB��d��SVvVs�I�z�H!1D47Y��$� �$��Z)gbux��;�\	M~�D��>�O>q.���xG�x�RjDZ��EM��Ԯh�a]/@~\q�Ra(M`���7d%4�1���9���P1$'�c��Z,MM0�4�g�.���ѣ���»l�����ޠ3�[��*���mR�-8X@��Ŋ��j��CM��π�}_�>���d= $�,K�n��-�E;d�����W�8�!��7h{�H�-��y�V��.y�2�&}b��5�&�?7RJ�[@*�73B'�\��mɐ�y� fj2ܫf�W�h���~*b/d�/J�M��>}�d����n��v��e2�z�,:�a�_螇�f>W�?i��Ti�͓C���1t1>y�Pg�0�dO�+I�e)^���r�,�t�
�!�G����d�M�X,���X&q�}�){�.yc�?f��?B���6�����^�h=iBd��u,Z̮����L���*-�v�v���zw�
vJ�n��5�9+)Ah��H؀Oo��M#�o4l5������45�Y=r�\��e%
&�-+��ib�Bx#�~MQ'\�vP%�^���g��|��V�vy|M���g�k�VK�0hoD	�
��L1%j�GZ7)؈{���c-�bW�^	'!�Écl�/R짮|��P�pgڄZ����O}h�)c�����Oo���ĩ�<�^Bw�2�5-�D�5J��ο@��S�__���+E��WإSQ�+�>$�jU��i����"�u�AA�ɞ�!��n���c�f���
�H���.�& `����U���+��H�F��s�b֙_��V�?��tXy�:�/�8��*�� ��F���9[��{�v K����}e` ݷ�����}ق�J�F�2�m�}yw��g��6p���pP
%����3p�Ks,��w���1R��_�����$�-X��k����왟D�B�NR�ntS�1D��Y�{�#�y�vL�?�;��fJ�0�'�s_u��@xzr�/PS���]&��e�!� ��)����;�[y+�L_�+5J�;"<z�����鬴��=c���!���`�ݷȰ;n��b�R�.�͈��ʩ{Je�:�!#�2��ځ���2kD"��r��Q��8��|�
�X�xXѧfWYlW��%m�D��#�ab]�{��?�=��4;�W�)���=�#oݏ`wpk�rcW�UQ��O_3�K3��F��C��S��ɇ�V�H��5���z��T� �ߎ9��@�?�t�}��8Xg�����1�v��z�B�!���2�j5u.C]|˺��W0@v���X��ij.�lV*/���\>Y��DU�m4W�P�S>�J�RL�=��
�r<��p��S�6b�n*lu����H/2�����P#r���7({�&����]����0s���pۂ�Y7/]�~���$^&or%�:���2�EK�1�mv���f���C�r0x41��D �G�����}�d�������ύ�����/��o�'/�/�GK'�G���w%I�:r$�(��Hr������G����|��~�r8��H����̴ŧ�Jf�:�������7L!$J���|-;b4B�L�����?3����a�$7ޮ��jD �z��divvw��w�Mt�����L$����G@1~�B�@^[�MN�d��G'0����'�-V�L|��iYAk�!\@��HL�,������jV֊� ������OkX���=Ҩ0 ��na����d�ϖ˻���#U�Gt�
z��o����@���a=�k�Ȑ�,����_ˉ����w� 4�y��o�fU��T���o����\�E,����&�J�C���X��F>ZYiģg�S<���:p�`��~��8[0ei���` Rz���~����*&�,;5P�A��Ɩ��B/����V�I�������@qȩu�<��ʝF��5�;�J\k�:ug��B˪��M!Wa�����gӛ�#��fiԵ� �`We�]M�fq�40��2�0T��]��شᜠ܈�O
b|�EM"���}����Y��8Ǘ����|��]�BO$=��s�5��h�ޡ�/W`q7FOw�&��nW-�r�\�e����`�|����i�4����,Ii,�%�;�T�y����KKC�~҄ODUp-b���B���.�7�ڐ&F2x�X,�(��B�����i̦���cú*ʗ�y�с�t��	�%����@9�ʉ��e�&��1>������I�*Y2a��^�l�\r'��]i.���z�w����Q}ъt��t���G���+���u/5$e��d��.�h��2�K�AYWe����,���z������eL��nQV5�'*����z�e�I)��n�aU�2_��|�n4�،��-��W������\���U�^Vh�� �����;���h>�x�rɾ;��Sv_�Z���~޲)��-�3oդ����]EM}�)�djL�ґ��F�JȱSK�@z�i���Ī�F�۾�mS
����xm7�փp���[U_��b
 3��3�~����kAЙ��`���ϳ��]LT��n����]M ����e��1KϜ�Tᳶ\6�c��*p�	�*�aq�����d�V\2�c��,ւ��{M�@��F�0����Xn��F�_��sa �����>m;�BVi�6����>�J��8��
���s^���>uY71jiƜ#�8�,YC�
"X��ww���4���x0�<"?Ӿ��v�}cv��a^��`3�eWv�*!� �h�	�t-{KF�,��L)1a�oz��m��<v�������� ���DX���/�ad�'|�2%+[c�F��*�we|�����8��Lv��a���f3њ�v`�*BZ�!�1�i"���Qg���DT�5��,M�R�Ia{�	ܐU֬L�xEν$r��Yɜ�μ"t�k7%e���$uJ���"t6(K� �{����B��P�SM��7d��&[�mv�%�`�*��JMM�ӀR�e��0e�w��ݔ`«di�h�<�E�m^)�JmX��v���������2�n��96��
t�8D#�z����ai��#,�d�Pha��}�!<c8�8b�l6c�"�����l1��;qw(�!���|��4<��z�;d٤GH�/�z��b
Y�磥����p:1oL�R���@JJ��<y:C��v�x�����l0�l���ܚ{	sn�CMPȄaJ�kUܫG����EM�Ģ{�vu+BN�_լxkV�vg��U(��J/��ζ�u/y�O(�S.�i�b}%��459�Z������B����rL��ny߄ܯ*����y`E.84���Eڝ�����ᇫjf�����]sEK�(S�'H�U5�J��9�$w��y���*�/%�6�c����߅���o�����*�	%[Q����#�Y"�Ԡz��1�l|�Y܀�>�,8�����f�P�1��:�X�C%	E�r�
1�x�Mg|�l���	)��
�zӞM�ϡ虊�Uʠ���\[P=��K	���+�����^�ї�KDMmA��X�+!h�$�R1�WH$^v�^C��
j�����]�exM������3��`=cMA��z^��lU_�n��|��VS`����N
ԗcf0������Y��Fϓ��2V,���
'm����'\R�',�D%*/�'����vI>�$Nh����� �^���ҧ(G��P�U�;&9K�]2?�ė*�E�VEU,c����
֬f�R���_���zK��?c��5�ȉ�`�G*�Ω�*:`i��'����3'A�w ��Q���'����Z����H�w��PZ�����B��oa�+���a�<(�Wt#D�0�ӣ/�����a�|�{��{�/���}�J�m�Ӟ`X
�S�ٖ	ȫx��
��U�s'"E�%��sQ(R�%�c� �HO�V���
<����`i*�@M�P]�g�ز-�?i�;��&B�����Z\���V�M�u�!��q��ā���8o�Ѷ�ΆM��a�3��ðQ^�u�/1[w�n����[�s��|�R������a�l�};�w�����˗?���Y
d@��qp��=Dwo#�΃����?JK#�)��m�Ih��l�Q=�C�g:wGd�����BϹ�[�
�.�aN��tr*Sm5Vs9�K�ʹ�'zA�M֚IF�#�ԙ�r�+nbu��O���O���/���s�EeM}5�<��:��{4�������7ؼ�1�o���Z�yu7��:��*}9�7/lO��V#�S̟����-La�����ь3$���i��kh�9E�F[�$T�B�د$̤�"�5_k:=o
%��i񼓎���8���Z�y}6��%��*��
�73�+L,V�%��_�5��W�K�Jۧܘ��[xL<��;���3y 6��7亩\��2 �J�.i5�%��Q�^��)L�#�?d̽��U��b�yy��1��qۿBЬOlY��u����(o|g������6BV���E�TGH9��t��T��)��T��[jTp��ߒkR�O��n0��N��b�3�ڷG_aM�/X��/����kB���-X�	�I�q:�r�R�&��N�\�Ϙ��X %
eb��FNd7d�v���#���~��A�������B��?�9c��B���RH f��	��Ͽ��ֲJ��q����He z-h��a,���G_�~?�!�\ry�ف�L0�rF_�y�����9��)�je<��z%��
��טr�C��.���+Iw$���'S�R����Ǻ��G�������j,,K�+6<ɡ�2�I8eh�*O�S�&?���30�$��)� )��VOST�aY�l�r�+�~�刽e�T<׶ת�����B���!o�for�����9Ceۀ� D�0��V�Сǌh�Ыo���Vn�T��}�$�a�!*!�������}ߋ��:�|�̔����S��)��Vy�����<9T��������n@�8�Ƕ�*Ǣ,��1p|�� �s��2�i�G�T����g�[���&�?\_uk�C����R����}�J�)T3�,IƦT��l�=�)^�'bN" �9��D$;)���JH2
I�[�+1I+&����>���@��*�8OOH2���z%&�`�$^\����^Q��p�	K����E��J`����z��D0X��>1�I�'6�啞��Bxzad +����ӈ5Iܺ��t)���#�%�j5!&>���[ÝXr������L�,L��;�/�o�zUq��
�+Q���7ѯr��Z�%ԝ��ciJ�RƱ�5m�tr�H>j���ɜA�^��c�.^d¢?oa��܍���_Q_���4���;�wɳ�!T����'���Y�=Z_З��
��j]�X&d�R�\VBf�SA2˻��JY�KӰBcM�ݠ �_9�u��M�#e���<��u��؊��}D	\�3-�
{��>���=��=r��^ b�`�Y���{v��}|����_o�Qw5p�N�cV�� �v_����e��J�����H��3�.��rcP�=���=GD/��H^ބC�XʅD�=���-����Bo.EJ��-6�sK� �<��~�H��!e߂#|�!=�Z��N��'�|���2I�(��R+�r���ٔq~L�������X2�*|�2�$ͪ��e)&� �f딘��˟z���c�ƚ�w��2�����8x7���n��I�f4n���#w5�n����N����̬:J�#1�"�X��y��ӓ��������]�88����E��?8�G�]f�3�oS� �B#��9�8��h���+M�l�JԀ�
�ԝ�6LŚ0��`�j��k�X�|�V�E�o��.��(R��+��e̸:��1����9p�<3\)[���z�����Ԫ7ژ�L4�=�,$�e��r�@ET48,�� �$�C	F�W�7��"Y��k�Қj�����S6T̷�^@v{A�����   ���}msǑ�_i!���-^H�^a
�6o%����i`c��is��� C�0%�����n��E\(V-)�EK�$������	W�U�]�o�U=�$�a3�]]]U��/OfVn��'�UE��@Αr�+��&�gM�~���Z�^�A)�9yy}I�I]3����N�r��j����\m�_�rG
{��ZB�Ӡ�.Wzzx�?_<��Ur�̟nW��j���xt-)q�e�����;���Ӓ��k���G��ͧ�n��o�Q���>�i�~�X�!�H��,@p��ǝ<�]Ƃzj���ԩE�K2n�,�i���W��g)jG�V[�ܔӹ���l;���i��x��T��:/8����W��b�?�+��M��_�G�,�2�)�釹z��3��e"��T�6u���v0S��9��n�&t���Ϙ����2w�X�����k�1�˻����t�X|i���$w�a���N��V5��[*��@����ާǘ�PO�Q{�Ϛ���!���Su��L�XǢ�!WPs������5��;k��0/�h;�e��]?�����$��Z�Ń�
����SvqCrBD���'G�Lc�!:�uJ�,K�gh��2�Qby��;݄v$�S��I�s6�
�7�`��P}��|K.WfT鳋�`�&�N�	�u"	�L�C@8���/��Y��ϱ������~��A�b�$�d ��@f�mv�?C����&��wXC)�~�?�;�;��N�O��V�-6} _v^�o��.U�k�����
��[g#r^���Xv9X������S*w���]���{1w�Ô�}�m��� fy���A���8񓸲'�J���I�U�%����E
_��u|���7�/5�3j~�y�ͭ0r������ȅ)7�e
#����t��BZ�i�%.�fJ��w`(��6�˚ؑ�Yk{���r��4[o�����
/.w�<r�����9�l3�|;�Λn[�}�_׏��GxJ���

T�����Ҵ85�bm/��A�;K���H�Kxy��I�P��yhM!f����j�1��R������ƌ,�*�巂kQ��wˊ�T��k������:D���:g%̅e4��P�Ø�jr�xQ0`�\��!S��$P��y7X��3�c]�Kqi妫�n���Z��g^��(�s�<�5Tn��xxp���Js���JJ+��U�N��.�`�oFco����L���7�`d6c$�V>�W$k��KՖ
WVEA��J,2����I�z�!mgn*�)�(�}<����̌���P�U,���"�Ӈ��2fr��U'��P��	n.��ȳ���4L��Z(s���ZS+��o���K
��[��}�
f��o�)y�N
�T�&��,���{nnG!S�� �3tW��+�M�44��+L�ʽ��s�l�+�^6 �&�Mn�zg4�Q�ؙiT7*��wl�U�V��ʲ��s�w�8֕��{�W����V�ז�	.�K,������9�6�󿇪���������\�a�^��r��(�զה�3�^g��Ʀ���gj
����L\]�1�Y�8�؛V3N�܄��z��S��8m7,����u�N���˭e��Eks%	#�Z7������b�s/�4�Fd��I�t��$��e�ja\К ���C�()���e� ��PfZ��p��֟���fEΖ=Ӏ��Lj�m:R�"�Q�/;�	��䃓�7e�V�6�H�f,wޛ���;�Ҷ��g(dQ�>gM$�ք�'xؗ'��3cI�ָ��=��-�բ�B��LeFe���C���K!!�q"̄f
���Jcj�:�.�x�B�?����B{y"K/��[��_^�P#͉]��Ga'��M�K�얎�>6'oV0p��Ar�B���8ݘ�ӹ.0���g��	b.k�
�j+�dF~�����&�@���9���`D I�}O���C�
leZ��@J)�>$��<a��mM(�g�g���ro����e�Pl���Ť3���r��Ĺa#��DI�<�vҎw:� ��]�ՍϤ�D��)R��#H�̐�͞W�=v���N�%���c����U�|��eC�&(�f�ީ����4)1�H��������s����N�3�>��+�.6����{=�ٴ�ǚ ,�e����S:� �j6��F�ǽC��r8���Z�����`E���?��W�*��]x'm��I������=WP�D1������6&z��������9+{ӏ���W�J���ǘ���$2+��+��jo0��	��`����1i��c}��q��\��(r4>~���h�iX�zox�A�l��yjj�4i:��R��>�Os��%=)=2d�����U�Ǹlr����Mn^�(�����.Y��ʆ/knQe�v���*R�o���ď�V�Ɖ��rkv���^���E�Re$�7�`4I7�y[��$&Z��֟oB�
��H��Z'$XڦG�t����p�~"�Cܞ�;�������`�K��t�� �toE8y���3�f3�vitD�ʉ�4a,
XK�\J'e�������:�˝�CPմx�:d{}�9H���	��zJN��	�(k��E`�y�xF93�u6�P�璺�wt�?N(����."�
� ��w} >�
F�ع�J7�C�@& '�t2ܞ|Wn�u�6�x��>A�#;L��� �2�3�8�ۓ���T
a�I3��:�ƈ
.%�����)6жt�?����P�JT������&]Rc2wm�sP��*�HK��L��c����b��у.�Ȣ��B@�(��X8:��j3�mF_�R�ќR+�\��
+lvu.\���y��W�-�m�̅�e^
�
��l
�P�(�m>���8
n��|�G�ԥ�3�	di��ּa������;;Q�z�@!�����6�r��{5}~�=�5���Sz7�;Q8���D���"�W�_a�UK���'���|bEG�GbO�w�_���f��ߎ_��c�����$���\�+��(��f��խ��=鰡ԗF�4`icY����z�����	�@D4�t�TP�#�9ж��2��U/��;�~�pS�,�>��Y9��LUk���j*�|�͋5H�>+��)����7�ݮ5cfl������utLWQ4N�.4�M��%e��+��R�g�=�

*(����f�iӆ�rCb���#g�8O���?�Q@�*;;C^:`#� �7������"Ն�x3)���wL�w+�'���W���ka2���q�� 7}�n�OU'�xmn��䒮���yRGs���¢6�{����4��si-N�C������;��]�Y��_����s���L�0y\qD�?�A�f��/�a+5����ǡ��_`��f�bB��V�%��:�;�ȯr�r�6ǘ[(5\�F6]�[�{�=r����ɧ����?���ۦp\`G����őU9�!2�r ؅�uzA����&eZ�d�����î�zs|}�B�[�A]";��N�v>���%޽�A�?�bku��[n�gJ�Dx~/�>�lת:C^�㦓7�1<H����;�R�k����6���,����	Ml#'��d#`�vYx)�YHU�:����#�5M��L��)3Y^��ĝbI�ٲ�h�B�݂�0�u������1��!e� �ͬ@�Sy�<��U������L�oВ��^�g�nX��I-�_���R�Pjn��i
��XS�	�`��^K��F��kTz#;����F��Q9{�G�܃��$��y-Ű�=Y��1O�tsw�=�YV����iV�H�s��hb�ZX���u���ܜQX#�	D�����yIL`I�,3;VY�M������1�-�}�D���!K�r�-����0O
n2�ݐI�Qb<N	I�m�e�I�%x�'@����[�ǧ� �)�/�jK�
g����c�OK�ׁ�<��� ����-��+�W�t_�1�l?���G�j����..:w���V��}h�;� �BG���������G��;c?��K�$�i�L������
/JQ��}��Y��jj13h?1�h���U)e|x�dE)�=��2��<X+�Nh"���i���������G}����O���z�n��>�U%�f��u"N7�i�s)E|y<~��K��`x~���� ��	�K<)ύf�cz+gM��ˢʛ0��[��پX�!D%�v�}h�l
E)�,�XvR��W���D�g���3�;��-n4��(Hv��	9j���sFR���і���6~���qm9E��'f�(^-�SRX�f/�(=�l�)�z�8����mfp���JY��ـoKmf�V%�/���p��p(�&C��M��N�"�_�(�f�'��=Qd��q2�̙l���QbG8	o�'��%n�u����B�6�%�E�F��Oq��� l� �Fz�ٮ���x�ڑ�]h�@������C B���Ǔ#�g;��e�ˇ}Dל�+�UY����4�}f|s��$�mo���W�����*���o�^�/�~��Z��`x�*9Y�f��-����g�<�)�x�$<t�a'�[����I]���.t��Ɂsl�z�N�^)��k��/^;j~���0���L,�����Ffo�Iol��噜���+�''��W���S�������0P;�/onjS��MR����U%]�p��XX4�%����7I��\����fy���{���'����rn1�5�{X����WU:l400�B!�/dl�x�F��^~�>B����3��K�]�=b��r.�u�̏܏TE�������V�T���?�8fy!-�1�������Yj�.m=�]w��AMY
�	�� l!��α����T\�M�bB`�
��O��Է֎�_��G�n �����KH{e�Oc~g󈻳�rm�g�8G�ֵ�S�k���l⶘�8�Ԁ�B���v����V�r8��p`Ӑ�0<�<��iջ���/��:�N]f�]c閧�\=����
����fҾ�I3�>��&7�"c�x��:S�k�l:.$�l��u�~p%���]��h��/lru��Ok�,&D�lps2m�Bb13�es;���P��|ʚFǞe���E�Y4�M�H����G�Q��m��/��-n��{�p�ovF�psi�=#_J���;Llv�?����aW3)��ҏ�v�q�.��~1����3���7�6�>(�~�b&�G� /�^���L���?�Y� ���v%\��V��A�%"n��翰W�k���T�4�#EDO!z|
�h�`y����c�y�Ae����Tݣ'A�u�P�K>��|J�H=��`�$�=�Ѥ�^s�#�S�($:\�e�jF�ҼVf��ZR��Z汣Y[xrC�u�(O�|B�S�g|�𳌦'�G��U��À��<ci����Ͷ�	�V4,mq��jrbj��0M�tF�ka4�����
#���m-ȳA @�[7�A��r`�����~�yyzi� �NC9�2��1�AK ����+��l\��#BWoX
B��dW^9�1��K�/_=�/���MmZ��J��	����*��h�z���8e����0�������Y��F�9�>�-s�jݬ�ka|�E:|rr��}���n�SU��7̜*5S�����W
cYE 0�]g��G��6[�h��E
���ap�9|NN%�Z3�[iECGw���~���sCxB:e�ʏd,6Db7uN����:����<;�N/�b���	��L�!�H����̰�.,��=k����I~�M����]�zY |fw�]~"�*^qܛ������5 z�)��@-�l�������|�����l��.r����~�<�ՂR�-H���6�cܿE�Ι*��˥L�-���xz�ʵ� JP�� @E��x�V�]-���~�ė��|
�0F���X������\�������E�cn�<3%�뭏�]�+�Z���0��{� 
�|����4���(�\�A�k�E"�č�%��&܌�����{ś��^"N��h%/�?�L�!���E�9d�rA�/�����	k�)k��e>�.��ы8��8&	:v�]?	6Sӯy㪴},3y�X=ATRT-�j(�9:K�[�H+�C�Ǟ7Ǘ�9�d�4��r�f�#���:�E�,�kw�}:6�~'9b�Ι̧c��A���;q^�[�
�]H�	aL6�I��ƌC��|�����1�Y6oZ-tɬFLtʘ��0uL�{p��FVR{���XV=��R�%`�ޤ6����;��
e9��"����&c<����s�Dp�� ����t	�P�hR�����y*����򊖻!���q�m�l'�G�2a �K
H���CQ{�T-�X�{�wj��z��� �a �b[��@Fe��Rwq���f�@��,
����L�M��i�	t�2�9x� �U`�������4�I�� r=��]���ه)G�!.p�{��6G���C��0�,�y=D���f�P��(�<���@KH�uN��f��P�~��L�Nh����!��W�c�������������mD%��$<K`yiw�ʮ�ɣ��e
�B�M�IP[�����&�k��Ee��R��� ��c�X�7T>��	��j6)㾿DW�(���Ɂ�{<����-^�)Ed��ӑ���q����%c
y2l'Ԇ
���/$W���D�F��m7�#�-��V�b�4��8�X�;,��*�Q ՗����`?��&��J��
��0�u�~��b�[�KF(a��.{k^��zY�A�R��l����>�Ѿ�S��/��:��6{�+LYs�Lވ��jԁl�A Y��T$!�v\+;�k��V۬5����[2k.Se9�5ۉ����b5
��
�i��Rv�bs&Ulxbٲ�������o-	�>{t� �@	6"?֭��(:M
��M*J�Ry{�
*�n��n��+L�%���d ӽ�_!��"H�;[�:�d3tQ����L��:���ja7��^?��W�����Z��c��X���K��?�e���0�&��2q�Ќ	��=6�#!F��5;��Izˆ��"zO:�>��F�XdM�-��߂W#g�ȚS
�x�m�񶧦=x"kT��ʹ��fQN�Jx�����
��,0ۅda�Y�b��Y*��/L�Z�������k,��L	�!!(d#ڙ��� <іT�tW�uX�d���V�*lv!o�d��1�&�Fd�Nj#o�sM<�Rw����d(Y����V	.���:��Xղ5Q�yk����@]�M�Ցr���*����)�Ӱk囷)�.xkh����1�o��c ���"ns^���`k��x��ʤ�9�+�mb(�I1��T Fw�s�a��6��g���!� _4SE�+��R �.Zr�93j0]ed��ߎc�l#A�l�P�i,��+���,p���z���K*&��UP���!�>�L7�����bj5��rk6�YJ7evN[�i(�W�����$�<O�fr[��!9�4�w�ཥǳ�G����� �e�؜1lWڢo�T|����$`Ca$9�������vb�U�;L��O��i�7�`��}f��v��5�v��$�AA��eh��v��ޚ�[g�|�	LD\4�A!�N$���d�� ^��κ���y=Dʝ3�dxU�2�GaN,�s&�[��|	yD�N@�O��LV߳��\_a=�;�7�8Qe�
�I,/-�C�T:��`��H=V`�
W��,L� >*�Rb�-�K�&��􌺠h6,V��d-�sӂ���T �u�5�����,
���`վ@G~w ��^���Mb�="W`ry�����}WX���!-��g�Ϙ'[v��v �n�~����fczhZ�-�M+p�Z�@z���n7& �8��i�u���+ �QI���nJ�����$�-6����^>'(1��A+��[\�(�x ���p� ��v2|qi�`���5�@��r_�3���U�>�U$���^�������;y��<=,��Fp#详oЇ�S[�����1���;~x�*$�`�"�[ �T�)S��[��*r1����(�U�.�;=~+��j ��e��S��!���셈Zr�:��V�����X����M~2Y���<���Ӥ;�y���N���?G�^)���fe�?j��eM*=B�����7�.8��:��v��s��
^��rfC�:��~~������P�頟�Y|r��6��P�]����%pߎ vRq��y��">��e�����rc�7�ǧ\K~���kZ��2�!�E�m/�|��kc'?)�6}�"
@r=)�D�����S��1�WM~h;}�z��������z��*Kż�B�k&0pb���@
��\V��xu��?�f�p��Z'�=pĉ�V�8���iT���ۤ,
��
v>���Sm���LC����c����׬)���1��s��k.����N>?x�k�9���y�m�*��M8t1�����5%P"��Ň/(tH�3��,�(���X��M^�$a.;���*��ʣ�*_.��(Y.�D�]�OR�nSRn�R���
�R�e 1�ʱ찻�GY�j��2w.Q�)�!qv'��Lj�6M�[��/@:_���F8��������me���CU��u��|�z	��q��ȥ\�Ԗ,���H��?�}ѯZ�c�����Z�w���S���?�X{���uy%��� ���d� `q	A�H�L�Z{����^�"�Ih�
J$b5�<�L*G�@��^�Lq�
[$+���p��̠�e�~0��eXe��ޢ�x�|p�ǌU=����L�
i�1юh� �z�,!���+}H�w%E �1Q�#�Z�]�� |q��Āyr���B݌5������y�*'�Z���1x��z�|Q�N�8��3scmR�c~��ŝ_{J����A f'40Eu/�\IҚ��i����f�"-���RN����Y��eE[�H�Zr�+5�Ҳ�G�^��Sq�?��F
�׌�A����
LV
���6�|J��N�e�ח2y?���_
�2��A�ҲЍ��$�0]?va���F�R�$����Uz~Y��uaR�;��R���<�)1\KN�)V��׮��2��0'bH_n��V!΂����.Gȗ�L9q�d���ˈ���AQ$<�_q���,g��|��#���_O>���w[֪�����#��� ������9\"��`��ϼ���]�g��z��YuJ�+t樽�V�D���i��cݜpn�>�э��RB�j%��8
��f7�a��cDL��}v�S��<B�Ҋ��a_<a��a[uL�-�=Ĉ>e�#D1�l�90�7L�|bG��%�24RDj�����$���gȥH)u�i:�(G���ZȞ�|,�l,�Vh�	�h��Л�QS,��L:b����9^K�R�\��w�X�����X�p��ڀ$���{�D*;�;�-)QɌj�<��,�z�)s�9���9/�������S^<���?���tN�<M�=�|	c��̎<,�+{�g��^�-�Og�c�ޙm{NbM��#�F���7z������;.��Z��/ y
��P��csZ�6"E{W��E;)�;�P0|�;��2�*����uT��aД��"HF�/�	˂�,�K�TD�a��u	�`���t_�c�0+\�l�5T����")������P������v.��E9�Q'tS�^T�9�w�0�*p�cF;P�Қv6Bj*�f��9���6-�q���bդ���XT��Q�I;m�A�[�����ks �� �r�t������l�BK���
�,��'���Z��SPM$&���?E֫T�/e읝(E�Q���
�<z	�	#@K� +�B��S3�~�ܝ<�è����'�Fr��x�-�x�����
c��Ja��� ���뽒ڼ�O`�3ve^�����{ÎGwA2VpIf+�ءHqx%����
�f�1���=o�xnkJ)�aI[~�C�����`�D魩C"�7���Ex�b,n��[�nf��/�p��O>���zÝ�V��{��ߡ�?DV)�L���'.��`���j~�Tμ�q*��������un2X�Ϲ�x%�	�؟�
o�$��S�n�wV�>~�����>�C>:x��������=�i���#/���)��*1�}2�4�v���4�ƛ]q�[�bf�A5b�M@�n/d�HK�sn�v���wCjF�l�X���.�Z����SH�.wJa0���A�R��m$\!e��y����lQچ#賩���=��|@�+H���=��Sx9b�|��?�*�k�$����mRP��	v�r�Ft؆�&�����+�q\"S7��d�u��l��� �ǨĤ#%��>J��K�|
����%�%.SEA<f���w�0�I�ג"���-1�ި��˿��A��^�w��	�t8E�@���s<_o_��.�>Q��x#���b*ݪ�_���W�8��ᵽ}�	臫^�*ҷ#��*���D}~�o#��u��ߜY�,���9�}<�DQ�T�u
�̚[g��B�-╷�<!%ߔr%)��Z�n�s?:���j���x���������������B�@��N�� �.�C�C��������)�N��n� �	��qtoA
�2�N��xj?晠���/���Q-՗���ͪ��L���JhXU�z�*����_a��0�߉��6��:�6�ռ�1ɡ��ZA�'&�0/@yq\����s,M��99�:��w-��>��@�$��1_�9*������4�A��w�Y{N��F����h�w�ݓ��3%��h7�΁�w�\7��6E{0a��вL��""fW��wҮ��йH=������'S �\��J����z�{����!��~�h�/���4gN���"�uo#$N���{gl*P�K���n�n���wf&�ze▥k[D��U쪣���9��E�pm.����S�"�\c�Zo}�2<]��$�O5�j?�WH�DJ(����%��5�␡�&(��O���NB̛�*rY�d�\��1��ho�]8���2��9�ҕ����y����MMxy�e���*�.ѹb<i'v�h���eeB�6�u^��~Ǫn}
�T������cmԆ��Z�m��W�L��)nY���7>�$���9gL>#+�-_P�V:�Z�S���xޖ�y��يs�5��o/��>�"������5μ�-;@\��6�Y��h)�f���Ux.v�;5�[���j0�kF��i{]G��ӵ �|-��~$���.�d1oX��u�u�C��%�������T�������{g��{�;@� ����:�����h�w��
J3R0���Ͻ�1�6{r�!��L)���?��7�x2DӴ�b�y�	�!;�E5�����>�Uz�Ȭ���dK�>�8�d�����
��Zs~�p�s��Ь�[��-�	���Þb!�̵j�!��d0��Mw�g�7ډV����n�R�
�
�!c�
��uX��r\��z|������R��n�+q&F���Ң��҂�?B>50k��O�<�fӱ�l��:R�Ufo����k���mջ��LB~'6i��y ���c9��"����V�2�9c���e�A�� w����,������>[�"����K�FW�Ҏ_�Z('�n�U��?Ŕ`` �jG��4<gW	_��;�m�Y�F��WKt,4z����Jfx�N����ٚ`d�.`Ya��3��_-�ptOe:��l��N�g� j�_th)B���o\ܸ�4�V5aysX	
]�'
h
�mBSJ�r6�F�&�Iesh3��5[a�Р�Fkg�C�j:-�k�T�ų�p���6��P�!'e�#%��V	L^N^Iٸw����D0�G�.f8� �I���TV��F�ǽ�o��1Ǯ����K�T9Z	XRa�Ҝ���K�t���V����hǔ�<�*,
9�����0*~B��I$ŶI[��uy��#)EVZ�A�۲�^��i��A���%S� �B���{�U���ui����4��!(�������ɷX>
� �)�Q&��T-ŹX�yD�A%",Y$Ә�D�g2��~��IV��ĸ��>K�Dm<��}���vg�J2��0^C�_�j��se��(���-D�Ҿ�)4�(�f�
֐^�7SP���?����&�����SI�h~��iFզ���r>f*�,2u���z��x�ȏPؕ&�$�ڟk~��	�vnC�8���'�A�G���o��J�����Jixm?��j���]��V]��6��;}� ^�W?U�$��n�}Qu_�s}�w� �_��B��j��F���o�{(0����&�lvz~R�X�����5o�C;�*��B���>�������a�.n�>VN	y+_~�+ռy�`P@�
���[��
ƣ(�k�z���OҔw}M��N��.�^�]�3�����$#0QJ䔩>�����v/�v�� ���e�s=n/첷��q恟�V8�����p��$23�B���咿���Wsܠ��M Y��aħ�Z,��
[X�V(�O�e���*o6�h���?��1�$�I�5���3y�»i��.L�IN!c��D�%^�7\��X��WWؽ�>�;�<�����@�����HTn�i���!L�ZD�����2�ީ�2d؛�F�	��e�2��w�('(�
2�KB�T�z
TA2:_Dy-����� ��F�T-�F��E�~��kA�x$#b��~b˙�
���	 èK�ͩ���P#�����4������1��h6�l�A	'�qo�
�|��Z��|���:�7y���+��x2�P���@˭ރ����3}�8�s���hx��st~�����0+{����TM�7��ԉ���J�G��%l*��`_�<je�D�|����_�7;A���_�
� �c�m+�jm2':����[�d�	%�Q�JEm�]�YWѡ*>������~���ɼ��x�&�u7�l��P�pҜ=YsA��8y�&>� �)��~�D��g���Hm
|Hj�<C���8
nX��
n��,�V�`�"�(�+kkM��7�,��m.A[l���r\��KЖ��������S�OK��%*W��;�É��L�#J�����XE�1���1�M�#�'��	��G�������#���0����=M�Z�gQE6k�x��7����t��)��N��
#p�.�*2Y�,;�euuYE�,b�>�BдzNhL`U�\(ɫ��[Q@������v�re���5 C1�
��m��)h
b�0�M���IZ�v;�7�d�Yk&ɦ�,2@wQ�5��?�Rw���5� �QŭC��r��&���J�C�ә��05-�q�"
�׭~�e
w��|R�>��wh�֧��QMA���V�W5[��rRbk�N���#���z��5�F3�ȹ�H�	1:�j��:��æ���l�{/R	�)��˞���P���>�Ia��ɍ�&Wq��M{	�����F'UX�ܥ��|�ӏA�N��1�4�2� ҙ�Y挰q�7�/��������vS1\ހ�D�N���#�+����5	�xk�_����V��ϛ�p� �2%�(1�BsY��eGB�>=a�j{B4���fCG��/��k�L�kM.D����R��N������+~���Q�{�e�9�8�{ ��f!o�F�����`���5�"�Vs������ʜ� {�f�;[����}?	o��)��T����QbT �e�G�BW<=�dq�����ʛ����q�L����'��=T
�Ts$���@��z���ޓ�9��>��|D0D
��C@�h�ڤ]���-�&I�!�)ZXfRT���l�-q����x`�bU@�3��Y�7ͅ/�ʵ[��]�gp���
r�H���XB<Xſ��v��A�p��Ҹ��]"�ﳎP��w8�ރ��p�e=��p1��	��� �*�0�6��Q"��\e�,�&�5�"S���o�� "����T2?!�.էAX�Zc��9�=Yl~�D��Nm��a�+��8�w�6�m2�S�P�:�cO?Z�"��м�Sy���0��!�؛Mm�9k��*�Ҏ(�xЁ�/��q��"��?�[SC� ���y4FD_�9�įD����~l)�2���E�`�r�8�W���8a�Eчi*|-���z*TÓ�B��}k��n��2�/tQQ�������n8t�8��M��ƐC�60�r��	�vi�:%K��GB�;���C~!Wc���������T�;�eH��m���0�%.��d���g���v��s��lXl���;L¾��X�5��~�����h�5?oB;�r
�!���r�,.�U~9v����(����L�X��X����4M"��
����hx�����}�Lt�����������b�ת�m��vv=�eb��Aw5��������>'Ѡ{�(B$ƞ� ���+��éM�E̕��ϕ��g>�|�σ��l�"\�M45|����$�n�G�l��oڎ�a'h-�ʙ�?�q���ݘ��L�<��X��@a����   ���}ksǕ���#�n��d�!�Rd�Z�r�X�]W�*jI� <��V��Xv��w�n��V�'Ql�^ˊb�Y���_���	��~�t�t�t��d��"	L����y?LML�@��j����o;Ǭ
��
K��-iT����B%)½D�o��1",3��E�2��Awjs������Σi���G���l\L���O��V7��ـ����<�H!k�)��֋R���z;����MԺ�����0� �R6Jc�Vv��կ��b�=�r��+N�BX"�Kc��1�\�j���l�'��,+�͡���K�.�����y�Һ`��겗b��Y�X��Ɓ9�+?gH
�%�U\���2}�a`�+��޹z���W�G����\2(��Ȕ�	j�]�YN��Q���*@�����oG{��*U�J�����4?�b���:Vn�� J��!�j��[w�!��X���W
,��T�\�������¤�b+q���a��n����.��MΉ�_��W��c�u��B��A�%��ad��K.�##�i��
�c��x�q����������:�ef^ ܚ��<���=���_��k?�L�p/9��旚3���cY�b�:n`,)�
���d �&��ȡ"u�p�/F_a) R��رTٴ~�:)`x�A�9�=����!_���q�E���	(�Dt*���{�.�7��� ] ;���a�-�ʸ�|�A|d��q������
<��&�/	Zo�~��[wv�!Dp�>b�ov���{�5��y���q�Muuh��*�Ƃ�Dי-��L��jo��3��ΈE���G������Lj�h�?�@#F�<#b
"�/I�G���Z��X���Ŝh����I"/.!��Jx�|�Q��
.d%c�X� ��^pB�e�]�k����ܼ嘢�jv��9z0 ���+�v�/�;W9&��qO�s��[��l�����v޹Z*%�e�R��ב�S�3��KW�e�#U\���I�6��~���?֩_�&��>�%ܙ�Fg/��j�ۇ)�Q\�
䕛I�|'&m_�ݣ0Xic���yM�����l�q7��REl���C�.�9�P<�d\~s��=�q��a���؍���J����<��qN�;�n�%ꃏ��x���J�΂ �?|���2���{h�-k��"���hj}��r}]��CH�.�5s}�더�q�a�T�#[ �G�W}��`���[��.|�!<�Zw�2�Z�����[��c�����Ȭp��N��f���0f�θ�2�5- �܎��7P ŭm����Rx��Y}zeSu{px��xZ�
�m*|��𑶩�1�;���S��0�����ٳ#�p?.9����9zĴ�Sq$�1�M'AA/�#E�W�%�$�L^I��ȅ�@��UO����#F��-D�㜀�B�Tp�nS���M��M�1��\	"���
�����":��Sx(���CF`C&9��b�G�L�B�݅����T����(�mc�8����	G'A��#��q9ۅ4m��C�/��v�q����2�$����U�M�U���e��4_@R�IA����a��`��C���;�� �Sy�x�]��˾	dLeU�6�U�TVM�TV�υ�J����2==;�k�*L)�� ����^n;��	�]/���v�u^?�0� n~Ak`݃'(���0�;&�Js"'���>��Y���;�eʕr�6I����
���U�(;���SFJ��\�I�<&�ˏ�)bi���`�(R�.�3�au'��N�͝$�;&�+3�l^���q8̉��.K�%9��s~��;�yDFb?�C��f0��j^�
�?�A����t������ê�j��Ecf�2�uI���h?�)��S�5#k�̅��C�
M��Vh�+R�+�&_��M5�冘j4��T�)��Fs��q~GE$�4V���4M^��VM:���=��Țڗ z�u�����g�[�7G���*���*�gY;SmS-�u�j
m�4����0!Hώ��h���p]��q���-���ԟ�J�q���@��N0U�	�vM�v]��灰�)�sO���"�}+*~��z�z��[�r=]�}��P?׍v[g4�|� �$W%S�2yh����VWe�������Yi>`�zr�H]�2����?j��Nfq&�ܟҐ��$qů�CߟI��Y5:�����u�`������rE�3޲a�g_�.w�� ���{���]�oy/��������n`��^���^�vָ������r��I�m-;t�������=��`Z���k�'YI�U}���# �'Ƞ2�Hӝ�aq����@���é�87�]�_�v��na���e�=���1�H���?ܭm�o 8� q�- %�]��d�u�E7�V��'�
��k� z@���wB�E��Yц ۑ8f$;jI�.��&_N�� ��b~A��n���?oǃ��^�V0�	���S���Ns�G�wg�h��g���|Wf�'�/mw���*��b���;�%�6�D�&�n�Q�;=,<�( ��;G� [>.dnR���A�9Z9�X���s^�3�

�� �̛�
���C vt��븿/��0�+�(�2lKg3v��x�	�8��`k��XVJ�K{�i��;o����FO1����,��2��P���VGp��;�- Q��tB~6I����e_���;�̩b���r�4���w�����՛�=6�h�ŀdq�,�.��1m@"�^^u�� ��'�*��u.{A}�G���N��m�}�KI�F����
��ժ���"�x7��v�̺�%��p{�i��Z/���0d�b�t����V�>�G�c��vk��2��
���=NU��,����f�J��;�X$��ǖ��yzNv�$��W q?E������v���F{}F�]� �����Eċk<�H�lY��D�(X�'B۲7z "��s}����j�9�,)J9D�0�Q���;��	G�ǜ'q�����M;m�;`��o6��`��Ƌ>��[g9���Y{�)�������
W�
Z��w��JQ�Õ�� ��^���"TKX��P����Z�k��eCD�C崍��ik���*
�����c/&� K���1͕>�q1~��[W(�r���L�ߊ��� ��=8�Z�kŶ�$��`>�q���lM�Y��MB�[�b�2��x+hItQRk����DQ{�SvaufYJ*�"z4�N��8-'��̗�H����-mn\f%����vw����QsU~�(c�;@U�F��v��Z8S�����$%����o�<ԛ9��y�4s[qL���˰.��<w�\����^����2׬�ĵ�rݷ��G����+������̑%��˫���]k5���l�tY�@��Z���U(ۯ�Վ�[�����c�`\"�=�$<��X̺c)'.�QAP�(x�d�?mI�����eN����x��O��Mm���r���>�ٍ^��j���مFj���w����tE����l�qF��fSF�uÏ��^��ei��������O�k�Ύk�<>;���v<a+᧣'H�y�3�u�����	J�C����߻�Pr�w��s��? U�ה'eҦ
o'���"�����}1�5�S��`
�|�li	�i�����4��g�����?S�a��/�Z���{J
��.��V�Y*���1�㽘��G"�+G>D.w�^H��.*�$ᾔ��E��K}�8,��k<I��ay���և��ce6�߭m��$���#�%M�k��F(:������Dq�8^~M��8��d\�ݦS�8C�ڑg&s(g�Qg�\@���E,�&w��rkr���.�YS�9�!ɍ򃯒���B�k,��Ja�s��4x)	�e1�"���9�f�	��ʹ���fC9��}�@�ޡ�a�I'[=V���(��0Z���4��J;�7�ř�'�6/R5; >eg���p�_ �Ae����7$
���9[�5�G$��%S�8�U;�3��7я��v��X�W�����~�K�P�"o,�(���G���_u�^̵T��MK܊��;�+���8���]��)t]���vԳ�ó��:�&q�궖��@���\VY�Ed����jg���v3�+��Ƴ�N�s
`�GX����Wfaƚf�K�`���:�'M��LWP�S;�`���QsK��#Rm���N��{4`����� ��DJ7v���$%� ���}�X������xL�b>��?�\�c��y^!��n�r���|�XZ�h0�T�%�E�U:/�#��Mm�UOwm������Z��%	��9����k�(�t�#(Sa����k��}{P�]�7��jvڀ��z�(
F��{e����L\�Ws�|��z�[Q��Hlp-�u	���#QK�#U��(����9q��t���w��%(��f�@�!ZqnA?#�����cn8��*p)�:���F��7����r�DxL�D}����)�p�=�H�bhj-�ڃx�l�(��;d�`�!.G9�C�qڊ_�� �eJh|9$	��G?*=Z�>�����J�D��8����Xo����V0F�F-s(O�t�#�BQ*�t��E�]�L~r�L��x�W�E�T�~{]D�Nd�c����naL��.��w��:�Ė�o�[�Ut�.ә���dK���R(\���o�3/���B�c �C@��F8HZ�HΫa�c�6�@��~9�v���9 u��!�w��xN:��*,�rzw22�<i��Y�g�
��ѐ���|~%� �~����,n%,�c�a�ܐ
���T�,��D�2�x˥��S�ni��o�Qᡱ0:M��ʢ�����p^c�K4���sU_�X�۹eaB�-�[ʹ���L��%7s�8+;Ɏ.G
"�;_�a;��r7��nm��s��8� [ט�h��-��ܴ�hU�!5����A+7gGx�Nh+6q�N�����ϣUT�s.�=_d�q�UwA.���Tg$n�]qE�W&�����@��@Q��=��&��j�A���M�UPn���;�ҦK^�X��ڭx�#��k��>K�x��dz)�_�ߎ:՛���,� vz��a+x��˗�n?�*�UQ�7?��
��ƴ���T5C�����������^����
`_�(~��k�&˜�q����n�Q�&��-���g�e��
��4�S�9����[F��r�a�E��2%R�Y��9���-({��7h:���Zv��>���rLOһ�+u��t�N��^Ms�1�Z�[c�*ݷ�Ij�5��do��{�����4ފڽ�5��vr�wG*��ܮʎY�&�y.Z�]��,����]����k[�!�^7BFW�A<�〹�x�0�{/[HsH�e��]zm��:%���H�M���:�J=WZ�:��l�(?*6��M�k7�
��1T��M@��YT~5��&Lg���]b�ج�o�������%S��&R���Y5D|��	 W�S/�h�ƭ�92�(E,KR�+��8�Q4)Vۣ�ri*G�|k(��|����wqS������R�H�G�c`q�<OP��;��,���c[b�}[���A��.�@Aq�9M�C�E�>�j�0�	?1��'����x��~w�k/�~x��eٟ���l�+d�m���3����C�]�ߓq�,�:��)�t3��䘞�c�H�w�S�	+���q�#���(��>�����F_z��.�w:$�m���6��0|9�X��Tmj0��:���+�d�Ϯ�vCd7��L�#��^�\��(��^3�n(����h����$��d���c�iO��>�S{
��ƹh.�J:me��p�~gu8���Bd� ƹJ��evۃ��D�x{7h%�@4 ��g�w�ي�>|�%�p�r=�����yh7Tn�P�	\�w�J��4 ��%lv��2�)�� ��8���~'�=��?��^�k6S:��yZ�0?��EE���"�<��߭�ԺL���+�Qҽ��hA=���p�������ٻ��|^�����b!����D2��L��=
8�7ǻ ]$��m���A߯6f�5O0O�d����x
���|�B��{��>�Ѩ�o�E=�2�����ԁ4���g=�x<k]�5�Q@�_ZOyB�&���FN>��D���8���zuǐ#*���0@0���,������
S{:zR1�͓�ߖK:�}��Ҙ}st�ߏ�y��հ�}4-�w�J]�)����Zi�ӗ:aTܠm5hN'�a�����E��Z�H�gD4���G�|b<
-��������5����I��/�7I&���>@��]�yK�Y�n�7וkQS�!M,��h�=�Ŝ�y�s��³�F�C)���v��aQ��Ɏ&|�R�#�k�;`.̂7���t>[ma�a����D?	z�.:����w�awu��j�N����\�+�!0ϦGtI;:{,���w`u(��{�0a�_h&6�^�,̦_��͜�ʔ�j�b�)I���a�rst
\-�J�ח|
�w"},�#B�g��_F��fȽiLC�Dx:Z�r��a�ô]Z��p�W��o�A ڨk��Qۯ�5t�֭��
�nb����?����Aξ�O�����ͭk���E����-!�ʢ��3�ʤ����;����FO�5�e�����׵�L�&ূn�ԅ<�Ɩ׭rND~	\��Z�� �㟑�IC�Ww1�,-��f�"� d��'�H��G����>�X�l�/��X�������_�Vj	Y!˺+^�hQ�Q�5��֛,�'F��<��d�c	QK����◶@6��=k0^�é�W~1��u<ޔ���氚��ˌ.��8؊8�̉4A���EK���K���5���Gz&5Aj�j�i-
��A�b|����Z�#]%晟�J1�Xn���	��NS�:�l
�
(�D�c��|JТ�������� T�n�O��G�#�����
�j��b6�P�`p�tۉ_N�ɺ��7h�
�laP ]�e"L�5���¼}ާ
�̴�!���������z��F�@fH'�29Y7���� �16]��� �]����	��NC�-�8Ew6��pJ�1��8(闱	
$��8�B�Y\1��|� ���f��������s��N��|��e�T��d]O�M;Hw,�#���|��0g 6|E'��
XL��t�5�J�J�`$a����D��T�W�Ⱥ=�`l��NV� ��)㪂(
#��t�x��~5���N����!&��`*A����	*�N@7y`F�@�B��JC�Y�v��bS½�W�� �+ @�ӎ�����H�z�����?�v����7f���U���Ҙ�_X\:������~���<��ೃ��>��۰�ݟm@�$�9�<����w��(.�UqN3xI��)|�\����߯x
�m�`��n]��Q��a+	&�`
0IΎ$I,vì�e���r��`  |P�����9�Ǥ��A���!���A�q5N�[A�#9yY�}t�[�9ްxg:^�zNv�5P���@
��&/N�Mw7�����Hz6
e;��@�T�${���mDa���@MI��
�7�l��vn�
�4����͐L���	�#���n�ɯ�I���IN���6q"١T!�@��=C�E8j9( "~U8қ:
q�!�z�^����;=�gH,q"�������D�F��E]vEp�{�N��lF���$�W*�U���۷��b�&K�R��?a� p;'�P=��}/s0SR�(�S���U��Q����癮V�X%iVM��g���U�L KW�v�Z���U kZZ@l�f`�H��|gt6(a�?VwUQg���������7��mm>
�7}ڀ��X_��s?Y\�[��������B'�&
�蟞�
�7{$9��Sw��+�'��B�b<�T�S����u��Ko�B؀�6��J?�?��ٻ� K��(����-����L��a��7/{�(���*�&��g��[frJs0t�"u�̱�HIxz\�ě!�D��s�}�
<5��WV��٨<�[�T(Z�`am�����7����-��8�����`e*�����C6����l߱��Wh��~X����Z?�,�����Ɲ��*��j�Wemr����rtC*Y_��/{	.u`���G�t1y��v��W�/U��+.$�M~Y�$6�ʌ�tnњ�"�]g:

w>�xM4Ve@O�<�ʝ��~rf0�ɘ|��SA?� ��O˻N��!޶0?N^�c!%�*}�S�j$�v��V�ax��f�/�8����2E��v�����v��9�l~]A�\%@��J�w�|]���K��� '�I��G��[.
�cx���~o l{~��^ͫ�r
�EH�"�CE���#U���e�������c.��k
�����#��[h�U������CF $���@�r2��� ��je�Q;Ou�/��f�%��7¡�OV�^�*�3jU���,�l�r��_�C��S񹐪褸�}nW�]�����X�͜��$j���<w4*?�&��^�oou�=��{��z��u��MC�D�4/�鑐´~�)1�5'bH%f#9
�A���#����l�(��?4���Y�������[0��G�E�Pv|����ʌRՅ\r��kW������믽y��*��edN];=RG��d^þ<��>Ka�����4�)}SB>$��
�cI��\�P��	i}ɒ�b+&�؊b�-�*6'Ҋ��M�=��R�ي�a���ج��T���B]�g6�m�V�yVb�+u'��K/J�Y�� ���g7��ey<Y�_tM8���B;��֩�b�.���u�Kt9�B�^�N����6�lg��og��ڛ��Lu������s��w6:�m��6��C�٭�Þ���Ԏ��D9�4����=��v���g)ļ�=O��'E���\���3�ɍ�Gqv�I ��zݶ5�]�ln�
6���"��T�8��ֈ1�mY)���ٗ��v�L����)8)W�[��)*M��䘆�li��N�Z�v���-C��S�Rڔ6�TVP7=��N	X�NiN�*ud>uG��(F)�;�ZF�o�Иf��O��ߧ��bA��E5���j
w��� %X�I� ����Y�
n����٦v~i�pY��<��gV�����}
�;�k�s(��k��[�X�)]����"�����ͥq�E��l�?��P��~H�n�t��4�}�J��&~*N�`7x�����XJ>�pa���9��/��^���w��?z�+��}�[Lu+v$ Dx�l" �(M�-ϸ��l����3	�7���QC0-�֌�M﫩���툤�y�(�/�'����4%{Pު �U�ހ���ͣˏ�bv)��w"Ϭ��_�-U�!1%�@��j��M!�t,���7�c�Ƀ{ba�z�����̄4Ճ��U�yч�Y����,`��O���cM<�>���_���ￅ��"�Z� X?�ۺ`U�F"ժiU��"��	g�� ���(O>F��cbXe��H�`be������o�cQ�W�� 'Ynu�r��& 8M��<
5�;99��*�U�[��'�>v�e`N����� ��G��z�G�_a &�Ô�J�6�xQ��O�C�4�,=?"���K��jC_y�k�v-�7��cg�.�$L_�낚��O�M7���]��ۯ�zsF�׫L���/�я�S���J�5R�/
ޭ�Ok��p����J� ��.{&	g/���B
�˶܈�$ƶPH�O�݈)��T#mX�I�(�.��요O]���bu�x�Q�ʜosK{�Qm�7Kzf���`��h��/xUg&r�L�A�OV�Pd�\0c�q���W=�
J���#�ڕ)ib�:�~�<\2�ͺ�vq��5���2��Du��]������$N 1�E��h����l�{�E�;'�0�Er��d+<&�
n���9����8<u�=ߎ/b=�� +׶�L�����U�l��Ϭ��k�kj��
��P�d���m����
��
�|7
M=YRzT�) O�R�M�H}���⯓�P�.�
v�X
)*�u>��%CA���K2�ԁ<�*�*��(?g�mT�IT�$'������Z�դ-��Xy�J��� �B��[?���C��0�G�tG3�(��ˤG�/T��� ���
�~���
W��~��N��J� ��
�^�nV�7r榦��֮��Z�	�s3=���k{RS�O4ɠi5'��Ϯ\y����?�����_Y�תV�d�&w[э����I���2v5��E����AO�ꩡ����������z�c�Ɍ����<��?;�)L���)ΒB���\�1c{�sA��L9v��4;ɝbӊЃ$�w�&���N�aZ!��ɅMg��v5yX$;���Y{Ik����vo�6�BlG[4�Qh��i�Rs��LnsB�̅c���g0(��s¹�y�0�|NV
�b	�lK�>�A�dd}�kss(c��z��lX5��h��x���h�-�S��!z�r�����7��>��/t��Mz�_b����<	�L+�҄�B�R܏����\��3X��>���<���4�";|�#f�p�? .��H&�d�ט�����+I�N���W��=��0����aM̖��/I+=��5�z�ĤE~?�ŗ�&-�ߡr�>�+FhmH83[j�)���k��
j��OyUQ���ΨF�t���{�k�{}`uz��\MS/w2����1��1��*3��^'��p�8�7�:}�9l�q���WV�%m�t�r���
&�D�۩�y�;]���.�դ���}+��V\��n��uGF�S��9^g,�P�$Ϧ@@����������@$'Kx���TM�{1D��䠩�, i�����˫QKH���	��L��a�*��0�^E0-1�K
�7�)[Geh�"̜����̛ʡ��/g9?x�����h(���w�;�(>�PR���pPm������<�0�7�c��*�)�\��P`�J����z	m3��mb�H.��a�$��VL��ٵ��&��U�a+�^o�:�ԉ8�دУ��
BC���CRr�j�+��/��Ve�����X��6R�)᪭h�� 9X���
��o�a�$����mq^�-�êPyA:��ab���o�ul�ߜ��g�%�==zͰ���ed�Hݪ�v����e?��[߬�{��`-<2�]�u!�鿷gcBR�rH?�����+F~�$��_lQ�DQ]
;���j���G6X��5j���V8@�Ɯ�	6��bk�PpU������%9���%�?��pK���E^�2�J+�/j����j��k�YkqdoB-�y�� 6�dA'B��*
{ �"�B���ݔG#��hR�ڳB|���p؞� `����i���%��.ۖ��K�K/�n^�[���\��A$��o���a�ͪ��!S���)���p��]MJ�*�]+ru����#�M����
)['�Vq��F��,���H���v��$j� �l��U*�S-9�Ӗ��lf��������{=�]� "g!�A\�c^����E����!�`���`p���sv�:]�H~����\��'�Si�o 9����� 6D`���%m�BoK��^K��q�1�2��4>c^VD����_9)���'X`��-Ql��:���%�%��>0�D�n;�a�z8z�����
|����3�^Q�إ���ބ�
妵��G���*P`�Iz}����b=au��	9��|]r�Le�w���js���豬	C$�0-%�sE����47�	ə���.^��/(��WZ?u��y�|2�B��;]���{�\-f��^�sL����Q(M�䥶>f,�������L�	��|��&�p�������A�Rύ��N�.�eh}H<����c0��
�:p����؜b�ʡJl��%y��Ė�6������MKh�F9��?*q��i*1�Wm1L�D�=ߐ�Pʹ��� ��fv�P�@S�;mŜ��\�A�SW9��qXU�V����ui�ӫ�?���Fa�E������-��c+p�[I�Fy@i�����Mx��F�׎����bi2��h��z��<;��{/zs���)ۏB@�1v��,۽j5��&N��8+�`�u��D����' ��ʪ4���6@F�-o%�Zm$r��yX���%��0��O��<2��}5fS�����`�����S�B`[�N��]�$�l �?����#�AK.~�Ò��AEzU<���؝vk����$~�������f�)����eβ�3vԯ��1m�LGm��*^LdG�q̗MQO�,fT��L��u�s��g����ԸY�#�*�u=�����i(^�i��łҷ:�����porU���R��
��Y�eU+g%f
�X�K�Du
�z	/Í�60 �� ݻ�|쇘;�V)8�����k�Ѩ��p��H�D��I�Ej��}�>�F�/?�8�����;#�4-mM��� }@����g��N���i�痽$����(���aR@�n"QQ�k�H�('P~�g'�a�>�&�l��d�ִh��o����I�sO��n����O���K�\�M û���0���v����U�O׼�� �����mW,l�B��P���A?}�ylp��$�?}n�/\ڃ�?�˟�2��UL�6�P��3[lE�!D	��dd�N9gu�{!�	��F6Z.}t1���;,���B�y��4�.y�� �r��4߼)ݩ���E�Q�h�n�����K悥|Š�?�C��_J��u#���1�r�ҡ�dkF���#����e*���$�C�Id���p0i��GZ0�:R�vo��w6>�J+��J+�������R�I>��A��$���Ľ�0	�Li*�
�g	E��CN8 �
'
�?3r�ZȇrF���h��� S�C!�~(c�p�WO9�
0nʡޓ�1�$�P�D���S��@9|<z�L�7����G�|GƼ?�Y�J��U������ȩ�"�:�V�j�N�T5H�9U��捕ϪzU<b�x�K>|�$�$4
��$/�蛃�t�h�����bЙ�:O�'����5�w�T�D��о#¨z�����{͠�kj��M�g8k�J?s��hա�㺁�6��e�­�x��4��~k=�3 
d+�x@؋v+Oˏ���v�5�[9��G����M���jQ�Sh��)W�Q��g[��� $�P����cF9�M�Q�+�Q�D��|��!b�y$��1�g�w�)C��&������jW@���!�W�N�'L���c�R2�iQ�"K��u�ʩMt��2��etI��.�9물�	��3%����<EŌ���1���|�l�-Iu%�sn,I�#=ϯ�DZj�6b�����,���os�.k��2z*������h�?s���
t[���X�%j �^�i��s�=!�t@���ҤD��m-�XWt��Xc�qAu]E_�>���``
��	�_�:F���� ��;^�Lk	RlM�O�"�ԛ;��C�+,a�GG��i�ķ����lA�*[��&�1R��q�/斏~������Ĭ�*�U�Ș�%o'E/}>-�/Hr�Q���3���� C�*G͍�F� ������8���K�����z2�I�!$�(Y��I%�	����t�)�D��1CgY�p�Hm+�/�����s�yz�*!&��z9JP�y���[�n7�����v�� �Qy���~��a����[(�`�'��V,�!gF�7�O�8?"'p
!erx� 3�H�H��]硨�����{4�R������ɨ^�!�!�+_F�#�g�?su��E������
���Z����Y~�G4�{��y��E�ﱨ��hc��O`�z�%T.5��jɕQ��֌4�/���8����|3<R��~ם�m�;+w�Z ��C� Jp}��O���?�@�q۟�t�*V���v?y�q�~ڑN��uj�c�Mm~��P�X���oj��nJ)���b�e�S��#���&D��>y�����c��3��M�|�ɴ�ꉵXN'h��T?���vL�
��Sh��Q\�
����w�
�C�7]p�Vno��vo���Q�u�֤2���2G����4+�	�>�Ȭ��e�$��٬�gC�������v�S��]�d�~��67v6O�����4'��8M��$i��я�]���|�i���`{�'��ݵ�瓚������{/{g����71��-��
��~:�Y�U:�[���z6Yݯ�h�or�U����%�Sw�'�/&6?�
������*J*�b�8�鎡>�
�vo�J���3��1��H+�#�n�|�S(=!<�eh�n"��ƞ��#�k����&��i(��n.9��5+e_rȩͬ&�W
v���Pݜ4�M`.�>iHf�\&�/:u�ːG�42�;	e72��<�,f�!�޺�G����|1&i�]��@�hi�����\eV
�A��Z ;��f��(�^���HDũ��b��Z�uK
�h$ҽ\�ܦ$n��p���MԂ��V�e{5y@��0@\UyC��(�ۯ�A�(A]O44/ys�P���=
2;����y (ܮ�#��E �R�H�7�#x��:��)�i���[�mv�
��=����woQ��Rc�<qW`y����}z�ј=7��B�%����C:Å��P�0gv[p�[�4�q7��"?Y�@]�y�T-�_Ҫv�?{C�
� �<���$�u�K=�EIߚ�ސL�οA능񖔿��;z9X�9�9L��A<g�[N����� S�}Iz���Apt��q�st#四L� sAP|>-�AppB���a�!8�!XYݏ�A느ѡM�%!�'ᨶ��+AtK ,t��ׇ�\ ��K�6�$b�%H���ot���:�?!'{��.��s�׹�I�hO�SAb�e��\:�
��BIZb骐:+H��櫐z+d)���ّ�\	p�|���pw'H·&�L��&P�[��.�G}~!�@?�OsE���I�#*�QaM �C�]
�G粣�QPzQ���~0V�1UM��� �� ��}c�{�&A@V��Șe����O�t���X w��(3�c'+������(��w%'��1���)C����b����+NfX�a)E
3�Q��7;q�p�o���мt��,�j���c��8���Ēڑ�9"��$T#%5#���~yƵ/��q��݋��"��Rh~�tB�-���S���}��!�]���������n�.�
���<�L���OI3M���(g�rd� ͌M���Z���Zf����e��$�e~ �
�6��Lu1ϳ.��  ���}{sǕ���)F\;���,1��4e��ȖV��U��!0$&0�P$�˪�3�w��V��kko�6^������q�|��|��G�}N����t�  )ZƸ,��LO?N�W��;3_��3���|1�b��5��|0�J4�W�^�['�
-�s�C�t���"e��N�;"(0O�!�#)ٞ��h��]#0#�{F(R?m��&����3?��~2����/!�U%��b�b��j�<h�3���,�eҜ�\;�н��a.�*�c
;EATf�����!��7��sv������sș�Яcm�<H˙g���~�w�JMmR�,<<�'��*���w�q�hQ3B�+Z� ���EɈИ�E��d�4��E����{��"VqѢ�8���� Z
���R)gƓ
�T�g��v3�����Ͽ`�.2C����4�t��2)/"�U�E�gO
��\a\ <��	�o��e{��?<�{�:3���fvπQ�kfuϬ��}>�n�^���6���=3�g&���zNeo�~��2��B3��2A�~4~��~4U΂�����pJHt��B״
|�@�
��d�c��U���B{���=�h�)l]eA��)ϣ�+��*ӵ�y�m������3���ۺdK�!�Ҧ+��E=f�Ay{��s
�_�[(��
;��0��u����k�
1-�|���r���KA+���G�^�]F�8>�26��3Pn���
H��1q6SR.���9?���C���n����HtZ=��c���9<4�����cb9X�ᑺ;ԩ�ߑz;�6΃ܳ,��.��q���E�D������SM rЂ0��Ӭqa����$�zG�w�L�y��O�;�a��G�	<$�����H੩�$z3?��Or
~��σ�D����dl_����so�΀�z�~����i|&��΃�8��N��	�[��4�\�<�L��u��|��pfދ��Ҙ}�&�aP��94�b̼޹�b�堀W�"�$�$$�,�R�FyHJ��c�R�OKI�3�a<�>��輠i�<�0�
���2���A�p�C�4�q|Nะ�b;p}��nK��x3�M�er���M����4���G�ƙ�6�D�E)���`�g�k8AQ2���2��9 ���1�C��޹�Ch^��L./��~@z�Aоl1[���w�"ꉊZq����C���k|Yn�����]�ҋ`�k�����>#	�fi4�[��`ի/x�_������[���pX�A����6����n,6�*�,&B��oV�]��>��`' M�t���2쇥l?4�3o �J[�ˆ�[l������{=�
�
s�Ф����3��2��^g[����	t�W��D�̘]�H�<�`��'��~�d #�o�)��8���ꛩ+����*W/���-�G��}�Ø֝A��e���L��C�����}N�|�F�
��l��?��߰�)�;����߲hz���Ѝ=�G=p1�A�
�_D�N���0����(w���
���Oĸ��fҊ��EZ�s	o��7Ƕ������0�i7@�q��d��\%E���ü���Ӎnˍ� �q^1_�E[j,���]�M�u�&{�WԊ�w?�Y�[� �綅���}�\3�7���w�?_�	,��o�G�0	j�;��7]���J��~E
/h�{��)���2�y�������A7���M|"j݈�h-������1�ګqL�"L[�
jxCeNl�A�����]f�0{�7`��tO��5uJ�Z��!�TZ4e7��re��? 0�O�+0�ڏ�b �����\2�z
���+�����]اҎZ�=6��f�>X��N|Ň��>8G^��A���}.��>S���T ��}���#=���A�����⏽�l�xk�d����|���)��{l���F]B����2�숟�
���O���}W�5(���s�P��B����v�DOx.��}�v&;+��E�ڤ�
�Kq#ڎ<f

Ѱ��e�i��n��|0��K�Z��XI�4������'�x�ʂ7<�c9�cl�
{ե&[	�O���W]����̈Z(��r�XC�B��qл� �
fp��`������M�R_�����������G�t��՜�2��M��j���xn���-���W�j6���~wxu�E�B�s����s�\�s�~F��ZCF�Hj�B�j����'�G�x
u�b�v6�eT׬��Xn甦V60x��t�&
�e������+�p��<1����A��!�0f_3����0��;9���J��.����!����ψ����ׯ/x�����O�����o�5�̉&0��'&7���}JB���A�փǸ��EK-�t�X��8��W{lS��eB�o�b�f�ġp<}�0�>~fp�c����8~Lǯ�?�o��oyL=y�.7f=f����n��OF�-5�ĒԨ�ڌ�{��(k���7SOf��L=��'3��{��4�3�ĳ�'@���;������g��e�K ��1b�=}T!tǴ���LE��SS�O�Uʄ���4�Lh��[�R��޳+Oߧ�k�\y�X��R8��AR�r��o�v�����%������J�E���@$�J"�:w��";��J,�"F�GW�+�6�Ʋ}eR4��"��R���U�ެUә�sCVi0A�$F�G_����]�<Ԅ��+v���/��b��X1j�(阉�d'ث�3e�Yo��=��48P�R�y/鄽^o4�������>)Jic��~��)���G0���[���?�,q���b�a+�cG]��F�r}���Y�����r�7p���'�䑐��0�M�A!���A���y���zkp�t� ��n��0���N��E*!WP�J������{p'�G�/�}�.�76:�^�m$�ӿ�	�b<(�� uz�|��"��Ȩ��J�}9���z���O���!��b�Q	�IL�	���X��1��2��k���74��ܳ��_�T��9�,�P�N���l]�4M�J<�揎?ăT8���C��M�|1��!d��>��j�_~��@���4�%Z�����Ji�v]�0ph��K ��7��P���f�݀��R�
�Ҥ��Y3~���Վ�ŏ62�`!Ҡ�nA*��XC�+��L�$���>&��^T�}�_eo8���;������l!5���9ՐJ��Fߌ�Ki[���5#�O�QS�Ϝ�|�PV�`��0Fb��ѧ�ޡ�d�OK`S��F(SA�I�یGmt�A��q���`��y6?����Z��$�~������}7��B��Ig3���LJ�o�өұ8ѕ�av~��Qi�G�j������0�=�1�~ǃ$u5��,�kQ�!�p��;��0LL)�R�\Ӭ��U6��&Dk�����WF����
�f�ϻ]�0��iw���ט�;c�2[6%�v��n�s�b2����-ٳ۬�s(�nԒa4`����FE�2o��䮦tR RyD;�B�ń�t�\Akְ���=֢�sE&\d2�"�~�����{��Ͼ4<.R���%K�-,V[�2�^�Mk���0BI(��W{��e�,�@q��;J �7����@��L�w'�~,{�H"@K:���M+�޳|����6�u��m�B8}�tf��s��V��V�-�ƒ���!,�D˶��f���M�V��(3`{<O��6R��3��B3���n���jƲ�D�mᱟ@k/����q?8|c#U�C��ʺ_��`�
� ���&�}/D~1k|]
�߫6`S�$UC����-����5�<x�2n�Y���|P��Ư��gk���mLd�W��U��3���?L���z8g�T.�
��e����2m
�`�C��,���T�L?h�I��_zM�2}�����2����x���_�Z�`�
�X<	ʺ�����rM�ER��%���
�6�5�l�d��lKeW�-epd��6�}�+�m7����9��=���<�eKY5 ���P,��~��;�|�˫���2F�<����x�r=cz!���oxW�(S�u�X���)�O���p�n)���.��.���a�'�]�I��_г�R�����d�"`6Hy%j���`�
�P�=�h!B�;�(�Rȯ�3�"o��ްu��K�&�U�N��,��Q�h����͕����z��|~
�`��V����0�n8y�X!��1Lg�Y6�7z0ISK���&��s
Ӽk����M�R��G���S�U����n�N�X��Uw<c <]:�	@X��k�ڨ�X@!lѝ#�
=	��~�=
ޜe�.�R;�L���Z^r�-�W���<����&2~~HTL��W�Ǫ���������x�ve���Hk(�i;����ksr
�)}9�vAh��F���Z��
�ȳ�(�k8���l��_f�~7�1�����p�s�
�^�垟������Vd��<m��Č�4/qy����¾�ъ��F�I�^����,>Wf�MbF;A߈S��+)�
��K
�}`ٜ�-� �6�"����� H,p���F�� ��=���V��	Nt��a/��b��~����d���6/�I�D�e���������\�(�0�S^�x=�U�����`P��{�,��T�J����~�K�	�ԭ"4��S]�Nv9��l�'[#;ݍ���D��LNq9�^Ǘ6�xY�x��ѐ؝,�î��NgL���8,������O�Ѧ�]k�$W����#�&�|,�� R�� @��I�H)9u������F��_��{|W�����9	�_��B�&�>U~�T}z�ޏ��h/h���᪷��X�p��+Oh=����3�c�>w���og����@i5Oj������<��i�x��ݥ;�d���#9���FMzy�]��Ξ�V��l;*띕��r���(���s:˫��<5�D8gʹ>���6Ӏ:�:W/#���dϳ������]�ʀޭ�8�����ˌ���Cq�X�9�Ҙ�g �ˈ3�D�����N\�\�/�O[\�yc���',T::���PkdKM��呏��R� ��T���Q)54�^;/3aG��߸Ƶ+�^�N�6�ث܆�:/a����7�	��VPr�/.�a�+)��⫳p��z��x�O��(�k+��a�4)i�x�Ե�:�8x3��l�6xP�4�e�6C*&`�/D�E�ʹd�b����7�#2�+����78_� ��dn�!NV�8( r�4�����Z��O���<D�q��l�D|l�j����yj�
�{Z����Z�yj�39.5�����IWv�V2�J��l;T�]@Ie����ǟ�~>�5�^È��U
s)a`��"
"�5�i����衼T��x�e7|���/���M#����1zH/��I���e�*C�}l��&,��i��I]��]�M�p���-��1�C����-,Ytbڜ���P�=Uzz����o��MZ��yS��2��_�[�Ԓ����Ѓ�k��D��k���a5�/�m:���`�~4����C�M{�(zW��+�3�>6\���]y�j'��-.�%E���H���4��;J���.��?�l�Q���p����h��!��mM�*N�.�qf���74"�C:�KJ�.�0e�ʓ� \� �D���0@+��6��˘SX&�E������va��ҳ�������"�C�ȼ�
}��6���㇩"�-��������zA¾:H^(jO�y%�� G���I]?N ��^�1`2(9�������)��R�>�Ef� ��YKL����cƭ�xQ�4^|��I�Tx�B���� U�/l�z���f;�b�;��\9�
������!{�}+Q�+��wI;�S��A�4f��5�	N�\^�f���X8�\ZР��.݁��X$�2��Ȓ�œ\78*U��	$�t��VXX�=��6'�Ӹ.���,#Vw��$l4c��uv��k�^�kN�K>�/��@M��� ��w��[%/�Q�ȭ�3[P�P`��&_��~�X�^�t�9^�K��q����3�3�?����^��8������΍>�z<L��	�|��8կw���&|�)7����$�JJ��������qI��%#�"���F&`� �e<�ᣬҔ�g˰O��1{�E��~�匿��B�k�"��)P��gV���ä�� �K�~^R{�9��L2"�*���4h;�ƉLD�����@�HH��ڋo����X-�}�Z�5 ���Z���-�����#�Yg�<����ۀ#$S�?�d݂��ewP���ќ@nñ)�
�׀��"��Z=qJO����:��N�c��QMꤑ'6݁�l���-�Ew�(�J����8H�� �(6�Zl�o&_JWj!vIO�x7v���r�|h-op-��=�.t"GIL�"�Mlqķ"��\��G��#��N ���+��y�$�z"fAҐ�ѬJF~��e�6,:'ˆ�ހE��U�"ؓ�Z�O~
��v����t��o�k�O�O/�`b�z��=KWw� 5��*�>�:��(�P�LF&��R��E�?ފ�Y�܉{Zkv+��%��󿹳�J,�4;u� ������ 9�N�4zi�H�Ku"R����F*Y��'L:�#���
�wL�S�<+L$��+Π�їLl|�l����#��_:Je9��A��M��Z��Ka�>:`����uiZc]JƸ�Y����"�8S���5c�[�c��ҿJ/��*EF���=�)��q�:d]b����Wz"�PV[���_	d8�Ɓq��}�
K=]+5Ҕ�Z��X��H��p؉�M�x����%,��N�;���� (���6Tc���	|���>?�Ά��J�G�If���\�!�b�};�:�xxY�;��׻��c3�9�i)f�N��r��1cY��G��>�^+�|
P�;~����w �z�>Iq]��e�?)8�s�#Kbk������iJ�&�1������17�Kg_��C<�Hr$�4G��x+�{~�M���0��l����ðjy��s�5@��G{���4�W`���zj�?���7�칗�������>!���Q\�{Q���-z�F�͏�����~ի�o{%�3K��}�>m�P��~��Q��$ꒈ��
jʐ�[ƪ�� ������=`������g�������%�x�b2Q�w�S[�/˽�J�`G� ׶��t�arM�oRo�S��D �!�H�����sP�4e�H�P{ajSW��~���P��є���<�^��ģ��t�����L
̚F�3^X���;�ə�4܂�b������#�����µ�n��=r�Μ�a��|b
0�毤� �ȸr�֘n8�B�pO�{�a�w�O�AaQ`��'��;XG�Q*%A�UV���0|��@>�|�[���^Ǧ�W���xj�3����l��Ưk��tUλ��o����s|7�#r�˅1|,Gxy���>�2��4_z��P����_{B����蟠��b�~�O(��d;1�bp:y��2�����a��@� r��9
�7گ��ӣ��-��H�UP�Ѧ�5eF��XfNf�NZ��
5����4"%j�%�zU�8�H��ԛX�����.�Øk^���+oьU������?��_��]l	QC��$o~W��g<v6�tZ�+p�T�����U�1-�3v��
������t|ș����9K ������R��{;�����E�M�n��<sBH	�TT�(^��~C��ZɃ,Ě��1�d�J\l9�?��m^���8+u���`�
�*�WS���n=�� �f@�U)��^��U��x
9��agPE���B�Ģ�\�l��
�A��>Stk@ƨ��H].Zq%�-xKu�
����� �!`���jl�������(�i�0�6�b�9�h=�q�(@�ٝ�1�$3���`�a��I��n8�P���"S���J��\Q�-o�^�H�_���9t�^��J�=�nqUJ�p8�8#��X"e�Y�[�����̾��~p�ޅ�*�jd���"��.�9)��Y~O�E�j+\�+ �gPJ���C�&@^�+���>��m��=�$܊�~����+L-�*����?�˕<�I��5|����?�ʶ��xI'�՗��`smr�&�S�e�̉��٪/�P�Cy]Y�jG2%�'=�V��)����6$Y��J�jT�F�j]/����\^!����I�+P\v�M����������jcڃ2�s%:p|ŉI7�1��/��^����x{]��+l�Qߖ@<��2���dC�Ƣ#7�m��U�,ȳ"Z���R��vzHD����t���]W�U3�>M�n>+�>��4F���ɴY*�3
G��[Vi;�����e������t��#�Y�U��~�irg$$��������1-�A�
j-|�2�洛CZ�c&���hs��w# ժ�r�mgɠi��و�城�
UͲIɦϪ9�߀���,9S_���D]�4�d�#��� ��X�]A� 0zpZV���Jk.	���LArP�0�����-M��� �VZ�1�˞r5�M�z;ߓ�� ��_�XZ\�	���᭛�x���k�6^{�����ݩ%�ǈ-X�>�"?�1���Z`���
�Ww����.��xW�[����M#Y�d�����Rf	cܳ�$��Pn��)�av�~P
�:$�"�4L��g�W�sŗ��E~��1")`���w�����T;w6��S�lhĹ�����������N�Q����F�J�d�0 �u?N��;~�j�>����$��6�y�l�2r+�>�d�]�X���0���
�aiG�S[�0��T�������k<PxD�
��Q�d�qKY�4��ʄ�����B
�G���ͫ��v��
w���B���7��1�j0��cԾ�Oȕ�)Wjzz�:w���ʞO�ċ� R� G׷e[�_o�&Xs�ʯ;\c�=\c�?\�4@�S���2Ţ��䌓j�}�q96��I��%��3`�,=K�����(��UWK��Je��y�#X#zM`F� �=OgITƭV~�iW���]��= j�5��7���3����[w�!��M�i	�F44)����,��D��n�%i�ө�5��I��|����s[p����C���HQ�������qp��aK�L��[~�N#���)�<HC�S�i�2�+��s8��A�m��S����x�Ǝ��k��x��Bu�%���>E�)�����
��pIo�۷�D?ѡ����A�J�54y9�Pʯ9�=��1Gﯯ_���U�W��.>1>�?�;��X"b�� �,����瀁��U���C)������D�ꩉ���6�	\%��U!�Z4D��\o�J�/�������}\N��q�"��pUcf�D�T�B�ʃ�O�{��K1fQ�
�j^��������J}�Y_^h6굋��
�`頄
�*�k�@��R��r%c��29�;�azI�mջ7���sl/���.�\c��~�wc4vW�fm�����©��׽�hl�A��.��r�4�A�8�C" y��)�%;�^uR�F�V���&X}�F��<|{:(�a@�1p�``�?�16E�����tpR���J-uQ�$UH~��t��q�[�O���.�S��J��Z�������H�7��%eA+"�D$a�䞒���B!$��!��N�$i
&/1�zm�f��Zm����h� �.��׎{6��8y�V(��2�� e�b^!�����Ĵ��
�]�j��\����Z%6�&�ƹ;<G�<
���!T�mI�Z\1�JR#��R��#\4R����ԧ�8E�ն�
�QYY4�b��� a�$AZѻp��5U�[��"~N��ځ6��p'��^8�ݠ��@�O��)Tk��<��a/;a��:�U��uX4:�hr=�F�C=��s:ɬ�Ec J�q�@�Z�L�PjݘѢ�'yr��3�1� ~:dK݁
X�k�3p����ì����)�7����d�Lj�IJcF�pc�UfE�x��^n�j{^|\�H�c����Ղ�Mn`���.�D�� ~�� I���dW���������,��"
w�澦<�!zOY�@v 
:�2��=/x����o�ٶ����r֛% �`����[rK����P¤���wKBcb�0}(�,�o,���D���v�*Ai���G�
,�\�˫O�*BV��L3�8�c�xMg��Ɇo����Uȓ 
6�S�߱�ݺ�K���m��n}�('TN�(Z%��f:�Y��\�![���R[Fۺ<.���O|��'���L���N���S`[�s�%�A�L�Te����I���e�	|�����%��\A�y����x�)າq�Y� |�:2�"X�#(� �� �r�/y�E����f:]� �[�L��o���('�K�dZ@����38�.8�.s�}�G�m�v���X9���B(�C��4Z-��c��n| e,ϯ굀x�$"n*���ч�@��0ᑇ�+M��b�ܞ�"�p���%у�
ld�v
֤	29؈t�M-�(ߑ�C<��Q��F�~����� �ydߘ�=�4<RFw�1�0��~8���7W�s"�`�]���psMM^�n$�ygh%#�.9	���Ea��9���V����LC�W�*��ͳ[����P�2C9J5�F�4�C��31�2��
^[-av��Fl���M�����$7]�O���������=�E8�T�b�ߎzs�X��}KJ5�_ 
7���Y�.���<��G3�����=�O��mN���zd<!�δ��(>��okm/L�ڽ��P�r(�q!�S�  ���4�.��bhnG�i���� �PҜ�\��R��-r�бc\�0���
ԗ���i��h���x(��)���5�6奜�5�H+DŅ6��UG�%��d��R��K㊵ ��4�V��OC���Wc�}�A��ȼ2�h�|���\	������u������I�&�@���?���m��8�����"+B�ø37P�n��V�b�1؊U|�<ˍ��l�U�DYr|z�Uqw��L�\jM��5����&6�Z<vLI����q��b��I@��3��{ӌ�O`> �K캋�XH�g��
�C�Փd\L7��������+%�@���������O.�g|�isw縬N��?r�!-
z�m?��4�b�i�4�	���O5 �
X*=�"�5/� xT��랄*'~F��2g�G���I'G6��U�j���7	�� ��s{L���I�Tno���L�:p![k%}}i�93N��f�bZSi�xi��F�~x�3@Y5@E���A�v���������t�q�0�	�����W�	���p'��8��0���}>�MН�^Ϗl��� 	�;z��U�n�7�`�ٛ6 ���Yֵ�U���j�9�_ňW��#�Z珆��jzTz��An�eH��:�%�sU�"c��x<�Z|pye,{��2.8K֟�Z�?Z��jd,?�pI�����w��$6W�����,�!x(�1���B+4����gN��32�v�`�
��ą�D
�A�rC�*l�D{�p������0�D>""��c��¶c+d��Y�IWcV�l�*��DE#��k/�����ag�����=�-�C� ����@�\��`;�Uy������^�{갢>e��G���7�V�Aۗײ��7Dki��Qb<g0����̵h�ϤW`_A-a2�i�ml���!$.�`x0���ܼ,��o�A�����f����&)mmp��5�ݠX~�($e
���P��ŅZ����\x�}��T�����h��?�$�m��{�<s����i�TEˀ
	�`�Ʋ����!��^����U�3�b}#��FjPݣ�5EsHD��v]�^翽s�U����3��]&��,���(`�M��%-�0�V�e��l�(�ʔp�(x�Ѡ�4�IE������&�ՇsIN�@,=�`�r}xl�a��k,A�ԍ���[X�_�7��h��Dt��i���b����D[ÒmP����3D�!�B�~pZb�ь�).G9ow�k�Or��D������m�3r[LnU���
S^ܦY��b,p�'�T����o��,��fu�6Ը/sc�E�n����r�ђ浘�	>O<M骂�bw`d�.vd\������Ru+s��@�(�H�Lr��bG��qiAB�P7��˞�sH7kX��Ӄ�����IVвY[a��}åBa�\�ØH/�]\�#T����O����1�ư�Ͳ�$�,9�!�I*&���RwI��M	�����LY��A����+tE�E���M"7S�ձ�Ȩ�_�����F=����7������?��'ʘԘ��pR�3����� ;��~g���i�E�J#?�6O �?�'T9\U�5pB�l�L1�`u�'Q�Q~�zo���s�(n�;?ȵ�·	_QOҚD\��P5�ɨ���������)U+!+����v�T�C��w�~k�;�,�JM�I*��h*e��w��S���3i7�M��AD����S����:XJ,���&�P!t(\�l��0�{c�)���E�{a{��bi�	�M:
�&��8����j�p֝
���\ۯ�(C��P��&���.[(G&{�Ab�\���_�/K�_�	��ml�y3p��N?����;�޴��T}����/1z[�V��<���{�X6xu?w_��c�@������ݑ�`�:�ͷ��Q:�@حu0c-�`�6���s�p�;*
��0���?}�L�� ��݃���J;���E����pޝ�<#���Z�Â�ITũ�a|}�VZF���[.�(�O����yƬ��ّ%�[�pU{�:�瞻�X�z1� n9�7�S@�4���^[Q�xr�[��3����6������~�5�T0~{�v���1�ڬ*��9TM�x~�J�
��C���=�������q���F_0����]���
�¿���y�[�S�e��뷠 �G�j��;�a��!ɍR��ܙcD�E�&D�o^aFJ���c{�wPn����&�{�d��(B s�
K������_�O|Ł�2V�� �ϴz�P�L��k
�hah�����m���i7���kmQzX%ڂ�^�Pk!uY�`��O�6�߾�ä@�j���w�<���&�0I�۴�d��Z��vwc=ڦp,�H^�;I¨���`��w�k�����JD���7�D�YBwA:r.}� ~͵n+ �,���S��Ŭ����߅o���`� 0�>��3|Ķڣ�_�#��>a7��V?��>��2�d5pr�����w�<啨��־GBf����B->�uQo 5�W���J��t�y���Q��l�,�rN�C�L_��U^��cH|��x�s�������ݧiz�;�O����V�F^v�`��]�A(g������I�dNؓ��,������SÊ��^5"���1�a�S�ʌ��N*ة�pE�]�."��wQ0+�[�5B�_�� G��_�~M?�%����Y��=��E�'{��B!����������n����؜}�g�O������}��1R.:�u�F�\�P!w�	 �����f�6��4aٽ�%��1vy�f��lTn�>����Y�&ӕ�U^���h��^
��.��
{��5��a�/qu��>[|G�W�~i_���9��ĝ�$:ۨ�RV4�q�/���i%�V�~c�^�n��nJ�n����c�TV�Ox�e鷄�QN�@|�wS��IC&d�]�(�t��0mk���Z�ݎ	�V�c�4u-ޏ�Ws�5�U
A#�Ǐ~�]�(ȅVB �vDсldlw�j���-�.�� ���2����U�:�Ic��]]����/.z�Fl�;�~�m�"�U��/@�q�H���V_|d;O?|c/+�dӋ����6J�9����Q#Ëc38��S����R@��z�ۏ��n�h�1�Ը%� �j�t	e�qR��.�_1��F�*33���,�Gz%��pk����I�B�s�*���z.�
���B��K� H7� �7{h�I�1'�d�q�k�6[��~?���!��Df��~�W2c�������/�x�lC p8�A��_�pC���511+͝���:Ն(�и�̩��trC#E�ա������8�����1�i��=�	V��޸����݈��`}
�Y6�g� .��_�"t�WY�CJ��J)��\��U�5&2���hWQ�<�.1�]����l��H�|l�����5&����R��Z|iq�6��q�~8
�P��+�'^p*���R���O�4� �򄱇��x�LT��%�p��PGG��w!L����|�S���<�
z��~�c��Gn$��53KV�-بe*�>��u'��knՉ+�WWw�c�ԝ���#<V�pc��s���]G8��=xˋ}<\&�
ʕڽ��5q�ݰ�s��v��S.��3�M}[_��-Qh�Z��&��*��ݤ�6�uf��a��jܞ���G�F?�T�5&�@+���G�tv�~���0C�����G�.��8�H�[7����nT�.[��V��Gq뙈=�"�N'L�s�Ǧ��t���'��/���	���T=*Ҫ�D!���p�ˋ��1dpskb*g��m�W#F�a�'u8��U�r�Yo��'��G���J�z{����ǣ������>+�y/�2&�q[�ԧ��z8pC�F������ as�J�$�vฯ�%�������a��Bȇ�}a��/�6R �`�l���p��mD�w�u��� ���-��,Y�kl��WY���ʯ1ȕ_�DKg����a`������H�;Eg��r�Rx����l�'rN��|�����xxqw��Cx.����g�9����4�T~���*T�4߳Ae���)��	��
��T3�i0�#��X�ؿͺW#ay�x�q�	ԟ�t@�
;0p�[q�vo�
V�#�b�y���u�"�l�
�?-E"����_x�������7��G�ñ����K�x�<���#��ǌ�I�*ka6/���� �a��eM�$�'�3]������m��Ì�I ����	8��X?��`�ؿ��A�������,�Ϯ3Ί����#`��U��DCF�d��25��Q�I/�؄*^d�/����f�����uȧ^��s��d$�NG_Z2x��:MfD��{t���l�R�avyޮ�M��E�a�&qwuWB*�0[�~�v�?6x�Ԋ��=Y�e�z�W�U�f��T������nrN����!�� ސ�j/����[�pS�cڥau�F
M�H���jA<~	l�7�⸻�sT���U
��[�V�<�>�4��*_ܷ�cZ-}՛�׌����Q�^#�b�|��i���J�� ���L������=eD�:��m�����I�Q��)R��!��+�����s��  y@�M�9_PjA���f��&��
�,`Ƅ
�B|Pe�����5��tJ��ݔ��������*sYblc�Y~�Cr���E;�I�(N��(~�
���90� II/P��	�c}U��rn����|_�Qx4�n��t�&�����p0�L�}O$.��n`�'"W�{�y��Or%��(~K���ڠ���Z$xĶ�P��.������CB����@�.On$&2\J���������{3����ey�"�+�kB"�����Fs� ���������ټ�J�r,�,�˥g��|⌂�6����Պ⎶VE[ٌ+�o{�6�VM[��t&�n0vq1��A6I��������^��Y* a�����ʔNV8iZ&VC_���
*�&����bG؞�_+����
�v���ْ�]v���Zz�>-r )Ʋ����S���d�H�- p�;["�YpPH�:����$נּ�$�,q��&���r?y����B��e�R�Z��)�
81}ߩ��������x>����$�~<������g�:������[�v�Z�����*�|If��84�]r���3��?,Q���-��V��F��S�M�'�ے�������>c5ɀa�o	P��L�9r��[����d%����﷒o1����^?<!��z��E�ý�6N�BV�-,�q�i*<L@�%{,�J#"CC�
���a��G��X vhK��=`IX��[r��W�5��e�x	ˆ�V2x���("�����*() �~'�̨~>���
��;�[���k�!(䵄Q01g���J$�$7�d��+[�>[�0��a���Q_&�<q��	5��_�@k��F_2c���߽Jڇ��������,�i�%�x/��W�^ak����a��굨�i��s��PH <�&c�o޸���ݗo��qm��/����;~�ևB�������`�����{�V�a�ג!�mu��+ЇZ�p��⣢t{o�֏��
�^�>C���Ԇ�
�K_���b�[� �
俬�����R��@G����u6�ݘ	�a�9���6'��MN�;ڻ-���/x��XQ�y�o6s�e&Њ���GdG�l1�)�yN��C�_��r���/��l2�gx�l���B.�����e|ʢ>e7���?��� ?L��B�mQ���2),����I��?
�YțB���-���@�ůJ��k-1�
QA���b�1�����x=�׬�0]2E�xWZ��K{ 8�� �xӭ�������P�ɲh�̞�f}�����M/�Vl�Tg��+����/���K��9��s@�r�����a���Cyr�s���e��NH���
�=δ�^pG��j5�չ#5SF��0Mg�}�|m�T�8�l��E�b�à72���V�(�����Wk�FLQ�z�zl��F�����!�r�0_��-36ddY5"����]�E���"\����ص5k�A��m��F����;Z~�x�ٺ�iX}��4�� ��s�%;�� ���~v��<�db{�g�f��ـ���;��:S(85�� B�m����4�l��6(����C�c�L|ӛb�n�>E�[��Eʶd���h��B!�xw�L���S/%�5q�~��ݞ�B���Î�2c@l�i�t��7�}j��*���5�-��W��e��LQ#˘M�%�ݗ�i^�R顖�gc}4�d�Gp�xj�I[�;Mk�-�X{����h_��w�;E����K�q���U ߅���h���ё�Xu@3'�N�i�v�3#��~�k:r����^�~��p���.��Sj�5^Z��w�;�h�?wTeK�SmZ�"��;_!?��z��n��v���h�:d>�^�z�(��SPG`�\��u�q�(Նq��nfv_ �P�V�e5��¼)�3�XΪ?�	��
u�^�^�X� 
�+˳R�p�Lqt�RW��ϕ�D�=�HH/g�za�>�2F)mL�X��)05	�s���t�����22I@" q=>Ղ
&��c��jN7-�78��"�� 4j�'�b��ޥ�!�73y\���:L�.i;��nP�1G��(" ���@3/愦cL%�;=�+]p.R0�]R�/����U�Ǒ��\�,�*�y7t!��/_��ߵS�͚�\4�+w�h��R$�@���^>Y��"�n������p����"z-1�<���
)�͇>M�y >k����?���.��\����K�_�~�(��O\?�����I��ͺWe�+I�/
�ʙ��B5�@���K��ר5Vp�i�.���u���kWz$�x�d���v�U��`U�8��?PԎk,2�-w���P���oV�(����ͽv�_9;S��6,�~>�N��zb3=((�hg!�2L�0���n��ŴyKX��+"\�\���Z��L���Z�	M��4�V�|�Z����zn��'0�T5����`���傲�W�qX]n��b���̺��]�i̮�i�]����K�31�
�!Z�\`��v#ն����W����ix�X9$������xXC��%�8K;�~vX�{k�-��Ú'n�5]v�����
��蜢9���<]�9��ܜFyn����  �� j�}x��{��ԕ(���S���N��K��W�x�f {l������Rw)�*U$�����
�a2�dn���5kfq� �!���~����G�{�s$I�!U���A,�U%�<��g��ބ䮅��/�cr�X�W��?O�N���쁳1oo^:�z�j�T}w��������ڨ�I������[]&=����îӭn��}��w��:���q��㓟����ޏ��V���
��V��\![��u|�}��A$��]o��k�����y��i
.�2`�3ٴꣽ�d�]�L��4��!	��cìv�����Wݭn�F
��V0�� j�T��;׷�?�l\�
�'-���1<���j��e����:������'��jEk��0O��a�Ű��v��]v��=����5Z�hs
�eW�~\Z��� �h�Z����}r�wn��V�q���N?�{#��뤾p���8�(ٶ�Ʃ�x��F��4�4-�ɒ��fiP��À�Lߘޘ|�X��b�
t�w}{dFf3L��=|Z� ��J�����'���Gi��^qb��������H�G%��ۊ��ߑ�;X�a�"�D���������Je�l<M�����i;������~���-w�T��66��傲B:�0��݃>�%�m����@J�*�VFt��Z���ݧ��h���wT�g���<�����!���9���/��;Ý��M�Q&4VU�s(_�X�8XɓOFM>�c59x�5�ZҗNl��z>���!�����8��v�x��}�se�g�}���=oW@����ן		�:��O`z���y;����н���o����ݮ3$O�)�$����;}�ٮ���:���r��a|v��CF@������]����gˮ��?k�bt����|�p8���`�NuFL����
�v�Y7�rfØ�^�J��M��D�u	xKÜn9��ʹ9ӱ��l���IN�S��c��wcn9:��A������/�$A��ܜ^��%ӷ���������ɭ�[��|1�?�5�trgn�Ps�[������{���kx���k��������y=��U��`,0Fq?e��N���[Ȋd!�}9������L��"���hџ]E��{��3s�R��!ľ~���������{l�\��c���_��ݠ�C���5�f1������1��~W��vGv�
���m
t�#���.]������:RL�� Xt'������ُ����d7�So&0r�;$�I�^d�B
���s���/8�a��G*q�2R����o��:f��q-�g���a��	.�� 7dy^d�$� ʿF��d��)��/J"���Uw�����e	ߑ��س�����
0(��2)8�b�i�t���au ��K�Ƚ {� ��ɟ;����6J��q��ss�;��9U@�iL>��'�{��5�6������>��#�Yp���6�d��=zR3��Q�[V��<��%����[0��J󑉃�/Vn$�Sר�z�$T�;'|H9�.T���6u!�Q��c���U ��t.�J^�u�7�� ��dˁ���P� �;��u����v�����C�@���;��#f_ �캸z�W�ɶ�
�ظ�n��v|��K�������Vbb^��*���1q�j���]+�&
���N�L�1�o���)�}����- !���^
�ʍ��L�z ������o������o�[(ԁ�)���[��_� �%=��3؂Ӳ<�Y ����o �}�7�=��i���� ��o������9�կ�4ۤ��%̴�=��"ê� }
t(v"[������גR�p�VW��f�d��,ƻ��2YdN�= ˩��adm6�e6�e]��8G�,F�*�0��j�Ci ���:T�[6�����r��`���('-*>�iX��gxDs�Q4���s����*��Bi�T��C����y�&���|D&#n����+��Y����*R�w�"�F]Rk�`S��y�>>������6<���i����ҍ��H��6�V��m���d4"ǋA|���p�g6d�#�]W���p�m�$��w�e�+�qmF��)�!U�h���|$���K@h���=n �v�BP�qj;N�<�K��s�g��%��%$N�v�ţbw4Ȟ�cm�wv�g
ȆqP��^ݬ$��}`��.�
�O��L���g}������bh%�T�鏀�@����B-���1�5<9���6�x��B�F�zȶ�Zfd��]8�Rmd?���$�eDF�I�;=Rq`�fe��	��8�"���x0���J菝b��9��5�pE�l�{��O�}�+��I� �͹��.����LN�v1�(qTㅦ�{�����d����6��o��|k�9�U݊�T�01W��=>��*�L�V���'k��-���F_���ft@��z���y��;�:����N&v!�k�`G}P�0�v�O��\tc�M����݁�W��z�s4���	���z1�ċ�7�^���:а�/�������CPټX�U���z;�Y1��ȺV�;�
�U`�����Q���,����|<��:c�����M��$�*vn��VA��<k��EAS�h4�i��,-�S}߱��d;� Hm<����e������6.��Km�"�v��z��:��c�Al��������v ;�c��t��w݀��aZ�93-�M�:���T�s��{4��3I�z�-��9��e�����t�#�\�Nc2F��:��	��q��y5f��#��qbj)<-��%q�p�'��&���#,?�B��M�?���s����v�n�̯*6N�^�6|����C/D��v���A�
�Mc�	��ٵO�����鹸15�@����Z3���"�'�3�ͳFBY����8��	�𝾓z�͊ڒ

���ˬ��Z��7�r�5��mL�//c�a�1����5��
&Z�v	
�v��5ZT��AZ��.�+,�$�.����%�� (�RV�x�V8j�K�������A�(>��e�6��/�O��'�V }T��UB9w���Ѱ͑����&�}iI��l�M1���.v�Co]X���UشUV��b�9�Ѵ�N�:��eY���U�9����6TI
�ö�+UYl�8��r]�K.g�������yӦ�x	��c��pa�-�Mnӈ��y��[y��$��1Std�P����>wL�^ʱh�����ς���$ؗ��ig�n�5� �/�o��o�w��0B�K�y��C�@n��jꚓ���J�$�=G�`��[y��a���q<h�N#�kR���l<o_�9��.�'������E��a�m�D	��Z=	O��}�0(Y���k�P�{eГ��N�5Yg[���ʃ�7p��¾B�{��5�6�;���{����^��aD
���W�C�f���5匀�������
Ord��1�Mߛ�a7]2�jfP%Ƌ]�w.A����p����!�����)��|�wg�q�P>`V
�|b��aPӹ����k鼳����!�+v�� 
�AU5�['%�Q�r��ԋ}Q���熒��}��`�+�p��>^K���;*"x
\E�=�m�<
��Hw�
6�ѳ�~
vg�~Q�砈�}��㏮���K�Cކ��n�v��
`wt55�)?"���=��|�{)R��)S8:g��ury���w�a��}R��"`W��H���?��X��B=E�
��P��V�{t9��B$�z��,QV����A�D#����d�W��oLNS��$ao��.�'�Gc}<_�?�'�^�x��+?����� ��P�	�)�:\Z"/y��9�oo�2���=��p���B�ǫ��8���w��FG]���:Neis���;�vI��C3���g����7��~0�pzkz{zg��b"����H-�.��;ܩ=��f;��S�V`�Gsf���u�*NnN��I;FS<�9���;hH��j��Y)Y�\� �l�X�a!#��btLE��k`�@���ٛ���n��C*��s
��a�wh��C��)B�}T��v�7�W���뢞�O/��Ÿhk��c�<>��t�_Pӑw��F0^J��q�W �2#����0Å8 ��ƕ:�h!1��1b·���+r*�?���R3�?~���F��|�]�$�.�2�]�Η�JmRKq"�2����:�Qz��:���b��r����;�>�({�ӾY�$�R�����
�:i��g}�4�>N��S9�P���*p�p�O�9C�fd张�1>B��K����T��p��	9�ܠ�,ʜC�)�����jʣ:�����#�Gm���
5+�k���o���h𳡥� �'T��ˏ���b���Ђ���v���,���)�:�����_���2�)�P6�]� ¦�O�>�NK�ɫ�IӶ���2�SL0c~քڂ��/QbPE.2�>>Η�7Z����޺[�Ԋ��S���&3��<"u|
T�
S�� W!s
������M�
d��'��d�+i�+���'�a��dAm����ټ�߆/3I��j#�iF�ر�:=�se���C��n̏�et�1H��]��9R;��
 z9�a��c���~��P�U|xG�gLNg�5tb��
�](�-��u���i��ʔyю��g<���F�,t�����		���G"�]�,�'8�����3`VS�@.�aB�R� �ʍvR��1%�>K<E�.łs�����&��=bp�+BdM:�rq��g����r��Cϔ�M�h\K��`|����'!Y����՛J'z�9
��H�/g��p�6�������yPzC�c�4���\*�1ǤJ��98^^�=P�:A�wG(�e�T:�\+I�����s�O��HB~�mVm"W�H�����ٳo�EY�:��{١ɥ�,`1���.��ޝܛޠy�ޙ܊�p{
BM�<1,*�ޘ���ޢ	�.<wV�q���K5����H�#�oC����o��$�L�I�@��C(ݿ�: H}>�i܅ǩ�v՜���-���p6x��<M���P��/�`�����ԣ��"�5�|�����j��h��\={�"�r�Qٝ��@4|��B7H	�/���͌:�މ�6!z �n�o�����/�k�j&MM��O�I}.?�4V�_a+I�/�bI�������ɟ)\)L�E���AGv����̦<�4z����Gzgq�|>���!���+�mO4�C�W��\���.*(.��8Q\l��$������g�iL:P��w��
|u�}��ȍ|�t��J�3j�;:ވk���L@���F�p)�R�k���lf/�!�;��*�Ծ� x�z���rn��k��0��H>pmo������OM	l�d�����Q�/�s4I
"�P�;���g8?���ћ��Z������7���y�p�=����^�	��5�@s�#��&&�C_Ux���(N7���܄�o#���doL� ���pR9�}
�똅�����KRy��p�o�	�x�`�vT~v���&5f�S���@{�"Ճ�P"�i��z!�V�
�ݓ���ޤ�3ފ�\��f �A����qN�)H�sr�V�`(����a?���{��p���T��"��y,�5�N��8����=�#��c�B�c�~�3PdB�B����� ��w�\�H��?��mr������k�P��o�se<��j�p�J/F�Sb�'uA�?�w9�?#n YiA�
-g�����V���~ќt�,K��=���0�,��Ѵ�N��R��L�����+9/�$rN�i*�
���	 �!����?oѧ�G�V��?� gZ
{� I������������f�p����61૽��j�j/��i�MOUl!��e�#I�e\) 3�Y����ޑҩ��oY�A��]%<3)xa��i����Ӕ
Qx+�L��Ta�ѩeBl��7l�h�W�S�ETH��G�mj��H��q�ǜ0��7��:!�'�S��=��r�>^M҆������==2��A���}�SȌ<�iPnЙ����X�
�g7��_$\жse�n�:	��(SY���u��ĩX<�y�+�!\�"Z����K<$�Va��.�x~�t_.Q�l��d����.v!�Cc�h(L���u%�.�骰GBb
���Ȟ@i�]Հr���H��^$�BB�ѾQ-�=��V;�f/G����;�Z�B|/�c*�
{��U�&��B�
g��M69C�6:ӳ_z�0��=�4L�X�c]#N��X����.Y�U�1��h�c5�*l�ؐѮ6c�ќ?��dJ�j�qi܂�[+��j-���a���_��3U �*���鯯ݱ��3�L��CZS�T9�#OQF�+#-U^8Y������ΫB�ݯ���_=ƣ�����6�q�<~o����³�>=���8By������<��u�[49�W,���b>�]�$c�����f5�^� �vH�w6��V�='����6�̧%�&�9M���~�ѼJ �C�����O=9N��x��?�_���ǿ=0ly��s��7���|�ǼK-h�uÛU؉s+�a���	Q����j�o�"���g��_>�CQ[nz�����‷��;�pN��7�K������\P��TZRF&�h��fx@Ur�\Nq�	 !�HZa�T{��YTp�u��]b��;CǇu��a@�$�qRn��qt��]'Pj��x����>�!���x�M
B��N��~~��@�h���~ �h��:M$H�����޼%�Ħ~}]l*�&���g�Zf�����d91�F��RϜ���ɝb}QQ.�It��>�<��=�8r�X���%N�_%�}�by��R��=/n���Hɀv���Ptg��~#�-���Y��_�����"F��D�Yv"�kI;����=�T��>lp�M=j)�+���k��SY�����6�3��J��Hǲ�&)8��o���w�k��!��*\�ۋöt�1�;Q��w��H���{-��c#�9vF���dx;ʲ,7@�KJcYb������-�W4˲�D&N���(%�W��,���� �ڣ�XP��.�<9������41K�`݂c?��GqX�f �{e5�'�b�l�-K���=����t�B�l��$��Ö{�<�#�\<���x\eٸ;`A���2����@H9ΰ~Y�W6f��{�Q�H9�F2j���e���:&k���b����+F͟-�l��'6��wĦ�^��q�q��;���,J��q#ȋ�'�E��@x����K^Hmj<w�,X��1mS@6��[	�Z [٩��k�C�ڤB�9��86�h�d����	e'ME��y����l��.�\'��!���]�c�g��v��?O^�) �/�������E�m.?�������"��`V�q�"L	�;t����a�P?���1V���L������ �(�K�Y%U{����:.G�'�� $��_1�#|�����F��&k���ƹd���a�?�:A%ޢ���Ƌ��m�F:SS]NZZ6��k=[���g�m�+��
����\BG$�Mϛ��8���ڡ
+���0ǅ9}7��Z2��h�
�3�P�a�M��<a���p���CQ
C՝C%}�R6�N�;='`�R|Iԓ~��~t�Gr��(����]Mu�����Fs;Z��9'�Q
ݼ�tL��p�@��EŞ6A�	����A��J�	�	��09����h`(�O�p1|���(ݘ��b7j��5� T��>o�S>��m�T2ďR����n���pE��W���}e�My)]����9Y�xn��j64xq��i���-��jf�Q<ڐ<������	��)����E�|$�����uF@�E����H��b��z�����t���+�Pt]���O��6ry(�.Y 5{��?J ERK��0������t���\�	�b&y=���Fΐm�s�B�SIܠ�1�A�Y�o��k�d�	X�EY�f�ͷ���4��C��ʈ.���K�E�@�
PBx���)�-��<�!��	Dc�ty��")Ţ�E���>�NQ�U�O.�^�D�#�2NAM�q���մ?��ܿ?ɍjL�X>X��Og^(�a�FW1�%��V#_��B'Q9b�a��(�)����J*��|b5�z�X�N�JH��3�/UC��Va�E@�+�>�
��<�7u��W���Z��bÚ%� 	�)ΖzU���(
ʢ�E�ˤt�R[��b��R��3
7�����9<��0z��ݪe�����H7j���}7�#�M[��!�/~���+Qd�7�U�m�c,�0 78K��K�R*�2��9��c�W���m��
�+-�EsŠ��m�V/�=+_����3T��g���NlZ���7p���J�����\\���F ��p��X{�r�Vk?�:���h-��k���P�x)�L̓rn������ySoqA��Sk
�5���:�;�*�P�޸��W��P�i�[ąr�h[�A៤��|ʪ.�ѭĎ���k��GI�l>܊�S�i"�� ��@`�}	��i����/^��*���L�ԺЕn���X�w��=E�!��5
�/Q�R�;��@�p�����^�!��#F���ã�����)����d~� �S��)��N�Y�wִ��3�)��A(X�4_�]]ۿr<��p����O��
K��`��S�b�L1o�BQm��B5��,��Jʴ�fR�~Ws�9<2䡀j��`m*0�x�|��Bh#3��p�7�d�,�KL�u���[�%KW���ۇ[l���9Z�e�� �(���y\A�I�-�xBwǋ�ȿ>�`�3�|�,�+�,��:��O}e��8�����+��d*�(���o%�)Q>���^��ċ�_��-�#H���-S!F�q^$e2�o�� Ӕ$�������3O=j������<��, ;ޤU�0�JpA����W�t�s'�JB�}�Ӗ�����2��1ͻH:��mn9A���ٴŗ}o��/�Îb���x7��+o|+�T���*�ݼ�Xh�fͽ�b%ٶ28�P����0+���;��Կ_m��*+�!@�x�~���#���	jGg�flo�H�e���F!�]��uIe��tw�.O,�**��X]N!Vc��(S\����L��$fƸ��t�o�+�t<ŗ�ꅋ/Ivt�mY_�Iv@�>�-����;t���2��m?O�����H��~�Z�9��(ɮ�S��3�.,\���%�!MWQ�0�>��SpV��>��μ�|*��S�KUz��KO��+��ʝ��������{���`D�4	��E�nCũ�"�
� ��}�7p�����/�TU�����]��
�MSU�I-��,u���¼[d��|*Г���U�XR�l�,�yՊ���U�*���^��d�6y{�tSţXɰ��a��14FW�N���#�N�>YA��.а*MP�0�"U:��f�ЮKo���wa	z�?�,�l�,��Ո,��J釓���X�]��tVK��r���R��3��5"Cvk�
��(����,;�=,R��������
�F�B��L�<��E�O� /�3}���Q�w���]V얥
�˰�;��9:�J�(���:��u}r_H��/��^Rw��P����?�FF �&K�q�zOV��&��}s�9ŭ����x{zmz��s����݂��2�4���X$���>FY$a���U|��Z����z������|�^�ggwm��bgG�S}�_�]{��w��-�ͽɟ`I>%��ӷ����nt�:���
�j�
:���n׉�]E3,i��w>�y;O���M+d�G|���m��G5y�t�u��	D�OXX��?��ng6�m�p�l�O��ǘz�S���oF��yi��7Ãɧ�n33Tm�(/�.��3Ɍ����c��|�F�3h;�V�8#1s�5��}����Ά��e|T"1�s �3K���glqrG��z����Gw�	��H��g<����J:���6�#��A�D�Q̠G�G�:5��3�'�Y�Z0Hmdi����;#m�(j3����ڴ��yB_��5_U����3��Uw�Y�_��U��?���
��i[�X4� Y���Dg+��p����Я��j�.�L��� �&@����=O��8䛓{t�������0���LA�5Y�	�`A�{��C3B!Ge:���}��9Y<P�$��'S͝����g?��/��,d�Wf�A3e�oa@�,��@9�(gtmX�-ϻ�2M���Ļ�;�%���cL��1	H������|c~�aT,Lw�Aǎ�;�p��k$7]ش�=kue�L���g"��P;���%f�`�/�acѲ��?^��\�Uo�9ں=���X�}o���G�l���k�Μ�S�Q��q�}K�W�GFY�ӂE���/Vpu�\u��g����:�s��*i[�y�u����ܨ��0�l82��/BS���ZmͲV�V_^���U����J��Vk�_i��j��S�r��n/�?���
?��֚�+���Z�^iՖ��_|���n����f��Rﯮ.�m�����:볶
chԬ�^�vOh$4W��z��\�﷚������Y����. �uugv��M�g�2��S
�X��퇼�Uu��:�{T���̟�x���LQ�,2����̸��o��W	�Z���.R\���:���/QZc�䔱*��Np�R3(M�²���b�X�Ӳ�X�f���z�U�C
U`X��!s��%4Һ��	�A�ж;t��ӝ_��RŞ2�nH^��Ĺ,&ycebr��/�ye���ƺ��Y���;��\��&�gϚ5 B7��2I�u@�Ǔ�o�/��3��Gb��� B��u�t�P*�h��$�Y������r[S���9���W]Z�bQ׷w�у��C���[s/���Wᠺ�'���IV��P%�}���4O��?�ڱ�Tx|~���vQ��~:�h��(M�ؠ6�����������\q1EP���}K?�
�;;��T�Q��
+�����n�ٛ������:-�0�����:0��nǡ+�wNu��-��"��$,Z����<_p�Ώ��*�8�!9���F?�O,�DYXd�?O`�h.�P��~����IF�#�78���~��N�l+��Ј��8��8s:�t��o��3O%M����)��Ix:��p?��ѳOa<�Q�y<�����C4�Wm`ӆ;�9�z�.�#4��`��p���i��t�s&�:�-w��Y��8
U�
op�j�6ڃc�e�3X%��=���ʀ���'q9��$�y)SZ��S��ަfsdo����ȩQ����`h�oH�	�g��t�?�|�p(�e^��/Qb������Bl7�q�V#_������DX�dl���s�b���u�edB�7�^�`�(�.C�%�@�;y������݋�mq���r�p��r>I�M��T��yhƃY4k��R�Z���3���nO��$��}���q&��pF�;�5c��Ѹ89y'��@0_חh%�4}Ν�����J~������>�R�~�;!���+?&�P�:;э�&u'��V��,�j(�e�RA/3���GW�D�����P�i��UؓAu��P^���*}B��v�o��ߗ�e����֮�
{�f�.��sp�T�M~�(��av�h,��k�V�4;UZ[ .֬jc�����Ҩ6�H����j�7�@ܭ5W��V���b�j`b-
�V�Uk���"ʺUk�����\���v�����j�juhs�V�?��6W��:nWᇕE|��_�(ඪ�
�-Va֬�E���ˋ�e����ju��\^���hk�z��7�f}
�����U[[�Z���
LY~
F�
chB�  }�\A�|����𾶈��a�~X^��4i;0kh���i�ڋk�O�Q[^���fu����L���ZT[�Z{�Ne�ڬY��*��{��i�Z\P��`r�d��7��Z��b�~f�j�
67ְ�:XWh�� o�`}��L�
�@�U�D!�Z���W�-6���_Ñc�k
���) �,\l+�uoX �V��Ʊ�C˭��
kք�{֢լ�|W1,�
�L�q��M� �d�n�X{��l��נ]�f����F�`Ղ�6Vp~k��. ����[�@�k���Z�q�&G�,ӕoX�NM��Bl��bX`�X/0�&�F,�b�E���_�� e�"5n�6�$�4�9���2`_PlUG0:�~�h�V����2�(bJ�n��@
��� ��"6O��PG�jY���#j#ank��a�",�a� ��Fuu1:�E[��'M�� �|Fm��O��{
��D$��l�%m0�^���]��ŷ�H`'�q��x���Ƈh�Ĩ@�T�c�9[��� �rZ��N�!�W)��EX����� (��w�U�;�
F�Z��ׂEYA��E���-%>� �5N��Q�˴�
7-L�x���z�n M ���C�7uX{ n
X�5�� �Ҡ������aY8�N����� �
�+@ a�����a��ug  ��`k�h�˸i���XH/p7�4p�� �0�:P�&�A\6�>UR─��~j,6�9a�"7Q?�����
� ��+�Eur�ۯ�ɶ1o���U�rF)�@*�eƤ'Y��!-H��DU�ru"����2�,�<�e�j^n��~���{vX֐)X K�n�+��W�SP�"ދ��O& �!N�JB ��l����QFv	�A�,�,�Gw��򝗟8��I~�S�Ym~��|�Xs4�ƾ��H:9��B2"{C��^�����H��êT&iV�԰
/�=����V���Y!Y���3��d��jBݱo�/(s�V��T���-ӠS�@�����I�TZ(f���F�
��6��S�"&������|
Ŀ�R�C�P$ǈ	��j?�!�k]��3
4�@YM(j�C5\���.'JU�u��q?ێ���#tTO����jL6��]�
(lw�@`]p_s��֢ϊ������r\��K��E��.�ң�������>���HD��s��	܀3 p�9
��SC�
á-���-E�fR����f��Ύ��6��'rW��M{G���t}�q���TI��	_b�\U��3ګ�jRN��_AMu�bH$�����Ϫ�������B�N��Hc��� �}�UGar�i�] �y�؈�����x�*|-�*Am�n!DS
P�d�����B���h#�.���˨�n�#R�Ebo�X��Y���]���Ζ]a����p1��h05U�L2�'������fE b�kd����j��ヮ�_�l����S��;��d�:��7��y���Sz!��ۅы-���z.�cdo��L�bUZ���8�O'PI,h�s��!�re��Jm�D����pA��G�%T᢬�x���I����f)![X��Җ���	��I�nqj�',�F؏�� �F�E���Tl?��m.�^K��*�+�[[���-�6�nYZ�p�|6��	=\q�� �������&y�@�Z Kl�8�blnį+ t ���y� Vd$�4�'��q���0Y��6'pH�Q:,��s$�m�T��t��D~���ѬC*���G�$2���[�E�(��51��G�G����,�sK�$�;p:�m��T�t���n��&�\��]�m��o�H��R~\2^3zg�	w��3��E�%|CRh'gq�������bZ.���|
ҧua�0�	u��&ki-�,�
�M���[����[��5���)�w&�	}��nD	?!���U��Q{ld|!0� ]���&&0��m~
��xm��.k'w��W��O�Y'��_��^���+Jϓy�l�8Έ�h��L�b�����S506>�
�&BA��6�+�A�#��fj��oټ$"+;J�o�g0SRt.����2��VX=���R0�?��A��+̈́޸ӫ`�aͩ�4��Gň.��(���'�����ѰR�K��^,�J8,Nx����M��܀��Չ���t�ފ�SF�h#y�!]�@�bIs����2�� 3��n�F���g�l�Z }ϻ2I�F�,��^�^6���^"1@P6`mF�w�tɱ�_�@���ccTE����o�9ɸ:Y��C%&�JP#߹�z?�s>�lG9��
;���%ТV��@5qoWٞŅE���g��V��cۣ�`�=Ǿ�O�yc<nA8��m��h1R���˔��k��燡�
�������.�_x
���"���<�Q-���)�5L�&��~ �gG�;p���kS;���Z>t�q@���Q�H�G��3R�`����y�i���ҏ��'�-u�D�H�d2� ��ƆFi`�&c)�uQ�0Q�*�*P�=#���(�2n��e���̴q�D~�#���a�1�*�'q��B��}\�NJ�p�;���6# ̓��Љ���U���r슌�4RkF���x�K0�
�1~�s�� �<$]�	�O��wT�J�����]t�����n$�ф�8�S6��fD%�8��i'i���L��'<��bί̷���b���Ź��Q:z_sWwO�N���K�R���*�X��PҀ����֧L�ԟ��b�J��d��3��^�-+_�"�>Z��~̘��1/�TB<ﶕ(r�/�İ]o^����Zkgk$�$�H�$/bY����봎��蘚2�T!��c�#K/��z��$���Z���*�M��r
�2zJ04����z�ɬ��A�5��?�h?�CIZZ� �F:k`��A�Q<	PE��O����0�s@%��}�?#���ȳR�z�!�)����f �v!ڥT�1f!I�y�F�����P*B xϙ�ĉ�I
<����v��/Y��������s�JO�gl���R1O(�&p�L' 'Z�B&H"x�@-Q	��G!��Z ��#>�!�&hjh<����#��d�]+�=�{@�搜
1�����\�kr�gRI2�E�0:0s���"�X1�u6�}��w޼�ӽ�v�$�o+_<��ri�%�>9Il�������De&�e�*�s7�!KUv�1�ò� �yv%Y�����Ƃl�8�xEŲ����c��C��D��M���(�H�!aF(�U�!����G4g�]h�&_�p�l�(:��k4��]��ի�% �%ZTyi��,c�����i3�s\��Ų���i���	��e���¢�No��0O�9�;��GTɚ� �G~0���VA05D�fJ�$����B]�X���ܖR�^/4S�p�N9���>�l�e���bL�^���(�L�*�f�\U��z@�DjJQ, �
��%��'d��S�jq˰�l�?U-E�ϸ(y�p�Vנ˵��STo��L��	 K�RF� +W��D�v?ܘ����RX�	��	���f��e����3f���d	ը���!Qy��:e�1��A��3
M�A�TNӕY0�A(
E�"T�TkG���;{�H�m쌁jF�ز0����r�c�����2�&�V7W�<;#��,<�}�Ӥ[���v2��.O�c��{H���{
0��bu�m&3>�	a��{#k�C�!�����t)�E`���w9�~��R��slG�n-��Rx�f�0b\z��}�J&MU�����5w��`��	� �h�e
ţ�-���Ne��0,��g����5�N�0�������t\�W��E;��@���	�g��W�]"������"-�}_S��j�w!DSpE����^�:5��"����r ��&s��HYŇ1%#F	#Jm�T�.E�ԦU�&���*�u"4�?��mFRx���M�~��VO>�`�uۇK
�����+�Eg�3�fO�,WD�DN�g�ѴB���5{���j��dX���^#�}�i�t��HVM���F�S+�K���n����%��������\}+�G~c���N>�U-@D��=A�ERp���#_��!�ΔA��\riCog�����V�K+g����kt��U(
v��C���T?�l��E����B^U�E���j�ξ���K?=w�/�p���_�����ҿʼv��.Reo�@�� �;�H�sx$�s�.�"�#��͚�T,i�`���(8Z��)��Q�V��y�71^4�5j�b�*o��w.�����·{�J�H�α\�1v�=���!y�o����V�{�F�ܹ/y��n�Ҡ`�-�ʝ}�w�p8�2��Rhkv6��<J���?��Mi��ϩ#���4u�eKo�@e��a^����I3M����`? X�����h��W��M��a�GٴNC5�H�R~_H���M#�6��ڴa��f�
��Hm���.���Z0~J��hɮ��ɮ�(ʮ�ʮ��.3���
?*�	10yV�x�����h쏨����伃o���u���D�c��B�+�^9����Ġ��j�����^=�z�^r�L�B�w�۷ο��e�<��%S��}��ȩؗ�Tipx��~Ԛ��I��6�]�����	_L���$���'/�������lQn�[��%���=��k��fRR�X��$m ���ߖ��dt4B2�&�<��RuY�}(�z�t�Bqu�y���6G۪�
�����NV�NQ�M�צ�����]���
��@Z� a�W��HF��; ��:x�쳸�ڱI7ig�Q���`8�f�N����D8�����o���89v��z�n����N�YqqE]A�#��J�)K�
��}��U���E�ri���,R���0���N�.�����KU����G����n�<�l�l��{յ#��hxH����Z�qVW1�M���%? V����,\V9��6R��X+�$�	t9B=��I�T�h
K�sL0����>k�zy����#~�H��N�rOGi
uM����X91�`���ҌZP�QK]�On*?ZQ�Ե1k�E�F4n͡E�R�=���q�*��
�'k �8;�����/�i���
���9�|��S<�L�GI���3�2�+hE�K���*s1�y�d-@�T��*��k��f!�?��؝�%���/�V��F��w�O���
���h��������[��R�����5��s���p�W8re�	��rSe��v�r�����(��9����f������%S��=�+~����
6��T^�����U�:��1P��:!�oj��j�NQ"�S�p��1!�S~�2pj6}N�"ʩ�g�m`�T7Q����<MZ��ai
�*��e�ny �
�ª��@���	�4p��e��%ǴB@��2� �Ҡ$Q���ҮX�塇�X��/\�q�T�|���Ɵ؃���v��\>�--��.����2H{{T�[$@u�����k��Ħ,]Sy�S��ZM�5���*�T��h�e�"ezx�Ƴ�Vs�"�x�e��δ�SLNGSc\��K�S�2�*�Ȗ��f
G��,�LQw���J���g�����C䓢�˱��n����l����!�J�EI�ȃ�XU�5n�.�Z�̕�q�|�%p�1��Q�zV�S��ae�(KW橸@�s�x�7�ri*��C��|}rG�(��dR�Q����� ��Y���u̖͹���zmD��%	�HG���w;��Pr����MrȜ��^�d�H�2/j]攨��L4�̭e��RI��m�+(�[�`��&��']$=V�d�9�*��^V����`=:�JϷƏ��
���N6��7�U���� W��̀�;7}Q��r��[����w�0^�q¥9�x+��'[18���H4��\���r��� `%��
(��^�� �6�e'�+9�Cv"��Z��������҇pϿ�T�<�toiHC�����CC���s ǔZ I�9>�ܦ���~X
w�Д�	���
��J�l11
���I��P�#��ҭ���)]��+�h�!��〙X~�'���=ϱ�LڧTw���w^�v^�w^<�M��fQ��.�N�+��RS�v�+�2��+�������o�����h0̹�X�#�9[�˚|*�%�.g/
����/pW��;=<p�јئ�/��@�/�`ݦ��ex����2��Kp�� �Pz
tg-^G���t����v�~$��V7�5"[L����O�[Q����oj���k��'ɱTn�ܤt�M����HR(�^<&!!ap�Q%���#U�J��j<�O��Osh��M%��*�fd��x��;tp�����I��f>�\��Z�2���Ӓ$��*���v\����Z�V|�B
�J����������d���,P�(�E���z%�T�@(y�]��װk�@��'v�]3){%O�J�W�̒�J�͊Kɭ8/�E�u��V>��{�Y	7�Tڙ��_�j���$&=K/�d�N�
/B/
㘶_\����
s��ИeXx�ub�i�O��X�����xRB�V�U7є�;Je���(F R��J� _�����:���-��5�T���Jr�r��<� ��`����Oy0YV�K�f*��XR�Bzɕ�R�S�/a	Xy,F�h�h�r��m�q�M�<�cP�r��H��#��Y�P�O��)����������d�?oc
��������
��1�5
^}ɂwv�6�N�
�o
���8<�!��J�b�Zg�e�����/��=��Zov��`��Ԗ'�*��!�����e��J��LM� ��v��ݭ5�cu�A��6ӗ��U)��Hz>M����E�}8�;}�ҡ��]��3�����אr�9}oN����d8���J���]�a	�7G���(�y>�uc�O�/�\�*r���9bFk���6aI_��;����@�������4�=�;/��(�x;�߭b�����B&c�/o����3@`��l��Ge�D��(=611�Sy�T�'k����
G�2�B�֦a����F��(Q�*�$�A��A�QI^�����,�97L����!Iص�X�@ ��,���u�咕�,Jk(�������rf9M�:�8*>M�L�,�<4���P>/=.B�c��2	�.�P�a\�
���%W�0��������t�&��]q��J`�}
u�9���S�1@��L�J?e��T��r�Ŵ���U��ؙ1�sy��Z"�/��\�$�ִ�k�]C��cz�F�D�rV�MI.��y�$*�'��5
�Q�|��i�7��m,w~�<�����&�P
Iԛ�I�8��n���Վ���+]U��]B��۞X�C���V�<|�r$��Њ�U������1	g#��ำR�c�ʻpI7Oz���z��Z�'��
N�E�@�:^����	eNA�I���I՜<�~<�
�Z#��p:z�"�2[C�� �jP�.�kRHyjdPS�<}������Ju%��o�J!�$[�u�0�Oт����}�-%ڱjqV��EQKSU�k�L�⦀f
j#h��T��IrVK�HK��
�S*����v�ͮ���왼u���%?�Cڴfi���I�ެqyp��U�F�u���'A�H;>p6�0�l��Ԉ��d����f�=���i�
p���O_�P� ׭�!�&�?�;X���V%��Z���X������0U�3.��x:�ʼ*ѳtn)uK�DI��Mn�Uɀ��3�nZ'��:���{��)������s�H������a��\���ɥ�B����-�?}��fLӗ�J���FFy�(OPyfgI69�,��X�� �i��������B��Gu�IJ���G�I/����y��ɗ$"��,ǥ$��#�x$���84�-�Q���w-M��1OU�K?0=d��p���$D��%��=!}<�膛�U� ��Hou}n��:ͩD�Y��UJ��L{�L�h��D��غ�*ZP JF�b؄��-�3qRG��a���:�HЉ;���I�@ũ����5څ���8�� ʎO���q��u�#ei�E&��O� ��G_ ��6\7��-&��Xi��,X�X��,#�(�B��m���C�<�j�O9>8�!���I�<�2+G���^�����sy�U�hS�<áZ軃�4?gr�����'�����IX�lNV��I�lZq��seS�H��e�	5XZ�hyׅD��o��z!v���+�EWV�)�3%+1zv�{���@#z��D�:�>+���#��P�v��S��3�0�5D����B�����IY�ă9gz�V��ۊ���St�����=�~��g�)����o�K���̜��[j�GŚ�Mi�:�@�c�7:�߯<��Q���4`��m
j;n�o�/�P�x�%�]_i��ז�+֚�jUW�����J���ܲ���T�,]S�+�� �aaչ�.2����9;�
?qa��}q��Z�>;�^k���bt����U�z�>�����a/�b�;��y8�32��
�,J�+F�6���������D ����`gvj���$�L��mi���l�W����~���'ډ��w<�l�9�B@37<ߥ� �p�-*5�Pz(�#��IK.��Y��?��c�W�߿H�:w�G�
y�9IX��-߱�Ti?��)�y������s�V�s賈x^fNH� {��6-�Q,6�/
@�ĵFC�����q��A#�'�\�SM"K��gf�f���R[/)��`�� �w(�ƫ_
�.F�S�t!���I�9����C��2������X���k|ĤkV�SJo��E)�^ާ���pZ�*$e����v����kA�Cd#�:Yc���efڏN��F���-%�������Hyc��U�褾۬��2v�@�S�4�ȳζ=xoL��XO�s�G�D$�2��U�eM��e"����;NwBijd��g8�sE�,��B���
0�I����! G��<P��ī���/��(��]�@��a���/���P�Qz�f>m~�L��lLڍl��ҳ)�ZN���E�?�)u}Lu��&F�#Y��^G��͜|��K�Vx�]���xa)�\
��r�tc�M鰦�� S[D�g�sr�}J�d��_�����p�bIC�O<en���T�z�)�]5�>�R�9%2&"I;�)ќ�� �M�~�3�h�" ;���m�W�PM�����{�X@"fO��
��n���Au��x��V��ݩ=w;���8V��I�=��]� v����GĮ�|��h7�Į�9%v�~��?>��]Gډ&���ݡ)��&w'�1����V�V+h��R� ���c�1{�Y�6�2��RA��c~S�4�n�Hg���ך}n��NP����M�� ��d$�*�:R��.a��N%}u�
�sa��eu��^�z�2�
� ��6'�*p.J�̂�,�+���З��E�L�s�%j��z��z�L�{����]��"N�nc�i���Y�]�).�wWi��'�_��r�U"�����P�c.��+ڶ�13Oo[m�����<�E��͞���V�hud形w�%T�Y�s�w�̽�)��㑤ʖ���顨�P���5w�鏻7��q�����H��3�M��$+)�㏛%���*sZ��ȟ�94�;�0�gl_�r`������ẻ1�r���(���*�����Ql=m<K�]�nus�F(FC���"�HyvJ}9�����ū��(���lWr�~�$�[�Ə�( �4�:�J�b�,1}
��i�;}]2ڭc_u�͇>�hu����,݀�t����M��	c���T{��z>���i�|kv��'��K�m2欵���$�N��4M���#Q�*uNu_q�]���1�y�i�b�Ğ����q�tyE@Z\4�<��E>?T��z;�����b�����]�0F�C� ������Of�Ǚ,z\Fe��'6�r=����,�=���E��؋����G��a��~�˫�z�e�@L�jFWƐ�`'��y�(E��O���Ģ�A��Ƙv��A�ad�.s��$7�-<	Y-P��%��l��a�hM���I��?�cI9��c��X����!K�����
F�>	~1�}���$�9FJ�|���il-�y�����1�Q�F�
LN�;j*�%�[��H
q�Hݫdf�u$�Q�E@�ҔM�$P<��e�p,/е����t�.�ws�
��O��*+'8�=�cW���3��3)�_%��;�ɖA��|f_��A��l�f�_x0!@� ���<�S��^"�����(��%�O���Q%��Y�0;E柮��@��p�d{�J�_��?�EOh��6M->V�v�a�Y�ϓ��mwحTF����ӖFh�KyG.'�X'�'3�|2�t^�%E-������8���@�������!�Q%����&X��	�V�]� �O�BgoLk�}���
��R����J��i��E���g�<���U� ���6�pru�O���L;R�H�oˤRkb�ów>Q ̲q�)������*�6-�
��j��.�#M��SiB��X�ui�Zyl��3�E���;�����3�ךh�ٮ���"atmO�s��(Wco�C�ݧ��Ǚ8�t`@*>+���iګv6����M�03��'V�t�G�[.lX�>Prp�G���:a�S�a2�ߋɰ�~��?+��� R���D9���Sd�C��a$V�s^Q�@��]fg�`V�-oo^� }�?Әy�~C����ˉ�o}A�\��LF�����1���J����`���
������[�'sJe|P`�2��8{TE�����@�Ġ���mQr��;ؒt�L]��;WԵU 1K=,!�o��e���`y���0Nu���g�P,>��|
�ߙI�veZ�
��@�ϖw�tA�SZ?���y�w|�<0p�ۇC��<|������3�~��_����ɡZO����}���m�z�nj�bH��{�"�=�܇oj�y�3�N =�_��Bm�C����>�x�����P{ �����[��~�O��.2�<��?�8<���͠Cm�� �J�J�0����#�"�<�� 8OYi�0W $T�+�5J���W� k�8Ҍ�U'���X�m��,iH� #*��JR�����=�'�������KF�9�zزS<,��Hx��i��̑����*3M�x"&S�^�3)gT@q���q�X<^p�M����9��%3���+z�\�]v��U"�`Tibx�ئ,�K��9�o���$�\4�gU��4��p>s38^d+F��mAB4�'���M�2��Ax&^�Jc%
��T�Cg^'p��a�$F���$PD���Y}�xԅ5���z���ۡ��~��G֣�q�7+
�4�����p�yK���Bz�lt�s��D2Zf�l��q�<��q\�N��6)IB�+������rz����N�%�� R̢����A�?ug.�wYՄUb��"Rl��BK����k�Ȇ���C�ܜ���7>P����Q�OniL�1ܑ�8}�-Nߕ���X
ꌀ=d3�5繝�Q���
�G�B�
��;
��˔�ǃʷ-�z��x�xk4wN��*�>�a^�}��Y;�a���Ov@�^��/2�"p�:������9>`�+�995��͋<�ނc���Qr�%<Ql�Hj�熓��̅�5)����b�\�Jj��8����f>����%�2TO�Lj�JW{d���"k�PK7�\�տ����]���|z�8���bN0�����׏b3.M����U2�I��P�x\�y����u|�K�/�o ��E�-�F���b;��bW7�
�]P)�
̥`]��!_�+tC,.}yro��}�YZ�VT'V]'�lq�o�;�1��^*��*N�i�jtYA5(v(�7xv��&�D���e半҇ӷ%�N�&l O��m��aK�A���
�>$kI��+WK������e_>,zP����ew/��Œ�/n�.=���h=#�ؗ��x͆-�sx3��
��c^��8�W�\��e�IgNP_�W/<�X5�e�����fj&���W�38�T���5���6��r�|t�;�U#�   ���}{sǕ�Wi!rD��AR\R*[�oT%�˻v]]�Ck��)�V�%+����ĕM��r%�-Yk[��c�� ����ӏ��~� $%G==�<}���-'/��<��y�־-Ci{\-{��e:q5c��Rn������=�XVj$��a�f%E����l�c���n�4L,k/E?{�v��z����
WZaC�������5������k�㣞��W���W�3���t��o����2���M:�+�A�teo���cO�&#�"3�T�;4�<�{R�#U�iַ�F�R����"�VA6�z�r��?0�%�~W����CE�RZ`��R��.	��Ek��Uvh0����R���.�X�Œ�B{# ܝ�kY2�)�Ia��2%f����/?�3^+o�����&���+X�ŦVb�'[��񨓹=�?����˗*l�f1�eVo��q���kw\;1�>�va�?^��<�h����?�{�m��`�~��l�osJ���x@3T��5^iO�1F4%�L�;��Ld
�^��%�ܤ)��J��q��M�!�ﱧ10�HX���|�.Z���E:��l1k$+d5�d�k
n5�N������ǣC%�cce��iu��r'�0ל=��nr4��./'I��NYP�S��ם�?z��"W�0u��8Iw�=�GX����0���H��Yh��;F�
�>~{��a1����=��)M�� �c1�tƕ ���n9&TD�t��~:#K��N���C���e�1zm�D�Y�`���Cg�U(�厒�����in�\�v3.�e	v��t��q쀁ט��<-dQ54#�+K͚�<Y����G�۷+��c��{���E��Fx�v���r7��D��4i۹�F�
�>��wny����-Ƌ�ٿ�!����ǈ�uˈ߅W$ؘ�t싗Zj߳�rL�Z�v��8��8'�匢�� s��S���B�����a����	�N��3��b_�.~��S�����At�V�L�d�|�0�����
7��9����\�l�u��Ro5ګ���ܹ��`ns�{�>(�H��2gC՞���+�8��^��=�P�����2j�BJ���îJ�j��Ř��LvZ���4`Q~J,�5ـ��R�:��	�F�71��5HZcڡXଶ	5��,����S��Oc����Qs�6�q�~9||��0�7�rBl�^�4�X{�M�#���8���1SQK��?#���A��ɸ%؂��Y�}�Mk��M�n���5 0�E�
 O���3�)M��N/�� ]����D�����j@�']��F�X�Z}1O�	�j쵼��5&��u�kt@�C˵1C�C�c�����3�W��4��<�[�_�!��wz��[�}�#V.��4%@�������mf�-:QgI�@#xŃ�� ���ƭ<^Jj��\�DgK�y
�?P�in	�2���~m�Gb:9ڃ�#�y�Bm�%W�,�]��g�A�9Jw\:r��cA�rN5%������$CA�����W��0��'�~|�}���(��޻
��`�=2�/���*r;9�z8������,�!�����et
��5ȗ�Za�e�a�؋0x{�<c/�e�$�{��R�C�ԪY��(�:l�Mq	�K��_�f܏cI���C�I� ��q:$� Gi611( �
�=P�~�S����G6}
r�]��3���[
_��3(�B�{����Wc��Qo�HVX6������F�
d`4Ǎ�i돔����.�X׼���q��g���˭2����a��k\��f����RM�a�a��6�]�����2��b��җ�j��u�	4�c�݉&�?{F�:���E�SX�n���*����Lu|��4�Ff��
x�H� E�.r���(i��1-��s��a`��b��x�A�~��T_�c^��3:%�.��������ҽ����T,"B0���B֭H��^P}���(��Ѣ�hj�0���l������]Q��н�S �TU%��xE�z��]!� F�)˘���>�
if���Ş8:����{��E���_ɖ�>yS���r�S��a	�R�����l]�e�eZ;g��i�����A�Qm�d/}ӗ���9�4a5�Ç�'c�
-r>��ELߧ�Ju�o�:]�=����孳���vt�%�e�8���͛����[�xx��vK��W������̍[�E����iTF!���?��X��aM�7
빠z��*�;�
3q�KF��G]I�AIo?:2���%ia�q�r�nԯԶ��+�.'�E���5#l�K�s�v�1�����j�� �O��0���M��|�[|�ˀ�s�Π/�4��7�
LbuP6�#[%�A�<R��D����s���IK�
9��A�	1��/<D׫� �hkn���X��A(�eC
�M��:�n����P�5ݖ$��#�A�}ƛ���Q7|��xbvc����#�;-���7ꚴ}�����|(���y��)\�}m*;kk,SH8�6�J!��H,
�L���V�xK�.�1#�Ȟ�K�pY���n���R��Í�ƹh�2U�M���M� Hn�R���H
X�L�a)��φ����#-tO��F�<��A�
�E0����K��b��c��9�Y�5�"�U�Կ\��bis�&��06gɸ9K�ͩݜ��؜�8.{DM"�3���/
k^u�����5lǨ�27�i.[i��R>����]JQwɷnj�b�>�_��p��U��n�G_�������̧�����_\��b#��S|��ݥ4����[���5>|2�A?>L6�f���5}�_��?Zd���t�!F��Vb���R3�n;����Q9��O�̮��g�bE	��=?0�@��sfS�~�E��_sw\�M5?Wp1�`m���n����C=����V7��
>v����e"��n����:�*x�TLJ�\J�P�2�q�B��}k� i��\k���BJ�(lA��G�T���_Z�^�Q����<�k���� ���d��}��o��§x��=�tk���OfHŁ�-��6��2!Lç|23es���)	�J�9#p"��2���������#6�t��D�P�cZl.�e"/��ӫe�,�0�Wػ�'�3�2�j��k��X>&�l�>n ���7%�7b��c���`V�]DO��`�9Rr��E�K(���,2�	�Wz	��ݕ�Y�rs���k<�>z*$���\�6� ��|�C06��P�z2��і�դ	���d��_S0���P%�g�ȡ5���	Z�HՈR��h/�2�2���� 駘	
���G�h��z���P��N�w�A.�=�B4=$0��S���\�ʴ{M�pf3d��&%�hqb�H�T�*�Rp�0���N�B'�MS�UL��\��
�9��4�,�ʺp�6��	 �S���fH��s��է������а<[�+�0kD����������������&��y��2��*�p����&�W�'��B_�^~���:|�ƞ���׼�'���ݭ���no��<����p|."h`{ڍe�L�aϓ���_}39�`|o{l�����Y�lT1yC�6�T`��7�s)\v�A�斀��Js�M��� mo�<�s��<��5gt�bl�(��?l�S�6/³Ս`�;�0�$���J�0Ș����^~ز�`��%'%��Q��3��r|�|�Q �I����#<Z�B:�u3_\�C�\
O���p�"�.���t���$�lr���:����\�00�&������x�Q�nd.���&��ȶz�%&�QS7h����\��s6ʼ7eso6�[�[gk�Ϫ�:9��8���4{[�����ǰ��k�����s)Ko��Z��϶�����$���c����fٿ�d԰�E)��h��HP��zR���C1��R���Fߑ�#��B8����1�YY� &6�)Z�0��x��F��1��]!�p�Ď�(��I6ѕ���6��u�'�18Ei
�[�vQuf���ܩ�h�p�
��4�f����-�g����v`w���{�H&�/]��{0��2�������b�<�ɗ���ҹ!��01f�"�\=��ۛ9�[ۻ�
��T9cD�"4�7H��O�H�N�W�⛈�q^��8y:{�68<$�-Φ�"Љ��D:�,ӯ�;�����
�P#?�����R�Y$xnъz�V�%v�j�j6�F����z��`�0{�2mVh�=�ӽ��?<9�b^���Kw�G+]������*n�ڽ)�8](bU��#���f�T:�*��P~��L�q�0�
bx�8�g:͎B��'\�"�5#X�=��)�`�Ǔt�׫x�%�F����#?Q�&�9Ubm�N
�QUp�Z�v~c誎����rq�ꍦ�.��m� {�?'0�3]�w����j]��?�넰i9�9~1�bSa)RU0B�oz�l��Xaz&M\�+:Y��z���V��l���A���5²��
Rh���F��z�Q���~0xMC�9�a���Q�_2�T��gL��9
4��}��=oAD2�(�dمa�2�<#|<8�X�d$KMY�
fJɧ�K@9�tA�X�+R�?5�Vb���Z�Z`�v�t�^��	��
��V
T�  ���4�������i�PN2��m e�b��	��'C�g�h��$a�Ce%���b��s}R��U��E�1,d�h�N�T��H{F�`�kSIIX�����Q�'����������j��D�t$��"�ya�۞66	�S"���L�8�����*�(�tyy�~�<p]�&��D�&���n�)����a�&��Dp^\�\|\&��ŏ�>����Ul"�����;l�z.z�è�-�\
٠���(c-�
�+FӵHs+��ˮGg�㻩LK��X��\���t�#R�J�
���B(:���Fk@k�Z�{޾l�����S��ֶسƱX~��4�����C��4YԄ�z��dSvTG���)�IzZ��;����O,��.�R�K���3#pp�kv]f�d�������q�~����[���>���~�����_�" }���ïѵ�#���C��<�h��yW3X�0,k 
W�����8A���d�,5G��cJ,-GU��Y�׹����.�\�ѳE�TK�U�[%zk�����ĩ�%<o4�""���"��q���v��t�
D�\d��O����)�n�$�
j�����Lyh�C�|�W`��-Q�Q,�3����i�NKa��fu���7r��!�*����ÇjX�/��C�7�T��E������;��wF���9��>_r�)쥜��a;6|��z������>�D��
)���<���$j�c��	/?�&�����J߄W6'��i�*��-���c��K=�F�&/��[{��	�q�,��	�C��˩��
�W:((���Ǧ�@��u��ƮG��E\5)L��kN�p(��B���yz�pe<Oظ�<���E�X��q�1F����T9���$�1����]r��c�ϼ)q1�fQ�$K�
 m�h�]#��o����ع��E�Y���ƀY��;aq��+3.(��+��Ү�'��,�����ji\^!���M��Kp��E8��34FXh6#�@`�آR�EE�E%M�J�9O�m\��b�EL��@��a�ƪ)yT��ba���m�l)zV��u?�?�;i�l�[UF�݋C��3��(C�r�aH�xB�hA�a+m�e:6jv_�X�L��?����v�	&�o��e�%^P�~qŞ%7���"�ĭഘ-�_����\�L��fR
�w�d��H��1�<�Z����	E�bv�P�~�d�t$�Շ�����ڑt9,�lF�� �1�4.(���� �5�Q�L\��hL< w�Iq`���Gi��TiW�v{�mc���lE$<PVG<ѩ<��L�)Z��?��M�oF@�� �p�h�Ku|q���ζ_�!ê繡���ˈfI���r���%��W쿶b�T%����""o^a��Zab�+�y���m��sy89�SǬAR3о\ݭ���__�ES;"�~*�����zMk�Z=���U_y*��E��M��F�jУN��'��G�����7_ú.>Oh�� 6�=�H�1{���0���~��?Aџ��'�lg��c�V=�s"�DG9)J�N��?�qY�GD��g��/�4��
��:��eo�0�y� ����mf������F{s*��`�(�8D*�x�@#��ϡ��nO]m�I�b7V�
!#��Ɍ�V�@.d�'�<ns��Eh����l�tv�$�m��he!du��J����S�#����#UY&'6z��5�
����{���j����j/��A�xU���<�+H���i{X)���1^�49EG��}s)1�'ʬ܉�-6�(��<��O���Z�l�mmP�<C��e��j�a��������v�zd�7���kͭzП�j#�77'
��6��ɘ�9CU�P�hQ��l�үV�?�s��g���^�!��be:@j��f�2��vc�9���9:��_ך��e����
?O;���^
$�1t/�˹��7T���5E�O ���o���\���Oh�[�G�VǞ=�k�׭�M��+k[�A��h.
����C;]��U�R��D���꫻��B�I����2-2�6�v�9h� ���/$�3T����ҳe8�]��N�'߿�U�y�C>��Q*Z�n�)�9�l�6�j���j�8P���J�%w���E·��`}�";�IB��_[��;������1�/�TI�Z#>�uB�!dk��/'Ui��&t�
F��|(r`X"�ܔ�5`�v��A4����fO͵#�o�U��.M"� E��1I�KcDv�Sէ3�C�ֆo�|�W[���o_mVs���~�4;4��j.���:�Uj�X�]�}ʘ8����H6j8W�#e�A�l�I]�+�=�@�e�&^>^zPG)w����x��0�_�
P��J6_�R���N��)<���V��n�Mx��}�kf\�N��F�ZL��Ѝ�����+��8xo�h�1��k��Pͦf⑕n>q�Q�%�|���BA;��<�e�ȋ?;���;n۾6��#���E�� A�م����#�ϸA��-�CI5n� �����tZ, }��û��o�K��}�t����/o���}������V׶��oA#�}���*���5�CKM&��bј�#K�i9:��x4��NvdZ������ŞiL�g�d�Ϩ�#	<�#<AD&���OB��g���_�0��O?d�U\q�u��=<2@A�<���ܦ��.�_0�YN[����$"X��
z(3˩8��.4��Q������ݠ�]��+��+Սj��-�ޥ�K�0��~��@<@S%�|M^*\��n_)��~T/�+���<e�2/!�@�Z���h���^�v���X����;�1����P~j]?��3���!�O2��3�^�}Y-��a[�_�n��:c ���`+�n��a�6��ӄ�G��܇�����)���#��S<�s"��}�
}`��5�����
/+������h��� _m6;7��]���e��#�kZ�=/�@N��TS�-��`j6
�-��R�Bu}���#�Ob�z�W��k?��r��b�]��F�����Ze�ndd��ʰ]B�	NQ��?��+g�����0���[tܿ��o�s��r�v1H�
�i�>M��/δ�p$�*�h<fgg]��{�H� [
���~F���P��n�1pɺ=����T�N:%��A��Z(8�l����UyK���k�J��˳�3��x��<�#��>��cB'���3���R��a�ŐVG5>�(�-\@/T7�W����j�Ww��=���up��0�PP�e7#��Z��v��s���F�)���J*���U�b�ɂ�P�j"�V�c�>a���{,�=ֶ�����^��.`UV�,��s�v8\Z�_��q-�W�8��cew�R!�
�GI�My��&&��,Z�.p�,��,^�C2�u�-+)�0]uK�Uwb/�@Ip"�	lz��H(�1���̨a(8���xpɒ�*m3��������k�/�#��XWra��w%���\Ⱥ���֠a��W�9�N^��B^)�O~L^o�r��w��D�g�/Od:���7��
��`��|AZ:���b���.l�%�Z�ׅy�
�
ͩB�K/c�iZD��%�/���Fp����j�@
6))�L6�s�8:~t0s��7�[=8ލ�X\��]/��-^�ic��ڵN���q�b�af>���e*��6�=�C�J�:ش����䯙�%r�f��e�_(͖f���E��/gʥYzw�4�Q�]��Wʳ�6�h��l��Ϛ���λ��~T^�/V��ocV�՜Uc%19]��]e����U�b�j'e[yi#D.t�����7Î�XկPQ�L�s{
�7��n0��mV� q@i�6�S�Y8$�w��f�F��=�'�ۣl7��� 8H�色�٦��ݫha(�<L$�M�cT����>U��CM$Lq���V�O�|s���R0�����
G}��G��m&�ʑ*Ғ>�S��Y��T)$O��*��7^��`<Q
�׉By:*ܑ��Ao�:,n��~R�Z�}F��	��i6i#�����Uȿ܄���)g?f3aW�:�����,soHW���er�;�݆v�������S��{��e{��V�N��NX�NX�N��Gu4H��������I��~��EGt�b
0�'Pa	�)-�?��eˣVW�H]�^���Lζ�J1ر�V�6]�ޕ*��A��(��F�j
����ꎎ�·]X͈6Gpp�r�[��\�!@���Q�>������/f+�Þ���}0����'�Ņ�+�~��z��Z�⪷��՚��z�C��Vs�[�D/kM+sb7#uH����R�r�w���Oh���Ǯ	-��r�e��
��5uim6~n))�Ra�uw00e[D9z&���n�����@)�yG(�:�w��	s<#� �9�>�5șk����a��M��5��>��G�����f��,9�ʺ��G%]�3��;�!
�?R�!���m�Ǟ茙����`f܍,Pi���s�j��ٿ?���~8���/5�wb6��T������@P����~��j���[0�h�>�yjo�`�s��>%���,��qP��ab�c�����e��Ç��=^tD��g�P
Ӧ��I,C���&�M�℉�x��"y?�_�A�B(�p�Z�M��\��xȁ��iC>,�Y�"�7�K��p	^;Y�kq�`�~�G�	��|:�\Z����i�vQ��=�i\��V,9�TЋ��d��܀����%����)P/w���V��>F�>����b�C�S����6g�4�4����
B������U�UXa,[�y�}h�r��1��A �>��:��h��͚&�� ��A܃0-��S�+%�B~�n���q���5=��ࣹb�'9��0�QÖ1eI;R=T�<CU��*��Xe�l��1�`&��{�`��jn4`/��I�8$�sø\��
[�|��;_"������9_!�8�Egh%���6�
�1���A��d��$H��f���e謯�8I�BNT�]o�k�&�V��|x���.}V[���L(�2҅<��2�M�3&B��)�jΡo�����e�?:�U�Vj���Y;ၜM`���ЁRN!G�7�j����rl�Z� �>�w
���SCGT�
�Ɋ�BN��1���6��Qo\�sT���E[ƕd�7�K0��\�E�-������0���Ў�-��Y]��s����E�Q�?jP����i�-�_��/�@�*%���4k~��ܴ��9�tx��H��
W�U��o!C��g�/+�����#a�d�bw3@`]<jn=�ߧd�T�yLԻ4n�9s�"a�rVʌ�Sp499�����0	��h`~�ܔ:��N�N���!w�����Q9����as()IH�WTWӀ�q�p�jS0�tLQ�d�����9�l�)��ƿ�f�t�@a���!�P�-V@��m�U�J�3K�_a�2}YM��� ,��X�bI�^	��ﴋ"�������0�O�T�x,���f��8l���%��$b�~��mv�@�^�a��#jm�4���1��y4.���r&�ل&B&l�Ë�D� �	Z
h��X����HF
/(��8[���R�]�<c2l	Z?����e�#��b�<��B�����y��Y6���H�@Q�����b
Ǿ�k���l����P��(	�C/(�ߥ���4Έ}h՗1]���~fr'+,��m��B�j*tz��ڇGI�?��Y�N�MH���Jd������/4O��Y�
8�X��DW���
}���GE�`��g)�|��ca=j5�tn9��E�F���8d�|u�Q#g:-����9�ف����'o��X���}�/��bD��=JW�^8��k��
���
��o�Rj��bL��P
���
x<gL��[�
*�����uL��}����"ާ Ju���	�!���e�����~}$�ڰ{��l_�[M��N��*��C$@�uE�w>�������A���t_CKo
��;p��G�D��z��ptķ��8n�Ql�d�?_P�}�u����U��D�7ڪ�����<�;s�̀fr�#G	̞=�Ů^�o��g�D��'o�-��+�0���N�@��v
@�R�0���~)��c�8�z���k�2�0U�֪�S�I���r4�r�}xJ�e��x倢�ؤ�ɝ{����	D�2�]����2zg�����a-�e���ɧ�}{�9:	sDsW��1we8elaS�ډ�P�8}�� a�z[�
���+rtK�x���кYJj��(�dxY��x����<*7���]��ͬ�»G�_?�ιaD�g/��/×���{w���#�Qs��p9������l�O�BIb설<1��)U̇��ٺ(�̙�$#X���o�gz��\u-h���{D�g�:m�����������ޠ��n��4/K�#d�(t�!0_
���Պ�&�h*=>��gI��t�d��i�D�<W���rOcC�3�)#��vǉ_E�s�:-�Ō{�,�(���p�rU�� H�i�4f*�)^t$0�ʘ��|!��J����lw�a�&�
y'�2U�@u{� 
�E�����j��U�*����,�˻��>�%��Q�c��K�7�F�N(����l�z��|��{�]��t1f ��I����Qv�31����Џ�N���C��E����B��ON>���{$�ܥ�@�;�)�sP����|�%�7;�\duz�[�c��`�4Cr��`�9~镶� ���;!�z:u�A�ϏN�Ce�����C!��4)?���{��R'��h+9_T2��K�&�S4���4��/x��@D�DͰXc��|�#��=��B�Ϡз��0
�Bo������}D��;|Lm�!�7��޿����y�X?a(�;�[��3���F�W�*U��5�����#�B|R��_�` Wq84�}�%��*aO���Ƿ�VC?�t�[�v�\e�S���E�k��� �!i)�������vE��x-N�YpO���'���<��g�N,�_��]G�$�N3
3&�������FmL@[��C$�9�&b�H�J�M���2��zt�`
Ȥ��kG��[�ji`e�CN�"Y�1�Vw�2K+rJ���<}��x6J�\��-G�j��]��w��	��&��NE����DB�p5�>I���%ˊ�m���+�Z��^�d����ڝ>�ۗ�}4x�ʔ
�ބ&Lu{�u��ch,>FK�l�baN���7�9���j��5<�����\�eg��K0h���4F� ��;tC��Xn��;���Fx��N����Z����eֳL�fp��c�����E��E�{��S��V��
�ɧr�Tx��FD�O��(f ΐ|�����R³*�!Y|*�����T��(1}���jp����OU�b噜Tcޥ���g+{5�A&%���~#m��"p�DюR������8�9�61�l�w���&�ZSb�<;��M9�2�(��Oȧ��W���P�_*X[nq��v�3��~�N�yv�?���ϕwG@�74ڍ5�E�o��
f���KV�I��
�?ޮ���꾤D����� ��>����瓲^$�˝>y멀��3Fp��c��4�P�i���v;m�5�S�(�Wg�l���i,�:ͪ�1�sp�����wڥ?�S���]�:	�X��F��$��l�l��N+σn�M�V�᱅K����?R*1�"r`�4s�P	���8���;����ۓ]�3�������E`jQ����1eޫ^���et�����\�W)	*���yW)뻊T�J�opV4*����tj�-U�RU��_(�������<�/Eϗ��E��o�����������ԍ�jo��G���}8��s�ջ�]��n�Y�LC�Ƀ�g"%�=�>U�wѡ��пvJ�S Z����X�`i�bep�Lk�K�����K��<Jx��D�>�4Umv�E�U[�r��ޅl�*���E ����^�Kyd��O�6&nu��V|�+�EK�VѠ����ߟC/[e��OX��;�.�ڎ<� S٨��J�)��64��&Y�f�=�+M
͜��[tʢ�[�P���w�i�5�����,#m���{��i�X�o�U�c��4��ga�K3�^�V��#̄ �|�E88.�����\������y$�%�4D$��	���_������>����A[�����������!�_9�n��������H{��+=P?A\��Н;����=5T#��>�;Jy�1FR+C��8�Y�q���)���c#�t'���}C��ѻRqצo�w����v�N���9Z��ޝJ��1��R�,���4�{���ܮ~�&q��������V{��M7�͵:�o�16ؼ�Fw�>�|�J���8�N�eZ���`}���z1+%q�y�Ŷϊ��:p��W�;[�+�̑Y]�k�5�X��+�:K�$�v�H2��2��މo�DiuG��ߓ��҈I��Vw��w�tRED�Zqk�d7�`�<�J�
�V�TԺ�^�roB��%u0 �h�s�f��a��`��7z-V�1�W��Fb+��l�s~�Ww��ͦk��B�ʋYW�Z�_�~��?�ty�������$Z�v�U��s��B�UƋYW�۴�3���Le������|z�N�_��p,Ш�k�F%���"{����^���,d�o)��"&*��?d%��ƀG��hX���eY4�EC��c��s�����.�����.�ÿ́�bؓ���o�>D(m�^�����nzł�=?r���W��&�X�ս���t,�҆�d��
t�E�C���I�q�w644|�0��Yr�=���p uV�kØWH	�9�k�aK��P�Q���!%<������f �er���4��{�SOp�e�_`�bW�a���c�ʤ_�Ъa�:��@E��o��fO�tD���p�y���y�a��?���v<�ՠZ����dx+��ˡ��׹	k\�k;նp)�Iru(�aq.2Cw�U#����۪�p��own�7��*��G�}84k�z/nZy�l;�Z톜�r��^���kܩ��Z��?�=�F=���϶i� �dFR}�(|ʹ@V����H��,��-��a�):��"�(�_,il[�!y��&����QBF�Zw:�oɑ�:u��H,*u�g�����
�q�o��_��$9��X͔b�������u�D���DI�+,���c���m�-J��Jz$���G�tZ��\���(0� �OA��[�O��S��5ژ4O�b����D/�~Юv��Z����+��Mf���!&�`�"���s��I�]�rXU�V��O[W�����;W|j��Ȕ;��:r���:~g���9��"|��pȠ��Mꏭ����v�� r��,���1���V�W���+s)��;|0mxiW�76��No��lt�0�j�F��-��)f�u��a,�����-s�g�8���w���g��g����bU�#[�ʃ�0"�2��n�	�F6	���*�I#'��Ѹ���L=������������d��ăo>��Y�d�H�}�����ġ/�tw�3��=gr��Q����x��ߙ5���
|�)W0�"h$�P����e��% ���A�r�OksX��3��w��-�DE�Ooc���^��wi�k�{�Koɪ��6ܒ���8RRgw^D�ԗ)A���s���8��0v��Fԣ�y�3M���N?���K��NΖo/W;dW���z��*<5��R�I�R���(�_��݉� ��Ԯ��M�X9�,Ufhr���R!UX��C\^��)xX��G���*:ty%B�X�W�u���¤������r�^x�l���M���LD�/)�y>��t.�T��Ccx�t����X��/x/��bGg������
������v�]�7&02�ëD�xè!��a+��!HEb��r`�%e�g�W�,0^�	㜶$ʒ�%�j����I��EM�E)o*�F�K,�%2W����� �6x#���-`�� �J78��������4C3�*ɏ`�$�$�M?B| �w��bGHd��k������e����f��l_
8�N����9?����u�1ޏ�3�~����9`��R���������g���������{FJ����\�݌ 5�!�[2�q@��7s�����G�+��g8�Lp��v;��q�Ʊ<t��y�,\��S}�ұ��ט�ots�zFS1v�xι���Oе��R�'!��Q���j��5X�
��nu�����\��
k��g�&Z`=����9ˬ�^�啭�r�����eA�HW�҈�&M��p�v̥p�r<z��D��L3'�G�a�h ���� MԐ��C
	,!�����S<��`YA ߍ����{&f���|s�充���75#7�Љ��?Hn�/��Q�A�Q�Ӥ	+x�� ��	6P��	�3|��hؿ�g��.?֏�OX�)�p��_�
z�f]���M�'~���ba��҄�34��� �^m57��0�6;��.F�+^�Kd�K��?���;k���h�WT�8�H����X�.�f�b+���"<N|�nQ,�8�(��[��	�H4���3�
�����$���2�a�]5h�����,�-��&<����Wb~~�\�f�1GH��X��y2�ap�oM£gu+.Ứ!�F1��N�F��\�@MH��V7���c��y�l#c��d���:i`ٯ�5�8�X�,��p���f���ߞ�1��Ҩ�0|���HA���
�&����~IL�|��pz��8a������L�:�5Q�ֶ�Wj�V��><Q	N�h2v���10=#j�F�@�v�c�fD�>�ptG��)�0�P�	_�?�֎�C�4D��p���Ec��;��1"�p{얉݋�����J�Je�4�y�����$�f�l���j�9p��Ҧ�R^�N�3�[N4��g@Ț3�!X��9?���c2����N�CװMxB��	G�	'h�F�-���<b�38`/�T���R����l0�Ϟ�7�����	Ti;��0�=�>b�@��Gd��5�Ո��_��0�G���g�0���D��:4��pM���� �_�mu��k�ߍ1yx�����7���NN\�M�<������u�Џ��õ=��#���!�	Y�',�ѳ�E�8F�v���)$Z��qЄ54\ְqm���;�h�a�
r�Ύfa��S?���Vl�g>�������Nx?װMx>���F�	�g�&^���p�x�ʻ��V�=��p��	��J3��ϻN.�q��?>��aGχ�D����  ���}{sו���)Z�f:�Q�,˱w�Xc��l�XJh�=�+ݠH�Q���q�5��ݚ�-׎7����8v�(�E��6a�9������� (+ۉH���}��}~'��e8���5aH�`�lNS�
���4Cg���8S������v��ht|��gFQ�/tz���?a5��
�Y	�\Jx���9�C��yH��fݡ}4yt���n�~��),�J����:�gj��*ܝ��iy�c&-o�k9��f�O�����k ����	� LUb|H���q���D���
��x����`?=����w��2^^�
[:�O�',�]�y���p�VZ��W������t��z��;aԻ���Ӄ�YX�N�d^i��s�����w8G�P{#`M܆�8[^A�TX4��Մ��h̅�a�1�J ��z*��I�a����imٺ����]!W�.K�
x�kj�l$f���U��i
kg8q*�	�|���,�s��?�K	��ղr '�u�`^�B>��o�)����z9X���������I���;�,،�i��ܾ��Z�A�*,�� :���������]�Ҁ�4�����O�=(����AXk�� �����?Cm+��a��!�60�y3���md��@�`�X
­��T%*�*�}�X���`��^���.��̼'���B�@�l��)`o�?�|�M�I�䱰e6~�>�=C8���?����Ѥ���Z�j�mƮEQ���%}�6��Z�a�q��M}V�������f����N��<��^?87���T������҉�{i�vG��6��_�l��������eU�z�B�]��h�xb��v���wr�"� $ٮ�6�4EZY�(2�R:!E��]p�Cb!Q�����_yH�/�&�aT�ض�=mΜ��R��^q�"��m7�YK��mgN��&�xәtQ�`�N>�|8���*:fP���J�H�hz����\bN�MT�O��p�=�tѳ�p��'�V�������礇g��n���q0���ˋ�����������N��u��3��eP ���7�5�vM�ps����~�f���{a?�D��VPc:�2X�̦�9������כ�d��:��Gv�$:�y�D�k$�^��@���� �]b�=.5Ӻ����Ȳ�燇>"�(9�+J����I�X�qy��Y������>7�n(�&����h{�}X��p8�TK�Ʉ��P�'k�M���������E�m���-�mSr�C9Y�l�D�^����xT�?~���Ǐ����%�nZ�9��CJOG�@�s�
���&��D�VV�V�$Ƈ<������	�+̅z��Δ�Xߘ��3
:���v���[�����ds}#t^��E������z���67g��B�ag�*)N�&��p�Y�P�������*>�y�S�ItW��x�jT:��C���y�ۘ��d\ا�:���Lm:S�r�u��0�l�֟���0�3�i��9S����g�EB͒0�e�ZI���h��V}c��z��V:�9{�Z�{e��S�^IC�:T��ͳ�zY�iz�,�v��=s*�)�d�y��?�=�l��t�b���<y��X��m7��U�(��a�����D�
�	�^�o��7A}����'��tȷ��_�%_����L&r#Ȼ�ǔz������Ev����?�zX؋¶��`�UKC�c>�*aĵ�?�T�sF�($�q|u3pሞ�R�.�d3<��]Tg��W��(���d�qW0����ti�`3�_��c�:>_	3���+=/���W�7t�~x��ր��yY��l�m0����=���?���1qXq�V���\nB�����	[y��:�)!�c>v;�X�Hm@��e�=�<kW�8�v|c�t��v�/�K��I�
�l|�S�Y"p��av�@&���,�O����?I��\�X�\��o�>d6����Z��K�N�N�����$���^xW���I+���P6d�U���?^H-p)WEl�k>�Fj���Ԃl���b(�4_���\7���ʩ [�e'5�����pg{�nƎ��nJUq+G]G�	&�@p�~�	���3*wF!�7��_�]���y��%ml������ݠ�
mi�ȅ#󰳩^����Iu@� ʤ�u3��a1��ú1�"O��QnQ�����\���Oke�|;�%`2��XЭ?�âЧ�EXқ��28V��[:�L��ux	��ww�6�<�+ln!��]]"�Qpv	]�R��5��Ұ��r)\`
�K�v�i��9��ۈ*�պ�/BZ���=�@�q�h�\���Z'�*'����6`�1�ٝ%/$���މ1�?�d6���:T��!����em-ɸʓ��0ܘ��6��^gV����O���]��FN�VE̎˗/�y��y����т���q��u�\0����m�&N;E�$�����2��K�u�,� r����Pl���<A43d��x�)N�oc�?0ه��؇4���
�ѧ*�){�?���`\�3���r�C���
�L��Fw�ChϚ���V���U<P�=���"]������wı���Gޠ��<��{�A
9�`m%����w��!���͵���㢰�r;{�q��X�4����"�)Ql�V��V ��/R/��V�|��B���K��[68(AŽ�
�\��SRW��lZ�:a�
��r�x�$�X�?��i�l��ַsɯpG�L�)F�S_d����z6�Y��Qe��MX���YM#��r�u��Ο�s�AUٳ�	~�vcֳ�{Ʋ���&b���6�ě{{]v�r�/����z]�|�]���tdu��1}��7�m�@�5��m?j{���N�=z�G^�{=��`K�X�j��`d:1prӱ�~|�����O�*���7��TK	�����������k;*P�D1ϰ԰�G0�_�W��YC��U�,�z�5��
dl/��`y+��	R�(�1"�e�;�o,�+�f�A���m�$�6�H�M�#[6�Q�����Ɵ��		�PJĶ�x.��W��
	�Ԏ	���tw�b����Aԭ<�?
����H;�Ÿ���v�خ#��Zk�[n��/�]X���ܸи�X]�n��[�΅z���n��h��vu�޾P�`5�a����>|[[�T1_�h�bۣ�X�B]g��kqӔ�*�EΝG����|��y�*;t\HC<���
T���&�@�YU);$����L~�^��|�9zW}+̳r����U���'�0�EO>���R�������{9�y�b���H�o��>.n�g'S�?�V�7��r��U�R0_����&�Ȕ]���VA8��	!)��՗6���r�œGQ�(Q��'w��nK���q�PE����%
�:�- �ƙ��7��)vA�GT���=׍F�t��;gu�H��r>3�亥aT�r�q~szzS�r�� ���m���{��٥�}�s�x��i��Vf_��\v�x�.�T&#�'�P�WcO{��[>H�Iۣe�$U5�o\ֆY�#z��un�4���n�0
:�H���o�t�l/���v5����^8�tR	�J.��=U�ыA�?�*�*�Eh-zh���j�(�U�������*���?ؓ�
�~�δc!+`�d�[�?��M/���]*�H���oe�e
p)�c���`DVkD���"-`��T��K1��6^I��iBtc�.9�V��"X*1$��4R�^��;̪`�^�BӲ�abF�\����@}�2�>c�1�;;���C9�����j���.����6:6�ݥ&3�W������k�6�ɋn�p�Z=u�[��Ad�&�����W�뎢�*�+%q`nI�[!.�#=�۩��3��,%�I`Ї��{����C�9�X}{��h N�Y�G�i��ce\�d1e�����&�9נ�՟��,�pʼ��S-����(S>�+�J�g`1f�n��%���%�ݾ
�����A���e��#M�j5��/J�\8�Pۖa�ã*�4�xi���&�N7�������Sp��o�6�9�-�Di�>}�bi���^�
������߭�4+L~Vm(�*�
HR�j���n�a~/����AV�ct�!��M��یM�������Wm�{��ae���%��N�LR�k��~V7�7A��jz'�n�z�ڭZ$T��.�<�.�Wu��:0w���J���?��n�,�C�#
��HC<u� 66>g�"$�:>�w7�\���
fڤ75�����p�q�qp��������k��I����hD@
o�V��&�C�0�Ļǘ���y%i`�aWS}�}��+M��Z�Z�YM�V;qe����)0�p)�A����F �נ5�%���L�5n�l"ӟ0{^a�6x�MMY��g=d�Z����2i�L!U��`q=i��Q_i���m�l���Mן[�W��4�67���*w�v�UaRЪU3�3p�ۢoI��ɻ�'�G�hf���d���u�rd����2Λ��
[s��+m`������h5�#%+����pU_i������}�<`�H�y�����o-�f�^����I�猪}�
'A�C)�AɊL�����YyH)}��q�P�/��D0y/�Ĭ�%i�G��&��!��e��Z����(���(��9�u�b5��]M3�
��D^�p��|�����-��62�Db��"N��p]�~�v�ˤ��LA5�?�E�5Dׁ6,f�GT�L*1���>r�0*�m�e�?�!�ʍ�A�4���_'������$�t��0��\��X^D��M�ؒ�4C�h��C-�<�@���'/r�f*��G&�����Ts���Z��<)��$�G�,n�Քž�@kIz�Ϩ�#����˳%R�
�,�kK�26�tt�c��K��r�-�8�K~ϼm�Qp�w���w��n��*b�^�(~Ȗ�7���ǿd�DW4u�?˼Y�0󝖍. &$��񱐑CԍbK}-\Ӂ��U�"��[^�١-p,S��)��@���`��K�H�׻�YVP���a�=���������]
%p(K�J�CsԱ�OWL���b<�9U�Ev��+�J�+%	���Gbӣ��,��m�ej$�
��K ٿ JS��^�TA��AIJC�7��m�AP�$�kވk��~
��
�RPI:�j�p��/��R���I�+�|�����#�uH�|�Cn�{�}���]o�����s�@}�
��=M�(g�HH]�d%s�WK=�h�iA�ȝTd(��TIe�kdb�U�!H�" �sip�E���4K�9��=�R'�.S��2Vt��Ћ���#���
"�:��(U,� é�;a�y�1�\>�F(�cjdqPvB�X\��Ǵ�v�#��BOq�����+9���؂{hht��k������J3$�iT��H�݂U�����$�RT�^+�L�/_.K��Je�Qn��`��c���]
�H��sn�u?�_����\��,�vG}fb�/����X�/��U)2�Q��3Y'���&���/P�����z�0;3dp���q�z�
�Ե���-�n��VнC��-�)tG{*-��_ff�`b�t3K(9M,��ź�HՅUX��$V%HI屹��bN1h4�)N��U65ă7U�	撃�~:~�U���"�ӌ��[�����<��%
����ޚ?�Xt>"s��U���ʰ��<�q {^5ǈ�9k�� ���͡����^:9�7=0��D\tӫ�;�������F�H�h���;K��"�k#Q-�W�9�f����e�+YA�<�!7įxB�Y�dEh%��]Yw��{^���e��Qw�1��ۓ��h�O>���nKxL2"}����z�j��kXa`N)e��0��$�a�!�P��/'��5w8E�|k9ݮ�3,ok��P��60&jf���}4 0�*���ػM�l��2�b�ih�a� �2�4sCю}��JC� �:����)���jKs8~iÍ�G�,�@�C8u�
d*�T�^{Y\��4J�E����~'�z0�WF`��b���I�a��Wy=" ��Ш^�"�����o�J����8bF`����G���sc��ؗ���.]���+P��$��lj/�G��$�icxtϽ������Wk�-�p<����E�ƭh�����򯓖X�t5�!m�
Ҭ8�'����n�>�KPX�����7�ϼ��~���y�E���~Za5�,Z,{¶j}(aۇ��>uMڶ25� ):EΕ���z
GUO>$�x��ɇt��P�^��j來h�A
�Ş͕��z�Bϝ�OHG�� �v ��?��p�E��ZN�
]��
�|<sI�\�!%��:\T��7�U�Ap�D�-}O'x����!~��Q W�4$����dE8��������ظɢ{{�e��֥P��{�F�̾u͜,5X�	]u�vu����S_K8W���$.���U�4�W�H��4o�k5��[��.��8�9���_
�#nf���PY�>\2�}���A � j�h�$��.�Z�;�������/�"�&��j,7�j��}D_$�~4��e/�<�/�G�I�y��B)�/�t;�
E����39�+�9������hr~Q4��j�{<����X���9f��A�>�R	���t�O�S����G��D�,���$�UC������4s݅�0e �u]�o�Tr�܌C��������m<s�V�d�"��N�R�Y:1zΩ���h:gX�9�U��$��*�X1y���[�wІS�ī}2y�?�s`��ɇ@��m�{i���+󩦅�	���H�7�؇"�)��ݙ�1fꍟ�KRW�;��m������`Z\f��NoR�����O#�|�fT�)��B�����k�T�8N��s�ƟS>�.#��)�Jf������N̟>5�Dr����3%��!E�T��ti�.������O!U�l����gJ؟C��7#i�YH۟.q��#�4���%�2u��T����%=K&��I���K�S�����M����~�)����9 ̹`�E �((_0E)@����u�r�l��g�2�|m�|�����B`��RU��G�te.����wnk�H����-��A�m�Y�)��l�zWZs�"�=��"=��('�_7��Q��U����b��
�i�60j�Vu��u��dD�p�k�au��hb=�Fa��5��Ǆ`�SM�D'�}��w
{6{�͵cة�����M��`4��a��OG��?ɞa�w;�~aɋ u>.P	Z���=qU�1mf�`��-����2��3�{����z����Ͻ�S&�4M՞�`n��ݿ�k���ů��W��{J=����˥��)>j�F���5s���=����E8��N��2�Kr��y!;��ȼ�!Z��Ώ�!ǩ�R�+�ڠ��;�Ls2��l}�Jv%+ۓ����T�%2�E�su:7��޹qYy���������X6[���4�1��)L��T���e0�Kσ.6+��i���썭�&�lW�^V�qى��O�"Z[��@T&&U���\���9�Ss�&��R�L��1ì\����զl�6��jsj�6s���;���e)�hm���\c�n���_6�=��lxL��������#]G����Ν_��A�?�/�%���v78f���p��	j�~��mݷu���8�ًX�&H�ԛXS�(ǔ���Qf�LۻX��0�<y)�׼{�c^|enR��S��#�O�K�:�[�/�:���ឮ��n̿j�G�)�� b���c]/'N���q-췺� �,��}��¢던5y�T^�ǇA�R4�Q"A�Mv�<n�7O ,#cA�׹�q����*�aɩ����d������T�6��h�x��H��z�.�����!p��0/��R�1"'��?h����� �j��*T#i�m;�$^�:-e&q^��6���
g1�-7r,L�c����ů�yKe9�
��Jx�ѱ��6(".}���yi[�$��k�E���)C��NIY�i�@.�2�S9����;ӿ́o1����Lt���c&�3�p����o���V�[
�C	_���f;�2yw���ƏgDq+�&g��u��)n�g�[�(�����3��LqS��V�8�g���\��)m�钌�ƾ����#�[��T���9���,�1h@�M����Z���k��|k�&Q��
����.�^�o+i6����i$?x��d-������H��Y2.z��*�i�Y�M��5�7P����f	ԆÔ�P0E4�.
x�B��:��w ���H$�<���%�t�	��2M��4A�,�r�����S�J��@bc<s��ٵ5��Jۃ�J�Lu.�Y���Ν��=M���ZH�!��1T�2/\C���ԁ�9$�������>Q�jE�3���EM�l`�az��
��6��ME�觅��ɗ���C�/}9I�K~9�<}��/� �YOL��¸��%n}��+�Q2�"o�ro~�o�$l�[����X�{�D#���������2�۲q�"~z�:A�Z��Ǵ�[�rK�!v�j&�5kC(j�W@'\a�*ShW����׭6
I�ܫ�9p�AJ7��
�o�(��4i��Z�k����f���1��>!���e�*��K���G����-0��+�}��P�x��lqv��T��:g�%Z%�^�Zg��$�˒�]p������"��������?'��U��UU��d�������;B
�PK���Ʃ�U':���za7P�}gvD�'p�Ι�_0�ib��ΐ
��
��5�~o	rD�c/u�������ʇ��d���;�v����n��� ����E��(�.+�6��(\+wǻB��Ai��n^u���Ojwuvu|������<Om	�=eM��`XDo/z����ie��X�Z�W�2���yaa�I[KR^@��6�2�qӺҦ���BH,*{Dg��*�)��V]7]#Ʃ�%�i�o�=���	X�,(*���,��I��{к{L7r���#8}�ጉ����8(8�� ��:\���!o�Fbk��i�S
��J������ l,܃��ڃ��I;Z�0;� C��8C��-.yW"k�N4�U��Pl�lz�n
���+���|x�;n"��J7yտ?�������C|��l��-��)��k���h�V� *�Iױ!�,?_�Zsp�����1
�
��J�"�	M���̵�m�s�
x\Yn���h�U��ΚF��^��arܞ,� ���6��%�����W)U�F��q��-�r��{Ýj˝ͦ�tN�q�l���-�|�>��l���~��R�8/��Z&���N>�3�4<��6�1߽dp٫;���<z~��|��7a7�%j�a�ω���Z�,,�c���b����X��9���M㒶�>���˗��g�d7sK��ҹ�U�v�\3u�/y(��UR�E�������Ak�o�x�f����,	Z�c0+��,�� �A�-�9s
LaS(���$ԆH��/ȹ��;�I�1<|%�
 �b귄1���Z�� �S�6uk�����KY�<�?a�vp����j�����Cr��9K}U>Ӭֹ1�������'N>����������-�܂ޖ�M�B�D?�G7�:sL�
4�F�\�X�0��y|�X���s/S��7���s�j�T��oN�?�<�wX�v��H/�r
�[At/l5�pw�EŞOq�l�{S��y�m�'��iX�6M̵K(Q���K��x.�q�!:R�qJ��L�oɵ"�=��!K��7s>JTI%�����4��`͒ynu��v�+��1� �*����{0����gg�%V.pH^&n�Ƅ���%/,٥��qUG[���z��B�h�h|㘑�t"1K�nt��,�N4!��G�]<�C%��-���D�ʒJ�hQ��#JȬ&Y��)�h���z"V��0����;^�:�S7�,���Qz�fZ�Wjʵ�~��d7�S���)b�7X^����Cx^F�j�@��з �b�^/h�`�u�K�����xd\2%�ӻ#Je��)��d�Ʃ����p�5��OefG��c��m��(��t X��n�Ψ*9��o�AE]	��T����r:?	����T����V��ܑ��s�m(}πꏇs#Z]9w-��x�ŰM�Cq��rPf;��e��r�HIo�6B-�����I��Ǳ;Ď8B�/�&󷕾3%��KH��],n��UW��@\�Օ�������7[��;e�\�n��V/?��3��J;Ď��
����g�����p���k}��?`gcE�9�3���|�ʎ@�W�XE�.�%n�k�ײ�
�T�=w���'Q6	62�%'�Bb��n]'�U8N�Ƞ�ǖo+�Y�r�	��~���BjY@X�P��4M�a][�e{�Z�Q�{�>���ؚG8y����������|�v W�.pV�K �[q��+�xR�ޫA�����3\xev��A���^�(���a��T�Yn�8o��e�9ٷ�m~[��6���`�!�
'+nn���e�C���H������{-��ܦ*�̙������{��j���3u�[Wؾ�`��yT�/ㅯ`��b-�^
V���Sn��i�vs4�JF�
�`RH�m0�D:��&z�o(z�s|�*��Ĭ
qf�u7X;�j��ʊ@7��H�N�W��N�
��r�9Kq-�
ۮߩ��6�w��]��X�X�X[j�^X���w��V��Sl�.���߽ #�D �G݊L�-P�wf���-�����kd�"�-�Z�t�Wŭ������߄�a��*v���^�[v���V/`U�uaѰ�T0�:�b���C�xw����ɇ��%�Q|��5�u�Z.��'x9���>�﮼@X�:�E���M�BX�Q���Y�IEU=��^t�eז:�,h�9��&���U�g0yl9���YgĿ[�������REح(xBf��/+���
kwRL�T�a�2�Ww�Di��a� ���W��&N��T1~�<=l��rk�Gw�A�:�2�D��� �5��w�ݓ 3�g$�FJ�F+�n�H����*B׹���W�n�__�I�Vz�e
Q�<.j��ϝ��~���u��p�xO�Fl*I�V�Ѕ�=ӴK�B��ƈ���7������� nE�)�@+�c��񗓷�Y��?�<���M �<�����πh��!�s��Kǿ�����0ju�ɼ:��s�"��'�*�3*o�/b�NӴ��T�2�r�ܛ�&�!M1%!�|>���J��y2~̰�؊�.�GX�!�90�:�
�3s�&Ʋ��3.�;��ꁥ\�S"��l�L��p�X:\������&f߃���[�{�_�}c^�[��a��ߵ/L�؟��t�D��낻�����A߰P+��+-ܛ�uD���C�u*n������a�<��F&�������``xo0�C̲oVg\Ш�s�U��O����(�
���ڱ}G��ǜ���	_s��b���	���W*-P��{���P�%�į�T��L+Rr�3`�K�Z��<z��ʹ�n����`�N��a?h��u�.�;B�zu�m`L|8jM# ���Y�R~�W��Q����W��FM�_�
ǫ*���k�}Q��/�@_�-�}[�(�m���v��pwu �
�F�y�j���A�9����O�ě.Fle�Q%
�~��G7|wxGՔd�_����G�Ka�K���z��li��:,���ԫ$���D���߀�g�&��_�Y���XL/����:���N����t4!�_�0��8���p_�����w[]4[�����S�
H�7x*��d�i����ͥ�q��o�-���]�/�n�I��!Ș��B�ۓ
ZjEro�H�?�ԗd���Ry�"	�Zා����98�ׇR�>k���:_�m�T�Ht��c��{~�<={���c<z�~F�-�^��8��F�~Ե{A����{�ż�1���3Z\¿�# ��PFo7`)&@���J	��ˮh%N"�4�E��hp�o�e��r,D{[�L�����d�0�����BW��}�����(���y��=?
@���>5�>�j�����E��anA�o�_�/��z��)��W2�j:)�7�c��S�X�k,�.��}֢�GJk���Ѫ���Y�[��������H*߾՟�����
Ӓ/_"���*��ʖ��0�+�x6,}8�r�wO����/�������?��]o���?&p��v,�8��1�y}��#o���� G3^��ĝc��O�6LnT��`���st���z�n��1)��'|�6���k�؉�E��?vy�eł���
�c��(sY��p�y�j�u����N9VȲ*%�%K��ah���5MCv�z�
�y��z��<c�{��sEw�p^���s:�3�o(���*Vw�rX�6��xo���_>�=x�!��F�y�zp�@�-;�P�oT�Tm�@nux ��+��F�=[00s7�a�J��,�eK5�c-^p���Q8����Ew�>�$�Bs&��[R�Sg�D2��n��?���*p�Y�;Q�#�5�ȫ��_���CN�f��i�Ԛ�{�^�;I�"�|
[
�-a� ������+����,���<�"�[��DM㰳���<��������͜�eX0[v�{���h�>���Vie��$�߳|��K��ULcmx��ø���gm�m,W��ީ�eO���0	�?3��)b�s�^�O��k;̽#Q�֥)օ'�v��&!]��BL�.�K+0g�1�� ��[��= 2���*���{��0 ���K��{tJka����f?����!�E�%`% XM�8�7�։Yrȵ��<,��m���F0�m2;�X�e����0�
6��%\z8�P��)Qdt�^_����*�U�)� es�X-�u&?Q��Ό���6�}3p�l�����
&CC
�6��o2��3Xۈnu��:Q�����F�l#�_��촣�V*�;��f_N'J�nj��~�3��������
��*��:ΈdFSEb��]ģcTߍK*��BG���5�B�h®��:��S]S#������7�6F���#��Z�c����NL���flS,3%�LC�ֺ<�=E��@�Ճ���~�Q��Z����n�`:9`�����Pc�����p +t��ָ�TWi���g:U�8�l
��h���g7 î��Ll�MO�F�?�Km-�C���.Fu���I�s���֖��b�j�x�w��{m�G	G9<>�Y���A�}{�eV@G���������:O�>c���.\�.^��Q�Y�l������k#C���Um%1'S��M����N��䴺İVg^#|V�A��"QBEA���nt\U6�[���U�L9$V�~#�A�X�?�s`f�e\�]����~���G�5�a>���y���u�]�6�ё�-�
اU���pZ[:u��,�~�Г�\�ϯ� O2��&����z��Z/�Ţ�L�$
�
_z[���CY���^��I�]u�~��	�S���E��9&æ��3OgF�~[9�Iq�}v^�U�qDs�F����ؽ���D(�ᥧ�6L�ć.gh}SZf(\=���Vj�p�@�� Rs���en�ks��/c�^�a�"FLT�J~���]5~4y[$�~9y����4&�c>�C��{���\��M@!�5��U�nu��d�8ᴲ��}�wY�	��ﲄ��������_���8=�>�p��
O1�c6W�$q�&�"l�:�AwD�I=&�tX��O0X����
���S�L4��_�cדW��Ԍ��	^��^<%����]G�6���zO��^�t�9,��w�顖�Jt���"!�n�-���x)��[3Q&$���,�@�d=_����n���YUj}���5w
�ݽB�+=p�([՞�,#�+�w�R�E�˄_�g��e++� UG��w��(aU<���/�YK���sK�u����U�ע�����3W�Yk�	_B�-J�Q����
B�mF��|��*-?яp��h{v�:�Ε
�[ϺMa�_�CUE���j�mϳ�I3a1�}`��-,r�0Q~S��X�:��F(6���ȝ�W�
��T�c
�(�
"���U(Z�/7%���Y��GOp��d���۽��Pض*_�J�_�i�ޭE�KcL�sIq��� �p.�A�� �e:Õ�3Z0�p�ů�B�&%���<�؏+n��5-0�*3Z�<�D�:a	�Mv�G*G;[�ð�G,yZ�^pY�oS"e���tl����OZ_J(#f�@@�jl���5�6�K
׹Aԍ���^0Rױ����0ID]T-$�N?��MS#V툥�9o��fVc���E�K�# ���j�Q�;z�A6{[M����n����H�҄~&h$���uO�R�_���u��2"(�f@��h&����k�Ǉ֚K9�rZvM+GB�vw�=����60�7���E�h��7��9��7�ˢ뼩W�n���L�|����L���Ua8�����Oy8�r�����XЏ.A��s��Jh�c'=��t���tk55̜f�VM��W�y�-���I�JhƺmcHA�,F�``zR���n���
�_�m��a{�r� n�}��9��"M�;�J̘E����A�mN�QlY����MX<�P�:�AK��n����'���e����8����'"��p6�������#/��̗B`���M��3@e��|���wp�҉�LY]h��&7&BL��"���j���rZo���Rz�7X�e�|l�yk���j�'�ឩ�9W��NG��>��3צ��Q�y�;VT���%ڔ�ҙ��Q6#�י�{���i�gZ��gZ��q��	3��R��J��p�������R�ï��pe�
T�L$d�y�褦Bg!�U-����K�Gt.pר�t[�>�:�\K�N�:I� �'��賀��I��
l��� ɿ����J������Ԣ�O�K�R{nݺ��f�^��C���S�sY�W9b���53&�3"K��4�����ےw�������ƣAt\��ў�w��>�~�Љ(m U�����������E���D㲌�/4:�>G^-q뒬��[�ymХ혉ad`�񵠃�a&��Qtl��Y�Y;�7�]�V����/��ޖ6�������Ql���p�>��y|
8�k��*�Ģ� ��<o����R��J��v@�m���6�-���4�a�ی�e�Q`���ٝjw�c뜱nF�^5�k�����X=2y�X�P`��}m�qdA�1���O�;h�剂��o���>�l�Bi7��yt�Z�Rln����1�:~�@5�	ٝL�0�0������:�t=𙖤4�6�G�}�+�i:(f8���
�U��h8�e?~-�����=�� O�,Wh�A|�/��|`�YQ�j�A������B�B�>�$#LV�)�q�(X4�&�ޕ~� +z���5����P:�� ��.rLW:"ê\?�Ԣ�)�7� �y'y����3K��_������d�}�ϵ'`Q�/OƬ{,ۗu��峬g��N�!H�3$u�ߣ�,��j��>vk�$�5����B �����V��ޒ8�	�����^��]հ��J�V���J}q'W�Ѭ�~Ps���E%p�u%ge�F}�~��?uh���ۭ6��~����jN��-K��`��Ƣ�<�.ƧDh��3
n�n���j�.3����읟���bg�?�l��};�d�X���r{6�F��I��>�B�*���[��~Z�Ĳr�[���Nsf�k�o�.�]m�U3 u;�%�]V^�d�¸��@����F�j�a]��6p������#�#�q�5ŹŖ�n�֢���i��\�/5�K��R�vaQ����i@��ʊ�l���6n����X(�� !��n�\�>%z
.�;��4(����<)�ucHI�=�"�-�V�`�T��X�G�:���[	q�/�5���@)��|�nW����"�m�)趱�c�ut	6J�'���q�k�� 5R��2@<���vm���,�)�|�rK�xˑ b��?R����i!���Zo����:����m�e���s�^��y(7�[R��'�È�O�:��O�W4�,�� �NA�$� ��n��'o��FI�J�����JV�G�%�{�`�3��aU1E'��]�:�+�i��G"��ws�s�0�0� �B��κx�c�N�J�i)$��l����I-�,�� �0F�=_Y���=���7�}��plA~t�K����¯��&6��_,[��=�W�:<MW���]�R]�e���'y���/�列;&�G��M���M���Ę�:Z�����*j�>�z������ż7�Q�
�d�n��(�	�A�������3��̗��p��^�͟�:������q'U�����+�(�l='�)�S�L{[�����Kģ@��y���yvE%��)���@M5(N� Fo&� Ȉ��ږ>�:03�1|�K֡�5�/�1�)����s������N|��9ޥ��OD���0�,]�kI��Z����z�����b=uo����0��J��,���{a�����!��;�0�q���^Fс��"�Pϭ���1��
��谆���@�I���.��!'��Ij�������`D����D��.(A��.BF��8�\$����f2�Y.��$wm�`EJM��J� �V�R�]�D=��l�D�.�a���ߕ�����]���C���{��F]l������]�1h�ݯW�
�Ѵ�/����Q
�
Ka@Q��Du����^���tg�G���<d���!6�ȡ%𝗨Z��Oه��/9�^� 	[�pZ��9�)P7#je�y���2�xW��)��	�Rg,x��'�lK�(Q��\��S� ���Nǋ�7��V��K)����B�T���K����ܒ.P��E�
ꗿ��j��Pv���xr]zⴑn:y����9�7C��*�Qz��q�a.s����Ks{Y�"�������G��O=��|��-vt�j�o�+V�C3�|�͆�#��Ǩ*@�����K�a��o�8H��k&��e�������i�M�#Ł�?�w5�(b��'/m}�N�&m��N�b7�E���6#rd<�B����%��V36i������@�o~����{����j5W�֎h��ϐ9[����+B[<W��av����֥�#d�?�z)���nޙO�O'0{ 'H��e��jN���J
�r1�Y�tK��Jo�{WvyC�
ۛ�Gl�wj���<:[�g��sy�����u�l��?�~��������U�~)R)����a�r��ģ��� ����O���-�����k��QdL$��5��n�l��T^P��M�N�p��F�h����t�x���:)��Ë������{�N�O�3}�ُ�G��,�7�<���W�!&j/�^SE3�����@�_iߌ�B`�dO�@�,b�yÔ�{)�T��k/���4I�n�՗�W������+m���u�	�{iT�.1E<^>b���*��P���̪�h���u=�ߥ
��LB:�b�k�u�dt0�o/R�v̠��pV�Ǆ��q%��,�ަ����~���ZU��a,��nG�O[��^�[���ht��1G�j�]�Y�zc�������ydL��`b��׆E��!\7*d�#�#�o4uv�F���WG8���m�?��It�r.堲��`����/�h�c�����g_E1�G�:q��,1���&����O?d�g�!�f?���,�2p淔�yhy��<BV᳤H����M]��&[��V�f��(?Q̟��5�S���;F��C��܀Ig-W3�\�ɩ�d� �̀�w��g@�ѝ^��ȑo!�A��,_̗��ڹ�a��9��8���HU��v���b:FQ�8��[�C���
�
���8�i�"�A��2\$�=��6�������b��C\���J�0t�e����QMC[
!��՚a&�
�&�KU���Z� "��%C���s��=L�s��7�Jݹ�jޱ��Fyy��tg��]:��p�0G�C�V��>��v�)�]/Lu���<`��}f�hb��d�gg�R��u=���Z���Ĭ��e)ivzoO_3�Y��^��}�1۟Z|�Y{<,�^��1Q��j�+㵈����MO	bQ�W��_?A����9�<�?�yHy�I� ǒr_��=�X.)���/؞{a����c�vGѠ��F�K�ҽ����7�_� A��~ۻ↤�,�.~!��<� f=�W�w�k��W��`�v��������k]J��n�!�x��}�n�}n�}��if
�Q�#ֽ�-�Z]�m�w�,����wp��v�:��.��8賎)�rL@=8��"�	�w�p}?8�����c��x�0��j���s�5t6
��X���J�CDT���U��ېsU�?����M
|W3Z6}K�Z�+��/�/4��ė��o}��`8�7ˏ�� Db%M�<W��ѭ�� W<�i�e�O�/�Vx���H�d�OimQ��։i�AW�iQv����ut �O�P\�u���Bt��h1�~e��3ę�CX��6��pr�����?�Nfw�û�.�k��G���k����b�*nc3\f��i��ΉY�/��8�]u�i���[G�|c�A��4��L��9��ҷ��|Iڜ;���㹦8ҳq�!P¢�U��V��w���ȭsY��C���%V$q"#�c,�>�6�#���-ITL5�a|��6��%�y�������]�糯��[��g���(
{`�2�X&y��ө��Ț���l�AA����I��`1�+�>9�3�<!�6e��=���L�׼��7* �e��;�(f���[��fI5
:�N�=�X��<��^~���N���Aj'���b}`�;Z�(o��O�� k4��=�>���0�z/����Ԇ9u^d�:+�'�   ���]ێ�6�u���x��$_׋�h����6�S���e�����C/-�/��O��o:3�!E�M[69g(�s8B�/��fq?/m-�Z�U�EcUp���"�.k�P��,^�8���"�
#�0�3�����c���U�)?�ϱ� #�h<qgP��0+�w�"o
��0m��s-����^��Iµ{���k��������fX{[19_g���]�I�*�ODPo*ZK�>�����\Ռ��z<�ÝE5
qvϑT�թy�-ч7
�Ĵy,ۗ��M�攠�B(���[���quG��`�O���J������/6د�}<u�W���I~��<F�E������nP��C	�$�l;I�o�I��E_��h�M��!ZW�~��S��K�H]p�.,��0�J�{
o�|�M �P���␊������!)Qn�KNL� �z=oC"�B�bV,*w�͝�~I���(u1J#J��Y��a;�b&���fG�RT��T��@uRkP]��؝���Լө�7�W1��~F����V�-Y���mpE��x�:��ƭw
ݻkD_��A�	��fقR��D��^_�"�·)E��T���a��'�~���2�*g�
�x
U>�f��
�ql�@[�U��}U���^C}C(���#9S�Ŧ�����ϸ��b��%����j��S�d^���C��J����I^��v;����!�K��s�'���Q�8X#�j�||1�o/��-h�]�f�(տ�KA)�a��^��ɖґ�f�z�)��&���s������TF;y��U��#�M��&���H�|):0��(�.ÿ)��əy#z�ܾ	з��ߵ��%��|"�42YZ�X�s�AyKa	!��\��+�$!� �K���LI*�'(���90T*��		
�[��H����K�{ �ά�.���qd�o��o�=�Rc�!�N)�DFE�\Ej�T��i�I�*1�����q�ڇ���}���Ua#V� �/��yk����z�р��=%��_���a�L�����1&G�	��ԛ��m�b�E��Ӂ�Lit�s��r0�.�V�.�83��e/����T,5_��d?+ \�6�v��zi~�Û��q���������(���z���a�!����+<?���]c;t�I�&OI��^3���o�ʗ
��I��.Zuց���*�@�����U[�՘V��A�d�O�:���q�nE)Ʊ"�Mc��ǳ$2p�֣T�#L�+��D�d���w�Mv�׽Ɍ[�Qv})d��Q��tv4�<�B�wVP��=Q����GhF#o�|�<&�I�/ ��M��F�:��![Sb�F2o`�H"���`Y�+.Fzb�gȕ�c1V/���50F,<"��n��>7���ߵb9Ke;�2�ǈ���\�G"�M��|_|���|�U�#�lN�zP�GHP�p�FT*����-�Qf�/��J N֍0�bz��#�x�3�U}�ma�^E�IQ�1���	�T��.��-�F0Eq�(�_   �� P�o�