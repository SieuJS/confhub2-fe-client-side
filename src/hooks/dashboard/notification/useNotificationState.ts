
// src/hooks/useNotificationState.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { updateUser } from '@/src/api/user/updateUser';

const useNotificationState = (initialNotifications: Notification[], userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    // Thêm ref để lưu trữ notifications mới nhất
    const notificationsRef = useRef(notifications);
    useEffect(() => {
        notificationsRef.current = notifications;
    }, [notifications]);

    const updateNotifications = useCallback(
        async (updatedNotifications: Notification[]) => {
            const updatedData = { notifications: updatedNotifications };
            await updateUser(userId, updatedData);
            setNotifications(updatedNotifications);
        },
        [userId]
    );

    // Trong cùng file useNotificationState.ts
    const handleUpdateSeenAt = useCallback(
        async (id: string) => {
            // Sử dụng notifications từ ref thay vì state
            const currentNotifications = notificationsRef.current;
            const notification = currentNotifications.find(n => n.id === id);
            if (notification && !notification.seenAt) {
                const updatedNotifications = currentNotifications.map(n =>
                    n.id === id ? { ...n, seenAt: new Date().toISOString() } : n
                );
                await updateNotifications(updatedNotifications);
            }
        },
        [updateNotifications] // Loại bỏ notifications khỏi dependencies
    );

    const handleToggleImportant = useCallback(
        async (id: string) => {
            const updatedNotifications = notifications.map(n =>
                n.id === id ? { ...n, isImportant: !n.isImportant } : n
            );
            await updateNotifications(updatedNotifications);
        },
        [notifications, updateNotifications]
    );

    const handleDeleteNotification = useCallback(
        async (id: string) => {
            const updatedNotifications = notifications.map(n =>
                n.id === id ? { ...n, deletedAt: new Date().toISOString() } : n
            );
            await updateNotifications(updatedNotifications);
        },
        [notifications, updateNotifications]
    );

    const handleMarkUnseen = useCallback(
        async (id: string) => {
            const updatedNotifications = notifications.map(n =>
                n.id === id ? { ...n, seenAt: null } : n
            );
            await updateNotifications(updatedNotifications);
        },
        [notifications, updateNotifications]
    );

    return { notifications, setNotifications, handleUpdateSeenAt, handleToggleImportant, handleDeleteNotification, handleMarkUnseen, updateNotifications };
};

export default useNotificationState;

