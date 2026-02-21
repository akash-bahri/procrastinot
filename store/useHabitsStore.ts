import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Habit = {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    completions: Record<string, boolean>; // dateString -> completed
};

interface HabitsState {
    habits: Habit[];

    // Actions
    addHabit: (name: string, color?: string) => void;
    deleteHabit: (id: string) => void;
    updateHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'color'>>) => void;
    toggleCompletion: (habitId: string, date: string) => void;
}

const COLORS = ['#114b5f', '#A3A886', '#6d1a36', '#63B3ED', '#D69E2E', '#9F7AEA', '#ED8936', '#48BB78'];
const generateId = () => 'hab-' + Math.random().toString(36).substr(2, 9);

// Helpers (exported for use in components)
export function getStreak(habit: Habit): number {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (habit.completions[key]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export function getBestStreak(habit: Habit): number {
    const dates = Object.keys(habit.completions)
        .filter(k => habit.completions[k])
        .sort();
    if (dates.length === 0) return 0;

    let best = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            current++;
            best = Math.max(best, current);
        } else {
            current = 1;
        }
    }
    return best;
}

export function getTodayStr(): string {
    return new Date().toISOString().split('T')[0];
}

export const useHabitsStore = create<HabitsState>()(
    persist(
        (set, get) => ({
            habits: [],

            addHabit: (name, color) => set((state) => ({
                habits: [...state.habits, {
                    id: generateId(),
                    name,
                    color: color || COLORS[state.habits.length % COLORS.length],
                    createdAt: new Date().toISOString(),
                    completions: {},
                }]
            })),

            deleteHabit: (id) => set((state) => ({
                habits: state.habits.filter(h => h.id !== id)
            })),

            updateHabit: (id, updates) => set((state) => ({
                habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
            })),

            toggleCompletion: (habitId, date) => set((state) => ({
                habits: state.habits.map(h => {
                    if (h.id !== habitId) return h;
                    const newCompletions = { ...h.completions };
                    newCompletions[date] = !newCompletions[date];
                    return { ...h, completions: newCompletions };
                })
            })),
        }),
        {
            name: 'habits-storage',
        }
    )
);
