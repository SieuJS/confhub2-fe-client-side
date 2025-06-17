'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/src/app/[locale]/utils/Header';
import ClientDashboardSidebar from './ClientDasboardSidebar'; // Import sidebar của Client

// Một custom hook đơn giản để theo dõi kích thước màn hình
// Điều này giúp chúng ta đặt trạng thái mở/đóng mặc định cho sidebar một cách chính xác
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Đảm bảo code chỉ chạy ở phía client
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => {
        setMatches(media.matches);
      };
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [matches, query]);

  return matches;
};


export default function ClientDashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const SIDEBAR_WIDTH_PX = 256;
  const HEADER_HEIGHT_PX = 72;

  // Sử dụng hook để xác định có phải màn hình desktop hay không (>= 768px)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Mặc định sidebar mở trên desktop và đóng trên mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Đồng bộ trạng thái isSidebarOpen với kích thước màn hình khi component được mount
  // và khi kích thước màn hình thay đổi
  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='relative min-h-screen bg-background'>
      <Header
        locale={locale}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Lớp phủ (backdrop) chỉ hiển thị trên mobile khi sidebar mở */}
      {isSidebarOpen && !isDesktop && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          aria-hidden="true"
        />
      )}

      <ClientDashboardSidebar
        isSidebarOpen={isSidebarOpen}
        locale={locale}
        sidebarWidth={SIDEBAR_WIDTH_PX}
        headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Main Content (Nội dung chính) */}
      <main
        className="transition-all duration-300 ease-in-out"
        style={{
          paddingTop: `${HEADER_HEIGHT_PX}px`,
          // SỬ DỤNG TAILWIND CLASS ĐỂ THAY THẾ CHO INLINE STYLE
          // Chỉ áp dụng padding-left trên màn hình md trở lên khi sidebar mở
          // Sử dụng giá trị tùy ý của Tailwind: md:pl-[256px]
          paddingLeft: isSidebarOpen && isDesktop ? `${SIDEBAR_WIDTH_PX}px` : '0px',
        }}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}