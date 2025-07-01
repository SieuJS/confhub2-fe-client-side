// src/contexts/SidebarContext.tsx

'use client';

import React, { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';

// Một custom hook đơn giản để theo dõi kích thước màn hình
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [matches, query]);

  return matches;
};

// 1. Định nghĩa kiểu dữ liệu cho Context
interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  // Có thể thêm các giá trị khác nếu cần, ví dụ:
  // setSidebarOpen: (isOpen: boolean) => void;
}

// 2. Tạo Context với giá trị mặc định
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 3. Tạo Provider Component
export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Đồng bộ trạng thái mở/đóng mặc định với kích thước màn hình
  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const value = { isSidebarOpen, toggleSidebar };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// 4. Tạo hook tùy chỉnh để dễ dàng sử dụng Context
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    // Cung cấp một giá trị mặc định "an toàn" nếu không nằm trong Provider
    // Điều này hữu ích cho các trang không có sidebar
    return {
      isSidebarOpen: false,
      toggleSidebar: () => {}
        // console.warn('useSidebar must be used within a SidebarProvider to function.'),
    };
  }
  return context;
};