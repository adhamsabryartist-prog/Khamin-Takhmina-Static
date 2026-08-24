import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl, isServerlessMode } from '../apiConfig';

const AvatarContext = createContext<any>(null);

const DEFAULT_CONFIG = { avatars: {}, frames: {}, stars: {}, aiBotEnabled: false };

export const AvatarProvider = ({ children }: { children: React.ReactNode }) => {
  const [customConfig, setCustomConfig] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("khamin_config_cache");
      return cached ? JSON.parse(cached) : DEFAULT_CONFIG;
    } catch (e) {
      return DEFAULT_CONFIG;
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
    if (isServerlessMode()) {
      return customConfig || DEFAULT_CONFIG;
    }
    try {
      const res = await fetch(apiUrl('/api/config'));
      if (!res.ok) {
        return customConfig || DEFAULT_CONFIG;
      }
      const data = await res.json();
      updateConfig(data);
      return data;
    } catch (err) {
      return customConfig || DEFAULT_CONFIG;
    }
  };

  useEffect(() => {
    // Only auto-fetch if we have no cached config and not purely serverless
    if (!isServerlessMode()) {
      const cached = localStorage.getItem("khamin_config_cache");
      if (!cached) {
        refreshConfig();
      }
    }
  }, []);

  return (
    <AvatarContext.Provider value={{ customConfig, refreshConfig, setCustomConfig, updateConfig }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatarConfig = () => useContext(AvatarContext);
