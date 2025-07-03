// src/hooks/dashboard/notification/useNotificationState.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { updateNotifications, NotificationUpdatePayload } from '@/src/app/apis/user/updateNotifications';
import { AxiosError } from 'axios';

// --- Thêm interface này ---
interface ApiErrorResponse {
  message?: string; // API của bạn có thể trả về một trường 'message'
  // Thêm các trường lỗi khác nếu có, ví dụ:
  // code?: string;
  // errors?: { [key: string]: string[] };
}
// -------------------------

type NotificationPatch = {
  id: string;
  seenAt?: string | null;
  isImportant?: boolean;
  deletedAt?: string | null;
};

const useNotificationState = (
    initialNotifications: Notification[],
    userId: string,
    showErrorModal: (title: string, message: string) => void
) => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const notificationsRef = useRef(notifications);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    useEffect(() => {
        setNotifications(initialNotifications);
    }, [initialNotifications]);

    const updateUserNotifications = useCallback(async (patches: NotificationPatch[]) => {
        if (patches.length === 0) {
            return;
        }

        const patchMap = new Map(patches.map(p => [p.id, p]));
        const fullNotificationsToUpdate: NotificationUpdatePayload[] = [];
        const currentNotifications = notificationsRef.current;

        currentNotifications.forEach(notification => {
            if (patchMap.has(notification.id)) {
                const updatedNotification: NotificationUpdatePayload = {
                    ...notification,
                    ...patchMap.get(notification.id)
                };
                fullNotificationsToUpdate.push(updatedNotification);
            }
        });

        if (fullNotificationsToUpdate.length === 0) {
            return;
        }

        try {
            await updateNotifications({ notifications: fullNotificationsToUpdate });

            setNotifications(prevNotifications => {
                return prevNotifications.map(notification => {
                    const patch = patchMap.get(notification.id);
                    if (patch) {
                        return { ...notification, ...patch };
                    }
                    return notification;
                }).filter(n => !n.deletedAt);
            });
        } catch (error: any) {
            console.error('Failed to update notifications:', error);
            const axiosError = error as AxiosError<ApiErrorResponse>; // <--- SỬ DỤNG INTERFACE Ở ĐÂY
            const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred while updating notifications.';
            showErrorModal('Update Failed', errorMessage);
            throw error;
        }
    }, [showErrorModal]);

    const handleUpdateSeenAt = useCallback(async (id: string) => {
        const notification = notificationsRef.current.find(n => n.id === id);
        if (notification && !notification.seenAt) {
            await updateUserNotifications([{ id, seenAt: new Date().toISOString() }]);
        }
    }, [updateUserNotifications]);

    const handleToggleImportant = useCallback(async (id: string) => {
        const notification = notificationsRef.current.find(n => n.id === id);
        if (notification) {
            await updateUserNotifications([{ id, isImportant: !notification.isImportant }]);
        }
    }, [updateUserNotifications]);

    const handleDeleteNotification = useCallback(async (id: string) => {
        await updateUserNotifications([{ id, deletedAt: new Date().toISOString() }]);
    }, [updateUserNotifications]);

    const handleToggleReadStatusInternal = useCallback(async (id: string, markAsRead: boolean) => {
        const notification = notificationsRef.current.find(n => n.id === id);
        if (notification) {
            const newSeenAt = markAsRead ? new Date().toISOString() : null;
            if ((!!notification.seenAt && !markAsRead) || (!notification.seenAt && markAsRead)) {
                 await updateUserNotifications([{ id, seenAt: newSeenAt }]);
            }
        }
    }, [updateUserNotifications]);

    const handleDeleteAllNotifications = useCallback(async () => {
        const patches = notificationsRef.current.map(n => ({
            id: n.id,
            deletedAt: new Date().toISOString()
        }));
        if (patches.length > 0) {
            await updateUserNotifications(patches);
        }
    }, [updateUserNotifications]);

    return {
        notifications,
        setNotifications,
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleDeleteAllNotifications,
        handleToggleReadStatusInternal,
        updateUserNotifications,
    };
};

export default useNotificationState;