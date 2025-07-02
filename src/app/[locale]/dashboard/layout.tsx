// src/app/[locale]/dashboard/layout.tsx

'use client';

import React from 'react';
import ClientDashboardSidebar from './ClientDashboardSidebar';
import { useSidebar } from '@/src/contexts/SidebarContext';

export default function ClientDashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const SIDEBAR_WIDTH_PX = 256;
  const HEADER_HEIGHT_PX = 60;

  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    // FIX: Loại bỏ `h-screen`. Bây giờ container này sẽ có chiều cao tự động.
    // `min-h-screen` được thêm vào để đảm bảo trang luôn chiếm ít nhất toàn bộ chiều cao màn hình,
    // hữu ích cho các trang có ít nội dung.
    <div className='relative flex min-h-screen bg-muted/40'>
      {/* Backdrop cho mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar vẫn cần được định vị `fixed` để nó không cuộn cùng trang */}
      <ClientDashboardSidebar
        isSidebarOpen={isSidebarOpen}
        locale={locale}
        sidebarWidth={SIDEBAR_WIDTH_PX}
        headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Main Content Wrapper */}
      {/* FIX: Loại bỏ `h-full`, `flex-col`, `overflow-hidden`.
          Bây giờ nó chỉ là một block đơn giản để xử lý padding-left cho sidebar.
      */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? `md:pl-[${SIDEBAR_WIDTH_PX}px]` : 'md:pl-0'}
        `}
      >
        {/* Container cho header (nếu có) */}
        <div
          className="w-full p-2 md:p-4"
        >
          {/* Header của bạn có thể đặt ở đây */}
        </div>

        {/* Container cho `children` (trang con) */}
        {/* FIX: Loại bỏ `flex-1`, `min-h-0`, `overflow-y-auto`.
            Nó chỉ còn là một container với padding.
        */}
        <div className="p-4 pt-0 md:p-6 md:pt-0">
           {/* `children` bây giờ sẽ quyết định chiều cao của trang. */}
           {children}
        </div>
      </main>
    </div>
  );
}