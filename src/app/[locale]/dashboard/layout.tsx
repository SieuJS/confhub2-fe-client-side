// src/app/[locale]/dashboard/layout.tsx (CHỈNH SỬA)

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
    <div className='relative flex'>
      {/* Backdrop cho mobile (giữ nguyên) */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}

      <ClientDashboardSidebar
        isSidebarOpen={isSidebarOpen}
        locale={locale}
        sidebarWidth={SIDEBAR_WIDTH_PX}
        headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Main Content Wrapper */}
      {/* THAY ĐỔI: Áp dụng padding-left động cho màn hình lớn */}
      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? `md:pl-[${SIDEBAR_WIDTH_PX}px]` : 'md:pl-0'}
        `}
        // GIẢI THÍCH:
        // - Chúng ta sử dụng class động của Tailwind.
        // - Khi isSidebarOpen là true, trên màn hình md trở lên, nó sẽ thêm class `md:pl-[256px]`.
        // - Khi isSidebarOpen là false, trên màn hình md trở lên, nó sẽ thêm class `md:pl-0`.
        // - `transition-all` sẽ tạo hiệu ứng trượt mượt mà cho nội dung.
        // - Ở màn hình nhỏ, không có class nào được áp dụng, nên padding-left luôn là 0.
      >
        {/* THAY ĐỔI: Loại bỏ padding-left tĩnh ở đây */}
        <div className={`p-4 pt-[${HEADER_HEIGHT_PX}px] md:p-6 md:pt-[${HEADER_HEIGHT_PX}px]`}>
          {/* GIẢI THÍCH:
              Loại bỏ `md:pl-[${SIDEBAR_WIDTH_PX}px]` khỏi đây vì logic đó đã được chuyển lên
              component cha (wrapper ở trên) để điều khiển động.
          */}
          {children}
        </div>
      </div>
    </div>
  );
}