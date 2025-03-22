// src/hooks/useBulkImportantActions.ts
import { useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';

const useBulkImportantActions = (
    selectedIds: string[],
    notifications: Notification[],
    updateNotifications: (updatedNotifications: Notification[]) => void
) => {
    const handleMarkSelectedAsImportant = useCallback(async () => {
        const updatedNotifications = notifications.map(n =>
            selectedIds.includes(n.id) && !n.isImportant ? { ...n, isImportant: true } : n
        );
        updateNotifications(updatedNotifications);
    }, [selectedIds, notifications, updateNotifications]);

    const handleMarkSelectedAsUnimportant = useCallback(async () => {
        const updatedNotifications = notifications.map(n =>
            selectedIds.includes(n.id) && n.isImportant ? { ...n, isImportant: false } : n
        );
        updateNotifications(updatedNotifications);
    }, [selectedIds, notifications, updateNotifications]);

    const allSelectedAreImportant = selectedIds.length > 0 && selectedIds.every(id => {
        const notification = notifications.find(n => n.id === id);
        return notification?.isImportant;
    });

    return { handleMarkSelectedAsImportant, handleMarkSelectedAsUnimportant, allSelectedAreImportant };
};

export default useBulkImportantActions;