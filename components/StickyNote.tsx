'use client';

import { StickyTask, useTaskBoardStore } from '@/store/useTaskBoardStore';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useCallback } from 'react';

interface StickyNoteProps {
    task: StickyTask;
}

const MIN_W = 120;
const MIN_H = 60;

export function StickyNote({ task }: StickyNoteProps) {
    const { updateTask, moveTask, resizeTask, deleteTask } = useTaskBoardStore();
    const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
    const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
    const noteRef = useRef<HTMLDivElement>(null);

    // ── Drag handlers ──
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button') || target.dataset.resize) return;

        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origX: task.x,
            origY: task.y,
        };
    }, [task.x, task.y]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (dragRef.current) {
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            const newX = Math.max(0, dragRef.current.origX + dx);
            const newY = Math.max(0, dragRef.current.origY + dy);
            if (noteRef.current) {
                noteRef.current.style.left = `${newX}px`;
                noteRef.current.style.top = `${newY}px`;
            }
        }
        if (resizeRef.current) {
            const dx = e.clientX - resizeRef.current.startX;
            const dy = e.clientY - resizeRef.current.startY;
            const newW = Math.max(MIN_W, resizeRef.current.origW + dx);
            const newH = Math.max(MIN_H, resizeRef.current.origH + dy);
            if (noteRef.current) {
                noteRef.current.style.width = `${newW}px`;
                noteRef.current.style.height = `auto`;
                noteRef.current.style.minHeight = `${newH}px`;
            }
        }
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (dragRef.current) {
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            const newX = Math.max(0, dragRef.current.origX + dx);
            const newY = Math.max(0, dragRef.current.origY + dy);
            moveTask(task.id, Math.round(newX), Math.round(newY));
            dragRef.current = null;
        }
        if (resizeRef.current) {
            const dx = e.clientX - resizeRef.current.startX;
            const dy = e.clientY - resizeRef.current.startY;
            const newW = Math.max(MIN_W, resizeRef.current.origW + dx);
            const newH = Math.max(MIN_H, resizeRef.current.origH + dy);
            resizeTask(task.id, Math.round(newW), Math.round(newH));
            resizeRef.current = null;
        }
    }, [task.id, moveTask, resizeTask]);

    // ── Resize handle ──
    const handleResizeDown = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        (e.currentTarget.closest('[data-sticky]') as HTMLElement)?.setPointerCapture(e.pointerId);

        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origW: task.width || 170,
            origH: task.height || 80,
        };
    }, [task.width, task.height]);

    const w = task.width || 170;
    const h = task.height || 80;

    return (
        <div
            ref={noteRef}
            data-sticky
            className={cn(
                "absolute group rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 select-none animate-scale-in flex flex-col",
                "cursor-grab active:cursor-grabbing active:shadow-2xl active:z-50",
                task.completed && "opacity-50"
            )}
            style={{
                left: task.x,
                top: task.y,
                width: w,
                minHeight: h,
                zIndex: 1,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Color strip */}
            <div
                className="h-1.5 rounded-t-xl flex-shrink-0"
                style={{ backgroundColor: task.color }}
            />

            <div className="bg-card-bg border border-white/10 border-t-0 rounded-b-xl p-3 flex-1 flex flex-col">
                {/* Top: checkbox + delete */}
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => updateTask(task.id, { completed: !task.completed })}
                        className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                            task.completed
                                ? "border-emerald-400 bg-emerald-400/20"
                                : "border-white/20 hover:border-white/40"
                        )}
                    >
                        {task.completed && <Check size={10} className="text-emerald-400" strokeWidth={3} />}
                    </button>

                    <button
                        onClick={() => deleteTask(task.id)}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-text-secondary/40 hover:text-red-400 transition-all"
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* Title / body */}
                <textarea
                    value={task.title}
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                    placeholder="Task..."
                    rows={1}
                    className={cn(
                        "w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary/30 leading-tight resize-none flex-1",
                        task.completed && "line-through text-text-secondary"
                    )}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                />
            </div>

            {/* Resize handle (bottom-right corner) */}
            <div
                data-resize="true"
                onPointerDown={handleResizeDown}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <svg viewBox="0 0 16 16" className="w-full h-full text-text-secondary/30">
                    <path d="M14 14L8 14M14 14L14 8M14 14L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            </div>
        </div>
    );
}
