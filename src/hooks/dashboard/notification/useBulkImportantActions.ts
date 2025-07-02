// src/hooks/dashboard/notification/useBulkImportantActions.ts
import { useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';

// === THAY ĐỔI ===
type PatchFunction = (patches: Array<{ id: string } & Partial<Notification>>) => void;

const useBulkImportantActions = (
    selectedIds: string[],
    notifications: Notification[],
    // === THAY ĐỔI ===
    patchUserNotifications: PatchFunction
) => {
    const handleMarkSelectedAsImportant = useCallback(async () => {
        // === THAY ĐỔI ===
        const patches = selectedIds
            .map(id => notifications.find(n => n.id === id))
            .filter(n => n && !n.isImportant) // Lọc những cái chưa quan trọng
            .map(n => ({ id: n!.id, isImportant: true })); // Tạo bản vá

        if (patches.length > 0) {
            await patchUserNotifications(patches);
        }
    }, [selectedIds, notifications, patchUserNotifications]);

    const handleMarkSelectedAsUnimportant = useCallback(async () => {
        // === THAY ĐỔI ===
        const patches = selectedIds
            .map(id => notifications.find(n => n.id === id))
            .filter(n => n && n.isImportant) // Lọc những cái đang quan trọng
            .map(n => ({ id: n!.id, isImportant: false })); // Tạo bản vá

        if (patches.length > 0) {
            await patchUserNotifications(patches);
        }
    }, [selectedIds, notifications, patchUserNotifications]);

    const allSelectedAreImportant = selectedIds.length > 0 && selectedIds.every(id => {
        const notification = notifications.find(n => n.id === id);
        return notification?.isImportant;
    });

    return { handleMarkSelectedAsImportant, handleMarkSelectedAsUnimportant, allSelectedAreImportant };
};

export default useBulkImportantActions;