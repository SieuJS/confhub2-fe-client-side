// components/Header/hooks/useSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Notification } from '../../models/response/user.response'; // Adjust path as needed

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
  const socketRef = useRef<Socket | null>(null);

  const markNotificationsAsSeen = useCallback(() => {
    if (socketRef.current) {
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, seenAt: new Date().toISOString() }))
      );
    }
  }, []);

  useEffect(() => {
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
            if (prevNotifications.some(n => n.id === newNotification.id)) {
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
  }, [loginStatus, user]);

    return { notifications, notificationEffect, markNotificationsAsSeen, socketRef };
};