'use client';

import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export function ExportImport() {
    const [status, setStatus] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            notes: localStorage.getItem('notes-storage'),
            habits: localStorage.getItem('habits-storage'),
            pomodoro: localStorage.getItem('pomodoro-storage'),
            taskboard: localStorage.getItem('taskboard-storage'),
            calendarEvents: localStorage.getItem('calendar-events-storage'),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `procrastinot-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('Exported successfully!');
        setTimeout(() => setStatus(null), 3000);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (!data.version) {
                    setStatus('Invalid backup file');
                    return;
                }

                if (data.notes) localStorage.setItem('notes-storage', data.notes);
                if (data.habits) localStorage.setItem('habits-storage', data.habits);
                if (data.pomodoro) localStorage.setItem('pomodoro-storage', data.pomodoro);
                if (data.taskboard) localStorage.setItem('taskboard-storage', data.taskboard);
                if (data.calendarEvents) localStorage.setItem('calendar-events-storage', data.calendarEvents);

                setStatus('Imported! Reloading...');
                setTimeout(() => window.location.reload(), 1000);
            } catch {
                setStatus('Failed to parse backup file');
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
                title="Export all data"
            >
                <Download size={14} />
                Export
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all cursor-pointer"
                title="Import backup"
            >
                <Upload size={14} />
                Import
                <input
                    ref={fileRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                />
            </label>
            {status && (
                <span className="text-xs text-accent-primary animate-pulse">{status}</span>
            )}
        </div>
    );
}
