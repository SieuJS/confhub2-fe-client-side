// src/hooks/useNotificationState.ts
import { useState, useCallback } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { updateUser } from '@/src/api/user/updateUser';  // Import updateUser

const useNotificationState = (initialNotifications: Notification[], userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const updateNotifications = useCallback(
        async (updatedNotifications: Notification[]) => {
            const updatedData = { notifications: updatedNotifications };
            await updateUser(userId, updatedData); // Use the imported updateUser
            setNotifications(updatedNotifications);
        },
        [userId]
    );


    const handleUpdateSeenAt = useCallback(
        async (id: string) => {
            const updatedNotifications = notifications.map(n =>
                n.id === id && n.seenAt === null ? { ...n, seenAt: new Date().toISOString() } : n
            );
            await updateNotifications(updatedNotifications);
        },
        [notifications, updateNotifications]
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



    return { notifications, setNotifications,handleUpdateSeenAt, handleToggleImportant, handleDeleteNotification,handleMarkUnseen, updateNotifications };
};

export default useNotificationState;