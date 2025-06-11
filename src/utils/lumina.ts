export interface ThemeContextType {
    accentColor: AccentColor;
    toggleTheme: (mode?: 'light' | 'dark' | 'system') => void;
    setAccentColor: (color: AccentColor) => void;
    themeMode: 'light' | 'dark' | 'system';
}
export interface VersionInfo {
    update: boolean;
    version: string;
    newVersion: string;
    releaseNotes?: string;
}
export type AccentColor = "tomato" | "red" | "ruby" | "crimson" | "pink" | "plum" | "purple" | "violet" | "iris" | "indigo" | "blue" | "cyan" | "teal" | "jade" | "green" | "grass" | "brown" | "orange" | "sky" | "mint" | "lime" | "yellow" | "amber" | "gold" | "bronze" | "gray";