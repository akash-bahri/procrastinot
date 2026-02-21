'use client';

import { PageHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCalendarEventsStore, CalendarEvent } from '@/store/useCalendarEventsStore';
import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
    const { events, addEvent, updateEvent, deleteEvent } = useCalendarEventsStore();
    const [mounted, setMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => setMounted(true), []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarData = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const cells: { date: Date | null; dayOfMonth: number }[] = [];
        for (let i = 0; i < startPad; i++) {
            cells.push({ date: null, dayOfMonth: 0 });
        }
        for (let d = 1; d <= totalDays; d++) {
            cells.push({ date: new Date(year, month, d), dayOfMonth: d });
        }
        return cells;
    }, [year, month]);

    // Group events by date (YYYY-MM-DD)
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        events.forEach(e => {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        });
        return map;
    }, [events]);

    if (!mounted) {
        return (
            <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                <div className="animate-spin text-accent-primary text-4xl">●</div>
            </div>
        );
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => {
        setCurrentDate(new Date());
        const today = new Date();
        setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const todayISO = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const toISO = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

    const formatSelectedDate = (iso: string) => {
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto">
            <PageHeader title="Calendar" subtitle="Events" icon="📅" />

            <main className="pb-20">
                <div className="bg-card-bg border border-border-color rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-text-primary">{monthNames[month]} {year}</h2>
                        <button onClick={goToday} className="text-xs px-3 py-1 rounded-lg bg-accent-primary/20 text-accent-primary font-medium hover:bg-accent-primary/30 transition-all">Today</button>
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex gap-6 flex-col lg:flex-row">
                    {/* Calendar Grid */}
                    <div className="flex-1 bg-card-bg border border-border-color rounded-2xl p-4">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(d => (
                                <div key={d} className="text-center text-xs font-bold text-text-secondary/50 py-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarData.map((cell, i) => {
                                if (!cell.date) return <div key={`pad-${i}`} className="aspect-square" />;

                                const iso = toISO(cell.date);
                                const dayEvents = eventsByDate[iso] || [];
                                const isToday = iso === todayISO;
                                const isSelected = selectedDate === iso;

                                return (
                                    <button
                                        key={cell.dayOfMonth}
                                        onClick={() => setSelectedDate(iso)}
                                        className={cn(
                                            "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all",
                                            isToday && "ring-2 ring-accent-primary",
                                            isSelected && "bg-accent-primary/20",
                                            !isSelected && "hover:bg-white/5",
                                        )}
                                    >
                                        <span className={cn("text-sm font-medium", isToday ? "text-accent-primary font-bold" : "text-text-primary")}>
                                            {cell.dayOfMonth}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <div className="flex gap-0.5">
                                                {dayEvents.slice(0, 3).map(ev => (
                                                    <div key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color }} />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar: Selected Date Events */}
                    <div className="lg:w-80 bg-card-bg border border-border-color rounded-2xl p-5 h-fit">
                        {selectedDate ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-text-primary text-sm">{formatSelectedDate(selectedDate)}</h3>
                                        <span className="text-[10px] text-text-secondary">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <button
                                        onClick={() => addEvent(selectedDate)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-primary text-white hover:brightness-110 transition-all"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>

                                {selectedEvents.length === 0 ? (
                                    <p className="text-sm text-text-secondary/50 text-center py-6">No events on this day.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedEvents.map(ev => (
                                            <li key={ev.id} className="group flex items-start gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                                                <div className="w-1 h-full min-h-[24px] rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: ev.color }} />
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        value={ev.title}
                                                        onChange={(e) => updateEvent(ev.id, { title: e.target.value })}
                                                        placeholder="Event name..."
                                                        className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary/30"
                                                    />
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock size={10} className="text-text-secondary/40" />
                                                        <input
                                                            type="time"
                                                            value={ev.time || ''}
                                                            onChange={(e) => updateEvent(ev.id, { time: e.target.value })}
                                                            className="bg-transparent text-[10px] text-text-secondary outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteEvent(ev.id)}
                                                    className="p-0.5 opacity-0 group-hover:opacity-100 text-text-secondary/40 hover:text-red-400 transition-all flex-shrink-0"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-text-secondary/50 py-10">
                                <p className="text-sm">Click a date to view or add events</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
