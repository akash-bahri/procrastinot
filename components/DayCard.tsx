'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Day, useScheduleStore } from '@/store/useScheduleStore';
import { TaskItem } from './TaskItem';
import { Clock, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface DayCardProps {
    day: Day;
    index: number;
}

export function DayCard({ day, index }: DayCardProps) {
    const { updateDay, deleteDay, addTask } = useScheduleStore();

    const taskIds = useMemo(() => day.tasks.map(t => t.id), [day.tasks]);

    const { setNodeRef, isOver } = useDroppable({
        id: day.id,
        data: { type: 'Day', day },
    });

    const isToday = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
        return day.date.includes(todayStr) || todayStr.includes(day.date);
    }, [day.date]);

    const completedCount = useMemo(() => day.tasks.filter(t => t.completed).length, [day.tasks]);
    const totalCount = day.tasks.length;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col rounded-2xl border transition-all overflow-hidden animate-fade-in",
                "bg-card-bg/80 backdrop-blur-sm shadow-sm hover:shadow-xl",
                isOver && "ring-2 ring-accent-primary/50 scale-[1.01]",
                isToday
                    ? "border-accent-primary/50 shadow-accent-primary/10 shadow-lg"
                    : "border-white/10 hover:border-white/20"
            )}
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
        >
            {/* Today indicator strip */}
            {isToday && (
                <div className="h-0.5 bg-gradient-to-r from-accent-primary via-accent-primary/50 to-transparent" />
            )}

            {/* Header */}
            <div className="p-4 flex items-center gap-3">
                {/* Date chip */}
                <div
                    className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex-shrink-0",
                        isToday
                            ? "bg-accent-primary text-white"
                            : "bg-white/5 text-text-secondary border border-white/10"
                    )}
                >
                    {day.date}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <h2
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm font-bold text-text-primary truncate outline-none hover:text-accent-primary transition-colors"
                        onBlur={(e) => updateDay(day.id, { title: e.currentTarget.textContent || "Untitled" })}
                    >
                        {day.title}
                    </h2>
                </div>

                {/* Progress chip */}
                {totalCount > 0 && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                        completedCount === totalCount
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/5 text-text-secondary"
                    )}>
                        <CheckCircle2 size={10} />
                        {completedCount}/{totalCount}
                    </div>
                )}

                {/* Time budget */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-text-secondary/70 flex-shrink-0">
                    <Clock size={10} />
                    <span
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none min-w-[2ch] text-center"
                        onBlur={(e) => updateDay(day.id, { timeBudget: e.currentTarget.textContent || "0 Hours" })}
                    >
                        {day.timeBudget.replace(/Hours/i, '').trim()}
                    </span>
                    <span className="opacity-60">h</span>
                </div>

                {/* Delete */}
                <button
                    onClick={() => deleteDay(day.id)}
                    className="p-1 rounded-lg text-text-secondary/30 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Day"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {/* Task List */}
            <div className={cn(
                "flex-1 px-3 pb-2 min-h-[120px] flex flex-col gap-2 transition-colors",
                isOver && "bg-accent-primary/5"
            )}>
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {day.tasks.map(task => (
                        <TaskItem key={task.id} task={task} dayId={day.id} />
                    ))}
                </SortableContext>

                {day.tasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-secondary/30 py-6 border border-dashed border-white/10 rounded-xl mx-1 my-1">
                        <span className="text-xs">No tasks yet</span>
                        <span className="text-[10px] mt-0.5">Click + or drop items here</span>
                    </div>
                )}
            </div>

            {/* Add Task Button */}
            <button
                onClick={() => addTask(day.id)}
                className={cn(
                    "mx-3 mb-3 py-2 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all",
                    "border border-dashed border-white/10 text-text-secondary/50",
                    "hover:border-accent-primary/50 hover:text-accent-primary hover:bg-accent-primary/5"
                )}
            >
                <Plus size={13} />
                Add Task
            </button>
        </div>
    );
}
