'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    StickyNote,
    FileText,
    Timer,
    Target,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ExportImport } from '@/components/ExportImport';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: StickyNote },
    { href: '/notes', label: 'Notes', icon: FileText },
    { href: '/pomodoro', label: 'Pomodoro', icon: Timer },
    { href: '/habits', label: 'Habits', icon: Target },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Close mobile drawer on navigation
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    if (!mounted) return null;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn(
                "flex items-center gap-3 px-5 py-6 border-b border-white/10",
                collapsed && "justify-center px-3"
            )}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                    P
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-text-primary tracking-tight">
                        ProcrastiNot
                    </span>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-accent-primary text-white shadow-md shadow-accent-primary/25"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={20} className={cn(
                                "flex-shrink-0 transition-transform",
                                !isActive && "group-hover:scale-110"
                            )} />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Export/Import */}
            {!collapsed && (
                <div className="px-3 border-t border-white/10 pt-3">
                    <ExportImport />
                </div>
            )}

            {/* Collapse Toggle (Desktop only) */}
            <div className="hidden md:block border-t border-white/10 p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-card-bg border border-white/10 flex items-center justify-center text-text-primary shadow-lg"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside className={cn(
                "md:hidden fixed top-0 left-0 h-full w-64 bg-card-bg border-r border-white/10 z-50 transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {sidebarContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col h-screen sticky top-0 bg-card-bg border-r border-white/10 transition-all duration-300 flex-shrink-0",
                collapsed ? "w-[72px]" : "w-60"
            )}>
                {sidebarContent}
            </aside>
        </>
    );
}
