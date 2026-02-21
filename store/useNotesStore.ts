import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Note = {
    id: string;
    title: string;
    content: string;
    updatedAt: number;
};

interface NotesState {
    notes: Note[];
    activeNoteId: string | null;

    // Legacy compat
    content: string;
    setContent: (content: string) => void;

    // New CRUD
    addNote: () => void;
    deleteNote: (id: string) => void;
    updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
    setActiveNoteId: (id: string | null) => void;
}

const generateId = () => 'note-' + Math.random().toString(36).substr(2, 9);

export const useNotesStore = create<NotesState>()(
    persist(
        (set, get) => ({
            notes: [],
            activeNoteId: null,

            // Legacy compat — kept so the old auto-save hook doesn't break
            content: '',
            setContent: (content) => {
                const activeId = get().activeNoteId;
                if (activeId) {
                    set((state) => ({
                        content,
                        notes: state.notes.map(n =>
                            n.id === activeId ? { ...n, content, updatedAt: Date.now() } : n
                        ),
                    }));
                } else {
                    set({ content });
                }
            },

            addNote: () => {
                const newNote: Note = {
                    id: generateId(),
                    title: 'Untitled Note',
                    content: '',
                    updatedAt: Date.now(),
                };
                set((state) => ({
                    notes: [newNote, ...state.notes],
                    activeNoteId: newNote.id,
                    content: '',
                }));
            },

            deleteNote: (id) => set((state) => {
                const remaining = state.notes.filter(n => n.id !== id);
                const newActive = state.activeNoteId === id
                    ? (remaining[0]?.id ?? null)
                    : state.activeNoteId;
                return {
                    notes: remaining,
                    activeNoteId: newActive,
                    content: remaining.find(n => n.id === newActive)?.content ?? '',
                };
            }),

            updateNote: (id, updates) => set((state) => ({
                notes: state.notes.map(n =>
                    n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
                ),
            })),

            setActiveNoteId: (id) => {
                const note = id ? get().notes.find(n => n.id === id) : null;
                set({
                    activeNoteId: id,
                    content: note?.content ?? '',
                });
            },
        }),
        {
            name: 'notes-storage',
        }
    )
);
