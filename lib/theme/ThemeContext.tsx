import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeContextType } from '../lumina';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [accentColor, setAccentColorState] = useState<string>('amber');
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('dark');

    useEffect(() => {
        const storedThemeMode = localStorage.getItem('lumina-theme') || 'dark';
        const storedAccentColor = localStorage.getItem('accentColor');

        setThemeMode(storedThemeMode as 'light' | 'dark' | 'system');
        if (storedAccentColor) setAccentColorState(storedAccentColor);

        applyThemeMode(storedThemeMode as 'light' | 'dark' | 'system');
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
    }, [accentColor]);

    useEffect(() => {
        if (themeMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                applyThemeMode('system');
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [themeMode]);

    const applyThemeMode = (mode: 'light' | 'dark' | 'system') => {
        const root = document.documentElement;
        const resolved = mode === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : mode;

        root.setAttribute('data-theme', resolved);
    };

    const toggleTheme = (mode?: 'light' | 'dark' | 'system') => {
        const newMode = mode || (themeMode === 'light' ? 'dark' : 'light');
        setThemeMode(newMode);
        localStorage.setItem('lumina-theme', newMode);
        applyThemeMode(newMode);
    };

    const changeAccentColor = (color: string) => {
        setAccentColorState(color);
        localStorage.setItem('accentColor', color);
    };

    return (
        <ThemeContext.Provider value={{ accentColor, toggleTheme, setAccentColor: changeAccentColor, themeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
