'use client';

import { useNotesStore } from '@/store/useNotesStore';
import { useNotesAutoSave } from '@/hooks/useNotesAutoSave';
import { useEffect, useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotesEditor() {
    const { notes, activeNoteId, addNote, deleteNote, updateNote, setActiveNoteId } = useNotesStore();
    const [mounted, setMounted] = useState(false);

    useNotesAutoSave();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full h-[60vh] animate-pulse bg-card-bg rounded-3xl" />;
    }

    const activeNote = notes.find(n => n.id === activeNoteId);

    return (
        <div className="flex gap-4 h-[70vh]">
            {/* Notes List Panel */}
            <div className="w-64 flex-shrink-0 bg-card-bg rounded-2xl border border-border-color overflow-hidden flex flex-col">
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary/70">{notes.length} Notes</span>
                    <button
                        onClick={addNote}
                        className="p-1.5 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
                        title="New Note"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {notes.length === 0 && (
                        <div className="text-center py-10 text-text-secondary/50 text-sm">
                            <FileText size={32} className="mx-auto mb-2 opacity-30" />
                            No notes yet.<br />Click + to create one.
                        </div>
                    )}
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNoteId(note.id)}
                            className={cn(
                                "w-full text-left p-3 rounded-xl transition-all group cursor-pointer",
                                note.id === activeNoteId
                                    ? "bg-accent-primary/20 border border-accent-primary/30"
                                    : "hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text-primary truncate flex-1">
                                    {note.title || 'Untitled Note'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNote(note.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <span className="text-[10px] text-text-secondary/50 mt-1 block">
                                {new Date(note.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Panel */}
            <div className="flex-1 flex flex-col bg-card-bg rounded-2xl border border-border-color overflow-hidden">
                {activeNote ? (
                    <>
                        <div className="p-4 border-b border-white/10">
                            <input
                                value={activeNote.title}
                                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                                placeholder="Note title..."
                                className="w-full bg-transparent text-xl font-bold text-text-primary outline-none placeholder:text-text-secondary/40"
                            />
                        </div>
                        <textarea
                            value={activeNote.content}
                            onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                            placeholder="Write your thoughts, ideas, or reminders here..."
                            className="flex-1 p-6 text-base leading-relaxed bg-transparent resize-none outline-none text-text-primary placeholder:text-text-secondary/30"
                            spellCheck={false}
                        />
                        <div className="px-6 py-2 border-t border-white/10 flex justify-between text-xs text-text-secondary/50">
                            <span>{activeNote.content.length} characters</span>
                            <span>Last edited {new Date(activeNote.updatedAt).toLocaleString()}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-secondary/40">
                        <div className="text-center">
                            <FileText size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a note or create a new one</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
