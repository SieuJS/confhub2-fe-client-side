// src/hooks/useNotificationData.ts
import { useState, useEffect, useCallback } from 'react';
import { Notification, UserResponse } from '@/src/models/response/user.response';

const useNotificationData = (userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!userId) {
                setLoggedIn(false);
                setLoading(false);
                return;
            }
            const userResponse = await fetch(`http://localhost:3000/api/v1/user/${userId}`);
            if (!userResponse.ok) {
                throw new Error(`HTTP error! status: ${userResponse.status}`);
            }
            const userDetails: UserResponse = await userResponse.json();
            const initializedNotifications = (userDetails.notifications || []).map((n: Notification) => ({
                ...n,
                seenAt: n.seenAt || null,
            }));
            setNotifications(initializedNotifications);
            setLoggedIn(true);

        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { notifications, loading, loggedIn, fetchData };
};

export default useNotificationData;