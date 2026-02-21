'use client';

import { PageHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePomodoroStore, TimerMode } from '@/store/usePomodoroStore';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PomodoroPage() {
    const {
        timeLeft,
        isRunning,
        mode,
        sessionsCompleted,
        currentTaskTitle,
        settings,
        sessions,
        setIsRunning,
        setMode,
        setCurrentTaskTitle,
        tick,
        completeSession,
        resetTimer,
        updateSettings,
    } = usePomodoroStore();

    const [mounted, setMounted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => setMounted(true), []);

    // Timer tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                tick();
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            completeSession();
            try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.3;
                osc.start();
                setTimeout(() => { osc.stop(); ctx.close(); }, 500);
            } catch { }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, tick, completeSession, setIsRunning]);

    if (!mounted) {
        return (
            <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                <div className="animate-spin text-accent-primary text-4xl">●</div>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalTime = mode === 'focus'
        ? settings.focusDuration * 60
        : mode === 'shortBreak'
            ? settings.shortBreakDuration * 60
            : settings.longBreakDuration * 60;
    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]);
    const todayMinutes = todaySessions.reduce((acc, s) => acc + s.focusMinutes, 0);

    const modeColors: Record<TimerMode, string> = {
        focus: 'text-accent-primary',
        shortBreak: 'text-green-400',
        longBreak: 'text-blue-400',
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto">
            <PageHeader title="Pomodoro Timer" subtitle="Focus Mode" icon="⏱️" />

            <main className="flex flex-col items-center gap-8 pb-20">
                {/* Mode Tabs */}
                <div className="flex gap-2 p-1.5 rounded-xl bg-card-bg border border-border-color">
                    {[
                        { mode: 'focus' as TimerMode, label: 'Focus', icon: Brain },
                        { mode: 'shortBreak' as TimerMode, label: 'Short Break', icon: Coffee },
                        { mode: 'longBreak' as TimerMode, label: 'Long Break', icon: Coffee },
                    ].map(tab => (
                        <button
                            key={tab.mode}
                            onClick={() => setMode(tab.mode)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                mode === tab.mode
                                    ? "bg-accent-primary text-white shadow-md"
                                    : "text-text-secondary hover:bg-white/5"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Timer Ring */}
                <div className="relative w-72 h-72 md:w-80 md:h-80">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="6" />
                        <circle
                            cx="100" cy="100" r="90" fill="none" stroke="currentColor"
                            className={cn("transition-all duration-1000", modeColors[mode])}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-6xl md:text-7xl font-mono font-bold tabular-nums", modeColors[mode])}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                        <span className="text-sm text-text-secondary mt-2 uppercase tracking-widest">
                            {mode === 'focus' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </span>
                    </div>
                </div>

                {/* Task Link */}
                <input
                    value={currentTaskTitle}
                    onChange={(e) => setCurrentTaskTitle(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full max-w-md text-center bg-card-bg border border-border-color rounded-xl px-4 py-3 text-text-primary outline-none placeholder:text-text-secondary/40 focus:border-accent-primary/50 transition-colors"
                />

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button onClick={resetTimer} className="p-3 rounded-xl bg-card-bg border border-border-color text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all" title="Reset">
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={cn("px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all hover:brightness-110", isRunning ? "bg-red-500/80" : "bg-accent-primary")}
                    >
                        {isRunning ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-3 rounded-xl bg-card-bg border border-border-color text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all" title="Settings">
                        <Settings size={20} />
                    </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="w-full max-w-md bg-card-bg border border-border-color rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold text-text-primary">Timer Settings</h3>
                        {[
                            { label: 'Focus Duration (min)', key: 'focusDuration' as const, value: settings.focusDuration },
                            { label: 'Short Break (min)', key: 'shortBreakDuration' as const, value: settings.shortBreakDuration },
                            { label: 'Long Break (min)', key: 'longBreakDuration' as const, value: settings.longBreakDuration },
                            { label: 'Sessions before long break', key: 'sessionsBeforeLong' as const, value: settings.sessionsBeforeLong },
                        ].map(s => (
                            <div key={s.key} className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">{s.label}</span>
                                <input type="number" min={1} max={120} value={s.value}
                                    onChange={(e) => updateSettings({ [s.key]: parseInt(e.target.value) || 1 })}
                                    className="w-20 text-center bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-text-primary outline-none"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="w-full max-w-md grid grid-cols-3 gap-4">
                    <div className="bg-card-bg border border-border-color rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent-primary">{sessionsCompleted}</div>
                        <div className="text-xs text-text-secondary mt-1">Sessions</div>
                    </div>
                    <div className="bg-card-bg border border-border-color rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{todayMinutes}</div>
                        <div className="text-xs text-text-secondary mt-1">Minutes Today</div>
                    </div>
                    <div className="bg-card-bg border border-border-color rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-accent-tertiary">{todaySessions.length}</div>
                        <div className="text-xs text-text-secondary mt-1">Today&apos;s Sessions</div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
