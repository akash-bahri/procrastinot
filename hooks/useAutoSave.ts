import { useEffect, useRef } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';

export function useAutoSave() {
    const { days, title, filter } = useScheduleStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear existing timeout on every change
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout (debounce)
        timeoutRef.current = setTimeout(async () => {
            const dataToSave = {
                title,
                filter,
                days
            };

            try {
                await fetch('/api/save-schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSave),
                });
                console.log('Auto-saved schedule data');
            } catch (error) {
                console.error('Error auto-saving schedule:', error);
            }
        }, 2000); // 2 second debounce

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [days, title, filter]);
}
