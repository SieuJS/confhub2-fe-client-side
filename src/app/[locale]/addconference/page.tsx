// src/app/[locale]/addconference/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import ConferenceForm from './ConferenceForm'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/contexts/AuthContext' // <<<< THAY ĐỔI QUAN TRỌNG

const AddConferencePage = ({
  // Đổi tên để nhất quán (Tùy chọn)
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations('')
  const router = useRouter()

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // isLoading được đổi tên thành isAuthLoading để rõ ràng
  // isInitializing cho biết AuthProvider có đang trong quá trình kiểm tra auth ban đầu hay không
  const {
    isLoggedIn,
    isInitializing: isAuthInitializing,
    error: authError
  } = useAuth()

  useEffect(() => {
    // Chỉ chuyển hướng nếu:
    // 1. Quá trình khởi tạo auth đã hoàn tất (isAuthInitializing là false)
    // 2. Người dùng chưa đăng nhập (isLoggedIn là false)
    if (!isAuthInitializing && !isLoggedIn) {
      console.log(
        '[AddConferencePage] Not logged in and auth initialized, redirecting to login.'
      )
      // Lưu lại URL hiện tại để quay lại sau khi đăng nhập
      const currentPath = window.location.pathname + window.location.search // Mặc dù trang này không có search param quan trọng
      localStorage.setItem('returnUrl', currentPath)
      router.push(`/${locale}/auth/login`)
    }
  }, [isLoggedIn, isAuthInitializing, router, locale])

  // Hiển thị trạng thái tải trong khi AuthProvider đang khởi tạo
  if (isAuthInitializing) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div>Loading authentication status...</div>
      </div>
    )
  }

  // Nếu có lỗi xác thực (ví dụ: token hết hạn và không thể làm mới)
  if (authError && !isLoggedIn) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div>
          Error during authentication: {authError}. Please try logging in again.
        </div>
      </div>
    )
  }

  // Nếu đã khởi tạo xong và chưa đăng nhập (useEffect sẽ xử lý redirect)
  if (!isLoggedIn && !isAuthInitializing) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div>Redirecting...</div>
      </div>
    )
  }

  // Chỉ render form nếu đã đăng nhập và quá trình khởi tạo đã hoàn tất
  // (Điều kiện !isAuthInitializing đã được xử lý ở trên, nhưng để cho rõ ràng)
  if (isLoggedIn && !isAuthInitializing) {
    return (
      <>
        <Header locale={locale} />
        <main className='container mx-auto min-h-screen py-8'>
          {' '}
          <div className='w-full bg-background pt-14'></div>{' '}
          <h1 className='mb-6 text-3xl font-bold'>{t('Add_New_Conference')}</h1>
          <ConferenceForm />{' '}
        </main>
        <Footer />
      </>
    )
  }

  // Fallback (ít khi đạt tới nếu logic trên đúng)
  return null
}

export default AddConferencePage
