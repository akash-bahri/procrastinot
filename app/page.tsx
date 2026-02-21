'use client';

import { PageHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useTaskBoardStore } from '@/store/useTaskBoardStore';
import { useCalendarEventsStore } from '@/store/useCalendarEventsStore';
import { useHabitsStore, getStreak, getTodayStr } from '@/store/useHabitsStore';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { useNotesStore } from '@/store/useNotesStore';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { StickyNote, FileText, Timer, Target, Check, Flame, ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { tasks, updateTask } = useTaskBoardStore();
  const { events } = useCalendarEventsStore();
  const { habits, toggleCompletion } = useHabitsStore();
  const { sessions } = usePomodoroStore();
  const { notes } = useNotesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const todayIso = getTodayStr();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Tasks from task board
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const incompleteTasks = tasks.filter(t => !t.completed);

  // Today's habits
  const todayHabitsDone = habits.filter(h => h.completions[todayIso]).length;

  // Today's pomodoro
  const todaySessions = sessions.filter(s => s.date === todayIso);
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.focusMinutes, 0);

  // Upcoming events (today + next 14 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 14);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const futureStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;

    return events
      .filter(e => e.date >= todayStr && e.date <= futureStr)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
  }, [events]);

  // Mini calendar data (current month)
  const miniCalData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: { dayOfMonth: number; iso: string; hasEvent: boolean }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ dayOfMonth: 0, iso: '', hasEvent: false });
    for (let d = 1; d <= totalDays; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dayOfMonth: d, iso, hasEvent: events.some(e => e.date === iso) });
    }
    return { cells, monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [events]);

  const todayISO = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const formatEventDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    if (iso === todayISO) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    if (iso === tomorrowISO) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin text-accent-primary text-4xl">●</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader title={greeting} subtitle="Dashboard" icon="🏠" />

      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {/* Tasks Checklist Widget */}
        <div className="md:col-span-2 bg-card-bg border border-border-color rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StickyNote size={18} className="text-accent-primary" />
              <h2 className="font-bold text-text-primary">Tasks</h2>
              <span className="text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded-full">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Link href="/tasks" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              Open Board <ArrowRight size={12} />
            </Link>
          </div>

          {totalTasks > 0 ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>{completedTasks} of {totalTasks} completed</span>
                  <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-full bg-accent-primary rounded-full transition-all duration-500"
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
                </div>
              </div>
              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {/* Show incomplete first, then completed */}
                {[...incompleteTasks, ...tasks.filter(t => t.completed)].slice(0, 10).map(task => (
                  <li key={task.id}
                    onClick={() => updateTask(task.id, { completed: !task.completed })}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                      task.completed ? "bg-emerald-500/5" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                      task.completed ? "bg-emerald-500 border-emerald-500" : "border-text-secondary/30"
                    )}>
                      {task.completed && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.color }} />
                      <span className={cn("text-sm truncate", task.completed && "line-through text-text-secondary")}>
                        {task.title || 'Untitled task'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {totalTasks > 10 && (
                <p className="text-xs text-text-secondary/50 text-center mt-2">+ {totalTasks - 10} more tasks</p>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-text-secondary/50">
              <p className="text-sm">No tasks on the board yet</p>
              <Link href="/tasks" className="text-xs text-accent-primary mt-2 inline-block hover:underline">
                Go to Task Board →
              </Link>
            </div>
          )}
        </div>

        {/* Mini Calendar + Upcoming Events Widget */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6 row-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-accent-secondary" />
              <h2 className="font-bold text-text-primary">Calendar</h2>
            </div>
            <Link href="/calendar" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              Full View <ArrowRight size={12} />
            </Link>
          </div>

          {/* Mini Calendar Grid */}
          <div className="mb-5">
            <p className="text-xs text-text-secondary font-medium mb-2">{miniCalData.monthName}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-bold text-text-secondary/40 py-0.5">{d}</div>
              ))}
              {miniCalData.cells.map((cell, i) => {
                if (cell.dayOfMonth === 0) return <div key={`p-${i}`} />;
                const isToday = cell.iso === todayISO;
                return (
                  <div
                    key={cell.dayOfMonth}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg text-[10px] font-medium relative",
                      isToday && "bg-accent-primary text-white font-bold",
                      !isToday && "text-text-secondary"
                    )}
                  >
                    {cell.dayOfMonth}
                    {cell.hasEvent && (
                      <div className={cn("w-1 h-1 rounded-full absolute bottom-0.5", isToday ? "bg-white/70" : "bg-accent-primary")} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Upcoming</h3>
            {upcomingEvents.length > 0 ? (
              <ul className="space-y-2 max-h-[260px] overflow-y-auto">
                {upcomingEvents.slice(0, 8).map(ev => (
                  <li key={ev.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
                    <div className="w-1 h-full min-h-[28px] rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: ev.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{ev.title || 'Untitled event'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-secondary">{formatEventDate(ev.date)}</span>
                        {ev.time && (
                          <span className="flex items-center gap-0.5 text-[10px] text-text-secondary/60">
                            <Clock size={8} /> {ev.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-text-secondary/40 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Habits Widget */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-accent-secondary" />
              <h2 className="font-bold text-text-primary">Habits</h2>
            </div>
            <Link href="/habits" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {habits.length > 0 ? (
            <ul className="space-y-2">
              {habits.slice(0, 5).map(habit => {
                const done = habit.completions[todayIso];
                const streak = getStreak(habit);
                return (
                  <li key={habit.id}
                    onClick={() => toggleCompletion(habit.id, todayIso)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all",
                      done ? "bg-accent-primary/10" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                    <span className={cn("text-sm flex-1", done && "line-through text-text-secondary")}>{habit.name}</span>
                    {streak > 0 && (
                      <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                        <Flame size={10} /> {streak}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary/50 text-center py-4">No habits yet</p>
          )}
          <div className="mt-3 text-xs text-text-secondary text-center">
            {todayHabitsDone}/{habits.length} done today
          </div>
        </div>

        {/* Pomodoro Widget */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-accent-tertiary" />
              <h2 className="font-bold text-text-primary">Focus</h2>
            </div>
            <Link href="/pomodoro" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              Start Timer <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-accent-primary">{todayFocusMinutes}</div>
              <div className="text-[10px] text-text-secondary mt-1">Minutes Today</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-accent-tertiary">{todaySessions.length}</div>
              <div className="text-[10px] text-text-secondary mt-1">Sessions Today</div>
            </div>
          </div>
        </div>

        {/* Notes Widget */}
        <div className="bg-card-bg border border-border-color rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-yellow-400" />
              <h2 className="font-bold text-text-primary">Notes</h2>
            </div>
            <Link href="/notes" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {notes.length > 0 ? (
            <ul className="space-y-2">
              {notes.slice(0, 4).map(note => (
                <li key={note.id} className="text-sm text-text-primary p-2 rounded-lg bg-white/5 truncate">
                  {note.title || 'Untitled'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary/50 text-center py-4">No notes yet</p>
          )}
          <div className="mt-3 text-xs text-text-secondary text-center">{notes.length} notes</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
