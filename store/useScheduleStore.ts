import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Priority = 'high' | 'medium' | 'low' | 'none';

export type Task = {
    id: string;
    title: string;
    details: string[];
    completed: boolean;
    priority: Priority;
    labels: string[];
};

export type Day = {
    id: string;
    title: string;
    date: string;
    timeBudget: string;
    tasks: Task[];
};

export type DayTemplate = {
    id: string;
    name: string;
    tasks: Omit<Task, 'id' | 'completed'>[];
};

export type FilterType = 'all' | 'today';

interface ScheduleState {
    title: string;
    days: Day[];
    filter: FilterType;
    templates: DayTemplate[];

    // Actions
    setTitle: (title: string) => void;
    setFilter: (filter: FilterType) => void;
    addDay: () => void;
    deleteDay: (dayId: string) => void;
    updateDay: (dayId: string, updates: Partial<Day>) => void;
    addTask: (dayId: string) => void;
    deleteTask: (dayId: string, taskId: string) => void;
    updateTask: (dayId: string, taskId: string, updates: Partial<Task>) => void;
    toggleTask: (dayId: string, taskId: string, checked: boolean) => void;
    moveTask: (taskId: string, sourceDayId: string, targetDayId: string) => void;
    reorderTasks: (dayId: string, newTasks: Task[]) => void;
    saveAsTemplate: (dayId: string, templateName: string) => void;
    applyTemplate: (dayId: string, templateId: string) => void;
    deleteTemplate: (templateId: string) => void;
    reset: () => void;
}

const DEFAULT_STATE = {
    title: "My Schedule",
    days: [],
    filter: 'all' as FilterType,
    templates: [] as DayTemplate[],
};

// Utils
const generateId = () => 'id-' + Math.random().toString(36).substr(2, 9);
const getTodayDateString = () => {
    return new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
};
const getDayNameFromDate = (dateObj: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dateObj.getDay()];
};

export const useScheduleStore = create<ScheduleState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_STATE,

            setTitle: (title) => set({ title }),
            setFilter: (filter) => set({ filter }),

            addDay: () => set((state) => {
                let newDateStr;
                let newTitle = "New Day";

                if (state.days.length === 0) {
                    newDateStr = getTodayDateString();
                    newTitle = getDayNameFromDate(new Date());
                } else {
                    const lastDay = state.days[state.days.length - 1];
                    const lastDateStr = lastDay.date;
                    const currentYear = new Date().getFullYear();
                    let lastDate = new Date(`${lastDateStr}, ${currentYear}`);
                    if (isNaN(lastDate.getTime())) lastDate = new Date();

                    lastDate.setDate(lastDate.getDate() + 1);
                    newDateStr = lastDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
                    newTitle = getDayNameFromDate(lastDate);
                }

                const newDay: Day = {
                    id: generateId(),
                    title: newTitle,
                    date: newDateStr,
                    timeBudget: "2 Hours",
                    tasks: []
                };
                return { days: [...state.days, newDay] };
            }),

            deleteDay: (dayId) => set((state) => ({
                days: state.days.filter(d => d.id !== dayId)
            })),

            updateDay: (dayId, updates) => set((state) => ({
                days: state.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
            })),

            addTask: (dayId) => set((state) => ({
                days: state.days.map(d => {
                    if (d.id !== dayId) return d;
                    return {
                        ...d,
                        tasks: [...d.tasks, {
                            id: generateId(),
                            title: "",
                            details: [],
                            completed: false,
                            priority: 'none' as Priority,
                            labels: [],
                        }]
                    };
                })
            })),

            deleteTask: (dayId, taskId) => set((state) => ({
                days: state.days.map(d => {
                    if (d.id !== dayId) return d;
                    return { ...d, tasks: d.tasks.filter(t => t.id !== taskId) };
                })
            })),

            updateTask: (dayId, taskId, updates) => set((state) => ({
                days: state.days.map(d => {
                    if (d.id !== dayId) return d;
                    return {
                        ...d,
                        tasks: d.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
                    };
                })
            })),

            toggleTask: (dayId, taskId, checked) => set((state) => ({
                days: state.days.map(d => {
                    if (d.id !== dayId) return d;
                    return {
                        ...d,
                        tasks: d.tasks.map(t => t.id === taskId ? { ...t, completed: checked } : t)
                    };
                })
            })),

            moveTask: (taskId, sourceDayId, targetDayId) => set((state) => {
                // Quick move between lists logic (append to target)
                const sourceDay = state.days.find(d => d.id === sourceDayId);
                const targetDay = state.days.find(d => d.id === targetDayId);
                if (!sourceDay || !targetDay) return {};

                const task = sourceDay.tasks.find(t => t.id === taskId);
                if (!task) return {};

                return {
                    days: state.days.map(d => {
                        if (d.id === sourceDayId) {
                            return { ...d, tasks: d.tasks.filter(t => t.id !== taskId) };
                        }
                        if (d.id === targetDayId) {
                            return { ...d, tasks: [...d.tasks, task] };
                        }
                        return d;
                    })
                };
            }),

            reorderTasks: (dayId, newTasks) => set((state) => ({
                days: state.days.map(d => d.id === dayId ? { ...d, tasks: newTasks } : d)
            })),

            saveAsTemplate: (dayId, templateName) => set((state) => {
                const day = state.days.find(d => d.id === dayId);
                if (!day) return {};
                const template: DayTemplate = {
                    id: generateId(),
                    name: templateName,
                    tasks: day.tasks.map(t => ({
                        title: t.title,
                        details: [...t.details],
                        priority: t.priority,
                        labels: [...t.labels],
                    })),
                };
                return { templates: [...state.templates, template] };
            }),

            applyTemplate: (dayId, templateId) => set((state) => {
                const template = state.templates.find(t => t.id === templateId);
                if (!template) return {};
                return {
                    days: state.days.map(d => {
                        if (d.id !== dayId) return d;
                        const newTasks: Task[] = template.tasks.map(t => ({
                            ...t,
                            id: generateId(),
                            completed: false,
                        }));
                        return { ...d, tasks: [...d.tasks, ...newTasks] };
                    }),
                };
            }),

            deleteTemplate: (templateId) => set((state) => ({
                templates: state.templates.filter(t => t.id !== templateId)
            })),

            reset: () => set({ ...DEFAULT_STATE })
        }),
        {
            name: 'schedule-storage',
        }
    )
);
