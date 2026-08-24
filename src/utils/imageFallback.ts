// =========================================================
// Image URL Resolver & Static SVG Generator for Serverless Mode
// Ensures 100% of images, category words & avatars render cleanly
// =========================================================

import { getApiBaseUrl, isServerlessMode } from "../apiConfig";

const CATEGORY_ICONS: Record<string, { icon: string; bg1: string; bg2: string; text: string }> = {
  animals: { icon: "🐘", bg1: "#10b981", bg2: "#059669", text: "#ffffff" },
  birds: { icon: "🦜", bg1: "#06b6d4", bg2: "#0891b2", text: "#ffffff" },
  food: { icon: "🍕", bg1: "#f59e0b", bg2: "#d97706", text: "#ffffff" },
  football: { icon: "⚽", bg1: "#3b82f6", bg2: "#2563eb", text: "#ffffff" },
  insects: { icon: "🐞", bg1: "#ec4899", bg2: "#db2777", text: "#ffffff" },
  objects: { icon: "📦", bg1: "#8b5cf6", bg2: "#7c3aed", text: "#ffffff" },
  plants: { icon: "🌿", bg1: "#84cc16", bg2: "#65a30d", text: "#ffffff" },
  people: { icon: "👥", bg1: "#f43f5e", bg2: "#e11d48", text: "#ffffff" },
  "حيوانات": { icon: "🐘", bg1: "#10b981", bg2: "#059669", text: "#ffffff" },
  "طيور": { icon: "🦜", bg1: "#06b6d4", bg2: "#0891b2", text: "#ffffff" },
  "أكلات": { icon: "🍕", bg1: "#f59e0b", bg2: "#d97706", text: "#ffffff" },
  "كرة القدم": { icon: "⚽", bg1: "#3b82f6", bg2: "#2563eb", text: "#ffffff" },
  "حشرات": { icon: "🐞", bg1: "#ec4899", bg2: "#db2777", text: "#ffffff" },
  "جماد": { icon: "📦", bg1: "#8b5cf6", bg2: "#7c3aed", text: "#ffffff" },
  "نبات": { icon: "🌿", bg1: "#84cc16", bg2: "#65a30d", text: "#ffffff" },
  "اشخاص": { icon: "👥", bg1: "#f43f5e", bg2: "#e11d48", text: "#ffffff" },
};

/**
 * Generates an elegant SVG Data URL for any word/category
 */
export function generateCardSvg(wordName: string, category: string = "animals"): string {
  const meta = CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS["animals"];
  const cleanName = wordName || "تخمينة";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${meta.bg1}" />
      <stop offset="100%" stop-color="${meta.bg2}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Card Background -->
  <rect width="400" height="400" rx="36" fill="url(#cardGrad)" />
  <rect width="400" height="400" rx="36" fill="url(#glow)" />

  <!-- Inner border -->
  <rect x="12" y="12" width="376" height="376" rx="28" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.3" />

  <!-- Category Emoji Badge -->
  <g filter="url(#shadow)">
    <circle cx="200" cy="140" r="70" fill="#ffffff" fill-opacity="0.95" />
    <text x="200" y="165" font-size="75" text-anchor="middle" dominant-baseline="central">${meta.icon}</text>
  </g>

  <!-- Word Text Container -->
  <g filter="url(#shadow)">
    <rect x="30" y="250" width="340" height="85" rx="20" fill="#ffffff" fill-opacity="0.95" />
    <text x="200" y="298" font-family="'Cairo', 'Tajawal', system-ui, sans-serif" font-weight="900" font-size="34" fill="#1e293b" text-anchor="middle" dominant-baseline="central">
      ${cleanName}
    </text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Resolves game images, routing static images and fallback SVGs cleanly
 */
export function resolveGameImageUrl(urlOrPath: string | null | undefined): string {
  if (!urlOrPath) return generateCardSvg("تخمينة", "animals");

  // 1. Data URLs & Web URLs
  if (
    urlOrPath.startsWith("data:") ||
    urlOrPath.startsWith("http://") ||
    urlOrPath.startsWith("https://") ||
    urlOrPath.startsWith("blob:")
  ) {
    return urlOrPath;
  }

  // 2. Handle /api/image/:category/:name routes
  if (urlOrPath.includes("/api/image/")) {
    const parts = urlOrPath.replace(/^.*\/api\/image\//, "").split("/");
    let category = "animals";
    let imgName = "تخمينة";

    if (parts.length >= 2) {
      category = decodeURIComponent(parts[0]);
      imgName = decodeURIComponent(parts[1]);
    } else if (parts.length === 1) {
      imgName = decodeURIComponent(parts[0]);
    }

    // In Serverless mode (GitHub Pages), generate an instant SVG card
    if (isServerlessMode()) {
      return generateCardSvg(imgName, category);
    }

    // Otherwise route through API url
    const base = getApiBaseUrl();
    const cleanPath = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
    return `${base}${cleanPath}`;
  }

  // 3. Regular static asset (e.g. /assets/avatar-free-boy-01.png)
  if (urlOrPath.startsWith("/")) {
    return urlOrPath;
  }

  return `/${urlOrPath}`;
}
