
// src/hooks/useNotificationData.ts
import { useState, useEffect, useCallback } from 'react';
import { getNotifications } from '../../../api/user/getNotifications';
import { Notification } from '@/src/models/response/user.response';

const useNotificationData = (userId: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    const fetchData = useCallback(async () => {
      setLoading(true);
        try {
            if (userId) {
                const data = await getNotifications(userId);
                setNotifications(data || []); // Ensure data is an array
                setLoggedIn(true);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]); // Set to empty array on error
        } finally {
          setLoading(false);
        }
    }, [userId]); // Dependencies for fetchData


    // No change in this useEffect, it's correct.
    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId, fetchData]);

    return { notifications, loading, loggedIn, fetchData };
};

export default useNotificationData;
