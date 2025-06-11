// src/hooks/useNotificationState.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Notification } from '@/src/models/response/user.response';
import { updateNotifications } from '../../../app/apis/user/updateNotifications';

const useNotificationState = (initialNotifications: Notification[], userId: string) => {
    // console.log('useNotificationState: Initializing with initialNotifications:', initialNotifications, 'userId:', userId); // Log initialization
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const notificationsRef = useRef(notifications);

    useEffect(() => {
        notificationsRef.current = notifications;
        // console.log('useNotificationState: useEffect - notificationsRef updated:', notificationsRef.current); // Log ref update
    }, [notifications]);

    const updateUserNotifications =
        async (updatedNotifications: Notification[]) => {
            console.log('useNotificationState: updateUserNotifications called with:', updatedNotifications);
            const updatedData = { notifications: updatedNotifications };
            // The API call uses the auth token, not the userId prop.
            await updateNotifications(updatedData);
            setNotifications(updatedNotifications);
            // console.log('useNotificationState: updateUserNotifications - State updated.');
        }

    const handleUpdateSeenAt = useCallback(
        async (id: string) => {
            // console.log(`useNotificationState: handleUpdateSeenAt called for id: ${id}`); // Log call
            const currentNotifications = notificationsRef.current;
            const notification = currentNotifications.find(n => n.id === id);
            if (notification && !notification.seenAt) {
                const updatedNotifications = currentNotifications.map(n =>
                    n.id === id ? { ...n, seenAt: new Date().toISOString() } : n
                );
                await updateUserNotifications(updatedNotifications);
            }
        },
        [updateUserNotifications]
    );

    const handleToggleImportant = useCallback(
        async (id: string) => {
            // console.log(`useNotificationState: handleToggleImportant called for id: ${id}`); //Log
            const currentNotifications = notificationsRef.current;
            const updatedNotifications = currentNotifications.map(n =>
                n.id === id ? { ...n, isImportant: !n.isImportant } : n
            );
            await updateUserNotifications(updatedNotifications);
        },
        [updateUserNotifications]
    );

    const handleDeleteNotification =
        async (id: string) => {
            // console.log(`useNotificationState: handleDeleteNotification called for id: ${id}`); //Log
            const currentNotifications = notificationsRef.current;
            const updatedNotifications = currentNotifications.map(n =>
                n.id === id ? { ...n, deletedAt: new Date().toISOString() } : n
            );
            console.log(`useNotificationState: handleDeleteNotification - updatedNotifications:`, currentNotifications); // Log updated notifications
            await updateUserNotifications(updatedNotifications);
        }

    const handleDeleteAllNotifications = async () => {
        const currentNotifications = notifications
        const updatedNotifications = currentNotifications.map(n => ({ ...n, deletedAt: new Date().toISOString() }));
        await updateUserNotifications(updatedNotifications);
    };

    const handleMarkUnseen = useCallback(
        async (id: string) => {
            // console.log(`useNotificationState: handleMarkUnseen called for id: ${id}`); // Log
            const currentNotifications = notifications;
            const updatedNotifications = currentNotifications.map(n =>
                n.id === id ? { ...n, seenAt: null } : n
            );
            await updateUserNotifications(updatedNotifications);
        },
        [updateUserNotifications]
    );
    // console.log(`useNotificationState: Returning. notifications:`, notifications); // Log state
    return { notifications, setNotifications, handleUpdateSeenAt, handleToggleImportant, handleDeleteNotification, handleDeleteAllNotifications, handleMarkUnseen, updateUserNotifications };
};

export default useNotificationState;