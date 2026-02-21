import { useEffect, useRef } from 'react';
import { useNotesStore } from '@/store/useNotesStore';

export function useNotesAutoSave() {
    const { content } = useNotesStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            try {
                await fetch('/api/save-notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content }),
                });
                console.log('Auto-saved notes data');
            } catch (error) {
                console.error('Error auto-saving notes:', error);
            }
        }, 2000); // 2 second debounce

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [content]);
}
