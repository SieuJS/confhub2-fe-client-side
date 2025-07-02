import { useState, useCallback, useRef, useEffect } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { updateNotifications, NotificationUpdatePayload } from '../../../app/apis/user/updateNotifications';

type NotificationPatch = { id: string } & Partial<Omit<Notification, 'id'>>;

const useNotificationState = (
    initialNotifications: Notification[],
    userId: string,
    showErrorModal: (title: string, message: string) => void // <--- NHẬN showErrorModal
) => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const notificationsRef = useRef(notifications);

    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    const patchUserNotifications = useCallback(async (patches: NotificationPatch[]) => {
        if (patches.length === 0) {
            return;
        }

        const patchMap = new Map(patches.map(p => [p.id, p]));
        const fullNotificationsToUpdate: NotificationUpdatePayload[] = [];
        const currentNotifications = notificationsRef.current;

        currentNotifications.forEach(notification => {
            if (patchMap.has(notification.id)) {
                const updatedNotification = { ...notification, ...patchMap.get(notification.id) };
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
                    if (patchMap.has(notification.id)) {
                        return { ...notification, ...patchMap.get(notification.id) };
                    }
                    return notification;
                });
            });
        } catch (error: any) {
            console.error('Failed to update notifications:', error);
            // Hiển thị modal lỗi khi có lỗi từ API
            showErrorModal('Update Failed', error.message || 'An unexpected error occurred while updating notifications.');
            throw error; // Re-throw lỗi để các hook gọi nó có thể bắt và xử lý thêm nếu cần (ví dụ: `performAction` trong NotificationsTab)
        }
    }, [showErrorModal]); // Thêm showErrorModal vào dependencies

    const handleUpdateSeenAt = useCallback(async (id: string) => {
        const notification = notificationsRef.current.find(n => n.id === id);
        if (notification && !notification.seenAt) {
            await patchUserNotifications([{ id, seenAt: new Date().toISOString() }]);
        }
    }, [patchUserNotifications]);

    const handleToggleImportant = useCallback(async (id: string) => {
        const notification = notificationsRef.current.find(n => n.id === id);
        if (notification) {
            await patchUserNotifications([{ id, isImportant: !notification.isImportant }]);
        }
    }, [patchUserNotifications]);

    const handleDeleteNotification = useCallback(async (id: string) => {
        await patchUserNotifications([{ id, deletedAt: new Date().toISOString() }]);
    }, [patchUserNotifications]);

    const handleMarkUnseen = useCallback(async (id: string) => {
        const notification = notificationsRef.current.find(n => n.id === id);
        if (notification && notification.seenAt) {
            await patchUserNotifications([{ id, seenAt: null }]);
        }
    }, [patchUserNotifications]);

    const handleDeleteAllNotifications = async () => {
        const patches = notificationsRef.current.map(n => ({
            id: n.id,
            deletedAt: new Date().toISOString()
        }));
        await patchUserNotifications(patches);
    };

    return {
        notifications,
        setNotifications,
        handleUpdateSeenAt,
        handleToggleImportant,
        handleDeleteNotification,
        handleDeleteAllNotifications,
        handleMarkUnseen,
        updateUserNotifications: patchUserNotifications,
    };
};

export default useNotificationState;