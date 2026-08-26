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

  // If in Serverless / GitHub Pages mode and requesting an image endpoint:
  // e.g. /api/image/animals/%D8%A3%D8%B1%D9%86%D8%A8 -> /game_images/animals/أرنب.jpg
  if (isServerlessMode()) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    if (cleanPath.startsWith('/api/image/')) {
      const parts = cleanPath.replace('/api/image/', '').split('/');
      if (parts.length >= 2) {
        const category = decodeURIComponent(parts[0]);
        let name = decodeURIComponent(parts.slice(1).join('/'));
        if (!name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          name = `${name}.jpg`;
        }
        return `${prefix}game_images/${encodeURIComponent(category)}/${encodeURIComponent(name)}`;
      } else if (parts.length === 1) {
        let name = decodeURIComponent(parts[0]);
        if (!name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          name = `${name}.jpg`;
        }
        return `${prefix}game_images/${encodeURIComponent(name)}`;
      }
    }

    // Static assets fallback with proper BASE_URL prefix (e.g. /uploads/ or /assets/)
    if (cleanPath.startsWith('/assets/') || cleanPath.startsWith('/uploads/') || cleanPath.startsWith('/sounds/') || cleanPath.startsWith('/game_images/')) {
      return `${prefix}${cleanPath.replace(/^\/+/, '')}`;
    }
  }

  return `${base}${cleanPath}`;
};

