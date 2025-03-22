// src/hooks/useFilteredNotifications.ts
import { useMemo } from 'react';
import { Notification } from '@/src/models/response/user.response';

const useFilteredNotifications = (notifications: Notification[], searchTerm: string) => {
    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(
                (notification) =>
                    notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter((n) => !n.deletedAt);
    }, [notifications, searchTerm]);

    return filteredNotifications;
};

export default useFilteredNotifications;