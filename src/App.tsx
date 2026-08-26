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
        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
               <img src={`/Khamin-Takhmina-Static/speed-cups/${color}-cup.png`} className="w-10 md:w-14 h-auto object-contain" />
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
                  <img src="/Khamin-Takhmina-Static/speed-cups/cards-back.png" className="w-30 md:w-40 h-auto animate-pulse" />
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
                  <img src="/Khamin-Takhmina-Static/speed-cups/cards-back.png" className="w-30 md:w-40 h-auto filter brightness-75" />
                  <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {room.speedCupsTimer}
                    </div>
                  </div>
                </div>
              ) : (room.gameState === "speed_cups_playing" || room.gameState === "speed_cups_evaluating") ? (
                <div className="relative animate-scale-in">
                  <img src={`/Khamin-Takhmina-Static/speed-cups/${currentCard?.card_name}.png`} className="w-30 md:w-40 h-auto" />
                  {room.gameState === "speed_cups_playing" && (
                    <div className="absolute -top-2.5 -right-2.5 bg-red-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-[10px]">
                      {room.speedCupsTimer}
                    </div>
                  )}
                </div>
              ) : (
                <img src="/Khamin-Takhmina-Static/speed-cups/cards-back.png" className="w-20 md:w-28 h-auto opacity-40 grayscale" />
              )}
            </div>
          </div>
          
          {/* Bell Area - Positioned below card area with guaranteed vertical margin */}
          <div className="mt-4 mb-1 flex justify-center">
            <img 
              src={`/Khamin-Takhmina-Static/speed-cups/desktop-bell-${myDone ? 'after-clicked' : 'before-click'}.png`} 
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
               <img src={`/Khamin-Takhmina-Static/speed-cups/${color}-cup.png`} className="w-10 md:w-14 h-auto object-contain" />
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

  const [bombPartyRewardLevel, setBombPartyRewardLevel] = useState(() => parseInt(localStorage.getItem("khamin_bomb_party_reward_level") || "1"));
  const [bombPartyMatchPoints, setBombPartyMatchPoints] = useState(() => parseInt(localStorage.getItem("khamin_bomb_party_match_points") || "0"));
  const [beachRaceRewardLevel, setBeachRaceRewardLevel] = useState(() => parseInt(localStorage.getItem("khamin_beach_race_reward_level") || "1"));
  const [beachRaceMatchPoints, setBeachRaceMatchPoints] = useState(() => parseInt(localStorage.getItem("khamin_beach_race_match_points") || "0"));
  const [wordleRewardLevel, setWordleRewardLevel] = useState(() => parseInt(localStorage.getItem("khamin_wordle_reward_level") || "1"));
  const [wordleMatchPoints, setWordleMatchPoints] = useState(() => parseInt(localStorage.getItem("khamin_wordle_match_points") || "0"));
  const [connectFourWordsRewardLevel, setConnectFourWordsRewardLevel] = useState(() => parseInt(localStorage.getItem("khamin_connect_four_words_reward_level") || "1"));
  const [connectFourWordsMatchPoints, setConnectFourWordsMatchPoints] = useState(() => parseInt(localStorage.getItem("khamin_connect_four_words_match_points") || "0"));
  const [spaceWarRewardLevel, setSpaceWarRewardLevel] = useState(() => parseInt(localStorage.getItem("khamin_space_war_reward_level") || "1"));
  const [spaceWarMatchPoints, setSpaceWarMatchPoints] = useState(() => parseInt(localStorage.getItem("khamin_space_war_match_points") || "0"));
  const [puzzleRewardLevel, setPuzzleRewardLevel] = useState(() => parseInt(localStorage.getItem("khamin_puzzle_reward_level") || "1"));
  const [puzzleMatchPoints, setPuzzleMatchPoints] = useState(() => parseInt(localStorage.getItem("khamin_puzzle_match_points") || "0"));

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
                        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
                        <img src="/Khamin-Takhmina-Static/dots-and-boxes-logo.png" className="w-3 h-3 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة نقطة وخط</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.dotsWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src="/Khamin-Takhmina-Static/speed-cups/speed-cups-logo.png" className="w-3.5 h-3.5 object-contain inline" />
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
                        <img src="/Khamin-Takhmina-Static/word-le-logo.png" className="w-3.5 h-3.5 object-contain inline" />
                        <span className="text-gray-500 font-extrabold">تخمينة كلمة لي</span>
                      </span>
                      <span className="font-black text-brown-dark">{data.wordleWins || 0}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-xl border-b-1 border-gray-100/50">
                      <span className="flex items-center gap-1.5 text-[11px] md:text-xs">
                        <img src="/Khamin-Takhmina-Static/connect-4-logo.png" className="w-3.5 h-3.5 object-contain inline" />
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
                              src={`/Khamin-Takhmina-Static/frames/${cat.id}.png`}
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
                        <img src="/Khamin-Takhmina-Static/Takhmina_coin_02.png" className="w-5 h-5" />
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
                        src="/Khamin-Takhmina-Static/Takhmina_coin_02.png"
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
                        <img src="/Khamin-Takhmina-Static/Takhmina_coin_02.png" className="w-6 h-6" />
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
