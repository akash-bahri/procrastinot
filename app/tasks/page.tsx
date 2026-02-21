'use client';

import { useTaskBoardStore } from '@/store/useTaskBoardStore';
import { StickyNote } from '@/components/StickyNote';
import { Plus, Trash2, StickyNote as StickyNoteIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SchedulePage() {
    const [mounted, setMounted] = useState(false);
    const { tasks, addTask, clearCompleted } = useTaskBoardStore();

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin text-accent-primary text-4xl">●</div>
            </div>
        );
    }

    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Toolbar */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-page-bg/80 border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-3 max-w-[1800px] mx-auto">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-text-primary">Tasks</h1>
                        {total > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-secondary">
                                {done}/{total} done
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {done > 0 && (
                            <button
                                onClick={clearCompleted}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary/60 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all"
                            >
                                <Trash2 size={12} />
                                Clear done
                            </button>
                        )}
                        <button
                            onClick={addTask}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent-primary text-white hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-md shadow-accent-primary/20"
                        >
                            <Plus size={14} strokeWidth={3} />
                            Add Task
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-auto" style={{ minHeight: 'calc(100vh - 56px)' }}>
                {tasks.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-5">
                            <StickyNoteIcon size={28} className="text-accent-primary/40" />
                        </div>
                        <h3 className="text-base font-bold text-text-primary/60 mb-1.5">No tasks yet</h3>
                        <p className="text-xs text-text-secondary/40 mb-5 text-center max-w-[240px]">
                            Add your first task and drag it anywhere on the board.
                        </p>
                        <button
                            onClick={addTask}
                            className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-accent-primary/25"
                        >
                            + Add First Task
                        </button>
                    </div>
                ) : (
                    tasks.map(task => (
                        <StickyNote key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    );
}
