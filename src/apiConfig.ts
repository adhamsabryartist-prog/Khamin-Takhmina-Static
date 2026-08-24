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
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // In serverless / static hosting (e.g. GitHub Pages), resolve /api/image/ endpoints to static /game_images/ directory
  if (isServerlessMode() && cleanPath.startsWith('/api/image/')) {
    const parts = cleanPath.replace('/api/image/', '').split('/');
    if (parts.length >= 2) {
      const category = decodeURIComponent(parts[0]);
      let name = decodeURIComponent(parts.slice(1).join('/'));
      name = name.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
      cleanPath = `/game_images/${encodeURIComponent(category)}/${encodeURIComponent(name)}.jpg`;
    } else if (parts.length === 1 && parts[0]) {
      let name = decodeURIComponent(parts[0]).replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
      cleanPath = `/game_images/${encodeURIComponent(name)}.jpg`;
    }
  }

  // If in browser, prepend Vite's import.meta.env.BASE_URL if it's a relative path on GitHub Pages
  if (typeof window !== 'undefined') {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    if (baseUrl && baseUrl !== '/' && baseUrl !== '.') {
      return `${baseUrl}${cleanPath}`;
    }
  }

  const base = getApiBaseUrl();
  return `${base}${cleanPath}`;
};

