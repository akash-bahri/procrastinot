'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <Sun className="w-5 h-5 text-yellow-600" />
            ) : (
                <Moon className="w-5 h-5 text-blue-400" />
            )}
        </button>
    );
}
