import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface WindowSizeContextType {
  isLarge: boolean;
  setIsLarge: (val: boolean) => void;
}

const WindowSizeContext = createContext<WindowSizeContextType | undefined>(undefined);

export const useWindowSize = () => {
  const ctx = useContext(WindowSizeContext);
  if (!ctx) throw new Error('useWindowSize must be used within a WindowSizeProvider');
  return ctx;
};

export const WindowSizeProvider = ({ children }: { children: ReactNode }) => {
  const [isLarge, setIsLarge] = useState(() => {
    const saved = localStorage.getItem('isLarge');
    return saved !== null ? saved === 'true' : false;
  });
  useEffect(() => {
    if (!isLarge) return;
    const timer = setTimeout(() => {
      setIsLarge(false);
    }, 80000);
    return () => clearTimeout(timer);
  }, [isLarge]);

  useEffect(() => {
    localStorage.setItem('isLarge', String(isLarge));
  }, [isLarge]);

  useEffect(() => {
    const saveState = () => {
      localStorage.setItem('isLarge', String(isLarge));
    };
    window.addEventListener('beforeunload', saveState);
    return () => window.removeEventListener('beforeunload', saveState);
  }, [isLarge]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (isLarge === false) {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.invoke('resize-main-window', false);
      } else if (window.ipcRenderer) {
        window.ipcRenderer.invoke('resize-main-window', false);
      } else {
        console.warn('Aucune API IPC disponible');
      }
    }
  }, [isLarge]);

  return (
    <WindowSizeContext.Provider value={{ isLarge, setIsLarge }}>
      {children}
    </WindowSizeContext.Provider>
  );
}; 