import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StickyTask = {
    id: string;
    title: string;
    completed: boolean;
    color: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

const STICKY_COLORS = [
    '#114b5f', // teal
    '#6d1a36', // amaranth
    '#A3A886', // olive
    '#4a6741', // forest
    '#7c5295', // purple
    '#b8860b', // gold
    '#2d5a7b', // steel blue
    '#8b4513', // sienna
];

interface TaskBoardState {
    tasks: StickyTask[];
    addTask: () => void;
    updateTask: (id: string, updates: Partial<Pick<StickyTask, 'title' | 'completed' | 'color'>>) => void;
    moveTask: (id: string, x: number, y: number) => void;
    resizeTask: (id: string, width: number, height: number) => void;
    deleteTask: (id: string) => void;
    clearCompleted: () => void;
}

const generateId = () => 'st-' + Math.random().toString(36).substr(2, 9);

export const useTaskBoardStore = create<TaskBoardState>()(
    persist(
        (set, get) => ({
            tasks: [],

            addTask: () => set((state) => {
                // Place new tasks in a staggered grid pattern
                const count = state.tasks.length;
                const col = count % 5;
                const row = Math.floor(count / 5);
                const x = 40 + col * 200 + (Math.random() * 20 - 10);
                const y = 20 + row * 180 + (Math.random() * 20 - 10);

                return {
                    tasks: [...state.tasks, {
                        id: generateId(),
                        title: '',
                        completed: false,
                        color: STICKY_COLORS[count % STICKY_COLORS.length],
                        x: Math.round(x),
                        y: Math.round(y),
                        width: 170,
                        height: 80,
                    }]
                };
            }),

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
            })),

            moveTask: (id, x, y) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, x, y } : t)
            })),

            resizeTask: (id, width, height) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, width, height } : t)
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id)
            })),

            clearCompleted: () => set((state) => ({
                tasks: state.tasks.filter(t => !t.completed)
            })),
        }),
        {
            name: 'taskboard-storage',
        }
    )
);
