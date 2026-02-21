import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CalendarEvent = {
    id: string;
    title: string;
    date: string;      // ISO date string: YYYY-MM-DD
    time?: string;      // Optional: "14:00"
    color: string;
};

const EVENT_COLORS = ['#114b5f', '#6d1a36', '#4a6741', '#7c5295', '#b8860b', '#2d5a7b'];

interface CalendarEventsState {
    events: CalendarEvent[];
    addEvent: (date: string, title?: string) => void;
    updateEvent: (id: string, updates: Partial<Pick<CalendarEvent, 'title' | 'time' | 'color'>>) => void;
    deleteEvent: (id: string) => void;
}

const generateId = () => 'ev-' + Math.random().toString(36).substr(2, 9);

export const useCalendarEventsStore = create<CalendarEventsState>()(
    persist(
        (set, get) => ({
            events: [],

            addEvent: (date, title) => set((state) => ({
                events: [...state.events, {
                    id: generateId(),
                    title: title || '',
                    date,
                    color: EVENT_COLORS[state.events.length % EVENT_COLORS.length],
                }]
            })),

            updateEvent: (id, updates) => set((state) => ({
                events: state.events.map(e => e.id === id ? { ...e, ...updates } : e)
            })),

            deleteEvent: (id) => set((state) => ({
                events: state.events.filter(e => e.id !== id)
            })),
        }),
        {
            name: 'calendar-events-storage',
        }
    )
);
