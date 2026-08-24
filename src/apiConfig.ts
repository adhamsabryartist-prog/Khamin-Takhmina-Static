// Helper to resolve the Backend Server URL for WebSockets and REST API
// In unified single-server mode (or AI Studio Preview), it defaults to window.location.origin
// In decoupled mode (Static Site on Render/Vercel + Web Service on Render), it reads from import.meta.env.VITE_SERVER_URL

export const isServerlessMode = (): boolean => {
  if (typeof window === 'undefined' || !window.location) return false;
  const host = window.location.hostname;
  // If hosted on GitHub Pages or custom domain without VITE_SERVER_URL
  if (host.includes("github.io")) return true;
  // If no backend URL configured and not on local container
  const envUrl = import.meta.env.VITE_SERVER_URL;
  if (!envUrl && !host.includes("run.app") && !host.includes("googleusercontent.com") && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("ais-")) {
    return true;
  }
  return false;
};

export const DEFAULT_CATEGORIES = [
  { id: "animals", name: "حيوانات", icon: "🐘" },
  { id: "birds", name: "طيور", icon: "🦜" },
  { id: "food", name: "أكلات", icon: "🍕" },
  { id: "football", name: "كرة القدم", icon: "⚽" },
  { id: "insects", name: "حشرات", icon: "🐞" },
  { id: "objects", name: "جماد", icon: "📦" },
  { id: "plants", name: "نبات", icon: "🌿" },
  { id: "people", name: "اشخاص", icon: "👥" },
];

export const getApiBaseUrl = (): string => {
  // If running inside AI Studio preview or local development, always use the local container backend
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (
      host.includes("run.app") ||
      host.includes("googleusercontent.com") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes("ais-")
    ) {
      return window.location.origin;
    }
  }

  const envUrl = import.meta.env.VITE_SERVER_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
};

export const apiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return `${base}${cleanPath}`;
};

