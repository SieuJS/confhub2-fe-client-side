// src/contexts/NotificationContext.tsx

'use client';

import React, { createContext, useContext, FC, ReactNode } from 'react';
import { useSocketConnection } from '../hooks/header/useSocketConnection'; // Đường dẫn đến hook socket của bạn
import { useAuth } from './AuthContext';
import { Notification } from '../models/response/user.response'; // Đường dẫn đến model Notification
import { Socket } from 'socket.io-client';

// 1. Định nghĩa kiểu dữ liệu cho Context
interface NotificationContextType {
  notifications: Notification[];
  notificationEffect: boolean;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => void;
  isLoadingNotifications: boolean;
  socketRef: React.MutableRefObject<Socket | null>;
  unreadCount: number | string; // Thêm unreadCount vào context
}

// 2. Tạo Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 3. Tạo Provider Component
export const NotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();

  // Gọi hook useSocketConnection ở đây, một lần duy nhất
  const socketData = useSocketConnection({ loginStatus: isLoggedIn ? 'true' : null, user });

  // Tính toán unreadCount ngay tại đây
  const unread = socketData.notifications.filter(
    n => n.seenAt === null && n.deletedAt === null
  ).length;
  const unreadCount = unread > 20 ? '20+' : unread;

  // Gộp tất cả dữ liệu cần thiết vào một object value
  const value = {
    ...socketData,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// 4. Tạo hook tùy chỉnh để dễ dàng sử dụng Context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};