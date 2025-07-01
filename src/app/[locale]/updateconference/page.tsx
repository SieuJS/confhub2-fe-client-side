// src/app/[locale]/UpdateConference/page.tsx
'use client'

import React, { useEffect, Suspense } from 'react'; // Thêm Suspense
import { useTranslations } from 'next-intl';
// import UpdateConferenceForm from './UpdateConferenceForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG

// Component con để sử dụng useSearchParams, cần được bọc bởi Suspense
const UpdateConferenceContent = ({
  locale,
  conferenceId
}: {
  locale: string;
  conferenceId: string | null; // Cho phép null nếu id không có
}) => {
  const t = useTranslations('');
  const router = useRouter();

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // isLoading được đổi tên thành isAuthLoading để tránh nhầm lẫn nếu có state loading khác
  // isInitializing cho biết AuthProvider có đang trong quá trình kiểm tra auth ban đầu hay không
  const { isLoggedIn, isInitializing: isAuthInitializing, error: authError } = useAuth();

  useEffect(() => {
    // Chỉ chuyển hướng nếu:
    // 1. Quá trình khởi tạo auth đã hoàn tất (isAuthInitializing là false)
    // 2. Người dùng chưa đăng nhập (isLoggedIn là false)
    if (!isAuthInitializing && !isLoggedIn) {
      // console.log('[UpdateConference] Not logged in and auth initialized, redirecting to login.');
      // Lưu lại URL hiện tại để quay lại sau khi đăng nhập
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('returnUrl', currentPath);
      router.push(`/${locale}/auth/login`);
    }
  }, [isLoggedIn, isAuthInitializing, router, locale]);

  // Hiển thị trạng thái tải trong khi AuthProvider đang khởi tạo
  if (isAuthInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading authentication status...</div>
      </div>
    );
  }

  // Nếu có lỗi xác thực (ví dụ: token hết hạn và không thể làm mới)
  if (authError && !isLoggedIn) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div>Error during authentication: {authError}. Please try logging in again.</div>
      </div>
    );
  }

  // Nếu đã khởi tạo xong, chưa đăng nhập, và useEffect chưa kịp redirect (ít khi xảy ra)
  // Hoặc nếu conferenceId không có (quan trọng cho form)
  if (!isLoggedIn || !conferenceId) {
    if (!conferenceId) {
        // console.error("[UpdateConference] Conference ID is missing from URL.");
        // Có thể hiển thị thông báo lỗi hoặc redirect về trang trước
        return (
            <div className="flex h-screen items-center justify-center">
                <div>Error: Conference ID is missing. Cannot update conference.</div>
            </div>
        );
    }
    // Nếu chưa đăng nhập, sẽ được redirect bởi useEffect. Hiển thị loading tạm thời.
    return (
        <div className="flex h-screen items-center justify-center">
            <div>{t('Redirecting')}</div>
        </div>
    );
  }

  // Chỉ render form nếu đã đăng nhập và có conferenceId
  return (
    <>
      <main className='container mx-auto min-h-screen px-4 py-8 md:px-16'> {/* Thêm padding và min-h-screen */}
        <div className='w-full bg-background pt-14'></div> {/* Spacer cho header fixed */}
        <h1 className='mb-6 text-3xl font-bold text-gray-800'>{t('Update_Conference')}</h1>
        {/* <UpdateConferenceForm locale={locale} conferenceId={conferenceId} /> */}
      </main>
    </>
  );
};


const UpdateConferencePage = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  // useSearchParams phải được dùng trong component con được bọc bởi <Suspense>
  // Nên ta sẽ tạo một component con để chứa logic chính
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div>Loading conference details...</div>
      </div>
    }>
      <PageContent locale={locale} />
    </Suspense>
  );
};

// Component trung gian để lấy searchParams
const PageContent = ({ locale }: { locale: string }) => {
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get('id');

  // Nếu không có conferenceId, bạn có thể xử lý ở đây hoặc trong UpdateConferenceContent
  // if (!conferenceId) {
  //   // return <div>Error: Conference ID is missing.</div>;
  // }

  return <UpdateConferenceContent locale={locale} conferenceId={conferenceId} />;
}

export default UpdateConferencePage;