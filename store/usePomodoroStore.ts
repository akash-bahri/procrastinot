import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type PomodoroSession = {
    id: string;
    date: string;
    focusMinutes: number;
    taskTitle?: string;
    completedAt: string;
};

export type PomodoroSettings = {
    focusDuration: number;      // minutes
    shortBreakDuration: number; // minutes
    longBreakDuration: number;  // minutes
    sessionsBeforeLong: number;
};

interface PomodoroState {
    // Timer
    timeLeft: number;           // seconds
    isRunning: boolean;
    mode: TimerMode;
    sessionsCompleted: number;
    currentTaskTitle: string;

    // Settings
    settings: PomodoroSettings;

    // History
    sessions: PomodoroSession[];

    // Actions
    setTimeLeft: (t: number) => void;
    setIsRunning: (running: boolean) => void;
    setMode: (mode: TimerMode) => void;
    setCurrentTaskTitle: (title: string) => void;
    tick: () => void;
    completeSession: () => void;
    resetTimer: () => void;
    updateSettings: (s: Partial<PomodoroSettings>) => void;
    clearHistory: () => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLong: 4,
};

const generateId = () => 'pom-' + Math.random().toString(36).substr(2, 9);

export const usePomodoroStore = create<PomodoroState>()(
    persist(
        (set, get) => ({
            timeLeft: DEFAULT_SETTINGS.focusDuration * 60,
            isRunning: false,
            mode: 'focus',
            sessionsCompleted: 0,
            currentTaskTitle: '',
            settings: DEFAULT_SETTINGS,
            sessions: [],

            setTimeLeft: (t) => set({ timeLeft: t }),
            setIsRunning: (running) => set({ isRunning: running }),
            setMode: (mode) => {
                const { settings } = get();
                let duration = settings.focusDuration;
                if (mode === 'shortBreak') duration = settings.shortBreakDuration;
                if (mode === 'longBreak') duration = settings.longBreakDuration;
                set({ mode, timeLeft: duration * 60, isRunning: false });
            },
            setCurrentTaskTitle: (title) => set({ currentTaskTitle: title }),

            tick: () => {
                const { timeLeft } = get();
                if (timeLeft > 0) {
                    set({ timeLeft: timeLeft - 1 });
                }
            },

            completeSession: () => {
                const { mode, sessionsCompleted, settings, currentTaskTitle } = get();
                if (mode === 'focus') {
                    const newCount = sessionsCompleted + 1;
                    const session: PomodoroSession = {
                        id: generateId(),
                        date: new Date().toISOString().split('T')[0],
                        focusMinutes: settings.focusDuration,
                        taskTitle: currentTaskTitle || undefined,
                        completedAt: new Date().toISOString(),
                    };
                    const nextMode = newCount % settings.sessionsBeforeLong === 0 ? 'longBreak' : 'shortBreak';
                    const nextDuration = nextMode === 'longBreak' ? settings.longBreakDuration : settings.shortBreakDuration;
                    set({
                        sessionsCompleted: newCount,
                        sessions: [...get().sessions, session],
                        mode: nextMode,
                        timeLeft: nextDuration * 60,
                        isRunning: false,
                    });
                } else {
                    // Break finished → go back to focus
                    set({
                        mode: 'focus',
                        timeLeft: settings.focusDuration * 60,
                        isRunning: false,
                    });
                }
            },

            resetTimer: () => {
                const { mode, settings } = get();
                let duration = settings.focusDuration;
                if (mode === 'shortBreak') duration = settings.shortBreakDuration;
                if (mode === 'longBreak') duration = settings.longBreakDuration;
                set({ timeLeft: duration * 60, isRunning: false });
            },

            updateSettings: (s) => set((state) => {
                const newSettings = { ...state.settings, ...s };
                return {
                    settings: newSettings,
                    timeLeft: state.mode === 'focus'
                        ? newSettings.focusDuration * 60
                        : state.mode === 'shortBreak'
                            ? newSettings.shortBreakDuration * 60
                            : newSettings.longBreakDuration * 60,
                    isRunning: false,
                };
            }),

            clearHistory: () => set({ sessions: [], sessionsCompleted: 0 }),
        }),
        {
            name: 'pomodoro-storage',
            partialize: (state) => ({
                settings: state.settings,
                sessions: state.sessions,
                sessionsCompleted: state.sessionsCompleted,
            }),
        }
    )
);
