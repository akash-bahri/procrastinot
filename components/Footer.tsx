'use client';

import { ExportImport } from './ExportImport';

export function Footer() {
    return (
        <footer className="mt-20 pb-10">
            <div className="flex flex-col items-center gap-4">
                <ExportImport />
                <p className="text-text-secondary text-sm">
                    ProcrastiNot &copy; {new Date().getFullYear()}
                </p>
            </div>
        </footer>
    );
}
