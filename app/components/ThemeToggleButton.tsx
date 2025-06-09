import { useTheme } from '@/lib/theme/ThemeContext';

export default function ThemeToggleButton() {
    const { themeMode, toggleTheme } = useTheme();

    return (
        <button onClick={() => toggleTheme()}>
            {themeMode === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
