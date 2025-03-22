// components/Header/hooks/useSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Notification } from '../../models/response/user.response'; // Adjust path

interface UseSocketConnectionProps {
  loginStatus: string | null;
  user: { id: string; firstname: string; lastname: string; email: string } | null;
}

const socketInitializer = () => {
  return io('http://localhost:3000'); // Your backend URL
};

export const useSocketConnection = ({ loginStatus, user }: UseSocketConnectionProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationEffect, setNotificationEffect] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications (no changes needed here)
    const fetchNotifications = useCallback(async () => {
        if (user?.id) {
        setIsLoadingNotifications(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/user/${user.id}/notifications`);
            if (response.ok) {
            const data: Notification[] = await response.json();
            const filteredNotifications = data.filter(n => n.deletedAt === null);
            setNotifications(filteredNotifications);
            } else {
            console.error('Failed to fetch notifications:', response.status);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
        }
    }, [user?.id]);

  // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`http://localhost:3000/api/v1/user/${user.id}/notifications/mark-all-as-read`, {
          method: 'PUT', // Use PUT or POST, depending on your API design
          headers: {
            'Content-Type': 'application/json',
          },
          // You might not need a body, if your backend uses the user ID from the URL
        });

        if (response.ok) {
          // Option 1: Refetch notifications (most accurate)
            // await fetchNotifications();

          // Option 2: Update local state (faster, but might be out of sync if other updates happened)
          setNotifications(prevNotifications =>
            prevNotifications.map(n => ({ ...n, seenAt: new Date().toISOString() }))
          );
          console.log("markAllAsRead Success")

        } else {
          console.error('Failed to mark all as read:', response.status);
        }
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }, [user?.id]); // Add fetchNotifications if you choose to refetch

  useEffect(() => {
        if (loginStatus && user) {
        fetchNotifications();
        }

        const initializeSocket = async () => {
        if (loginStatus && user && !socketRef.current) {
            const newSocket = socketInitializer();
            socketRef.current = newSocket;

            newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('register', user.id);
            });

            newSocket.on('notification', (newNotification: Notification) => {
            console.log('Received notification:', newNotification);
            setNotifications(prevNotifications => {
                if (prevNotifications.some(n => n.id === newNotification.id) || newNotification.deletedAt !== null) {
                return prevNotifications;
                }
                return [newNotification, ...prevNotifications];
            });
            setNotificationEffect(true);
            setTimeout(() => setNotificationEffect(false), 1000);
            });
        }
        };

        initializeSocket();

        return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        };
    }, [loginStatus, user, fetchNotifications]);

  return {
    notifications,
    notificationEffect,
    markAllAsRead, // Return the new function
    fetchNotifications,
    isLoadingNotifications,
    socketRef,
  };
};