'use client';

import { useAutoSave } from '@/hooks/useAutoSave';

export function AutoSaveListener() {
    useAutoSave();
    return null;
}
