// components/Header/hooks/useSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Notification } from '../../models/response/user.response'; // Adjust path
import { UserResponse } from '../../models/response/user.response';
interface UseSocketConnectionProps {
  loginStatus: string | null;
  user: UserResponse | null;
}
const NEXT_PUBLIC_DATABASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3000';
const socketInitializer = () => {
  // console.log(`Initializing socket connection to: ${NEXT_PUBLIC_DATABASE_URL}`);

  // URL cơ sở vẫn là URL chính
  const url = new URL(NEXT_PUBLIC_DATABASE_URL);
  const baseUrl = `${url.protocol}//${url.host}`; // Sẽ là https://confhub.ddns.net

  return io(baseUrl, { // Chỉ kết nối đến host, không bao gồm path
    // Thêm tùy chọn path ở đây!
    path: '/database/socket.io', // Nginx sẽ nhận /database/socket.io/ và chuyển tiếp đúng
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });
};

export const useSocketConnection = ({ loginStatus, user }: UseSocketConnectionProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationEffect, setNotificationEffect] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const isInitializedRef = useRef(false);

  // Fetch notifications (no changes needed here)
  const fetchNotifications = useCallback(async () => {
    if (user?.id) {
      setIsLoadingNotifications(true);
      try {
        const response = await fetch(`${NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user?take=21`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data: Notification[] = await response.json();
          const filteredNotifications = data.filter(n => n.deletedAt === null);
          setNotifications(filteredNotifications);
        } else {
          // console.error('Failed to fetch notifications:', response.status);
        }
      } catch (error) {
        // console.error('Error fetching notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/mark-all-as-read`, {
        method: 'PUT', // Use PUT or POST, depending on your API design
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add userId to the headers
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

      } else {
        // console.error('Failed to mark all as read:', response.status);
      }
    } catch (error) {
      // console.error('Error marking all as read:', error);
    }
  }, [user?.id]); // Add fetchNotifications if you choose to refetch

  // Setup socket event listeners
  const setupSocketListeners = useCallback((socket: Socket) => {
    // console.log('Setting up socket listeners for user:', user?.id);

    socket.on('connect', () => {
      // console.log('Socket connected successfully, registering user:', user?.id);
      setSocketConnected(true);
      if (user?.id) {
        socket.emit('register', user.id);
      }
    });

    socket.on('disconnect', (reason) => {
      // console.log('Socket disconnected:', reason);
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      // console.error('Socket connection error:', error);
      setSocketConnected(false);
    });


    socket.on('notification', (newNotification: Notification) => {
      // console.log("Received new notification:", newNotification);
      setNotifications(prevNotifications => {
        if (prevNotifications.some(n => n.id === newNotification.id) || newNotification.deletedAt !== null) {
          return prevNotifications;
        }
        return [newNotification, ...prevNotifications];
      });
      setNotificationEffect(true);
      setTimeout(() => setNotificationEffect(false), 1000);
    });
    // FIX: Add user.id as a dependency.
    // This ensures that if the user logs in/out, a new function with the correct user.id is created.
  }, [user?.id]);

  // Single initialization effect - runs only once when component mounts and user is logged in
  useEffect(() => {
    if (!loginStatus || !user || isInitializedRef.current) return;

    // console.log('Initial socket setup for user:', user?.id);
    isInitializedRef.current = true;

    // Initial fetch of notifications
    fetchNotifications();

    // Initialize socket connection
    const newSocket = socketInitializer();
    socketRef.current = newSocket;

    // Setup event listeners
    setupSocketListeners(newSocket);

    // Cleanup function
    return () => {
      // console.log('Cleaning up socket on unmount');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      isInitializedRef.current = false;
    };
  }, [loginStatus, user, fetchNotifications, setupSocketListeners]); // Only run on mount and when login/user changes

  // Handle user changes - only reconnect if user ID actually changed
  useEffect(() => {
    const currentSocket = socketRef.current;

    // If socket exists but user changed, update the registration
    if (currentSocket && currentSocket.connected && user?.id) {
      // console.log('User changed, re-registering with socket:', user.id);
      currentSocket.emit('register', user.id);
    }
  }, [user?.id]); // Only depend on user ID changes

  return {
    notifications,
    notificationEffect,
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef,
    socketConnected
  };
};