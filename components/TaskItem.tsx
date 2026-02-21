'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Check, Flag } from 'lucide-react';
import { Task, Priority, useScheduleStore } from '@/store/useScheduleStore';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface TaskItemProps {
    task: Task;
    dayId: string;
}

const PRIORITY_CONFIG: Record<Priority, { color: string; border: string; label: string }> = {
    high: { color: 'text-red-400', border: 'border-l-red-400', label: 'High' },
    medium: { color: 'text-yellow-400', border: 'border-l-yellow-400', label: 'Med' },
    low: { color: 'text-blue-400', border: 'border-l-blue-400', label: 'Low' },
    none: { color: 'text-text-primary/30', border: 'border-l-transparent', label: '' },
};

const LABEL_COLORS = [
    { name: 'Study', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    { name: 'Practice', bg: 'bg-green-500/20', text: 'text-green-400' },
    { name: 'Review', bg: 'bg-purple-500/20', text: 'text-purple-400' },
    { name: 'Urgent', bg: 'bg-red-500/20', text: 'text-red-400' },
    { name: 'Personal', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    { name: 'Work', bg: 'bg-teal-500/20', text: 'text-teal-400' },
];

export function TaskItem({ task, dayId }: TaskItemProps) {
    const { toggleTask, updateTask, deleteTask } = useScheduleStore();
    const detailRefs = useRef<Map<number, HTMLInputElement>>(new Map());
    const [focusIndex, setFocusIndex] = useState<number | null>(null);
    const [showLabelMenu, setShowLabelMenu] = useState(false);

    useEffect(() => {
        if (focusIndex !== null) {
            const input = detailRefs.current.get(focusIndex);
            if (input) {
                input.focus();
                setFocusIndex(null);
            }
        }
    }, [focusIndex, task.details]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: { type: 'Task', task, dayId }
    });

    const baseStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const cyclePriority = () => {
        const order: Priority[] = ['none', 'low', 'medium', 'high'];
        const idx = order.indexOf(task.priority || 'none');
        const next = order[(idx + 1) % order.length];
        updateTask(dayId, task.id, { priority: next });
    };

    const toggleLabel = (labelName: string) => {
        const labels = task.labels || [];
        const newLabels = labels.includes(labelName)
            ? labels.filter(l => l !== labelName)
            : [...labels, labelName];
        updateTask(dayId, task.id, { labels: newLabels });
    };

    const priority = task.priority || 'none';
    const priorityCfg = PRIORITY_CONFIG[priority];

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{ ...baseStyle, opacity: 0.9 }}
                className="border-2 border-accent-primary/50 bg-accent-secondary rounded-xl p-4 h-[100px] shadow-xl"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={baseStyle}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative flex items-start gap-3 p-4 rounded-xl transition-all border-l-[3px] border border-transparent touch-none",
                "bg-accent-secondary text-white shadow-sm hover:shadow-md",
                "dark:bg-white/10 dark:text-text-primary",
                priorityCfg.border,
                task.completed && "opacity-60 grayscale"
            )}
        >
            {/* Checkbox */}
            <div
                className="pt-1.5 cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => toggleTask(dayId, task.id, !task.completed)}
            >
                <div className={cn(
                    "w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all",
                    task.completed
                        ? "bg-accent-primary border-accent-primary"
                        : "border-white/40 group-hover:border-white dark:border-text-primary/40 dark:group-hover:border-text-primary"
                )}>
                    {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                    <input
                        value={task.title}
                        className={cn(
                            "bg-transparent border-none outline-none flex-1 font-semibold p-0 text-base leading-tight placeholder:text-white/40 dark:placeholder:text-text-primary/40",
                            task.completed && "line-through opacity-60"
                        )}
                        placeholder="Task title..."
                        onChange={(e) => updateTask(dayId, task.id, { title: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === ' ') e.stopPropagation();
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const newDetails = task.details.length === 0 ? [""] : ["", ...task.details];
                                updateTask(dayId, task.id, { details: newDetails });
                                setFocusIndex(0);
                            }
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Labels */}
                {(task.labels?.length > 0) && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        {task.labels.map(label => {
                            const cfg = LABEL_COLORS.find(l => l.name === label);
                            return (
                                <span
                                    key={label}
                                    className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                        cfg ? `${cfg.bg} ${cfg.text}` : "bg-white/10 text-white/70"
                                    )}
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                )}

                {task.details.length > 0 && (
                    <ul className="space-y-1 mt-1">
                        {task.details.map((detail, idx) => (
                            <li key={idx} className="relative pl-4 text-sm opacity-90 flex items-center">
                                <span className="absolute left-0 top-[0.6em] w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                                <input
                                    ref={(el) => { if (el) detailRefs.current.set(idx, el); else detailRefs.current.delete(idx); }}
                                    value={detail}
                                    placeholder="Add detail..."
                                    className={cn(
                                        "bg-transparent border-none outline-none w-full p-0 m-0 leading-tight placeholder:opacity-50",
                                        task.completed && "line-through opacity-70"
                                    )}
                                    onChange={(e) => {
                                        const newDetails = [...task.details];
                                        newDetails[idx] = e.target.value;
                                        updateTask(dayId, task.id, { details: newDetails });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === ' ') e.stopPropagation();
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const newDetails = [...task.details];
                                            newDetails.splice(idx + 1, 0, "");
                                            updateTask(dayId, task.id, { details: newDetails });
                                            setFocusIndex(idx + 1);
                                        }
                                        if (e.key === 'Backspace' && detail === '') {
                                            e.preventDefault();
                                            const newDetails = task.details.filter((_, i) => i !== idx);
                                            updateTask(dayId, task.id, { details: newDetails });
                                            setFocusIndex(idx > 0 ? idx - 1 : null);
                                        }
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-start gap-1.5 mt-1 ml-1 flex-shrink-0">
                {/* Priority Flag */}
                <button
                    onClick={cyclePriority}
                    className={cn(
                        "p-1 rounded transition-all opacity-0 group-hover:opacity-100",
                        priority !== 'none' && "!opacity-100",
                        priorityCfg.color
                    )}
                    title={`Priority: ${priorityCfg.label || 'None'}`}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Flag size={14} fill={priority !== 'none' ? 'currentColor' : 'none'} />
                </button>

                {/* Label Menu Toggle */}
                <div className="relative">
                    <button
                        onClick={() => setShowLabelMenu(!showLabelMenu)}
                        className="p-1 rounded transition-opacity opacity-0 group-hover:opacity-100 text-white/50 hover:text-white"
                        title="Labels"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                    </button>
                    {showLabelMenu && (
                        <div
                            className="absolute right-0 top-8 z-30 bg-[#2a2a2a] border border-white/10 rounded-xl p-2 shadow-xl min-w-[120px]"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {LABEL_COLORS.map(lbl => (
                                <button
                                    key={lbl.name}
                                    onClick={() => toggleLabel(lbl.name)}
                                    className={cn(
                                        "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2",
                                        task.labels?.includes(lbl.name) ? `${lbl.bg} ${lbl.text}` : "text-white/60 hover:bg-white/5"
                                    )}
                                >
                                    <span className={cn("w-2 h-2 rounded-full", lbl.bg.replace('/20', ''))} />
                                    {lbl.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete */}
                <button
                    onClick={() => deleteTask(dayId, task.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10"
                    title="Delete Task"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <X size={14} className="opacity-70 hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}
