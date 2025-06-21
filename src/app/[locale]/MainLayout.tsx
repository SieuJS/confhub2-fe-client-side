// src/app/[locale]/MainLayout.tsx

'use client';

import React from 'react';
import { usePathname } from '@/src/navigation';
import { AppPathname } from '@/src/navigation';

// Danh sách các đường dẫn không thay đổi
const PATHS_WITHOUT_HEADER: AppPathname[] = [
  '/chatbot/landing',
  '/chatbot/regularchat',
  '/chatbot/livechat',
  '/chatbot/history',
  '/visualization',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const PATHS_WITHOUT_FOOTER: AppPathname[] = [
  '/chatbot/landing',
  '/chatbot/regularchat',
  '/chatbot/livechat',
  '/chatbot/history',
  '/visualization',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/dashboard'
];

// THAY ĐỔI: Cập nhật props interface
interface MainLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode; // Prop để nhận Header đã được render
  footer: React.ReactNode; // Prop để nhận Footer đã được render
}

export default function MainLayout({ children, header, footer }: MainLayoutProps) {
  const pathname = usePathname();

  const showHeader = !PATHS_WITHOUT_HEADER.includes(pathname as AppPathname);
  const showFooter = !PATHS_WITHOUT_FOOTER.includes(pathname as AppPathname);

  return (
    <>
      {/* THAY ĐỔI: Render prop `header` thay vì import và render component */}
      {showHeader && header}

      <main className={`relative ${showHeader ? 'pt-[60px]' : ''}`}>
        {children}
      </main>

      {/* THAY ĐỔI: Render prop `footer` thay vì import và render component */}
      {showFooter && footer}
    </>
  );
}