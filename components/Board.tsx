'use client';

import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useScheduleStore, Task } from '@/store/useScheduleStore';
import { DayCard } from './DayCard';
import { TaskItem } from './TaskItem';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export function Board() {
    const { days, filter, reorderTasks, moveTask } = useScheduleStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeDayId, setActiveDayId] = useState<string | null>(null);

    const filteredDays = days.filter(day => {
        if (filter === 'all') return true;
        const todayStr = new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
        return day.date.includes(todayStr) || todayStr.includes(day.date);
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5 // Avoid accidental drags
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { task, dayId } = active.data.current as { task: Task; dayId: string };
        setActiveTask(task);
        setActiveDayId(dayId);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;
        if (active.id === over.id) return;

        const activeData = active.data.current as { task: Task; dayId: string };
        const overData = over.data.current as { task: Task; dayId?: string; type?: string; day?: any };

        const isActiveTask = activeData?.task;
        const isOverTask = overData?.task;
        const isOverDay = overData?.type === 'Day';

        if (!isActiveTask) return;

        // Task over Task
        if (isActiveTask && isOverTask) {
            const sourceDayId = activeData.dayId;
            const targetDayId = overData.dayId!;

            if (sourceDayId !== targetDayId) {
                // Moved to another day's task list - let's move it in store
                moveTask(activeData.task.id, sourceDayId, targetDayId);
                // Update active data to reflect new day? 
                // Dnd-kit keeps reference to initial data. 
                // We just let the store update re-render the lists.
            }
        }

        // Task over Day (Empty area)
        if (isActiveTask && isOverDay) {
            const sourceDayId = activeData.dayId;
            const targetDayId = over.id as string;

            if (sourceDayId !== targetDayId) {
                moveTask(activeData.task.id, sourceDayId, targetDayId);
            }
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);
        setActiveDayId(null);

        if (!over) return;

        const activeData = active.data.current as { task: Task; dayId: string };
        const overData = over.data.current as { task: Task; dayId?: string; type?: string };

        // Internal reorder logic
        if (active.id !== over.id && overData?.task) {
            const dayId = activeData.dayId; // Should be same as over's dayId if dragOver handled cross-column
            const day = days.find(d => d.id === dayId);
            if (day) {
                const oldIndex = day.tasks.findIndex(t => t.id === active.id);
                const newIndex = day.tasks.findIndex(t => t.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    const newTasks = arrayMove(day.tasks, oldIndex, newIndex);
                    reorderTasks(dayId, newTasks);
                }
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {filteredDays.map((day, index) => (
                    <DayCard key={day.id} day={day} index={index} />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeTask && activeDayId ? (
                        <TaskItem task={activeTask} dayId={activeDayId} />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
