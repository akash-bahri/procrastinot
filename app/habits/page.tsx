'use client';

import { PageHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useHabitsStore, getStreak, getBestStreak, getTodayStr } from '@/store/useHabitsStore';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Flame, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HabitsPage() {
    const { habits, addHabit, deleteHabit, toggleCompletion } = useHabitsStore();
    const [mounted, setMounted] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                <div className="animate-spin text-accent-primary text-4xl">●</div>
            </div>
        );
    }

    const today = getTodayStr();

    // Generate last 30 days
    const last30Days: string[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last30Days.push(d.toISOString().split('T')[0]);
    }

    // Last 7 days for the compact view
    const last7Days = last30Days.slice(-7);

    const handleAdd = () => {
        if (newHabitName.trim()) {
            addHabit(newHabitName.trim());
            setNewHabitName('');
            setShowAdd(false);
        }
    };

    // Overall today completion
    const todayTotal = habits.length;
    const todayDone = habits.filter(h => h.completions[today]).length;
    const todayPercent = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto">
            <PageHeader title="Habit Tracker" subtitle="Build Consistency" icon="🎯">
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white font-medium text-sm hover:brightness-110 transition-all"
                >
                    <Plus size={16} />
                    New Habit
                </button>
            </PageHeader>

            {/* Add Habit Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
                    <div className="bg-card-bg border border-border-color rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text-primary">New Habit</h3>
                            <button onClick={() => setShowAdd(false)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
                        </div>
                        <input
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder="e.g., Read 30 minutes"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-primary outline-none placeholder:text-text-secondary/40 mb-4"
                            autoFocus
                        />
                        <button
                            onClick={handleAdd}
                            className="w-full py-3 rounded-xl bg-accent-primary text-white font-bold hover:brightness-110 transition-all"
                        >
                            Add Habit
                        </button>
                    </div>
                </div>
            )}

            <main className="space-y-6 pb-20">
                {/* Today Summary */}
                <div className="bg-card-bg border border-border-color rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-text-secondary">Today&apos;s Progress</span>
                        <span className="text-2xl font-bold text-accent-primary">{todayPercent}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden bg-white/5">
                        <div className="h-full bg-accent-primary transition-all duration-500" style={{ width: `${todayPercent}%` }} />
                    </div>
                    <div className="text-xs text-text-secondary mt-2">{todayDone} of {todayTotal} habits completed today</div>
                </div>

                {/* Habits List */}
                {habits.length === 0 ? (
                    <div className="text-center py-20 text-text-secondary/50 border border-dashed border-border-color/30 rounded-3xl">
                        <Trophy size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No habits yet. Add your first habit to start tracking!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {habits.map(habit => {
                            const streak = getStreak(habit);
                            const best = getBestStreak(habit);

                            return (
                                <div key={habit.id} className="bg-card-bg border border-border-color rounded-2xl p-5 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                                            <span className="font-bold text-text-primary">{habit.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-orange-400">
                                                <Flame size={16} />
                                                <span className="text-sm font-bold">{streak}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-yellow-400">
                                                <Trophy size={14} />
                                                <span className="text-xs font-medium">{best}</span>
                                            </div>
                                            <button
                                                onClick={() => deleteHabit(habit.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 7-day grid */}
                                    <div className="flex gap-2">
                                        {last7Days.map(date => {
                                            const done = habit.completions[date];
                                            const isToday = date === today;
                                            const d = new Date(date);
                                            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => toggleCompletion(habit.id, date)}
                                                    className={cn(
                                                        "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all",
                                                        done ? "bg-accent-primary/20" : "bg-white/5 hover:bg-white/10",
                                                        isToday && "ring-2 ring-accent-primary/50"
                                                    )}
                                                >
                                                    <span className="text-[10px] text-text-secondary">{dayLabel}</span>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                                                        done ? "bg-accent-primary text-white" : "bg-white/10 text-text-secondary/50"
                                                    )}>
                                                        {done ? '✓' : d.getDate()}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* 30-day mini grid */}
                                    <div className="mt-3 flex gap-[3px] flex-wrap">
                                        {last30Days.map(date => (
                                            <div
                                                key={date}
                                                className={cn(
                                                    "w-3 h-3 rounded-sm transition-all cursor-pointer",
                                                    habit.completions[date] ? "" : "bg-white/5"
                                                )}
                                                style={habit.completions[date] ? { backgroundColor: habit.color } : undefined}
                                                title={`${date}: ${habit.completions[date] ? 'Done' : 'Not done'}`}
                                                onClick={() => toggleCompletion(habit.id, date)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
