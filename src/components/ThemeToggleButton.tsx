import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggleButton() {
    const { themeMode, toggleTheme } = useTheme();

    return (
        <button onClick={() => toggleTheme()}>
            {themeMode === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
