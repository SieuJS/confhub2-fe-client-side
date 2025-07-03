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
const MAX_NOTIFICATIONS = 20; // Định nghĩa hằng số cho số lượng thông báo tối đa

const socketInitializer = () => {
  const url = new URL(NEXT_PUBLIC_DATABASE_URL);
  const baseUrl = `${url.protocol}//${url.host}`;

  return io(baseUrl, {
    path: '/database/socket.io',
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

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (user?.id) {
      setIsLoadingNotifications(true);
      try {
        const response = await fetch(`${NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/user`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data: Notification[] = await response.json();
          const filteredNotifications = data.filter(n => n.deletedAt === null);
          // Lọc và chỉ lấy tối đa 20 thông báo đầu tiên
          setNotifications(filteredNotifications.slice(0, MAX_NOTIFICATIONS));
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

  // Mark all notifications as read (không thay đổi)
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${NEXT_PUBLIC_DATABASE_URL}/api/v1/notification/mark-all-as-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(n => ({ ...n, seenAt: new Date().toISOString() }))
        );
      } else {
        // console.error('Failed to mark all as read:', response.status);
      }
    } catch (error) {
      // console.error('Error marking all as read:', error);
    }
  }, [user?.id]);

  // Setup socket event listeners
  const setupSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => {
      setSocketConnected(true);
      if (user?.id) {
        socket.emit('register', user.id);
      }
    });

    socket.on('disconnect', (reason) => {
      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      setSocketConnected(false);
    });

    socket.on('notification', (newNotification: Notification) => {
      setNotifications(prevNotifications => {
        // Kiểm tra trùng lặp và thông báo đã xóa
        if (prevNotifications.some(n => n.id === newNotification.id) || newNotification.deletedAt !== null) {
          return prevNotifications;
        }
        // Thêm thông báo mới vào đầu và chỉ giữ lại tối đa 20 thông báo
        const updatedNotifications = [newNotification, ...prevNotifications];
        return updatedNotifications.slice(0, MAX_NOTIFICATIONS);
      });
      setNotificationEffect(true);
      setTimeout(() => setNotificationEffect(false), 1000);
    });
  }, [user?.id]);

  // Single initialization effect
  useEffect(() => {
    if (!loginStatus || !user || isInitializedRef.current) return;

    isInitializedRef.current = true;

    fetchNotifications();

    const newSocket = socketInitializer();
    socketRef.current = newSocket;

    setupSocketListeners(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      isInitializedRef.current = false;
    };
  }, [loginStatus, user, fetchNotifications, setupSocketListeners]);

  // Handle user changes
  useEffect(() => {
    const currentSocket = socketRef.current;
    if (currentSocket && currentSocket.connected && user?.id) {
      currentSocket.emit('register', user.id);
    }
  }, [user?.id]);

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