'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: string;
    editable?: boolean;
    onTitleChange?: (title: string) => void;
    children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon, editable, onTitleChange, children }: PageHeaderProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="h-[120px] rounded-3xl animate-pulse bg-card-bg/50" />;

    return (
        <header className="backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 shadow-lg border bg-card-bg border-border-color transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <div>
                        {subtitle && (
                            <span className="text-xs font-bold tracking-widest uppercase text-text-primary/50">
                                {subtitle}
                            </span>
                        )}
                        <h1
                            contentEditable={editable}
                            suppressContentEditableWarning
                            className={cn(
                                "text-2xl md:text-3xl font-bold outline-none text-text-primary",
                                editable && "cursor-text hover:opacity-80"
                            )}
                            onBlur={(e) => editable && onTitleChange?.(e.currentTarget.textContent || title)}
                        >
                            {title}
                        </h1>
                    </div>
                </div>
                {children && <div className="flex items-center gap-3">{children}</div>}
            </div>
        </header>
    );
}
