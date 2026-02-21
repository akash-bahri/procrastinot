'use client';

import { useScheduleStore } from '@/store/useScheduleStore';
import { Plus } from 'lucide-react';

export function AddDayButton() {
    const { addDay, filter } = useScheduleStore();

    if (filter === 'today') return null;

    return (
        <div className="flex justify-center mt-10 mb-6">
            <button
                onClick={() => addDay()}
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-accent-primary to-accent-primary/80 text-white border border-white/10"
            >
                <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                    <Plus size={16} strokeWidth={3} />
                </div>
                <span>Add New Day</span>
            </button>
        </div>
    );
}
