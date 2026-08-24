import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../apiConfig';

const AvatarContext = createContext<any>(null);

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
  const [customConfig, setCustomConfig] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("khamin_config_cache");
      return cached ? JSON.parse(cached) : { avatars: {}, frames: {}, stars: {}, aiBotEnabled: false };
    } catch (e) {
      return { avatars: {}, frames: {}, stars: {}, aiBotEnabled: false };
    }
  });

  const updateConfig = (newConfig: any) => {
    if (newConfig && typeof newConfig === 'object') {
      setCustomConfig(newConfig);
      try {
        localStorage.setItem("khamin_config_cache", JSON.stringify(newConfig));
      } catch (e) {}
    }
  };

  const refreshConfig = async () => {
    try {
      // 1. Attempt to fetch from API endpoint
      const res = await fetch(apiUrl('/api/config'));
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        updateConfig(data);
        return data;
      }
      
      // 2. If API returned non-JSON (e.g. 404/HTML on GitHub Pages), try static config.json
      const baseUrl = import.meta.env.BASE_URL || '/';
      const staticUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}uploads/config.json`;
      const staticRes = await fetch(staticUrl);
      const staticContentType = staticRes.headers.get("content-type") || "";
      if (staticRes.ok && (staticContentType.includes("application/json") || staticContentType.includes("text/plain") || !staticContentType.includes("text/html"))) {
        const staticData = await staticRes.json();
        updateConfig(staticData);
        return staticData;
      }
      
      return customConfig;
    } catch (err) {
      // Fallback silently to static file or existing config if network failed
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const staticUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}uploads/config.json`;
        const staticRes = await fetch(staticUrl);
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          updateConfig(staticData);
          return staticData;
        }
      } catch (e) {}
      return customConfig;
    }
  };

  useEffect(() => {
    // Only auto-fetch if we have no cached config
    const cached = localStorage.getItem("khamin_config_cache");
    if (!cached) {
      refreshConfig();
    }
  }, []);

  return (
    <AvatarContext.Provider value={{ customConfig, refreshConfig, setCustomConfig, updateConfig }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatarConfig = () => useContext(AvatarContext);
