'use client';

import { Sidebar } from '@/components/Sidebar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-h-screen overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
