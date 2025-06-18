// src/app/[locale]/auth/register/page.tsx
"use client";

import RegisterForm from './RegisterForm';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use standard Next.js router
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import { useTranslations } from 'next-intl';

export default function RegisterPage({
  params: { locale }
}: {
  params: { locale: string; };
}) {
  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  const { isLoggedIn, isInitializing } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  useEffect(() => {
    // Chỉ chuyển hướng nếu quá trình khởi tạo auth đã hoàn tất VÀ người dùng đã đăng nhập
    if (!isInitializing && isLoggedIn) {
      console.log("[RegisterPage] Already logged in, redirecting...");
      router.push(`/${locale}`); // Chuyển hướng về trang chủ của locale hiện tại
    }
  }, [isLoggedIn, isInitializing, router, locale]); // Dependencies của useEffect

  // Hiển thị trạng thái tải trong khi AuthProvider đang khởi tạo
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading authentication status...</div>
      </div>
    );
  }

  // Nếu đã khởi tạo xong và người dùng đã đăng nhập (useEffect sẽ xử lý redirect, đây là fallback)
  if (isLoggedIn && !isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>{t('Redirecting')}</div>
      </div>
    );
  }

  // Chỉ hiển thị form đăng ký nếu chưa đăng nhập và quá trình khởi tạo auth đã hoàn tất
  return (
    <>
      {/* Điều kiện này giờ đã được xử lý ở trên, nhưng để an toàn có thể giữ lại */}
      {/* Hoặc chỉ cần <RegisterForm /> nếu các điều kiện trên đã đủ */}
      {!isInitializing && !isLoggedIn && <RegisterForm />}
    </>
  );
}